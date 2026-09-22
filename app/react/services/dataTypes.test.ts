import {
	applyTypeDefaults,
	clearIrrelevantParams,
	conceptualToLogicalType,
	formatColumnType,
	formatNosqlType,
	getSqlTypeOptions,
	isStringSqlType,
	mapSqlTypeToNosql,
	parseLegacyType,
	validateTypeParams,
} from "./dataTypes";

describe("dataTypes", () => {
	test("exposes expanded SQL type catalog", () => {
		const names = getSqlTypeOptions().map((option) => option.type);
		expect(names).toEqual(expect.arrayContaining([
			"VARCHAR",
			"CHAR",
			"DECIMAL",
			"NUMERIC",
			"TEXT",
			"BIGINT",
			"UUID",
			"TIMESTAMP",
		]));
	});

	test("applyTypeDefaults fills VARCHAR and DECIMAL params", () => {
		expect(applyTypeDefaults("VARCHAR")).toEqual({ type: "VARCHAR", length: 255 });
		expect(applyTypeDefaults("CHAR")).toEqual({ type: "CHAR", length: 1 });
		expect(applyTypeDefaults("DECIMAL")).toEqual({ type: "DECIMAL", precision: 10, scale: 2 });
		expect(applyTypeDefaults("INT")).toEqual({ type: "INT" });
	});

	test("formatColumnType renders parameterized SQL types", () => {
		expect(formatColumnType({ type: "VARCHAR", length: 255 })).toBe("VARCHAR(255)");
		expect(formatColumnType({ type: "DECIMAL", precision: 10, scale: 2 })).toBe("DECIMAL(10,2)");
		expect(formatColumnType({ type: "INT" })).toBe("INT");
		expect(formatColumnType({ type: "VARCHAR(100)" })).toBe("VARCHAR(100)");
	});

	test("parseLegacyType supports parameterized and placeholder forms", () => {
		expect(parseLegacyType("VARCHAR(255)")).toEqual({ type: "VARCHAR", length: 255 });
		expect(parseLegacyType("DECIMAL(10,2)")).toEqual({ type: "DECIMAL", precision: 10, scale: 2 });
		expect(parseLegacyType("VARCHAR(n)")).toEqual({ type: "VARCHAR" });
		expect(parseLegacyType("CHAR(n)")).toEqual({ type: "CHAR" });
	});

	test("clearIrrelevantParams removes unused fields", () => {
		expect(clearIrrelevantParams({ type: "INT", length: 10, precision: 5, scale: 2 })).toEqual({
			type: "INT",
		});
		expect(clearIrrelevantParams({ type: "VARCHAR", length: 50, precision: 5 })).toEqual({
			type: "VARCHAR",
			length: 50,
		});
	});

	test("validateTypeParams enforces length and precision/scale rules", () => {
		expect(validateTypeParams({ type: "VARCHAR", length: 0 })).toContain("Length must be a positive integer");
		expect(validateTypeParams({ type: "DECIMAL", precision: 5, scale: 6 })).toContain(
			"Scale cannot be greater than precision",
		);
		expect(validateTypeParams({ type: "VARCHAR", length: 255 })).toEqual([]);
	});

	test("isStringSqlType recognizes VARCHAR/CHAR/TEXT variants", () => {
		expect(isStringSqlType("VARCHAR")).toBe(true);
		expect(isStringSqlType("VARCHAR(255)")).toBe(true);
		expect(isStringSqlType("CHAR(n)")).toBe(true);
		expect(isStringSqlType("TEXT")).toBe(true);
		expect(isStringSqlType("INT")).toBe(false);
	});

	test("conceptualToLogicalType defaults missing dataType to VARCHAR(255)", () => {
		expect(conceptualToLogicalType({})).toEqual({ type: "VARCHAR", length: 255 });
		expect(conceptualToLogicalType({ dataType: "DECIMAL", precision: 8, scale: 3 })).toEqual({
			type: "DECIMAL",
			precision: 8,
			scale: 3,
		});
	});

	test("mapSqlTypeToNosql maps SQL types and preserves string length", () => {
		expect(mapSqlTypeToNosql({ dataType: "VARCHAR", length: 100 })).toEqual({
			type: "string",
			length: 100,
		});
		expect(mapSqlTypeToNosql({ dataType: "BIGINT" })).toEqual({ type: "long" });
		expect(mapSqlTypeToNosql({ dataType: "DECIMAL", precision: 10, scale: 2 })).toEqual({
			type: "decimal",
			precision: 10,
			scale: 2,
		});
		expect(mapSqlTypeToNosql({ dataType: "INT" }, { isKey: true })).toEqual({ type: "ID" });
	});

	test("formatNosqlType includes optional params", () => {
		expect(formatNosqlType({ type: "string", length: 255 })).toBe("string(255)");
		expect(formatNosqlType({ type: "decimal", precision: 10, scale: 2 })).toBe("decimal(10,2)");
		expect(formatNosqlType({ type: "int" })).toBe("int");
	});
});
