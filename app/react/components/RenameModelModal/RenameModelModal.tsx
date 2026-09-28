import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Dialog from "../Dialog";
import { renameModel } from "../../services/modelStore";
import loadingDots from "../../../img/loading-dots.gif";

export interface RenameModelResult {
	modelId: string;
	newName: string;
}

export interface RenameModelModalProps {
	open: boolean;
	modelId: string;
	currentName: string;
	cancelable?: boolean;
	onSuccess: (result: RenameModelResult) => void;
	onCancel: () => void;
	onError: (error: unknown) => void;
}

const RenameModelModal: React.FC<RenameModelModalProps> = ({
	open,
	modelId,
	currentName,
	cancelable = true,
	onSuccess,
	onCancel,
	onError,
}) => {
	const { t } = useTranslation(["common"]);
	const [name, setName] = useState(currentName);
	const [submitted, setSubmitted] = useState(false);
	const [loading, setLoading] = useState(false);

	const isInvalid = (name == null || name === "") && submitted;

	const handleRename = async () => {
		setSubmitted(true);
		if (name == null || name === "") return;
		setLoading(true);
		try {
			await renameModel(modelId, name);
			onSuccess({ modelId, newName: name });
		} catch (error) {
			onError(error);
		} finally {
			setLoading(false);
		}
	};

	const handleOpenChange = (nextOpen: boolean) => {
		if (nextOpen) return;
		if (loading) return;
		if (!cancelable) return;
		onCancel();
	};

	return (
		<Dialog
			open={open}
			onOpenChange={handleOpenChange}
			title={t("Rename model")}
			closeOnOverlayClick={cancelable && !loading}
			closeOnEscape={cancelable && !loading}
		>
			<img
				src={loadingDots}
				alt="Loading"
				className={`br-loader br-loader-divider ${loading ? "loading" : ""}`}
			/>
			<div className="modal-body">
				<form
					className="form-horizontal"
					role="form"
					onSubmit={(event) => {
						event.preventDefault();
						handleRename();
					}}
				>
					<div className="form-group">
						<label htmlFor="rename-model" className="col-sm-3 control-label">
							{t("Rename")}
						</label>
						<div className="col-sm-7">
							<input
								id="rename-model"
								type="text"
								className={`form-control ${isInvalid ? "error" : ""}`}
								value={name ?? ""}
								onChange={(event) => setName(event.target.value)}
								placeholder={t("New model name")}
								autoComplete="off"
								disabled={loading}
								autoFocus
							/>
						</div>
					</div>
				</form>
			</div>
			<div className="modal-footer">
				{cancelable && (
					<button
						className="br-button warning"
						type="button"
						onClick={onCancel}
						disabled={loading}
					>
						{t("Cancel")}
					</button>
				)}
				<button
					className="br-button"
					type="button"
					onClick={handleRename}
					disabled={loading}
				>
					{t("Rename")}
				</button>
			</div>
		</Dialog>
	);
};

export default RenameModelModal;
