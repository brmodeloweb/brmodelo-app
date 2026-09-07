import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import Dialog from "../Dialog";

export interface ValidationError {
	type: "no_entity" | "disconnected_element" | "disconnected_relationship" | "disconnected_extension" | string;
	name?: string;
	element_type?: string;
}

export interface ConversionTarget {
	value: string;
	label: string;
}

export interface ConversionModalResult {
	target: string;
}

interface ErrorModeProps {
	mode: "error";
	errors: ValidationError[];
}

interface TargetSelectionModeProps {
	mode: "target_selection";
	targets: ConversionTarget[];
}

export type ConversionModalProps = (ErrorModeProps | TargetSelectionModeProps) & {
	open: boolean;
	cancelable?: boolean;
	onSuccess: (result: ConversionModalResult) => void;
	onCancel: () => void;
	onError: (error: unknown) => void;
};

const ErrorList = styled.ul`
	list-style: none;
	padding: 0;
	margin: 0;
	display: flex;
	flex-direction: column;
	gap: 8px;

	li {
		padding: 8px 12px;
		border: 1px solid rgba(0, 0, 0, 0.12);
		border-radius: 4px;
		font-size: 1.1rem;
	}
`;

const TargetOptions = styled.div`
	display: flex;
	flex-direction: column;
	gap: 8px;
	margin-top: 12px;
`;

const TargetOption = styled.label`
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

const translateError = (error: ValidationError, t: ReturnType<typeof useTranslation>["t"]): string => {
	switch (error.type) {
		case "no_entity":
			return t("The model must have at least one entity");
		case "disconnected_element":
			return t("{{elementType}} {{name}} is disconnected", {
				elementType: t(error.element_type ?? ""),
				name: error.name ?? "",
			});
		case "disconnected_relationship":
			return t("Relationship {{name}} must have at least 2 connections", { name: error.name ?? "" });
		case "disconnected_extension":
			return t("Extension {{name}} must have at least 2 connections", { name: error.name ?? "" });
		default:
			return error.type;
	}
};

const ConversionModal: React.FC<ConversionModalProps> = (props) => {
	const { t } = useTranslation(["common"]);
	const { open, cancelable = true, onSuccess, onCancel } = props;

	const initialTarget =
		props.mode === "target_selection" && props.targets.length > 0
			? props.targets[0].value
			: "";
	const [selectedTarget, setSelectedTarget] = useState(initialTarget);

	const handleConfirm = () => {
		onSuccess({ target: selectedTarget });
	};

	const handleOpenChange = (nextOpen: boolean) => {
		if (nextOpen) return;
		if (!cancelable) return;
		onCancel();
	};

	const isErrorMode = props.mode === "error";

	return (
		<Dialog
			open={open}
			onOpenChange={handleOpenChange}
			title={t("Conversion Assistant")}
			closeOnOverlayClick={cancelable}
			closeOnEscape={cancelable}
		>
			<div className="modal-body">
				{isErrorMode ? (
					<ErrorList>
						{props.errors.map((error, index) => (
							<li key={index}>{translateError(error, t)}</li>
						))}
					</ErrorList>
				) : (
					<>
						<p>{t("Which type do you want to convert to?")}</p>
						<TargetOptions>
							{props.targets.map((target) => (
								<TargetOption key={target.value}>
									<input
										type="radio"
										name="conversionTarget"
										value={target.value}
										checked={selectedTarget === target.value}
										onChange={() => setSelectedTarget(target.value)}
									/>
									<span>{t(target.label)}</span>
								</TargetOption>
							))}
						</TargetOptions>
					</>
				)}
			</div>
			<div className="modal-footer">
				{!isErrorMode && cancelable && (
					<button className="br-button warning" type="button" onClick={onCancel}>
						{t("Cancel")}
					</button>
				)}
				<button className="br-button" type="button" onClick={handleConfirm}>
					{isErrorMode ? t("Close") : t("Convert")}
				</button>
			</div>
		</Dialog>
	);
};

export default ConversionModal;
