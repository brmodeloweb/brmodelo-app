import React from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import LogicPage from "./LogicPage";
import { getModel, updateModel } from "../../services/modelStore";
import { generate as generateSql } from "./sqlGenerator";
import { useSqlGeneratorModal } from "../../components/SqlGeneratorModal";
import { useQueryExpressionModal } from "../../components/QueryExpressionModal";
import { useConversionAttributeModal } from "../../components/ConversionAttributeModal";
import { useConversionOptionModal } from "../../components/ConversionOptionModal";
import { usePreventExit } from "../../services/usePreventExit";
import { useNormalizerModal } from "../../components/NormalizerModal";

const LogicPageWrapper: React.FC = () => {
	const navigate = useNavigate();
	const { modelid = "" } = useParams<{ modelid: string }>();
	const [searchParams] = useSearchParams();
	const conversionId = searchParams.get("conversionId") ?? undefined;

	const normalizerModal = useNormalizerModal();
	const sqlGeneratorModal = useSqlGeneratorModal();
	const queryExpressionModal = useQueryExpressionModal();
	const conversionAttributeModal = useConversionAttributeModal();
	const conversionOptionModal = useConversionOptionModal();
	const setEditor = usePreventExit();

	const handleLoadModel = React.useCallback(
		async (id: string) => getModel(id),
		[],
	);
	const handleSaveModel = React.useCallback(async (model: any) => {
		await updateModel(model);
	}, []);

	const handleNavigateToWorkspace = React.useCallback(
		() => navigate("/"),
		[navigate],
	);

	const handleGenerateSQL = React.useCallback(
		(tablesMap: Map<string, any>, views: any[]) => {
			const sql = generateSql(tablesMap, views);
			sqlGeneratorModal.open(sql).catch(() => {});
		},
		[sqlGeneratorModal],
	);

	const handleOpenQueryExpression = React.useCallback(
		(tables: any[], queryConditions: any) => {
			return queryExpressionModal.open(tables, queryConditions);
		},
		[queryExpressionModal],
	);

	const handleConversionConsumed = React.useCallback(
		(consumedModelId: string) => {
			window.history.replaceState(null, "", `/logic/${consumedModelId}`);
		},
		[],
	);
	const editorRef = React.useRef<any>(null);

	const handleEditorReady = React.useCallback(
		(editor: any) => {
			editorRef.current = editor;
			setEditor(editor);
		},
		[setEditor],
	);

	const handleNormalize = React.useCallback(() => {
		const editor = editorRef.current;

		if (!editor) {
			return;
		}

		const tables = editor.buildNormalizationTables();

		normalizerModal
			.open(tables)
			.then((normalizedTables) => {
				editor.replaceTablesFromJson(normalizedTables);
			})
			.catch(() => {});
	}, [normalizerModal]);

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
			onEditorReady={handleEditorReady}
			onOpenQueryExpression={handleOpenQueryExpression}
			onConversionConsumed={handleConversionConsumed}
			onNormalize={handleNormalize}
		/>
	);
};

export default LogicPageWrapper;
