import Column from "./Column";
import Validator from "../conceptual/validator";

export default class Conversor {
    constructor(logicEditor, conversionAttributeModal, conversionOptionModal) {
        this.modelGraph = null;
        this.logicEditor = logicEditor;
        this.entityTableMap = new Map();
        this.conversionAttributeModal = conversionAttributeModal;
        this.conversionOptionModal = conversionOptionModal;
        this.shapeValidator = new Validator();
    }

    async toLogic(conceptualGraph) {
        this.modelGraph = conceptualGraph;
        this.entityTableMap.clear();

        const cellTables = [];
        const cellRelations = [];
        const cellAssociatives = [];
        const cellExtensions = [];
        const allElements = this.modelGraph.attributes.cells.models;

        for (const element of allElements) {
            switch (element.attributes.type) {
                case 'erd.Entity':
                    cellTables.push(element);
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

        await this.buildTables(cellTables);
        await this.buildExtensions(cellExtensions);
        await this.buildRelations(cellRelations);
        await this.buildAssociatives(cellAssociatives);
        this.logicEditor.sortColumns();
    }

    // //////////////////////////////////////////////////////////////////
    // Table Building Methods
    // //////////////////////////////////////////////////////////////////

    async buildTables(tables) {
        for (const element of tables) {
            if (!element) continue;
            const { table: editedTable, pendingSubTables } = await this.buildTable(element);
            const newTable = await this.logicEditor.insertTable(editedTable);
            this.entityTableMap.set(element.id, newTable);

            // Parent entity is now registered in entityTableMap; safe to create
            // sub-tables for multivalued "new_table" attributes (their FK needs
            // the parent to be resolvable via createFKColumn).
            for (const { attribute, entityReference } of pendingSubTables) {
                await this.createTableFromAttribute(attribute, entityReference);
            }
        }
    }

    async buildTable(element) {
        const name = element.attributes.attrs.text.text;
        const { x, y } = element.attributes.position;
        const table = this.createTableObject(name, x, y);
        const neighbors = this.modelGraph.getNeighbors(element);
        return await this.buildAttributes(table, neighbors, element);
    }

    async buildAttributes(table, neighbors, entityReference) {
        const parents = new Map();
        const pendingSubTables = [];
        const attributes = neighbors.filter(
            neighbor => neighbor.attributes.type === 'erd.Attribute' || neighbor.attributes.type === 'erd.Key'
        );

        for (let i = 0; i < attributes.length; i++) {
            const attribute = attributes[i];
            if (!attribute) continue;

            const cardinality = attribute.attributes.cardinality;
            const isMultivalued = cardinality === "(0, n)" || cardinality === "(1, n)";

            // Composite detection: honor the explicit `composed` flag, but also
            // infer it from topology as a safety net for legacy models where
            // the flag was never set. Narrow rule: top-level composites only
            // (attribute directly attached to an entity AND having attribute
            // neighbors not yet visited). Nested composites still require the
            // flag. See #268.
            const neighborsOfAttribute = this.modelGraph.getNeighbors(attribute);
            const hasEntityNeighbor = neighborsOfAttribute
                .some(n => n.attributes.type === 'erd.Entity');
            const hasUnvisitedAttrNeighbor = neighborsOfAttribute
                .some(n => this.shapeValidator.isAttribute(n) && !parents.has(n.id));
            const isComposed = attribute.attributes.composed
                || (hasEntityNeighbor && hasUnvisitedAttrNeighbor);

            if (isComposed) {
                parents.set(attribute.id, attribute);
                for (const child of neighborsOfAttribute) {
                    if (this.shapeValidator.isAttribute(child) && !parents.has(child.id)) {
                        attributes.push(child);
                    }
                }
            } else if (isMultivalued) {
                const attName = attribute.attributes.attrs.text.text.replace(/ *\([^)]*\) */g, "");
                let modalResult;
                try {
                    modalResult = await this.conversionAttributeModal.open(attName, table.name);
                } catch {
                    continue;
                }
                if (!modalResult || !modalResult.value) continue;

                switch (modalResult.value) {
                    case "new_table":
                        // Defer: the parent table may not yet be registered in
                        // entityTableMap (we're still inside buildTable for it).
                        // Caller drains this list after registration.
                        pendingSubTables.push({ attribute, entityReference });
                        break;
                    case "new_column":
                        for (let index = 0; index < modalResult.quantity; index++) {
                            table.columns.push(new Column({
                                name: `${attName}${index}`,
                                PK: attribute.attributes.type === 'erd.Key',
                            }));
                        }
                        break;
                }
            } else {
                table.columns.push(new Column({
                    name: attribute.attributes.attrs.text.text,
                    PK: attribute.attributes.type === 'erd.Key'
                }));
            }
        }

        return { table, pendingSubTables };
    }

    // //////////////////////////////////////////////////////////////////
    // Extension (ISA/Inheritance) Methods
    // //////////////////////////////////////////////////////////////////

    async buildExtensions(extensions) {
        for (const extension of extensions) {
            const rootName = this.getExtensionRootName(extension);
            let response;
            try {
                response = await this.conversionOptionModal.openExtension(rootName);
            } catch {
                continue;
            }
            if (!response || !response.value) continue;

            switch (response.value) {
                case "all_tables":
                    await this.treatExtensionAll(extension);
                    break;
                case "one_table":
                    await this.treatExtensionOneTable(extension);
                    break;
                case "children_tables":
                    await this.treatExtensionChildrensOnly(extension);
                    break;
            }
        }
    }

    getExtensionRootName(extension) {
        const neighbors = this.getEntityNeighbors(extension);
        for (const neighbor of neighbors) {
            if (extension.attributes.parentId === neighbor.id) {
                return neighbor.attributes.attrs.text.text;
            }
        }
        return "";
    }

    async treatExtensionAll(extension) {
        const neighbors = this.getEntityNeighbors(extension);
        const root = neighbors.find(neighbor => extension.attributes.parentId === neighbor.id);
        const children = neighbors.filter(neighbor => extension.attributes.parentId !== neighbor.id);

        for (const child of children) {
            const childTable = this.entityTableMap.get(child.id);
            // Table-per-subclass inheritance: the child's primary key IS the
            // foreign key to the parent — it inherits the parent's PK. See #260.
            this.connectTablesByPKFK(root, childTable);
        }
    }

    async treatExtensionOneTable(extension) {
        await this.joinTablesFromRelation(extension);
    }

    async treatExtensionChildrensOnly(extension) {
        const neighbors = this.getEntityNeighbors(extension);
        const children = neighbors.filter(neighbor => extension.attributes.parentId !== neighbor.id);
        const root = neighbors.find(neighbor => extension.attributes.parentId === neighbor.id);

        if (this.getEntityOrRelationNeighbors(root).length > 0) {
            const rootName = this.getExtensionRootName(extension);
            let response;
            try {
                response = await this.conversionOptionModal.openExtensionRestricted(rootName);
            } catch {
                return;
            }
            if (!response || !response.value) return;

            switch (response.value) {
                case "all_tables":
                    await this.treatExtensionAll(extension);
                    break;
                case "one_table":
                    await this.treatExtensionOneTable(extension);
                    break;
            }
        } else {
            const rootTable = this.entityTableMap.get(root.id);

            // Copy columns to each child from the parent's already-built logical
            // rows rather than re-deriving from conceptual attributes. This
            // preserves earlier decisions made in buildAttributes: multivalued
            // "new_column" expansions (attName0..N-1), composite leaves, and
            // naturally excludes multivalued attributes that became sub-tables
            // (those did not add columns to the parent). FK metadata is also
            // propagated so an inherited FK from a higher-up all_tables ISA
            // keeps its reference on the child. See #312.
            for (const child of children) {
                const childTable = this.entityTableMap.get(child.id);
                this.logicEditor.selectedElement = this.logicEditor.paper.findViewByModel(childTable);
                for (const row of rootTable.attributes.rows) {
                    this.logicEditor.addColumn(
                        this.logicEditor.selectedElement,
                        new Column({
                            name: row.name,
                            PK: row.PK,
                            FK: row.FK,
                            type: row.type,
                            // Clone tableOrigin: addColumn mutates it (sets idLink
                            // to the new link) and we don't want to leak that
                            // back onto the parent's original row.
                            tableOrigin: row.tableOrigin ? { ...row.tableOrigin } : null,
                        }),
                    );
                }
            }

            // Multivalued attributes that became sub-tables FK back to the
            // (about-to-be-removed) parent; redirect them to the children.
            for (const attribute of this.findSubTableAttributes(root)) {
                await this.redistributeSubTable(attribute, children);
            }

            rootTable.remove();
        }
    }

    // //////////////////////////////////////////////////////////////////
    // Relationship Methods
    // //////////////////////////////////////////////////////////////////

    async buildRelations(relations) {
        for (const relation of relations) {
            const links = this.modelGraph.getConnectedLinks(relation);
            const relationType = this.getRelationType(links);

            if (relationType.quantity > 2) {
                await this.createTableFromRelation(relation, true);
            } else {
                switch (relationType.type) {
                    case "nn":
                        await this.treatNNcase(relation);
                        break;
                    case "1n":
                    case "n1":
                        await this.treatN1case(relation, links);
                        break;
                    case "11":
                        await this.treat11case(relation, links);
                        break;
                }
            }
        }
    }

    async treatNNcase(relation) {
        // N:N associative tables always need a composite PK made of all
        // participating FKs — this is fundamental to relational modeling
        // and independent of conceptual optionality. See #260.
        await this.createTableFromRelation(relation, true);
    }

    async treatN1case(relation, links) {
        if (this.isN1Optional(links)) {
            const relationDescription = this.buildRelationDescription(links);
            let response;
            try {
                if (this.isAutoRelationship(relation)) {
                    const entityName = this.getAutoRelationshipEntityName(relation);
                    response = await this.conversionOptionModal.openAutoRelation1N(entityName, relationDescription);
                } else {
                    const tableNames = this.getTableNames(relation);
                    response = await this.conversionOptionModal.openRelation1N(relationDescription, tableNames);
                }
            } catch {
                return;
            }
            if (!response || !response.value) return;

            switch (response.value) {
                case "new_table":
                    await this.createTableFrom1NRelation(relation, links);
                    break;
                case "new_column":
                    await this.createColumnFromRelation(relation, links);
                    break;
            }
        } else {
            await this.createColumnFromRelation(relation, links);
        }
    }

    async treat11case(relation, links) {
        // 1:1 conversions always produce a link whose FK-side multiplicity
        // is 1 (max 1), not n. The min-side (optionality) is preserved from
        // the FK-bearing side. See #262.
        const linkLabels11 = { source: "(1, 1)", target: "(0, 1)" };

        if (this.is01Optional(links)) {
            const relationDescription = this.buildRelationDescription(links);
            let response;
            try {
                if (this.isAutoRelationship(relation)) {
                    const entityName = this.getAutoRelationshipEntityName(relation);
                    response = await this.conversionOptionModal.openAutoRelation11(entityName, relationDescription);
                } else {
                    const tableNames = this.getTableNames(relation);
                    response = await this.conversionOptionModal.openRelation11(relationDescription, tableNames);
                }
            } catch {
                return;
            }
            if (!response || !response.value) return;

            switch (response.value) {
                case "new_column":
                    await this.createColumnFromRelation(relation, links, linkLabels11);
                    break;
                case "new_table":
                    await this.createTableFromRelation(relation, false);
                    break;
            }
        } else if (this.isAutoRelationship(relation)) {
            await this.createColumnFromRelation(relation, links, linkLabels11);
        } else {
            const relationDescription = this.buildRelationDescription(links);
            const tableNames = this.getTableNames(relation);
            let response;
            try {
                response = await this.conversionOptionModal.openRelation11Join(relationDescription, tableNames);
            } catch {
                return;
            }
            if (!response || !response.value) return;

            switch (response.value) {
                case "new_column":
                    await this.createColumnFromRelation(relation, links, linkLabels11);
                    break;
                case "join_tables":
                    await this.joinTablesFromRelation(relation);
                    break;
            }
        }
    }

    // //////////////////////////////////////////////////////////////////
    // Associative Entity Methods
    // //////////////////////////////////////////////////////////////////

    async buildAssociatives(associatives) {
        for (const element of associatives) {
            const newAttributes = [...this.getPKs(element), ...this.getAttributes(element)];
            const tableRelation = this.entityTableMap.get(element.embeds?.[0]);

            if (!tableRelation) continue;

            for (const attribute of newAttributes) {
                const column = new Column({
                    name: attribute.attributes.attrs.text.text,
                    PK: attribute.attributes.type === 'erd.Key',
                });
                tableRelation.addRow(column);
            }

            const relationTables = this.getEntityOrRelationNeighbors(element);
            for (const toConnect of relationTables) {
                this.connectTables(tableRelation, this.entityTableMap.get(toConnect.id));
            }
        }
    }

    // //////////////////////////////////////////////////////////////////
    // Table Creation Methods
    // //////////////////////////////////////////////////////////////////

    createTableObject(name, x, y) {
        return {
            name,
            columns: [],
            connectedTo: [],
            position: { x, y }
        };
    }

    async createTableFromAttribute(attribute, entityReference) {
        const name = attribute.attributes.attrs.text.text.replace(/ *\([^)]*\) */g, "");
        const x = attribute.attributes.position.x;
        const y = attribute.attributes.position.y - 100;
        const table = this.createTableObject(name, x, y);

        const column = new Column({
            name,
            PK: true,
            type: "VARCHAR",
        });
        table.columns.push(column);

        const newTable = await this.logicEditor.insertTable(table);
        this.entityTableMap.set(attribute.id, newTable);
        this.logicEditor.selectedElement = this.logicEditor.paper.findViewByModel(newTable);
        this.logicEditor.addColumn(this.logicEditor.selectedElement, this.createFKColumn(entityReference));
    }

    async createTableFromRelation(relation, allPKs) {
        const name = relation.attributes.attrs.text.text;
        const { x, y } = relation.attributes.position;
        const table = this.createTableObject(name, x, y);
        const neighbors = this.modelGraph.getNeighbors(relation);
        const { table: tableWithAttributes, pendingSubTables } =
            await this.buildAttributes(table, neighbors, relation);
        const newTable = await this.logicEditor.insertTable(tableWithAttributes);

        this.entityTableMap.set(relation.id, newTable);
        this.logicEditor.selectedElement = this.logicEditor.paper.findViewByModel(newTable);

        // Drain multivalued "new_table" attributes now that relation.id is registered.
        for (const { attribute, entityReference } of pendingSubTables) {
            await this.createTableFromAttribute(attribute, entityReference);
        }
        // createTableFromAttribute reassigns selectedElement; restore it so the
        // FK loop below adds columns to this relation's table.
        this.logicEditor.selectedElement = this.logicEditor.paper.findViewByModel(newTable);

        let hasPrimaryKey = false;
        const entityNeighbors = this.getEntityNeighbors(relation);

        for (const entity of entityNeighbors) {
            const column = this.createFKColumn(entity);
            if (!hasPrimaryKey) {
                column.PK = true;
                if (!allPKs) {
                    hasPrimaryKey = true;
                }
            }
            this.logicEditor.addColumn(this.logicEditor.selectedElement, column);
        }
    }

    async createTableFrom1NRelation(relation, links) {
        const name = relation.attributes.attrs.text.text;
        const { x, y } = relation.attributes.position;
        const table = this.createTableObject(name, x, y);
        const neighbors = this.modelGraph.getNeighbors(relation);

        const { table: tableWithAttributes, pendingSubTables } =
            await this.buildAttributes(table, neighbors, relation);
        const newTable = await this.logicEditor.insertTable(tableWithAttributes);

        this.entityTableMap.set(relation.id, newTable);
        this.logicEditor.selectedElement = this.logicEditor.paper.findViewByModel(newTable);

        // Drain multivalued "new_table" attributes now that relation.id is registered.
        for (const { attribute, entityReference } of pendingSubTables) {
            await this.createTableFromAttribute(attribute, entityReference);
        }
        // createTableFromAttribute reassigns selectedElement; restore it so the
        // FK loop below adds columns to this relation's table.
        this.logicEditor.selectedElement = this.logicEditor.paper.findViewByModel(newTable);

        const entityNeighbors = this.getEntityNeighbors(relation);
        let sideN = null;

        for (const link of this.filterConnections(links)) {
            if (link.attributes.labels[0].attrs.text.text[4] === 'n') {
                sideN = link;
            }
        }

        for (const entity of entityNeighbors) {
            const column = this.createFKColumn(entity);
            if (sideN && (entity.id === sideN.attributes.source.id || entity.id === sideN.attributes.target.id)) {
                column.PK = true;
            }
            this.logicEditor.addColumn(this.logicEditor.selectedElement, column);
        }
    }

    async createColumnFromRelation(relation, links, linkLabels) {
        const attributes = this.getAttributes(relation);
        const pks = this.getPKs(relation);
        const filteredLinks = this.filterConnections(links);
        const table2 = this.getTableType_2(filteredLinks, relation);

        this.logicEditor.selectedElement = this.logicEditor.paper.findViewByModel(table2);

        const elements = [...attributes, ...pks];
        for (const element of elements) {
            const column = new Column({
                name: element.attributes.attrs.text.text,
                PK: element.attributes.supertype === "Key",
            });
            this.logicEditor.addColumn(this.logicEditor.selectedElement, column);
        }

        const table1 = this.getTableType_1(filteredLinks, relation);
        this.entityTableMap.set(relation.id, table1);
        this.connectTables(table1, table2, linkLabels);
    }

    connectTables(source, target, linkLabels) {
        const column = new Column({
            name: "id" + source.attributes.name,
            FK: true,
            idOrigin: source.id,
            tableOrigin: { idOrigin: source.id, idLink: null, idName: source.attributes.name }
        });
        this.logicEditor.selectedElement = this.logicEditor.paper.findViewByModel(target);
        this.logicEditor.addColumn(this.logicEditor.selectedElement, column, linkLabels);
    }

    // Variant of connectTables for inheritance (ISA "all_tables"): the FK
    // column added to the child table is ALSO the child's primary key, using
    // the parent's PK name via createPKFKColumn. Takes the parent conceptual
    // entity (to resolve the PK name) and the child logical table.
    connectTablesByPKFK(parentEntity, targetTable) {
        const column = this.createPKFKColumn(parentEntity);
        this.logicEditor.addColumnToTable(targetTable, column);
    }

    async joinTablesFromRelation(relation) {
        const { x, y } = relation.attributes.position;
        const entities = this.getEntityNeighbors(relation);

        const columns = [];
        for (const entity of entities) {
            const entityTable = this.entityTableMap.get(entity.id);
            if (!entityTable) continue;
            columns.push(...entityTable.attributes.rows);
        }

        const newName = entities.reduce((data, entity) => {
            const entityName = entity.attributes.attrs.text.text;
            return data === "" ? entityName : `${data}_${entityName}`;
        }, "");

        const table = this.createTableObject(newName, x, y);
        columns.forEach(column => {
            table.columns.push(column);
        });
        
        const newTable = await this.logicEditor.insertTable(table);

        this.entityTableMap.set(relation.id, newTable);
        this.logicEditor.selectedElement = this.logicEditor.paper.findViewByModel(newTable);

        const oldEntityTables = entities.map(entity => this.entityTableMap.get(entity.id));

        // Remap entity ids to the merged table so redistributeSubTable (via
        // createFKColumn) resolves each entity to the merge.
        for (const entity of entities) {
            this.entityTableMap.set(entity.id, newTable);
        }

        // Redistribute multivalued sub-tables BEFORE removing the original
        // entity tables. Removing the parents first would cascade through the
        // graph's link-removal listener (logicEditor.removeLinkColumn), which
        // invokes deleteColumn → updateSize → requestAnimationFrame on the
        // sub-table. The rAF then fires after we would have removed the
        // sub-table and crashes on a null graph.
        for (const entity of entities) {
            for (const attribute of this.findSubTableAttributes(entity)) {
                await this.redistributeSubTable(attribute, [entity]);
            }
        }

        for (const oldTable of oldEntityTables) {
            oldTable.remove();
        }

        const fks = columns.filter(column => column.FK && column.tableOrigin?.idOrigin);
        fks.forEach(fk => {
            this.logicEditor.createLink(newTable.id, fk.tableOrigin.idOrigin);
        });
    }

    // Conceptual attributes or keys of `entity` materialized as sub-tables
    // during buildAttributes (multivalued "new_table"). buildAttributes
    // accepts both erd.Attribute and erd.Key, so both must be scanned.
    // Recognized by the id being registered in entityTableMap via
    // createTableFromAttribute.
    findSubTableAttributes(entity) {
        return [...this.getAttributes(entity), ...this.getPKs(entity)]
            .filter(attr => this.entityTableMap.has(attr.id));
    }

    // Remove a sub-table (its FK references a table being removed) and
    // recreate it with one FK per target entity. For ISA children_tables
    // with N children, the sub-table stays single and gets N FK columns —
    // with (t, d) disjoint semantics, exactly one FK is populated per row.
    async redistributeSubTable(attribute, targetEntities) {
        this.entityTableMap.get(attribute.id).remove();
        this.entityTableMap.delete(attribute.id);

        const [first, ...rest] = targetEntities;
        await this.createTableFromAttribute(attribute, first);

        // createTableFromAttribute left selectedElement on the new sub-table.
        for (const entity of rest) {
            this.logicEditor.addColumn(
                this.logicEditor.selectedElement,
                this.createFKColumn(entity),
            );
        }
    }

    createFKColumn(entity) {
        const pks = this.getPKs(entity);
        let attName = "id" + entity.attributes.attrs.text.text;

        if (pks.length > 0) {
            attName = pks[0].attributes.attrs.text.text;
        }

        const tableEntry = this.entityTableMap.get(entity.id);
        if (!tableEntry) {
            throw new Error(`Entity "${entity.attributes.attrs.text.text}" not found in table map`);
        }

        const originId = tableEntry.id;
        return new Column({
            name: attName,
            FK: true,
            idOrigin: originId,
            tableOrigin: { idOrigin: originId, idLink: null, idName: entity.attributes.attrs.text.text }
        });
    }

    // Returns a Column that is both PK and FK — used for table-per-subclass
    // inheritance, where the child's primary key IS the foreign key to the
    // parent. Builds on createFKColumn so naming stays consistent with the
    // rest of the conversion code.
    //
    // createFKColumn derives the name from the conceptual entity's erd.Key
    // neighbors. For entities that inherit their PK via ISA (no erd.Key of
    // their own), createFKColumn falls back to "id<EntityName>". Override
    // with the parent logical table's actual PK column name when available,
    // so the inherited PK propagates down the chain. See #260.
    createPKFKColumn(entity) {
        const column = this.createFKColumn(entity);
        column.PK = true;

        const tableEntry = this.entityTableMap.get(entity.id);
        if (tableEntry) {
            const pkRow = tableEntry.attributes.rows.find(r => r.PK);
            if (pkRow) {
                column.name = pkRow.name;
            }
        }

        return column;
    }

    // //////////////////////////////////////////////////////////////////
    // Helper Methods
    // //////////////////////////////////////////////////////////////////

    getRelationType(links) {
        const relationType = { type: "", quantity: 0 };
        const connections = this.filterConnections(links);

        for (const link of connections) {
            if (link.attributes.labels) {
                const card = link.attributes.labels[0].attrs.text.text;
                relationType.type = relationType.type + card[4];
                relationType.quantity += 1;
            }
        }
        return relationType;
    }

    isN1Optional(links) {
        for (const link of this.filterConnections(links)) {
            if (link.attributes.labels && link.attributes.labels[0].attrs.text.text === '(0, 1)') {
                return true;
            }
        }
        return false;
    }

    is01Optional(links) {
        const connections = this.filterConnections(links);
        if (connections.length < 2) return false;
        return connections[0].attributes.labels[0].attrs.text.text === '(0, 1)' &&
               connections[1].attributes.labels[0].attrs.text.text === '(0, 1)';
    }

    buildRelationDescription(links) {
        const connections = this.filterConnections(links);
        if (connections.length < 2) return "";
        return connections[0].attributes.labels[0].attrs.text.text + " < - > " +
               connections[1].attributes.labels[0].attrs.text.text;
    }

    getTableNames(relation) {
        let tableNames = "(";
        for (const element of this.modelGraph.getNeighbors(relation)) {
            if (element.attributes.type === 'erd.Entity') {
                tableNames += " " + element.attributes.attrs.text.text;
            }
        }
        tableNames += " )";
        return tableNames;
    }

    isAutoRelationship(relation) {
        // Topological check: a relationship with exactly one entity neighbor
        // is an auto-relationship (both of its links point to the same
        // entity). getNeighbors returns unique elements, so a 2-link self
        // connection still yields a single entity.
        const entities = this.modelGraph.getNeighbors(relation)
            .filter(element => element.attributes.type === 'erd.Entity');
        return entities.length === 1;
    }

    getAutoRelationshipEntityName(relation) {
        const entity = this.modelGraph.getNeighbors(relation)
            .find(element => element.attributes.type === 'erd.Entity');
        return entity ? entity.attributes.attrs.text.text : '';
    }

    getAttributes(relation) {
        return this.modelGraph.getNeighbors(relation)
            .filter(element => element.attributes.type === 'erd.Attribute');
    }

    getEntityNeighbors(relation) {
        return this.modelGraph.getNeighbors(relation)
            .filter(element => element.attributes.type === 'erd.Entity');
    }

    getEntityOrRelationNeighbors(relation) {
        return this.modelGraph.getNeighbors(relation)
            .filter(element =>
                element.attributes.type === 'erd.Entity' ||
                element.attributes.type === 'erd.Relationship'
            );
    }

    getPKs(relation) {
        return this.modelGraph.getNeighbors(relation)
            .filter(element => element.attributes.type === 'erd.Key');
    }

    getTableType_1(links, relation) {
        if (links.length < 1) return null;
        let link = links[0];
        const card = link.attributes.labels[0].attrs.text.text;

        if (card !== "(1, 1)" && card !== "(0, 1)") {
            link = links[1] ?? links[0];
        } else if (this.isMixedOptionalityOneToOne(links)) {
            link = this.findFKReferencedLink(links);
        }

        return this.getEntityTableFromLink(link, relation);
    }

    getTableType_2(links, relation) {
        if (links.length < 1) return null;
        let link = links[0];
        const card = link.attributes.labels[0].attrs.text.text;

        if (card === "(1, 1)" || card === "(0, 1)") {
            if (this.isMixedOptionalityOneToOne(links)) {
                link = this.findFKReceiverLink(links);
            } else {
                link = links[1] ?? links[0];
            }
        }

        return this.getEntityTableFromLink(link, relation);
    }

    isMixedOptionalityOneToOne(links) {
        if (links.length < 2) return false;
        const card1 = links[0].attributes.labels[0].attrs.text.text;
        const card2 = links[1].attributes.labels[0].attrs.text.text;
        return (card1 === "(0, 1)" && card2 === "(1, 1)") ||
               (card1 === "(1, 1)" && card2 === "(0, 1)");
    }

    // In look-here notation, the (0,1) entity always has a match to the
    // other side, so placing the FK there avoids nullable columns.
    findFKReceiverLink(links) {
        return links.find(l => l.attributes.labels[0].attrs.text.text === "(0, 1)") ?? links[0];
    }

    // The (1,1) entity is guaranteed to exist for every instance of the
    // (0,1) entity — it's the one referenced by the FK.
    findFKReferencedLink(links) {
        return links.find(l => l.attributes.labels[0].attrs.text.text === "(1, 1)") ?? links[0];
    }

    getEntityTableFromLink(link, relation) {
        if (link.attributes.source.id !== relation.id) {
            return this.entityTableMap.get(link.attributes.source.id);
        }
        return this.entityTableMap.get(link.attributes.target.id);
    }

    filterConnections(links) {
        return links.filter(link => {
            if (link.attributes.type === "erd.Line") {
                return true;
            }
            if ((link.attributes.type === "link" || link.attributes.type === "erd.Link") &&
                link.attributes.labels &&
                link.attributes.labels[0] &&
                link.attributes.labels[0].attrs &&
                link.attributes.labels[0].attrs.text &&
                link.attributes.labels[0].attrs.text.text) {
                const type = link.attributes.labels[0].attrs.text.text;
                return type === "(0, n)" || type === "(0, 1)" || type === "(1, 1)" || type === "(1, n)";
            }
            return false;
        });
    }
}
