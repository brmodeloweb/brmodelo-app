import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import ElementColorPicker, { getCurrentColor } from "../../../components/ElementColorPicker";

interface NoteFormProps {
	text: string;
	cellView: any;
}

const NoteForm: React.FC<NoteFormProps> = React.memo(({ text, cellView }) => {
	const { t } = useTranslation(["common"]);
	const [currentText, setCurrentText] = useState(text);

	useEffect(() => { setCurrentText(text); }, [text]);

	const handleTextChange = (newText: string) => {
		setCurrentText(newText);
		if (cellView && cellView.setText) {
			cellView.setText(newText);
		}
	};

	const [selectedColor, setSelectedColor] = useState<string | null>(() => getCurrentColor(cellView));

	useEffect(() => { setSelectedColor(getCurrentColor(cellView)); }, [cellView]);

	const handleColorChange = useCallback((hex: string) => {
		if (cellView?.model?.setColor) {
			cellView.model.setColor(hex);
			setSelectedColor(hex.toLowerCase());
		}
	}, [cellView]);

	return (
		<>
			<div className="form-group">
				<label htmlFor="user-note">{t("Note")}</label>
				<textarea
					id="user-note"
					className="form-control user-note-input"
					value={currentText}
					onChange={(e) => handleTextChange(e.target.value)}
					autoFocus
					wrap="hard"
				/>
			</div>

			<ElementColorPicker onColorChange={handleColorChange} selectedColor={selectedColor} />
		</>
	);
});

NoteForm.displayName = "NoteForm";

export default NoteForm;
