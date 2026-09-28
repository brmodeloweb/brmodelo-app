import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import Dropdown from "../../../components/Dropdown";
import { CARDINALITY_OPTIONS } from "./constants";

interface LinkFormProps {
	cardinality: string;
	role: string;
	weak: boolean;
	onUpdate: (event: { type: string; value?: any }) => void;
}

const LinkForm: React.FC<LinkFormProps> = React.memo(({ cardinality, role, weak, onUpdate }) => {
	const { t } = useTranslation(["common"]);
	const [currentCardinality, setCurrentCardinality] = useState(cardinality);
	const [currentRole, setCurrentRole] = useState(role || "");
	const [currentWeak, setCurrentWeak] = useState(weak || false);

	useEffect(() => { setCurrentCardinality(cardinality); }, [cardinality]);
	useEffect(() => { setCurrentRole(role || ""); }, [role]);
	useEffect(() => { setCurrentWeak(weak || false); }, [weak]);

	const handleCardinalityChange = useCallback((selected: { name: string; type: string }) => {
		setCurrentCardinality(selected.type);
		onUpdate({ type: "link.cardinality", value: selected.type });
	}, [onUpdate]);

	const handleRoleChange = (newRole: string) => {
		setCurrentRole(newRole);
		onUpdate({ type: "link.role", value: newRole });
	};

	const handleWeakChange = () => {
		const newValue = !currentWeak;
		setCurrentWeak(newValue);
		onUpdate({ type: "link.weak", value: newValue });
	};

	return (
		<>
			<div className="form-group clearfix">
				<label>{t("Cardinality")}</label>
				<Dropdown
					onSelect={handleCardinalityChange}
					selected={{ name: currentCardinality, type: currentCardinality }}
					options={CARDINALITY_OPTIONS}
				/>
			</div>

			<div className="form-group">
				<label htmlFor="entry-name">{t("Role")}</label>
				<input
					id="entry-name"
					type="text"
					className="form-control"
					value={currentRole}
					onChange={(e) => handleRoleChange(e.target.value)}
				/>
			</div>

			<div className="form-group">
				<div className="checkbox">
					<label htmlFor="weak">
						<input
							id="weak"
							type="checkbox"
							checked={currentWeak}
							onChange={handleWeakChange}
						/>{" "}
						{t("Weak")}
					</label>
				</div>
			</div>
		</>
	);
});

LinkForm.displayName = "LinkForm";

export default LinkForm;
