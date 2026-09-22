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
