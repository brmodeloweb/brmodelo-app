import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import Dropdown from "../../../components/Dropdown";
import ElementColorPicker, { getCurrentColor } from "../../../components/ElementColorPicker";
import { CARDINALITY_OPTIONS } from "./constants";

interface AttributeFormProps {
	name: string;
	cardinality: string;
	composed: boolean;
	cellView: any;
	onUpdate: (event: { type: string; value?: any }) => void;
}

const AttributeForm: React.FC<AttributeFormProps> = React.memo(({ name, cardinality, composed, cellView, onUpdate }) => {
	const { t } = useTranslation(["common"]);
	const [currentName, setCurrentName] = useState(name);
	const [currentCardinality, setCurrentCardinality] = useState(cardinality);
	const [currentComposed, setCurrentComposed] = useState(composed);

	useEffect(() => { setCurrentName(name); }, [name]);
	useEffect(() => { setCurrentCardinality(cardinality); }, [cardinality]);
	useEffect(() => { setCurrentComposed(composed); }, [composed]);

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
