type TableOrigin = {
	idOrigin?: string;
	idName?: string;
	columnName?: string;
} | undefined | null;

type TableColumn = {
	name?: string;
	PK?: boolean;
	isPrimaryKey?: boolean;
};

const isPrimaryKeyColumn = (column: TableColumn) =>
	Boolean(column.PK || column.isPrimaryKey);

export function resolveFKTableOrigin(
	tableOrigin: TableOrigin,
	tables: Array<{ name: string; id: string }>,
): { idName: string; idOrigin: string } | null {
	if (!tableOrigin) return null;

	const byName = new Map(tables.map(table => [table.name, table.id]));
	const byId = new Map(tables.map(table => [table.id, table.name]));

	if (tableOrigin.idName && byName.has(tableOrigin.idName)) {
		return { idName: tableOrigin.idName, idOrigin: byName.get(tableOrigin.idName)! };
	}
	if (tableOrigin.idOrigin && byId.has(tableOrigin.idOrigin)) {
		return { idName: byId.get(tableOrigin.idOrigin)!, idOrigin: tableOrigin.idOrigin };
	}
	return null;
}

/**
 * Resolves which PK column on the origin table an FK should reference.
 * Explicit columnName is authoritative: if present but not a PK, returns null.
 * Legacy fallback (FK name match, then first PK) applies only when columnName is absent.
 */
export function resolveFKColumnOrigin(
	tableOrigin: TableOrigin,
	originTableColumns: TableColumn[] | undefined | null,
	fkColumnName?: string,
): { columnName: string } | null {
	const columns = originTableColumns || [];
	const primaryKeys = columns.filter(isPrimaryKeyColumn);

	if (primaryKeys.length === 0) return null;

	if (tableOrigin?.columnName) {
		const byStoredName = primaryKeys.find(col => col.name === tableOrigin.columnName);
		if (byStoredName?.name) {
			return { columnName: byStoredName.name };
		}
		return null;
	}

	if (fkColumnName) {
		const byFkName = primaryKeys.find(col => col.name === fkColumnName);
		if (byFkName?.name) {
			return { columnName: byFkName.name };
		}
	}

	const firstPk = primaryKeys[0];
	return firstPk?.name ? { columnName: firstPk.name } : null;
}
