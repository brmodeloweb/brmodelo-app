import { IEditor } from "../../types/IEditor";

export interface ILogicEditor extends IEditor {
	graph: any;
	dirty: boolean;
	setDirty(dirty: boolean): void;
	setSnaplines(showSnaplines: boolean): void;
	print(): void;
	undo(): void;
	redo(): void;
	onUpdate(event: { type: string; element?: any; value?: any; index?: number; fromIndex?: number; toIndex?: number }): void;
	buildTablesJson(): Map<string, any>;
	loadViews(): Array<{ name: string; tables: any[]; queryConditions: any }>;
	loadTables(): Array<{ name: string; columns: any[]; id: string }>;
	loadViewsByTable(tableId: string): Array<{ name: string; tables: any[]; queryConditions: any }>;
	editCardinalityA(selectedLink: any, card: string): void;
	editCardinalityB(selectedLink: any, card: string): void;
	toLogic(conceptualJson: any): Promise<void>;
}
