import angular from "angular";
import { comparasionOperators } from "./queryExpressionService";

const sqlGeneratorService = () => {
	const constraints = [
		{ key: 'PK', sqlValue: "PRIMARY KEY" },
		{ key: 'NOT_NULL', sqlValue: "NOT NULL" },
		{ key: 'AUTO_INCREMENT', sqlValue: "AUTO_INCREMENT" },
	];

	var pending = {};
	var createdMap = {};

	const _generate = function (model) {

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
		return sql;
	}

	const createAlterTable = function(key, table){
		var alter = "";
		for (const column of table.columns) {
			if(column.FK){
				var originTable = createdMap.get(column.tableOrigin.idOrigin).name;
				alter += "ALTER TABLE " + table.name + " ADD FOREIGN KEY(" + cleanString(column.name) + ") REFERENCES " + originTable + " ("+ cleanString(column.name) + ")\n";
			}
		}
		return alter;
	}

	const createTable = function(key, table){
		var create = "CREATE TABLE " + table.name + " \n";
		create += "( \n";
		const hasCheckConstraint = table.columns.some(column => column.checkConstraint);
		const hasUniqueConstraint = table.columns.some(column => column.UNIQUE);
		let checkConstraint = '';
		table.columns.forEach((column, index) => {
			var alreadyCreated = createdMap.get(key);

			create += " " + cleanString(column.name) + " " + column.type;

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
				.map(({ name, checkConstraint }, index) => `${index === 0 ? '': ' AND '}${name} ${comparasionOperators[checkConstraint.type](checkConstraint.comparativeValue, checkConstraint.comparativeValue2)}`).join("")})${hasUniqueConstraint ? ',' : ''}`
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