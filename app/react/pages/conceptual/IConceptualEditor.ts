import { IEditor } from "../../types/IEditor";

export interface IConceptualEditor extends IEditor {
	setSnaplines(showSnaplines: boolean): void;
	print(): void;
	undo(): void;
	redo(): void;
	setDirty(dirty: boolean): void;
	dirty: boolean;
	graph: any;
	onUpdate(event: { type: string; value?: any }, selectedElement: any): void;
}
