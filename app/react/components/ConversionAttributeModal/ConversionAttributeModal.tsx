import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import Dialog from "../Dialog";

const NEW_COLUMN = "new_column";
const NEW_TABLE = "new_table";

export interface ConversionAttributeResult {
	value: string;
	quantity: number;
}

export interface ConversionAttributeModalProps {
	open: boolean;
	attributeName: string;
	tableName: string;
	cancelable?: boolean;
	onSuccess: (result: ConversionAttributeResult) => void;
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
	min-height: 42px;

	&:hover {
		background-color: rgba(0, 0, 0, 0.03);
	}

	input[type="radio"] {
		margin: 0;
		flex-shrink: 0;
	}
`;

const QuantityInput = styled.input`
	width: 60px;
	margin: 0 4px;

	&.error {
		border-color: #d9534f;
	}
`;

const ErrorMessage = styled.div`
	margin-top: 8px;
	color: #d9534f;
	font-size: 0.9rem;
`;

const ConversionAttributeModal: React.FC<ConversionAttributeModalProps> = ({
	open,
	attributeName,
	tableName,
	cancelable = false,
	onSuccess,
	onCancel,
}) => {
	const { t } = useTranslation(["common"]);
	const [selectedValue, setSelectedValue] = useState<string>(NEW_COLUMN);
	const [quantity, setQuantity] = useState<number>(1);
	const [submitted, setSubmitted] = useState(false);

	const isQuantityInvalid =
		selectedValue === NEW_COLUMN &&
		(!Number.isInteger(quantity) || quantity < 1 || quantity > 10);

	const handleForward = () => {
		setSubmitted(true);
		if (selectedValue === NEW_COLUMN && isQuantityInvalid) return;
		onSuccess({
			value: selectedValue,
			quantity: Number.isInteger(quantity) ? quantity : 1,
		});
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
			title={t("Conversion Assistant: Multivalued Attribute")}
			closeOnOverlayClick={cancelable}
			closeOnEscape={cancelable}
		>
			<div className="modal-body">
				<p>
					{t("What do you want to do with multivalued attribute ATTR_NAME of table TABLE_NAME?", {
						attribute: attributeName,
						table: tableName,
					})}
				</p>
				<Options>
					<Option>
						<input
							type="radio"
							name="optionsRadios"
							checked={selectedValue === NEW_COLUMN}
							onChange={() => setSelectedValue(NEW_COLUMN)}
						/>
						<span>
							{t("Include")} n ={" "}
							<QuantityInput
								type="number"
								min={1}
								max={10}
								step={1}
								value={quantity}
								onChange={(e) => {
									const raw = e.target.value;
									setQuantity(raw === "" ? NaN : Number(raw));
								}}
								disabled={selectedValue !== NEW_COLUMN}
								className={
									selectedValue === NEW_COLUMN && isQuantityInvalid && submitted
										? "error"
										: ""
								}
							/>
							{t("attributes")}
						</span>
					</Option>
					<Option>
						<input
							type="radio"
							name="optionsRadios"
							checked={selectedValue === NEW_TABLE}
							onChange={() => setSelectedValue(NEW_TABLE)}
						/>
						<span>
							{t("Create new table")}{" "}
							{attributeName && <strong>{attributeName}</strong>}?
						</span>
					</Option>
				</Options>
				{submitted && selectedValue === NEW_COLUMN && isQuantityInvalid && (
					<ErrorMessage>
						{t("Please enter a valid quantity (between 1 and 10)")}
					</ErrorMessage>
				)}
			</div>
			<div className="modal-footer">
				<button type="button" className="br-button" onClick={handleForward}>
					{t("Forward")}
				</button>
			</div>
		</Dialog>
	);
};

export default ConversionAttributeModal;
