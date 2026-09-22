import { describe, expect, test } from "@jest/globals";
import { generate, validateLogicModelForSql } from "./sqlGenerator";

describe("validateLogicModelForSql", () => {
	test("flags empty models", () => {
		expect(validateLogicModelForSql(new Map())).toEqual(["Model has no tables"]);
	});

	test("flags invalid identifiers and empty tables", () => {
		const model = new Map([
			["1", { name: "Meus Clientes", columns: [{ name: "id", type: "INT", PK: true }] }],
			["2", { name: "Valid", columns: [] }],
			["3", { name: "ok", columns: [{ name: "preco$", type: "INT" }] }],
		]);
		const errors = validateLogicModelForSql(model);
		expect(errors).toEqual(expect.arrayContaining([
			'Invalid table name: "Meus Clientes"',
			'Table "Valid" has no columns',
			'Invalid column name "preco$" in table "ok"',
		]));
	});

	test("flags unsupported column types", () => {
		const model = new Map([
			["1", {
				name: "users",
				columns: [
					{ name: "id", type: "INT", PK: true },
					{ name: "evil", type: "INT; DROP TABLE users--" },
				],
			}],
		]);
		const errors = validateLogicModelForSql(model);
		expect(errors).toEqual(expect.arrayContaining([
			'Invalid column type "INT; DROP TABLE users--" in table "users"',
		]));
	});

	test("accepts parameterized VARCHAR and DECIMAL-like forms for known bases", () => {
		const model = new Map([
			["1", {
				name: "users",
				columns: [
					{ name: "id", type: "INT", PK: true },
					{ name: "email", type: "VARCHAR(255)" },
					{ name: "code", type: "CHAR(2)" },
				],
			}],
		]);
		expect(validateLogicModelForSql(model)).toEqual([]);
	});
});

describe("generate SQL foreign keys", () => {
	test("references the origin primary key name", () => {
		const model = new Map([
			["person", {
				name: "pessoas",
				columns: [{ name: "idPessoa", type: "INT", PK: true }],
			}],
			["material", {
				name: "materiais",
				columns: [
					{ name: "id", type: "INT", PK: true },
					{
						name: "fkIdCliente",
						type: "INT",
						FK: true,
						tableOrigin: { idOrigin: "person", idLink: "l1", idName: "" },
					},
				],
			}],
		]);

		const sql = generate(model, []);
		expect(sql).toContain("FOREIGN KEY(fkIdCliente) REFERENCES pessoas (idPessoa)");
	});
});
