import { generate } from "./sqlGenerator";

describe("sqlGenerator type formatting", () => {
	const buildModel = (columns) => {
		const tables = new Map();
		tables.set("t1", {
			name: "users",
			columns,
		});
		return tables;
	};

	test("emits VARCHAR with length", () => {
		const sql = generate(buildModel([
			{ name: "id", type: "INT", PK: true },
			{ name: "email", type: "VARCHAR", length: 255 },
		]), []);

		expect(sql).toContain("email VARCHAR(255)");
	});

	test("emits DECIMAL with precision and scale", () => {
		const sql = generate(buildModel([
			{ name: "id", type: "INT", PK: true },
			{ name: "price", type: "DECIMAL", precision: 10, scale: 2 },
		]), []);

		expect(sql).toContain("price DECIMAL(10,2)");
	});

	test("emits bare INT without parameters", () => {
		const sql = generate(buildModel([
			{ name: "id", type: "INT", PK: true },
		]), []);

		expect(sql).toContain("id INT PRIMARY KEY");
	});
});

describe("sqlGenerator foreign keys (#569)", () => {
	test("REFERENCES uses origin PK name when FK local name differs", () => {
		const tables = new Map();
		tables.set("pessoas", {
			name: "pessoas",
			columns: [{ name: "idPessoa", type: "INT", PK: true }],
		});
		tables.set("materiais", {
			name: "materiais",
			columns: [
				{ name: "id", type: "INT", PK: true },
				{
					name: "fkIdCliente",
					type: "INT",
					FK: true,
					tableOrigin: {
						idOrigin: "pessoas",
						idName: "pessoas",
						columnName: "idPessoa",
					},
				},
			],
		});

		const sql = generate(tables, []);

		expect(sql).toContain("FOREIGN KEY(fkIdCliente) REFERENCES pessoas (idPessoa)");
	});

	test("falls back to origin table first PK when columnName is missing", () => {
		const tables = new Map();
		tables.set("pessoas", {
			name: "pessoas",
			columns: [{ name: "idPessoa", type: "INT", PK: true }],
		});
		tables.set("materiais", {
			name: "materiais",
			columns: [
				{
					name: "fkIdCliente",
					type: "INT",
					FK: true,
					tableOrigin: { idOrigin: "pessoas", idName: "pessoas" },
				},
			],
		});

		const sql = generate(tables, []);

		expect(sql).toContain("FOREIGN KEY(fkIdCliente) REFERENCES pessoas (idPessoa)");
	});

	test("omits FOREIGN KEY when stored columnName is not a PK on origin", () => {
		const tables = new Map();
		tables.set("pessoas", {
			name: "pessoas",
			columns: [{ name: "idPessoa", type: "INT", PK: true }],
		});
		tables.set("materiais", {
			name: "materiais",
			columns: [
				{
					name: "fkIdCliente",
					type: "INT",
					FK: true,
					tableOrigin: {
						idOrigin: "pessoas",
						idName: "pessoas",
						columnName: "colunaInexistente",
					},
				},
			],
		});

		const sql = generate(tables, []);

		expect(sql).not.toContain("FOREIGN KEY");
		expect(sql).toContain("fkIdCliente INT");
	});
});
