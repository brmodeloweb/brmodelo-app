import React, { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import Dropdown from "../../../components/Dropdown/Dropdown";
import CheckConstraint from "./CheckConstraint";

const COLUMN_TYPES = [
	{ name: "DATE", type: "DATE" },
	{ name: "DATETIME", type: "DATETIME" },
	{ name: "TIME", type: "TIME" },
	{ name: "INT", type: "INT" },
	{ name: "BOOLEAN", type: "BOOLEAN" },
	{ name: "FLOAT", type: "FLOAT" },
	{ name: "VARCHAR", type: "VARCHAR" },
	{ name: "CHAR", type: "CHAR" },
	{ name: "JSON", type: "JSON" },
	{ name: "ENUM", type: "ENUM" },
	{ name: "SET", type: "SET" },
];

interface ColumnFormProps {
	column: any;
	tableNames: Array<{ name: string; value: string }>;
	onSave: (column: any, index?: number) => void;
	onDismiss: () => void;
	onDelete?: (index: number) => void;
	index?: number;
}

const ColumnForm: React.FC<ColumnFormProps> = React.memo(({
	column: initialColumn,
	tableNames,
	onSave,
	onDismiss,
	onDelete,
	index,
}) => {
	const { t } = useTranslation(["common"]);
	const [column, setColumn] = useState({ ...initialColumn });
	const isExistingFK = initialColumn.FK;

	const updateField = useCallback((field: string, value: any) => {
		setColumn((prev: any) => {
			const updated = { ...prev, [field]: value };

			if (field === "PK" && value) {
				updated.type = "INT";
				updated.NOT_NULL = false;
				updated.defaultValue = "";
			}
			if (field === "FK" && value) {
				updated.type = "INT";
				updated.defaultValue = "";
				updated.AUTO_INCREMENT = false;
			}
			if (field === "FK" && !value) {
				updated.tableOrigin = { idOrigin: "", idLink: "", idName: "" };
				updated.AUTO_INCREMENT = prev.AUTO_INCREMENT;
			}

			return updated;
		});
	}, []);

	const handleSelectType = useCallback((selected: { name: string; type: string }) => {
		if (!column.PK && !column.FK) {
			updateField("type", selected.type);
		} else {
			updateField("type", "INT");
		}
	}, [column.PK, column.FK, updateField]);

	const handleSelectTableOrigin = useCallback((selected: { name: string; value: string }) => {
		setColumn((prev: any) => ({
			...prev,
			tableOrigin: { ...prev.tableOrigin, idName: selected.name },
		}));
	}, []);

	const handleSave = useCallback(() => {
		onSave(column, index);
	}, [column, index, onSave]);

	const tableOriginOptions = tableNames.map(t => ({ name: t.name, type: t.value }));
	const resolvedOriginName = column.tableOrigin?.idName
		|| tableNames.find(t => t.value === column.tableOrigin?.idOrigin)?.name
		|| "";
	const selectedTableOrigin = {
		name: resolvedOriginName || t("Source"),
		type: column.tableOrigin?.idOrigin || "",
	};

	return (
		<div className="column-form">
			<div className="form-group">
				<label htmlFor="column-name">{t("Name")}</label>
				<input
					id="column-name"
					type="text"
					className="form-control"
					value={column.name}
					onChange={(e) => updateField("name", e.target.value)}
				/>
			</div>

			<div className="form-group clearfix">
				<label>{t("Type")}</label>
				<Dropdown
					onSelect={handleSelectType}
					selected={{ name: column.type, type: column.type }}
					options={COLUMN_TYPES}
				/>
			</div>

			<div className="form-group">
				<label htmlFor="column-default">{t("Default")}</label>
				<input
					id="column-default"
					type="text"
					className="form-control"
					value={column.defaultValue || ""}
					onChange={(e) => updateField("defaultValue", e.target.value)}
					disabled={column.PK || column.FK}
				/>
			</div>

			<CheckConstraint column={column} onChange={updateField} />

			<div className="form-group">
				<div className="checkbox">
					<label htmlFor="column-pk">
						<input
							id="column-pk"
							type="checkbox"
							checked={column.PK || false}
							onChange={(e) => updateField("PK", e.target.checked)}
						/>
						{t("PK")}
					</label>
				</div>

				<div className="checkbox">
					<label htmlFor="column-fk">
						<input
							id="column-fk"
							type="checkbox"
							checked={column.FK || false}
							onChange={(e) => updateField("FK", e.target.checked)}
						/>
						{t("FK")}
					</label>
				</div>

				<div className="checkbox">
					<label htmlFor="column-not-null">
						<input
							id="column-not-null"
							type="checkbox"
							checked={column.NOT_NULL || false}
							onChange={(e) => updateField("NOT_NULL", e.target.checked)}
							disabled={column.PK}
						/>
						{t("NOT NULL")}
					</label>
				</div>

				<div className="checkbox">
					<label htmlFor="column-unique">
						<input
							id="column-unique"
							type="checkbox"
							checked={column.UNIQUE || false}
							onChange={(e) => updateField("UNIQUE", e.target.checked)}
							disabled={column.PK || column.defaultValue}
						/>
						{t("UNIQUE")}
					</label>
				</div>

				<div className="checkbox">
					<label htmlFor="column-auto-increment">
						<input
							id="column-auto-increment"
							type="checkbox"
							checked={column.AUTO_INCREMENT || false}
							onChange={(e) => updateField("AUTO_INCREMENT", e.target.checked)}
							disabled={column.defaultValue || column.FK}
						/>
						{t("AUTO INCREMENT")}
					</label>
				</div>
			</div>

			<div className="form-group clearfix">
				<label>{t("Source")}</label>
				<Dropdown
					disabled={!column.FK || isExistingFK}
					onSelect={(selected) => handleSelectTableOrigin({ name: selected.name, value: selected.type })}
					selected={selectedTableOrigin}
					options={tableOriginOptions}
				/>
			</div>

			<footer className="card-item-actions">
				<div className="actions-regular">
					<button className="br-button" onClick={handleSave}>{t("Save")}</button>
					<button className="br-button warning" onClick={onDismiss}>{t("Cancel")}</button>
				</div>
				{onDelete && index !== undefined && (
					<div className="actions-destructive">
						<button className="br-button destructive" onClick={() => onDelete(index)}>{t("Delete")}</button>
					</div>
				)}
			</footer>
		</div>
	);
});

ColumnForm.displayName = "ColumnForm";

export default ColumnForm;
