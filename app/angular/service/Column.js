export default class Column {
	constructor({ name = "", PK = false, FK = false, type = "INT", idOrigin = "", idLink = "" } = {}) {
		this.FK = FK;
		this.PK = PK;
		this.NOT_NULL = false;
		this.UNIQUE = false;
		this.AUTO_INCREMENT = false;
		this.defaultValue = "";
		this.name = name;
		this.tableOrigin = {
			idOrigin,
			idLink,
			idName: "",
		}
		this.type = type;
	}
}
