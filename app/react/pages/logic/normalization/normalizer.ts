import type {
	FunctionalDependency,
	NormalizationTable,
	NormalizedTable,
} from "./types";

/* ───────────── utilitários ───────────── */

const clean = (attribute: string): string => attribute.split(":")[0].trim();

function unique<T>(items: T[]): T[] {
	return Array.from(new Set(items));
}
const isSubset = (a: string[], b: string[]): boolean =>
	a.every((item) => b.includes(item));

const sameSet = (a: string[], b: string[]): boolean =>
	a.length === b.length && isSubset(a, b);

function validDependencies(
	dependencies: FunctionalDependency[],
	attributes: string[],
): FunctionalDependency[] {
	const known = new Set(attributes);

	return dependencies
		.map((dependency) => ({
			left: unique(
				dependency.left.map(clean).filter((attribute) => known.has(attribute)),
			),
			right: unique(
				dependency.right.map(clean).filter((attribute) => known.has(attribute)),
			),
		}))
		.filter(
			(dependency) => dependency.left.length > 0 && dependency.right.length > 0,
		);
}

function prepare(table: NormalizationTable) {
	const attributes = unique(table.attributes.map(clean));
	const dependencies = validDependencies(table.dependencies, attributes);
	return { attributes, dependencies };
}

function generateSubsets(attributes: string[]): string[][] {
	const result: string[][] = [];

	for (let mask = 0; mask < 1 << attributes.length; mask++) {
		result.push(attributes.filter((_, index) => Boolean(mask & (1 << index))));
	}

	return result;
}

/* ───────────── fecho, chaves, cobertura mínima ───────────── */

export function closureOf(
	attributes: string[],
	dependencies: FunctionalDependency[],
): Set<string> {
	const closure = new Set(attributes.map(clean));

	let changed = true;

	while (changed) {
		changed = false;

		for (const dependency of dependencies) {
			if (!dependency.left.map(clean).every((a) => closure.has(a))) continue;

			for (const attribute of dependency.right.map(clean)) {
				if (!closure.has(attribute)) {
					closure.add(attribute);
					changed = true;
				}
			}
		}
	}

	return closure;
}

export function isSuperKey(
	attributes: string[],
	table: NormalizationTable,
): boolean {
	const { attributes: all, dependencies } = prepare(table);
	const closure = closureOf(attributes, dependencies);
	return all.every((attribute) => closure.has(attribute));
}

export function findCandidateKeys(table: NormalizationTable): string[][] {
	const { attributes, dependencies } = prepare(table);

	const inRight = new Set(dependencies.flatMap((d) => d.right));
	const core = attributes.filter((a) => !inRight.has(a));
	const rest = attributes.filter((a) => inRight.has(a));

	const keys: string[][] = [];

	const subsets = generateSubsets(rest).sort((a, b) => a.length - b.length);

	for (const extra of subsets) {
		const candidate = attributes.filter(
			(a) => core.includes(a) || extra.includes(a),
		);

		if (keys.some((key) => isSubset(key, candidate))) continue;

		const closure = closureOf(candidate, dependencies);

		if (attributes.every((a) => closure.has(a))) keys.push(candidate);
	}

	return keys;
}

function pickPrimaryKey(table: NormalizationTable, keys: string[][]): string[] {
	const declared = unique(table.primaryKey.map(clean));

	if (keys.some((key) => sameSet(key, declared))) return declared;

	return keys[0] ?? declared;
}

function dedupe(dependencies: FunctionalDependency[]): FunctionalDependency[] {
	const seen = new Set<string>();

	return dependencies.filter((dependency) => {
		const id = `${[...dependency.left].sort().join(",")}->${dependency.right[0]}`;
		if (seen.has(id)) return false;
		seen.add(id);
		return true;
	});
}

export function minimalCover(
	dependencies: FunctionalDependency[],
): FunctionalDependency[] {
	let fds = dedupe(
		dependencies.flatMap((dependency) =>
			dependency.right
				.filter((attribute) => !dependency.left.includes(attribute))
				.map((attribute) => ({
					left: unique(dependency.left),
					right: [attribute],
				})),
		),
	);
	fds = dedupe(
		fds.map((fd) => {
			let left = fd.left;

			for (const attribute of fd.left) {
				if (left.length === 1) break;

				const reduced = left.filter((a) => a !== attribute);

				if (closureOf(reduced, fds).has(fd.right[0])) left = reduced;
			}

			return { left, right: fd.right };
		}),
	);
	for (let i = fds.length - 1; i >= 0; i--) {
		const rest = fds.filter((_, index) => index !== i);

		if (closureOf(fds[i].left, rest).has(fds[i].right[0])) fds = rest;
	}

	return fds;
}

function groupByLeft(
	dependencies: FunctionalDependency[],
): FunctionalDependency[] {
	const groups = new Map<string, FunctionalDependency>();

	for (const dependency of dependencies) {
		const id = [...dependency.left].sort().join(",");
		const group = groups.get(id) ?? { left: dependency.left, right: [] };

		group.right.push(...dependency.right);
		groups.set(id, group);
	}

	return Array.from(groups.values());
}

function projectDependencies(
	attributes: string[],
	dependencies: FunctionalDependency[],
): FunctionalDependency[] {
	const projected: FunctionalDependency[] = [];

	for (const left of generateSubsets(attributes)) {
		if (left.length === 0) continue;

		const closure = closureOf(left, dependencies);
		const right = attributes.filter((a) => !left.includes(a) && closure.has(a));

		if (right.length > 0) projected.push({ left, right });
	}

	return groupByLeft(minimalCover(projected));
}

/* ───────────── chaves estrangeiras ───────────── */

type Relation = Omit<NormalizedTable, "foreignKeys">;

function withForeignKeys(relations: Relation[]): NormalizedTable[] {
	return relations.map((relation) => ({
		...relation,
		foreignKeys: relations
			.filter(
				(other) =>
					other !== relation &&
					!sameSet(other.primaryKey, relation.primaryKey) &&
					isSubset(other.primaryKey, relation.attributes),
			)
			.map((other) => `${other.primaryKey.join(", ")} -> ${other.name}`),
	}));
}

/* ───────────── 2NF ───────────── */

export function isIn2NF(table: NormalizationTable): boolean {
	const { attributes, dependencies } = prepare(table);
	const keys = findCandidateKeys(table);
	const prime = new Set(keys.flat());

	return keys.every((key) =>
		generateSubsets(key).every((part) => {
			if (part.length === 0 || part.length === key.length) return true;

			const closure = closureOf(part, dependencies);

			return attributes.every(
				(a) => prime.has(a) || part.includes(a) || !closure.has(a),
			);
		}),
	);
}

export function to2NF(table: NormalizationTable): NormalizedTable[] {
	const { attributes, dependencies } = prepare(table);
	const keys = findCandidateKeys(table);
	const primaryKey = pickPrimaryKey(table, keys);
	const prime = new Set(keys.flat());

	const determinants = new Map<string, string[]>();

	for (const fd of minimalCover(dependencies)) {
		if (keys.some((k) => fd.left.length < k.length && isSubset(fd.left, k))) {
			determinants.set([...fd.left].sort().join(","), fd.left);
		}
	}

	const moved = new Set<string>();
	const parts: { determinant: string[]; attrs: string[] }[] = [];

	for (const determinant of determinants.values()) {
		const closure = closureOf(determinant, dependencies);

		const attrs = attributes.filter(
			(a) =>
				closure.has(a) &&
				!determinant.includes(a) &&
				!prime.has(a) &&
				!moved.has(a),
		);

		if (attrs.length === 0) continue;

		attrs.forEach((a) => moved.add(a));
		parts.push({ determinant, attrs });
	}

	const relations: Relation[] = [
		{
			name: table.name,
			attributes: attributes.filter((a) => !moved.has(a)),
			primaryKey,
		},
		...parts.map(({ determinant, attrs }) => ({
			name: `${table.name}_${determinant.join("_")}`,
			attributes: attributes.filter(
				(a) => determinant.includes(a) || attrs.includes(a),
			),
			primaryKey: determinant,
		})),
	].map((relation) => ({
		...relation,
		dependencies: projectDependencies(relation.attributes, dependencies),
	}));

	return withForeignKeys(relations);
}

/* ───────────── 3NF ───────────── */

export function to3NF(table: NormalizationTable): NormalizedTable[] {
	const { attributes, dependencies } = prepare(table);
	const keys = findCandidateKeys(table);
	const primaryKey = pickPrimaryKey(table, keys);

	const groups = groupByLeft(minimalCover(dependencies));

	let relations = groups.map((group) => ({
		attributes: attributes.filter(
			(a) => group.left.includes(a) || group.right.includes(a),
		),
		primaryKey: group.left,
	}));

	if (!relations.some((r) => keys.some((key) => isSubset(key, r.attributes)))) {
		relations.push({
			attributes: attributes.filter((a) => primaryKey.includes(a)),
			primaryKey,
		});
	}

	relations = relations
		.map((r, index) => ({ r, index }))
		.sort(
			(a, b) =>
				Number(!sameSet(a.r.primaryKey, primaryKey)) -
					Number(!sameSet(b.r.primaryKey, primaryKey)) || a.index - b.index,
		)
		.map(({ r }) => r);

	relations = relations.filter(
		(r, i) =>
			!relations.some(
				(other, j) =>
					j !== i &&
					isSubset(r.attributes, other.attributes) &&
					(r.attributes.length < other.attributes.length || j < i),
			),
	);

	const result: Relation[] = relations.map((r) => ({
		name:
			relations.length === 1
				? table.name
				: `${table.name}_${r.primaryKey.join("_")}`,
		attributes: r.attributes,
		primaryKey: r.primaryKey,
		dependencies: projectDependencies(r.attributes, dependencies),
	}));

	return withForeignKeys(result);
}

/* ───────────── entrada principal ───────────── */

export function normalizeTable(table: NormalizationTable): NormalizedTable[] {
	return to3NF(table);
}
