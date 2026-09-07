import React, { useState, useCallback, useMemo, useId } from "react";
import { useTranslation } from "react-i18next";
import Dropdown from "../../../components/Dropdown/Dropdown";
import type { CollectionOption } from "../INoSqlEditor";

const ATTRIBUTE_TYPES: string[] = [
	"block",
	"ID",
	"string",
	"int",
	"float",
	"boolean",
	"date",
];

interface AttributeData {
	name: string;
	type: string;
	cardinalityEnabled: boolean;
	minCardinality: number;
	maxCardinality: number | string;
	isReference?: boolean;
	targetCollectionId?: string | null;
	targetCollectionName?: string | null;
}

interface AttributeFormProps {
	initialValues?: AttributeData;
	onSave: (data: AttributeData) => void;
	onDismiss: () => void;
	onDelete?: () => void;
	typeLocked?: boolean;
	identifier?: boolean;
	collections?: CollectionOption[];
}

const defaultAttribute: AttributeData = {
	name: "",
	type: "string",
	cardinalityEnabled: false,
	minCardinality: 0,
	maxCardinality: 1,
};

const PK_ALLOWED_TYPES = ['ID', 'string', 'int'];

const AttributeForm: React.FC<AttributeFormProps> = React.memo(({
	initialValues,
	onSave,
	onDismiss,
	onDelete,
	typeLocked,
	identifier = false,
	collections = [],
}) => {
	const { t } = useTranslation(["common"]);
	const [attr, setAttr] = useState<AttributeData>(initialValues || defaultAttribute);
	const [isReference, setIsReference] = useState(initialValues?.isReference || false);
	const [showNameError, setShowNameError] = useState(false);
	const idPrefix = useId();

	// Only "block" is translated; other types are raw identifiers users are
	// expected to recognize across languages (string, int, …).
	const typeLabel = useCallback(
		(type: string) => (type === "block" ? t("block") : type),
		[t]
	);

	const availableTypes = useMemo(() => {
		let types: string[];
		if (identifier) {
			types = ATTRIBUTE_TYPES.filter(type => PK_ALLOWED_TYPES.includes(type));
		} else if (isReference) {
			types = ATTRIBUTE_TYPES.filter(type => type !== "block");
		} else {
			types = ATTRIBUTE_TYPES;
		}
		return types.map(type => ({ name: typeLabel(type), type }));
	}, [identifier, isReference, typeLabel]);

	const collectionOptions = useMemo(
		() => collections.map(c => ({ name: c.name, type: c.id })),
		[collections]
	);

	const selectedCollection = useMemo(
		() => attr.targetCollectionId
			? { name: attr.targetCollectionName || "", type: attr.targetCollectionId }
			: { name: t("Select collection"), type: "" },
		[attr.targetCollectionId, attr.targetCollectionName, t]
	);

	const handleReferenceToggle = useCallback((checked: boolean) => {
		setIsReference(checked);
		// In edit-mode of an existing reference the dropdown is locked, so we
		// preserve the original target across uncheck/re-check. For other
		// cases (new attribute, editing a plain attribute), clear the target
		// on uncheck to avoid leaking stale data into a plain attribute save.
		if (!checked && !initialValues?.isReference) {
			setAttr(prev => ({
				...prev,
				targetCollectionId: null,
				targetCollectionName: null,
			}));
		}
		if (checked) {
			setAttr(prev => (prev.type === "block" ? { ...prev, type: "ID" } : prev));
		}
	}, [initialValues]);

	const handleCollectionSelect = useCallback((option: { name: string; type: string }) => {
		setAttr(prev => ({
			...prev,
			name: option.name.replace(/[^A-Za-z0-9_]/g, "") + '_REF',
			targetCollectionId: option.type,
			targetCollectionName: option.name,
		}));
	}, []);

	const handleChange = useCallback((field: keyof AttributeData, value: any) => {
		setAttr(prev => ({ ...prev, [field]: value }));
	}, []);

	const handleMaxCardChange = useCallback((value: string) => {
		setAttr(prev => ({
			...prev,
			maxCardinality: value === "N" ? "N" : (parseInt(value, 10) || 0),
		}));
	}, []);

	const handleSubmit = useCallback(() => {
		if (!attr.name.trim()) {
			setShowNameError(true);
			return;
		}
		const normalizedName = isReference
			? `${attr.name.trim().replace(/_REF$/i, "")}_REF`
			: attr.name.trim();
		const finalAttr = { ...attr, name: normalizedName, isReference };
		if (identifier) {
			finalAttr.cardinalityEnabled = false;
		}
		onSave(finalAttr);
	}, [attr, onSave, identifier, isReference]);

	return (
		<div className="column-form">
			<div className="form-group">
				<label>{t("Name")}</label>
				<input
					type="text"
					className={`form-control${showNameError && !attr.name.trim() ? " error" : ""}`}
					value={attr.name}
					onChange={(e) => {
						handleChange("name", e.target.value.replace(/[^A-Za-z0-9_]/g, ""));
						setShowNameError(false);
					}}
					autoFocus
					placeholder={t("Attribute name")}
				/>
			</div>

			{identifier && (
				<div className="form-group">
					<div className="checkbox">
						<label htmlFor={`${idPrefix}-identifier`}>
							<input
								id={`${idPrefix}-identifier`}
								type="checkbox"
								checked
								disabled
								readOnly
							/>
							{t("Identifier")}
						</label>
					</div>
				</div>
			)}

			<div className="form-group" style={{ display: "flow-root" }}>
				<label>{t("Type")}</label>
				<Dropdown
					options={availableTypes}
					selected={{ name: typeLabel(attr.type), type: attr.type }}
					onSelect={(option) => handleChange("type", option.type)}
					disabled={typeLocked || !!initialValues?.isReference}
				/>
			</div>

			{!identifier && !typeLocked && collections.length > 0 && (
				<div className="form-group">
					<div className="checkbox">
						<label htmlFor={`${idPrefix}-reference`}>
							<input
								id={`${idPrefix}-reference`}
								type="checkbox"
								checked={isReference}
								onChange={(e) => handleReferenceToggle(e.target.checked)}
							/>
							{t("Reference")}
						</label>
					</div>
				</div>
			)}

			{(isReference || !!initialValues?.isReference) && (
				<div className="form-group" style={{ display: "flow-root" }}>
					<label>{t("Reference source")}</label>
					<Dropdown
						options={collectionOptions}
						selected={selectedCollection}
						onSelect={handleCollectionSelect}
						disabled={!!initialValues?.isReference}
					/>
				</div>
			)}

			{!identifier && (
				<div className="form-group">
					<div className="checkbox">
						<label htmlFor={`${idPrefix}-cardinality`}>
							<input
								id={`${idPrefix}-cardinality`}
								type="checkbox"
								checked={attr.cardinalityEnabled}
								onChange={(e) => handleChange("cardinalityEnabled", e.target.checked)}
							/>
							{t("Cardinality")}
						</label>
					</div>
				</div>
			)}

			{attr.cardinalityEnabled && !identifier && (
				<div className="form-row">
					<div className="form-group form-group--half">
						<label>{t("Min")}</label>
						<input
							type="number"
							className="form-control"
							value={attr.minCardinality}
							min={0}
							onChange={(e) => handleChange("minCardinality", parseInt(e.target.value, 10) || 0)}
						/>
					</div>
					<div className="form-group form-group--half">
						<label>{t("Max")}</label>
						<input
							type="text"
							className="form-control"
							value={attr.maxCardinality}
							onChange={(e) => handleMaxCardChange(e.target.value)}
							placeholder="N"
						/>
					</div>
				</div>
			)}

			<footer className="card-item-actions">
				<div className="actions-regular">
					<button
						type="button"
						className="br-button"
						onClick={handleSubmit}
					>
						{t("Save")}
					</button>
					<button
						type="button"
						className="br-button warning"
						onClick={onDismiss}
					>
						{t("Cancel")}
					</button>
				</div>
				{onDelete && (
					<div className="actions-destructive">
						<button
							type="button"
							className="br-button destructive"
							onClick={onDelete}
						>
							{t("Delete")}
						</button>
					</div>
				)}
			</footer>
		</div>
	);
});

AttributeForm.displayName = "AttributeForm";

export default AttributeForm;
