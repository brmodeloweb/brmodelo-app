import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import Dropdown from "../../../components/Dropdown";
import ElementColorPicker, { getCurrentColor } from "../../../components/ElementColorPicker";
import { SPECIALIZE_OPTIONS } from "./constants";

interface BlockAssociativeFormProps {
	cellView: any;
	onUpdate: (event: { type: string; value?: any }) => void;
}

const EMPTY_SELECTION = { name: "Select", type: "empty" };

const BlockAssociativeForm: React.FC<BlockAssociativeFormProps> = React.memo(({ cellView, onUpdate }) => {
	const { t } = useTranslation(["common"]);
	const [selectedSpecialize, setSelectedSpecialize] = useState(EMPTY_SELECTION);

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
		<>
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
		</>
	);
});

BlockAssociativeForm.displayName = "BlockAssociativeForm";

export default BlockAssociativeForm;
