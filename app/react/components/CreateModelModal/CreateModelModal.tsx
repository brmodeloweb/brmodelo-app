import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import Dialog from "../Dialog";
import { saveModel } from "../../services/modelStore";
import { Model } from "../../services/types/model";
import loadingDots from "../../../img/loading-dots.gif";

interface ModelTypeOption {
	name: string;
	type: string;
}

const TYPE_OPTIONS: ModelTypeOption[] = [
	{ name: "Conceptual", type: "conceptual" },
	{ name: "Logical", type: "logic" },
	{ name: "NoSQL", type: "nosql" },
];

const TypeOptions = styled.div`
	display: flex;
	flex-direction: column;
	gap: 8px;
`;

const TypeOption = styled.label`
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 8px 12px;
	border: 1px solid rgba(0, 0, 0, 0.12);
	border-radius: 4px;
	cursor: pointer;
	margin: 0;
	font-weight: normal;

	&:hover {
		background-color: rgba(0, 0, 0, 0.03);
	}

	input[type="radio"] {
		margin: 0;
	}
`;

const EMPTY_MODEL = '{"cells":[]}';

export interface CreateModelResult {
	model: Model;
}

export interface CreateModelModalProps {
	open: boolean;
	cancelable?: boolean;
	onSuccess: (result: CreateModelResult) => void;
	onCancel: () => void;
	onError: (error: unknown) => void;
}

const CreateModelModal: React.FC<CreateModelModalProps> = ({
	open,
	cancelable = true,
	onSuccess,
	onCancel,
	onError,
}) => {
	const { t } = useTranslation(["common"]);
	const [name, setName] = useState("");
	const [typeSelected, setTypeSelected] = useState<ModelTypeOption>(TYPE_OPTIONS[0]);
	const [submitted, setSubmitted] = useState(false);
	const [loading, setLoading] = useState(false);

	const isInvalid = name.trim() === "" && submitted;

	const handleSave = async () => {
		setSubmitted(true);
		const trimmedName = name.trim();
		if (trimmedName === "") return;
		setLoading(true);
		try {
			const savedModel = await saveModel({
				name: trimmedName,
				type: typeSelected.type,
				model: EMPTY_MODEL,
			});
			onSuccess({ model: savedModel });
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
			title={t("New model")}
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
						handleSave();
					}}
				>
					<div className="form-group">
						<label htmlFor="name" className="col-sm-3 control-label">
							{t("Title")}
						</label>
						<div className="col-sm-7">
							<input
								id="name"
								type="text"
								className={`form-control ${isInvalid ? "error" : ""}`}
								name="name"
								value={name}
								onChange={(event) => setName(event.target.value)}
								placeholder={t("Model name")}
								autoComplete="off"
								disabled={loading}
								autoFocus
							/>
						</div>
					</div>

					<div className="form-group">
						<label className="col-sm-3 control-label">{t("Type")}</label>
						<div className="col-sm-7">
							<TypeOptions>
								{TYPE_OPTIONS.map((option) => (
									<TypeOption key={option.type}>
										<input
											type="radio"
											name="model-type"
											value={option.type}
											checked={typeSelected.type === option.type}
											onChange={() => setTypeSelected(option)}
											disabled={loading}
										/>
										<span>{t(option.name)}</span>
									</TypeOption>
								))}
							</TypeOptions>
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
					onClick={handleSave}
					disabled={loading}
				>
					{t("Save")}
				</button>
			</div>
		</Dialog>
	);
};

export default CreateModelModal;
