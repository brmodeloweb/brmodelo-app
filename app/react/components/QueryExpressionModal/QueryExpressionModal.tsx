import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import Dialog from "../Dialog";
import Dropdown from "../Dropdown";

const AND_OPERATOR = "AND";
const OR_OPERATOR = "OR";

type LogicalOperator = typeof AND_OPERATOR | typeof OR_OPERATOR;

interface DropdownOption {
	name: string;
	type: string;
}

const CHECK_CONSTRAINT_OPTIONS: { NUMBER: DropdownOption[]; STRING: DropdownOption[] } = {
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

const isStringType = (columnType: string | null | undefined) =>
	columnType === "VARCHAR(n)" || columnType === "CHAR(n)";

export interface Column {
	name: string;
	type: string;
}

export interface Table {
	name: string;
	columns: Column[];
}

export interface Join {
	columnNameOrigin: string | null;
	columnNameTarget: string | null;
	submitted?: boolean;
}

export interface Condition {
	columnName: string | null;
	columnType: string | null;
	name?: string;
	type?: string;
	comparativeValue: string | null;
	comparativeValue2?: string | null;
	submitted?: boolean;
	logicalOperator: LogicalOperator;
}

export interface QueryConditions {
	values?: Condition[];
	joins?: Join[];
}

export interface QueryExpressionResult {
	conditions: Condition[];
	joins: Join[];
}

export interface QueryExpressionModalProps {
	open: boolean;
	tables: Table[];
	queryConditions?: QueryConditions;
	cancelable?: boolean;
	onSuccess: (result: QueryExpressionResult) => void;
	onCancel: () => void;
	onError: (error: unknown) => void;
}

const ModalBody = styled.div`
	.labels-wrapper {
		margin-bottom: 12px;
		display: flex;
		flex-wrap: wrap;
		row-gap: 18px;

		.condition-label {
			padding: 6px;
			background: var(--brand-default);
			color: white;
			border-radius: 4px;
			margin-right: 8px;

			i {
				margin-left: 4px;
				cursor: pointer;
			}
		}
	}

	.form-content {
		display: flex;
		align-items: center;
		column-gap: 8px;
		margin-bottom: 12px;

		button {
			min-width: 180px;
		}

		.dropdown-tmp-list {
			max-height: 400px;
			overflow: auto;
		}
	}

	.form-content-joins .dropdown-tmp,
	.form-content-joins .dropdown-tmp-btn {
		width: 100%;
	}

	.modal-message {
		margin-top: 16px;
	}
`;

const defaultJoin: Join = {
	columnNameOrigin: null,
	columnNameTarget: null,
};

const defaultCondition: Condition = {
	columnName: null,
	columnType: null,
	comparativeValue: null,
	logicalOperator: AND_OPERATOR,
};

const QueryExpressionModal: React.FC<QueryExpressionModalProps> = ({
	open,
	tables,
	queryConditions,
	cancelable = true,
	onSuccess,
	onCancel,
}) => {
	const { t } = useTranslation(["common"]);
	const [conditions, setConditions] = useState<Condition[]>(queryConditions?.values ?? []);
	const [joins, setJoins] = useState<Join[]>(queryConditions?.joins ?? []);

	useEffect(() => {
		if (queryConditions == null) return;
		setConditions(queryConditions.values ?? []);
		setJoins(queryConditions.joins ?? []);
	}, [queryConditions]);

	const showJoins = tables.length > 1;

	const tableColumns: DropdownOption[] = useMemo(() => {
		const result: DropdownOption[] = [];
		tables.forEach((table) => {
			table.columns.forEach((column) => {
				result.push({
					name: `${table.name}.${column.name}`,
					type: column.type,
				});
			});
		});
		return result;
	}, [tables]);

	const updateJoin = (index: number, patch: Partial<Join>) => {
		setJoins((prev) => prev.map((j, i) => (i === index ? { ...j, ...patch } : j)));
	};

	const updateCondition = (index: number, patch: Partial<Condition>) => {
		setConditions((prev) => prev.map((c, i) => (i === index ? { ...c, ...patch } : c)));
	};

	const removeJoin = (index: number) => {
		setJoins((prev) => prev.filter((_, i) => i !== index));
	};

	const removeCondition = (index: number) => {
		setConditions((prev) => prev.filter((_, i) => i !== index));
	};

	const changeOperator = (index: number) => {
		updateCondition(index, {
			logicalOperator: conditions[index].logicalOperator === AND_OPERATOR ? OR_OPERATOR : AND_OPERATOR,
		});
	};

	const addJoin = () => {
		setJoins((prev) => [...prev, defaultJoin]);
	};

	const addCondition = () => {
		setConditions((prev) => [...prev, defaultCondition]);
	};

	const createLabel = (condition: Condition): string => {
		const operatorLabel = condition.name ? t(condition.name).toLowerCase() : "";
		const tail = condition.comparativeValue2
			? `${condition.comparativeValue} ${t("and")} ${condition.comparativeValue2}`
			: condition.comparativeValue ?? "";
		return `${condition.columnName} ${operatorLabel} ${tail}`;
	};

	const handleSave = () => {
		onSuccess({
			conditions: conditions.filter((c) => c.submitted),
			joins: joins.filter((j) => j.submitted),
		});
	};

	const handleOpenChange = (nextOpen: boolean) => {
		if (nextOpen) return;
		if (!cancelable) return;
		onCancel();
	};

	const renderJoinForm = (join: Join, index: number) => (
		<div className="form-content form-content-joins" key={`join-${index}`}>
			<Dropdown
				options={tableColumns}
				selected={{
					name: join.columnNameOrigin || t("Select a value"),
					type: "SELECT",
				}}
				onSelect={(selected) =>
					updateJoin(index, { columnNameOrigin: selected.name })
				}
			/>
			<Dropdown
				options={tableColumns}
				selected={{
					name: join.columnNameTarget || t("Select a value"),
					type: "SELECT",
				}}
				onSelect={(selected) =>
					updateJoin(index, { columnNameTarget: selected.name })
				}
			/>
			{join.columnNameOrigin && join.columnNameTarget && (
				<a
					className="br-button"
					onClick={() => updateJoin(index, { submitted: true })}
				>
					<FontAwesomeIcon title={t("Save")} icon="check" />
				</a>
			)}
		</div>
	);

	const renderConditionForm = (condition: Condition, index: number) => {
		const comparisonOptions = isStringType(condition.columnType)
			? CHECK_CONSTRAINT_OPTIONS.STRING
			: CHECK_CONSTRAINT_OPTIONS.NUMBER;
		const canSave = condition.columnName && condition.type && condition.comparativeValue;

		return (
			<div className="form-content" key={`condition-${index}`}>
				<Dropdown
					options={tableColumns}
					selected={{
						name: condition.columnName || t("Select a value"),
						type: condition.columnType || "SELECT",
					}}
					onSelect={(selected) =>
						updateCondition(index, {
							columnName: selected.name,
							columnType: selected.type,
						})
					}
				/>
				{condition.columnType && (
					<Dropdown
						options={comparisonOptions}
						selected={{
							name: condition.name || t("Select a value"),
							type: condition.type || "SELECT",
						}}
						onSelect={(selected) =>
							updateCondition(index, { name: selected.name, type: selected.type })
						}
					/>
				)}
				{condition.type && (
					<input
						type="text"
						className="form-control"
						value={condition.comparativeValue ?? ""}
						onChange={(e) =>
							updateCondition(index, { comparativeValue: e.target.value })
						}
					/>
				)}
				{condition.type === "BETWEEN" && (
					<input
						type="text"
						className="form-control"
						value={condition.comparativeValue2 ?? ""}
						onChange={(e) =>
							updateCondition(index, { comparativeValue2: e.target.value })
						}
					/>
				)}
				{canSave && (
					<a
						className="br-button"
						onClick={() => updateCondition(index, { submitted: true })}
					>
						<FontAwesomeIcon title={t("Save")} icon="check" />
					</a>
				)}
			</div>
		);
	};

	return (
		<Dialog
			open={open}
			onOpenChange={handleOpenChange}
			title={t("Create query expression")}
			closeOnOverlayClick={cancelable}
			closeOnEscape={cancelable}
		>
			<ModalBody className="modal-body query-expression-modal">
				{showJoins && (
					<div>
						<p>
							{t(
								"You have chosen multiple tables to create the View. It is necessary to select the attributes that will compose the JOIN clause."
							)}
						</p>
						<div className="labels-wrapper">
							{joins.map((join, index) =>
								join.submitted ? (
									<span key={`join-label-${index}`}>
										<span className="condition-label">
											{`${join.columnNameOrigin} = ${join.columnNameTarget}`}
											<FontAwesomeIcon
												title={t("Delete")}
												icon="xmark"
												onClick={() => removeJoin(index)}
											/>
										</span>
									</span>
								) : null
							)}
						</div>
						{joins.map((join, index) => (!join.submitted ? renderJoinForm(join, index) : null))}
						<button className="br-button" type="button" onClick={addJoin}>
							{t("Add join")}
						</button>
					</div>
				)}

				<p className="modal-message">
					{t(
						"Add conditions to create query expression that will be used in the where clause when creating the view."
					)}
				</p>

				<div className="labels-wrapper">
					{conditions.map((condition, index) => {
						if (!condition.submitted) return null;
						const isLast = index === conditions.length - 1;
						return (
							<span key={`condition-label-${index}`}>
								<span className="condition-label">
									{createLabel(condition)}
									<FontAwesomeIcon
										title={t("Delete")}
										icon="xmark"
										onClick={() => removeCondition(index)}
									/>
								</span>
								{!isLast && (
									<span className="condition-label">
										{t(condition.logicalOperator)}
										<FontAwesomeIcon
											title={t("Toggle logical operator")}
											icon="right-left"
											onClick={() => changeOperator(index)}
										/>
									</span>
								)}
							</span>
						);
					})}
				</div>

				{conditions.map((condition, index) =>
					!condition.submitted ? renderConditionForm(condition, index) : null
				)}

				<button className="br-button" type="button" onClick={addCondition}>
					{t("Add condition")}
				</button>
			</ModalBody>
			<div className="modal-footer">
				{cancelable && (
					<button className="br-button warning" type="button" onClick={onCancel}>
						{t("Cancel")}
					</button>
				)}
				<button className="br-button" type="button" onClick={handleSave}>
					{t("Confirm")}
				</button>
			</div>
		</Dialog>
	);
};

export default QueryExpressionModal;
