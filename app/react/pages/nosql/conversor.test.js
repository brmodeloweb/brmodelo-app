import Conversor from './conversor';

// Minimal hand-rolled fakes (no JointJS). Mirrors the approach used in
// app/react/pages/logic/conversor.test.js.

function buildFakeCollection(name, onRemove) {
	const rows = [];
	const disjunctionGroups = [];
	let nextId = 1;
	let removed = false;
	const genId = () => 'block-' + (nextId++);

	// Semantics mirror nosql.Collection._getContainerChildren: the returned
	// array is where a new row at `path` would be pushed.
	const getAtPath = (path) => {
		let current = rows;
		for (let i = 0; i < path.length; i++) {
			const node = current[path[i]];
			current = node.children;
		}
		return current;
	};

	const fake = {
		id: 'col-' + name,
		attributes: { name },
		getName: () => name,
		getRows: () => rows,
		getIdentifierType: () => {
			const find = (list) => {
				for (const row of list) {
					if (row.kind === 'attribute' && row.identifier) return row.type || 'ID';
					if (row.kind === 'block' && row.children) {
						const inner = find(row.children);
						if (inner) return inner;
					}
				}
				return null;
			};
			return find(rows) || 'ID';
		},
		addRow: jest.fn((path, rowData) => {
			const container = getAtPath(path);
			// Normalize minimally: block needs id + children
			const row = { ...rowData };
			if (row.kind === 'block') {
				row.id = row.id || genId();
				row.children = row.children || [];
			}
			container.push(row);
			return container.length - 1;
		}),
		getRowAtPath: (path) => {
			let current = rows;
			for (let i = 0; i < path.length; i++) {
				const node = current[path[i]];
				if (!node) return null;
				if (i === path.length - 1) return node;
				current = node.children;
			}
			return null;
		},
		addDisjunctionGroup: jest.fn(({ blockIds }) => {
			const group = { id: 'group-' + (disjunctionGroups.length + 1), blockIds: [...blockIds] };
			disjunctionGroups.push(group);
			return { ok: true, group };
		}),
		getDisjunctionGroups: () => disjunctionGroups,
		remove: jest.fn(() => {
			removed = true;
			if (onRemove) onRemove();
		}),
		isRemoved: () => removed,
	};
	return fake;
}

function buildNoSqlEditor() {
	const insertedCollections = [];
	const createdLinks = [];
	let nextLinkId = 1;
	const aliveCollections = () => insertedCollections.filter(c => !c.isRemoved());
	return {
		insertedCollections,
		aliveCollections,
		createdLinks,
		insertCollection: jest.fn(async ({ name }) => {
			const c = buildFakeCollection(name);
			insertedCollections.push(c);
			return c;
		}),
		sortRows: jest.fn(),
		// Mirrors NoSqlEditor.addReference: records a link and injects linkId
		// into the persisted row. Rejects duplicates like the real editor does.
		addReference: jest.fn((hostCollection, path, refData) => {
			if (!refData || refData.kind !== 'reference' || !refData.targetCollectionId) return null;
			if (hostCollection.hasReferenceToCollection && hostCollection.hasReferenceToCollection(refData.targetCollectionId)) {
				return null;
			}
			const link = { id: `link-${nextLinkId++}`, source: refData.targetCollectionId, target: hostCollection.id };
			createdLinks.push(link);
			const insertedIndex = hostCollection.addRow(path, { ...refData, linkId: link.id });
			return { link, insertedIndex };
		}),
	};
}

function buildEntity(id, name) {
	return {
		id,
		attributes: {
			type: 'erd.Entity',
			supertype: 'Entity',
			attrs: { text: { text: name } },
			position: { x: 0, y: 0 },
		},
	};
}

function buildAttribute(id, name, { multivalued = false, composed = false } = {}) {
	return {
		id,
		attributes: {
			type: 'erd.Attribute',
			supertype: 'Attribute',
			cardinality: multivalued ? '(1, n)' : '(0, 1)',
			composed,
			attrs: { text: { text: name } },
			position: { x: 0, y: 0 },
		},
	};
}

function buildKey(id, name) {
	return {
		id,
		attributes: {
			type: 'erd.Key',
			supertype: 'Key',
			cardinality: '(1, 1)',
			composed: false,
			attrs: { text: { text: name } },
			position: { x: 0, y: 0 },
		},
	};
}

function buildRelationship(id, name) {
	return {
		id,
		attributes: {
			type: 'erd.Relationship',
			supertype: 'Relationship',
			attrs: { text: { text: name } },
			position: { x: 0, y: 0 },
		},
	};
}

function buildLink(id, sourceId, targetId, cardinality) {
	return {
		id,
		attributes: {
			type: 'erd.Line',
			source: { id: sourceId },
			target: { id: targetId },
			labels: [{ attrs: { text: { text: cardinality } } }],
		},
	};
}

function buildISA(id, parentId, cardinality = '(t, d)') {
	return {
		id,
		attributes: {
			type: 'erd.ISA',
			supertype: 'Inheritance',
			parentId,
			cardinality,
			attrs: { text: { text: '' } },
			position: { x: 0, y: 0 },
		},
	};
}

function buildGraph(cells, adjacency, connectedLinks = new Map()) {
	return {
		attributes: { cells: { models: cells } },
		getNeighbors: (cell) => adjacency.get(cell) || [],
		getConnectedLinks: (cell) => connectedLinks.get(cell) || [],
	};
}

// //////////////////////////////////////////////////////////////////
// Tests
// //////////////////////////////////////////////////////////////////

describe('NoSQL Conversor — Phase 1: entity with simple attributes', () => {
	test('entity with key and two simple attributes becomes a collection with identifier + attrs', async () => {
		const entity = buildEntity('e1', 'Cliente');
		const key = buildKey('k1', 'id');
		const nome = buildAttribute('a1', 'nome');
		const email = buildAttribute('a2', 'email');
		const graph = buildGraph(
			[entity, key, nome, email],
			new Map([
				[entity, [key, nome, email]],
				[key, [entity]],
				[nome, [entity]],
				[email, [entity]],
			])
		);

		const editor = buildNoSqlEditor();
		const conversor = new Conversor(editor, {});

		await conversor.toNoSql(graph);

		expect(editor.insertedCollections).toHaveLength(1);
		const cliente = editor.insertedCollections[0];
		expect(cliente.getName()).toBe('Cliente');
		const rows = cliente.getRows();
		expect(rows.map(r => r.name)).toEqual(['id', 'nome', 'email']);
		expect(rows[0].identifier).toBe(true);
		expect(rows[0].type).toBe('ID');
		expect(rows[1].kind).toBe('attribute');
		expect(rows[1].identifier).toBeUndefined();
	});

	test('entity without key gets an _id identifier auto-injected', async () => {
		const entity = buildEntity('e1', 'Cliente');
		const nome = buildAttribute('a1', 'nome');
		const graph = buildGraph(
			[entity, nome],
			new Map([
				[entity, [nome]],
				[nome, [entity]],
			])
		);

		const editor = buildNoSqlEditor();
		const conversor = new Conversor(editor, {});

		await conversor.toNoSql(graph);

		const cliente = editor.insertedCollections[0];
		const rows = cliente.getRows();
		const identifier = rows.find(r => r.identifier);
		expect(identifier).toBeDefined();
		expect(identifier.name).toBe('_id');
		expect(identifier.type).toBe('ID');
	});

	test('multivalued attribute gets (0,n) cardinality enabled', async () => {
		const entity = buildEntity('e1', 'Pessoa');
		const telefones = buildAttribute('a1', 'telefones', { multivalued: true });
		const graph = buildGraph(
			[entity, telefones],
			new Map([
				[entity, [telefones]],
				[telefones, [entity]],
			])
		);

		const conversor = new Conversor(buildNoSqlEditor(), {});
		let insertedCols;
		conversor.nosqlEditor.insertCollection = jest.fn(async ({ name }) => {
			const c = buildFakeCollection(name);
			insertedCols = insertedCols || [];
			insertedCols.push(c);
			return c;
		});
		await conversor.toNoSql(graph);
		const row = insertedCols[0].getRows()[0];
		expect(row.name).toBe('telefones');
		expect(row.cardinalityEnabled).toBe(true);
		expect(row.minCardinality).toBe(1);
		expect(row.maxCardinality).toBe('N');
	});
});

describe('NoSQL Conversor — composite attributes → nested blocks', () => {
	test('composite endereco with children becomes a block with attribute rows', async () => {
		const entity = buildEntity('e1', 'Pessoa');
		const composite = buildAttribute('a1', 'endereco', { composed: true });
		const rua = buildAttribute('a2', 'rua');
		const numero = buildAttribute('a3', 'numero');
		const graph = buildGraph(
			[entity, composite, rua, numero],
			new Map([
				[entity, [composite]],
				[composite, [entity, rua, numero]],
				[rua, [composite]],
				[numero, [composite]],
			])
		);

		const editor = buildNoSqlEditor();
		await new Conversor(editor, {}).toNoSql(graph);

		const pessoa = editor.insertedCollections[0];
		const rows = pessoa.getRows();
		const block = rows.find(r => r.kind === 'block');
		expect(block).toBeDefined();
		expect(block.name).toBe('endereco');
		expect(block.children.map(c => c.name)).toEqual(['rua', 'numero']);
	});

	test('composite without composed flag is still inferred from topology', async () => {
		const entity = buildEntity('e1', 'Pessoa');
		const composite = buildAttribute('a1', 'endereco', { composed: false });
		const rua = buildAttribute('a2', 'rua');
		const graph = buildGraph(
			[entity, composite, rua],
			new Map([
				[entity, [composite]],
				[composite, [entity, rua]],
				[rua, [composite]],
			])
		);

		const editor = buildNoSqlEditor();
		await new Conversor(editor, {}).toNoSql(graph);

		const rows = editor.insertedCollections[0].getRows();
		expect(rows[0].kind).toBe('block');
		expect(rows[0].name).toBe('endereco');
		expect(rows[0].children[0].name).toBe('rua');
	});
});

describe('NoSQL Conversor — Phase 2: disjoint specialization → disjunctionGroups', () => {
	test('disjoint ISA creates child blocks and groups them', async () => {
		const obra = buildEntity('e1', 'Obra');
		const pintura = buildEntity('e2', 'Pintura');
		const escultura = buildEntity('e3', 'Escultura');
		const isa = buildISA('isa1', 'e1', '(t, d)');

		const graph = buildGraph(
			[obra, pintura, escultura, isa],
			new Map([
				[obra, [isa]],
				[pintura, [isa]],
				[escultura, [isa]],
				[isa, [obra, pintura, escultura]],
			])
		);

		const editor = buildNoSqlEditor();
		await new Conversor(editor, {}).toNoSql(graph);

		expect(editor.insertedCollections).toHaveLength(3); // Obra, Pintura, Escultura
		const obraCol = editor.insertedCollections.find(c => c.getName() === 'Obra');
		expect(obraCol).toBeDefined();

		const blocks = obraCol.getRows().filter(r => r.kind === 'block');
		expect(blocks.map(b => b.name).sort()).toEqual(['Escultura', 'Pintura']);

		const groups = obraCol.getDisjunctionGroups();
		expect(groups).toHaveLength(1);
		expect(groups[0].blockIds.length).toBe(2);
	});

	test('overlapping ISA does not create a disjunction group', async () => {
		const obra = buildEntity('e1', 'Obra');
		const a = buildEntity('e2', 'A');
		const b = buildEntity('e3', 'B');
		const isa = buildISA('isa1', 'e1', '(t, o)');

		const graph = buildGraph(
			[obra, a, b, isa],
			new Map([
				[obra, [isa]],
				[a, [isa]],
				[b, [isa]],
				[isa, [obra, a, b]],
			])
		);

		const editor = buildNoSqlEditor();
		await new Conversor(editor, {}).toNoSql(graph);

		const obraCol = editor.insertedCollections.find(c => c.getName() === 'Obra');
		expect(obraCol.getDisjunctionGroups()).toHaveLength(0);
		// Blocks should still have been created, just no disjunction.
		const blocks = obraCol.getRows().filter(r => r.kind === 'block');
		expect(blocks).toHaveLength(2);
	});
});

describe('NoSQL Conversor — Phase 3: relationships', () => {
	test('1-n reference places _REF on the many-side pointing to the one-side', async () => {
		// Look-here notation: label near Cliente is (1,1) (each Pedido sees 1
		// Cliente) → Cliente is the 1-side; label near Pedido is (1,n) (each
		// Cliente sees many Pedidos) → Pedido is the many-side. Per the "add
		// _REF on the many-side" option, Pedido gets a Cliente_REF.
		const cliente = buildEntity('e1', 'Cliente');
		const clienteKey = buildKey('k1', 'idCliente');
		const pedido = buildEntity('e2', 'Pedido');
		const pedidoKey = buildKey('k2', 'idPedido');
		const rel = buildRelationship('r1', 'faz');
		const linkCliente = buildLink('l1', cliente.id, rel.id, '(1, 1)');
		const linkPedido = buildLink('l2', pedido.id, rel.id, '(1, n)');

		const graph = buildGraph(
			[cliente, clienteKey, pedido, pedidoKey, rel],
			new Map([
				[cliente, [clienteKey, rel]],
				[clienteKey, [cliente]],
				[pedido, [pedidoKey, rel]],
				[pedidoKey, [pedido]],
				[rel, [cliente, pedido]],
			]),
			new Map([[rel, [linkCliente, linkPedido]]])
		);

		const editor = buildNoSqlEditor();
		await new Conversor(editor, {}).toNoSql(graph);

		const clienteCol = editor.insertedCollections.find(c => c.getName() === 'Cliente');
		const pedidoCol = editor.insertedCollections.find(c => c.getName() === 'Pedido');
		const refRow = pedidoCol.getRows().find(r => r.kind === 'reference');

		expect(refRow).toBeDefined();
		expect(refRow.name).toBe('Cliente_REF');
		expect(refRow.targetCollectionId).toBe(clienteCol.id);
		// Mandatory (1,1) near Cliente → minCardinality 1 on Pedido's ref
		expect(refRow.minCardinality).toBe(1);
		expect(refRow.maxCardinality).toBe(1);
		// Cliente should NOT carry a Pedido_REF in the "reference" strategy.
		expect(clienteCol.getRows().some(r => r.kind === 'reference')).toBe(false);
	});

	test('1-n reference with relationship attribute wraps _REF + attr in a block on the many-side', async () => {
		// Salao (0,1) ↔ exposicao [data_exposicao] ↔ (0,n) Obra
		const salao = buildEntity('e1', 'Salao');
		const salaoKey = buildKey('k1', 'idSalao');
		const obra = buildEntity('e2', 'Obra');
		const obraKey = buildKey('k2', 'idObra');
		const rel = buildRelationship('r1', 'exposicao');
		const relAttr = buildAttribute('ra1', 'data_exposicao');
		const linkSalao = buildLink('l1', salao.id, rel.id, '(0, 1)');
		const linkObra = buildLink('l2', obra.id, rel.id, '(0, n)');

		const graph = buildGraph(
			[salao, salaoKey, obra, obraKey, rel, relAttr],
			new Map([
				[salao, [salaoKey, rel]],
				[salaoKey, [salao]],
				[obra, [obraKey, rel]],
				[obraKey, [obra]],
				[rel, [salao, obra, relAttr]],
				[relAttr, [rel]],
			]),
			new Map([[rel, [linkSalao, linkObra]]])
		);

		const editor = buildNoSqlEditor();
		await new Conversor(editor, {}).toNoSql(graph);

		const obraCol = editor.insertedCollections.find(c => c.getName() === 'Obra');
		const block = obraCol.getRows().find(r => r.kind === 'block' && r.name === 'exposicao');
		expect(block).toBeDefined();
		const refChild = block.children.find(r => r.kind === 'reference');
		expect(refChild).toBeDefined();
		expect(refChild.name).toBe('Salao_REF');
		const attrChild = block.children.find(r => r.kind === 'attribute' && r.name === 'data_exposicao');
		expect(attrChild).toBeDefined();
	});

	test('m-n ensures _id on both collections when entities have no keys', async () => {
		const obra = buildEntity('e1', 'Obra');
		const autor = buildEntity('e2', 'Autor');
		const rel = buildRelationship('r1', 'autoria');
		const linkObra = buildLink('l1', obra.id, rel.id, '(0, n)');
		const linkAutor = buildLink('l2', autor.id, rel.id, '(1, n)');

		const graph = buildGraph(
			[obra, autor, rel],
			new Map([
				[obra, [rel]],
				[autor, [rel]],
				[rel, [obra, autor]],
			]),
			new Map([[rel, [linkObra, linkAutor]]])
		);

		const editor = buildNoSqlEditor();
		await new Conversor(editor, {}).toNoSql(graph);

		const hasId = (col) =>
			col.getRows().some(r => r.kind === 'attribute' && r.identifier && r.name === '_id');
		const obraCol = editor.insertedCollections.find(c => c.getName() === 'Obra');
		const autorCol = editor.insertedCollections.find(c => c.getName() === 'Autor');
		expect(hasId(obraCol)).toBe(true);
		expect(hasId(autorCol)).toBe(true);
	});

	test('1-1 merge does not repoint map and ensures _id on guest when guest survives', async () => {
		// Pessoa (1,1) ── possui ── (1,1) CPF, but CPF also has another
		// relationship with Banco → CPF's collection must survive the merge
		// and retain its own _id; the map for CPF must not be repointed.
		const pessoa = buildEntity('e1', 'Pessoa');
		const cpf = buildEntity('e2', 'CPF');
		const banco = buildEntity('e3', 'Banco');
		const rel = buildRelationship('r1', 'possui');
		const rel2 = buildRelationship('r2', 'emitidoPor');
		const linkPessoa = buildLink('l1', pessoa.id, rel.id, '(1, 1)');
		const linkCpf1 = buildLink('l2', cpf.id, rel.id, '(1, 1)');
		const linkCpf2 = buildLink('l3', cpf.id, rel2.id, '(1, 1)');
		const linkBanco = buildLink('l4', banco.id, rel2.id, '(1, 1)');

		const graph = buildGraph(
			[pessoa, cpf, banco, rel, rel2],
			new Map([
				[pessoa, [rel]],
				[cpf, [rel, rel2]],
				[banco, [rel2]],
				[rel, [pessoa, cpf]],
				[rel2, [cpf, banco]],
			]),
			new Map([
				[rel, [linkPessoa, linkCpf1]],
				[rel2, [linkCpf2, linkBanco]],
			])
		);

		const editor = buildNoSqlEditor();
		await new Conversor(editor, {}).toNoSql(graph);

		const cpfCol = editor.insertedCollections.find(c => c.getName() === 'CPF');
		expect(cpfCol.isRemoved()).toBe(false);
		expect(cpfCol.getRows().some(r => r.kind === 'attribute' && r.identifier && r.name === '_id')).toBe(true);
	});

	test('m-n with relationship attribute includes the attr inside the block', async () => {
		const obra = buildEntity('e1', 'Obra');
		const obraKey = buildKey('k1', 'idObra');
		const autor = buildEntity('e2', 'Autor');
		const autorKey = buildKey('k2', 'idAutor');
		const rel = buildRelationship('r1', 'autoria');
		const relAttr = buildAttribute('ra1', 'ano');
		const linkObra = buildLink('l1', obra.id, rel.id, '(0, n)');
		const linkAutor = buildLink('l2', autor.id, rel.id, '(1, n)');

		const graph = buildGraph(
			[obra, obraKey, autor, autorKey, rel, relAttr],
			new Map([
				[obra, [obraKey, rel]],
				[obraKey, [obra]],
				[autor, [autorKey, rel]],
				[autorKey, [autor]],
				[rel, [obra, autor, relAttr]],
				[relAttr, [rel]],
			]),
			new Map([[rel, [linkObra, linkAutor]]])
		);

		const editor = buildNoSqlEditor();
		await new Conversor(editor, {}).toNoSql(graph);

		// Default (no modal) → host_A → Autor (alphabetically first).
		const autorCol = editor.insertedCollections.find(c => c.getName() === 'Autor');
		const block = autorCol.getRows().find(r => r.kind === 'block' && r.name === 'autoria');
		expect(block).toBeDefined();
		expect(block.children.some(c => c.kind === 'reference' && c.name === 'Obra_REF')).toBe(true);
		expect(block.children.some(c => c.kind === 'attribute' && c.name === 'ano')).toBe(true);
	});

	test('1-n reference with optional one-side uses minCardinality 0', async () => {
		// Salao (0, 1) ↔ exposicao ↔ (0, n) Obra — the Salao-Obra example.
		const salao = buildEntity('e1', 'Salao');
		const salaoKey = buildKey('k1', 'idSalao');
		const obra = buildEntity('e2', 'Obra');
		const obraKey = buildKey('k2', 'idObra');
		const rel = buildRelationship('r1', 'exposicao');
		const linkSalao = buildLink('l1', salao.id, rel.id, '(0, 1)');
		const linkObra = buildLink('l2', obra.id, rel.id, '(0, n)');

		const graph = buildGraph(
			[salao, salaoKey, obra, obraKey, rel],
			new Map([
				[salao, [salaoKey, rel]],
				[salaoKey, [salao]],
				[obra, [obraKey, rel]],
				[obraKey, [obra]],
				[rel, [salao, obra]],
			]),
			new Map([[rel, [linkSalao, linkObra]]])
		);

		const editor = buildNoSqlEditor();
		await new Conversor(editor, {}).toNoSql(graph);

		const salaoCol = editor.insertedCollections.find(c => c.getName() === 'Salao');
		const obraCol = editor.insertedCollections.find(c => c.getName() === 'Obra');
		// Obra is the many-side → hosts the reference.
		const refRow = obraCol.getRows().find(r => r.kind === 'reference');
		expect(refRow).toBeDefined();
		expect(refRow.name).toBe('Salao_REF');
		expect(refRow.targetCollectionId).toBe(salaoCol.id);
		// (0, 1) near Salao → optional → minCardinality 0
		expect(refRow.minCardinality).toBe(0);
		expect(refRow.maxCardinality).toBe(1);
		// Salao must NOT hold the reference in the reference strategy.
		expect(salaoCol.getRows().some(r => r.kind === 'reference')).toBe(false);
	});

	test('1-n with modal choosing "nesting" embeds the many-side attributes as a block', async () => {
		const cliente = buildEntity('e1', 'Cliente');
		const clienteKey = buildKey('k1', 'idCliente');
		const pedido = buildEntity('e2', 'Pedido');
		const pedidoKey = buildKey('k2', 'idPedido');
		const pedidoData = buildAttribute('a1', 'data');
		const rel = buildRelationship('r1', 'faz');
		const linkCliente = buildLink('l1', cliente.id, rel.id, '(1, 1)');
		const linkPedido = buildLink('l2', pedido.id, rel.id, '(1, n)');

		const graph = buildGraph(
			[cliente, clienteKey, pedido, pedidoKey, pedidoData, rel],
			new Map([
				[cliente, [clienteKey, rel]],
				[clienteKey, [cliente]],
				[pedido, [pedidoKey, pedidoData, rel]],
				[pedidoKey, [pedido]],
				[pedidoData, [pedido]],
				[rel, [cliente, pedido]],
			]),
			new Map([[rel, [linkCliente, linkPedido]]])
		);

		const modal = {
			openRelation1N: jest.fn().mockResolvedValue({ value: 'nesting' }),
		};
		const editor = buildNoSqlEditor();
		await new Conversor(editor, modal).toNoSql(graph);

		const clienteCol = editor.insertedCollections.find(c => c.getName() === 'Cliente');
		const block = clienteCol.getRows().find(r => r.kind === 'block' && r.name === 'faz');
		expect(block).toBeDefined();
		expect(block.cardinalityEnabled).toBe(true);
		expect(block.maxCardinality).toBe('N');
		const childNames = block.children.map(c => c.name);
		expect(childNames).toContain('idPedido');
		expect(childNames).toContain('data');
		expect(modal.openRelation1N).toHaveBeenCalled();
	});

	test('multivalued attribute with modal "nested_block" becomes a block', async () => {
		const entity = buildEntity('e1', 'Pessoa');
		const telefones = buildAttribute('a1', 'telefones', { multivalued: true });
		const graph = buildGraph(
			[entity, telefones],
			new Map([
				[entity, [telefones]],
				[telefones, [entity]],
			])
		);

		const modal = {
			openMultivalued: jest.fn().mockResolvedValue({ value: 'nested_block' }),
		};
		const editor = buildNoSqlEditor();
		await new Conversor(editor, modal).toNoSql(graph);

		const rows = editor.insertedCollections[0].getRows();
		const block = rows.find(r => r.kind === 'block' && r.name === 'telefones');
		expect(block).toBeDefined();
		expect(block.cardinalityEnabled).toBe(true);
		expect(block.maxCardinality).toBe('N');
		expect(block.children[0].name).toBe('value');
	});

	test('multivalued attribute with modal "separate_collection" creates a new collection', async () => {
		const entity = buildEntity('e1', 'Pessoa');
		const telefones = buildAttribute('a1', 'telefones', { multivalued: true });
		const graph = buildGraph(
			[entity, telefones],
			new Map([
				[entity, [telefones]],
				[telefones, [entity]],
			])
		);

		const modal = {
			openMultivalued: jest.fn().mockResolvedValue({ value: 'separate_collection' }),
		};
		const editor = buildNoSqlEditor();
		await new Conversor(editor, modal).toNoSql(graph);

		expect(editor.insertedCollections).toHaveLength(2);
		const telefoneCol = editor.insertedCollections.find(c => c.getName() === 'telefones');
		expect(telefoneCol).toBeDefined();
		const refRow = telefoneCol.getRows().find(r => r.kind === 'reference');
		expect(refRow).toBeDefined();
		expect(refRow.targetCollectionName).toBe('Pessoa');
	});

	test('specialization with modal "specialized_collections" copies root attrs to each child', async () => {
		const obra = buildEntity('e1', 'Obra');
		const obraTitulo = buildAttribute('a1', 'titulo');
		const pintura = buildEntity('e2', 'Pintura');
		const escultura = buildEntity('e3', 'Escultura');
		const isa = buildISA('isa1', 'e1', '(t, d)');

		const graph = buildGraph(
			[obra, obraTitulo, pintura, escultura, isa],
			new Map([
				[obra, [obraTitulo, isa]],
				[obraTitulo, [obra]],
				[pintura, [isa]],
				[escultura, [isa]],
				[isa, [obra, pintura, escultura]],
			])
		);

		const modal = {
			openSpecialization: jest.fn().mockResolvedValue({ value: 'specialized_collections' }),
		};
		const editor = buildNoSqlEditor();
		await new Conversor(editor, modal).toNoSql(graph);

		const pinturaCol = editor.insertedCollections.find(c => c.getName() === 'Pintura');
		const esculturaCol = editor.insertedCollections.find(c => c.getName() === 'Escultura');
		expect(pinturaCol.getRows().some(r => r.name === 'titulo')).toBe(true);
		expect(esculturaCol.getRows().some(r => r.name === 'titulo')).toBe(true);
	});

	test('specialization "specialized_collections" removes parent collection and ensures _id on children', async () => {
		const obra = buildEntity('e1', 'Obra');
		const obraTitulo = buildAttribute('a1', 'titulo');
		const pintura = buildEntity('e2', 'Pintura');
		const escultura = buildEntity('e3', 'Escultura');
		const isa = buildISA('isa1', 'e1', '(t, d)');

		const graph = buildGraph(
			[obra, obraTitulo, pintura, escultura, isa],
			new Map([
				[obra, [obraTitulo, isa]],
				[obraTitulo, [obra]],
				[pintura, [isa]],
				[escultura, [isa]],
				[isa, [obra, pintura, escultura]],
			])
		);

		const modal = {
			openSpecialization: jest.fn().mockResolvedValue({ value: 'specialized_collections' }),
		};
		const editor = buildNoSqlEditor();
		await new Conversor(editor, modal).toNoSql(graph);

		const obraCol = editor.insertedCollections.find(c => c.getName() === 'Obra');
		const pinturaCol = editor.insertedCollections.find(c => c.getName() === 'Pintura');
		const esculturaCol = editor.insertedCollections.find(c => c.getName() === 'Escultura');
		expect(obraCol.isRemoved()).toBe(true);
		const hasId = (col) =>
			col.getRows().some(r => r.kind === 'attribute' && r.identifier && r.name === '_id');
		expect(hasId(pinturaCol)).toBe(true);
		expect(hasId(esculturaCol)).toBe(true);
	});

	test('specialization with modal "generic_collection" adds tipo discriminator', async () => {
		const obra = buildEntity('e1', 'Obra');
		const obraTitulo = buildAttribute('a1', 'titulo');
		const pintura = buildEntity('e2', 'Pintura');
		const pinturaTecnica = buildAttribute('a2', 'tecnica');
		const escultura = buildEntity('e3', 'Escultura');
		const isa = buildISA('isa1', 'e1', '(t, d)');

		const graph = buildGraph(
			[obra, obraTitulo, pintura, pinturaTecnica, escultura, isa],
			new Map([
				[obra, [obraTitulo, isa]],
				[obraTitulo, [obra]],
				[pintura, [pinturaTecnica, isa]],
				[pinturaTecnica, [pintura]],
				[escultura, [isa]],
				[isa, [obra, pintura, escultura]],
			])
		);

		const modal = {
			openSpecialization: jest.fn().mockResolvedValue({ value: 'generic_collection' }),
		};
		const editor = buildNoSqlEditor();
		await new Conversor(editor, modal).toNoSql(graph);

		const obraCol = editor.insertedCollections.find(c => c.getName() === 'Obra');
		const rowNames = obraCol.getRows().map(r => r.name);
		expect(rowNames).toContain('titulo');
		expect(rowNames).toContain('tecnica');
		expect(rowNames).toContain('tipo');
		expect(obraCol.getRows().some(r => r.kind === 'attribute' && r.identifier && r.name === '_id')).toBe(true);
	});

	test('specialization "nested_with_disjunction" ensures _id on root when parent has no key', async () => {
		const obra = buildEntity('e1', 'Obra');
		const pintura = buildEntity('e2', 'Pintura');
		const escultura = buildEntity('e3', 'Escultura');
		const isa = buildISA('isa1', 'e1', '(t, d)');

		const graph = buildGraph(
			[obra, pintura, escultura, isa],
			new Map([
				[obra, [isa]],
				[pintura, [isa]],
				[escultura, [isa]],
				[isa, [obra, pintura, escultura]],
			])
		);

		const editor = buildNoSqlEditor();
		await new Conversor(editor, {}).toNoSql(graph);

		const obraCol = editor.insertedCollections.find(c => c.getName() === 'Obra');
		expect(obraCol.getRows().some(r => r.kind === 'attribute' && r.identifier && r.name === '_id')).toBe(true);
	});

	test('1-1 mandatory (both 1,1) auto-merges without consulting modal', async () => {
		const pessoa = buildEntity('e1', 'Pessoa');
		const pessoaKey = buildKey('k1', 'idPessoa');
		const cpf = buildEntity('e2', 'CPF');
		const cpfNumero = buildAttribute('a1', 'numero');
		const rel = buildRelationship('r1', 'possui');
		const linkPessoa = buildLink('l1', pessoa.id, rel.id, '(1, 1)');
		const linkCpf = buildLink('l2', cpf.id, rel.id, '(1, 1)');

		const graph = buildGraph(
			[pessoa, pessoaKey, cpf, cpfNumero, rel],
			new Map([
				[pessoa, [pessoaKey, rel]],
				[pessoaKey, [pessoa]],
				[cpf, [cpfNumero, rel]],
				[cpfNumero, [cpf]],
				[rel, [pessoa, cpf]],
			]),
			new Map([[rel, [linkPessoa, linkCpf]]])
		);

		const modal = {
			openRelation11: jest.fn(),
			openRelation11Partial: jest.fn(),
		};
		const editor = buildNoSqlEditor();
		await new Conversor(editor, modal).toNoSql(graph);

		expect(modal.openRelation11).not.toHaveBeenCalled();
		expect(modal.openRelation11Partial).not.toHaveBeenCalled();
		// CPF is alphabetically first, so it becomes the merge target.
		const cpfCol = editor.insertedCollections.find(c => c.getName() === 'CPF');
		expect(cpfCol.getRows().some(r => r.name === 'numero')).toBe(true);
	});

	test('1-1 merge carries relationship attributes into the merged collection', async () => {
		// Pessoa (1,1) ── casado_com [data_casamento] ── (1,1) Conjuge
		// Both mandatory → auto-merge. The relationship has its own attribute
		// `data_casamento`, which should land on the merged host collection.
		const pessoa = buildEntity('e1', 'Pessoa');
		const pessoaKey = buildKey('k1', 'idPessoa');
		const conjuge = buildEntity('e2', 'Conjuge');
		const conjugeKey = buildKey('k2', 'idConjuge');
		const rel = buildRelationship('r1', 'casado_com');
		const dataCasamento = buildAttribute('ra1', 'data_casamento');
		const linkPessoa = buildLink('l1', pessoa.id, rel.id, '(1, 1)');
		const linkConjuge = buildLink('l2', conjuge.id, rel.id, '(1, 1)');

		const graph = buildGraph(
			[pessoa, pessoaKey, conjuge, conjugeKey, rel, dataCasamento],
			new Map([
				[pessoa, [pessoaKey, rel]],
				[pessoaKey, [pessoa]],
				[conjuge, [conjugeKey, rel]],
				[conjugeKey, [conjuge]],
				[rel, [pessoa, conjuge, dataCasamento]],
				[dataCasamento, [rel]],
			]),
			new Map([[rel, [linkPessoa, linkConjuge]]])
		);

		const editor = buildNoSqlEditor();
		await new Conversor(editor, {}).toNoSql(graph);

		// Conjuge is alphabetically first, so it becomes the merge target.
		const conjugeCol = editor.insertedCollections.find(c => c.getName() === 'Conjuge');
		expect(conjugeCol.getRows().some(r => r.name === 'data_casamento')).toBe(true);
	});

	test('1-1 nesting carries relationship attributes into the nested block', async () => {
		const a = buildEntity('e1', 'A');
		const b = buildEntity('e2', 'B');
		const bKey = buildKey('k2', 'idB');
		const rel = buildRelationship('r1', 'rel');
		const relAttr = buildAttribute('ra1', 'desde');
		const linkA = buildLink('l1', a.id, rel.id, '(0, 1)');
		const linkB = buildLink('l2', b.id, rel.id, '(0, 1)');

		const graph = buildGraph(
			[a, b, bKey, rel, relAttr],
			new Map([
				[a, [rel]],
				[b, [bKey, rel]],
				[bKey, [b]],
				[rel, [a, b, relAttr]],
				[relAttr, [rel]],
			]),
			new Map([[rel, [linkA, linkB]]])
		);

		const modal = {
			openRelation11: jest.fn().mockResolvedValue({ value: 'nesting' }),
		};
		const editor = buildNoSqlEditor();
		await new Conversor(editor, modal).toNoSql(graph);

		const aCol = editor.insertedCollections.find(c => c.getName() === 'A');
		const block = aCol.getRows().find(r => r.kind === 'block');
		expect(block).toBeDefined();
		expect(block.children.some(c => c.name === 'desde')).toBe(true);
	});

	test('1-1 reference wraps _REF and relationship attributes in a block', async () => {
		const a = buildEntity('e1', 'A');
		const b = buildEntity('e2', 'B');
		const bKey = buildKey('k2', 'idB');
		const rel = buildRelationship('r1', 'rel');
		const relAttr = buildAttribute('ra1', 'desde');
		const linkA = buildLink('l1', a.id, rel.id, '(0, 1)');
		const linkB = buildLink('l2', b.id, rel.id, '(0, 1)');

		const graph = buildGraph(
			[a, b, bKey, rel, relAttr],
			new Map([
				[a, [rel]],
				[b, [bKey, rel]],
				[bKey, [b]],
				[rel, [a, b, relAttr]],
				[relAttr, [rel]],
			]),
			new Map([[rel, [linkA, linkB]]])
		);

		const modal = {
			openRelation11: jest.fn().mockResolvedValue({ value: 'reference' }),
		};
		const editor = buildNoSqlEditor();
		await new Conversor(editor, modal).toNoSql(graph);

		const aCol = editor.insertedCollections.find(c => c.getName() === 'A');
		const block = aCol.getRows().find(r => r.kind === 'block' && r.name === 'rel');
		expect(block).toBeDefined();
		expect(block.children.some(c => c.kind === 'reference')).toBe(true);
		expect(block.children.some(c => c.name === 'desde')).toBe(true);
	});

	test('1-1 partial with modal "merge" ensures _id on host when neither entity has a key', async () => {
		// Pessoa (1,1) ── possui ── (0,1) Passaporte
		// Host is the mandatory side (Pessoa). Neither entity has a Key element,
		// so without ensureIdentifier the merged collection would have no _id.
		const pessoa = buildEntity('e1', 'Pessoa');
		const passaporte = buildEntity('e2', 'Passaporte');
		const passaporteNumero = buildAttribute('a1', 'numero');
		const rel = buildRelationship('r1', 'possui');
		const linkPessoa = buildLink('l1', pessoa.id, rel.id, '(1, 1)');
		const linkPassaporte = buildLink('l2', passaporte.id, rel.id, '(0, 1)');

		const graph = buildGraph(
			[pessoa, passaporte, passaporteNumero, rel],
			new Map([
				[pessoa, [rel]],
				[passaporte, [passaporteNumero, rel]],
				[passaporteNumero, [passaporte]],
				[rel, [pessoa, passaporte]],
			]),
			new Map([[rel, [linkPessoa, linkPassaporte]]])
		);

		const modal = {
			openRelation11Partial: jest.fn().mockResolvedValue({ value: 'merge' }),
		};
		const editor = buildNoSqlEditor();
		await new Conversor(editor, modal).toNoSql(graph);

		const pessoaCol = editor.insertedCollections.find(c => c.getName() === 'Pessoa');
		expect(pessoaCol.getRows().some(r => r.name === 'numero')).toBe(true);
		expect(pessoaCol.getRows().some(r => r.kind === 'attribute' && r.identifier && r.name === '_id')).toBe(true);
	});

	test('1-1 fully optional with modal "reference" creates a reference row', async () => {
		const a = buildEntity('e1', 'A');
		const b = buildEntity('e2', 'B');
		const bKey = buildKey('k2', 'idB');
		const rel = buildRelationship('r1', 'rel');
		const linkA = buildLink('l1', a.id, rel.id, '(0, 1)');
		const linkB = buildLink('l2', b.id, rel.id, '(0, 1)');

		const graph = buildGraph(
			[a, b, bKey, rel],
			new Map([
				[a, [rel]],
				[b, [bKey, rel]],
				[bKey, [b]],
				[rel, [a, b]],
			]),
			new Map([[rel, [linkA, linkB]]])
		);

		const modal = {
			openRelation11: jest.fn().mockResolvedValue({ value: 'reference' }),
		};
		const editor = buildNoSqlEditor();
		await new Conversor(editor, modal).toNoSql(graph);

		expect(modal.openRelation11).toHaveBeenCalled();
		// A is alphabetically first → gets the reference.
		const aCol = editor.insertedCollections.find(c => c.getName() === 'A');
		const refRow = aCol.getRows().find(r => r.kind === 'reference');
		expect(refRow).toBeDefined();
	});

	test('1-n nesting ensures _id on the one-side when it has no key', async () => {
		const cliente = buildEntity('e1', 'Cliente');
		const pedido = buildEntity('e2', 'Pedido');
		const rel = buildRelationship('r1', 'faz');
		const linkCliente = buildLink('l1', cliente.id, rel.id, '(1, 1)');
		const linkPedido = buildLink('l2', pedido.id, rel.id, '(1, n)');

		const graph = buildGraph(
			[cliente, pedido, rel],
			new Map([
				[cliente, [rel]],
				[pedido, [rel]],
				[rel, [cliente, pedido]],
			]),
			new Map([[rel, [linkCliente, linkPedido]]])
		);

		const modal = { openRelation1N: jest.fn().mockResolvedValue({ value: 'nesting' }) };
		const editor = buildNoSqlEditor();
		await new Conversor(editor, modal).toNoSql(graph);

		const clienteCol = editor.insertedCollections.find(c => c.getName() === 'Cliente');
		expect(clienteCol.getRows().some(r => r.kind === 'attribute' && r.identifier && r.name === '_id')).toBe(true);
	});

	test('1-n nesting removes the many-side collection when it has no other relationships', async () => {
		const cliente = buildEntity('e1', 'Cliente');
		const pedido = buildEntity('e2', 'Pedido');
		const pedidoKey = buildKey('k2', 'idPedido');
		const rel = buildRelationship('r1', 'faz');
		const linkCliente = buildLink('l1', cliente.id, rel.id, '(1, 1)');
		const linkPedido = buildLink('l2', pedido.id, rel.id, '(1, n)');

		const graph = buildGraph(
			[cliente, pedido, pedidoKey, rel],
			new Map([
				[cliente, [rel]],
				[pedido, [pedidoKey, rel]],
				[pedidoKey, [pedido]],
				[rel, [cliente, pedido]],
			]),
			new Map([[rel, [linkCliente, linkPedido]]])
		);

		const modal = { openRelation1N: jest.fn().mockResolvedValue({ value: 'nesting' }) };
		const editor = buildNoSqlEditor();
		await new Conversor(editor, modal).toNoSql(graph);

		const clienteCol = editor.insertedCollections.find(c => c.getName() === 'Cliente');
		const pedidoCol = editor.insertedCollections.find(c => c.getName() === 'Pedido');
		expect(clienteCol.isRemoved()).toBe(false);
		expect(pedidoCol.isRemoved()).toBe(true);
	});

	test('1-n nesting keeps the many-side collection when it has another relationship', async () => {
		const cliente = buildEntity('e1', 'Cliente');
		const pedido = buildEntity('e2', 'Pedido');
		const produto = buildEntity('e3', 'Produto');
		const rel1 = buildRelationship('r1', 'faz');
		const rel2 = buildRelationship('r2', 'contem');
		const linkCliente = buildLink('l1', cliente.id, rel1.id, '(1, 1)');
		const linkPedido1 = buildLink('l2', pedido.id, rel1.id, '(1, n)');
		const linkPedido2 = buildLink('l3', pedido.id, rel2.id, '(1, n)');
		const linkProduto = buildLink('l4', produto.id, rel2.id, '(1, n)');

		const graph = buildGraph(
			[cliente, pedido, produto, rel1, rel2],
			new Map([
				[cliente, [rel1]],
				[pedido, [rel1, rel2]],
				[produto, [rel2]],
				[rel1, [cliente, pedido]],
				[rel2, [pedido, produto]],
			]),
			new Map([
				[rel1, [linkCliente, linkPedido1]],
				[rel2, [linkPedido2, linkProduto]],
			])
		);

		const modal = { openRelation1N: jest.fn().mockResolvedValue({ value: 'nesting' }) };
		const editor = buildNoSqlEditor();
		await new Conversor(editor, modal).toNoSql(graph);

		const pedidoCol = editor.insertedCollections.find(c => c.getName() === 'Pedido');
		expect(pedidoCol.isRemoved()).toBe(false);
	});

	test('specialization nested_with_disjunction removes child collections when standalone', async () => {
		const obra = buildEntity('e1', 'Obra');
		const pintura = buildEntity('e2', 'Pintura');
		const escultura = buildEntity('e3', 'Escultura');
		const isa = buildISA('isa1', 'e1', '(t, d)');

		const graph = buildGraph(
			[obra, pintura, escultura, isa],
			new Map([
				[obra, [isa]],
				[pintura, [isa]],
				[escultura, [isa]],
				[isa, [obra, pintura, escultura]],
			])
		);

		const editor = buildNoSqlEditor();
		await new Conversor(editor, {}).toNoSql(graph);

		const obraCol = editor.insertedCollections.find(c => c.getName() === 'Obra');
		const pinturaCol = editor.insertedCollections.find(c => c.getName() === 'Pintura');
		const esculturaCol = editor.insertedCollections.find(c => c.getName() === 'Escultura');
		expect(obraCol.isRemoved()).toBe(false);
		expect(pinturaCol.isRemoved()).toBe(true);
		expect(esculturaCol.isRemoved()).toBe(true);
	});

	test('specialization generic_collection removes child collections when standalone', async () => {
		const obra = buildEntity('e1', 'Obra');
		const pintura = buildEntity('e2', 'Pintura');
		const escultura = buildEntity('e3', 'Escultura');
		const isa = buildISA('isa1', 'e1', '(t, d)');

		const graph = buildGraph(
			[obra, pintura, escultura, isa],
			new Map([
				[obra, [isa]],
				[pintura, [isa]],
				[escultura, [isa]],
				[isa, [obra, pintura, escultura]],
			])
		);

		const editor = buildNoSqlEditor();
		const modal = {
			openSpecialization: jest.fn().mockResolvedValue({ value: 'generic_collection' }),
		};
		await new Conversor(editor, modal).toNoSql(graph);

		const obraCol = editor.insertedCollections.find(c => c.getName() === 'Obra');
		const pinturaCol = editor.insertedCollections.find(c => c.getName() === 'Pintura');
		expect(obraCol.isRemoved()).toBe(false);
		expect(pinturaCol.isRemoved()).toBe(true);
	});

	test('m-n with modal choosing host_B places the block on the second collection', async () => {
		const obra = buildEntity('e1', 'Obra');
		const obraKey = buildKey('k1', 'idObra');
		const autor = buildEntity('e2', 'Autor');
		const autorKey = buildKey('k2', 'idAutor');
		const rel = buildRelationship('r1', 'autoria');
		const linkObra = buildLink('l1', obra.id, rel.id, '(0, n)');
		const linkAutor = buildLink('l2', autor.id, rel.id, '(1, n)');

		const graph = buildGraph(
			[obra, obraKey, autor, autorKey, rel],
			new Map([
				[obra, [obraKey, rel]],
				[obraKey, [obra]],
				[autor, [autorKey, rel]],
				[autorKey, [autor]],
				[rel, [obra, autor]],
			]),
			new Map([[rel, [linkObra, linkAutor]]])
		);

		const modal = {
			openRelationNN: jest.fn().mockResolvedValue({ value: 'host_B' }),
		};
		const editor = buildNoSqlEditor();
		await new Conversor(editor, modal).toNoSql(graph);

		const obraCol = editor.insertedCollections.find(c => c.getName() === 'Obra');
		const autorCol = editor.insertedCollections.find(c => c.getName() === 'Autor');
		// host_B = Obra (alphabetically second among [Autor, Obra])
		const blockOnObra = obraCol.getRows().find(r => r.kind === 'block' && r.name === 'autoria');
		expect(blockOnObra).toBeDefined();
		const ref = blockOnObra.children.find(r => r.kind === 'reference');
		expect(ref.targetCollectionId).toBe(autorCol.id);
		// Autor should NOT host the block in this scenario.
		const blockOnAutor = autorCol.getRows().find(r => r.kind === 'block' && r.name === 'autoria');
		expect(blockOnAutor).toBeUndefined();
		expect(modal.openRelationNN).toHaveBeenCalled();
	});

	test('1-n reference always shows cardinality, including optional (0,1)', async () => {
		// Salao (0,1) ↔ exposicao ↔ (0,n) Obra — optional one-side.
		const salao = buildEntity('e1', 'Salao');
		const obra = buildEntity('e2', 'Obra');
		const rel = buildRelationship('r1', 'exposicao');
		const linkSalao = buildLink('l1', salao.id, rel.id, '(0, 1)');
		const linkObra = buildLink('l2', obra.id, rel.id, '(0, n)');
		const graph = buildGraph(
			[salao, obra, rel],
			new Map([[salao, [rel]], [obra, [rel]], [rel, [salao, obra]]]),
			new Map([[rel, [linkSalao, linkObra]]])
		);
		const editor = buildNoSqlEditor();
		await new Conversor(editor, {}).toNoSql(graph);
		const obraCol = editor.insertedCollections.find(c => c.getName() === 'Obra');
		const ref = obraCol.getRows().find(r => r.kind === 'reference' && r.name === 'Salao_REF');
		expect(ref.cardinalityEnabled).toBe(true);
		expect(ref.minCardinality).toBe(0);
	});

	test('1-n nesting with mandatory (1, n) produces block (1, N)', async () => {
		const dept = buildEntity('e1', 'Dept');
		const emp = buildEntity('e2', 'Employee');
		const rel = buildRelationship('r1', 'has');
		const linkDept = buildLink('l1', dept.id, rel.id, '(1, 1)');
		const linkEmp = buildLink('l2', emp.id, rel.id, '(1, n)');
		const graph = buildGraph(
			[dept, emp, rel],
			new Map([[dept, [rel]], [emp, [rel]], [rel, [dept, emp]]]),
			new Map([[rel, [linkDept, linkEmp]]])
		);
		const modal = { openRelation1N: jest.fn().mockResolvedValue({ value: 'nesting' }) };
		const editor = buildNoSqlEditor();
		await new Conversor(editor, modal).toNoSql(graph);
		const deptCol = editor.insertedCollections.find(c => c.getName() === 'Dept');
		const block = deptCol.getRows().find(r => r.kind === 'block' && r.name === 'has');
		expect(block).toBeDefined();
		expect(block.minCardinality).toBe(1);
		expect(block.maxCardinality).toBe('N');
	});

	test('partial 1-1 nesting hosts the guest in the mandatory-participant side, not alphabetical', async () => {
		// Zebra (1,1) ↔ owns ↔ (0,1) Apple. In look-here: label (1,1) near Zebra
		// means Apple always has Zebra → Zebra is the mandatory-participant side.
		// Alphabetical would pick Apple as host (wrong); the fix must pick Zebra.
		const zebra = buildEntity('e1', 'Zebra');
		const apple = buildEntity('e2', 'Apple');
		const appleKey = buildKey('k1', 'idApple');
		const rel = buildRelationship('r1', 'owns');
		const linkZ = buildLink('l1', zebra.id, rel.id, '(1, 1)');
		const linkA = buildLink('l2', apple.id, rel.id, '(0, 1)');
		const graph = buildGraph(
			[zebra, apple, appleKey, rel],
			new Map([
				[zebra, [rel]],
				[apple, [appleKey, rel]],
				[appleKey, [apple]],
				[rel, [zebra, apple]],
			]),
			new Map([[rel, [linkZ, linkA]]])
		);
		const modal = { openRelation11Partial: jest.fn().mockResolvedValue({ value: 'nesting' }) };
		const editor = buildNoSqlEditor();
		await new Conversor(editor, modal).toNoSql(graph);
		// Zebra hosts the block (named after Apple). Apple should NOT have been kept
		// as host.
		const zebraCol = editor.insertedCollections.find(c => c.getName() === 'Zebra');
		const appleCol = editor.insertedCollections.find(c => c.getName() === 'Apple');
		const block = zebraCol.getRows().find(r => r.kind === 'block' && r.name === 'Apple');
		expect(block).toBeDefined();
		// Apple's attrs land inside Zebra's block.
		expect(block.children.some(c => c.name === 'idApple')).toBe(true);
		// Apple collection gets removed (standalone, no other participations).
		expect(appleCol.isRemoved()).toBe(true);
	});

	test('cardinality parsing normalizes compact labels (1,n) without spaces', async () => {
		// Same as the Cliente/Pedido 1-n test but with compact labels.
		const cliente = buildEntity('e1', 'Cliente');
		const pedido = buildEntity('e2', 'Pedido');
		const rel = buildRelationship('r1', 'faz');
		const linkCliente = buildLink('l1', cliente.id, rel.id, '(1,1)');
		const linkPedido = buildLink('l2', pedido.id, rel.id, '(1,n)');
		const graph = buildGraph(
			[cliente, pedido, rel],
			new Map([[cliente, [rel]], [pedido, [rel]], [rel, [cliente, pedido]]]),
			new Map([[rel, [linkCliente, linkPedido]]])
		);
		const editor = buildNoSqlEditor();
		await new Conversor(editor, {}).toNoSql(graph);
		// Must correctly classify as 1-n (not misread charAt(4)=')') and place
		// the ref on the many-side (Pedido) pointing to the one-side (Cliente).
		const pedidoCol = editor.insertedCollections.find(c => c.getName() === 'Pedido');
		const ref = pedidoCol.getRows().find(r => r.kind === 'reference' && r.name === 'Cliente_REF');
		expect(ref).toBeDefined();
		expect(ref.minCardinality).toBe(1);
	});

	test('auto-relationships are processed before regular relationships', async () => {
		// Two relations on Employee: a regular 1-n (Dept has Employees) and an
		// auto 1-n (supervises). Input order in the graph puts the regular
		// relation FIRST. After the fix, buildRelationships re-sorts so the
		// auto modal is consulted before the regular modal.
		const dept = buildEntity('e1', 'Dept');
		const employee = buildEntity('e2', 'Employee');
		const relHas = buildRelationship('r1', 'has');
		const relSupervises = buildRelationship('r2', 'supervises');
		const linkDeptHas = buildLink('l1', dept.id, relHas.id, '(1, 1)');
		const linkEmpHas = buildLink('l2', employee.id, relHas.id, '(0, n)');
		const linkSup1 = buildLink('l3', employee.id, relSupervises.id, '(1, 1)');
		const linkSup2 = buildLink('l4', employee.id, relSupervises.id, '(1, n)');

		const graph = buildGraph(
			[dept, employee, relHas, relSupervises],
			new Map([
				[dept, [relHas]],
				[employee, [relHas, relSupervises]],
				[relHas, [dept, employee]],
				[relSupervises, [employee]],
			]),
			new Map([
				[relHas, [linkDeptHas, linkEmpHas]],
				[relSupervises, [linkSup1, linkSup2]],
			])
		);

		const calls = [];
		const modal = {
			openRelation1N: jest.fn().mockImplementation(() => {
				calls.push('regular');
				return Promise.resolve({ value: 'reference' });
			}),
			openAutoRelation1N: jest.fn().mockImplementation(() => {
				calls.push('auto');
				return Promise.resolve({ value: 'reference' });
			}),
		};
		const editor = buildNoSqlEditor();
		await new Conversor(editor, modal).toNoSql(graph);

		expect(calls).toEqual(['auto', 'regular']);
	});

	test('specialization does not repoint child → root when child has another participation that keeps its collection', async () => {
		// Obra ← {Pintura, Escultura} disjoint. Pintura also participates in
		// another relation (autor relationship), so its standalone collection
		// must be kept — and entityCollectionMap.get(pintura.id) must still
		// resolve to pinturaCol, NOT to obraCol.
		const obra = buildEntity('e1', 'Obra');
		const pintura = buildEntity('e2', 'Pintura');
		const escultura = buildEntity('e3', 'Escultura');
		const autor = buildEntity('e4', 'Autor');
		const autorKey = buildKey('k1', 'idAutor');
		const isa = buildISA('isa1', 'e1', '(t, d)');
		// Pintura has its own extra 1-n relationship with Autor.
		const relAutoria = buildRelationship('r1', 'pinta');
		const linkPintura = buildLink('l1', pintura.id, relAutoria.id, '(1, 1)');
		const linkAutor = buildLink('l2', autor.id, relAutoria.id, '(1, n)');

		const graph = buildGraph(
			[obra, pintura, escultura, autor, autorKey, isa, relAutoria],
			new Map([
				[obra, [isa]],
				[pintura, [isa, relAutoria]],
				[escultura, [isa]],
				[autor, [autorKey, relAutoria]],
				[autorKey, [autor]],
				[isa, [obra, pintura, escultura]],
				[relAutoria, [pintura, autor]],
			]),
			new Map([[relAutoria, [linkPintura, linkAutor]]])
		);

		const editor = buildNoSqlEditor();
		await new Conversor(editor, {}).toNoSql(graph);

		// Escultura has no other participations → absorbed into Obra.
		const esculturaCol = editor.insertedCollections.find(c => c.getName() === 'Escultura');
		expect(esculturaCol.isRemoved()).toBe(true);
		// Pintura still alive (autor relation).
		const pinturaCol = editor.insertedCollections.find(c => c.getName() === 'Pintura');
		expect(pinturaCol.isRemoved()).toBe(false);
	});

	test('absorbRow recurses through block children so nested refs go through addReference', async () => {
		// exposicao (with data_exposicao attribute) turns into a block {_REF, data_exposicao}
		// on the many-side (Obra). If Obra is then nested into Galeria (hypothetical),
		// the nested refs inside that block must be recreated via addReference.
		const salao = buildEntity('e1', 'Salao');
		const salaoKey = buildKey('k1', 'idSalao');
		const obra = buildEntity('e2', 'Obra');
		const obraKey = buildKey('k2', 'idObra');
		const galeria = buildEntity('e3', 'Galeria');
		const rel1 = buildRelationship('r1', 'exposicao');
		const rel1Attr = buildAttribute('a1', 'data_exposicao');
		const rel2 = buildRelationship('r2', 'acolhe');
		const linkS = buildLink('l1', salao.id, rel1.id, '(0, 1)');
		const linkO = buildLink('l2', obra.id, rel1.id, '(0, n)');
		const linkG = buildLink('l3', galeria.id, rel2.id, '(1, 1)');
		const linkO2 = buildLink('l4', obra.id, rel2.id, '(0, n)');

		const graph = buildGraph(
			[salao, salaoKey, obra, obraKey, galeria, rel1, rel1Attr, rel2],
			new Map([
				[salao, [salaoKey, rel1]],
				[salaoKey, [salao]],
				[obra, [obraKey, rel1, rel2]],
				[obraKey, [obra]],
				[galeria, [rel2]],
				[rel1, [salao, obra, rel1Attr]],
				[rel1Attr, [rel1]],
				[rel2, [galeria, obra]],
			]),
			new Map([
				[rel1, [linkS, linkO]],
				[rel2, [linkG, linkO2]],
			])
		);

		// rel1 'exposicao' → reference (default, creates a block on Obra with
		// Salao_REF + data_exposicao). rel2 'acolhe' → nesting (embeds Obra
		// into Galeria, which must recursively recreate the nested Salao_REF).
		const modal = {
			openRelation1N: jest.fn().mockImplementation((desc) => {
				if (typeof desc === 'string' && desc.includes('acolhe')) {
					return Promise.resolve({ value: 'nesting' });
				}
				return Promise.resolve({ value: 'reference' });
			}),
		};
		const editor = buildNoSqlEditor();
		await new Conversor(editor, modal).toNoSql(graph);

		// Galeria embeds Obra. Obra had a block 'exposicao' with Salao_REF inside.
		// The recursive absorbRow must recreate Salao_REF via addReference (new linkId).
		const galeriaCol = editor.insertedCollections.find(c => c.getName() === 'Galeria');
		const acolheBlock = galeriaCol.getRows().find(r => r.kind === 'block' && r.name === 'acolhe');
		expect(acolheBlock).toBeDefined();
		const nestedExposicao = acolheBlock.children.find(r => r.kind === 'block' && r.name === 'exposicao');
		expect(nestedExposicao).toBeDefined();
		const nestedRef = nestedExposicao.children.find(r => r.kind === 'reference' && r.name === 'Salao_REF');
		expect(nestedRef).toBeDefined();
		// Fresh linkId assigned by the fake editor.addReference (not the original).
		expect(nestedRef.linkId).toMatch(/^link-/);
	});

	test('auto-rel _REF is preserved when the entity is nested into another collection', async () => {
		// Dept has Employee (1-n nesting), Employee supervises Employee (auto 1-n ref).
		// After auto-rel runs first, Employee has supervises_REF. When Dept embeds
		// Employee, the supervises_REF must travel along into the nested block.
		const dept = buildEntity('e1', 'Dept');
		const employee = buildEntity('e2', 'Employee');
		const empName = buildAttribute('a1', 'name');
		const relHas = buildRelationship('r1', 'has');
		const relSupervises = buildRelationship('r2', 'supervises');
		const linkDeptHas = buildLink('l1', dept.id, relHas.id, '(1, 1)');
		const linkEmpHas = buildLink('l2', employee.id, relHas.id, '(0, n)');
		const linkSup1 = buildLink('l3', employee.id, relSupervises.id, '(1, 1)');
		const linkSup2 = buildLink('l4', employee.id, relSupervises.id, '(1, n)');

		const graph = buildGraph(
			[dept, employee, empName, relHas, relSupervises],
			new Map([
				[dept, [relHas]],
				[employee, [empName, relHas, relSupervises]],
				[empName, [employee]],
				[relHas, [dept, employee]],
				[relSupervises, [employee]],
			]),
			new Map([
				[relHas, [linkDeptHas, linkEmpHas]],
				[relSupervises, [linkSup1, linkSup2]],
			])
		);

		const modal = {
			openRelation1N: jest.fn().mockResolvedValue({ value: 'nesting' }),
			openAutoRelation1N: jest.fn().mockResolvedValue({ value: 'reference' }),
		};
		const editor = buildNoSqlEditor();
		await new Conversor(editor, modal).toNoSql(graph);

		const deptCol = editor.insertedCollections.find(c => c.getName() === 'Dept');
		const block = deptCol.getRows().find(r => r.kind === 'block' && r.name === 'has');
		expect(block).toBeDefined();
		expect(block.children.some(c => c.kind === 'attribute' && c.name === 'name')).toBe(true);
		// The fix: the auto-rel reference travels along into the nested snapshot.
		expect(block.children.some(c => c.kind === 'reference' && c.name === 'supervises_REF')).toBe(true);
	});

	test('auto 1-n with reference adds a flat _REF with singular-side cardinality', async () => {
		// Employee supervises Employee. Each employee has 1 supervisor.
		const employee = buildEntity('e1', 'Employee');
		const rel = buildRelationship('r1', 'supervises');
		const link1 = buildLink('l1', employee.id, rel.id, '(1, 1)');
		const link2 = buildLink('l2', employee.id, rel.id, '(1, n)');
		const graph = buildGraph(
			[employee, rel],
			new Map([
				[employee, [rel]],
				[rel, [employee]],
			]),
			new Map([[rel, [link1, link2]]])
		);

		const modal = { openAutoRelation1N: jest.fn().mockResolvedValue({ value: 'reference' }) };
		const editor = buildNoSqlEditor();
		await new Conversor(editor, modal).toNoSql(graph);

		const empCol = editor.insertedCollections.find(c => c.getName() === 'Employee');
		const ref = empCol.getRows().find(r => r.kind === 'reference' && r.name === 'supervises_REF');
		expect(ref).toBeDefined();
		expect(ref.targetCollectionId).toBe(empCol.id);
		expect(ref.cardinalityEnabled).toBe(true);
		expect(ref.minCardinality).toBe(1);
		expect(ref.maxCardinality).toBe(1);
		// No wrapping block when the relation has no attributes.
		expect(empCol.getRows().some(r => r.kind === 'block' && r.name === 'supervises')).toBe(false);
	});

	test('auto n-n with reference adds a flat (0,n) _REF', async () => {
		const person = buildEntity('e1', 'Person');
		const rel = buildRelationship('r1', 'friends');
		const link1 = buildLink('l1', person.id, rel.id, '(0, n)');
		const link2 = buildLink('l2', person.id, rel.id, '(0, n)');
		const graph = buildGraph(
			[person, rel],
			new Map([[person, [rel]], [rel, [person]]]),
			new Map([[rel, [link1, link2]]])
		);

		const modal = { openAutoRelationNN: jest.fn().mockResolvedValue({ value: 'reference' }) };
		const editor = buildNoSqlEditor();
		await new Conversor(editor, modal).toNoSql(graph);

		const col = editor.insertedCollections.find(c => c.getName() === 'Person');
		const ref = col.getRows().find(r => r.kind === 'reference' && r.name === 'friends_REF');
		expect(ref).toBeDefined();
		expect(ref.cardinalityEnabled).toBe(true);
		expect(ref.minCardinality).toBe(0);
		expect(ref.maxCardinality).toBe('N');
	});

	test('auto 1-n with nesting uses the many-side cardinality on the block', async () => {
		// (0,1) <-> (0,n) auto: the embed direction is "many subordinates"
		// inside each supervisor, so block cardinality is (0,n).
		const employee = buildEntity('e1', 'Employee');
		const empName = buildAttribute('a1', 'name');
		const rel = buildRelationship('r1', 'supervises');
		const link1 = buildLink('l1', employee.id, rel.id, '(0, 1)');
		const link2 = buildLink('l2', employee.id, rel.id, '(0, n)');
		const graph = buildGraph(
			[employee, empName, rel],
			new Map([
				[employee, [empName, rel]],
				[empName, [employee]],
				[rel, [employee]],
			]),
			new Map([[rel, [link1, link2]]])
		);

		const modal = { openAutoRelation1N: jest.fn().mockResolvedValue({ value: 'nesting' }) };
		const editor = buildNoSqlEditor();
		await new Conversor(editor, modal).toNoSql(graph);

		const col = editor.insertedCollections.find(c => c.getName() === 'Employee');
		const block = col.getRows().find(r => r.kind === 'block' && r.name === 'supervises');
		expect(block).toBeDefined();
		expect(block.cardinalityEnabled).toBe(true);
		expect(block.minCardinality).toBe(0);
		expect(block.maxCardinality).toBe('N');
		expect(block.children.some(c => c.name === 'name')).toBe(true);
	});

	test('auto 1-1 with reference adds a flat (0,1) _REF respecting optionality', async () => {
		const person = buildEntity('e1', 'Person');
		const rel = buildRelationship('r1', 'married_to');
		const link1 = buildLink('l1', person.id, rel.id, '(0, 1)');
		const link2 = buildLink('l2', person.id, rel.id, '(0, 1)');
		const graph = buildGraph(
			[person, rel],
			new Map([[person, [rel]], [rel, [person]]]),
			new Map([[rel, [link1, link2]]])
		);

		const modal = { openAutoRelation11: jest.fn().mockResolvedValue({ value: 'reference' }) };
		const editor = buildNoSqlEditor();
		await new Conversor(editor, modal).toNoSql(graph);

		const col = editor.insertedCollections.find(c => c.getName() === 'Person');
		const ref = col.getRows().find(r => r.kind === 'reference' && r.name === 'married_to_REF');
		expect(ref).toBeDefined();
		expect(ref.cardinalityEnabled).toBe(true);
		expect(ref.minCardinality).toBe(0);
		expect(ref.maxCardinality).toBe(1);
		expect(col.getRows().some(r => r.kind === 'block' && r.name === 'married_to')).toBe(false);
	});

	test('m-n creates a block with _REF on the alphabetically-first collection', async () => {
		const obra = buildEntity('e1', 'Obra');
		const obraKey = buildKey('k1', 'idObra');
		const autor = buildEntity('e2', 'Autor');
		const autorKey = buildKey('k2', 'idAutor');
		const rel = buildRelationship('r1', 'autoria');
		const linkObra = buildLink('l1', obra.id, rel.id, '(0, n)');
		const linkAutor = buildLink('l2', autor.id, rel.id, '(1, n)');

		const graph = buildGraph(
			[obra, obraKey, autor, autorKey, rel],
			new Map([
				[obra, [obraKey, rel]],
				[obraKey, [obra]],
				[autor, [autorKey, rel]],
				[autorKey, [autor]],
				[rel, [obra, autor]],
			]),
			new Map([[rel, [linkObra, linkAutor]]])
		);

		const editor = buildNoSqlEditor();
		await new Conversor(editor, {}).toNoSql(graph);

		// Alphabetical first = Autor. Autor collection should host the block.
		const autorCol = editor.insertedCollections.find(c => c.getName() === 'Autor');
		const obraCol = editor.insertedCollections.find(c => c.getName() === 'Obra');
		const block = autorCol.getRows().find(r => r.kind === 'block' && r.name === 'autoria');
		expect(block).toBeDefined();
		expect(block.cardinalityEnabled).toBe(true);
		expect(block.maxCardinality).toBe('N');
		const ref = block.children.find(r => r.kind === 'reference');
		expect(ref).toBeDefined();
		expect(ref.targetCollectionId).toBe(obraCol.id);
	});
});
