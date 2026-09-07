import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Dialog from "../Dialog";
import { deleteModel } from "../../services/modelStore";
import loadingDots from "../../../img/loading-dots.gif";

export interface DeleteModelResult {
	modelId: string;
}

export interface DeleteModelModalProps {
	open: boolean;
	modelId: string;
	cancelable?: boolean;
	onSuccess: (result: DeleteModelResult) => void;
	onCancel: () => void;
	onError: (error: unknown) => void;
}

const DeleteModelModal: React.FC<DeleteModelModalProps> = ({
	open,
	modelId,
	cancelable = true,
	onSuccess,
	onCancel,
	onError,
}) => {
	const { t } = useTranslation(["common"]);
	const [loading, setLoading] = useState(false);

	const handleDelete = async () => {
		setLoading(true);
		try {
			await deleteModel(modelId);
			onSuccess({ modelId });
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
			title={t("Delete model")}
			closeOnOverlayClick={cancelable && !loading}
			closeOnEscape={cancelable && !loading}
		>
			<img
				src={loadingDots}
				alt="Loading"
				className={`br-loader br-loader-divider ${loading ? "loading" : ""}`}
			/>
			<div className="modal-body">
				<p>{t("Are you sure you want to delete the model?")}</p>
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
					onClick={handleDelete}
					disabled={loading}
				>
					{t("Delete")}
				</button>
			</div>
		</Dialog>
	);
};

export default DeleteModelModal;
