import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import Sortable from "sortablejs";
import AttributeForm from "./AttributeForm";
import DisjunctionGroupsEditor from "./DisjunctionGroupsEditor";
import ElementColorPicker, { getCurrentColor } from "../../../components/ElementColorPicker";
import type { CollectionOption, NoSqlUpdateEvent } from "../INoSqlEditor";

interface CollectionFormProps {
	element: any;
	onUpdate: (event: NoSqlUpdateEvent) => void;
	showFeedback: (message: string, showing: boolean, type?: "success" | "error" | "warning") => void;
	focusedRowPath?: number[] | null;
	onFocusedRowConsumed?: () => void;
	collections?: CollectionOption[];
}

// //////////////////////////////////////////////////////////////////
// RowList — recursive component for rendering rows tree
// //////////////////////////////////////////////////////////////////

interface RowListProps {
	rows: any[];
	path: number[];
	element: any;
	onUpdate: CollectionFormProps["onUpdate"];
	showFeedback: CollectionFormProps["showFeedback"];
	depth?: number;
	focusedRowPath?: number[] | null;
	onFocusedRowConsumed?: () => void;
	collections?: CollectionOption[];
}

const RowList: React.FC<RowListProps> = React.memo(({
	rows,
	path,
	element,
	onUpdate,
	showFeedback,
	depth = 0,
	focusedRowPath,
	onFocusedRowConsumed,
	collections,
}) => {
	const { t } = useTranslation(["common"]);
	const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
	const [addMode, setAddMode] = useState(false);
	const [openBlock, setOpenBlock] = useState<number | null>(null);
	const listRef = useRef<HTMLUListElement>(null);
	const sortableRef = useRef<Sortable | null>(null);

	useEffect(() => {
		setExpandedIndex(null);
		setAddMode(false);
		setOpenBlock(null);
	}, [element?.model?.id]);

	useEffect(() => {
		if (!focusedRowPath || focusedRowPath.length === 0) return;
		if (focusedRowPath.length <= depth) return;

		const targetIndex = focusedRowPath[depth];

		if (focusedRowPath.length === depth + 1) {
			// This is the target row — expand it
			setExpandedIndex(targetIndex);
			setAddMode(false);
			if (onFocusedRowConsumed) onFocusedRowConsumed();
		} else {
			// Target is deeper — open the block at this level
			setOpenBlock(targetIndex);
		}
	}, [focusedRowPath, depth, onFocusedRowConsumed]);

	// SortableJS for row reorder
	useEffect(() => {
		if (!listRef.current) return;

		sortableRef.current = Sortable.create(listRef.current, {
			handle: ".column-drag-handle",
			ghostClass: "column-drag-ghost",
			animation: 150,
			onEnd: (evt) => {
				if (evt.oldIndex === evt.newIndex) return;
				// Revert SortableJS DOM manipulation so React can reconcile properly
				const { item, from } = evt;
				from.removeChild(item);
				if (from.children[evt.oldIndex!]) {
					from.insertBefore(item, from.children[evt.oldIndex!]);
				} else {
					from.appendChild(item);
				}
				onUpdate({
					type: "reorderRow",
					element,
					path,
					fromIndex: evt.oldIndex,
					toIndex: evt.newIndex,
				});
			},
		});

		return () => {
			if (sortableRef.current) {
				sortableRef.current.destroy();
				sortableRef.current = null;
			}
		};
	}, [element, onUpdate, path]);

	const toggleSidebarCollapse = useCallback((index: number) => {
		setOpenBlock(prev => prev === index ? null : index);
	}, []);

	const handleBlockColorChange = useCallback((index: number, hex: string) => {
		const row = rows[index];
		if (!row || row.kind !== "block") return;
		const value: any = { ...row, color: hex };
		onUpdate({ type: "editRow", element, path: [...path, index], value });
	}, [element, onUpdate, path, rows]);

	const handleSaveRow = useCallback((data: any, index: number) => {
		if (!data.name.trim()) {
			showFeedback(t("The attribute name cannot be empty!"), true, "error");
			return;
		}
		const row = rows[index];

		const wasReference = row?.kind === "reference";

		if (data.isReference) {
			if (!data.targetCollectionId) {
				showFeedback(t("Select the reference source!"), true, "error");
				return;
			}
			const sameTarget = wasReference && row.targetCollectionId === data.targetCollectionId;
			if (!sameTarget && element?.model?.hasReferenceToCollection?.(data.targetCollectionId)) {
				showFeedback(t("This reference already exists!"), true, "error");
				return;
			}
			// Delete+add to keep link in sync, preserving position
			onUpdate({ type: "deleteRow", element, path: [...path, index] });
			const value: any = { ...data, kind: "reference" };
			onUpdate({ type: "addRow", element, path, value, insertAt: index });
		} else if (wasReference) {
			// Was reference, now attribute: delete+add to remove orphaned link, preserving position
			onUpdate({ type: "deleteRow", element, path: [...path, index] });
			const { isReference: _r, targetCollectionId: _t, targetCollectionName: _n, ...rest } = data;
			const value: any = { ...rest, kind: "attribute" };
			onUpdate({ type: "addRow", element, path, value, insertAt: index });
		} else if (data.type === "block" || row?.kind === "block") {
			const { type: _, isReference: _r, ...rest } = data;
			const value: any = { ...rest, kind: "block" };
			if (row?.color) value.color = row.color;
			onUpdate({ type: "editRow", element, path: [...path, index], value });
		} else {
			const { isReference: _r, ...rest } = data;
			const value: any = { ...rest, kind: "attribute" };
			if (row?.identifier) value.identifier = true;
			onUpdate({ type: "editRow", element, path: [...path, index], value });
		}
		setExpandedIndex(null);
	}, [element, onUpdate, path, rows, showFeedback, t]);

	const handleDelete = useCallback((index: number) => {
		setExpandedIndex(null);
		onUpdate({ type: "deleteRow", element, path: [...path, index] });
	}, [element, onUpdate, path]);

	const handleAdd = useCallback((data: any) => {
		if (!data.name.trim()) {
			showFeedback(t("The attribute name cannot be empty!"), true, "error");
			return;
		}
		if (data.isReference) {
			if (!data.targetCollectionId) {
				showFeedback(t("Select the reference source!"), true, "error");
				return;
			}
			if (element?.model?.hasReferenceToCollection?.(data.targetCollectionId)) {
				showFeedback(t("This reference already exists!"), true, "error");
				return;
			}
			const value: any = { ...data, kind: "reference" };
			onUpdate({ type: "addRow", element, path, value });
		} else if (data.type === "block") {
			const { type: _, ...rest } = data;
			onUpdate({ type: "addRow", element, path, value: { ...rest, kind: "block", children: [] } });
		} else {
			onUpdate({ type: "addRow", element, path, value: { ...data, kind: "attribute" } });
		}
		setAddMode(false);
	}, [element, onUpdate, path, showFeedback, t]);


	const getRowLabel = (row: any): string => {
		if (row.kind === "block" && row.cardinalityEnabled) {
			return `${row.name} (${row.minCardinality ?? 0},${row.maxCardinality ?? "N"})`;
		}
		return row.name;
	};

	const getRowBadge = (row: any): string => {
		if (row.kind === "block") return t("block");
		if (row.kind === "reference") {
			const refType = (row.type && row.type !== "reference") ? row.type : "ID";
			return `${refType} · ref`;
		}
		return row.type || "string";
	};

	return (
		<>
			<ul className="table-columns" ref={listRef}>
				{rows.map((row, index) => (
					<li className="card-item" key={index}>
						{expandedIndex !== index ? (
							<>
								<header>
									<span className="column-drag-handle" title={t("Drag to reorder")}>
										<FontAwesomeIcon icon="bars" />
									</span>
									<div className="column-header-left" onClick={() => { setExpandedIndex(index); setAddMode(false); }}>
										<h4 className="table-title">
											{row.kind === "block" && (
												<span
													onClick={(e) => { e.stopPropagation(); toggleSidebarCollapse(index); }}
													style={{ cursor: "pointer", marginRight: 4 }}
												>
													{(openBlock !== index || !row.children?.length) ? "\u25B8" : "\u25BE"}
												</span>
											)}
											{getRowLabel(row)}
										</h4>
										<span className="relationship">{getRowBadge(row)}</span>
									</div>
								</header>
								{row.kind === "block" && openBlock === index && row.children?.length > 0 && (
									<div style={{ borderLeft: "2px solid var(--border-default)", paddingLeft: 12, paddingRight: 12 }}>
										<RowList
											rows={row.children}
											path={[...path, index]}
											element={element}
											onUpdate={onUpdate}
											showFeedback={showFeedback}
											depth={depth + 1}
											focusedRowPath={focusedRowPath}
											onFocusedRowConsumed={onFocusedRowConsumed}
											collections={collections}
										/>
									</div>
								)}
							</>
						) : (
							row.kind === "block" ? (
								<>
									<AttributeForm
										initialValues={{
											name: row.name,
											type: "block",
											cardinalityEnabled: row.cardinalityEnabled || false,
											minCardinality: row.minCardinality ?? 0,
											maxCardinality: row.maxCardinality ?? "N",
										}}
										onSave={(data) => handleSaveRow(data, index)}
										onDismiss={() => setExpandedIndex(null)}
										onDelete={() => handleDelete(index)}
										typeLocked
									/>
									<ElementColorPicker
										onColorChange={(hex) => handleBlockColorChange(index, hex)}
										selectedColor={row.color || null}
									/>
									<div style={{ borderLeft: "2px solid var(--border-default)", paddingLeft: 12, paddingRight: 12, marginTop: 8 }}>
										<RowList
											rows={row.children || []}
											path={[...path, index]}
											element={element}
											onUpdate={onUpdate}
											showFeedback={showFeedback}
											depth={depth + 1}
											focusedRowPath={focusedRowPath}
											onFocusedRowConsumed={onFocusedRowConsumed}
											collections={collections}
										/>
									</div>
								</>
							) : row.kind === "reference" ? (
								<AttributeForm
									initialValues={{
										name: row.name,
										type: (row.type && row.type !== "reference") ? row.type : "ID",
										cardinalityEnabled: false,
										minCardinality: 0,
										maxCardinality: 1,
										isReference: true,
										targetCollectionId: row.targetCollectionId,
										targetCollectionName: row.targetCollectionName,
									}}
									onSave={(data) => handleSaveRow(data, index)}
									onDismiss={() => setExpandedIndex(null)}
									onDelete={() => handleDelete(index)}
									collections={collections}
								/>
							) : (
								<AttributeForm
									initialValues={{
										name: row.name,
										type: row.type || "string",
										cardinalityEnabled: row.cardinalityEnabled || false,
										minCardinality: row.minCardinality ?? 0,
										maxCardinality: row.maxCardinality ?? 1,
									}}
									onSave={(data) => handleSaveRow(data, index)}
									onDismiss={() => setExpandedIndex(null)}
									onDelete={row.identifier ? undefined : () => handleDelete(index)}
									identifier={row.identifier}
									collections={collections}
								/>
							)
						)}
					</li>
				))}
			</ul>

			{addMode ? (
				<div className="card-item">
					<AttributeForm
						onSave={handleAdd}
						onDismiss={() => setAddMode(false)}
						collections={collections}
					/>
				</div>
			) : (
				<button
					className="br-button br-button--full"
					style={{ marginBottom: 8 }}
					onClick={() => { setAddMode(true); setExpandedIndex(null); }}
				>
					{t("Add attribute")}
				</button>
			)}
		</>
	);
});

RowList.displayName = "RowList";

// //////////////////////////////////////////////////////////////////
// CollectionForm — main form for collection properties + rows
// //////////////////////////////////////////////////////////////////

const CollectionForm: React.FC<CollectionFormProps> = React.memo(({
	element,
	onUpdate,
	showFeedback,
	focusedRowPath,
	onFocusedRowConsumed,
	collections,
}) => {
	const { t } = useTranslation(["common"]);
	const model = element?.model;
	const [name, setName] = useState(model?.getName?.() || "");
	const [sections, setSections] = useState({ properties: true, rows: true, disjunction: false });
	const [rowsVersion, setRowsVersion] = useState(0);

	const rows: any[] = model?.getRows?.() || [];
	// eslint-disable-next-line no-unused-vars
	void rowsVersion; // used to trigger re-render when rows change

	const hasIdAttribute = rows.some((r: any) => r.kind === 'attribute' && r.identifier);

	useEffect(() => {
		setName(model?.getName?.() || "");
	}, [model?.id]);

	useEffect(() => {
		if (focusedRowPath && focusedRowPath.length > 0) {
			setSections(prev => ({ ...prev, rows: true }));
		}
	}, [focusedRowPath]);

	const toggleSection = useCallback((section: keyof typeof sections) => {
		setSections(prev => ({ ...prev, [section]: !prev[section] }));
	}, []);

	const handleUpdateAndRefresh = useCallback((event: Parameters<CollectionFormProps["onUpdate"]>[0]) => {
		onUpdate(event);
		setRowsVersion(v => v + 1);
	}, [onUpdate]);

	const handleChangeName = useCallback((newName: string) => {
		const sanitized = newName.replace(/[^A-Za-z0-9_]/g, "");
		setName(sanitized);
		handleUpdateAndRefresh({ type: "editName", element, value: sanitized });
	}, [element, handleUpdateAndRefresh]);

	const [selectedColor, setSelectedColor] = useState<string | null>(() => getCurrentColor(element));

	useEffect(() => {
		setSelectedColor(getCurrentColor(element));
	}, [model?.id, element]);

	const handleColorChange = useCallback((hex: string) => {
		if (element?.model?.setColor) {
			element.model.setColor(hex);
			setSelectedColor(hex.toLowerCase());
		}
	}, [element]);

	return (
		<>
			<section className="sidebar-panel">
				<header className="panel-header" onClick={() => toggleSection("properties")}>
					<h3>{t("Collection properties")}</h3>
					<FontAwesomeIcon icon={sections.properties ? "chevron-up" : "chevron-down"} />
				</header>
				{sections.properties && (
					<div className="panel-content">
						<div className="form-group">
							<label htmlFor="entry-name">{t("Name")}</label>
							<input
								id="entry-name"
								type="text"
								className="form-control"
								value={name}
								onChange={(e) => handleChangeName(e.target.value)}
								autoFocus
							/>
						</div>
						<ElementColorPicker onColorChange={handleColorChange} selectedColor={selectedColor} />
					</div>
				)}
			</section>

			<section className="sidebar-panel">
				<header className="panel-header" onClick={() => toggleSection("rows")}>
					<h3>{t("Attributes")}</h3>
					<FontAwesomeIcon icon={sections.rows ? "chevron-up" : "chevron-down"} />
				</header>
				{sections.rows && (
					<div className="panel-content">
						{!hasIdAttribute && (
							<div style={{ marginBottom: 8, padding: '4px 8px', background: '#fff3cd', borderRadius: 4, fontSize: 12, color: '#856404' }}>
								{t("This collection has no ID attribute.")}
							</div>
						)}
						<RowList
							rows={rows}
							path={[]}
							element={element}
							onUpdate={handleUpdateAndRefresh}
							showFeedback={showFeedback}
							focusedRowPath={focusedRowPath}
							onFocusedRowConsumed={onFocusedRowConsumed}
							collections={collections}
						/>
					</div>
				)}
			</section>

			<section className="sidebar-panel">
				<header className="panel-header" onClick={() => toggleSection("disjunction")}>
					<h3>{t("Disjunction groups")}</h3>
					<FontAwesomeIcon icon={sections.disjunction ? "chevron-up" : "chevron-down"} />
				</header>
				{sections.disjunction && (
					<div className="panel-content">
						<DisjunctionGroupsEditor
							element={element}
							onUpdate={handleUpdateAndRefresh}
							showFeedback={showFeedback}
							externalVersion={rowsVersion}
						/>
					</div>
				)}
			</section>
		</>
	);
});

CollectionForm.displayName = "CollectionForm";

export default CollectionForm;
