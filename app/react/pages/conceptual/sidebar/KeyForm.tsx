import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

interface KeyFormProps {
	name: string;
	onUpdate: (event: { type: string; value?: any }) => void;
}

const KeyForm: React.FC<KeyFormProps> = React.memo(({ name, onUpdate }) => {
	const { t } = useTranslation(["common"]);
	const [currentName, setCurrentName] = useState(name);

	useEffect(() => { setCurrentName(name); }, [name]);

	const handleNameChange = (newName: string) => {
		setCurrentName(newName);
		if (newName !== "") {
			onUpdate({ type: "name", value: newName });
		}
	};

	return (
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
	);
});

KeyForm.displayName = "KeyForm";

export default KeyForm;
