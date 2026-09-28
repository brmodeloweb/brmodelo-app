import React, { useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { comparasionOperators } from "../queryExpressionService";

interface ViewFormProps {
	element: any;
	tables: Array<{ name: string; columns: any[]; id: string }>;
	onUpdate: (event: { type: string; element?: any; value?: any }) => void;
	view?: { name: string; tables: any[]; queryConditions: any };
	onDismiss?: () => void;
	onOpenQueryExpression?: (tables: any[], queryConditions: any) => Promise<any>;
}

const ViewForm: React.FC<ViewFormProps> = React.memo(({
	element,
	tables: allTables,
	onUpdate,
	view: initialView,
	onDismiss,
	onOpenQueryExpression,
}) => {
	const { t } = useTranslation(["common"]);

	const buildViewTables = useCallback(() => {
		const sameTable = (
			left: { id?: string; name: string },
			right: { id?: string; name: string },
		) => (left.id && right.id ? left.id === right.id : left.name === right.name);

		const viewTables = initialView?.tables || element?.model?.attributes?.objects || [];
		const merged = viewTables.map((vt: any) => {
			const copy = { ...vt };
			const currentTable = allTables.find(t => sameTable(vt, t));
			if (currentTable) {
				copy.columns = currentTable.columns.map(col => {
					const saved = vt.columns?.find((c: any) => c.name === col.name);
					return { ...col, selected: saved?.selected || false };
				});
			}
			return copy;
		});
		allTables.forEach(table => {
			if (!merged.some((t: any) => sameTable(t, table))) {
				merged.push({
					...table,
					columns: table.columns.map(c => ({ ...c, selected: false })),
					selected: false,
				});
			}
		});
		return merged;
	}, [initialView, allTables, element]);

	const [viewName, setViewName] = useState(initialView?.name || element?.model?.attributes?.name || "");
	const [viewTables, setViewTables] = useState<any[]>(() => buildViewTables());
	const [queryConditions, setQueryConditions] = useState(initialView?.queryConditions || element?.model?.attributes?.queryConditions || {});

	useEffect(() => {
		setViewName(initialView?.name || element?.model?.attributes?.name || "");
		setViewTables(buildViewTables());
		setQueryConditions(initialView?.queryConditions || element?.model?.attributes?.queryConditions || {});
	}, [element?.model?.id, initialView, buildViewTables]);

	const handleChangeName = useCallback((newName: string) => {
		setViewName(newName);
	}, []);

	const handleToggleTable = useCallback((index: number) => {
		setViewTables(prev => {
			const updated = [...prev];
			updated[index] = { ...updated[index], selected: !updated[index].selected };
			return updated;
		});
	}, []);

	const handleToggleColumn = useCallback((tableIndex: number, columnIndex: number) => {
		setViewTables(prev => {
			const updated = [...prev];
			const updatedColumns = [...updated[tableIndex].columns];
			updatedColumns[columnIndex] = { ...updatedColumns[columnIndex], selected: !updatedColumns[columnIndex].selected };
			updated[tableIndex] = { ...updated[tableIndex], columns: updatedColumns };
			return updated;
		});
	}, []);

	const handleSave = useCallback(() => {
		const filteredTables = viewTables.filter(table => table.selected);
		const columns: any[] = [];
		filteredTables.forEach(table => {
			table.columns.forEach((column: any) => {
				if (column.selected) columns.push(column);
			});
		});

		const view = {
			...(initialView ?? {}),
			name: viewName,
			tables: viewTables,
			queryConditions,
			basedIn: filteredTables,
			columns,
		};

		onUpdate({ type: "saveView", element, value: view });
	}, [viewName, viewTables, queryConditions, element, initialView, onUpdate]);

	const handleOpenQueryExpression = useCallback(() => {
		if (!onOpenQueryExpression) return;
		const selectedTables = viewTables.filter(table => table.selected);
		onOpenQueryExpression(selectedTables, queryConditions).then(({ conditions, joins }: any) => {
			const text = conditions
				.map(({ columnName, type, comparativeValue, comparativeValue2, logicalOperator }: any, index: number) =>
					`${columnName} ${(comparasionOperators as any)[type](comparativeValue, comparativeValue2)} ${conditions.length - 1 === index ? "" : logicalOperator}`)
				.join(" ");
			setQueryConditions({ joins: joins.filter((join: any) => join.submitted), values: conditions, text });
		}).catch(() => {});
	}, [onOpenQueryExpression, viewTables, queryConditions]);

	return (
		<div className="views">
			<div className="form-group">
				<label htmlFor="view-name">{t("Name")}</label>
				<input
					id="view-name"
					type="text"
					className="form-control"
					value={viewName}
					onChange={(e) => handleChangeName(e.target.value)}
					autoFocus
				/>
			</div>

			<div className="form-group">
				<label>{t("Based in")}</label>
				{viewTables.map((table, index) => (
					<div className="checkbox" key={table.name}>
						<label htmlFor={table.name}>
							<input
								id={table.name}
								type="checkbox"
								checked={table.selected || false}
								onChange={() => handleToggleTable(index)}
							/>
							{table.name}
						</label>
					</div>
				))}
			</div>

			<div className="form-group">
				<label>{t("View columns")}</label>
				{viewTables.filter(table => table.selected).map((table, tableIndex) => (
					<section className="table-preview" key={table.name}>
						<header>
							<h5>{table.name}</h5>
						</header>
						<div className="table-preview-body">
							{(table.columns || []).map((column: any, columnIndex: number) => (
								<div className="checkbox" key={table.name + column.name}>
									<label htmlFor={table.name + column.name}>
										<input
											id={table.name + column.name}
											type="checkbox"
											checked={column.selected || false}
											onChange={() => {
												const realIndex = viewTables.findIndex(t => t.name === table.name);
												handleToggleColumn(realIndex, columnIndex);
											}}
										/>
										{column.name}
									</label>
								</div>
							))}
						</div>
					</section>
				))}
			</div>

			<div className="form-group">
				<label htmlFor="view-query">{t("Query expression")}</label>
				<textarea
					id="view-query"
					className="form-control query-expression-textarea"
					value={queryConditions.text || ""}
					onChange={(e) => setQueryConditions((prev: any) => ({ ...prev, text: e.target.value }))}
				/>
				{onOpenQueryExpression && (
					<button type="button" className="link-button" onClick={handleOpenQueryExpression}>
						{queryConditions.values ? t("Edit query for view creation") : t("Include query for view creation")}
					</button>
				)}
			</div>

			<div className="card-item-actions">
				<div className="actions-regular">
					<button className="br-button" onClick={handleSave}>{t("Save")}</button>
					{onDismiss && (
						<button className="br-button warning" onClick={onDismiss}>{t("Cancel")}</button>
					)}
				</div>
			</div>
		</div>
	);
});

ViewForm.displayName = "ViewForm";

export default ViewForm;
