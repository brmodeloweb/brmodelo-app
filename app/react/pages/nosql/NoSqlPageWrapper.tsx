import React from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import NoSqlPage from "./NoSqlPage";
import { getModel, updateModel } from "../../services/modelStore";
import { useNosqlConversionOptionModal } from "../../components/ConversionOptionModal";
import { usePreventExit } from "../../services/usePreventExit";

const NoSqlPageWrapper: React.FC = () => {
	const navigate = useNavigate();
	const { modelid = "" } = useParams<{ modelid: string }>();
	const [searchParams] = useSearchParams();
	const conversionId = searchParams.get("conversionId") ?? "";

	const nosqlConversionOptionModal = useNosqlConversionOptionModal();
	const setEditor = usePreventExit();

	const handleLoadModel = React.useCallback(async (id: string) => getModel(id), []);
	const handleSaveModel = React.useCallback(async (model: any) => { await updateModel(model); }, []);

	const handleNavigateToWorkspace = React.useCallback(() => navigate("/"), [navigate]);

	const handleConversionConsumed = React.useCallback((consumedModelId: string) => {
		window.history.replaceState(null, "", `/nosql/${consumedModelId}`);
	}, []);

	return (
		<NoSqlPage
			modelId={modelid}
			conversionId={conversionId}
			conversionOptionModalService={nosqlConversionOptionModal}
			onLoadModel={handleLoadModel}
			onSaveModel={handleSaveModel}
			onNavigateToWorkspace={handleNavigateToWorkspace}
			onEditorReady={setEditor}
			onConversionConsumed={handleConversionConsumed}
		/>
	);
};

export default NoSqlPageWrapper;
