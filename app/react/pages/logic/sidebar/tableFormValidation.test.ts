import { resolveFKColumnOrigin, resolveFKTableOrigin } from "./tableFormValidation";

describe("resolveFKTableOrigin (#276)", () => {
	const tables = [
		{ name: "Users", id: "t-users", columns: [] },
		{ name: "Orders", id: "t-orders", columns: [] },
	];

	test("returns both fields when idName matches a known table", () => {
		const result = resolveFKTableOrigin({ idName: "Users", idOrigin: "" }, tables);
		expect(result).toEqual({ idName: "Users", idOrigin: "t-users" });
	});

	test("returns both fields when only idOrigin is populated (conversion path)", () => {
		const result = resolveFKTableOrigin({ idName: "", idOrigin: "t-users" }, tables);
		expect(result).toEqual({ idName: "Users", idOrigin: "t-users" });
	});

	test("prefers idName when both are populated and idName resolves", () => {
		const result = resolveFKTableOrigin({ idName: "Users", idOrigin: "t-orders" }, tables);
		expect(result).toEqual({ idName: "Users", idOrigin: "t-users" });
	});

	test("falls back to idOrigin when idName is stale/unknown", () => {
		const result = resolveFKTableOrigin({ idName: "Deleted", idOrigin: "t-orders" }, tables);
		expect(result).toEqual({ idName: "Orders", idOrigin: "t-orders" });
	});

	test("returns null when neither field resolves", () => {
		expect(resolveFKTableOrigin({ idName: "", idOrigin: "" }, tables)).toBeNull();
		expect(resolveFKTableOrigin({ idName: "Ghost", idOrigin: "ghost-id" }, tables)).toBeNull();
	});

	test("returns null for missing tableOrigin", () => {
		expect(resolveFKTableOrigin(null, tables)).toBeNull();
		expect(resolveFKTableOrigin(undefined, tables)).toBeNull();
	});
});

describe("resolveFKColumnOrigin (#569)", () => {
	const columns = [
		{ name: "idPessoa", PK: true },
		{ name: "nome", PK: false },
		{ name: "codigo", isPrimaryKey: true },
	];

	test("uses stored columnName when it still matches a PK", () => {
		const result = resolveFKColumnOrigin(
			{ columnName: "codigo" },
			columns,
			"fkIdCliente",
		);
		expect(result).toEqual({ columnName: "codigo" });
	});

	test("falls back to FK name when it matches a PK", () => {
		const result = resolveFKColumnOrigin(
			{ columnName: "deleted" },
			columns,
			"idPessoa",
		);
		expect(result).toEqual({ columnName: "idPessoa" });
	});

	test("falls back to first PK when stored name and FK name do not match", () => {
		const result = resolveFKColumnOrigin(
			{},
			columns,
			"fkIdCliente",
		);
		expect(result).toEqual({ columnName: "idPessoa" });
	});

	test("returns null when origin table has no PK", () => {
		expect(resolveFKColumnOrigin({}, [{ name: "nome" }], "fk")).toBeNull();
		expect(resolveFKColumnOrigin({}, [], "fk")).toBeNull();
		expect(resolveFKColumnOrigin({}, null, "fk")).toBeNull();
	});
});
