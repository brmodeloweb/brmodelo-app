import angular from "angular";

const sqlGeneratorService = () => {

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
		for (const column of table.columns) {
			var alreadyCreated = createdMap.get(key);

			create += " " + cleanString(column.name) + " " + column.type;
			if(column.PK){
				create += " PRIMARY KEY";
			}
			create += ", " + " \n";

			if(column.FK){
				pending.set(key, table);
			}
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