import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import Dialog from "../Dialog";

export interface ConversionOption<V = string> {
	label: string;
	value: V;
}

export interface ConversionOptionModalProps<V = string> {
	open: boolean;
	title: string;
	summary: string;
	options: ConversionOption<V>[];
	confirmLabel?: string;
	cancelable?: boolean;
	onSuccess: (option: ConversionOption<V>) => void;
	onCancel: () => void;
	onError: (error: unknown) => void;
}

const Options = styled.div`
	display: flex;
	flex-direction: column;
	gap: 8px;
	margin-top: 12px;
`;

const Option = styled.label`
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

function ConversionOptionModal<V = string>({
	open,
	title,
	summary,
	options,
	confirmLabel,
	cancelable = false,
	onSuccess,
	onCancel,
}: ConversionOptionModalProps<V>) {
	const { t } = useTranslation(["common"]);
	const [selectedIndex, setSelectedIndex] = useState(0);

	const handleConfirm = () => {
		const selected = options[selectedIndex];
		if (!selected) return;
		onSuccess(selected);
	};

	const handleOpenChange = (nextOpen: boolean) => {
		if (nextOpen) return;
		if (!cancelable) return;
		onCancel();
	};

	return (
		<Dialog
			open={open}
			onOpenChange={handleOpenChange}
			title={title}
			closeOnOverlayClick={cancelable}
			closeOnEscape={cancelable}
		>
			<div className="modal-body">
				<p>{summary}</p>
				<Options>
					{options.map((option, index) => (
						<Option key={`option-${index}`}>
							<input
								type="radio"
								name="optionsRadios"
								checked={selectedIndex === index}
								onChange={() => setSelectedIndex(index)}
							/>
							<span>{option.label}</span>
						</Option>
					))}
				</Options>
			</div>
			<div className="modal-footer">
				<button type="button" className="br-button" onClick={handleConfirm}>
					{confirmLabel ?? t("Next")}
				</button>
			</div>
		</Dialog>
	);
}

export default ConversionOptionModal;
