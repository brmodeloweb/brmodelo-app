import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { useTranslation } from "react-i18next";

const EmptyStateForm: React.FC = React.memo(() => {
	const { t } = useTranslation(["common"]);

	return (
		<div className="form-group">
			<div className="empty-state">
				<FontAwesomeIcon icon="arrow-pointer" />
				<p>{t("Select an element to edit")}</p>
			</div>
		</div>
	);
});

EmptyStateForm.displayName = "EmptyStateForm";

export default EmptyStateForm;
