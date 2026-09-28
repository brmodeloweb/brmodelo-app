import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import Sortable from "sortablejs";
import ColumnForm from "./ColumnForm";
import ViewForm from "./ViewForm";
import ElementColorPicker, { getCurrentColor } from "../../../components/ElementColorPicker";
import { resolveFKTableOrigin } from "./tableFormValidation";

interface TableFormProps {
	element: any;
	tables: Array<{ name: string; columns: any[]; id: string }>;
	relatedViews: Array<{ name: string; tables: any[]; queryConditions: any }>;
	onUpdate: (event: { type: string; element?: any; value?: any; index?: number; fromIndex?: number; toIndex?: number }) => void;
	showFeedback: (message: string, showing: boolean, type?: "success" | "error" | "warning") => void;
	onOpenQueryExpression?: (tables: any[], queryConditions: any) => Promise<any>;
}

const newColumnObject = () => ({
	name: "",
	PK: false,
	FK: false,
	NOT_NULL: false,
	UNIQUE: false,
	AUTO_INCREMENT: false,
	defaultValue: "",
	type: "INT",
	tableOrigin: { idOrigin: "", idLink: "", idName: "" },
});

const TableForm: React.FC<TableFormProps> = React.memo(({
	element,
	tables,
	relatedViews,
	onUpdate,
	showFeedback,
	onOpenQueryExpression,
}) => {
	const { t } = useTranslation(["common"]);
	const model = element?.model;
	const [name, setName] = useState(model?.attributes?.name || "");
	const [sections, setSections] = useState({ tableProperties: true, columns: false, views: false });
	const [expandedColumnIndex, setExpandedColumnIndex] = useState<number | null>(null);
	const [addColumnVisible, setAddColumnVisible] = useState(false);
	const [expandedViewIndex, setExpandedViewIndex] = useState<number | null>(null);
	const sortableRef = useRef<Sortable | null>(null);
	const columnsListRef = useRef<HTMLUListElement>(null);

	const columns: any[] = model?.attributes?.rows || [];
	const mapTables = useMemo(() => new Map(tables.map(table => [table.name, table.id])), [tables]);
	const tableNames = useMemo(() => tables.map(table => ({ name: table.name, value: table.id })), [tables]);

	useEffect(() => {
		setName(model?.attributes?.name || "");
		setExpandedColumnIndex(null);
		setAddColumnVisible(false);
		setExpandedViewIndex(null);
	}, [model?.id]);

	// SortableJS for column reorder
	useEffect(() => {
		if (!sections.columns || !columnsListRef.current) return;

		sortableRef.current = Sortable.create(columnsListRef.current, {
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
					type: "reorderColumns",
					element,
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
	}, [element, onUpdate, sections.columns]);

	const toggleSection = useCallback((section: keyof typeof sections) => {
		setSections(prev => ({ ...prev, [section]: !prev[section] }));
	}, []);

	const handleChangeName = useCallback((newName: string) => {
		setName(newName);
		if (newName) {
			onUpdate({ type: "updateName", element, value: newName });
		}
	}, [element, onUpdate]);

	const getTableOriginName = useCallback((tableId: string) => {
		const entry = Array.from(mapTables).find(([, value]) => value === tableId);
		return entry ? entry[0] : "";
	}, [mapTables]);

	const checkColumnBeforeSave = useCallback((column: any): any | null => {
		if (column.name === "") {
			showFeedback("The column name cannot be empty!", true, "error");
			return null;
		}
		if (column.FK) {
			const resolved = resolveFKTableOrigin(column.tableOrigin, tables);
			if (!resolved) {
				showFeedback("Select the foreign table source!", true, "error");
				return null;
			}
			column.tableOrigin = { ...column.tableOrigin, ...resolved };
		}
		return column;
	}, [tables, showFeedback]);

	const handleAddColumn = useCallback((column: any) => {
		const validColumn = checkColumnBeforeSave(column);
		if (validColumn) {
			onUpdate({ type: "addColumn", element, value: validColumn });
			setAddColumnVisible(false);
		}
	}, [element, onUpdate, checkColumnBeforeSave]);

	const handleEditColumn = useCallback((editedColumn: any, index: number) => {
		const validColumn = checkColumnBeforeSave(editedColumn);
		if (validColumn) {
			const originalColumn = columns[index];
			const fkAdded = validColumn.FK && !(originalColumn?.FK || originalColumn?.isForeignKey);
			setExpandedColumnIndex(null);
			if (fkAdded) {
				onUpdate({ type: "deleteColumn", element, index });
				onUpdate({ type: "addColumn", element, value: validColumn });
			} else {
				onUpdate({ type: "editColumn", element, index, value: validColumn });
			}
		}
	}, [element, columns, onUpdate, checkColumnBeforeSave]);

	const handleDeleteColumn = useCallback((index: number) => {
		setExpandedColumnIndex(null);
		onUpdate({ type: "deleteColumn", element, index });
	}, [element, onUpdate]);

	const handleExpandColumn = useCallback((index: number) => {
		setExpandedColumnIndex(prev => prev === index ? null : index);
		setAddColumnVisible(false);
	}, []);

	const handleShowAddColumn = useCallback((show: boolean) => {
		setAddColumnVisible(show);
		setExpandedColumnIndex(null);
	}, []);

	const [selectedColor, setSelectedColor] = useState<string | null>(() => getCurrentColor(element));

	useEffect(() => {
		setSelectedColor(getCurrentColor(element));
	}, [model?.id, element]);

	const handleColorChange = useCallback((hex: string) => {
		if (element && element.model && element.model.setColor) {
			element.model.setColor(hex);
			setSelectedColor(hex.toLowerCase());
		}
	}, [element]);

	return (
		<>
			<section className="sidebar-panel">
				<header className="panel-header" onClick={() => toggleSection("tableProperties")}>
					<h3>{t("Table properties")}</h3>
					<FontAwesomeIcon icon={sections.tableProperties ? "chevron-up" : "chevron-down"} />
				</header>
				{sections.tableProperties && (
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
					</div>
				)}
			</section>

			<section className="sidebar-panel">
				<header className="panel-header" onClick={() => toggleSection("columns")}>
					<h3>{t("Columns")}</h3>
					<FontAwesomeIcon icon={sections.columns ? "chevron-up" : "chevron-down"} />
				</header>
				{sections.columns && (
					<div className="panel-content">
						<ul className="table-columns" ref={columnsListRef}>
							{columns.map((column, index) => (
								<li className="card-item" key={index}>
									{expandedColumnIndex !== index ? (
										<header>
											<span className="column-drag-handle" title={t("Drag to reorder")}>
												<FontAwesomeIcon icon="bars" />
											</span>
											<div className="column-header-left" onClick={() => handleExpandColumn(index)}>
												<h4 className="table-title">{column.name}</h4>
												{(column.isPrimaryKey || column.PK || column.isForeignKey || column.FK) && (
													<span className="relationship">
														{(column.isPrimaryKey || column.PK) ? "PK" : "FK"}
													</span>
												)}
											</div>
										</header>
									) : (
										<ColumnForm
											column={{
												...JSON.parse(JSON.stringify(column)),
												tableOrigin: {
													...column.tableOrigin,
													idName: getTableOriginName(column.tableOrigin?.idOrigin),
												},
											}}
											tableNames={tableNames}
											onSave={(editedColumn) => handleEditColumn(editedColumn, index)}
											onDismiss={() => setExpandedColumnIndex(null)}
											onDelete={() => handleDeleteColumn(index)}
											index={index}
										/>
									)}
								</li>
							))}
						</ul>

						{addColumnVisible ? (
							<div className="card-item">
								<ColumnForm
									column={newColumnObject()}
									tableNames={tableNames}
									onSave={handleAddColumn}
									onDismiss={() => handleShowAddColumn(false)}
								/>
							</div>
						) : (
							<button
								className="br-button br-button--full"
								onClick={() => handleShowAddColumn(true)}
							>
								{t("Add new column")}
							</button>
						)}
					</div>
				)}
			</section>

			<section className="sidebar-panel">
				<header className="panel-header" onClick={() => toggleSection("views")}>
					<h3>{t("Views")}</h3>
					<FontAwesomeIcon icon={sections.views ? "chevron-up" : "chevron-down"} />
				</header>
				{sections.views && (
					<div className="panel-content">
						<ul className="views-list">
							{relatedViews.map((view, index) => (
								<li className="view-item" key={index}>
									{expandedViewIndex !== index ? (
										<header onClick={() => setExpandedViewIndex(index)}>
											<FontAwesomeIcon icon="filter" />
											<h4 className="table-title">{view.name}</h4>
										</header>
									) : (
										<ViewForm
											element={element}
											tables={tables}
											onUpdate={onUpdate}
											view={view}
											onDismiss={() => setExpandedViewIndex(null)}
											onOpenQueryExpression={onOpenQueryExpression}
										/>
									)}
								</li>
							))}
						</ul>
					</div>
				)}
			</section>

			<ElementColorPicker onColorChange={handleColorChange} selectedColor={selectedColor} />
		</>
	);
});

TableForm.displayName = "TableForm";

export default TableForm;
