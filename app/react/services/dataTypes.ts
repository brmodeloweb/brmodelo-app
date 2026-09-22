export type TypeParamKind = "none" | "length" | "precisionScale";

export interface SqlTypeMeta {
	name: string;
	params: TypeParamKind;
	defaultLength?: number;
	defaultPrecision?: number;
	defaultScale?: number;
	pkFkAllowed?: boolean;
}

export interface TypedColumnLike {
	type?: string | null;
	length?: number | null;
	precision?: number | null;
	scale?: number | null;
}

export interface ParsedType {
	type: string;
	length?: number;
	precision?: number;
	scale?: number;
}

export const SQL_TYPES: SqlTypeMeta[] = [
	{ name: "DATE", params: "none", pkFkAllowed: true },
	{ name: "DATETIME", params: "none", pkFkAllowed: true },
	{ name: "TIMESTAMP", params: "none", pkFkAllowed: true },
	{ name: "TIME", params: "none" },
	{ name: "INT", params: "none", pkFkAllowed: true },
	{ name: "BIGINT", params: "none", pkFkAllowed: true },
	{ name: "SMALLINT", params: "none", pkFkAllowed: true },
	{ name: "TINYINT", params: "none", pkFkAllowed: true },
	{ name: "BOOLEAN", params: "none" },
	{ name: "FLOAT", params: "none" },
	{ name: "DOUBLE", params: "none" },
	{ name: "DECIMAL", params: "precisionScale", defaultPrecision: 10, defaultScale: 2 },
	{ name: "NUMERIC", params: "precisionScale", defaultPrecision: 10, defaultScale: 2 },
	{ name: "VARCHAR", params: "length", defaultLength: 255, pkFkAllowed: true },
	{ name: "CHAR", params: "length", defaultLength: 1, pkFkAllowed: true },
	{ name: "TEXT", params: "none" },
	{ name: "BLOB", params: "none" },
	{ name: "JSON", params: "none" },
	{ name: "UUID", params: "none", pkFkAllowed: true },
];

export const NOSQL_TYPES = [
	"block",
	"ID",
	"string",
	"int",
	"long",
	"float",
	"double",
	"decimal",
	"boolean",
	"date",
] as const;

export type NosqlTypeName = (typeof NOSQL_TYPES)[number];

const SQL_TYPE_MAP = new Map(SQL_TYPES.map((entry) => [entry.name, entry]));

const INTEGER_NOSQL = new Set(["INT", "BIGINT", "SMALLINT", "TINYINT"]);
const FLOAT_NOSQL = new Set(["FLOAT", "DOUBLE"]);
const DECIMAL_NOSQL = new Set(["DECIMAL", "NUMERIC"]);
const STRING_NOSQL = new Set(["VARCHAR", "CHAR", "TEXT", "UUID", "JSON", "BLOB"]);
const DATE_NOSQL = new Set(["DATE", "DATETIME", "TIME", "TIMESTAMP"]);

export const getSqlTypeMeta = (typeName: string | null | undefined): SqlTypeMeta | undefined => {
	if (!typeName) return undefined;
	const base = parseLegacyType(typeName).type;
	return SQL_TYPE_MAP.get(base.toUpperCase());
};

export const getSqlTypeOptions = (): Array<{ name: string; type: string }> =>
	SQL_TYPES.map(({ name }) => ({ name, type: name }));

export const isSqlTypeAllowedForPrimaryKey = (typeName: string | null | undefined): boolean =>
	Boolean(getSqlTypeMeta(typeName)?.pkFkAllowed);

export const getSqlTypeOptionsForPrimaryKey = (): Array<{ name: string; type: string }> =>
	SQL_TYPES
		.filter((entry) => entry.pkFkAllowed)
		.map(({ name }) => ({ name, type: name }));

export const applyTypeDefaults = (typeName: string, current: TypedColumnLike = {}): ParsedType => {
	const parsed = parseLegacyType(typeName);
	const meta = SQL_TYPE_MAP.get(parsed.type.toUpperCase());
	if (!meta) {
		const result: ParsedType = { type: parsed.type || "INT" };
		const length = current.length ?? parsed.length;
		const precision = current.precision ?? parsed.precision;
		const scale = current.scale ?? parsed.scale;
		if (length != null) result.length = length;
		if (precision != null) result.precision = precision;
		if (scale != null) result.scale = scale;
		return result;
	}

	const result: ParsedType = { type: meta.name };

	if (meta.params === "length") {
		const length = current.length ?? parsed.length ?? meta.defaultLength;
		if (length != null) result.length = length;
	}

	if (meta.params === "precisionScale") {
		const precision = current.precision ?? parsed.precision ?? meta.defaultPrecision;
		const scale = current.scale ?? parsed.scale ?? meta.defaultScale ?? 0;
		if (precision != null) result.precision = precision;
		if (scale != null) result.scale = scale;
	}

	return result;
};

export const clearIrrelevantParams = (column: TypedColumnLike): TypedColumnLike => {
	const meta = getSqlTypeMeta(column.type);
	const next: TypedColumnLike = { ...column, type: meta?.name || column.type };

	if (!meta) return next;

	if (meta.params !== "length") {
		delete next.length;
	}
	if (meta.params !== "precisionScale") {
		delete next.precision;
		delete next.scale;
	}

	return next;
};

export const formatColumnType = (column: TypedColumnLike | null | undefined): string => {
	if (!column?.type) return "";

	const parsed = parseLegacyType(column.type);
	const typeName = parsed.type.toUpperCase();
	const meta = SQL_TYPE_MAP.get(typeName);
	const base = meta?.name || parsed.type;

	if (!meta) {
		const length = column.length ?? parsed.length;
		const precision = column.precision ?? parsed.precision;
		const scale = column.scale ?? parsed.scale;
		if (length != null) return `${base}(${length})`;
		if (precision != null) {
			return `${base}(${precision},${scale ?? 0})`;
		}
		return base;
	}

	if (meta.params === "length") {
		const length = column.length ?? parsed.length ?? meta.defaultLength;
		return length != null ? `${base}(${length})` : base;
	}

	if (meta.params === "precisionScale") {
		const precision = column.precision ?? parsed.precision ?? meta.defaultPrecision;
		const scale = column.scale ?? parsed.scale ?? meta.defaultScale ?? 0;
		return precision != null ? `${base}(${precision},${scale})` : base;
	}

	return base;
};

const LEGACY_TYPE_REGEX = /^([A-Za-z_][A-Za-z0-9_]*)(?:\((\d+)(?:,\s*(\d+))?\))?$/;

export const parseLegacyType = (typeString: string | null | undefined): ParsedType => {
	if (!typeString || typeof typeString !== "string") {
		return { type: "INT" };
	}

	const trimmed = typeString.trim();
	if (!trimmed) return { type: "INT" };

	const placeholderMatch = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\(n\)$/i);
	if (placeholderMatch) {
		return { type: placeholderMatch[1].toUpperCase() };
	}

	const match = trimmed.match(LEGACY_TYPE_REGEX);
	if (!match) {
		return { type: trimmed.toUpperCase() };
	}

	const type = match[1].toUpperCase();
	const first = match[2] != null ? Number(match[2]) : undefined;
	const second = match[3] != null ? Number(match[3]) : undefined;

	if (first == null) {
		return { type };
	}

	const meta = SQL_TYPE_MAP.get(type);
	if (meta?.params === "precisionScale" || second != null) {
		return { type, precision: first, scale: second ?? 0 };
	}

	return { type, length: first };
};

export const validateTypeParams = (column: TypedColumnLike): string[] => {
	const errors: string[] = [];
	const meta = getSqlTypeMeta(column.type);
	if (!meta) return errors;

	if (meta.params === "length") {
		const length = column.length;
		if (length == null || !Number.isInteger(length) || length < 1) {
			errors.push("Length must be a positive integer");
		}
	}

	if (meta.params === "precisionScale") {
		const precision = column.precision;
		const scale = column.scale ?? 0;
		if (precision == null || !Number.isInteger(precision) || precision < 1) {
			errors.push("Precision must be a positive integer");
		}
		if (!Number.isInteger(scale) || scale < 0) {
			errors.push("Scale must be a non-negative integer");
		}
		if (precision != null && scale > precision) {
			errors.push("Scale cannot be greater than precision");
		}
	}

	return errors;
};

export const isStringSqlType = (columnType: string | null | undefined): boolean => {
	if (!columnType) return false;
	const { type } = parseLegacyType(columnType);
	return type === "VARCHAR" || type === "CHAR" || type === "TEXT";
};

export interface ConceptualDataTypeFields {
	dataType?: string | null;
	length?: number | null;
	precision?: number | null;
	scale?: number | null;
}

export const conceptualToLogicalType = (
	attr: ConceptualDataTypeFields | null | undefined,
): ParsedType => {
	const dataType = attr?.dataType;
	if (!dataType) {
		return applyTypeDefaults("VARCHAR", { length: 255 });
	}
	return applyTypeDefaults(dataType, {
		length: attr?.length,
		precision: attr?.precision,
		scale: attr?.scale,
	});
};

export const mapSqlTypeToNosql = (
	attr: ConceptualDataTypeFields | null | undefined,
	options: { isKey?: boolean } = {},
): { type: NosqlTypeName | string; length?: number; precision?: number; scale?: number } => {
	if (options.isKey) {
		return { type: "ID" };
	}

	const logical = conceptualToLogicalType(attr);
	const sqlType = logical.type.toUpperCase();

	if (INTEGER_NOSQL.has(sqlType)) {
		return { type: sqlType === "BIGINT" ? "long" : "int" };
	}
	if (DECIMAL_NOSQL.has(sqlType)) {
		const result: { type: string; precision?: number; scale?: number } = { type: "decimal" };
		if (logical.precision != null) result.precision = logical.precision;
		if (logical.scale != null) result.scale = logical.scale;
		return result;
	}
	if (FLOAT_NOSQL.has(sqlType)) {
		return { type: sqlType === "DOUBLE" ? "double" : "float" };
	}
	if (sqlType === "BOOLEAN") {
		return { type: "boolean" };
	}
	if (DATE_NOSQL.has(sqlType)) {
		return { type: "date" };
	}
	if (STRING_NOSQL.has(sqlType)) {
		const result: { type: string; length?: number } = { type: "string" };
		if (logical.length != null) result.length = logical.length;
		return result;
	}

	return { type: "string" };
};

export const formatNosqlType = (row: {
	type?: string | null;
	length?: number | null;
	precision?: number | null;
	scale?: number | null;
}): string => {
	const type = row?.type || "";
	if (!type) return "";

	if (type === "string" && row.length != null) {
		return `string(${row.length})`;
	}
	if (type === "decimal") {
		if (row.precision != null) {
			const scale = row.scale ?? 0;
			return `decimal(${row.precision},${scale})`;
		}
	}
	return type;
};

export const copyTypeParams = <T extends TypedColumnLike>(source: TypedColumnLike, target: T): T => {
	const applied = applyTypeDefaults(source.type || "INT", source);
	const next = { ...target, type: applied.type } as T & TypedColumnLike;

	delete (next as TypedColumnLike).length;
	delete (next as TypedColumnLike).precision;
	delete (next as TypedColumnLike).scale;

	if (applied.length != null) next.length = applied.length;
	if (applied.precision != null) next.precision = applied.precision;
	if (applied.scale != null) next.scale = applied.scale;

	return next;
};
