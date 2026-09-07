export function resolveFKTableOrigin(
	tableOrigin: { idOrigin?: string; idName?: string } | undefined | null,
	tables: Array<{ name: string; id: string }>,
): { idName: string; idOrigin: string } | null {
	if (!tableOrigin) return null;

	const byName = new Map(tables.map(t => [t.name, t.id]));
	const byId = new Map(tables.map(t => [t.id, t.name]));

	if (tableOrigin.idName && byName.has(tableOrigin.idName)) {
		return { idName: tableOrigin.idName, idOrigin: byName.get(tableOrigin.idName)! };
	}
	if (tableOrigin.idOrigin && byId.has(tableOrigin.idOrigin)) {
		return { idName: byId.get(tableOrigin.idOrigin)!, idOrigin: tableOrigin.idOrigin };
	}
	return null;
}
