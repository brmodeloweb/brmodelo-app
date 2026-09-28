import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import ElementColorPicker, { getCurrentColor } from "../../../components/ElementColorPicker";

interface RelationshipFormProps {
	name: string;
	cellView: any;
	onUpdate: (event: { type: string; value?: any }) => void;
}

const RelationshipForm: React.FC<RelationshipFormProps> = React.memo(({ name, cellView, onUpdate }) => {
	const { t } = useTranslation(["common"]);
	const [currentName, setCurrentName] = useState(name);

	useEffect(() => { setCurrentName(name); }, [name]);

	const handleNameChange = (newName: string) => {
		setCurrentName(newName);
		if (newName !== "") {
			onUpdate({ type: "name", value: newName });
		}
	};

	const handleTransformAssociative = () => {
		onUpdate({ type: "relationship.associative" });
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

			<div className="form-group">
				<label>{t("Associative entity")}</label>
				<div>
					<button type="button" className="br-button" onClick={handleTransformAssociative}>
						{t("Transform")}
					</button>
				</div>
			</div>

			<ElementColorPicker onColorChange={handleColorChange} selectedColor={selectedColor} />
		</>
	);
});

RelationshipForm.displayName = "RelationshipForm";

export default RelationshipForm;
