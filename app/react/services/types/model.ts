export type ModelType = "conceptual" | "logic" | "nosql";

export interface Model {
	_id: string;
	name: string;
	type: ModelType | string;
	model: string;
	created: string;
	updated: string;
	version: number;
}
