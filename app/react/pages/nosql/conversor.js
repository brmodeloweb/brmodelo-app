// EER → NoSQL conversor. Mirrors the architecture of app/react/pages/logic/conversor.js
// (phased pipeline, entity map, duck-typed editor interface) but produces a NoSQL
// aggregate model: collections with hierarchical rows (attributes, blocks, references)
// and disjunction groups for disjoint specializations.

export default class Conversor {
	constructor(nosqlEditor, conversionOptionModal) {
		this.modelGraph = null;
		this.nosqlEditor = nosqlEditor;
		this.conversionOptionModal = conversionOptionModal || null;
		// Map<erd.Entity.id | erd.Relationship.id → nosql.Collection>
		this.entityCollectionMap = new Map();
	}

	async toNoSql(conceptualGraph) {
		this.modelGraph = conceptualGraph;
		this.entityCollectionMap.clear();

		const cellEntities = [];
		const cellRelations = [];
		const cellAssociatives = [];
		const cellExtensions = [];
		const allElements = this.modelGraph.attributes.cells.models;

		for (const element of allElements) {
			switch (element.attributes.type) {
				case 'erd.Entity':
					cellEntities.push(element);
					break;
				case 'erd.Relationship':
					cellRelations.push(element);
					break;
				case 'erd.BlockAssociative':
					cellAssociatives.push(element);
					break;
				case 'erd.ISA':
					cellExtensions.push(element);
					break;
			}
		}

		await this.buildCollections(cellEntities);
		await this.buildSpecializations(cellExtensions);
		await this.buildRelationships(cellRelations);
		// Associatives: stretch — not in MVP.
		this.nosqlEditor.sortRows();
	}

	// //////////////////////////////////////////////////////////////////
	// Phase 1 — entity → collection + its attributes
	// //////////////////////////////////////////////////////////////////

	async buildCollections(entities) {
		for (const entity of entities) {
			await this.buildCollection(entity);
		}
	}

	async buildCollection(entity) {
		const name = entity.attributes.attrs.text.text;
		const { x, y } = entity.attributes.position;
		const collection = await this.nosqlEditor.insertCollection({ name, position: { x, y } });
		this.entityCollectionMap.set(entity.id, collection);

		const visited = new Set([entity.id]);
		const neighbors = this.modelGraph.getNeighbors(entity);
		const attributes = neighbors.filter(n => this.isAttributeOrKey(n));
		for (const attribute of attributes) {
			await this.buildAttribute(attribute, collection, [], visited);
		}
		this.ensureIdentifier(collection);
		return collection;
	}

	async buildAttribute(attribute, collection, path, visited) {
		if (visited.has(attribute.id)) return;
		visited.add(attribute.id);

		const name = attribute.attributes.attrs.text.text;
		const isKey = attribute.attributes.type === 'erd.Key';
		const cardinality = attribute.attributes.cardinality || '(0, 1)';
		const isMultivalued = this.isMultivalued(cardinality);

		// Composite: either flagged or has attribute neighbors not yet visited.
		const children = this.modelGraph.getNeighbors(attribute).filter(
			n => this.isAttributeOrKey(n) && !visited.has(n.id)
		);
		const isComposed = attribute.attributes.composed === true || children.length > 0;

		if (isComposed) {
			const blockIdx = collection.addRow(path, { kind: 'block', name });
			const blockPath = [...path, blockIdx];
			for (const child of children) {
				await this.buildAttribute(child, collection, blockPath, visited);
			}
			return;
		}

		if (isMultivalued) {
			const choice = await this.askMultivaluedStrategy(name, collection);
			switch (choice) {
				case 'nested_block':
					await this.addMultivaluedAsBlock(collection, path, name, cardinality);
					return;
				case 'separate_collection':
					await this.addMultivaluedAsSeparateCollection(collection, name, cardinality);
					return;
				case 'cardinality':
				default:
					this.addSimpleAttribute(collection, path, { name, isKey, isMultivalued: true, cardinality });
					return;
			}
		}

		this.addSimpleAttribute(collection, path, { name, isKey, isMultivalued: false });
	}

	addSimpleAttribute(collection, path, { name, isKey, isMultivalued, cardinality }) {
		const rowData = {
			kind: 'attribute',
			name,
			type: isKey ? 'ID' : 'string',
		};
		if (isKey) rowData.identifier = true;
		if (isMultivalued) {
			const parsed = this.parseCardinality(cardinality) || { min: 1 };
			rowData.cardinalityEnabled = true;
			rowData.minCardinality = parsed.min;
			rowData.maxCardinality = 'N';
		}
		collection.addRow(path, rowData);
	}

	async addMultivaluedAsBlock(collection, path, name, cardinality) {
		const blockIdx = collection.addRow(path, {
			kind: 'block',
			name,
			cardinalityEnabled: true,
			minCardinality: cardinality && cardinality.includes('(0') ? 0 : 1,
			maxCardinality: 'N',
		});
		collection.addRow([...path, blockIdx], {
			kind: 'attribute',
			name: 'value',
			type: 'string',
		});
	}

	async addMultivaluedAsSeparateCollection(parentCollection, name, cardinality) {
		const newCollection = await this.nosqlEditor.insertCollection({
			name,
			position: { x: 100, y: 100 },
		});
		newCollection.addRow([], {
			kind: 'attribute',
			name: '_id',
			type: 'ID',
			identifier: true,
		});
		newCollection.addRow([], {
			kind: 'attribute',
			name: 'value',
			type: 'string',
		});
		this.addReference(newCollection, [], {
			kind: 'reference',
			name: parentCollection.getName() + '_REF',
			type: this.getIdentifierType(parentCollection),
			isReference: true,
			targetCollectionId: parentCollection.id,
			targetCollectionName: parentCollection.getName(),
		});
	}

	async askMultivaluedStrategy(attributeName, collection) {
		if (!this.conversionOptionModal || typeof this.conversionOptionModal.openMultivalued !== 'function') {
			return 'cardinality';
		}
		try {
			const res = await this.conversionOptionModal.openMultivalued(attributeName, collection.getName());
			return (res && res.value) || 'cardinality';
		} catch {
			return 'cardinality';
		}
	}

	// //////////////////////////////////////////////////////////////////
	// Phase 2 — ISA / specialization
	// //////////////////////////////////////////////////////////////////

	async buildSpecializations(extensions) {
		for (const extension of extensions) {
			await this.buildSpecialization(extension);
		}
	}

	async buildSpecialization(extension) {
		const neighbors = this.getEntityNeighbors(extension);
		const root = neighbors.find(n => extension.attributes.parentId === n.id);
		const children = neighbors.filter(n => extension.attributes.parentId !== n.id);

		if (!root || children.length < 1) return;

		const rootCollection = this.entityCollectionMap.get(root.id);
		if (!rootCollection) return;

		const isDisjoint = this.isDisjoint(extension);
		const rootName = root.attributes.attrs.text.text;
		const strategy = await this.askSpecializationStrategy(rootName, isDisjoint);

		switch (strategy) {
			case 'specialized_collections':
				await this.applySpecializationAsCollections(root, rootCollection, children, extension);
				break;
			case 'generic_collection':
				await this.applySpecializationAsGeneric(root, rootCollection, children, extension);
				break;
			case 'nested_with_disjunction':
			case 'nested_hierarchy':
			default:
				await this.applySpecializationAsNested(rootCollection, children, strategy === 'nested_with_disjunction', extension);
				break;
		}
	}

	async askSpecializationStrategy(rootName, isDisjoint) {
		const fallback = isDisjoint ? 'nested_with_disjunction' : 'nested_hierarchy';
		if (!this.conversionOptionModal || typeof this.conversionOptionModal.openSpecialization !== 'function') {
			return fallback;
		}
		try {
			const res = await this.conversionOptionModal.openSpecialization(rootName, isDisjoint);
			return (res && res.value) || fallback;
		} catch {
			return fallback;
		}
	}

	async applySpecializationAsNested(rootCollection, children, withDisjunction, extension) {
		const createdBlockIds = [];
		for (const child of children) {
			const blockIdx = rootCollection.addRow([], {
				kind: 'block',
				name: child.attributes.attrs.text.text,
			});
			const blockPath = [blockIdx];
			const block = rootCollection.getRowAtPath(blockPath);
			if (block && block.id) createdBlockIds.push(block.id);

			const visited = new Set([child.id]);
			const attrs = this.modelGraph.getNeighbors(child).filter(n => this.isAttributeOrKey(n));
			for (const attr of attrs) {
				await this.buildAttribute(attr, rootCollection, blockPath, visited);
			}

			const childCol = this.entityCollectionMap.get(child.id);
			// Only repoint child → rootCollection if the child collection is
			// actually absorbed. Otherwise (child still participates elsewhere)
			// we'd leave the map pointing at rootCollection while childCol
			// stays alive, corrupting later lookups.
			const absorbed = childCol && childCol !== rootCollection
				&& this.removeCollectionIfStandalone(child, childCol, extension);
			if (absorbed) {
				this.entityCollectionMap.set(child.id, rootCollection);
			} else if (childCol && childCol !== rootCollection) {
				this.ensureIdentifier(childCol);
			}
		}

		if (withDisjunction && createdBlockIds.length >= 2) {
			if (typeof rootCollection.addDisjunctionGroup === 'function') {
				rootCollection.addDisjunctionGroup({ blockIds: createdBlockIds });
			}
		}

		this.ensureIdentifier(rootCollection);
	}

	async applySpecializationAsCollections(root, rootCollection, children, extension) {
		// Each child already has its own collection (Phase 1). Copy the root's
		// own attributes into each child collection so child instances carry
		// the inherited attributes. The parent entity becomes defunct (every
		// instance is one of the children), so its collection is removed when
		// it has no other participations — otherwise kept so external relations
		// can still resolve through entityCollectionMap.
		const rootRows = rootCollection.getRows();
		for (const child of children) {
			const childCollection = this.entityCollectionMap.get(child.id);
			if (!childCollection) continue;
			for (const row of rootRows) {
				childCollection.addRow([], { ...row });
			}
			this.ensureIdentifier(childCollection);
		}
		// If the root has other participations, removeCollectionIfStandalone
		// returns false and the parent collection stays alive — in that case
		// it still needs an _id of its own.
		const removed = this.removeCollectionIfStandalone(root, rootCollection, extension);
		if (!removed) {
			this.ensureIdentifier(rootCollection);
		}
	}

	async applySpecializationAsGeneric(root, rootCollection, children, extension) {
		// Copy each child's own attributes into the root collection (so the
		// single collection carries the union of specialized attributes) and
		// add a `tipo` discriminator attribute. Child collections with no other
		// participations are removed (absorbed into root).
		for (const child of children) {
			const childCol = this.entityCollectionMap.get(child.id);
			const visited = new Set([child.id, root.id]);
			const attrs = this.modelGraph.getNeighbors(child).filter(n => this.isAttributeOrKey(n));
			for (const attr of attrs) {
				await this.buildAttribute(attr, rootCollection, [], visited);
			}
			const absorbed = childCol && childCol !== rootCollection
				&& this.removeCollectionIfStandalone(child, childCol, extension);
			if (absorbed) {
				this.entityCollectionMap.set(child.id, rootCollection);
			} else if (childCol && childCol !== rootCollection) {
				this.ensureIdentifier(childCol);
			}
		}
		rootCollection.addRow([], { kind: 'attribute', name: 'tipo', type: 'string' });
		this.ensureIdentifier(rootCollection);
	}

	// Ensures the collection has at least one identifier attribute. If none
	// exists (e.g., the source EER entity had no Key element), prepends an
	// `_id` ID attribute so every resulting NoSQL collection has a primary key.
	ensureIdentifier(collection) {
		const rows = collection.getRows();
		const hasIdentifier = rows.some(r => r.kind === 'attribute' && r.identifier);
		if (hasIdentifier) return;
		collection.addRow([], { kind: 'attribute', name: '_id', type: 'ID', identifier: true });
	}

	isDisjoint(extension) {
		// ISA cardinality uses format like "(t, d)" / "(p, o)". Second letter:
		// 'd' = disjoint, 'o' = overlapping. Default to disjoint if absent.
		const card = extension.attributes.cardinality;
		if (!card) return true;
		return card.includes('d');
	}

	// //////////////////////////////////////////////////////////////////
	// Phase 3 — relationships
	// //////////////////////////////////////////////////////////////////

	async buildRelationships(relations) {
		// Process auto-relationships first. Reason: a non-auto relation with
		// the "nesting" option may remove an entity's standalone collection
		// once it's embedded elsewhere; if that entity also had an auto-rel,
		// the self-reference would end up pointing at a removed collection.
		// Running auto-rels first attaches the self-refs to the entity while
		// it still exists, so they travel along into any subsequent embedding.
		const sortedRelations = [
			...relations.filter(r => this.isAutoRelationship(r)),
			...relations.filter(r => !this.isAutoRelationship(r)),
		];

		for (const relation of sortedRelations) {
			const links = this.modelGraph.getConnectedLinks(relation);
			const relationType = this.getRelationType(links);

			if (relationType.quantity > 2) {
				// n-ary: stretch — not in MVP.
				continue;
			}

			if (this.isAutoRelationship(relation)) {
				await this.treatAutoRelation(relation, links, relationType);
				continue;
			}

			switch (relationType.type) {
				case 'nn':
					await this.treatNNcase(relation, links);
					break;
				case '1n':
				case 'n1':
					await this.treatN1case(relation, links);
					break;
				case '11':
					await this.treat11case(relation, links);
					break;
			}
		}
	}

	async treatAutoRelation(relation, links, relationType) {
		const entities = this.getEntityNeighbors(relation);
		if (entities.length !== 1) return;
		const entity = entities[0];
		const col = this.entityCollectionMap.get(entity.id);
		if (!col) return;

		const filteredLinks = this.filterConnections(links);
		if (filteredLinks.length < 2) return;

		const cards = filteredLinks.map(l => l.attributes.labels?.[0]?.attrs?.text?.text || '');
		const description = this.buildRelationDescription(relation, links);
		const strategy = await this.askAutoRelationStrategy(relationType.type, entity, description);

		// Two cardinality pairs: one for the "ref side" (pointer to the
		// singular peer), one for the "embed side" (container of many peers).
		// For symmetric cards (11, nn) they match; for 1-n auto they differ.
		const allOptional = cards.every(c => c.includes('(0'));
		let refMin = 0, refMax = 1;
		let blockMin = 0, blockMax = 1;

		if (relationType.type === 'nn') {
			refMin = allOptional ? 0 : 1;
			refMax = 'N';
			blockMin = refMin;
			blockMax = 'N';
		} else if (relationType.type === '11') {
			refMin = allOptional ? 0 : 1;
			refMax = 1;
			blockMin = refMin;
			blockMax = 1;
		} else {
			// 1n / n1 auto — use parseCardinality so compact labels work too.
			const parsedCards = cards.map(c => this.parseCardinality(c)).filter(Boolean);
			const singleParsed = parsedCards.find(p => p.max === '1') || parsedCards[0] || { min: 0 };
			const manyParsed = parsedCards.find(p => p.max === 'n') || parsedCards[1] || { min: 0 };
			refMin = singleParsed.min;
			refMax = 1;
			blockMin = manyParsed.min;
			blockMax = 'N';
		}

		const relName = relation.attributes.attrs.text.text || entity.attributes.attrs.text.text;
		const relAttrs = this.getRelationshipAttributes(relation);
		const visited = new Set([relation.id]);

		if (strategy === 'nesting') {
			const blockIdx = col.addRow([], {
				kind: 'block',
				name: relName,
				cardinalityEnabled: true,
				minCardinality: blockMin,
				maxCardinality: blockMax,
			});
			// Embed snapshot of the entity's own attributes/blocks (skip refs
			// and rows added after the block itself to avoid chasing loops).
			const rowsAtCapture = col.getRows().slice(0, blockIdx);
			for (const row of rowsAtCapture) {
				if (row.kind === 'reference') continue;
				col.addRow([blockIdx], { ...row });
			}
			for (const attr of relAttrs) {
				await this.buildAttribute(attr, col, [blockIdx], visited);
			}
			return;
		}

		// reference: flat _REF with cardinality when no rel attrs; wrap in a
		// block when there are rel attrs so the block groups _REF + attrs.
		const refData = {
			kind: 'reference',
			name: relName + '_REF',
			type: this.getIdentifierType(col),
			isReference: true,
			targetCollectionId: col.id,
			targetCollectionName: col.getName ? col.getName() : entity.attributes.attrs.text.text,
			cardinalityEnabled: true,
			minCardinality: refMin,
			maxCardinality: refMax,
		};

		if (relAttrs.length === 0) {
			this.addReference(col, [], refData);
			return;
		}
		const blockIdx = col.addRow([], { kind: 'block', name: relName });
		this.addReference(col, [blockIdx], refData);
		for (const attr of relAttrs) {
			await this.buildAttribute(attr, col, [blockIdx], visited);
		}
	}

	async askAutoRelationStrategy(relationTypeKind, entity, relationDescription) {
		if (!this.conversionOptionModal) return 'reference';
		const entityName = entity.attributes.attrs.text.text;
		const methodName = relationTypeKind === 'nn'
			? 'openAutoRelationNN'
			: relationTypeKind === '11'
				? 'openAutoRelation11'
				: 'openAutoRelation1N';
		const method = this.conversionOptionModal[methodName];
		if (typeof method !== 'function') return 'reference';
		try {
			const res = await method.call(this.conversionOptionModal, entityName, relationDescription);
			return (res && res.value) || 'reference';
		} catch {
			return 'reference';
		}
	}

	async treatNNcase(relation, links) {
		const entities = this.getEntityNeighbors(relation);
		if (entities.length !== 2) return;

		// m-n: the issue's rules table says "Block with _REF in one collection",
		// but picking WHICH side hosts the block is a user decision.
		const [a, b] = this.orderEntities(entities);
		const description = this.buildRelationDescription(relation, links);
		const choice = await this.askRelationNNHost(description, a, b);
		const host = choice === 'host_B' ? b : a;
		const target = choice === 'host_B' ? a : b;

		const hostCol = this.entityCollectionMap.get(host.id);
		const targetCol = this.entityCollectionMap.get(target.id);
		if (!hostCol || !targetCol) return;

		const relName = relation.attributes.attrs.text.text || 'rel';
		const blockIdx = hostCol.addRow([], {
			kind: 'block',
			name: relName,
			cardinalityEnabled: true,
			minCardinality: 0,
			maxCardinality: 'N',
		});
		this.addReference(hostCol, [blockIdx], {
			kind: 'reference',
			name: target.attributes.attrs.text.text + '_REF',
			type: this.getIdentifierType(targetCol),
			isReference: true,
			targetCollectionId: targetCol.id,
			targetCollectionName: targetCol.getName ? targetCol.getName() : target.attributes.attrs.text.text,
		});
		// If the relationship carries its own attributes, they live inside the
		// same block alongside the _REF.
		const relAttrs = this.getRelationshipAttributes(relation);
		const visited = new Set([relation.id]);
		for (const attr of relAttrs) {
			await this.buildAttribute(attr, hostCol, [blockIdx], visited);
		}

		// Both collections persist in m-n: host carries the block, target is
		// referenced. Ensure both have an identifier in case their source
		// entities had no Key element.
		this.ensureIdentifier(hostCol);
		this.ensureIdentifier(targetCol);
	}

	async askRelationNNHost(relationDescription, entityA, entityB) {
		if (!this.conversionOptionModal || typeof this.conversionOptionModal.openRelationNN !== 'function') {
			return 'host_A';
		}
		try {
			const res = await this.conversionOptionModal.openRelationNN(
				relationDescription,
				entityA.attributes.attrs.text.text,
				entityB.attributes.attrs.text.text,
			);
			return (res && res.value) || 'host_A';
		} catch {
			return 'host_A';
		}
	}

	async treatN1case(relation, links) {
		const entities = this.getEntityNeighbors(relation);
		if (entities.length !== 2) return;

		const { oneSide, manySide } = this.resolveOneToManySides(entities, links);
		if (!oneSide || !manySide) return;

		const oneCol = this.entityCollectionMap.get(oneSide.id);
		const manyCol = this.entityCollectionMap.get(manySide.id);
		if (!oneCol || !manyCol) return;

		const description = this.buildRelationDescription(relation, links);
		const autoRelationship = this.isAutoRelationship(relation);
		const strategy = await this.askRelation1NStrategy({
			relationDescription: description,
			collectionNames: this.getCollectionNames([oneSide, manySide]),
			autoRelationship,
			entityName: autoRelationship ? oneSide.attributes.attrs.text.text : null,
		});

		if (strategy === 'nesting') {
			await this.applyRelation1NAsNesting(oneCol, manyCol, manySide, relation, links);
		} else {
			await this.applyRelation1NAsReference(oneCol, manyCol, oneSide, manySide, relation, links);
		}
		// Both sides may still be alive — applyRelation1NAsNesting removes
		// manyCol only when it's standalone. Ensure _id on each surviving
		// collection, detected via entityCollectionMap (removed entries are
		// deleted from the map).
		if (this.entityCollectionMap.get(oneSide.id) === oneCol) {
			this.ensureIdentifier(oneCol);
		}
		if (this.entityCollectionMap.get(manySide.id) === manyCol) {
			this.ensureIdentifier(manyCol);
		}
	}

	async askRelation1NStrategy({ relationDescription, collectionNames, autoRelationship, entityName }) {
		if (!this.conversionOptionModal) return 'reference';
		try {
			const res = autoRelationship && typeof this.conversionOptionModal.openAutoRelation1N === 'function'
				? await this.conversionOptionModal.openAutoRelation1N(entityName, relationDescription)
				: typeof this.conversionOptionModal.openRelation1N === 'function'
					? await this.conversionOptionModal.openRelation1N(relationDescription, collectionNames)
					: null;
			return (res && res.value) || 'reference';
		} catch {
			return 'reference';
		}
	}

	async applyRelation1NAsReference(oneCol, manyCol, oneSide, manySide, relation, links) {
		// Per the modal label "add _REF on the many-side": the reference sits
		// on the many-side collection and points to the one-side — mirroring
		// the FK direction in relational (child holds pointer to parent).
		// Look-here notation: the label near the one-side shows how the
		// many-side sees it, which gives the minimum cardinality of the ref.
		const oneSideLink = this.findLinkForEntity(oneSide, links);
		const oneSideParsed = this.parseCardinality(oneSideLink?.attributes?.labels?.[0]?.attrs?.text?.text) || { min: 0, max: '1' };
		const minCard = oneSideParsed.min;
		const refData = {
			kind: 'reference',
			name: oneSide.attributes.attrs.text.text + '_REF',
			type: this.getIdentifierType(oneCol),
			isReference: true,
			targetCollectionId: oneCol.id,
			targetCollectionName: oneCol.getName ? oneCol.getName() : oneSide.attributes.attrs.text.text,
			// Always expose cardinality so optional (0,1) refs are visible too.
			cardinalityEnabled: true,
			minCardinality: minCard,
			maxCardinality: 1,
		};

		const relAttrs = this.getRelationshipAttributes(relation);
		if (relAttrs.length === 0) {
			this.addReference(manyCol, [], refData);
			return;
		}
		// Relation has its own attributes: wrap _REF + attrs in a block so the
		// attributes stay attached to the relationship, not spread across the
		// collection.
		const blockName = relation.attributes.attrs.text.text || oneSide.attributes.attrs.text.text;
		const blockIdx = manyCol.addRow([], { kind: 'block', name: blockName });
		this.addReference(manyCol, [blockIdx], refData);
		const visited = new Set([relation.id]);
		for (const attr of relAttrs) {
			await this.buildAttribute(attr, manyCol, [blockIdx], visited);
		}
	}

	findLinkForEntity(entity, links) {
		const filtered = this.filterConnections(links);
		return filtered.find(link =>
			link.attributes.source.id === entity.id || link.attributes.target.id === entity.id
		) || null;
	}

	getRelationshipAttributes(relation) {
		return this.modelGraph.getNeighbors(relation)
			.filter(n => n.attributes && n.attributes.type === 'erd.Attribute');
	}

	async applyRelation1NAsNesting(oneCol, manyCol, manySide, relation, links) {
		// Embed the many-side as a (?, n) block inside the one-side. The
		// minimum cardinality is derived from the many-side link: mandatory
		// (1,n) stays (1,N); optional (0,n) becomes (0,N). Copies the
		// many-side's attribute rows plus the relationship's own attributes.
		// If the many-side has no other relationships/ISAs, its standalone
		// collection becomes redundant and is removed.
		const manySideLink = this.findLinkForEntity(manySide, links);
		const manySideParsed = this.parseCardinality(manySideLink?.attributes?.labels?.[0]?.attrs?.text?.text) || { min: 0, max: 'n' };
		const blockName = relation.attributes.attrs.text.text || manySide.attributes.attrs.text.text;
		const blockIdx = oneCol.addRow([], {
			kind: 'block',
			name: blockName,
			cardinalityEnabled: true,
			minCardinality: manySideParsed.min,
			maxCardinality: 'N',
		});
		const manyRows = manyCol.getRows();
		for (const row of manyRows) {
			this.absorbRow(oneCol, [blockIdx], row);
		}
		const relAttrs = this.getRelationshipAttributes(relation);
		const visited = new Set([relation.id]);
		for (const attr of relAttrs) {
			await this.buildAttribute(attr, oneCol, [blockIdx], visited);
		}
		this.removeCollectionIfStandalone(manySide, manyCol, relation);
	}

	async treat11case(relation, links) {
		const entities = this.getEntityNeighbors(relation);
		if (entities.length !== 2) return;

		const mandatoryBoth = this.is11Mandatory(links);
		const bothOptional = this.is01Optional(links);
		const description = this.buildRelationDescription(relation, links);
		const collectionNames = this.getCollectionNames(entities);

		let strategy;
		if (mandatoryBoth) {
			strategy = 'merge';
		} else if (bothOptional) {
			strategy = await this.askRelation11Strategy(description, collectionNames);
		} else {
			strategy = await this.askRelation11PartialStrategy(description, collectionNames);
		}

		// For PARTIAL 1-1 (one side (1,1), other (0,1)) the host must be the
		// mandatory-participant side, not alphabetical: it's the side that
		// ALWAYS has the other (look-here: label (1,1) near X means the other
		// entity always has X). Nesting/merging into the mandatory side
		// preserves the invariant.
		let hostEntity = null;
		let guestEntity = null;
		if (!mandatoryBoth && !bothOptional) {
			for (const entity of entities) {
				const link = this.findLinkForEntity(entity, links);
				const parsed = this.parseCardinality(link?.attributes?.labels?.[0]?.attrs?.text?.text);
				if (parsed && parsed.min === 1 && parsed.max === '1') hostEntity = entity;
				else if (parsed && parsed.min === 0 && parsed.max === '1') guestEntity = entity;
			}
		}
		if (!hostEntity || !guestEntity) {
			[hostEntity, guestEntity] = this.orderEntities(entities);
		}
		const hostCol = this.entityCollectionMap.get(hostEntity.id);
		const guestCol = this.entityCollectionMap.get(guestEntity.id);
		if (!hostCol || !guestCol) return;

		switch (strategy) {
			case 'merge': {
				this.mergeCollections(hostCol, guestCol, guestEntity);
				// Only repoint the guest → hostCol when the guest's collection
				// was actually absorbed. Otherwise it survives (other
				// participations) and must keep its own identity.
				const absorbed = this.removeCollectionIfStandalone(guestEntity, guestCol, relation);
				if (absorbed) {
					this.entityCollectionMap.set(guestEntity.id, hostCol);
				} else {
					this.ensureIdentifier(guestCol);
				}
				// Absorb the relationship's own attributes into the merged
				// collection at the top level — the two sides became one, so
				// the relation's attrs belong alongside the entity attrs.
				const relAttrs = this.getRelationshipAttributes(relation);
				const visited = new Set([relation.id]);
				for (const attr of relAttrs) {
					await this.buildAttribute(attr, hostCol, [], visited);
				}
				break;
			}
			case 'nesting': {
				const blockIdx = this.nestCollection(hostCol, guestCol, guestEntity);
				const absorbed = this.removeCollectionIfStandalone(guestEntity, guestCol, relation);
				if (!absorbed) {
					this.ensureIdentifier(guestCol);
				}
				// Relationship attrs belong inside the nested block alongside
				// the guest's own attributes.
				const relAttrs = this.getRelationshipAttributes(relation);
				const visited = new Set([relation.id]);
				for (const attr of relAttrs) {
					await this.buildAttribute(attr, hostCol, [blockIdx], visited);
				}
				break;
			}
			case 'reference':
			default: {
				const refData = {
					kind: 'reference',
					name: guestEntity.attributes.attrs.text.text + '_REF',
					type: this.getIdentifierType(guestCol),
					isReference: true,
					targetCollectionId: guestCol.id,
					targetCollectionName: guestCol.getName ? guestCol.getName() : guestEntity.attributes.attrs.text.text,
				};
				const relAttrs = this.getRelationshipAttributes(relation);
				if (relAttrs.length === 0) {
					this.addReference(hostCol, [], refData);
				} else {
					// Relation has its own attributes: wrap _REF + attrs in a
					// block so the attributes stay attached to the relation,
					// mirroring the 1-N reference pattern.
					const blockName = relation.attributes.attrs.text.text || guestEntity.attributes.attrs.text.text;
					const blockIdx = hostCol.addRow([], { kind: 'block', name: blockName });
					this.addReference(hostCol, [blockIdx], refData);
					const visited = new Set([relation.id]);
					for (const attr of relAttrs) {
						await this.buildAttribute(attr, hostCol, [blockIdx], visited);
					}
				}
				break;
			}
		}

		this.ensureIdentifier(hostCol);
	}

	async askRelation11Strategy(relationDescription, collectionNames) {
		if (!this.conversionOptionModal || typeof this.conversionOptionModal.openRelation11 !== 'function') {
			return 'reference';
		}
		try {
			const res = await this.conversionOptionModal.openRelation11(relationDescription, collectionNames);
			return (res && res.value) || 'reference';
		} catch {
			return 'reference';
		}
	}

	async askRelation11PartialStrategy(relationDescription, collectionNames) {
		if (!this.conversionOptionModal || typeof this.conversionOptionModal.openRelation11Partial !== 'function') {
			return 'merge';
		}
		try {
			const res = await this.conversionOptionModal.openRelation11Partial(relationDescription, collectionNames);
			return (res && res.value) || 'merge';
		} catch {
			return 'merge';
		}
	}

	mergeCollections(target, source, sourceEntity) {
		// Absorb source's rows into target. References are preserved so any
		// auto-rel _REF produced in an earlier phase travels along. Source's
		// own identifier is dropped (target already has its own identity).
		const rows = source.getRows();
		for (const row of rows) {
			if (row.kind === 'attribute' && row.identifier) continue;
			this.absorbRow(target, [], row);
		}
	}

	nestCollection(target, source, sourceEntity) {
		const blockIdx = target.addRow([], {
			kind: 'block',
			name: sourceEntity.attributes.attrs.text.text,
		});
		const rows = source.getRows();
		for (const row of rows) {
			this.absorbRow(target, [blockIdx], row);
		}
		return blockIdx;
	}

	// Copies a row from one collection into a host at `path`. Reference rows
	// are recreated via addReference so a fresh JointJS link is wired to the
	// absorbing collection (the original linkId was bound to the source and
	// would be stale). Blocks recurse through children so nested references
	// are recreated too, not transplanted verbatim. Blocks get a fresh id to
	// avoid collisions with disjunctionGroups on either side.
	absorbRow(hostCollection, path, row) {
		if (row.kind === 'reference') {
			const { linkId: _linkId, ...refData } = row;
			this.addReference(hostCollection, path, refData);
			return;
		}
		if (row.kind === 'block') {
			const { id: _blockId, children = [], ...blockData } = row;
			const blockIdx = hostCollection.addRow(path, { ...blockData, children: [] });
			for (const child of children) {
				this.absorbRow(hostCollection, [...path, blockIdx], child);
			}
			return;
		}
		hostCollection.addRow(path, { ...row });
	}

	// Creates a reference row and, when the editor supports it, the matching
	// JointJS link between collections on the canvas. Falls back to a plain
	// `addRow` when the editor is a bare stub (unit tests) so conversion logic
	// can be exercised without a real graph.
	addReference(hostCollection, path, refData) {
		if (this.nosqlEditor && typeof this.nosqlEditor.addReference === 'function') {
			return this.nosqlEditor.addReference(hostCollection, path, refData);
		}
		return hostCollection.addRow(path, refData);
	}

	// True when the entity participates in any other relationship or ISA
	// besides `currentElement` (the one currently being processed). Used to
	// decide whether an embedded entity's standalone collection can be safely
	// removed after nesting/merging.
	entityHasOtherParticipations(entity, currentElement) {
		const neighbors = this.modelGraph.getNeighbors(entity);
		return neighbors.some(n => {
			const t = n.attributes && n.attributes.type;
			if (t !== 'erd.Relationship' && t !== 'erd.ISA' && t !== 'erd.BlockAssociative') return false;
			return !currentElement || n.id !== currentElement.id;
		});
	}

	removeCollectionIfStandalone(entity, collection, currentElement) {
		if (!collection) return false;
		if (this.entityHasOtherParticipations(entity, currentElement)) return false;
		this.removeCollection(entity, collection);
		return true;
	}

	removeCollection(entity, collection) {
		if (this.entityCollectionMap.get(entity.id) === collection) {
			this.entityCollectionMap.delete(entity.id);
		}
		if (typeof collection.remove === 'function') {
			collection.remove();
		}
	}

	// //////////////////////////////////////////////////////////////////
	// Helpers
	// //////////////////////////////////////////////////////////////////

	isAttributeOrKey(element) {
		const t = element.attributes?.type;
		return t === 'erd.Attribute' || t === 'erd.Key';
	}

	isMultivalued(cardinality) {
		if (!cardinality) return false;
		const stripped = cardinality.replace(/\s+/g, '').toLowerCase();
		return stripped === '(0,n)' || stripped === '(1,n)';
	}

	// Parses a cardinality label in either spaced or compact form
	// ("(1, n)" / "(1,n)") into { min, max }. Returns null when the label
	// doesn't match any supported shape.
	parseCardinality(text) {
		if (!text) return null;
		const normalized = text.replace(/\s+/g, '').toLowerCase();
		const match = normalized.match(/^\(([01]),([1n])\)$/);
		return match ? { min: Number(match[1]), max: match[2] } : null;
	}

	getRelationType(links) {
		const relationType = { type: '', quantity: 0 };
		for (const link of this.filterConnections(links)) {
			const parsed = this.parseCardinality(link.attributes.labels?.[0]?.attrs?.text?.text);
			if (!parsed) continue;
			relationType.type += parsed.max;
			relationType.quantity += 1;
		}
		return relationType;
	}

	filterConnections(links) {
		return links.filter(link => {
			if (link.attributes.type === 'erd.Line') return true;
			const type = link.attributes.type;
			const card = link.attributes.labels?.[0]?.attrs?.text?.text;
			if ((type === 'link' || type === 'erd.Link') && card) {
				// Accept both spaced '(0, n)' and compact '(0,n)' via parseCardinality.
				return this.parseCardinality(card) !== null;
			}
			return false;
		});
	}

	is01Optional(links) {
		const connections = this.filterConnections(links);
		if (connections.length < 2) return false;
		const a = this.parseCardinality(connections[0].attributes.labels?.[0]?.attrs?.text?.text);
		const b = this.parseCardinality(connections[1].attributes.labels?.[0]?.attrs?.text?.text);
		return !!(a && b && a.min === 0 && a.max === '1' && b.min === 0 && b.max === '1');
	}

	is11Mandatory(links) {
		const connections = this.filterConnections(links);
		if (connections.length < 2) return false;
		const a = this.parseCardinality(connections[0].attributes.labels?.[0]?.attrs?.text?.text);
		const b = this.parseCardinality(connections[1].attributes.labels?.[0]?.attrs?.text?.text);
		return !!(a && b && a.min === 1 && a.max === '1' && b.min === 1 && b.max === '1');
	}

	buildRelationDescription(relation, links) {
		const connections = this.filterConnections(links);
		const name = relation?.attributes?.attrs?.text?.text || '';
		const labelOf = (conn) => conn?.attributes?.labels?.[0]?.attrs?.text?.text || '';
		const cardinalities = connections.length >= 2
			? `${labelOf(connections[0])} ↔ ${labelOf(connections[1])}`.trim()
			: '';
		if (name && cardinalities && cardinalities !== '↔') return `'${name}' ${cardinalities}`;
		if (name) return `'${name}'`;
		return cardinalities === '↔' ? '' : cardinalities;
	}

	resolveOneToManySides(entities, links) {
		const filteredLinks = this.filterConnections(links);
		let oneSide = null;
		let manySide = null;
		for (const link of filteredLinks) {
			const parsed = this.parseCardinality(link.attributes.labels?.[0]?.attrs?.text?.text);
			if (!parsed) continue;
			const entity = entities.find(e =>
				e.id === link.attributes.source.id || e.id === link.attributes.target.id
			);
			if (!entity) continue;
			if (parsed.max === '1') oneSide = entity;
			else if (parsed.max === 'n') manySide = entity;
		}
		return { oneSide, manySide };
	}

	isAutoRelationship(relation) {
		const entities = this.getEntityNeighbors(relation);
		return entities.length === 1;
	}

	getEntityNeighbors(element) {
		return this.modelGraph.getNeighbors(element)
			.filter(n => n.attributes.type === 'erd.Entity');
	}

	orderEntities(entities) {
		const sorted = [...entities].sort((a, b) => {
			const an = a.attributes.attrs.text.text || '';
			const bn = b.attributes.attrs.text.text || '';
			return an.localeCompare(bn);
		});
		return sorted;
	}

	getCollectionNames(entities) {
		const names = entities.map(e => e.attributes.attrs.text.text);
		return '(' + names.join(', ') + ')';
	}

	getIdentifierType(collection) {
		if (typeof collection.getIdentifierType === 'function') {
			return collection.getIdentifierType();
		}
		return 'ID';
	}
}
