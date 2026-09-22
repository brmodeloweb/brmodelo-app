import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import Dropdown from "../../../components/Dropdown";
import TypeParamsFields from "../../../components/TypeParamsFields/TypeParamsFields";
import {
	applyTypeDefaults,
	clearIrrelevantParams,
	getSqlTypeOptionsForPrimaryKey,
} from "../../../services/dataTypes";

interface KeyFormProps {
	name: string;
	dataType?: string;
	length?: number | null;
	precision?: number | null;
	scale?: number | null;
	onUpdate: (event: { type: string; value?: any }) => void;
}

const COLUMN_TYPES = getSqlTypeOptionsForPrimaryKey();

const KeyForm: React.FC<KeyFormProps> = React.memo(({
	name,
	dataType = "INT",
	length = null,
	precision = null,
	scale = null,
	onUpdate,
}) => {
	const { t } = useTranslation(["common"]);
	const [currentName, setCurrentName] = useState(name);
	const [currentDataType, setCurrentDataType] = useState(dataType);
	const [currentLength, setCurrentLength] = useState<number | null | undefined>(length);
	const [currentPrecision, setCurrentPrecision] = useState<number | null | undefined>(precision);
	const [currentScale, setCurrentScale] = useState<number | null | undefined>(scale);

	useEffect(() => { setCurrentName(name); }, [name]);
	useEffect(() => { setCurrentDataType(dataType); }, [dataType]);
	useEffect(() => { setCurrentLength(length); }, [length]);
	useEffect(() => { setCurrentPrecision(precision); }, [precision]);
	useEffect(() => { setCurrentScale(scale); }, [scale]);

	const handleNameChange = (newName: string) => {
		setCurrentName(newName);
		if (newName !== "") {
			onUpdate({ type: "name", value: newName });
		}
	};

	const emitTypeUpdate = useCallback((next: {
		dataType: string;
		length?: number | null;
		precision?: number | null;
		scale?: number | null;
	}) => {
		const applied = applyTypeDefaults(next.dataType, next);
		const cleaned = clearIrrelevantParams({
			type: applied.type,
			length: applied.length,
			precision: applied.precision,
			scale: applied.scale,
		});
		setCurrentDataType(cleaned.type || next.dataType);
		setCurrentLength(cleaned.length ?? null);
		setCurrentPrecision(cleaned.precision ?? null);
		setCurrentScale(cleaned.scale ?? null);
		onUpdate({
			type: "attribute.dataType",
			value: {
				dataType: cleaned.type,
				length: cleaned.length,
				precision: cleaned.precision,
				scale: cleaned.scale,
			},
		});
	}, [onUpdate]);

	const handleSelectType = useCallback((selected: { name: string; type: string }) => {
		emitTypeUpdate({
			dataType: selected.type,
			length: currentLength,
			precision: currentPrecision,
			scale: currentScale,
		});
	}, [currentLength, currentPrecision, currentScale, emitTypeUpdate]);

	const handleTypeParamChange = useCallback((field: "length" | "precision" | "scale", value: number | undefined) => {
		emitTypeUpdate({
			dataType: currentDataType,
			length: field === "length" ? value : currentLength,
			precision: field === "precision" ? value : currentPrecision,
			scale: field === "scale" ? value : currentScale,
		});
	}, [currentDataType, currentLength, currentPrecision, currentScale, emitTypeUpdate]);

	return (
		<>
			<div className="form-group">
				<label htmlFor="entry-name">{t("Name")}</label>
				<input
					id="entry-name"
					type="text"
					className="form-control"
					value={currentName}
					onChange={(e) => handleNameChange(e.target.value)}
					autoFocus
				/>
			</div>

			<div className="form-group clearfix">
				<label>{t("Type")}</label>
				<Dropdown
					onSelect={handleSelectType}
					selected={{ name: currentDataType, type: currentDataType }}
					options={COLUMN_TYPES}
				/>
			</div>

			<TypeParamsFields
				typeName={currentDataType}
				length={currentLength}
				precision={currentPrecision}
				scale={currentScale}
				onChange={handleTypeParamChange}
			/>
		</>
	);
});

KeyForm.displayName = "KeyForm";

export default KeyForm;
