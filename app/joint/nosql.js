import { dia } from '@joint/core';

const nosql = {};

// //////////////////////////////////////////////////////////////////
// Constants
// //////////////////////////////////////////////////////////////////

const HEADER_HEIGHT = 30;
const ROW_HEIGHT = 28;
const MIN_BODY_HEIGHT = 40;
const MIN_WIDTH = 160;
const INDENT_WIDTH = 8;
const BLOCK_PADDING = 8;
const BLOCK_INNER_PADDING = 4;
const BLOCK_BOX_INDENT = 4;
const COLUMN_PADDING = 10;
const FONT_FAMILY = 'BlinkMacSystemFont,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif';

// All disjunctions share the same gutter column. Clustering keeps groups
// non-overlapping vertically, so a single column is enough no matter the count.
const GUTTER_WIDTH = 14;
const BRACE_STROKE_WIDTH = 1.5;
const BRACE_SPINE_INSET = 7;
const BRACE_CAP_INSET = 2;

function generateId() {
	const c = (typeof globalThis !== 'undefined' && globalThis.crypto) ? globalThis.crypto : null;
	if (c && typeof c.randomUUID === 'function') return c.randomUUID();
	// RFC4122 v4 fallback for environments without crypto.randomUUID
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, ch => {
		const r = Math.random() * 16 | 0;
		return (ch === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
	});
}

// //////////////////////////////////////////////////////////////////
// Collection shape — table-based with hierarchical rows
// //////////////////////////////////////////////////////////////////

nosql.Collection = dia.Element.define('nosql.Collection', {
	size: { width: 50, height: 70 },
	attrs: {
		root: {
			magnetSelector: 'body'
		},
		body: {
			width: 'calc(w)',
			height: 'calc(h)',
			stroke: '#808080',
			strokeWidth: 1,
			fill: '#FCFCFC',
			rx: 4,
			ry: 4
		},
		header: {
			width: 'calc(w)',
			height: HEADER_HEIGHT,
			stroke: '#808080',
			strokeWidth: 1,
			fill: '#808080',
			rx: 4,
			ry: 4
		},
		headerText: {
			text: 'Collection',
			textAnchor: 'middle',
			textVerticalAnchor: 'middle',
			x: 'calc(w/2)',
			y: HEADER_HEIGHT / 2,
			fontSize: 13,
			fontWeight: 'bold',
			fontFamily: FONT_FAMILY,
			fill: '#FFFFFF'
		}
	},

	name: '',
	rows: [],
	rowHeight: ROW_HEIGHT,
	headerHeight: HEADER_HEIGHT,
	minBodyHeight: MIN_BODY_HEIGHT
}, {
	markup: [{
		tagName: 'rect',
		selector: 'body'
	}, {
		tagName: 'rect',
		selector: 'header'
	}, {
		tagName: 'text',
		selector: 'headerText'
	}],

	initialize: function() {
		dia.Element.prototype.initialize.apply(this, arguments);

		this._ensureBlockIds();

		this.on('change:rows', function() {
			this.updateTable();
			this.trigger('collection-update');
		}, this);

		this.on('change:disjunctionGroups', function() {
			this.updateTable();
			this.trigger('collection-update');
		}, this);

		this.on('change:name', function() {
			this.attr('headerText/text', this.getName());
		}, this);

		if (this.getRows().length > 0) {
			this.updateTable();
		}
	},

	// //////////////////////////////////////////////////////////////////
	// Getters / Setters
	// //////////////////////////////////////////////////////////////////

	getName: function() {
		return this.get('name') || this.attr('headerText/text') || '';
	},

	setName: function(name) {
		this.set('name', name);
		this.attr('headerText/text', name);
	},

	getRows: function() {
		return this.get('rows') || [];
	},

	// //////////////////////////////////////////////////////////////////
	// Row CRUD — path-based (e.g. [2, 1] = child 1 of block at index 2)
	// //////////////////////////////////////////////////////////////////

	addRow: function(path, rowData, insertAt) {
		const rows = JSON.parse(JSON.stringify(this.getRows()));
		const normalized = this._normalizeRow(rowData);
		const container = this._getContainerChildren(rows, path);
		if (insertAt != null && insertAt >= 0 && insertAt < container.length) {
			container.splice(insertAt, 0, normalized);
		} else {
			container.push(normalized);
		}
		this.set('rows', rows);
		this._reconcileDisjunctionGroups();
		return insertAt != null ? insertAt : container.length - 1;
	},

	editRow: function(path, rowData) {
		const rows = JSON.parse(JSON.stringify(this.getRows()));
		const parent = this._getParentArray(rows, path);
		const index = path[path.length - 1];
		if (index >= 0 && index < parent.length) {
			const existing = parent[index];
			// Preserve existing block id across edits so disjunction groups stay linked
			const dataWithId = (existing.kind === 'block' && rowData && rowData.kind !== 'attribute' && rowData.kind !== 'reference')
				? { ...rowData, id: rowData.id || existing.id }
				: rowData;
			const normalized = this._normalizeRow(dataWithId);
			if (existing.kind === 'block' && normalized.kind === 'block') {
				normalized.children = existing.children;
				normalized.collapsed = rowData.collapsed !== undefined ? rowData.collapsed : existing.collapsed;
			}
			parent[index] = normalized;
			this.set('rows', rows);
			this._reconcileDisjunctionGroups();
			return true;
		}
		return false;
	},

	deleteRow: function(path) {
		const rows = JSON.parse(JSON.stringify(this.getRows()));
		const parent = this._getParentArray(rows, path);
		const index = path[path.length - 1];
		if (index >= 0 && index < parent.length) {
			parent.splice(index, 1);
			this.set('rows', rows);
			this._reconcileDisjunctionGroups();
			return true;
		}
		return false;
	},

	moveRow: function(path, fromIndex, toIndex) {
		const rows = JSON.parse(JSON.stringify(this.getRows()));
		const container = this._getContainerChildren(rows, path);
		if (fromIndex === toIndex ||
			fromIndex < 0 || fromIndex >= container.length ||
			toIndex < 0 || toIndex >= container.length) {
			return false;
		}
		const [moved] = container.splice(fromIndex, 1);
		container.splice(toIndex, 0, moved);
		this.set('rows', rows);
		this._reconcileDisjunctionGroups();
		return true;
	},

	toggleBlockCollapse: function(path) {
		const rows = JSON.parse(JSON.stringify(this.getRows()));
		const parent = this._getParentArray(rows, path);
		const index = path[path.length - 1];
		const row = parent[index];
		if (row && row.kind === 'block') {
			row.collapsed = !row.collapsed;
			this.set('rows', rows);
			return true;
		}
		return false;
	},

	getRowAtPath: function(path) {
		let current = this.getRows();
		for (let i = 0; i < path.length; i++) {
			const idx = path[i];
			if (!current || idx < 0 || idx >= current.length) return null;
			if (i === path.length - 1) return current[idx];
			const node = current[idx];
			if (node.kind !== 'block') return null;
			current = node.children;
		}
		return null;
	},

	// Given a point in the collection's local coordinate space (origin = top-left
	// of the collection element), return the path of the deepest visible block
	// whose rendered box contains the point. Returns [] when the point is over
	// the header, an attribute at root, or otherwise not inside any block.
	findContainingBlockPath: function(localX, localY) {
		const size = this.size();
		if (localX < 0 || localX > size.width || localY < HEADER_HEIGHT) return [];

		const flatRows = this.getFlatRows();
		const { positions } = this._calculateRowPositions(flatRows);
		const tableWidth = size.width;
		const gutterWidth = this._getGutterWidth();
		const margin = 4;
		let best = [];

		for (let i = 0; i < flatRows.length; i++) {
			const row = flatRows[i];
			if (row.kind !== 'block') continue;

			// Match the box bounds drawn by CollectionView.renderRows.
			const boxIndent = row.depth * BLOCK_BOX_INDENT;
			const left = gutterWidth + boxIndent + margin;
			const right = tableWidth - boxIndent - margin;
			const top = positions[i];

			let lastChildIdx = i;
			if (!row.collapsed) {
				for (let j = i + 1; j < flatRows.length; j++) {
					if (flatRows[j].depth <= row.depth) break;
					lastChildIdx = j;
				}
			}
			const rawBottom = positions[lastChildIdx] + ROW_HEIGHT;
			const bottom = (lastChildIdx > i) ? rawBottom + BLOCK_INNER_PADDING : rawBottom;

			if (localX >= left && localX <= right
				&& localY >= top && localY <= bottom
				&& row.path.length > best.length) {
				best = row.path;
			}
		}
		return best;
	},

	getIdentifierType: function() {
		const find = (rows) => {
			for (const row of rows) {
				if (row.kind === 'attribute' && row.identifier) return row.type || 'ID';
				if (row.kind === 'block' && row.children) {
					const inner = find(row.children);
					if (inner) return inner;
				}
			}
			return null;
		};
		return find(this.getRows()) || 'ID';
	},

	hasReferenceToCollection: function(collectionId) {
		const search = (rows) => {
			for (const row of rows) {
				if (row.kind === 'reference' && row.targetCollectionId === collectionId) return true;
				if (row.kind === 'block' && row.children && search(row.children)) return true;
			}
			return false;
		};
		return search(this.getRows());
	},

	// //////////////////////////////////////////////////////////////////
	// Path helpers
	// //////////////////////////////////////////////////////////////////

	_getContainerChildren: function(rows, path) {
		let current = rows;
		for (let i = 0; i < path.length; i++) {
			const node = current[path[i]];
			if (!node || node.kind !== 'block') {
				throw new Error('Invalid path: node at index ' + path[i] + ' is not a block');
			}
			current = node.children;
		}
		return current;
	},

	_getParentArray: function(rows, path) {
		if (path.length <= 1) return rows;
		let current = rows;
		for (let i = 0; i < path.length - 1; i++) {
			const node = current[path[i]];
			if (!node || node.kind !== 'block') {
				throw new Error('Invalid path: node at index ' + path[i] + ' is not a block');
			}
			current = node.children;
		}
		return current;
	},

	// //////////////////////////////////////////////////////////////////
	// Flatten rows for rendering
	// //////////////////////////////////////////////////////////////////

	getFlatRows: function() {
		const flat = [];
		const walk = (rows, depth, parentPath) => {
			rows.forEach((row, index) => {
				const rowPath = [...parentPath, index];
				flat.push({ ...row, depth, path: rowPath });
				if (row.kind === 'block' && !row.collapsed && row.children) {
					walk(row.children, depth + 1, rowPath);
				}
			});
		};
		walk(this.getRows(), 0, []);
		return flat;
	},

	_calculateRowPositions: function(flatRows) {
		const positions = [];
		let currentY = HEADER_HEIGHT;

		for (let i = 0; i < flatRows.length; i++) {
			const row = flatRows[i];

			if (row.depth === 0) {
				if (i === 0 && row.kind === 'block') {
					// First element is a block — padding above (half for edge)
					currentY += BLOCK_PADDING / 2;
				} else if (i > 0) {
					// Between depth-0 elements — padding when at least one is a block
					let prevDepth0 = null;
					for (let j = i - 1; j >= 0; j--) {
						if (flatRows[j].depth === 0) { prevDepth0 = flatRows[j]; break; }
					}
					if (prevDepth0 && (prevDepth0.kind === 'block' || row.kind === 'block')) {
						currentY += BLOCK_PADDING;
					}
				}
			}

			positions.push(currentY);
			currentY += ROW_HEIGHT;

			// Inner top padding: gap between block header and its first child
			if (row.kind === 'block' && !row.collapsed) {
				const nextRow = flatRows[i + 1];
				if (nextRow && nextRow.depth > row.depth) {
					currentY += BLOCK_INNER_PADDING;
				}
			}

			// Inner bottom padding: gap when exiting a block (next row is shallower)
			// or gap between sibling blocks at the same depth
			if (i + 1 < flatRows.length) {
				const nextRow = flatRows[i + 1];
				if (nextRow.depth < row.depth) {
					currentY += BLOCK_INNER_PADDING;
				} else if (nextRow.depth === row.depth && nextRow.kind === 'block' && row.depth > 0) {
					currentY += BLOCK_INNER_PADDING;
				}
			}
		}

		// Padding below if last depth-0 element is a block (half for edge)
		const lastDepth0 = [...flatRows].reverse().find(r => r.depth === 0);
		if (lastDepth0 && lastDepth0.kind === 'block') {
			currentY += BLOCK_PADDING / 2;
		}

		return { positions, totalHeight: currentY };
	},

	// //////////////////////////////////////////////////////////////////
	// Normalization
	// //////////////////////////////////////////////////////////////////

	_normalizeRow: function(data) {
		const kind = data.kind || 'attribute';

		const base = {
			kind: kind,
			name: data.name || '',
		};

		if (kind === 'block') {
			const block = {
				...base,
				id: data.id || generateId(),
				collapsed: data.collapsed || false,
				cardinalityEnabled: data.cardinalityEnabled || false,
				minCardinality: data.minCardinality != null ? data.minCardinality : 0,
				maxCardinality: data.maxCardinality != null ? data.maxCardinality : 'N',
				children: data.children || []
			};
			if (data.color) block.color = data.color;
			return block;
		}

		if (kind === 'reference') {
			const resolvedType = (data.type && data.type !== 'reference') ? data.type : 'ID';
			const ref = {
				...base,
				type: resolvedType,
				isReference: true,
				targetCollectionId: data.targetCollectionId || null,
				targetCollectionName: data.targetCollectionName || null
			};
			if (data.linkId) ref.linkId = data.linkId;
			return ref;
		}

		// attribute
		const attr = {
			...base,
			type: data.type || 'string',
			cardinalityEnabled: data.cardinalityEnabled || false,
			minCardinality: data.minCardinality != null ? data.minCardinality : 0,
			maxCardinality: data.maxCardinality != null ? data.maxCardinality : 1
		};
		if (data.identifier) attr.identifier = true;
		return attr;
	},

	// //////////////////////////////////////////////////////////////////
	// Block IDs and disjunction groups
	// //////////////////////////////////////////////////////////////////

	_ensureBlockIds: function() {
		const rows = this.getRows();
		if (!rows.length) return;
		let mutated = false;
		const walk = (list) => {
			list.forEach(row => {
				if (row.kind === 'block') {
					if (!row.id) {
						row.id = generateId();
						mutated = true;
					}
					if (Array.isArray(row.children)) walk(row.children);
				}
			});
		};
		const clone = JSON.parse(JSON.stringify(rows));
		walk(clone);
		if (mutated) {
			this.set('rows', clone, { silent: true });
		}
	},

	getBlockById: function(blockId) {
		if (!blockId) return null;
		const rows = this.getRows();
		const walk = (list, parentPath) => {
			for (let i = 0; i < list.length; i++) {
				const row = list[i];
				if (row.kind !== 'block') continue;
				const path = [...parentPath, i];
				if (row.id === blockId) {
					return { row, path, parentPath: [...parentPath] };
				}
				if (Array.isArray(row.children)) {
					const found = walk(row.children, path);
					if (found) return found;
				}
			}
			return null;
		};
		return walk(rows, []);
	},

	getSiblingBlockIds: function(blockId) {
		const info = this.getBlockById(blockId);
		if (!info) return [];
		const parentArray = this._getContainerChildren(
			JSON.parse(JSON.stringify(this.getRows())),
			info.parentPath
		);
		return parentArray
			.filter(row => row.kind === 'block' && row.id)
			.map(row => row.id);
	},

	getAllBlocks: function() {
		const out = [];
		const walk = (list, parentPath) => {
			list.forEach((row, idx) => {
				if (row.kind !== 'block') return;
				const path = [...parentPath, idx];
				out.push({ id: row.id, name: row.name, path, parentPath: [...parentPath] });
				if (Array.isArray(row.children)) walk(row.children, path);
			});
		};
		walk(this.getRows(), []);
		return out;
	},

	getDisjunctionGroups: function() {
		return this.get('disjunctionGroups') || [];
	},

	_pathsEqual: function(a, b) {
		if (a.length !== b.length) return false;
		for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
		return true;
	},

	_validateGroupMembers: function(blockIds) {
		if (!Array.isArray(blockIds) || blockIds.length < 2) {
			return { ok: false, reason: 'min_members' };
		}
		const unique = Array.from(new Set(blockIds));
		if (unique.length !== blockIds.length) {
			return { ok: false, reason: 'duplicate_members' };
		}
		const infos = [];
		for (const id of blockIds) {
			const info = this.getBlockById(id);
			if (!info) return { ok: false, reason: 'missing_block' };
			infos.push(info);
		}
		const firstParent = infos[0].parentPath;
		// v1: disjunctions are only supported between root-level blocks
		if (firstParent.length !== 0) {
			return { ok: false, reason: 'root_only' };
		}
		for (let i = 1; i < infos.length; i++) {
			if (!this._pathsEqual(infos[i].parentPath, firstParent)) {
				return { ok: false, reason: 'not_siblings' };
			}
		}
		const alreadyGrouped = new Set();
		this.getDisjunctionGroups().forEach(g => g.blockIds.forEach(id => alreadyGrouped.add(id)));
		for (const id of blockIds) {
			if (alreadyGrouped.has(id)) {
				return { ok: false, reason: 'already_grouped' };
			}
		}
		return { ok: true, parentPath: firstParent };
	},

	addDisjunctionGroup: function({ blockIds }) {
		const check = this._validateGroupMembers(blockIds);
		if (!check.ok) return { ok: false, reason: check.reason };

		const group = {
			id: generateId(),
			blockIds: [...blockIds]
		};
		const groups = [...this.getDisjunctionGroups(), group];
		this.set('disjunctionGroups', groups);
		this._clusterGroupMembers(group.id);
		return { ok: true, group };
	},

	deleteDisjunctionGroup: function(groupId) {
		const groups = this.getDisjunctionGroups();
		const next = groups.filter(g => g.id !== groupId);
		if (next.length === groups.length) return false;
		this.set('disjunctionGroups', next);
		return true;
	},

	_reconcileDisjunctionGroups: function() {
		const groups = this.getDisjunctionGroups();
		if (!groups.length) return;

		let changed = false;
		const nextGroups = [];
		for (const group of groups) {
			const infos = group.blockIds
				.map(id => ({ id, info: this.getBlockById(id) }))
				.filter(entry => entry.info != null);

			if (infos.length === 0) {
				changed = true;
				continue;
			}

			const firstParent = infos[0].info.parentPath;
			const siblings = infos.filter(entry => this._pathsEqual(entry.info.parentPath, firstParent));
			const nextIds = siblings.map(entry => entry.id);

			if (nextIds.length < 2) {
				changed = true;
				continue;
			}

			if (nextIds.length !== group.blockIds.length ||
				nextIds.some((id, i) => id !== group.blockIds[i])) {
				changed = true;
				nextGroups.push({ ...group, blockIds: nextIds });
			} else {
				nextGroups.push(group);
			}
		}

		if (changed) {
			this.set('disjunctionGroups', nextGroups);
		}
	},

	_clusterGroupMembers: function(groupId) {
		const group = this.getDisjunctionGroups().find(g => g.id === groupId);
		if (!group) return;
		const infos = group.blockIds.map(id => this.getBlockById(id)).filter(Boolean);
		if (infos.length < 2) return;

		const parentPath = infos[0].parentPath;
		const rows = JSON.parse(JSON.stringify(this.getRows()));
		const parentArray = this._getContainerChildren(rows, parentPath);

		const memberIdSet = new Set(group.blockIds);
		const members = [];
		const rest = [];
		let firstMemberIdx = -1;

		parentArray.forEach((row, idx) => {
			if (row.kind === 'block' && memberIdSet.has(row.id)) {
				if (firstMemberIdx < 0) firstMemberIdx = idx;
				members.push(row);
			} else {
				rest.push({ row, originalIdx: idx });
			}
		});

		if (members.length < 2) return;

		// Sort members by their declared order in the group (preserves user intent when editing)
		members.sort((a, b) => group.blockIds.indexOf(a.id) - group.blockIds.indexOf(b.id));

		// Rebuild the parent array: keep non-members before firstMemberIdx in original order,
		// insert all members consecutively, then append remaining non-members.
		const before = rest.filter(r => r.originalIdx < firstMemberIdx).map(r => r.row);
		const after = rest.filter(r => r.originalIdx > firstMemberIdx).map(r => r.row);
		const rebuilt = [...before, ...members, ...after];

		// Replace parent's children in-place
		parentArray.length = 0;
		for (const r of rebuilt) parentArray.push(r);

		this.set('rows', rows);
	},

	// //////////////////////////////////////////////////////////////////
	// Table rendering
	// //////////////////////////////////////////////////////////////////

	updateTable: function() {
		const flatRows = this.getFlatRows();
		const { totalHeight: contentHeight } = this._calculateRowPositions(flatRows);
		const totalHeight = Math.max(contentHeight, HEADER_HEIGHT + MIN_BODY_HEIGHT);
		const optimalWidth = this._calculateOptimalWidth(flatRows);

		this.resize(optimalWidth, totalHeight);
		this.attr('headerText/text', this.get('name') || 'Collection');
	},

	_getGutterWidth: function() {
		return this.getDisjunctionGroups().length > 0 ? GUTTER_WIDTH : 0;
	},

	_calculateOptimalWidth: function(flatRows) {
		const name = this.getName();
		let maxWidth = this._estimateTextWidth(name, 13) + 40;

		flatRows.forEach(row => {
			const indent = row.depth * INDENT_WIDTH;
			const prefix = row.kind === 'block' ? 2 : 0; // ▸/▾ chars
			const nameWidth = this._estimateTextWidth(row.name, 11) + indent + prefix * 11 * 0.6 + COLUMN_PADDING;
			const rightText = this._getRightText(row);
			const typeWidth = this._estimateTextWidth(rightText, 10) + COLUMN_PADDING;
			const rowWidth = nameWidth + typeWidth + COLUMN_PADDING;
			maxWidth = Math.max(maxWidth, rowWidth);
		});

		return Math.max(maxWidth, MIN_WIDTH) + this._getGutterWidth();
	},

	_getRightText: function(row) {
		if (row.kind === 'block') {
			if (!row.cardinalityEnabled) return '';
			return '(' + (row.minCardinality ?? 0) + ',' + (row.maxCardinality ?? 'N') + ')';
		}
		if (row.kind === 'reference') {
			const refType = (row.type && row.type !== 'reference') ? row.type : 'ID';
			const base = refType + ' ref';
			if (row.cardinalityEnabled) {
				return base + ' (' + (row.minCardinality ?? 0) + ',' + (row.maxCardinality ?? 1) + ')';
			}
			return base;
		}
		const type = row.type || '';
		if (row.cardinalityEnabled) {
			return type + ' (' + (row.minCardinality ?? 0) + ',' + (row.maxCardinality ?? 1) + ')';
		}
		return type;
	},

	_estimateTextWidth: function(text, fontSize) {
		if (!text) return 0;
		return text.length * fontSize * 0.6;
	},

	// //////////////////////////////////////////////////////////////////
	// Color
	// //////////////////////////////////////////////////////////////////

	setColor: function(newColor) {
		this.attr('header/fill', newColor);
	},

	toJSON: function() {
		return dia.Element.prototype.toJSON.call(this);
	}
});

// //////////////////////////////////////////////////////////////////
// Collection View
// //////////////////////////////////////////////////////////////////

nosql.CollectionView = dia.ElementView.extend({
	initialize: function() {
		dia.ElementView.prototype.initialize.apply(this, arguments);
		this.listenTo(this.model, 'collection-update', this.onCollectionUpdate);
		this.listenTo(this.model, 'change:size', this.onSizeChange);
	},

	onCollectionUpdate: function() {
		this.renderRows();
		this.update();
	},

	onSizeChange: function() {
		this.renderRows();
	},

	render: function() {
		dia.ElementView.prototype.render.apply(this, arguments);
		this.renderRows();
		return this;
	},

	onRemove: function() {
		if (this._pendingBlockToggle) {
			clearTimeout(this._pendingBlockToggle.timer);
			this._pendingBlockToggle = null;
		}
		if (dia.ElementView.prototype.onRemove) {
			dia.ElementView.prototype.onRemove.apply(this, arguments);
		}
	},

	renderRows: function() {
		if (this._pendingBlockToggle) {
			clearTimeout(this._pendingBlockToggle.timer);
			this._pendingBlockToggle = null;
		}

		const flatRows = this.model.getFlatRows();
		const tableWidth = this.model.size().width;
		const gutterWidth = this.model._getGutterWidth();
		const model = this.model;
		const cellView = this;
		const { positions } = this.model._calculateRowPositions(flatRows);

		this.$el.find('.nosql-row-line, .nosql-row-text, .nosql-row-hit, .nosql-row-hover, .nosql-block-box, .nosql-disjunction-brace').remove();

		// Pass 1: draw block boxes (background rects with border)
		flatRows.forEach((row, visualIndex) => {
			if (row.kind !== 'block') return;

			const y = positions[visualIndex];
			const boxIndent = row.depth * BLOCK_BOX_INDENT;
			const margin = 4;

			// Find the last child's position to calculate box height
			let lastChildIndex = visualIndex;
			if (!row.collapsed) {
				for (let i = visualIndex + 1; i < flatRows.length; i++) {
					if (flatRows[i].depth <= row.depth) break;
					lastChildIndex = i;
				}
			}

			const boxBottom = positions[lastChildIndex] + ROW_HEIGHT;
			const boxBottomPadded = (lastChildIndex > visualIndex) ? boxBottom + BLOCK_INNER_PADDING : boxBottom;
			const boxHeight = boxBottomPadded - y;

			const boxRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
			boxRect.setAttribute('class', 'nosql-block-box');
			boxRect.setAttribute('x', gutterWidth + boxIndent + margin);
			boxRect.setAttribute('y', y);
			boxRect.setAttribute('width', tableWidth - gutterWidth - boxIndent * 2 - margin * 2);
			boxRect.setAttribute('height', boxHeight);
			boxRect.setAttribute('fill', row.color || (row.depth % 2 === 0 ? '#f5f5f8' : '#ededf2'));
			boxRect.setAttribute('stroke', '#999');
			boxRect.setAttribute('stroke-width', '1');
			boxRect.setAttribute('rx', '2');
			boxRect.setAttribute('ry', '2');
			boxRect.setAttribute('pointer-events', 'none');
			this.el.appendChild(boxRect);
		});

		// Pass 1.5: draw disjunction braces in the left gutter
		const groups = this.model.getDisjunctionGroups();
		if (groups.length > 0) {
			const indexByPath = new Map();
			flatRows.forEach((row, idx) => {
				if (row.kind === 'block' && row.id) indexByPath.set(row.id, idx);
			});

			groups.forEach(group => {
				const memberIndices = group.blockIds
					.map(id => indexByPath.get(id))
					.filter(idx => idx != null);
				if (memberIndices.length < 2) return;

				const firstIdx = Math.min(...memberIndices);
				const lastIdx = Math.max(...memberIndices);

				// Compute bottom of last member (account for its children when expanded)
				const lastRow = flatRows[lastIdx];
				let lastChildIdx = lastIdx;
				if (lastRow.kind === 'block' && !lastRow.collapsed) {
					for (let i = lastIdx + 1; i < flatRows.length; i++) {
						if (flatRows[i].depth <= lastRow.depth) break;
						lastChildIdx = i;
					}
				}

				const top = positions[firstIdx];
				const bottom = positions[lastChildIdx] + ROW_HEIGHT;
				const spineX = BRACE_SPINE_INSET;
				const capEnd = GUTTER_WIDTH - BRACE_CAP_INSET;

				const brace = document.createElementNS('http://www.w3.org/2000/svg', 'path');
				brace.setAttribute('class', 'nosql-disjunction-brace');
				brace.setAttribute('d', `M ${capEnd} ${top} L ${spineX} ${top} L ${spineX} ${bottom} L ${capEnd} ${bottom}`);
				brace.setAttribute('stroke', '#666');
				brace.setAttribute('stroke-width', String(BRACE_STROKE_WIDTH));
				brace.setAttribute('fill', 'none');
				brace.setAttribute('stroke-linecap', 'round');
				brace.setAttribute('stroke-linejoin', 'round');
				brace.setAttribute('pointer-events', 'none');
				this.el.appendChild(brace);
			});
		}

		// Pass 2: draw rows (lines, text, hit areas)
		flatRows.forEach((row, visualIndex) => {
			const y = positions[visualIndex];
			const textY = y + (ROW_HEIGHT / 2);
			const indent = row.depth * INDENT_WIDTH;
			const isRef = row.kind === 'reference';
			const isBlock = row.kind === 'block';

			// Row separator: draw line at midpoint between previous depth-0 element and current
			if (row.depth === 0) {
				let prevDepth0Index = -1;
				for (let i = visualIndex - 1; i >= 0; i--) {
					if (flatRows[i].depth === 0) { prevDepth0Index = i; break; }
				}

				if (prevDepth0Index >= 0) {
					// Calculate where previous element visually ends
					const prevRow = flatRows[prevDepth0Index];
					let prevEnd;
					if (prevRow.kind === 'block') {
						let lastChildIdx = prevDepth0Index;
						if (!prevRow.collapsed) {
							for (let i = prevDepth0Index + 1; i < flatRows.length; i++) {
								if (flatRows[i].depth <= prevRow.depth) break;
								lastChildIdx = i;
							}
						}
						prevEnd = positions[lastChildIdx] + ROW_HEIGHT;
					} else {
						prevEnd = positions[prevDepth0Index] + ROW_HEIGHT;
					}

					const lineY = Math.round((prevEnd + y) / 2);
					const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
					line.setAttribute('class', 'nosql-row-line');
					line.setAttribute('x1', 0);
					line.setAttribute('y1', lineY);
					line.setAttribute('x2', tableWidth);
					line.setAttribute('y2', lineY);
					line.setAttribute('stroke', '#e0e0e0');
					line.setAttribute('stroke-width', '1');
					this.el.appendChild(line);
				}
			}

			if (isBlock) {
				const hitArea = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
				hitArea.setAttribute('class', 'nosql-row-hit');
				hitArea.setAttribute('x', 0);
				hitArea.setAttribute('y', y);
				hitArea.setAttribute('width', tableWidth);
				hitArea.setAttribute('height', ROW_HEIGHT);
				hitArea.setAttribute('fill', 'transparent');
				hitArea.setAttribute('cursor', 'pointer');
				const rowPath = row.path;
				hitArea.addEventListener('click', function(evt) {
					evt.stopPropagation();
					const pending = cellView._pendingBlockToggle;
					const sameRow = pending
						&& pending.path.length === rowPath.length
						&& pending.path.every((v, i) => v === rowPath[i]);
					if (sameRow) {
						clearTimeout(pending.timer);
						cellView._pendingBlockToggle = null;
						hitArea.dispatchEvent(new CustomEvent('nosql:row:dblclick', {
							bubbles: true,
							detail: { path: rowPath, modelId: model.id },
						}));
						return;
					}
					if (pending) {
						clearTimeout(pending.timer);
						model.toggleBlockCollapse(pending.path);
					}
					const timer = setTimeout(() => {
						cellView._pendingBlockToggle = null;
						model.toggleBlockCollapse(rowPath);
					}, 200);
					cellView._pendingBlockToggle = { path: rowPath, timer };
				});
				this.el.appendChild(hitArea);
			}

			// Hover highlight rect (non-block rows)
			if (!isBlock) {
				const hoverRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
				hoverRect.setAttribute('class', 'nosql-row-hover');
				hoverRect.setAttribute('x', 0);
				hoverRect.setAttribute('y', y);
				hoverRect.setAttribute('width', tableWidth);
				hoverRect.setAttribute('height', ROW_HEIGHT);
				hoverRect.setAttribute('fill', 'transparent');
				hoverRect.setAttribute('pointer-events', 'fill');
				const rowPath = row.path;
				hoverRect.addEventListener('dblclick', function(evt) {
					evt.stopPropagation();
					hoverRect.dispatchEvent(new CustomEvent('nosql:row:dblclick', {
						bubbles: true,
						detail: { path: rowPath, modelId: model.id },
					}));
				});
				this.el.appendChild(hoverRect);
			}

			// Row name
			const nameText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
			nameText.setAttribute('class', 'nosql-row-text');
			nameText.setAttribute('x', gutterWidth + 8 + indent);
			nameText.setAttribute('y', textY);
			nameText.setAttribute('text-anchor', 'start');
			nameText.setAttribute('dominant-baseline', 'middle');
			nameText.setAttribute('font-size', '11');
			nameText.setAttribute('font-family', FONT_FAMILY);

			if (isBlock) {
				nameText.setAttribute('fill', '#444');
				nameText.setAttribute('font-weight', '600');
				nameText.setAttribute('pointer-events', 'none');
				const arrow = row.collapsed ? '\u25B8 ' : '\u25BE ';
				nameText.textContent = arrow + row.name;
			} else if (isRef) {
				nameText.setAttribute('fill', '#5a6abf');
				nameText.setAttribute('font-style', 'italic');
				nameText.textContent = row.name;
			} else if (row.identifier) {
				nameText.setAttribute('fill', '#00997f');
				nameText.setAttribute('font-weight', '600');
				nameText.textContent = row.name;
			} else {
				nameText.setAttribute('fill', '#333');
				nameText.textContent = row.name;
			}

			this.el.appendChild(nameText);

			// Right text (type / cardinality)
			const rightText = this.model._getRightText(row);
			if (rightText) {
				const typeText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
				typeText.setAttribute('class', 'nosql-row-text');
				typeText.setAttribute('x', tableWidth - 8);
				typeText.setAttribute('y', textY);
				typeText.setAttribute('text-anchor', 'end');
				typeText.setAttribute('dominant-baseline', 'middle');
				typeText.setAttribute('font-size', '10');
				typeText.setAttribute('font-family', FONT_FAMILY);
				typeText.setAttribute('fill', '#666');
				if (isBlock) typeText.setAttribute('pointer-events', 'none');
				typeText.textContent = rightText;
				this.el.appendChild(typeText);
			}
		});
	}
});

export default nosql;
