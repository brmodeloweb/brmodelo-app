// Common interface shared by the conceptual, logic and NoSQL editors
// Uses duck typing - any object with these methods can be used
export interface IEditor {
	// Zoom functionality
	zoomIn(): void;
	zoomOut(): void;
	zoomNone(): void;

	// Grid and display settings
	setGrid(showDotGrid: boolean): void;
	setGridSize(gridSize: number): void;
	setPageBreaks(showPageBreaks: boolean): void;

	// Model operations
	loadModel(jsonModel: any): void;
	center(): void;
	addPageBreaks(): void;
	freeze(): void;
	setReadOnly(): void;

	// Model type specific operations
	setLogicDefaultConnectionPoint(): void;

	// Lifecycle
	destroy(): void;

	// Allow additional properties (duck typing)
	// This enables Editor class to be used directly while still
	// protecting against accidental usage of non-interface methods
	[key: string]: any;
}