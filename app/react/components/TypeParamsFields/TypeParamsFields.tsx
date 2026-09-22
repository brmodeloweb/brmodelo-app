import React from "react";
import { useTranslation } from "react-i18next";
import { getSqlTypeMeta, TypeParamKind } from "@services/dataTypes";

interface TypeParamsFieldsProps {
	typeName: string | null | undefined;
	length?: number | null;
	precision?: number | null;
	scale?: number | null;
	onChange: (field: "length" | "precision" | "scale", value: number | undefined) => void;
	paramKindOverride?: TypeParamKind;
}

const toInputValue = (value: number | null | undefined): string =>
	value == null ? "" : String(value);

const parsePositiveInt = (raw: string): number | undefined => {
	if (raw === "") return undefined;
	const parsed = Number(raw);
	if (!Number.isFinite(parsed)) return undefined;
	return Math.trunc(parsed);
};

const TypeParamsFields: React.FC<TypeParamsFieldsProps> = ({
	typeName,
	length,
	precision,
	scale,
	onChange,
	paramKindOverride,
}) => {
	const { t } = useTranslation(["common"]);
	const kind = paramKindOverride ?? getSqlTypeMeta(typeName)?.params ?? "none";

	if (kind === "none") {
		return null;
	}

	if (kind === "length") {
		return (
			<div className="form-group">
				<label htmlFor="type-param-length">{t("Length")}</label>
				<input
					id="type-param-length"
					type="number"
					min={1}
					className="form-control"
					value={toInputValue(length)}
					onChange={(event) => onChange("length", parsePositiveInt(event.target.value))}
					data-testid="type-param-length"
				/>
			</div>
		);
	}

	return (
		<>
			<div className="form-group">
				<label htmlFor="type-param-precision">{t("Precision")}</label>
				<input
					id="type-param-precision"
					type="number"
					min={1}
					className="form-control"
					value={toInputValue(precision)}
					onChange={(event) => onChange("precision", parsePositiveInt(event.target.value))}
					data-testid="type-param-precision"
				/>
			</div>
			<div className="form-group">
				<label htmlFor="type-param-scale">{t("Scale")}</label>
				<input
					id="type-param-scale"
					type="number"
					min={0}
					className="form-control"
					value={toInputValue(scale)}
					onChange={(event) => onChange("scale", parsePositiveInt(event.target.value))}
					data-testid="type-param-scale"
				/>
			</div>
		</>
	);
};

export default TypeParamsFields;
