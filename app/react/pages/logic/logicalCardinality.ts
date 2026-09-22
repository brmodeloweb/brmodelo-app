export type CardinalityKind = "1n" | "11" | "nn" | "invalid";

export type LinkEnd = "source" | "target";

export interface LogicalCardinalityInput {
	cardSource: string;
	cardTarget: string;
}

export interface LogicalCardinalityResult {
	kind: CardinalityKind;
	fkEnd: LinkEnd;
	referencedEnd: LinkEnd;
	notNull: boolean;
	unique: boolean;
}

export interface ParsedCardinality {
	min: "0" | "1";
	max: "1" | "n";
}

const CARD_REGEX = /^\(\s*([01])\s*,\s*([1n])\s*\)$/i;

export function parseCardinality(card: string): ParsedCardinality | null {
	if (!card || typeof card !== "string") return null;
	const match = card.trim().match(CARD_REGEX);
	if (!match) return null;
	return {
		min: match[1] as "0" | "1",
		max: match[2].toLowerCase() as "1" | "n",
	};
}

const INVALID_RESULT: LogicalCardinalityResult = {
	kind: "invalid",
	fkEnd: "target",
	referencedEnd: "source",
	notNull: false,
	unique: false,
};

/**
 * Resolves logical FK placement from the two link-end cardinality labels.
 * Convention matches onLink/addColumn: source = referenced table, target = FK owner
 * when orientation is normalized after sync.
 */
export function resolveLogicalCardinality({
	cardSource,
	cardTarget,
}: LogicalCardinalityInput): LogicalCardinalityResult {
	const source = parseCardinality(cardSource);
	const target = parseCardinality(cardTarget);
	if (!source || !target) return INVALID_RESULT;

	const sourceMaxN = source.max === "n";
	const targetMaxN = target.max === "n";

	if (sourceMaxN && targetMaxN) {
		return {
			kind: "nn",
			fkEnd: "target",
			referencedEnd: "source",
			notNull: false,
			unique: false,
		};
	}

	if (!sourceMaxN && !targetMaxN) {
		let fkEnd: LinkEnd = "target";
		if (source.min === "0" && target.min === "1") {
			fkEnd = "source";
		} else if (source.min === "1" && target.min === "0") {
			fkEnd = "target";
		}

		const fkCard = fkEnd === "source" ? source : target;
		return {
			kind: "11",
			fkEnd,
			referencedEnd: fkEnd === "source" ? "target" : "source",
			notNull: fkCard.min === "1",
			unique: true,
		};
	}

	const fkEnd: LinkEnd = targetMaxN ? "target" : "source";
	const fkCard = fkEnd === "source" ? source : target;
	return {
		kind: "1n",
		fkEnd,
		referencedEnd: fkEnd === "source" ? "target" : "source",
		notNull: fkCard.min === "1",
		unique: false,
	};
}
