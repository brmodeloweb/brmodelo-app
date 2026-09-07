import React, { useContext, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ModalsContext } from "../../containers/Modals";
import ConversionOptionModal, { ConversionOption } from "./ConversionOptionModal";

export interface ConversionOptionService {
	openExtension: (tableName: string) => Promise<ConversionOption>;
	openExtensionRestricted: (tableName: string) => Promise<ConversionOption>;
	openRelation1N: (relationDescription: string, tableNames: string) => Promise<ConversionOption>;
	openRelation11: (relationDescription: string, tableNames: string) => Promise<ConversionOption>;
	openAutoRelation1N: (entityName: string, relationDescription: string) => Promise<ConversionOption>;
	openAutoRelation11: (entityName: string, relationDescription: string) => Promise<ConversionOption>;
	openRelation11Join: (relationDescription: string, tableNames: string) => Promise<ConversionOption>;
}

export function useConversionOptionModal(): ConversionOptionService {
	const context = useContext(ModalsContext);
	const { t } = useTranslation(["common"]);
	if (!context) {
		throw new Error("useConversionOptionModal must be used within a ModalsProvider");
	}

	return useMemo<ConversionOptionService>(() => {
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
			openExtension: (tableName) =>
				open(
					t("Conversion Assistant - Specialization"),
					t("What do you want to do with inheritance from table TABLE_NAME?", { table: tableName }),
					[
						{ label: t("Use of a table for each entity"), value: "all_tables" },
						{ label: t("Use of a single table for the entire hierarchy"), value: "one_table" },
						{ label: t("Use of a table for specialized entity(ies) only"), value: "children_tables" },
					],
				),

			openExtensionRestricted: (tableName) =>
				open(
					t("Attention - Conversion Assistant - Specialization"),
					t("It was not possible to perform this conversion because table TABLE_NAME has other connections. Choose another option.", { table: tableName }),
					[
						{ label: t("Use of a table for each entity"), value: "all_tables" },
						{ label: t("Use of a single table for the entire hierarchy"), value: "one_table" },
					],
				),

			openRelation1N: (relationDescription, tableNames) =>
				open(
					t("Conversion Assistant - Relationship (1, n)"),
					t("What do you want to do with the RELATIONSHIP relationship between the TABLES tables?", { relationship: relationDescription, tables: tableNames }),
					[
						{ label: t("Create a column in the least cardinality table"), value: "new_column" },
						{ label: t("Create new table"), value: "new_table" },
					],
				),

			openRelation11: (relationDescription, tableNames) =>
				open(
					t("Conversion Assistant - Relationship (1, 1)"),
					t("What do you want to do with the RELATIONSHIP relationship between the TABLES tables?", { relationship: relationDescription, tables: tableNames }),
					[
						{ label: t("Create a column in the least cardinality table"), value: "new_column" },
						{ label: t("Create new table"), value: "new_table" },
					],
				),

			openAutoRelation1N: (entityName, relationDescription) =>
				open(
					t("Conversion Assistant - Self-relationship (1, n)"),
					t("How do you want to convert the RELATIONSHIP self-relationship on table TABLE?", { relationship: relationDescription, table: entityName }),
					[
						{ label: t("Create a recursive FK in the same table"), value: "new_column" },
						{ label: t("Create associative table"), value: "new_table" },
					],
				),

			openAutoRelation11: (entityName, relationDescription) =>
				open(
					t("Conversion Assistant - Self-relationship (1, 1)"),
					t("How do you want to convert the RELATIONSHIP self-relationship on table TABLE?", { relationship: relationDescription, table: entityName }),
					[
						{ label: t("Create a recursive FK in the same table"), value: "new_column" },
						{ label: t("Create associative table"), value: "new_table" },
					],
				),

			openRelation11Join: (relationDescription, tableNames) =>
				open(
					t("Conversion Assistant - Relationship (1, 1)"),
					t("What do you want to do with the RELATIONSHIP relationship between the TABLES tables?", { relationship: relationDescription, tables: tableNames }),
					[
						{ label: t("Create a column in the least cardinality table"), value: "new_column" },
						{ label: t("Join tables"), value: "join_tables" },
					],
				),
		};
	}, [context, t]);
}
