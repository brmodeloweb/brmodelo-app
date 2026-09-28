import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import Dropdown from "../../../components/Dropdown";
import ElementColorPicker, { getCurrentColor } from "../../../components/ElementColorPicker";
import { SPECIALIZE_OPTIONS } from "./constants";

interface ExtensionFormProps {
	extensionType: string;
	cellView: any;
	onUpdate: (event: { type: string; value?: any }) => void;
}

const ExtensionForm: React.FC<ExtensionFormProps> = React.memo(({ extensionType, cellView, onUpdate }) => {
	const { t } = useTranslation(["common"]);
	const [currentType, setCurrentType] = useState(extensionType);

	useEffect(() => { setCurrentType(extensionType); }, [extensionType]);

	const handleEditExtension = useCallback((selected: { name: string; type: string }) => {
		setCurrentType(selected.type);
		onUpdate({ type: "editExtention", value: selected.type });
	}, [onUpdate]);

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
				<label>{t("Edit")}</label>
				<Dropdown
					onSelect={handleEditExtension}
					selected={{ name: currentType, type: currentType }}
					options={SPECIALIZE_OPTIONS}
				/>
			</div>

			<ElementColorPicker onColorChange={handleColorChange} selectedColor={selectedColor} />
		</>
	);
});

ExtensionForm.displayName = "ExtensionForm";

export default ExtensionForm;
