import React from "react";
import { useTranslation } from "react-i18next";
import Dialog from "../Dialog";

export interface SqlGeneratorModalProps {
	open: boolean;
	sql: string;
	cancelable?: boolean;
	onSuccess: () => void;
	onCancel: () => void;
	onError: (error: unknown) => void;
}

const SqlGeneratorModal: React.FC<SqlGeneratorModalProps> = ({
	open,
	sql,
	cancelable = true,
	onCancel,
}) => {
	const { t } = useTranslation(["common"]);

	const handleOpenChange = (nextOpen: boolean) => {
		if (nextOpen) return;
		if (!cancelable) return;
		onCancel();
	};

	return (
		<Dialog
			open={open}
			onOpenChange={handleOpenChange}
			title={t("SQL")}
			closeOnOverlayClick={cancelable}
			closeOnEscape={cancelable}
		>
			<div className="modal-body">
				<form className="form-horizontal" role="form">
					<div className="form-group">
						<div className="col-sm-12">
							<textarea
								id="brSQL"
								className="form-control sql-script"
								rows={7}
								value={sql}
								readOnly
							/>
						</div>
					</div>
				</form>
			</div>
			<div className="modal-footer">
				<button className="br-button warning" type="button" onClick={onCancel}>
					{t("Close")}
				</button>
			</div>
		</Dialog>
	);
};

export default SqlGeneratorModal;
