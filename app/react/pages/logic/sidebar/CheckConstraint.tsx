import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import Dropdown from "../../../components/Dropdown/Dropdown";

const CHECK_CONSTRAINT_OPTIONS = {
	NUMBER: [
		{ name: "Equal to", type: "EQUAL_TO" },
		{ name: "Not equal to", type: "NOT_EQUAL_TO" },
		{ name: "Greater than", type: "GREATER_THAN" },
		{ name: "Less than", type: "LESS_THAN" },
		{ name: "Between", type: "BETWEEN" },
		{ name: "Greater than or equal to", type: "GREATER_THAN_OR_EQUAL_TO" },
		{ name: "Less than or equal to", type: "LESS_THAN_OR_EQUAL_TO" },
	],
	STRING: [
		{ name: "Is", type: "IS" },
		{ name: "Is not", type: "IS_NOT" },
		{ name: "Contains", type: "CONTAINS" },
		{ name: "Does not contain", type: "DOES_NOT_CONTAIN" },
		{ name: "Starts with", type: "STARTS_WITH" },
		{ name: "Ends with", type: "ENDS_WITH" },
	],
};

const isNumericType = (type: string) => {
	return ["INT", "FLOAT"].includes(type);
};

interface CheckConstraintProps {
	column: any;
	onChange: (field: string, value: any) => void;
}

const CheckConstraint: React.FC<CheckConstraintProps> = React.memo(({ column, onChange }) => {
	const { t } = useTranslation(["common"]);
	const [isManual, setIsManual] = useState(!!column.checkConstraint?.checkExpression);

	useEffect(() => {
		setIsManual(!!column.checkConstraint?.checkExpression);
	}, [column.name]);

	const handleToggleFormType = useCallback(() => {
		setIsManual(prev => {
			const switchingToManual = !prev;
			if (switchingToManual) {
				onChange("checkConstraint", { checkExpression: "" });
			} else {
				onChange("checkConstraint", {});
			}
			return switchingToManual;
		});
	}, [onChange]);

	const handleSelectCheckConstraint = useCallback((selected: { name: string; type: string }) => {
		onChange("checkConstraint", {
			...column.checkConstraint,
			type: selected.type,
			name: selected.name,
		});
	}, [column.checkConstraint, onChange]);

	const handleComparativeValueChange = useCallback((value: string) => {
		onChange("checkConstraint", {
			...column.checkConstraint,
			comparativeValue: value,
		});
	}, [column.checkConstraint, onChange]);

	const handleComparativeValue2Change = useCallback((value: string) => {
		onChange("checkConstraint", {
			...column.checkConstraint,
			comparativeValue2: value,
		});
	}, [column.checkConstraint, onChange]);

	const handleExpressionChange = useCallback((value: string) => {
		onChange("checkConstraint", {
			...column.checkConstraint,
			checkExpression: value,
		});
	}, [column.checkConstraint, onChange]);

	const options = isNumericType(column.type) ? CHECK_CONSTRAINT_OPTIONS.NUMBER : CHECK_CONSTRAINT_OPTIONS.STRING;
	const selectedConstraint = column.checkConstraint
		? { name: column.checkConstraint.name || "Check", type: column.checkConstraint.type || "" }
		: { name: "Check", type: "" };

	return (
		<div className="check-constraint">
			{!isManual ? (
				<div className="form-field">
					<div className="form-group clearfix">
						<label>{t("Check")}</label>
						<Dropdown
							selected={selectedConstraint}
							onSelect={handleSelectCheckConstraint}
							options={options}
						/>
					</div>

					{column.checkConstraint?.type && (
						<div className="form-group multiple-fields">
							<input
								type="text"
								className="form-control"
								value={column.checkConstraint.comparativeValue || ""}
								onChange={(e) => handleComparativeValueChange(e.target.value)}
							/>
							{column.checkConstraint.type === "BETWEEN" && (
								<input
									type="text"
									className="form-control"
									value={column.checkConstraint.comparativeValue2 || ""}
									onChange={(e) => handleComparativeValue2Change(e.target.value)}
								/>
							)}
						</div>
					)}
				</div>
			) : (
				<div className="form-field">
					<label htmlFor="check-expression">{t("Check")}</label>
					<input
						id="check-expression"
						type="text"
						className="form-control"
						value={column.checkConstraint?.checkExpression || ""}
						onChange={(e) => handleExpressionChange(e.target.value)}
						placeholder={t("Type the expression check")}
					/>
				</div>
			)}

			<button type="button" className="link-button" onClick={handleToggleFormType}>
				{t(isManual ? "Show options to create constraint" : "Create check constraint manually")}
			</button>
		</div>
	);
});

CheckConstraint.displayName = "CheckConstraint";

export default CheckConstraint;
