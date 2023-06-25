import angular from "angular";
import { comparasionOperators } from "./queryExpressionService";

const REGEX_TABLE_COLUMN_NAME = /^(?<table>[^.]+)\.(?<column>[^.]+)$/;

const sqlGeneratorService = () => {
	const constraints = [
		{ key: 'PK', sqlValue: "PRIMARY KEY" },
		{ key: 'NOT_NULL', sqlValue: "NOT NULL" },
		{ key: 'AUTO_INCREMENT', sqlValue: "AUTO_INCREMENT" },
	];

	var pending = {};
	var createdMap = {};

	const _generate = function (model, views) {

		pending = new Map();
		createdMap = new Map();

		var sql = "";
		var keys = model.keys();

		for (const key of keys) {
			var table = model.get(key);
			sql += createTable(key, table);
			createdMap.set(key, table);
		}

		var pendingKeys = pending.keys();
		for (const key of pendingKeys) {
			var table = model.get(key);
			sql += createAlterTable(key, table);
		}

		views.forEach(view => {
			sql += createViewScript(view);
		});

		return sql;
	}

	const filterTableColumn = (tables, column) => tables.some(table => column.includes(table));

	const filterSelectedItem = item => item.selected;

	const mapViewSelectedColumn = (table, hasMultipleTables) => table.columns.filter(filterSelectedItem).map(column => `${hasMultipleTables ? table?.name + '.' : ''}${cleanString(column?.name)}`).join(", ");

	const filterTableWithColunmsSelected = table => table.columns.some(filterSelectedItem);

	const createViewJoins = (view, baseTable) => {
		if (view.queryConditions && view.queryConditions.joins) {
			let tables = [baseTable];
			const joins = view.queryConditions.joins.filter(join => join.submitted).map(join => {
				const attributeName = `columnName${filterTableColumn(tables, join.columnNameOrigin.match(REGEX_TABLE_COLUMN_NAME).groups.table) ? 'Target' : 'Origin'}`;
				const joinTable = join[attributeName].match(REGEX_TABLE_COLUMN_NAME).groups.table;
				tables.push(joinTable);
				return ({ ...join, table: joinTable });
			});
			return joins.map(join => `\nINNER JOIN ${join.table} ON ${cleanString(join.columnNameOrigin)} = ${cleanString(join.columnNameTarget)}`)
		} else {
			return '';
		}
	};

	const getWhereCondition = view => {
		if (view.queryConditions && view.queryConditions.text) {
			return `WHERE ${view.queryConditions.text}\n`;
		} else {
			return '';
		}
	};

	const createViewScript = (view) => {
		const selectedTables = view.tables.filter(filterSelectedItem);
		if (selectedTables.length > 0) {
			const hasMultipleTables = selectedTables.length > 1;
			const baseTable = selectedTables[0]?.name;
			return `\nCREATE VIEW ${view.name} AS \nSELECT ${selectedTables.filter(filterTableWithColunmsSelected).map(table => mapViewSelectedColumn(table, hasMultipleTables)).join(", ")}\nFROM ${baseTable}${createViewJoins(view, baseTable)}\n${getWhereCondition(view)}`
		}
		return '';
	}

	const createAlterTable = function(key, table){
		var alter = "";
		for (const column of table.columns) {
			if(column.FK){
				var originTable = createdMap.get(column.tableOrigin.idOrigin)?.name;
				alter += "ALTER TABLE " + table?.name + " ADD FOREIGN KEY(" + cleanString(column?.name) + ") REFERENCES " + originTable + " ("+ cleanString(column?.name) + ")\n";
			}
		}
		return alter;
	}

	const buildConstraintCheck = (name, checkConstraint) => {
		return `${cleanString(name)} ${checkConstraint.checkExpression || comparasionOperators[checkConstraint.type](checkConstraint.comparativeValue, checkConstraint.comparativeValue2)}`
	}

	const createTable = function(key, table){
		var create = "CREATE TABLE " + table?.name + " \n";
		create += "( \n";
		const hasCheckConstraint = table.columns.some(column => column.checkConstraint);
		const hasUniqueConstraint = table.columns.some(column => column.UNIQUE);
		let checkConstraint = '';
		table.columns.forEach((column, index) => {
			var alreadyCreated = createdMap.get(key);

			create += " " + cleanString(column?.name) + " " + column.type;

			constraints.forEach(({ key, sqlValue }) => {
				if (column[key]) create += ` ${sqlValue}`;
			});

			if (column.defaultValue) {
				create += ` DEFAULT '${column.defaultValue}'`
			}
			create += ", " + " \n";

			if (column.FK){
				pending.set(key, table);
			}
		})

		if (hasCheckConstraint) {
			checkConstraint = ` CHECK (${table.columns.filter(column => column.checkConstraint)
				.map(({ name, checkConstraint }, index) => `${index === 0 ? '': ' AND '}${buildConstraintCheck(name, checkConstraint)}`).join("")})${hasUniqueConstraint ? ',' : ''}`
			create += checkConstraint + "\n";
		}

		if (hasUniqueConstraint) {
			create += ` UNIQUE (${table.columns.filter(column => column.UNIQUE).map(({ name }) => `${name}`)})` + "\n";
		}

		create += "); \n\n"
		return create;
	}

	const cleanString = function(name){
		var newName = name.replace(": PK", "");
		newName = newName.replace(": FK", "");
		return newName;
	}

	return {
		generate : _generate
	}

}

export default angular
	.module("app.SqlGeneratorService", [])
	.factory("SqlGeneratorService", sqlGeneratorService).name;