import React, { useContext, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ModalsContext } from "../../containers/Modals";
import ConversionOptionModal, { ConversionOption } from "./ConversionOptionModal";

export interface NosqlConversionOptionService {
	openSpecialization: (entityName: string, isDisjoint: boolean) => Promise<ConversionOption>;
	openRelationNN: (relationDescription: string, entityAName: string, entityBName: string) => Promise<ConversionOption>;
	openRelation1N: (relationDescription: string, collectionNames: string) => Promise<ConversionOption>;
	openRelation11: (relationDescription: string, collectionNames: string) => Promise<ConversionOption>;
	openRelation11Partial: (relationDescription: string, collectionNames: string) => Promise<ConversionOption>;
	openMultivalued: (attributeName: string, collectionName: string) => Promise<ConversionOption>;
	openAutoRelation11: (entityName: string, relationDescription: string) => Promise<ConversionOption>;
	openAutoRelation1N: (entityName: string, relationDescription: string) => Promise<ConversionOption>;
	openAutoRelationNN: (entityName: string, relationDescription: string) => Promise<ConversionOption>;
}

export function useNosqlConversionOptionModal(): NosqlConversionOptionService {
	const context = useContext(ModalsContext);
	const { t } = useTranslation(["common"]);
	if (!context) {
		throw new Error("useNosqlConversionOptionModal must be used within a ModalsProvider");
	}

	return useMemo<NosqlConversionOptionService>(() => {
		const open = (title: string, summary: string, options: ConversionOption[]) =>
			context.open<ConversionOption>(({ onSuccess, onCancel, onError }) => (
				<ConversionOptionModal
					open
					title={title}
					summary={summary}
					options={options}
					onSuccess={onSuccess}
					onCancel={onCancel}
					onError={onError}
				/>
			));

		return {
			openSpecialization: (entityName, isDisjoint) =>
				open(
					t("NoSQL Conversion Assistant - Specialization"),
					t("How do you want to convert the inheritance from ENTITY?", { entity: entityName }),
					[
						{ label: t("One collection per specialization"), value: "specialized_collections" },
						{
							label: isDisjoint
								? t("Nested blocks with disjunction constraint")
								: t("Nested blocks under the superclass collection"),
							value: isDisjoint ? "nested_with_disjunction" : "nested_hierarchy",
						},
						{ label: t("Single generic collection with 'type' discriminator"), value: "generic_collection" },
					],
				),

			openRelationNN: (relationDescription, entityAName, entityBName) =>
				open(
					t("NoSQL Conversion Assistant - Relationship (n, n)"),
					t("How do you want to convert the RELATIONSHIP relationship between COLLECTIONS?", {
						relationship: relationDescription,
						collections: `(${entityAName}, ${entityBName})`,
					}),
					[
						{ label: t("Block with _REF on HOST (referencing REF)", { host: entityAName, ref: entityBName }), value: "host_A" },
						{ label: t("Block with _REF on HOST (referencing REF)", { host: entityBName, ref: entityAName }), value: "host_B" },
					],
				),

			openRelation1N: (relationDescription, collectionNames) =>
				open(
					t("NoSQL Conversion Assistant - Relationship (1, n)"),
					t("How do you want to convert the RELATIONSHIP relationship between COLLECTIONS?", { relationship: relationDescription, collections: collectionNames }),
					[
						{ label: t("Nest (embed the many-side inside the one-side)"), value: "nesting" },
						{ label: t("Reference (add _REF on the many-side)"), value: "reference" },
					],
				),

			openRelation11: (relationDescription, collectionNames) =>
				open(
					t("NoSQL Conversion Assistant - Relationship (1, 1)"),
					t("How do you want to convert the RELATIONSHIP relationship between COLLECTIONS?", { relationship: relationDescription, collections: collectionNames }),
					[
						{ label: t("Merge into a single collection"), value: "merge" },
						{ label: t("Nest one side inside the other"), value: "nesting" },
						{ label: t("Add a reference between collections"), value: "reference" },
					],
				),

			openRelation11Partial: (relationDescription, collectionNames) =>
				open(
					t("NoSQL Conversion Assistant - Relationship (1, 1) partial"),
					t("How do you want to convert the RELATIONSHIP relationship between COLLECTIONS?", { relationship: relationDescription, collections: collectionNames }),
					[
						{ label: t("Merge into a single collection"), value: "merge" },
						{ label: t("Nest the optional side inside the mandatory one"), value: "nesting" },
					],
				),

			openMultivalued: (attributeName, collectionName) =>
				open(
					t("NoSQL Conversion Assistant - Multivalued attribute"),
					t("How do you want to convert the ATTRIBUTE attribute of COLLECTION?", { attribute: attributeName, collection: collectionName }),
					[
						{ label: t("Attribute with (0,n) cardinality"), value: "cardinality" },
						{ label: t("Nested block"), value: "nested_block" },
						{ label: t("Separate collection"), value: "separate_collection" },
					],
				),

			openAutoRelation11: (entityName, relationDescription) =>
				open(
					t("NoSQL Conversion Assistant - Self-relationship (1, 1)"),
					t("How do you want to convert the RELATIONSHIP self-relationship on COLLECTION?", { relationship: relationDescription, collection: entityName }),
					[
						{ label: t("Self-reference inside the same collection"), value: "reference" },
						{ label: t("Embed (nested block)"), value: "nesting" },
					],
				),

			openAutoRelation1N: (entityName, relationDescription) =>
				open(
					t("NoSQL Conversion Assistant - Self-relationship (1, n)"),
					t("How do you want to convert the RELATIONSHIP self-relationship on COLLECTION?", { relationship: relationDescription, collection: entityName }),
					[
						{ label: t("Self-reference inside the same collection"), value: "reference" },
						{ label: t("Embed (nested block)"), value: "nesting" },
					],
				),

			openAutoRelationNN: (entityName, relationDescription) =>
				open(
					t("NoSQL Conversion Assistant - Self-relationship (n, n)"),
					t("How do you want to convert the RELATIONSHIP self-relationship on COLLECTION?", { relationship: relationDescription, collection: entityName }),
					[
						{ label: t("Self-reference inside the same collection"), value: "reference" },
						{ label: t("Embed (nested block)"), value: "nesting" },
					],
				),
		};
	}, [context, t]);
}
