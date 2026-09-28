import React, { useId } from "react";
import { useTranslation } from "react-i18next";

export const getCurrentColor = (cellView: any): string | null => {
	const model = cellView?.model;
	if (!model) return null;
	const color = model.attr('.outer/fill') || model.attr('polygon/fill') || model.attr('header/fill') || null;
	return color ? color.toLowerCase() : null;
};

const COLOR_OPTIONS = [
	{ id: "white", hex: "#ffffff", label: "White" },
	{ id: "salmon", hex: "#fca397", label: "Salmon" },
	{ id: "orange", hex: "#ffc470", label: "Orange" },
	{ id: "yellow", hex: "#ffff88", label: "Yellow" },
	{ id: "green", hex: "#79d297", label: "Green" },
	{ id: "blue", hex: "#7cc4f8", label: "Blue" },
	{ id: "purple", hex: "#d1a8ff", label: "Purple" },
	{ id: "pink", hex: "#fd9ce0", label: "Pink" },
] as const;

interface ElementColorPickerProps {
	onColorChange: (hex: string) => void;
	selectedColor?: string | null;
}

const ElementColorPicker: React.FC<ElementColorPickerProps> = React.memo(({ onColorChange, selectedColor }) => {
	const { t } = useTranslation(["common"]);
	const prefix = useId();
	const groupName = `${prefix}-option`;

	return (
		<div className="form-group">
			<label>{t("Color")}</label>
			<ul className="note-color-list">
				{COLOR_OPTIONS.map((color) => (
					<li key={color.id}>
						<label htmlFor={`${prefix}-${color.id}`}>{t(color.label)}</label>
						<input
							type="radio"
							name={groupName}
							id={`${prefix}-${color.id}`}
							value={color.id}
							checked={selectedColor?.toLowerCase() === color.hex}
							onChange={() => onColorChange(color.hex)}
						/>
					</li>
				))}
			</ul>
		</div>
	);
});

ElementColorPicker.displayName = "ElementColorPicker";

export default ElementColorPicker;
