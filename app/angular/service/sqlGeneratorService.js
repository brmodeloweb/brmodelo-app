angular.module('myapp').factory('SqlGeneratorService', function(){

  _generate = function (model) {
    var sql = "";
    var keys = model.keys();
    for (key of keys) {
      var table = model.get(key);
      console.log(table);
      sql += createTable(key, table);
    }
    return sql;
  }

  createTable = function(tableName, columns){
    var create = "CREATE TABLE " + tableName + " \n";
    create += "( \n";
    for (column of columns) {
      create += " " + column.name + " " + column.type + ", " + " \n";
    }
    create += "); \n\n"
    return create;
  }

  return {
    generate : _generate
  }

});
