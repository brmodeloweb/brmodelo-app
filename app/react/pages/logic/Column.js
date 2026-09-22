export default class Column {
	constructor({
		name = "",
		PK = false,
		FK = false,
		type = "INT",
		length = undefined,
		precision = undefined,
		scale = undefined,
		idOrigin = "",
		idLink = "",
		tableOrigin = null,
	} = {}) {
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
		if (length != null) this.length = length;
		if (precision != null) this.precision = precision;
		if (scale != null) this.scale = scale;
	}
}
