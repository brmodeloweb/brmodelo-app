import { Model, ModelType } from "./types/model";
import { saveModel } from "./modelStore";

export class InvalidModelFileError extends Error {
	constructor(message = "Invalid model file") {
		super(message);
		this.name = "InvalidModelFileError";
	}
}

const sanitizeFileName = (name: string): string => {
	const cleaned = (name || "model").replace(/[<>:"/\\|?*\u0000-\u001f]/g, "_").trim();
	return cleaned.length > 0 ? cleaned : "model";
};

export function downloadModelFile(model: Model): void {
	const payload: Model = {
		_id: model._id,
		name: model.name,
		type: model.type,
		model: typeof model.model === "string" ? model.model : JSON.stringify(model.model),
		created: model.created,
		updated: model.updated,
		version: model.version ?? 0,
	};
	const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
	const url = URL.createObjectURL(blob);
	const anchor = document.createElement("a");
	anchor.href = url;
	anchor.download = `${sanitizeFileName(model.name)}.brmw.json`;
	document.body.appendChild(anchor);
	anchor.click();
	document.body.removeChild(anchor);
	URL.revokeObjectURL(url);
}

export function downloadTextFile(filename: string, content: string, mimeType = "text/plain"): void {
	const blob = new Blob([content], { type: mimeType });
	const url = URL.createObjectURL(blob);
	const anchor = document.createElement("a");
	anchor.href = url;
	anchor.download = filename;
	document.body.appendChild(anchor);
	anchor.click();
	document.body.removeChild(anchor);
	URL.revokeObjectURL(url);
}

const isValidModelType = (type: unknown): type is ModelType | string => {
	return type === "conceptual" || type === "logic" || type === "nosql";
};

export function parseModelFileContent(raw: string): Pick<Model, "name" | "type" | "model"> {
	let data: unknown;
	try {
		data = JSON.parse(raw);
	} catch {
		throw new InvalidModelFileError("File is not valid JSON");
	}

	if (!data || typeof data !== "object") {
		throw new InvalidModelFileError("Invalid model file");
	}

	const record = data as Record<string, unknown>;
	if (typeof record.name !== "string" || !record.name.trim()) {
		throw new InvalidModelFileError("Model name is missing");
	}
	if (!isValidModelType(record.type)) {
		throw new InvalidModelFileError("Model type is invalid");
	}

	let modelGraph = record.model;
	if (modelGraph != null && typeof modelGraph === "object") {
		modelGraph = JSON.stringify(modelGraph);
	}
	if (typeof modelGraph !== "string") {
		throw new InvalidModelFileError("Model graph is missing");
	}

	try {
		JSON.parse(modelGraph);
	} catch {
		throw new InvalidModelFileError("Model graph is not valid JSON");
	}

	return {
		name: record.name.trim(),
		type: record.type as string,
		model: modelGraph,
	};
}

export async function importModelFromFile(file: File): Promise<Model> {
	const raw = await file.text();
	const parsed = parseModelFileContent(raw);
	return saveModel(parsed);
}
