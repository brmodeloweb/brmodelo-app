import {
	saveModel,
	getAllModels,
	getModel,
	updateModel,
	renameModel,
	deleteModel,
	ModelNotFoundError,
} from "../modelStore";

describe("modelStore", () => {
	beforeEach(() => localStorage.clear());

	test("saveModel persists a new model with generated id and timestamps", async () => {
		const model = await saveModel({ name: "Test", type: "conceptual", model: '{"cells":[]}' });

		expect(model._id).toBeTruthy();
		expect(model.created).toBe(model.updated);
		expect(model.version).toBe(0);
		expect(JSON.parse(localStorage.getItem(`brmw.model.${model._id}`)!)).toEqual(model);
	});

	test("getAllModels returns models sorted by creation and ignores other keys", async () => {
		localStorage.setItem("i18n", "en");
		const first = await saveModel({ name: "A", type: "conceptual", model: "{}" });
		localStorage.setItem(`brmw.model.${first._id}`, JSON.stringify({ ...first, created: "2024-01-02T00:00:00.000Z" }));
		const second = await saveModel({ name: "B", type: "logic", model: "{}" });
		localStorage.setItem(`brmw.model.${second._id}`, JSON.stringify({ ...second, created: "2024-01-01T00:00:00.000Z" }));

		const models = await getAllModels();

		expect(models.map((m) => m.name)).toEqual(["B", "A"]);
	});

	test("getAllModels skips corrupted entries", async () => {
		localStorage.setItem("brmw.model.broken", "not json");
		await saveModel({ name: "Ok", type: "nosql", model: "{}" });

		const models = await getAllModels();

		expect(models).toHaveLength(1);
	});

	test("getModel throws ModelNotFoundError with status 404 for unknown id", async () => {
		await expect(getModel("missing")).rejects.toBeInstanceOf(ModelNotFoundError);
		await expect(getModel("missing")).rejects.toMatchObject({ status: 404 });
	});

	test("updateModel replaces content, bumps version and updated timestamp", async () => {
		const saved = await saveModel({ name: "Test", type: "conceptual", model: "{}" });
		localStorage.setItem(`brmw.model.${saved._id}`, JSON.stringify({ ...saved, updated: "2024-01-01T00:00:00.000Z" }));

		const updated = await updateModel({ id: saved._id, model: '{"cells":[1]}' });

		expect(updated.model).toBe('{"cells":[1]}');
		expect(updated.version).toBe(1);
		expect(updated.updated).not.toBe("2024-01-01T00:00:00.000Z");
		expect(updated.name).toBe("Test");
	});

	test("renameModel changes only the name", async () => {
		const saved = await saveModel({ name: "Old", type: "conceptual", model: "{}" });

		const renamed = await renameModel(saved._id, "New");

		expect(renamed.name).toBe("New");
		expect(renamed.version).toBe(0);
		expect((await getModel(saved._id)).name).toBe("New");
	});

	test("deleteModel removes the entry and rejects unknown ids", async () => {
		const saved = await saveModel({ name: "Test", type: "conceptual", model: "{}" });

		await deleteModel(saved._id);

		expect(localStorage.getItem(`brmw.model.${saved._id}`)).toBeNull();
		await expect(deleteModel(saved._id)).rejects.toBeInstanceOf(ModelNotFoundError);
	});
});
