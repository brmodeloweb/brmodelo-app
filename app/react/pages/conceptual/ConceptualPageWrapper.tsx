import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import ConceptualPage from "./ConceptualPage";
import Validator from "./validator";
import { getModel, updateModel, saveModel } from "../../services/modelStore";
import { usePreventExit } from "../../services/usePreventExit";
import { useConversionModal } from "../../components/ConversionModal";

const ConceptualPageWrapper: React.FC = () => {
	const navigate = useNavigate();
	const { modelid = "" } = useParams<{ modelid: string }>();

	const conversionModal = useConversionModal();
	const setEditor = usePreventExit();
	const { t } = useTranslation(["common"]);
	const validatorRef = React.useRef(new Validator());

	const handleLoadModel = React.useCallback(async (id: string) => getModel(id), []);
	const handleSaveModel = React.useCallback(async (model: any) => { await updateModel(model); }, []);

	const handleNavigateToWorkspace = React.useCallback(() => navigate("/"), [navigate]);

	const handleConvert = React.useCallback(async (model: any, editor: any) => {
		const validator = validatorRef.current;
		const validationResult = validator.validateConversion(editor.graph);

		if (!validationResult.valid) {
			await conversionModal.showErrors(validationResult.errors);
			return;
		}

		let result;
		try {
			result = await conversionModal.selectTarget([
				{ value: "logic", label: "Logic model" },
				{ value: "nosql", label: "NoSQL" },
			]);
		} catch {
			return;
		}

		if (editor.dirty) {
			const modelToSave = { ...model, model: JSON.stringify(editor.graph) };
			await updateModel(modelToSave);
			editor.setDirty(false);
		}

		const newModel = {
			name: t("MODEL_NAME_converted", { name: model.name }),
			type: result.target,
			model: '{"cells":[]}',
		};
		const savedModel = await saveModel(newModel);
		window.open(
			`/${result.target}/${savedModel._id}?conversionId=${model._id}`,
			"_blank",
		);
	}, [conversionModal, t]);

	return (
		<ConceptualPage
			modelId={modelid}
			onLoadModel={handleLoadModel}
			onSaveModel={handleSaveModel}
			onNavigateToWorkspace={handleNavigateToWorkspace}
			onConvert={handleConvert}
			onEditorReady={setEditor}
		/>
	);
};

export default ConceptualPageWrapper;
