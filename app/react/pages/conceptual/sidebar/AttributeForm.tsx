import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import Dropdown from "../../../components/Dropdown";
import ElementColorPicker, { getCurrentColor } from "../../../components/ElementColorPicker";
import TypeParamsFields from "../../../components/TypeParamsFields/TypeParamsFields";
import {
	applyTypeDefaults,
	clearIrrelevantParams,
	getSqlTypeOptions,
} from "../../../services/dataTypes";
import { CARDINALITY_OPTIONS } from "./constants";

interface AttributeFormProps {
	name: string;
	cardinality: string;
	composed: boolean;
	dataType?: string;
	length?: number | null;
	precision?: number | null;
	scale?: number | null;
	cellView: any;
	onUpdate: (event: { type: string; value?: any }) => void;
}

const COLUMN_TYPES = getSqlTypeOptions();

const AttributeForm: React.FC<AttributeFormProps> = React.memo(({
	name,
	cardinality,
	composed,
	dataType = "VARCHAR",
	length = 255,
	precision = null,
	scale = null,
	cellView,
	onUpdate,
}) => {
	const { t } = useTranslation(["common"]);
	const [currentName, setCurrentName] = useState(name);
	const [currentCardinality, setCurrentCardinality] = useState(cardinality);
	const [currentComposed, setCurrentComposed] = useState(composed);
	const [currentDataType, setCurrentDataType] = useState(dataType);
	const [currentLength, setCurrentLength] = useState<number | null | undefined>(length);
	const [currentPrecision, setCurrentPrecision] = useState<number | null | undefined>(precision);
	const [currentScale, setCurrentScale] = useState<number | null | undefined>(scale);

	useEffect(() => { setCurrentName(name); }, [name]);
	useEffect(() => { setCurrentCardinality(cardinality); }, [cardinality]);
	useEffect(() => { setCurrentComposed(composed); }, [composed]);
	useEffect(() => { setCurrentDataType(dataType); }, [dataType]);
	useEffect(() => { setCurrentLength(length); }, [length]);
	useEffect(() => { setCurrentPrecision(precision); }, [precision]);
	useEffect(() => { setCurrentScale(scale); }, [scale]);

	const handleNameChange = (newName: string) => {
		setCurrentName(newName);
		onUpdate({ type: "attribute.name", value: newName });
	};

	const handleCardinalityChange = useCallback((selected: { name: string; type: string }) => {
		setCurrentCardinality(selected.type);
		onUpdate({ type: "attribute.cardinality", value: selected.type });
	}, [onUpdate]);

	const handleComposedChange = () => {
		const newValue = !currentComposed;
		setCurrentComposed(newValue);
		onUpdate({ type: "attribute.composed", value: newValue });
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

	const [selectedColor, setSelectedColor] = useState<string | null>(() => getCurrentColor(cellView));

	useEffect(() => { setSelectedColor(getCurrentColor(cellView)); }, [cellView]);

	const handleColorChange = useCallback((hex: string) => {
		if (cellView && cellView.model && cellView.model.setColor) {
			cellView.model.setColor(hex);
			setSelectedColor(hex.toLowerCase());
		}
	}, [cellView]);

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
				<label>{t("Cardinality")}</label>
				<Dropdown
					onSelect={handleCardinalityChange}
					selected={{ name: currentCardinality, type: currentCardinality }}
					options={CARDINALITY_OPTIONS}
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

			<div className="checkbox">
				<label htmlFor="compound">
					<input
						id="compound"
						type="checkbox"
						checked={currentComposed}
						onChange={handleComposedChange}
					/>{" "}
					{t("Composed")}
				</label>
			</div>

			<ElementColorPicker onColorChange={handleColorChange} selectedColor={selectedColor} />
		</>
	);
});

AttributeForm.displayName = "AttributeForm";

export default AttributeForm;
