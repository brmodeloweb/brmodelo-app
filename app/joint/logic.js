import { dia } from '@joint/core';

const logic = {};

logic.Table = dia.Element.define('logic.Table', {
	size: { width: 100, height: 100 },
	attrs: {
		root: {
			magnetSelector: 'body'
		},
		body: {
			width: 'calc(w)',
			height: 'calc(h)',
			stroke: '#999',
			strokeWidth: 1,
			fill: '#ffffff',
			rx: 0,
			ry: 0
		},
		header: {
			width: 'calc(w)',
			height: 40,
			stroke: '#999',
			strokeWidth: 1,
			fill: '#ffffff',
			rx: 0,
			ry: 0
		},
		headerText: {
			text: 'Table',
			textAnchor: 'middle',
			textVerticalAnchor: 'middle',
			x: 'calc(w/2)',
			y: 20,
			fontSize: 14,
			fontWeight: 'bold',
			fontFamily: 'BlinkMacSystemFont,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif',
			fill: '#666'
		}
	},

	name: '',
	rows: [],
	rowHeight: 30,
	headerHeight: 40,
	minBodyHeight: 60,
	columnWidths: {
		name: 0.4,
		metadata: 0.6
	}
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

		this.on('change:name change:rows', function() {
			this.updateTable();
			this.trigger('table-update');
		}, this);

		this.updateTable();
	},

	getName: function() {
		return this.get('name') || '';
	},

	getRows: function() {
		return this.get('rows');
	},

	getRowHeight: function() {
		return this.get('rowHeight') || 30;
	},

	getHeaderHeight: function() {
		return this.get('headerHeight') || 40;
	},

	getMinBodyHeight: function() {
		return this.get('minBodyHeight') || 60;
	},

	setTableName: function(name) {
		this.set('name', name);
		this.attr('headerText/text', name);
	},

	addRow: function(rowData) {
		const currentRows = this.get('rows');
		const newRow = this._normalizeRow(rowData);
		this.set('rows', [...currentRows, newRow]);
		this.updateTable();
		this.trigger('table-update');
		return currentRows.length;
	},

	deleteRow: function(index) {
		const rows = this.get('rows');
		if (index >= 0 && index < rows.length) {
			this.set('rows', rows.filter((_, i) => i !== index));
			this.updateTable();
			this.trigger('table-update');
			return true;
		}
		return false;
	},

	editRow: function(index, rowData) {
		const rows = this.get('rows');
		if (index >= 0 && index < rows.length) {
			const newRows = [...rows];
			newRows[index] = this._normalizeRow(rowData);
			this.set('rows', newRows);
			this.updateTable();
			this.trigger('table-update');
			return true;
		}
		return false;
	},

	moveRow: function(fromIndex, toIndex) {
		const rows = this.get('rows');
		if (fromIndex === toIndex ||
			fromIndex < 0 || fromIndex >= rows.length ||
			toIndex < 0 || toIndex >= rows.length) {
			return false;
		}
		const newRows = [...rows];
		const [moved] = newRows.splice(fromIndex, 1);
		newRows.splice(toIndex, 0, moved);
		this.set('rows', newRows);
		this.updateTable();
		this.trigger('table-update');
		return true;
	},

	getRow: function(index) {
		const rows = this.get('rows');
		return rows[index] || null;
	},

	clearRows: function() {
		this.set('rows', []);
		this.updateTable();
		this.trigger('table-update');
	},

	_normalizeRow: function(rowData) {
		if (typeof rowData === 'string') {
			return {
				name: rowData,
				type: '',
				PK: false,
				FK: false,
				NOT_NULL: false,
				UNIQUE: false,
				AUTO_INCREMENT: false,
				isPrimaryKey: false,
				isForeignKey: false,
				isNotNull: false,
				isUnique: false,
				isAutoIncrement: false
			};
		}

		const normalized = {
			name: rowData.name || '',
			type: rowData.type || '',
			PK: rowData.PK !== undefined ? rowData.PK : (rowData.isPrimaryKey || false),
			FK: rowData.FK !== undefined ? rowData.FK : (rowData.isForeignKey || false),
			NOT_NULL: rowData.NOT_NULL !== undefined ? rowData.NOT_NULL : (rowData.isNotNull || false),
			UNIQUE: rowData.UNIQUE !== undefined ? rowData.UNIQUE : (rowData.isUnique || false),
			AUTO_INCREMENT: rowData.AUTO_INCREMENT !== undefined ? rowData.AUTO_INCREMENT : (rowData.isAutoIncrement || false),
			defaultValue: rowData.defaultValue !== undefined ? rowData.defaultValue : (rowData.default || null),
			tableOrigin: rowData.tableOrigin || null
		};

		normalized.isPrimaryKey = normalized.PK;
		normalized.isForeignKey = normalized.FK;
		normalized.isNotNull = normalized.NOT_NULL;
		normalized.isUnique = normalized.UNIQUE;
		normalized.isAutoIncrement = normalized.AUTO_INCREMENT;

		return normalized;
	},

	_formatRowText: function(row) {
		const constraints = [];
		if (row.isPrimaryKey) constraints.push('PK');
		if (row.isForeignKey) constraints.push('FK');

		return {
			name: row.name || '',
			type: row.type || '',
			constraints: constraints.join(', ')
		};
	},

	_estimateTextWidth: function(text, fontSize) {
		if (!text) return 0;
		return text.length * fontSize * 0.6;
	},

	_calculateOptimalWidth: function() {
		const rows = this.get('rows');
		const name = this.get('name') || 'Table';
		const headerPadding = 20;
		const columnPadding = 10;
		const minNameWidth = 50;
		const minMetadataWidth = 50;
		const minTotalWidth = 100;

		if (rows.length === 0) {
			return {
				totalWidth: minTotalWidth,
				nameColumnRatio: 0.5,
				metadataColumnRatio: 0.5
			};
		}

		let maxNameWidth = this._estimateTextWidth(name, 14) + headerPadding;
		let maxMetadataWidth = 0;

		rows.forEach(row => {
			const rowData = this._formatRowText(row);

			const nameWidth = this._estimateTextWidth(rowData.name, 12) + columnPadding;
			maxNameWidth = Math.max(maxNameWidth, nameWidth);

			const constraintsWidth = this._estimateTextWidth(rowData.constraints, 10);
			const typeWidth = this._estimateTextWidth(rowData.type, 10);
			const totalMetadataWidth = constraintsWidth + typeWidth + (rowData.constraints ? 10 : 0) + columnPadding;
			maxMetadataWidth = Math.max(maxMetadataWidth, totalMetadataWidth);
		});

		maxNameWidth = Math.max(maxNameWidth, minNameWidth);
		maxMetadataWidth = Math.max(maxMetadataWidth, minMetadataWidth);

		const totalWidth = Math.max(maxNameWidth + maxMetadataWidth, minTotalWidth);
		const nameRatio = maxNameWidth / totalWidth;

		return {
			totalWidth: totalWidth,
			nameColumnRatio: nameRatio,
			metadataColumnRatio: 1 - nameRatio
		};
	},

	updateTable: function() {
		const rows = this.get('rows');
		const rowHeight = this.getRowHeight();
		const headerHeight = this.getHeaderHeight();
		const minBodyHeight = this.getMinBodyHeight();

		const optimalDimensions = this._calculateOptimalWidth();
		this.set('columnWidths', {
			name: optimalDimensions.nameColumnRatio,
			metadata: optimalDimensions.metadataColumnRatio
		});

		const rowsHeight = rows.length * rowHeight;
		const bodyHeight = Math.max(rowsHeight, minBodyHeight);
		const totalHeight = headerHeight + bodyHeight;

		this.resize(optimalDimensions.totalWidth, totalHeight);

		this.attr('headerText/text', this.get('name') || 'Table');

		this._removeRowElements();

		rows.forEach((row, index) => {
			this._addRowElement(row, index);
		});
	},

	_removeRowElements: function() {
		const attrs = this.attr();
		Object.keys(attrs).forEach(key => {
			if (key.startsWith('row-') || key.startsWith('rowSeparator-')) {
				this.removeAttr(key);
			}
		});
	},

	_addRowElement: function(row, index) {
		const rowHeight = this.getRowHeight();
		const headerHeight = this.getHeaderHeight();
		const yPosition = headerHeight + (index * rowHeight);
		const columnWidths = this.get('columnWidths');

		this.attr(`rowSeparator-${index}`, {
			x1: 0,
			y1: yPosition,
			x2: 'calc(w)',
			y2: yPosition,
			stroke: '#eeeeee',
			strokeWidth: 1
		});

		const rowData = this._formatRowText(row);
		const textY = yPosition + (rowHeight / 2);

		this.attr(`row-${index}-name`, {
			text: rowData.name,
			x: 5,
			y: textY,
			textAnchor: 'start',
			textVerticalAnchor: 'middle',
			fontSize: 12,
			fontFamily: 'BlinkMacSystemFont,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif',
			fill: '#333'
		});

		const sep1X = `calc(w*${columnWidths.name})`;
		this.attr(`rowSeparator-${index}-v1`, {
			x1: sep1X,
			y1: yPosition,
			x2: sep1X,
			y2: yPosition + rowHeight,
			stroke: '#eeeeee',
			strokeWidth: 1
		});

		this.attr(`row-${index}-type`, {
			text: rowData.type,
			x: 'calc(w - 5)',
			y: textY,
			textAnchor: 'end',
			textVerticalAnchor: 'middle',
			fontSize: 10,
			fontFamily: 'BlinkMacSystemFont,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif',
			fill: '#666'
		});

		if (rowData.constraints) {
			this.attr(`row-${index}-constraints`, {
				text: rowData.constraints + '  ',
				x: 'calc(w - 5)',
				y: textY,
				textAnchor: 'end',
				textVerticalAnchor: 'middle',
				fontSize: 10,
				fontFamily: 'BlinkMacSystemFont,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif',
				fill: 'var(--brand-primary-30)',
				fontWeight: 'bold',
				refX: `row-${index}-type`,
				refDx: -2
			});
		}
	},

	setColor: function(newColor) {
		this.attr('header/fill', newColor);
	},

	getType: function() {
		return 'Table';
	},

	toJSON: function() {
		const json = dia.Element.prototype.toJSON.call(this);
		return json;
	}
});

logic.TableView = dia.ElementView.extend({
	initialize: function() {
		dia.ElementView.prototype.initialize.apply(this, arguments);

		this.listenTo(this.model, 'table-update', this.onTableUpdate);

		this.listenTo(this.model, 'change:size', this.onSizeChange);
	},

	onTableUpdate: function() {
		this.renderRows();
		this.update();
	},

	onSizeChange: function() {
		this.renderRows();
	},

	updateSize: function() {
		requestAnimationFrame(() => {
			// requestAnimationFrame is inherently async — the model may have
			// been removed from the graph before this callback fires (e.g.
			// during a conversion that rebuilds tables). JointJS nulls
			// model.graph on removal, so guard against it.
			if (!this.model?.graph) return;
			const links = this.model.graph.getConnectedLinks(this.model);
			links.forEach(link => {
				const linkView = this.paper.findViewByModel(link);
				if (linkView?.update) linkView.update();
			});
		});
	},

	render: function() {
		dia.ElementView.prototype.render.apply(this, arguments);
		this.renderRows();
		return this;
	},

	renderRows: function() {
		const rows = this.model.getRows();
		const rowHeight = this.model.getRowHeight();
		const headerHeight = this.model.getHeaderHeight();
		const columnWidths = this.model.get('columnWidths');
		const tableWidth = this.model.size().width;

		this.$el.find('.row-line, .row-vsep, .row-text').remove();

		rows.forEach((row, index) => {
			const yPosition = headerHeight + (index * rowHeight);
			const textY = yPosition + (rowHeight / 2);
			const rowData = this.model._formatRowText(row);

			const hLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
			hLine.setAttribute('class', 'row-line');
			hLine.setAttribute('x1', 0);
			hLine.setAttribute('y1', yPosition + rowHeight);
			hLine.setAttribute('x2', tableWidth);
			hLine.setAttribute('y2', yPosition + rowHeight);
			hLine.setAttribute('stroke', '#e0e0e0');
			hLine.setAttribute('stroke-width', '1');
			this.el.appendChild(hLine);

			const nameText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
			nameText.setAttribute('class', 'row-text');
			nameText.setAttribute('x', 5);
			nameText.setAttribute('y', textY);
			nameText.setAttribute('text-anchor', 'start');
			nameText.setAttribute('dominant-baseline', 'middle');
			nameText.setAttribute('font-size', '12');
			nameText.setAttribute('font-family', 'BlinkMacSystemFont,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif');
			nameText.setAttribute('fill', '#333');
			nameText.textContent = rowData.name;
			this.el.appendChild(nameText);

			const vSep1X = tableWidth * columnWidths.name;
			const vSep1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
			vSep1.setAttribute('class', 'row-vsep');
			vSep1.setAttribute('x1', vSep1X);
			vSep1.setAttribute('y1', yPosition);
			vSep1.setAttribute('x2', vSep1X);
			vSep1.setAttribute('y2', yPosition + rowHeight);
			vSep1.setAttribute('stroke', '#eeeeee');
			vSep1.setAttribute('stroke-width', '1');
			this.el.appendChild(vSep1);

			const metadataText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
			metadataText.setAttribute('class', 'row-text');
			metadataText.setAttribute('x', tableWidth - 5);
			metadataText.setAttribute('y', textY);
			metadataText.setAttribute('text-anchor', 'end');
			metadataText.setAttribute('dominant-baseline', 'middle');
			metadataText.setAttribute('font-size', '10');
			metadataText.setAttribute('font-family', 'BlinkMacSystemFont,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif');

			if (rowData.constraints) {
				const constraintsTspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
				constraintsTspan.setAttribute('fill', 'var(--brand-primary-30)');
				constraintsTspan.setAttribute('font-weight', 'bold');
				constraintsTspan.textContent = rowData.constraints + '  ';
				metadataText.appendChild(constraintsTspan);
			}

			if (rowData.type) {
				const typeTspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
				typeTspan.setAttribute('fill', '#666');
				typeTspan.textContent = rowData.type;
				metadataText.appendChild(typeTspan);
			}

			this.el.appendChild(metadataText);
		});
	}
});

export default logic;
