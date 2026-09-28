export interface FunctionalDependency {
	left: string[];
	right: string[];
}

export interface NormalizationTable {
	name: string;
	attributes: string[];
	primaryKey: string[];
	dependencies: FunctionalDependency[];
}

export interface NormalizedTable {
	name: string;
	attributes: string[];
	primaryKey: string[];
	foreignKeys: string[];
	dependencies?: FunctionalDependency[];
}
