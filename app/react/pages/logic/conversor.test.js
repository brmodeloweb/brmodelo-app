import Conversor from "./conversor";

// Minimal hand-rolled fakes: we bypass JointJS entirely. Conversor only touches
// logicEditor / modals / modelGraph via a narrow interface, so duck-typed mocks
// are enough to exercise the conversion logic end-to-end.

function buildLogicEditor() {
    const insertedTables = [];
    const addColumnCalls = [];
    const logicEditor = {
        insertedTables,
        addColumnCalls,
        insertTable: jest.fn(async (table) => {
            const fake = {
                id: `fake-${insertedTables.length}`,
                attributes: {
                    name: table.name,
                    rows: [...table.columns],
                },
                addRow(col) { this.attributes.rows.push(col); },
                remove() {},
            };
            insertedTables.push(fake);
            return fake;
        }),
        paper: {
            findViewByModel: (model) => ({ model, updateSize() {} }),
        },
        addColumn: jest.fn(function (sel, col, linkLabels) {
            sel.model.addRow(col);
            addColumnCalls.push({ target: sel.model, column: col, linkLabels });
        }),
        addColumnToTable: jest.fn(function (table, col, linkLabels) {
            // Mirror the real logicEditor wrapper: resolve the view and
            // delegate to addColumn so both call sites share tracking.
            const view = this.paper.findViewByModel(table);
            this.addColumn(view, col, linkLabels);
        }),
        createLink: jest.fn(),
        sortColumns: jest.fn(),
        selectedElement: null,
    };
    return logicEditor;
}

function buildEntity(id, name, { x = 0, y = 0 } = {}) {
    return {
        id,
        attributes: {
            type: 'erd.Entity',
            supertype: 'Entity',
            attrs: { text: { text: name } },
            position: { x, y },
        },
    };
}

function buildAttribute(id, name, { multivalued = false, composed = false, x = 0, y = 0 } = {}) {
    return {
        id,
        attributes: {
            type: 'erd.Attribute',
            supertype: 'Attribute',
            cardinality: multivalued ? '(1, n)' : '(0, 1)',
            composed,
            attrs: { text: { text: name } },
            position: { x, y },
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

function buildKey(id, name, { multivalued = false } = {}) {
    return {
        id,
        attributes: {
            type: 'erd.Key',
            supertype: 'Key',
            cardinality: multivalued ? '(1, n)' : '(1, 1)',
            composed: false,
            attrs: { text: { text: name } },
            position: { x: 0, y: 0 },
        },
    };
}

function buildCardinalityLine(id, sourceId, targetId, cardinality) {
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

function buildExtension(id, parentId) {
    return {
        id,
        attributes: {
            type: 'erd.ISA',
            supertype: 'Inheritance',
            parentId,
            attrs: { text: { text: '' } },
            position: { x: 0, y: 0 },
        },
    };
}

describe("Conversor — multivalued attribute with 'new_table' option (#266)", () => {
    let logicEditor, conversionAttributeModal, conversor;
    let entity, multiAttr, graph;

    beforeEach(() => {
        logicEditor = buildLogicEditor();
        conversionAttributeModal = {
            open: jest.fn().mockResolvedValue({ value: 'new_table', quantity: 1 }),
        };
        conversor = new Conversor(logicEditor, conversionAttributeModal, {});

        entity = buildEntity('entity-1', 'Restaurador', { x: 100, y: 100 });
        multiAttr = buildAttribute('attr-1', 'fones', { multivalued: true, x: 200, y: 200 });
        graph = buildGraph(
            [entity, multiAttr],
            new Map([
                [entity, [multiAttr]],
                [multiAttr, []],
            ])
        );
    });

    test("does not throw (regression test for #266)", async () => {
        await expect(conversor.toLogic(graph)).resolves.not.toThrow();
    });

    test("creates the entity table and the attribute sub-table", async () => {
        await conversor.toLogic(graph);
        expect(logicEditor.insertedTables).toHaveLength(2);
        expect(logicEditor.insertedTables[0].attributes.name).toBe("Restaurador");
        expect(logicEditor.insertedTables[1].attributes.name).toBe("fones");
    });

    test("sub-table receives an FK column pointing back to parent entity", async () => {
        await conversor.toLogic(graph);
        const parentTable = logicEditor.insertedTables[0];
        const subTable = logicEditor.insertedTables[1];

        const fkCall = logicEditor.addColumnCalls.find(
            ({ target, column }) => target === subTable && column.FK === true
        );
        expect(fkCall).toBeDefined();
        expect(fkCall.column.tableOrigin.idOrigin).toBe(parentTable.id);
        expect(fkCall.column.tableOrigin.idName).toBe("Restaurador");
    });

    test("entityTableMap registers both the entity and the attribute sub-table", async () => {
        await conversor.toLogic(graph);
        expect(conversor.entityTableMap.get('entity-1'))
            .toBe(logicEditor.insertedTables[0]);
        expect(conversor.entityTableMap.get('attr-1'))
            .toBe(logicEditor.insertedTables[1]);
    });

    test("modal is queried with the attribute and parent entity names", async () => {
        await conversor.toLogic(graph);
        expect(conversionAttributeModal.open).toHaveBeenCalledWith('fones', 'Restaurador');
    });

    test("handles multiple multivalued attributes with 'new_table' on the same entity", async () => {
        const secondMulti = buildAttribute('attr-2', 'emails', { multivalued: true });
        const graph2 = buildGraph(
            [entity, multiAttr, secondMulti],
            new Map([
                [entity, [multiAttr, secondMulti]],
                [multiAttr, []],
                [secondMulti, []],
            ])
        );

        await expect(conversor.toLogic(graph2)).resolves.not.toThrow();
        expect(logicEditor.insertedTables).toHaveLength(3);
        expect(logicEditor.insertedTables.map(t => t.attributes.name))
            .toEqual(['Restaurador', 'fones', 'emails']);
    });
});

describe("Conversor — other multivalued paths still work after refactor", () => {
    let logicEditor, conversor;
    let entity, multiAttr;

    beforeEach(() => {
        logicEditor = buildLogicEditor();
        entity = buildEntity('entity-1', 'Restaurador');
        multiAttr = buildAttribute('attr-1', 'fones', { multivalued: true });
    });

    test("'new_column' option produces N columns on the entity table, no sub-table", async () => {
        const modal = {
            open: jest.fn().mockResolvedValue({ value: 'new_column', quantity: 3 }),
        };
        conversor = new Conversor(logicEditor, modal, {});
        const graph = buildGraph(
            [entity, multiAttr],
            new Map([[entity, [multiAttr]], [multiAttr, []]])
        );

        await conversor.toLogic(graph);

        expect(logicEditor.insertedTables).toHaveLength(1);
        const inserted = logicEditor.insertedTables[0];
        expect(inserted.attributes.name).toBe('Restaurador');
        const names = inserted.attributes.rows.map(c => c.name);
        expect(names).toEqual(['fones0', 'fones1', 'fones2']);
    });

    test("simple (non-multivalued) attribute becomes a regular column", async () => {
        const simpleAttr = buildAttribute('attr-1', 'nome');
        const modal = { open: jest.fn() };
        conversor = new Conversor(logicEditor, modal, {});
        const graph = buildGraph(
            [entity, simpleAttr],
            new Map([[entity, [simpleAttr]], [simpleAttr, [entity]]])
        );

        await conversor.toLogic(graph);

        expect(modal.open).not.toHaveBeenCalled();
        expect(logicEditor.insertedTables).toHaveLength(1);
        const names = logicEditor.insertedTables[0].attributes.rows.map(c => c.name);
        expect(names).toEqual(['nome']);
    });
});

describe("Conversor — composite attribute decomposition (#268)", () => {
    let logicEditor, conversor;

    beforeEach(() => {
        logicEditor = buildLogicEditor();
        conversor = new Conversor(logicEditor, { open: jest.fn() }, {});
    });

    test("legacy composite (composed flag not set) is inferred from topology", async () => {
        const entity = buildEntity('entity-1', 'Pessoa');
        const composite = buildAttribute('attr-1', 'endereco', { composed: false });
        const child1 = buildAttribute('attr-2', 'rua', { composed: false });
        const child2 = buildAttribute('attr-3', 'numero', { composed: false });
        const graph = buildGraph(
            [entity, composite, child1, child2],
            new Map([
                [entity, [composite]],
                [composite, [entity, child1, child2]],
                [child1, [composite]],
                [child2, [composite]],
            ])
        );

        await conversor.toLogic(graph);

        expect(logicEditor.insertedTables).toHaveLength(1);
        const pessoa = logicEditor.insertedTables[0];
        const columnNames = pessoa.attributes.rows.map(c => c.name);
        expect(columnNames).toEqual(['rua', 'numero']);
        // The composite parent itself must NOT be a column.
        expect(columnNames).not.toContain('endereco');
    });

    test("flagged composite (composed: true) still works", async () => {
        const entity = buildEntity('entity-1', 'Pessoa');
        const composite = buildAttribute('attr-1', 'endereco', { composed: true });
        const child1 = buildAttribute('attr-2', 'rua');
        const graph = buildGraph(
            [entity, composite, child1],
            new Map([
                [entity, [composite]],
                [composite, [entity, child1]],
                [child1, [composite]],
            ])
        );

        await conversor.toLogic(graph);

        const pessoa = logicEditor.insertedTables[0];
        expect(pessoa.attributes.rows.map(c => c.name)).toEqual(['rua']);
    });

    test("composite with mixed simple and composite children", async () => {
        const entity = buildEntity('entity-1', 'Pessoa');
        const composite = buildAttribute('attr-1', 'endereco');
        const rua = buildAttribute('attr-2', 'rua');
        const numero = buildAttribute('attr-3', 'numero');
        const cidade = buildAttribute('attr-4', 'cidade');
        const graph = buildGraph(
            [entity, composite, rua, numero, cidade],
            new Map([
                [entity, [composite]],
                [composite, [entity, rua, numero, cidade]],
                [rua, [composite]],
                [numero, [composite]],
                [cidade, [composite]],
            ])
        );

        await conversor.toLogic(graph);

        const pessoa = logicEditor.insertedTables[0];
        expect(pessoa.attributes.rows.map(c => c.name)).toEqual(['rua', 'numero', 'cidade']);
    });
});

describe("Conversor — N:N relationship composite PK (#260 part 1)", () => {
    let logicEditor, conversor;

    beforeEach(() => {
        logicEditor = buildLogicEditor();
        conversor = new Conversor(logicEditor, { open: jest.fn() }, { open: jest.fn() });
    });

    function buildNNScenario(leftCard, rightCard) {
        // Two entities, each with a PK, connected by an N:N relationship.
        // Mirrors the "Obra — autoria — Autor" case from the issue model.
        const left = buildEntity('entity-left', 'Obra');
        const leftPK = buildKey('key-left', 'codigo_obra');
        const right = buildEntity('entity-right', 'Autor');
        const rightPK = buildKey('key-right', 'codigo_autor');
        const rel = buildRelationship('rel-1', 'autoria');

        const linkLeft = buildCardinalityLine('line-left', left.id, rel.id, leftCard);
        const linkRight = buildCardinalityLine('line-right', right.id, rel.id, rightCard);

        const graph = buildGraph(
            [left, leftPK, right, rightPK, rel],
            new Map([
                [left, [leftPK]],
                [leftPK, [left]],
                [right, [rightPK]],
                [rightPK, [right]],
                [rel, [left, right]],
            ]),
            new Map([
                [rel, [linkLeft, linkRight]],
            ])
        );

        return { graph, left, right, rel };
    }

    test("both FKs become PK when cardinalities are (0, n) and (1, n) (mixed optionality)", async () => {
        const { graph, rel } = buildNNScenario("(0, n)", "(1, n)");

        await conversor.toLogic(graph);

        // Tables: Obra, Autor, and the new associative table "autoria"
        expect(logicEditor.insertedTables).toHaveLength(3);
        const autoriaTable = logicEditor.insertedTables.find(
            t => t.attributes.name === 'autoria'
        );
        expect(autoriaTable).toBeDefined();

        // The two FK columns added to the associative table must both be PK.
        const fkCalls = logicEditor.addColumnCalls.filter(
            ({ target, column }) => target === autoriaTable && column.FK === true
        );
        expect(fkCalls).toHaveLength(2);
        expect(fkCalls.every(({ column }) => column.PK === true)).toBe(true);
    });

    test("both FKs become PK when both sides are (1, n) (mandatory)", async () => {
        const { graph } = buildNNScenario("(1, n)", "(1, n)");

        await conversor.toLogic(graph);

        const autoriaTable = logicEditor.insertedTables.find(
            t => t.attributes.name === 'autoria'
        );
        const fkCalls = logicEditor.addColumnCalls.filter(
            ({ target, column }) => target === autoriaTable && column.FK === true
        );
        expect(fkCalls).toHaveLength(2);
        expect(fkCalls.every(({ column }) => column.PK === true)).toBe(true);
    });

    test("both FKs become PK when both sides are (0, n) (optional)", async () => {
        const { graph } = buildNNScenario("(0, n)", "(0, n)");

        await conversor.toLogic(graph);

        const autoriaTable = logicEditor.insertedTables.find(
            t => t.attributes.name === 'autoria'
        );
        const fkCalls = logicEditor.addColumnCalls.filter(
            ({ target, column }) => target === autoriaTable && column.FK === true
        );
        expect(fkCalls).toHaveLength(2);
        expect(fkCalls.every(({ column }) => column.PK === true)).toBe(true);
    });
});

describe("Conversor — ISA all_tables PK inheritance (#260 part 2)", () => {
    let logicEditor, conversionOptionModal, conversor;

    beforeEach(() => {
        logicEditor = buildLogicEditor();
        conversionOptionModal = {
            openExtension: jest.fn().mockResolvedValue({ value: 'all_tables' }),
            openExtensionRestricted: jest.fn(),
        };
        conversor = new Conversor(logicEditor, { open: jest.fn() }, conversionOptionModal);
    });

    function buildIsaScenario() {
        // Mirrors "Obra — (Pintura, Escultura)" specialization from issue #260.
        const parent = buildEntity('entity-parent', 'Obra');
        const parentPK = buildKey('key-parent', 'codigo');
        const child1 = buildEntity('entity-child1', 'Pintura');
        const child2 = buildEntity('entity-child2', 'Escultura');
        const isa = buildExtension('isa-1', parent.id);

        const graph = buildGraph(
            [parent, parentPK, child1, child2, isa],
            new Map([
                [parent, [parentPK]],
                [parentPK, [parent]],
                [child1, []],
                [child2, []],
                [isa, [parent, child1, child2]],
            ])
        );

        return { graph, parent, child1, child2 };
    }

    test("child tables inherit parent PK as PK + FK (regression for #260 part 2)", async () => {
        const { graph } = buildIsaScenario();

        await conversor.toLogic(graph);

        // 3 tables inserted: Obra, Pintura, Escultura
        expect(logicEditor.insertedTables).toHaveLength(3);
        const obra = logicEditor.insertedTables.find(t => t.attributes.name === 'Obra');
        const pintura = logicEditor.insertedTables.find(t => t.attributes.name === 'Pintura');
        const escultura = logicEditor.insertedTables.find(t => t.attributes.name === 'Escultura');
        expect(obra).toBeDefined();
        expect(pintura).toBeDefined();
        expect(escultura).toBeDefined();

        // Each child must have received an inherited FK column that is ALSO a PK.
        for (const childTable of [pintura, escultura]) {
            const inheritedCalls = logicEditor.addColumnCalls.filter(
                ({ target }) => target === childTable
            );
            expect(inheritedCalls).toHaveLength(1);
            const { column } = inheritedCalls[0];
            expect(column.FK).toBe(true);
            expect(column.PK).toBe(true);
            // Uses the parent's actual PK name (codigo), not a generic "idObra".
            expect(column.name).toBe('codigo');
            expect(column.tableOrigin.idOrigin).toBe(obra.id);
            expect(column.tableOrigin.idName).toBe('Obra');
        }
    });

    test("falls back to 'id<ParentName>' when parent has no explicit PK attribute", async () => {
        // Nested-inheritance edge case: a child entity that itself becomes a
        // parent of another ISA has no erd.Key neighbor — createFKColumn should
        // then fall back to the "id<ParentName>" convention.
        const parent = buildEntity('entity-parent', 'Escultura');
        const child = buildEntity('entity-child', 'Pedra');
        const isa = buildExtension('isa-1', parent.id);

        const graph = buildGraph(
            [parent, child, isa],
            new Map([
                [parent, []],
                [child, []],
                [isa, [parent, child]],
            ])
        );

        await conversor.toLogic(graph);

        const pedra = logicEditor.insertedTables.find(t => t.attributes.name === 'Pedra');
        const fkCalls = logicEditor.addColumnCalls.filter(({ target }) => target === pedra);
        expect(fkCalls).toHaveLength(1);
        expect(fkCalls[0].column.PK).toBe(true);
        expect(fkCalls[0].column.FK).toBe(true);
        expect(fkCalls[0].column.name).toBe('idEscultura');
    });

    test("handles a single-child specialization", async () => {
        const parent = buildEntity('entity-parent', 'Obra');
        const parentPK = buildKey('key-parent', 'codigo');
        const child = buildEntity('entity-child', 'Pintura');
        const isa = buildExtension('isa-1', parent.id);

        const graph = buildGraph(
            [parent, parentPK, child, isa],
            new Map([
                [parent, [parentPK]],
                [parentPK, [parent]],
                [child, []],
                [isa, [parent, child]],
            ])
        );

        await conversor.toLogic(graph);

        const pintura = logicEditor.insertedTables.find(t => t.attributes.name === 'Pintura');
        const fkCalls = logicEditor.addColumnCalls.filter(({ target }) => target === pintura);
        expect(fkCalls).toHaveLength(1);
        expect(fkCalls[0].column.PK).toBe(true);
        expect(fkCalls[0].column.FK).toBe(true);
        expect(fkCalls[0].column.name).toBe('codigo');
    });

    test("nested ISA: grandchild inherits PK name from grandparent through the chain", async () => {
        // Obra (PK: codigo) → Escultura → Pedra
        // Escultura has no erd.Key of its own — its PK is inherited from Obra.
        // Pedra should get 'codigo' (not 'idEscultura') as its PK/FK.
        const obra = buildEntity('entity-obra', 'Obra');
        const obraPK = buildKey('key-obra', 'codigo');
        const escultura = buildEntity('entity-escultura', 'Escultura');
        const pedra = buildEntity('entity-pedra', 'Pedra');
        const isa1 = buildExtension('isa-1', obra.id);
        const isa2 = buildExtension('isa-2', escultura.id);

        const graph = buildGraph(
            [obra, obraPK, escultura, pedra, isa1, isa2],
            new Map([
                [obra, [obraPK]],
                [obraPK, [obra]],
                [escultura, []],
                [pedra, []],
                [isa1, [obra, escultura]],
                [isa2, [escultura, pedra]],
            ])
        );

        await conversor.toLogic(graph);

        const obraTable = logicEditor.insertedTables.find(t => t.attributes.name === 'Obra');
        const pedraTable = logicEditor.insertedTables.find(t => t.attributes.name === 'Pedra');

        const pedraCalls = logicEditor.addColumnCalls.filter(({ target }) => target === pedraTable);
        expect(pedraCalls).toHaveLength(1);
        expect(pedraCalls[0].column.PK).toBe(true);
        expect(pedraCalls[0].column.FK).toBe(true);
        // PK name propagates from Obra through Escultura, not "idEscultura".
        expect(pedraCalls[0].column.name).toBe('codigo');
    });
});

describe("Conversor — 1:1 mixed optionality FK placement (#261)", () => {
    let logicEditor, conversionOptionModal, conversor;

    beforeEach(() => {
        logicEditor = buildLogicEditor();
        conversionOptionModal = {
            openRelation11Join: jest.fn().mockResolvedValue({ value: 'new_column' }),
        };
        conversor = new Conversor(logicEditor, { open: jest.fn() }, conversionOptionModal);
    });

    function build11Scenario(linksOrder) {
        // Mirrors "salao (1,1) — responsavel — (0,1) zelador" from issue #261.
        const salao = buildEntity('entity-salao', 'salao');
        const salaoPK = buildKey('key-salao', 'numero');
        const zelador = buildEntity('entity-zelador', 'zelador');
        const zeladorPK = buildKey('key-zelador', 'cpf');
        const rel = buildRelationship('rel-1', 'responsavel');

        const linkSalao = buildCardinalityLine('line-salao', salao.id, rel.id, '(1, 1)');
        const linkZelador = buildCardinalityLine('line-zelador', zelador.id, rel.id, '(0, 1)');

        // linksOrder controls which link comes first — the bug was that
        // result depended on this ordering.
        const orderedLinks = linksOrder === 'salao-first'
            ? [linkSalao, linkZelador]
            : [linkZelador, linkSalao];

        const graph = buildGraph(
            [salao, salaoPK, zelador, zeladorPK, rel],
            new Map([
                [salao, [salaoPK]],
                [salaoPK, [salao]],
                [zelador, [zeladorPK]],
                [zeladorPK, [zelador]],
                [rel, [salao, zelador]],
            ]),
            new Map([
                [rel, orderedLinks],
            ])
        );

        return { graph, salao, zelador, rel };
    }

    test("FK placed on (0,1) side when (1,1) link comes first", async () => {
        const { graph } = build11Scenario('salao-first');

        await conversor.toLogic(graph);

        const salaoTable = logicEditor.insertedTables.find(t => t.attributes.name === 'salao');
        const zeladorTable = logicEditor.insertedTables.find(t => t.attributes.name === 'zelador');

        // In the app's look-here notation, (1,1) on salao means "each
        // zelador has exactly 1 salao", so zelador always has a match.
        // FK goes on zelador (the (0,1) side) to avoid nullable FKs.
        const fkOnSalao = logicEditor.addColumnCalls.filter(
            ({ target, column }) => target === salaoTable && column.FK === true
        );
        const fkOnZelador = logicEditor.addColumnCalls.filter(
            ({ target, column }) => target === zeladorTable && column.FK === true
        );

        expect(fkOnZelador).toHaveLength(1);
        expect(fkOnSalao).toHaveLength(0);
        expect(fkOnZelador[0].column.tableOrigin.idName).toBe('salao');
    });

    test("FK placed on (0,1) side when (0,1) link comes first (regression)", async () => {
        const { graph } = build11Scenario('zelador-first');

        await conversor.toLogic(graph);

        const salaoTable = logicEditor.insertedTables.find(t => t.attributes.name === 'salao');
        const zeladorTable = logicEditor.insertedTables.find(t => t.attributes.name === 'zelador');

        // Same result regardless of link order — FK on zelador (0,1) side
        const fkOnSalao = logicEditor.addColumnCalls.filter(
            ({ target, column }) => target === salaoTable && column.FK === true
        );
        const fkOnZelador = logicEditor.addColumnCalls.filter(
            ({ target, column }) => target === zeladorTable && column.FK === true
        );

        expect(fkOnZelador).toHaveLength(1);
        expect(fkOnSalao).toHaveLength(0);
        expect(fkOnZelador[0].column.tableOrigin.idName).toBe('salao');
    });

    test("symmetric (1,1)-(1,1) does not crash", async () => {
        const left = buildEntity('entity-left', 'A');
        const leftPK = buildKey('key-left', 'idA');
        const right = buildEntity('entity-right', 'B');
        const rightPK = buildKey('key-right', 'idB');
        const rel = buildRelationship('rel-1', 'rel');

        const linkLeft = buildCardinalityLine('line-left', left.id, rel.id, '(1, 1)');
        const linkRight = buildCardinalityLine('line-right', right.id, rel.id, '(1, 1)');

        // For symmetric (1,1)-(1,1) the modal offers join_tables too,
        // but user can still pick new_column — should not crash.
        const graph = buildGraph(
            [left, leftPK, right, rightPK, rel],
            new Map([
                [left, [leftPK]],
                [leftPK, [left]],
                [right, [rightPK]],
                [rightPK, [right]],
                [rel, [left, right]],
            ]),
            new Map([
                [rel, [linkLeft, linkRight]],
            ])
        );

        await expect(conversor.toLogic(graph)).resolves.not.toThrow();
        // FK is placed on one side — either is acceptable for symmetric case
        const totalFKs = logicEditor.addColumnCalls.filter(({ column }) => column.FK === true);
        expect(totalFKs).toHaveLength(1);
    });
});

describe("Conversor — auto-relationship dedicated modal (#263)", () => {
    function buildAutoRelationshipGraph(leftCardinality, rightCardinality) {
        // Single entity connected to one relationship via two cardinality
        // links — the hallmark of an auto-relationship.
        const entity = buildEntity('entity-restaurador', 'Restaurador');
        const entityPK = buildKey('key-restaurador', 'codigo');
        const rel = buildRelationship('rel-1', 'orienta');

        const linkLeft = buildCardinalityLine('line-left', entity.id, rel.id, leftCardinality);
        const linkRight = buildCardinalityLine('line-right', entity.id, rel.id, rightCardinality);

        const graph = buildGraph(
            [entity, entityPK, rel],
            new Map([
                [entity, [entityPK]],
                [entityPK, [entity]],
                // getNeighbors returns unique elements: even with two links,
                // the single entity appears once.
                [rel, [entity]],
            ]),
            new Map([
                [rel, [linkLeft, linkRight]],
            ])
        );

        return { graph, entity, rel };
    }

    test("1:N optional auto-relationship uses openAutoRelation1N, not openRelation1N", async () => {
        const logicEditor = buildLogicEditor();
        const conversionOptionModal = {
            openAutoRelation1N: jest.fn().mockResolvedValue({ value: 'new_column' }),
            openRelation1N: jest.fn(),
        };
        const conversor = new Conversor(logicEditor, { open: jest.fn() }, conversionOptionModal);

        const { graph } = buildAutoRelationshipGraph('(0, 1)', '(0, n)');

        await conversor.toLogic(graph);

        expect(conversionOptionModal.openAutoRelation1N).toHaveBeenCalledTimes(1);
        expect(conversionOptionModal.openRelation1N).not.toHaveBeenCalled();
        // First arg is entity name; second is cardinality description.
        const [entityName, relationDescription] = conversionOptionModal.openAutoRelation1N.mock.calls[0];
        expect(entityName).toBe('Restaurador');
        expect(relationDescription).toContain('(0, 1)');
        expect(relationDescription).toContain('(0, n)');
    });

    test("1:1 with (0,1)-(0,1) auto-relationship uses openAutoRelation11, not openRelation11", async () => {
        const logicEditor = buildLogicEditor();
        const conversionOptionModal = {
            openAutoRelation11: jest.fn().mockResolvedValue({ value: 'new_column' }),
            openRelation11: jest.fn(),
        };
        const conversor = new Conversor(logicEditor, { open: jest.fn() }, conversionOptionModal);

        const { graph } = buildAutoRelationshipGraph('(0, 1)', '(0, 1)');

        await conversor.toLogic(graph);

        expect(conversionOptionModal.openAutoRelation11).toHaveBeenCalledTimes(1);
        expect(conversionOptionModal.openRelation11).not.toHaveBeenCalled();
        const [entityName] = conversionOptionModal.openAutoRelation11.mock.calls[0];
        expect(entityName).toBe('Restaurador');
    });

    test("non-auto 1:N optional still uses the generic openRelation1N modal", async () => {
        const logicEditor = buildLogicEditor();
        const conversionOptionModal = {
            openAutoRelation1N: jest.fn(),
            openRelation1N: jest.fn().mockResolvedValue({ value: 'new_column' }),
        };
        const conversor = new Conversor(logicEditor, { open: jest.fn() }, conversionOptionModal);

        const left = buildEntity('entity-left', 'A');
        const leftPK = buildKey('key-left', 'idA');
        const right = buildEntity('entity-right', 'B');
        const rightPK = buildKey('key-right', 'idB');
        const rel = buildRelationship('rel-1', 'rel');
        const linkLeft = buildCardinalityLine('line-left', left.id, rel.id, '(0, 1)');
        const linkRight = buildCardinalityLine('line-right', right.id, rel.id, '(0, n)');

        const graph = buildGraph(
            [left, leftPK, right, rightPK, rel],
            new Map([
                [left, [leftPK]],
                [leftPK, [left]],
                [right, [rightPK]],
                [rightPK, [right]],
                [rel, [left, right]],
            ]),
            new Map([
                [rel, [linkLeft, linkRight]],
            ])
        );

        await conversor.toLogic(graph);

        expect(conversionOptionModal.openRelation1N).toHaveBeenCalledTimes(1);
        expect(conversionOptionModal.openAutoRelation1N).not.toHaveBeenCalled();
    });
});

describe("Conversor — 1:1 FK link cardinality (#262)", () => {
    function build11Graph(leftCardinality, rightCardinality) {
        const salao = buildEntity('entity-salao', 'salao');
        const salaoPK = buildKey('key-salao', 'numero');
        const zelador = buildEntity('entity-zelador', 'zelador');
        const zeladorPK = buildKey('key-zelador', 'cpf');
        const rel = buildRelationship('rel-1', 'responsavel');

        const linkSalao = buildCardinalityLine('line-salao', salao.id, rel.id, leftCardinality);
        const linkZelador = buildCardinalityLine('line-zelador', zelador.id, rel.id, rightCardinality);

        return buildGraph(
            [salao, salaoPK, zelador, zeladorPK, rel],
            new Map([
                [salao, [salaoPK]],
                [salaoPK, [salao]],
                [zelador, [zeladorPK]],
                [zeladorPK, [zelador]],
                [rel, [salao, zelador]],
            ]),
            new Map([
                [rel, [linkSalao, linkZelador]],
            ])
        );
    }

    test("1:1 (0,1)-(0,1) emits '(0, 1)' on FK link target, not '(0, n)'", async () => {
        const logicEditor = buildLogicEditor();
        const conversionOptionModal = {
            openRelation11: jest.fn().mockResolvedValue({ value: 'new_column' }),
        };
        const conversor = new Conversor(logicEditor, { open: jest.fn() }, conversionOptionModal);

        await conversor.toLogic(build11Graph('(0, 1)', '(0, 1)'));

        const fkCalls = logicEditor.addColumnCalls.filter(({ column }) => column.FK === true);
        expect(fkCalls).toHaveLength(1);
        expect(fkCalls[0].linkLabels).toEqual({ source: "(1, 1)", target: "(0, 1)" });
    });

    test("1:1 mixed (1,1)-(0,1) emits '(0, 1)' on FK link target", async () => {
        const logicEditor = buildLogicEditor();
        const conversionOptionModal = {
            openRelation11Join: jest.fn().mockResolvedValue({ value: 'new_column' }),
        };
        const conversor = new Conversor(logicEditor, { open: jest.fn() }, conversionOptionModal);

        await conversor.toLogic(build11Graph('(1, 1)', '(0, 1)'));

        const fkCalls = logicEditor.addColumnCalls.filter(({ column }) => column.FK === true);
        expect(fkCalls).toHaveLength(1);
        expect(fkCalls[0].linkLabels).toEqual({ source: "(1, 1)", target: "(0, 1)" });
    });

    test("1:N default (non-optional) still emits default '(0, n)' on target (regression)", async () => {
        const logicEditor = buildLogicEditor();
        const conversor = new Conversor(logicEditor, { open: jest.fn() }, {});

        const left = buildEntity('entity-left', 'A');
        const leftPK = buildKey('key-left', 'idA');
        const right = buildEntity('entity-right', 'B');
        const rightPK = buildKey('key-right', 'idB');
        const rel = buildRelationship('rel-1', 'rel');
        const linkLeft = buildCardinalityLine('line-left', left.id, rel.id, '(1, 1)');
        const linkRight = buildCardinalityLine('line-right', right.id, rel.id, '(1, n)');

        const graph = buildGraph(
            [left, leftPK, right, rightPK, rel],
            new Map([
                [left, [leftPK]],
                [leftPK, [left]],
                [right, [rightPK]],
                [rightPK, [right]],
                [rel, [left, right]],
            ]),
            new Map([
                [rel, [linkLeft, linkRight]],
            ])
        );

        await conversor.toLogic(graph);

        const fkCalls = logicEditor.addColumnCalls.filter(({ column }) => column.FK === true);
        expect(fkCalls).toHaveLength(1);
        expect(fkCalls[0].linkLabels).toBeUndefined();
    });
});

describe("Conversor — ISA children_tables preserves multivalued decisions (#312)", () => {
    let logicEditor, conversionAttributeModal, conversionOptionModal, conversor;

    beforeEach(() => {
        logicEditor = buildLogicEditor();
        conversionAttributeModal = {
            open: jest.fn().mockResolvedValue({ value: 'new_table', quantity: 1 }),
        };
        conversionOptionModal = {
            openExtension: jest.fn().mockResolvedValue({ value: 'children_tables' }),
            openExtensionRestricted: jest.fn(),
        };
        conversor = new Conversor(logicEditor, conversionAttributeModal, conversionOptionModal);
    });

    test("redirects multivalued sub-table FK to the single child and drops phantom column", async () => {
        // Mirrors the issue screenshot: pessoa with multivalued "telefones"
        // specialized as (t,d) into a single child "funcionario" with own
        // attribute "nome". With children_tables + new_table, funcionario must
        // not receive "telefones (1, n)" as a raw column, and the telefones
        // sub-table must FK to funcionario (since pessoa is removed).
        const pessoa = buildEntity('entity-pessoa', 'pessoa');
        const telefones = buildAttribute('attr-tel', 'telefones', { multivalued: true });
        const funcionario = buildEntity('entity-func', 'funcionario');
        const nome = buildAttribute('attr-nome', 'nome');
        const isa = buildExtension('isa-1', pessoa.id);

        const graph = buildGraph(
            [pessoa, telefones, funcionario, nome, isa],
            new Map([
                [pessoa, [telefones]],
                [telefones, [pessoa]],
                [funcionario, [nome]],
                [nome, [funcionario]],
                [isa, [pessoa, funcionario]],
            ])
        );

        await conversor.toLogic(graph);

        const funcionarioTable = logicEditor.insertedTables
            .find(t => t.attributes.name === 'funcionario');
        const columnNames = funcionarioTable.attributes.rows.map(c => c.name);
        expect(columnNames).toEqual(['nome']);

        // A new telefones sub-table must have been created AFTER funcionario
        // (redistributed during buildExtensions). The original one is orphaned
        // by the parent removal and must not be the one referenced in the map.
        const telefonesTables = logicEditor.insertedTables
            .filter(t => t.attributes.name === 'telefones');
        expect(telefonesTables).toHaveLength(2);
        const redirectedSubTable = telefonesTables[1];

        const fkToFuncionario = logicEditor.addColumnCalls.find(
            ({ target, column }) =>
                target === redirectedSubTable &&
                column.FK === true &&
                column.tableOrigin.idName === 'funcionario'
        );
        expect(fkToFuncionario).toBeDefined();

        // entityTableMap for the attribute must point to the redirected sub-table.
        expect(conversor.entityTableMap.get('attr-tel')).toBe(redirectedSubTable);
    });

    test("single multivalued sub-table gets one FK per child when multiple children", async () => {
        const pessoa = buildEntity('entity-pessoa', 'pessoa');
        const telefones = buildAttribute('attr-tel', 'telefones', { multivalued: true });
        const funcionario = buildEntity('entity-func', 'funcionario');
        const autonomo = buildEntity('entity-aut', 'autonomo');
        const isa = buildExtension('isa-1', pessoa.id);

        const graph = buildGraph(
            [pessoa, telefones, funcionario, autonomo, isa],
            new Map([
                [pessoa, [telefones]],
                [telefones, [pessoa]],
                [funcionario, []],
                [autonomo, []],
                [isa, [pessoa, funcionario, autonomo]],
            ])
        );

        await conversor.toLogic(graph);

        // Exactly one telefones table is created during redistribution
        // (the original is orphaned by the parent removal; the mock's
        // remove() is a no-op so it still appears in insertedTables).
        const telefonesTables = logicEditor.insertedTables
            .filter(t => t.attributes.name === 'telefones');
        expect(telefonesTables).toHaveLength(2);
        const redistributed = telefonesTables[1];

        const fkCalls = logicEditor.addColumnCalls.filter(
            ({ target, column }) => target === redistributed && column.FK === true
        );
        expect(fkCalls.map(c => c.column.tableOrigin.idName))
            .toEqual(['funcionario', 'autonomo']);
    });

    test("ISA one_table: multivalued sub-table is re-pointed to the merged table", async () => {
        // Same starting point as the single-child children_tables case, but
        // the user now picks one_table for the specialization. pessoa and
        // funcionario must collapse into a single merged table, and the
        // telefones sub-table must FK to that merged table, not to the
        // removed pre-merge pessoa table.
        conversionOptionModal.openExtension.mockResolvedValue({ value: 'one_table' });

        const pessoa = buildEntity('entity-pessoa', 'pessoa');
        const telefones = buildAttribute('attr-tel', 'telefones', { multivalued: true });
        const funcionario = buildEntity('entity-func', 'funcionario');
        const nome = buildAttribute('attr-nome', 'nome');
        const isa = buildExtension('isa-1', pessoa.id);

        const graph = buildGraph(
            [pessoa, telefones, funcionario, nome, isa],
            new Map([
                [pessoa, [telefones]],
                [telefones, [pessoa]],
                [funcionario, [nome]],
                [nome, [funcionario]],
                [isa, [pessoa, funcionario]],
            ])
        );

        await conversor.toLogic(graph);

        const mergedTable = logicEditor.insertedTables
            .find(t => t.attributes.name === 'pessoa_funcionario');
        expect(mergedTable).toBeDefined();
        // Merged table carries the regular columns from both entities.
        expect(mergedTable.attributes.rows.map(c => c.name)).toEqual(['nome']);

        // A new telefones sub-table must exist and FK the merged table.
        const telefonesTables = logicEditor.insertedTables
            .filter(t => t.attributes.name === 'telefones');
        expect(telefonesTables).toHaveLength(2);
        const redirectedSubTable = telefonesTables[1];

        const fkCall = logicEditor.addColumnCalls.find(
            ({ target, column }) => target === redirectedSubTable && column.FK === true
        );
        expect(fkCall).toBeDefined();
        expect(fkCall.column.tableOrigin.idOrigin).toBe(mergedTable.id);

        // entityTableMap points attr-tel to the redirected sub-table.
        expect(conversor.entityTableMap.get('attr-tel')).toBe(redirectedSubTable);
    });

    test("redirects multivalued erd.Key sub-table like erd.Attribute", async () => {
        // buildAttributes materializes both erd.Attribute and erd.Key as
        // sub-tables when multivalued + new_table, so findSubTableAttributes
        // must scan both. This test mirrors the single-child redirect case
        // using a multivalued Key instead of an Attribute.
        const pessoa = buildEntity('entity-pessoa', 'pessoa');
        const telefones = buildKey('key-tel', 'telefones', { multivalued: true });
        const funcionario = buildEntity('entity-func', 'funcionario');
        const isa = buildExtension('isa-1', pessoa.id);

        const graph = buildGraph(
            [pessoa, telefones, funcionario, isa],
            new Map([
                [pessoa, [telefones]],
                [telefones, [pessoa]],
                [funcionario, []],
                [isa, [pessoa, funcionario]],
            ])
        );

        await conversor.toLogic(graph);

        const telefonesTables = logicEditor.insertedTables
            .filter(t => t.attributes.name === 'telefones');
        expect(telefonesTables).toHaveLength(2);
        const redirectedSubTable = telefonesTables[1];

        const fkToFuncionario = logicEditor.addColumnCalls.find(
            ({ target, column }) =>
                target === redirectedSubTable &&
                column.FK === true &&
                column.tableOrigin.idName === 'funcionario'
        );
        expect(fkToFuncionario).toBeDefined();
        expect(conversor.entityTableMap.get('key-tel')).toBe(redirectedSubTable);
    });

    test("propagates multivalued new_column expansion to children", async () => {
        // When the multivalued attribute was resolved as N columns on the
        // parent (attName0..N-1), those expansions must propagate to every
        // child instead of the raw label going through as a single column.
        conversionAttributeModal.open.mockResolvedValue({ value: 'new_column', quantity: 3 });

        const pessoa = buildEntity('entity-pessoa', 'pessoa');
        const telefones = buildAttribute('attr-tel', 'telefones', { multivalued: true });
        const funcionario = buildEntity('entity-func', 'funcionario');
        const isa = buildExtension('isa-1', pessoa.id);

        const graph = buildGraph(
            [pessoa, telefones, funcionario, isa],
            new Map([
                [pessoa, [telefones]],
                [telefones, [pessoa]],
                [funcionario, []],
                [isa, [pessoa, funcionario]],
            ])
        );

        await conversor.toLogic(graph);

        const funcionarioTable = logicEditor.insertedTables
            .find(t => t.attributes.name === 'funcionario');
        const columnNames = funcionarioTable.attributes.rows.map(c => c.name);
        expect(columnNames).toEqual(['telefones0', 'telefones1', 'telefones2']);
    });
});
