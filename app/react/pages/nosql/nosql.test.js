import nosql from '../../../joint/nosql.js';

describe('nosql.Collection moveRow', () => {
	let collection;

	beforeEach(() => {
		collection = new nosql.Collection({
			name: 'TestCollection',
			rows: [
				{ kind: 'attribute', name: '_id', type: 'ID', identifier: true },
				{ kind: 'attribute', name: 'nome', type: 'string' },
				{ kind: 'attribute', name: 'idade', type: 'int' },
			],
		});
	});

	test('should move a row forward in root level', () => {
		const result = collection.moveRow([], 0, 2);
		expect(result).toBe(true);
		const rows = collection.getRows();
		expect(rows[0].name).toBe('nome');
		expect(rows[1].name).toBe('idade');
		expect(rows[2].name).toBe('_id');
	});

	test('should move a row backward in root level', () => {
		const result = collection.moveRow([], 2, 0);
		expect(result).toBe(true);
		const rows = collection.getRows();
		expect(rows[0].name).toBe('idade');
		expect(rows[1].name).toBe('_id');
		expect(rows[2].name).toBe('nome');
	});

	test('should return false when fromIndex equals toIndex', () => {
		expect(collection.moveRow([], 1, 1)).toBe(false);
	});

	test('should return false for out-of-bounds fromIndex', () => {
		expect(collection.moveRow([], -1, 1)).toBe(false);
	});

	test('should return false for out-of-bounds toIndex', () => {
		expect(collection.moveRow([], 0, 5)).toBe(false);
	});

	test('should move rows within a block', () => {
		collection = new nosql.Collection({
			name: 'Test',
			rows: [
				{
					kind: 'block', name: 'endereco', collapsed: false, children: [
						{ kind: 'attribute', name: 'rua', type: 'string' },
						{ kind: 'attribute', name: 'cidade', type: 'string' },
						{ kind: 'attribute', name: 'cep', type: 'string' },
					]
				},
			],
		});

		const result = collection.moveRow([0], 2, 0);
		expect(result).toBe(true);
		const block = collection.getRows()[0];
		expect(block.children[0].name).toBe('cep');
		expect(block.children[1].name).toBe('rua');
		expect(block.children[2].name).toBe('cidade');
	});

	test('should preserve all row data when moving', () => {
		const result = collection.moveRow([], 0, 1);
		expect(result).toBe(true);
		const rows = collection.getRows();
		expect(rows[1].name).toBe('_id');
		expect(rows[1].type).toBe('ID');
		expect(rows[1].identifier).toBe(true);
	});
});

describe('nosql.Collection block color', () => {
	test('should preserve color when adding a block with color', () => {
		const collection = new nosql.Collection({ name: 'Test', rows: [] });
		collection.addRow([], { kind: 'block', name: 'endereco', color: '#fca397' });
		const rows = collection.getRows();
		expect(rows[0].color).toBe('#fca397');
	});

	test('should not include color when block has no color', () => {
		const collection = new nosql.Collection({ name: 'Test', rows: [] });
		collection.addRow([], { kind: 'block', name: 'endereco' });
		const rows = collection.getRows();
		expect(rows[0].color).toBeUndefined();
	});

	test('should preserve color when editing a block', () => {
		const collection = new nosql.Collection({
			name: 'Test',
			rows: [{ kind: 'block', name: 'endereco', color: '#fca397', children: [] }],
		});
		collection.editRow([0], { kind: 'block', name: 'address', color: '#7cc4f8' });
		const rows = collection.getRows();
		expect(rows[0].name).toBe('address');
		expect(rows[0].color).toBe('#7cc4f8');
	});
});

describe('nosql.Collection disjunctionGroups', () => {
	const buildCollection = () => new nosql.Collection({
		name: 'Obra',
		rows: [
			{ kind: 'attribute', name: '_id', type: 'ID', identifier: true },
			{ kind: 'attribute', name: 'titulo', type: 'string' },
			{ kind: 'block', name: 'Pintura', children: [] },
			{ kind: 'block', name: 'Periodo', children: [] },
			{ kind: 'block', name: 'Escultura', children: [] },
			{ kind: 'block', name: 'Gravura', children: [] },
		],
	});

	const blockIdByName = (collection, name) => {
		const row = collection.getRows().find(r => r.kind === 'block' && r.name === name);
		return row ? row.id : null;
	};

	test('assigns ids to blocks on construction', () => {
		const collection = buildCollection();
		const blocks = collection.getRows().filter(r => r.kind === 'block');
		expect(blocks.length).toBe(4);
		blocks.forEach(b => expect(typeof b.id).toBe('string'));
		const ids = blocks.map(b => b.id);
		expect(new Set(ids).size).toBe(ids.length);
	});

	test('preserves block id across editRow', () => {
		const collection = buildCollection();
		const originalId = blockIdByName(collection, 'Pintura');
		collection.editRow([2], { kind: 'block', name: 'Pintura em tela' });
		const row = collection.getRows()[2];
		expect(row.name).toBe('Pintura em tela');
		expect(row.id).toBe(originalId);
	});

	test('_ensureBlockIds fills ids on legacy models without ids', () => {
		const legacy = new nosql.Collection({
			name: 'Legacy',
			rows: [
				{ kind: 'block', name: 'A', children: [] },
				{ kind: 'block', name: 'B', children: [] },
			],
		});
		// Forcefully strip ids to simulate a pre-migration model
		legacy.set('rows', [
			{ kind: 'block', name: 'A', children: [], collapsed: false, cardinalityEnabled: false, minCardinality: 0, maxCardinality: 'N' },
			{ kind: 'block', name: 'B', children: [], collapsed: false, cardinalityEnabled: false, minCardinality: 0, maxCardinality: 'N' },
		], { silent: true });
		legacy._ensureBlockIds();
		const rows = legacy.getRows();
		expect(typeof rows[0].id).toBe('string');
		expect(typeof rows[1].id).toBe('string');
		expect(rows[0].id).not.toBe(rows[1].id);
	});

	test('addDisjunctionGroup creates a group with 2 sibling blocks', () => {
		const collection = buildCollection();
		const result = collection.addDisjunctionGroup({
			blockIds: [blockIdByName(collection, 'Pintura'), blockIdByName(collection, 'Escultura')],
		});
		expect(result.ok).toBe(true);
		const groups = collection.getDisjunctionGroups();
		expect(groups.length).toBe(1);
		expect(groups[0].blockIds.length).toBe(2);
	});

	test('addDisjunctionGroup rejects fewer than 2 members', () => {
		const collection = buildCollection();
		const result = collection.addDisjunctionGroup({
			blockIds: [blockIdByName(collection, 'Pintura')],
		});
		expect(result.ok).toBe(false);
		expect(result.reason).toBe('min_members');
	});

	test('addDisjunctionGroup rejects unknown block ids', () => {
		const collection = buildCollection();
		const result = collection.addDisjunctionGroup({
			blockIds: [blockIdByName(collection, 'Pintura'), 'does-not-exist'],
		});
		expect(result.ok).toBe(false);
		expect(result.reason).toBe('missing_block');
	});

	test('addDisjunctionGroup rejects blocks with different parents', () => {
		const collection = new nosql.Collection({
			name: 'Test',
			rows: [
				{ kind: 'block', name: 'Outer', children: [
					{ kind: 'block', name: 'Inner', children: [] },
					{ kind: 'block', name: 'Inner2', children: [] },
				]},
				{ kind: 'block', name: 'Sibling', children: [] },
			],
		});
		const outerRow = collection.getRows()[0];
		const innerId = outerRow.children[0].id;
		const siblingId = collection.getRows()[1].id;
		// Pair a nested block with a root sibling — not siblings at all.
		// Order matters here: first member is root (siblingId), second is nested,
		// so root_only passes and not_siblings fires.
		const result = collection.addDisjunctionGroup({
			blockIds: [siblingId, innerId],
		});
		expect(result.ok).toBe(false);
		expect(result.reason).toBe('not_siblings');
	});

	test('addDisjunctionGroup rejects nested-only blocks as not root', () => {
		const collection = new nosql.Collection({
			name: 'Test',
			rows: [
				{ kind: 'block', name: 'Outer', children: [
					{ kind: 'block', name: 'Inner1', children: [] },
					{ kind: 'block', name: 'Inner2', children: [] },
				]},
			],
		});
		const outerRow = collection.getRows()[0];
		const inner1Id = outerRow.children[0].id;
		const inner2Id = outerRow.children[1].id;
		const result = collection.addDisjunctionGroup({
			blockIds: [inner1Id, inner2Id],
		});
		expect(result.ok).toBe(false);
		expect(result.reason).toBe('root_only');
	});

	test('addDisjunctionGroup clusters non-adjacent members', () => {
		const collection = buildCollection();
		const pinturaId = blockIdByName(collection, 'Pintura');
		const esculturaId = blockIdByName(collection, 'Escultura');
		const gravuraId = blockIdByName(collection, 'Gravura');
		collection.addDisjunctionGroup({
			blockIds: [pinturaId, esculturaId, gravuraId],
		});
		const rows = collection.getRows();
		const pinturaIdx = rows.findIndex(r => r.name === 'Pintura');
		const esculturaIdx = rows.findIndex(r => r.name === 'Escultura');
		const gravuraIdx = rows.findIndex(r => r.name === 'Gravura');
		const periodoIdx = rows.findIndex(r => r.name === 'Periodo');
		expect(esculturaIdx).toBe(pinturaIdx + 1);
		expect(gravuraIdx).toBe(pinturaIdx + 2);
		expect(periodoIdx).toBeGreaterThan(gravuraIdx);
	});

	test('deleteDisjunctionGroup removes the group', () => {
		const collection = buildCollection();
		const { group } = collection.addDisjunctionGroup({
			blockIds: [blockIdByName(collection, 'Pintura'), blockIdByName(collection, 'Escultura')],
		});
		const removed = collection.deleteDisjunctionGroup(group.id);
		expect(removed).toBe(true);
		expect(collection.getDisjunctionGroups()).toHaveLength(0);
	});

	test('deleting a member block reconciles the group', () => {
		const collection = buildCollection();
		const pinturaId = blockIdByName(collection, 'Pintura');
		const esculturaId = blockIdByName(collection, 'Escultura');
		const gravuraId = blockIdByName(collection, 'Gravura');
		collection.addDisjunctionGroup({
			blockIds: [pinturaId, esculturaId, gravuraId],
		});
		const esculturaPath = collection.getRows().findIndex(r => r.name === 'Escultura');
		collection.deleteRow([esculturaPath]);
		const groups = collection.getDisjunctionGroups();
		expect(groups).toHaveLength(1);
		expect(groups[0].blockIds).toEqual(expect.arrayContaining([pinturaId, gravuraId]));
		expect(groups[0].blockIds).not.toEqual(expect.arrayContaining([esculturaId]));
	});

	test('group with fewer than 2 members is removed after reconciliation', () => {
		const collection = buildCollection();
		const pinturaId = blockIdByName(collection, 'Pintura');
		const esculturaId = blockIdByName(collection, 'Escultura');
		collection.addDisjunctionGroup({
			blockIds: [pinturaId, esculturaId],
		});
		const esculturaPath = collection.getRows().findIndex(r => r.name === 'Escultura');
		collection.deleteRow([esculturaPath]);
		expect(collection.getDisjunctionGroups()).toHaveLength(0);
	});

	test('moving a row manually does not re-cluster a group', () => {
		const collection = buildCollection();
		const pinturaId = blockIdByName(collection, 'Pintura');
		const esculturaId = blockIdByName(collection, 'Escultura');
		collection.addDisjunctionGroup({
			blockIds: [pinturaId, esculturaId],
		});
		// After clustering, Pintura is at index 2 and Escultura at index 3
		const before = collection.getRows().map(r => r.name);
		expect(before.slice(2, 4)).toEqual(['Pintura', 'Escultura']);

		// Move Pintura to the very end of the root array
		const lastIdx = collection.getRows().length - 1;
		collection.moveRow([], 2, lastIdx);

		// Both members still exist (same parent) → group persists, but membership order unchanged
		const groups = collection.getDisjunctionGroups();
		expect(groups).toHaveLength(1);
		expect(groups[0].blockIds).toEqual([pinturaId, esculturaId]);
	});

	test('addDisjunctionGroup rejects blocks already in another group', () => {
		const collection = buildCollection();
		const pinturaId = blockIdByName(collection, 'Pintura');
		const esculturaId = blockIdByName(collection, 'Escultura');
		const gravuraId = blockIdByName(collection, 'Gravura');
		collection.addDisjunctionGroup({
			blockIds: [pinturaId, esculturaId],
		});
		const result = collection.addDisjunctionGroup({
			blockIds: [pinturaId, gravuraId],
		});
		expect(result.ok).toBe(false);
		expect(result.reason).toBe('already_grouped');
		expect(collection.getDisjunctionGroups()).toHaveLength(1);
	});

	test('multiple groups can coexist in the same collection', () => {
		const collection = new nosql.Collection({
			name: 'Test',
			rows: [
				{ kind: 'block', name: 'A', children: [] },
				{ kind: 'block', name: 'B', children: [] },
				{ kind: 'block', name: 'C', children: [] },
				{ kind: 'block', name: 'D', children: [] },
			],
		});
		const [a, b, c, d] = collection.getRows().map(r => r.id);
		collection.addDisjunctionGroup({ blockIds: [a, b] });
		collection.addDisjunctionGroup({ blockIds: [c, d] });
		expect(collection.getDisjunctionGroups()).toHaveLength(2);
	});
});
