import { parseCardinality, resolveLogicalCardinality } from "./logicalCardinality";

describe("parseCardinality", () => {
	test("parses spaced and compact forms", () => {
		expect(parseCardinality("(0, 1)")).toEqual({ min: "0", max: "1" });
		expect(parseCardinality("(1,n)")).toEqual({ min: "1", max: "n" });
		expect(parseCardinality("( 0 , N )")).toEqual({ min: "0", max: "n" });
	});

	test("returns null for invalid values", () => {
		expect(parseCardinality("")).toBeNull();
		expect(parseCardinality("(2, 1)")).toBeNull();
		expect(parseCardinality("1,1")).toBeNull();
	});
});

describe("resolveLogicalCardinality", () => {
	test("1:N places FK on the N end", () => {
		expect(resolveLogicalCardinality({ cardSource: "(1, 1)", cardTarget: "(0, n)" })).toEqual({
			kind: "1n",
			fkEnd: "target",
			referencedEnd: "source",
			notNull: false,
			unique: false,
		});
		expect(resolveLogicalCardinality({ cardSource: "(0, n)", cardTarget: "(1, 1)" })).toEqual({
			kind: "1n",
			fkEnd: "source",
			referencedEnd: "target",
			notNull: false,
			unique: false,
		});
	});

	test("1:N with mandatory participation sets notNull", () => {
		expect(resolveLogicalCardinality({ cardSource: "(1, 1)", cardTarget: "(1, n)" }).notNull).toBe(true);
	});

	test("1:1 mixed optionality places FK on (0,1) end with UNIQUE", () => {
		expect(resolveLogicalCardinality({ cardSource: "(0, 1)", cardTarget: "(1, 1)" })).toEqual({
			kind: "11",
			fkEnd: "source",
			referencedEnd: "target",
			notNull: false,
			unique: true,
		});
		expect(resolveLogicalCardinality({ cardSource: "(1, 1)", cardTarget: "(0, 1)" })).toEqual({
			kind: "11",
			fkEnd: "target",
			referencedEnd: "source",
			notNull: false,
			unique: true,
		});
	});

	test("1:1 symmetric keeps FK on target", () => {
		expect(resolveLogicalCardinality({ cardSource: "(1, 1)", cardTarget: "(1, 1)" })).toEqual({
			kind: "11",
			fkEnd: "target",
			referencedEnd: "source",
			notNull: true,
			unique: true,
		});
	});

	test("N:N is detected", () => {
		expect(resolveLogicalCardinality({ cardSource: "(0, n)", cardTarget: "(1, n)" }).kind).toBe("nn");
	});

	test("invalid cards return invalid", () => {
		expect(resolveLogicalCardinality({ cardSource: "x", cardTarget: "(1, 1)" }).kind).toBe("invalid");
	});
});
