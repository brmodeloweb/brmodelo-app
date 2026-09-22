import React, { useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import Dropdown from "../../../components/Dropdown/Dropdown";
import TypeParamsFields from "../../../components/TypeParamsFields/TypeParamsFields";
import {
	applyTypeDefaults,
	clearIrrelevantParams,
	getSqlTypeOptions,
	getSqlTypeOptionsForPrimaryKey,
	isSqlTypeAllowedForPrimaryKey,
	parseLegacyType,
} from "../../../services/dataTypes";
import CheckConstraint from "./CheckConstraint";

const COLUMN_TYPES = getSqlTypeOptions();
const PK_COLUMN_TYPES = getSqlTypeOptionsForPrimaryKey();

interface TableOption {
	name: string;
	id: string;
	columns: any[];
}

interface ColumnFormProps {
	column: any;
	tableNames: Array<{ name: string; value: string }>;
	tables?: TableOption[];
	onSave: (column: any, index?: number) => void;
	onDismiss: () => void;
	onDelete?: (index: number) => void;
	index?: number;
}

const normalizeInitialColumn = (column: any) => {
	const parsed = parseLegacyType(column?.type);
	const applied = applyTypeDefaults(parsed.type, {
		length: column?.length ?? parsed.length,
		precision: column?.precision ?? parsed.precision,
		scale: column?.scale ?? parsed.scale,
	});
	return clearIrrelevantParams({
		...column,
		type: applied.type,
		length: applied.length,
		precision: applied.precision,
		scale: applied.scale,
		tableOrigin: {
			idOrigin: "",
			idLink: "",
			idName: "",
			columnName: "",
			...(column?.tableOrigin || {}),
		},
	});
};

const isPrimaryKeyColumn = (col: any) => Boolean(col?.PK || col?.isPrimaryKey);

const ColumnForm: React.FC<ColumnFormProps> = React.memo(({
	column: initialColumn,
	tableNames,
	tables = [],
	onSave,
	onDismiss,
	onDelete,
	index,
}) => {
	const { t } = useTranslation(["common"]);
	const [column, setColumn] = useState(() => normalizeInitialColumn(initialColumn));
	const isExistingFK = initialColumn.FK;

	const updateField = useCallback((field: string, value: any) => {
		setColumn((prev: any) => {
			const updated = { ...prev, [field]: value };

			if (field === "PK" && value) {
				updated.NOT_NULL = false;
				updated.defaultValue = "";
				if (!isSqlTypeAllowedForPrimaryKey(updated.type)) {
					const applied = applyTypeDefaults("INT", {});
					updated.type = applied.type;
					updated.length = applied.length;
					updated.precision = applied.precision;
					updated.scale = applied.scale;
				}
			}
			if (field === "FK" && value) {
				updated.defaultValue = "";
				updated.AUTO_INCREMENT = false;
			}
			if (field === "FK" && !value) {
				updated.tableOrigin = { idOrigin: "", idLink: "", idName: "", columnName: "" };
				updated.AUTO_INCREMENT = prev.AUTO_INCREMENT;
			}
			if (field === "type") {
				if (updated.PK && !isSqlTypeAllowedForPrimaryKey(value)) {
					return prev;
				}
				const applied = applyTypeDefaults(value, updated);
				return clearIrrelevantParams({
					...updated,
					type: applied.type,
					length: applied.length,
					precision: applied.precision,
					scale: applied.scale,
				});
			}

			return updated;
		});
	}, []);

	const handleSelectType = useCallback((selected: { name: string; type: string }) => {
		updateField("type", selected.type);
	}, [updateField]);

	const handleTypeParamChange = useCallback((field: "length" | "precision" | "scale", value: number | undefined) => {
		setColumn((prev: any) => clearIrrelevantParams({ ...prev, [field]: value }));
	}, []);

	const applyOriginPk = useCallback((pkColumn: any, suggestName: boolean) => {
		setColumn((prev: any) => {
			const applied = applyTypeDefaults(pkColumn?.type || prev.type, {
				length: pkColumn?.length,
				precision: pkColumn?.precision,
				scale: pkColumn?.scale,
			});
			return clearIrrelevantParams({
				...prev,
				name: suggestName && !prev.name ? (pkColumn?.name || prev.name) : prev.name,
				type: applied.type,
				length: applied.length,
				precision: applied.precision,
				scale: applied.scale,
				tableOrigin: {
					...prev.tableOrigin,
					columnName: pkColumn?.name || "",
				},
			});
		});
	}, []);

	const handleSelectTableOrigin = useCallback((selected: { name: string; value: string }) => {
		const originTable = tables.find(table => table.id === selected.value || table.name === selected.name);
		const primaryKeys = (originTable?.columns || []).filter(isPrimaryKeyColumn);
		const firstPk = primaryKeys[0];

		setColumn((prev: any) => {
			const applied = firstPk
				? applyTypeDefaults(firstPk.type || prev.type, {
					length: firstPk.length,
					precision: firstPk.precision,
					scale: firstPk.scale,
				})
				: prev;
			return clearIrrelevantParams({
				...prev,
				name: !prev.name && firstPk?.name ? firstPk.name : prev.name,
				type: firstPk ? applied.type : prev.type,
				length: firstPk ? applied.length : prev.length,
				precision: firstPk ? applied.precision : prev.precision,
				scale: firstPk ? applied.scale : prev.scale,
				tableOrigin: {
					...prev.tableOrigin,
					idName: selected.name,
					idOrigin: selected.value,
					columnName: firstPk?.name || "",
				},
			});
		});
	}, [tables]);

	const handleSelectOriginColumn = useCallback((selected: { name: string; type: string }) => {
		const originTable = tables.find(
			table => table.id === column.tableOrigin?.idOrigin || table.name === column.tableOrigin?.idName,
		);
		const pkColumn = (originTable?.columns || []).find(
			(col: any) => isPrimaryKeyColumn(col) && col.name === selected.type,
		);
		applyOriginPk(pkColumn || { name: selected.type }, !column.name);
	}, [tables, column.tableOrigin, column.name, applyOriginPk]);

	const handleSave = useCallback(() => {
		onSave(clearIrrelevantParams(column), index);
	}, [column, index, onSave]);

	const tableOriginOptions = tableNames.map(table => ({ name: table.name, type: table.value }));
	const resolvedOriginName = column.tableOrigin?.idName
		|| tableNames.find(table => table.value === column.tableOrigin?.idOrigin)?.name
		|| "";
	const selectedTableOrigin = {
		name: resolvedOriginName || t("Source"),
		type: column.tableOrigin?.idOrigin || "",
	};

	const originPkOptions = useMemo(() => {
		const originTable = tables.find(
			table => table.id === column.tableOrigin?.idOrigin || table.name === column.tableOrigin?.idName,
		);
		return (originTable?.columns || [])
			.filter(isPrimaryKeyColumn)
			.map((col: any) => ({ name: col.name, type: col.name }));
	}, [tables, column.tableOrigin?.idOrigin, column.tableOrigin?.idName]);

	const selectedOriginColumn = {
		name: column.tableOrigin?.columnName || t("Reference column"),
		type: column.tableOrigin?.columnName || "",
	};

	const hasResolvedOrigin = Boolean(
		column.tableOrigin?.idOrigin || column.tableOrigin?.idName,
	);

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
					options={column.PK ? PK_COLUMN_TYPES : COLUMN_TYPES}
				/>
			</div>

			<TypeParamsFields
				typeName={column.type}
				length={column.length}
				precision={column.precision}
				scale={column.scale}
				onChange={handleTypeParamChange}
			/>

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

			{column.FK && (
				<div className="form-group clearfix">
					<label>{t("Reference column")}</label>
					<Dropdown
						disabled={!hasResolvedOrigin || originPkOptions.length === 0}
						onSelect={handleSelectOriginColumn}
						selected={selectedOriginColumn}
						options={originPkOptions}
					/>
				</div>
			)}

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
