import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import Dropdown from "../../../components/Dropdown";
import ElementColorPicker, { getCurrentColor } from "../../../components/ElementColorPicker";
import { SPECIALIZE_OPTIONS } from "./constants";

interface EntityFormProps {
	name: string;
	cellView: any;
	onUpdate: (event: { type: string; value?: any }) => void;
}

const EMPTY_SELECTION = { name: "Select", type: "empty" };

const EntityForm: React.FC<EntityFormProps> = React.memo(({ name, cellView, onUpdate }) => {
	const { t } = useTranslation(["common"]);
	const [currentName, setCurrentName] = useState(name);
	const [selectedSpecialize, setSelectedSpecialize] = useState(EMPTY_SELECTION);

	useEffect(() => { setCurrentName(name); }, [name]);

	const handleNameChange = (newName: string) => {
		setCurrentName(newName);
		if (newName !== "") {
			onUpdate({ type: "name", value: newName });
		}
	};

	const handleSpecialize = useCallback((selected: { name: string; type: string }) => {
		setSelectedSpecialize(selected);
		onUpdate({ type: "extention", value: selected.type });
	}, [onUpdate]);

	const handleAddAutoRelationship = () => {
		onUpdate({ type: "addAutoRelationship" });
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
		<div className="form-group">
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
				<label>{t("Specialize")}</label>
				<Dropdown
					onSelect={handleSpecialize}
					selected={selectedSpecialize}
					options={SPECIALIZE_OPTIONS}
				/>
			</div>

			<div className="form-group">
				<label>{t("Self relationship")}</label>
				<div>
					<button type="button" className="br-button" onClick={handleAddAutoRelationship}>
						{t("Add")}
					</button>
				</div>
			</div>

			<ElementColorPicker onColorChange={handleColorChange} selectedColor={selectedColor} />
		</div>
	);
});

EntityForm.displayName = "EntityForm";

export default EntityForm;
