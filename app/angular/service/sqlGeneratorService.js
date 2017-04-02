angular.module('myapp').factory('SqlGeneratorService', function() {

  var pending = {};
  var createdMap = {};

  _generate = function (model) {

    pending = new Map();
    createdMap = new Map();

    var sql = "";
    var keys = model.keys();

    for (key of keys) {
      var table = model.get(key);
      sql += createTable(key, table);
      createdMap.set(key, table);
    }

    var pendingKeys = pending.keys();
    for (key of pendingKeys) {
      var table = model.get(key);
      sql += createAlterTable(key, table);
    }
    return sql;
  }

  createAlterTable = function(key, table){
    var alter = "";
    for (column of table.columns) {
      if(column.FK){
        var originTable = createdMap.get(column.tableOrigin.idOrigin).name;
        alter = "ALTER TABLE " + table.name + " ADD FOREIGN KEY("
                + cleanString(column.name)
                + ") REFERENCES " + originTable + " ("+ cleanString(column.name) + ")\n";
      }
    }
    return alter;
  }

  createTable = function(key, table){
    var create = "CREATE TABLE " + table.name + " \n";
    create += "( \n";
    for (column of table.columns) {
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

  cleanString = function(name){
    var newName = name.replace(": PK", "");
    newName = newName.replace(": FK", "");
    return newName;
  }

  return {
    generate : _generate
  }

});
