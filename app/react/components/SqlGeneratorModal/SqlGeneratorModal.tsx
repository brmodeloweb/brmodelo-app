import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import Dialog from "../Dialog";
import { downloadTextFile } from "../../services/modelFileIO";

export interface SqlGeneratorModalProps {
	open: boolean;
	sql: string;
	modelName?: string;
	cancelable?: boolean;
	onSuccess: () => void;
	onCancel: () => void;
	onError: (error: unknown) => void;
}

const SqlGeneratorModal: React.FC<SqlGeneratorModalProps> = ({
	open,
	sql,
	modelName = "model",
	cancelable = true,
	onCancel,
}) => {
	const { t } = useTranslation(["common"]);
	const [copied, setCopied] = useState(false);

	const handleOpenChange = (nextOpen: boolean) => {
		if (nextOpen) return;
		if (!cancelable) return;
		onCancel();
	};

	const handleCopy = useCallback(async () => {
		try {
			await navigator.clipboard.writeText(sql);
			setCopied(true);
			window.setTimeout(() => setCopied(false), 2000);
		} catch (error) {
			console.error("Failed to copy SQL:", error);
		}
	}, [sql]);

	const handleDownload = useCallback(() => {
		const safeName = (modelName || "model").replace(/[<>:"/\\|?*\u0000-\u001f]/g, "_").trim() || "model";
		downloadTextFile(`${safeName}.sql`, sql, "application/sql");
	}, [modelName, sql]);

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
				<button className="br-button" type="button" onClick={handleCopy}>
					{copied ? t("Copied") : t("Copy")}
				</button>
				{" "}
				<button className="br-button" type="button" onClick={handleDownload}>
					{t("Download")}
				</button>
				{" "}
				<button className="br-button warning" type="button" onClick={onCancel}>
					{t("Close")}
				</button>
			</div>
		</Dialog>
	);
};

export default SqlGeneratorModal;
