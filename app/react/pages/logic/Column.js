export default class Column {
	constructor({ name = "", PK = false, FK = false, type = "INT", idOrigin = "", idLink = "", tableOrigin = null } = {}) {
		this.FK = FK;
		this.PK = PK;
		this.NOT_NULL = false;
		this.UNIQUE = false;
		this.AUTO_INCREMENT = false;
		this.defaultValue = "";
		this.name = name;
		this.tableOrigin = tableOrigin || {
			idOrigin,
			idLink,
			idName: "",
		};
		this.type = type;
	}
}
