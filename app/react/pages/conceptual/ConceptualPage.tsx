import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { IConceptualEditor } from "./IConceptualEditor";
import ConceptualEditor from "./conceptualEditor";
import PanelTools from "../../components/PanelTools";
import { ConceptualIcon } from "../../components/Icons";
import Feedback, { useFeedback } from "../../components/Feedback";
import ConceptualSidebar from "./sidebar/ConceptualSidebar";
import { formatDate } from "../../utils/formatDate";
import loadingDots from "../../../img/loading-dots.gif";

interface Model {
	id: string;
	name: string;
	type: string;
	updatedAt: string;
}

interface SelectedElement {
	value: any;
	type: string;
	element: any;
}

interface ConceptualPageProps {
	modelId: string;
	onLoadModel: (modelId: string) => Promise<any>;
	onSaveModel: (model: any) => Promise<void>;
	onNavigateToWorkspace: () => void;
	onConvert: (model: any, editor: any) => Promise<void>;
	onEditorReady?: (editor: IConceptualEditor | null) => void;
}

const BLANK_SELECTION: SelectedElement = { value: "", type: "blank", element: null };

const enrichSelectedElement = (element: SelectedElement): SelectedElement => {
	if (!element.element?.model?.attributes) return element;

	const attributes = element.element.model.attributes;

	if (element.type === "Link") {
		const labels = attributes.labels;
		return {
			...element,
			value: {
				weak: attributes.weak,
				role: attributes.role,
				cardinality: labels && labels[0] && labels[0].attrs?.text?.text || "",
			},
		};
	}

	if (element.type === "Attribute") {
		return {
			...element,
			value: {
				name: attributes.attrs?.text?.text?.replace(/ *\([^)]*\) */g, "") || "",
				cardinality: attributes.cardinality,
				composed: attributes.composed,
			},
		};
	}

	if (element.type === "Note") {
		return {
			...element,
			value: attributes.attrs?.text?.text?.replace(/ *\([^)]*\) */g, "") || "",
		};
	}

	return element;
};

const ConceptualPage: React.FC<ConceptualPageProps> = React.memo(({
	modelId,
	onLoadModel,
	onSaveModel,
	onNavigateToWorkspace,
	onConvert,
	onEditorReady,
}) => {
	const { t } = useTranslation(["common"]);
	const [loading, setLoading] = useState(true);
	const [model, setModel] = useState<Model>({ id: "", name: "", type: "conceptual", updatedAt: "" });
	const { feedback, showFeedback, hideFeedback } = useFeedback();
	const [selectedElement, setSelectedElement] = useState<SelectedElement>(BLANK_SELECTION);
	const [shapePaletteVisible, setShapePaletteVisible] = useState(true);
	const [sidebarVisible, setSidebarVisible] = useState(true);
	const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

	const editorRef = useRef<IConceptualEditor | null>(null);
	const contentRef = useRef<HTMLElement>(null);
	const modelRef = useRef<any>(null);
	const selectedElementRef = useRef<SelectedElement>(BLANK_SELECTION);
	const isSavingRef = useRef(false);


	const handleSave = useCallback(async () => {
		const editor = editorRef.current;
		if (!editor || !modelRef.current || isSavingRef.current) return;

		setLoading(true);

		const modelToSave = { ...modelRef.current, model: JSON.stringify(editor.graph) };

		if (!editor.dirty) {
			showFeedback("Successfully saved!", true);
			setLoading(false);
			return;
		}

		isSavingRef.current = true;
		try {
			await onSaveModel(modelToSave);
			setLastSavedAt(new Date());
			showFeedback("Successfully saved!", true);
			editor.setDirty(false);
		} catch (error) {
			console.error("Error saving model:", error);
			showFeedback("Failed to save model", true, "error");
		} finally {
			isSavingRef.current = false;
			setLoading(false);
		}
	}, [onSaveModel, showFeedback]);

	const handleUpdate = useCallback((event: { type: string; value?: any }) => {
		const editor = editorRef.current;
		const current = selectedElementRef.current;
		if (!editor) return;

		if (event.type === "attribute.cardinality" && current.value) {
			current.value.cardinality = event.value;
		}
		if (event.type === "attribute.name" && current.value) {
			current.value.name = event.value;
		}

		editor.onUpdate(event, current);
	}, []);

	const toggleShapePalette = useCallback(() => setShapePaletteVisible(prev => !prev), []);
	const toggleSidebar = useCallback(() => setSidebarVisible(prev => !prev), []);

	const toolsController = useMemo(() => ({
		zoomIn: { active: true, action: () => editorRef.current?.zoomIn() },
		zoomOut: { active: true, action: () => editorRef.current?.zoomOut() },
		zoomNone: { active: true, action: () => editorRef.current?.zoomNone() },
		undo: { active: true, action: () => editorRef.current?.undo() },
		redo: { active: true, action: () => editorRef.current?.redo() },
		print: { active: true, action: () => editorRef.current?.print() },
		convert: { active: true, action: () => { if (modelRef.current && editorRef.current) onConvert(modelRef.current, editorRef.current); } },
		setGrid: { active: true, action: (showDotGrid: boolean) => editorRef.current?.setGrid(showDotGrid) },
		setGridSize: { active: true, action: (gridSize: number) => editorRef.current?.setGridSize(gridSize) },
		setSnaplines: { active: true, action: (showSnaplines: boolean) => editorRef.current?.setSnaplines(showSnaplines) },
		setPageBreaks: { active: true, action: (showPageBreaks: boolean) => editorRef.current?.setPageBreaks(showPageBreaks) },
	}), [onConvert]);

	useEffect(() => {
		if (!contentRef.current) return;

		const customActions = {
			selectElement: (element: any) => {
				const enriched = enrichSelectedElement({
					value: element.value,
					type: element.type,
					element: element.element,
				});
				selectedElementRef.current = enriched;
				setSelectedElement(enriched);
			},
			openMenu: () => {
				setSidebarVisible(true);
			},
			saveModel: () => {
				handleSave();
			},
			closeFeedback: () => {
				hideFeedback();
			},
			unselectAll: () => {
				hideFeedback();
				selectedElementRef.current = BLANK_SELECTION;
				setSelectedElement(BLANK_SELECTION);
			},
		};

		const editor = new ConceptualEditor(document, contentRef.current, customActions) as unknown as IConceptualEditor;
		editorRef.current = editor;
		onEditorReady?.(editor);

		const loadModel = async () => {
			setLoading(true);
			try {
				const response = await onLoadModel(modelId);
				const jsonModel = typeof response.model === "string" ? JSON.parse(response.model) : response.model;

				const loadedModel = {
					...response,
					id: response._id,
					model: jsonModel,
				};
				modelRef.current = loadedModel;

				setModel({
					id: response._id,
					name: response.name,
					type: response.type,
					updatedAt: response.updated,
				});

				setLastSavedAt(new Date(response.updated));
				setLoading(false);

				editor.loadModel(jsonModel);
			} catch (error: any) {
				setLoading(false);
				if (error.status === 404) {
					onNavigateToWorkspace();
				} else {
					console.error(error);
					showFeedback("Failed to load model", true, "error");
				}
			}
		};

		if (modelId) {
			loadModel();
		} else {
			setLoading(false);
		}

		return () => {
			onEditorReady?.(null);
			if (editorRef.current) {
				editorRef.current.destroy();
			}
		};
	}, [modelId, onLoadModel, onNavigateToWorkspace, showFeedback, hideFeedback, onEditorReady, handleSave]);

	return (
		<div>
			<section className="modelWorkspace">
				<header className="modelWorkspace-header">
					<button
						className="navigation-back"
						aria-label="back to Model list"
						onClick={onNavigateToWorkspace}
					>
						<svg width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path fillRule="evenodd" clipRule="evenodd" d="M14 5C14 4.72386 13.7761 4.5 13.5 4.5L1.70711 4.5L4.85355 1.35355C5.04882 1.15829 5.04882 0.841708 4.85355 0.646446C4.65829 0.451183 4.34171 0.451183 4.14645 0.646446L0.146446 4.64645C-0.0488157 4.84171 -0.0488157 5.15829 0.146446 5.35355L4.14645 9.35355C4.34171 9.54882 4.65829 9.54882 4.85355 9.35355C5.04882 9.15829 5.04882 8.84171 4.85355 8.64645L1.70711 5.5L13.5 5.5C13.7761 5.5 14 5.27614 14 5Z" fill="#333333"/>
						</svg>
					</button>
					<div className="document-info">
						<h2>
							<ConceptualIcon />
							<span>{model.name}</span>
						</h2>
						{lastSavedAt != null && (
							<div className="status-bar">
								<span>{t("Last saved")}: {formatDate(lastSavedAt)}</span>
							</div>
						)}
					</div>
					<aside className="header-actions">
						<button
							type="button"
							className="br-button"
							onClick={handleSave}
							title={t("Save (CTRL S)")}
						>
							{t("Save")}
						</button>
					</aside>
					<img
						src={loadingDots}
						alt="Loading"
						className={`br-loader fixed ${loading ? "loading" : ""}`}
					/>
				</header>

				<Feedback
					message={feedback.message}
					showing={feedback.showing}
					type={feedback.type}
					onClose={hideFeedback}
				/>

				<PanelTools toolsController={toolsController} />

				<section id="content" className="pseudo-canvas" ref={contentRef}>
					<section
						className={`elements-panel floatingPanel${shapePaletteVisible ? " open" : ""}`}
						id="shape-palette"
					>
						<button
							type="button"
							className="toggle-visibility"
							aria-label="Toggle elements panel"
							onClick={toggleShapePalette}
						>
							<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path fillRule="evenodd" clipRule="evenodd" d="M4.55806 14.8169C4.80214 15.061 5.19786 15.061 5.44194 14.8169L10 10.2589L14.5581 14.8169C14.8021 15.061 15.1979 15.061 15.4419 14.8169C15.686 14.5729 15.686 14.1771 15.4419 13.9331L10.4419 8.93306C10.1979 8.68898 9.80214 8.68898 9.55806 8.93306L4.55806 13.9331C4.31398 14.1771 4.31398 14.5729 4.55806 14.8169Z" fill="white"/>
								<path fillRule="evenodd" clipRule="evenodd" d="M3 6.5C3 6.77614 3.22386 7 3.5 7L16.5 7C16.7761 7 17 6.77614 17 6.5C17 6.22386 16.7761 6 16.5 6L3.5 6C3.22386 6 3 6.22386 3 6.5Z" fill="white"/>
							</svg>
						</button>
					</section>

					<ConceptualSidebar
						selectedElement={selectedElement}
						onUpdate={handleUpdate}
						visible={sidebarVisible}
						onToggleVisible={toggleSidebar}
					/>
				</section>
			</section>
		</div>
	);
});

ConceptualPage.displayName = "ConceptualPage";

export default ConceptualPage;
