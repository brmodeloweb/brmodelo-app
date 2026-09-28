import { IEditor } from "../../types/IEditor";

export interface NoSqlRow {
	kind: 'attribute' | 'reference' | 'block';
	name: string;
	type?: string;
	identifier?: boolean;
	targetCollectionId?: string | null;
	targetCollectionName?: string | null;
	cardinalityEnabled?: boolean;
	minCardinality?: number;
	maxCardinality?: number | string;
	collapsed?: boolean;
	children?: NoSqlRow[];
}

export interface CollectionInfo {
	name: string;
	id: string;
	rows: NoSqlRow[];
}

export interface CollectionOption {
	name: string;
	id: string;
}

export interface NoSqlUpdateEvent {
	type: string;
	element?: any;
	value?: any;
	path?: number[];
	index?: number;
	fromIndex?: number;
	toIndex?: number;
	insertAt?: number;
}

export interface INoSqlEditor extends IEditor {
	graph: any;
	dirty: boolean;
	setDirty(dirty: boolean): void;
	setSnaplines(showSnaplines: boolean): void;
	print(): void;
	undo(): void;
	redo(): void;

	// Update handler (called from React sidebar)
	onUpdate(event: NoSqlUpdateEvent): void;

	// Reference attribute
	startReferenceAttributeMode(): void;
	cancelReferenceAttributeMode(): void;
	isRefModeActive(): boolean;

	// Data accessors
	loadCollections(): CollectionInfo[];
}
