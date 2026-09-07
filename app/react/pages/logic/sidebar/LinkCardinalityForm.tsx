import React, { useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Dropdown from "../../../components/Dropdown/Dropdown";

const CARDINALITY_OPTIONS = [
	{ name: "(0, 1)", type: "(0, 1)" },
	{ name: "(1, 1)", type: "(1, 1)" },
	{ name: "(0, n)", type: "(0, n)" },
	{ name: "(1, n)", type: "(1, n)" },
];

interface LinkCardinalityFormProps {
	element: any;
	onUpdate: (event: { type: string; element?: any; value?: any }) => void;
}

const getLabel = (link: any, index: number): string => {
	const labels = link?.model?.attributes?.labels;
	if (labels && labels[index] && labels[index].attrs?.text?.text) {
		return labels[index].attrs.text.text;
	}
	return "(1, 1)";
};

const LinkCardinalityForm: React.FC<LinkCardinalityFormProps> = React.memo(({ element, onUpdate }) => {
	const { t } = useTranslation(["common"]);
	const [cardA, setCardA] = useState(getLabel(element, 0));
	const [cardB, setCardB] = useState(getLabel(element, 1));

	useEffect(() => {
		setCardA(getLabel(element, 0));
		setCardB(getLabel(element, 1));
	}, [element?.model?.id]);

	const handleCardAChange = useCallback((selected: { name: string; type: string }) => {
		setCardA(selected.type);
		onUpdate({ type: "editCardinalityA", element, value: selected.type });
	}, [element, onUpdate]);

	const handleCardBChange = useCallback((selected: { name: string; type: string }) => {
		setCardB(selected.type);
		onUpdate({ type: "editCardinalityB", element, value: selected.type });
	}, [element, onUpdate]);

	return (
		<>
			<div className="form-group">
				<label>{t("Cardinality A")}</label>
				<Dropdown
					selected={{ name: cardA, type: cardA }}
					onSelect={handleCardAChange}
					options={CARDINALITY_OPTIONS}
				/>
			</div>
			<div className="form-group">
				<label>{t("Cardinality B")}</label>
				<Dropdown
					selected={{ name: cardB, type: cardB }}
					onSelect={handleCardBChange}
					options={CARDINALITY_OPTIONS}
				/>
			</div>
		</>
	);
});

LinkCardinalityForm.displayName = "LinkCardinalityForm";

export default LinkCardinalityForm;
