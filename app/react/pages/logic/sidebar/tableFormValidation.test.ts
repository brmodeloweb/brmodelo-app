import { resolveFKTableOrigin } from "./tableFormValidation";

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
