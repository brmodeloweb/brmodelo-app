import React from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LogicPage from "./LogicPage";
import { getModel, updateModel } from "../../services/modelStore";
import { generate as generateSql, validateLogicModelForSql } from "./sqlGenerator";
import { useSqlGeneratorModal } from "../../components/SqlGeneratorModal";
import { useQueryExpressionModal } from "../../components/QueryExpressionModal";
import { useConversionAttributeModal } from "../../components/ConversionAttributeModal";
import { useConversionOptionModal } from "../../components/ConversionOptionModal";
import { useConfirmationModal } from "../../components/ConfirmationModal";
import { usePreventExit } from "../../services/usePreventExit";

const LogicPageWrapper: React.FC = () => {
	const navigate = useNavigate();
	const { t } = useTranslation(["common"]);
	const { modelid = "" } = useParams<{ modelid: string }>();
	const [searchParams] = useSearchParams();
	const conversionId = searchParams.get("conversionId") ?? undefined;

	const sqlGeneratorModal = useSqlGeneratorModal();
	const queryExpressionModal = useQueryExpressionModal();
	const conversionAttributeModal = useConversionAttributeModal();
	const conversionOptionModal = useConversionOptionModal();
	const confirmationModal = useConfirmationModal();
	const setEditor = usePreventExit();

	const handleLoadModel = React.useCallback(async (id: string) => getModel(id), []);
	const handleSaveModel = React.useCallback(async (model: any) => { await updateModel(model); }, []);

	const handleNavigateToWorkspace = React.useCallback(() => navigate("/"), [navigate]);

	const handleGenerateSQL = React.useCallback((tablesMap: Map<string, any>, views: any[], modelName?: string) => {
		const errors = validateLogicModelForSql(tablesMap, views);
		if (errors.length > 0) {
			confirmationModal.confirm({
				title: t("Cannot generate SQL"),
				content: errors.join("\n"),
				cancelable: false,
				confirmLabel: t("Close"),
			}).catch(() => {});
			return;
		}
		const sql = generateSql(tablesMap, views);
		sqlGeneratorModal.open(sql, modelName).catch(() => {});
	}, [sqlGeneratorModal, confirmationModal, t]);

	const handleOpenQueryExpression = React.useCallback((tables: any[], queryConditions: any) => {
		return queryExpressionModal.open(tables, queryConditions);
	}, [queryExpressionModal]);

	const handleConversionConsumed = React.useCallback((consumedModelId: string) => {
		window.history.replaceState(null, "", `/logic/${consumedModelId}`);
	}, []);

	return (
		<LogicPage
			modelId={modelid}
			conversionId={conversionId}
			conversionAttributeModalService={conversionAttributeModal}
			conversionOptionModalService={conversionOptionModal}
			onLoadModel={handleLoadModel}
			onSaveModel={handleSaveModel}
			onNavigateToWorkspace={handleNavigateToWorkspace}
			onGenerateSQL={handleGenerateSQL}
			onEditorReady={setEditor}
			onOpenQueryExpression={handleOpenQueryExpression}
			onConversionConsumed={handleConversionConsumed}
		/>
	);
};

export default LogicPageWrapper;
