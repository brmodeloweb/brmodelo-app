import { Model } from "./types/model";

const KEY_PREFIX = "brmw.model.";

export class ModelNotFoundError extends Error {
	status = 404;

	constructor(id: string) {
		super(`Model not found: ${id}`);
		this.name = "ModelNotFoundError";
	}
}

const keyFor = (id: string) => `${KEY_PREFIX}${id}`;

const generateId = (): string => {
	if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
		return crypto.randomUUID();
	}
	return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
};

const read = (id: string): Model | null => {
	const raw = localStorage.getItem(keyFor(id));
	if (!raw) return null;
	try {
		return JSON.parse(raw) as Model;
	} catch {
		return null;
	}
};

const write = (model: Model): void => {
	localStorage.setItem(keyFor(model._id), JSON.stringify(model));
};

const require_ = (id: string): Model => {
	const model = read(id);
	if (!model) throw new ModelNotFoundError(id);
	return model;
};

export async function saveModel(input: { name: string; type: string; model: string }): Promise<Model> {
	const now = new Date().toISOString();
	const model: Model = {
		_id: generateId(),
		name: input.name,
		type: input.type,
		model: input.model,
		created: now,
		updated: now,
		version: 0,
	};
	write(model);
	return model;
}

export async function getAllModels(): Promise<Model[]> {
	const models: Model[] = [];
	for (let i = 0; i < localStorage.length; i++) {
		const key = localStorage.key(i);
		if (!key || !key.startsWith(KEY_PREFIX)) continue;
		const model = read(key.slice(KEY_PREFIX.length));
		if (model) models.push(model);
	}
	return models.sort((a, b) => a.created.localeCompare(b.created));
}

export async function getModel(id: string): Promise<Model> {
	return require_(id);
}

export async function updateModel(update: { id: string; model: string }): Promise<Model> {
	const current = require_(update.id);
	const next: Model = {
		...current,
		model: update.model,
		updated: new Date().toISOString(),
		version: current.version + 1,
	};
	write(next);
	return next;
}

export async function renameModel(id: string, newName: string): Promise<Model> {
	const current = require_(id);
	const next: Model = { ...current, name: newName, updated: new Date().toISOString() };
	write(next);
	return next;
}

export async function deleteModel(id: string): Promise<void> {
	require_(id);
	localStorage.removeItem(keyFor(id));
}
