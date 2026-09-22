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
