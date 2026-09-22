import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import WorkspacePage from "./WorkspacePage";
import { DropdownIcon, DropdownOption } from "../../components/DropdownIcon";
import { useFeedback } from "../../components/Feedback";
import { getAllModels } from "../../services/modelStore";
import { downloadModelFile, importModelFromFile, InvalidModelFileError } from "../../services/modelFileIO";
import { Model } from "../../services/types/model";
import { useDeleteModelModal } from "../../components/DeleteModelModal";
import { useRenameModelModal } from "../../components/RenameModelModal";
import { useCreateModelModal } from "../../components/CreateModelModal";

const LANGUAGE_OPTIONS: DropdownOption[] = [
	{ name: "Português (Brasil)", type: "lang:pt-BR" },
	{ name: "English", type: "lang:en" },
];

const WorkspacePageWrapper: React.FC = () => {
	const navigate = useNavigate();
	const deleteModelModal = useDeleteModelModal();
	const renameModelModal = useRenameModelModal();
	const createModelModal = useCreateModelModal();
	const { i18n, t } = useTranslation(["common"]);
	const importInputRef = useRef<HTMLInputElement>(null);

	const [loading, setLoading] = useState(false);
	const [models, setModels] = useState<Model[]>([]);
	const { feedback, showFeedback, hideFeedback } = useFeedback();

	useEffect(() => {
		setLoading(true);
		getAllModels()
			.then((data) => {
				setModels(data);
				setLoading(false);
			})
			.catch((error: unknown) => {
				console.error("Failed to load models:", error);
				setLoading(false);
				showFeedback("Failed to load models. Please try again.", true, "error");
			});
	}, [showFeedback]);

	const handleOpenModel = (model: Model) => {
		navigate(`/${model.type}/${model._id}`);
	};

	const handleNewModel = () => {
		createModelModal.open().then((result) => {
			setModels((prev) => [...prev, result.model]);
			showFeedback("Successfully created!", true, "success");
			handleOpenModel(result.model);
		}).catch((reason) => {
			if ((reason as any)?.reason === "cancel") return;
			showFeedback("Failed to create model. Please try again.", true, "error");
		});
	};

	const handleImportModel = () => {
		importInputRef.current?.click();
	};

	const handleImportFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		event.target.value = "";
		if (!file) return;

		setLoading(true);
		try {
			const model = await importModelFromFile(file);
			setModels((prev) => [...prev, model]);
			showFeedback(t("Model imported successfully"), true, "success");
		} catch (error) {
			console.error("Failed to import model:", error);
			const message = error instanceof InvalidModelFileError
				? t("Invalid model file")
				: t("Failed to import model");
			showFeedback(message, true, "error");
		} finally {
			setLoading(false);
		}
	};

	const handleExportModel = (model: Model) => {
		try {
			downloadModelFile(model);
			showFeedback(t("Model exported successfully"), true, "success");
		} catch (error) {
			console.error("Failed to export model:", error);
			showFeedback(t("Failed to export model"), true, "error");
		}
	};

	const handleRenameModel = (model: Model) => {
		renameModelModal.open(model._id, model.name).then((result) => {
			setModels((prev) => prev.map((m) =>
				m._id === result.modelId ? { ...m, name: result.newName } : m,
			));
			showFeedback("Successfully renamed!", true, "success");
		}).catch((reason) => {
			if ((reason as any)?.reason === "cancel") return;
			showFeedback("Failed to rename model. Please try again.", true, "error");
		});
	};

	const handleDeleteModel = (model: Model) => {
		deleteModelModal.open(model._id).then((result) => {
			setModels((prev) => prev.filter((m) => m._id !== result.modelId));
			showFeedback("Successfully deleted!", true, "success");
		}).catch((reason) => {
			if ((reason as any)?.reason === "cancel") return;
			showFeedback("Failed to delete model. Please try again.", true, "error");
		});
	};

	const handleMenuOptionSelected = (option: DropdownOption) => {
		if (option.type.startsWith("lang:")) {
			i18n.changeLanguage(option.type.slice("lang:".length));
		}
	};

	return (
		<>
			<input
				ref={importInputRef}
				type="file"
				accept=".json,.brmw.json,application/json"
				style={{ display: "none" }}
				onChange={handleImportFileChange}
			/>
			<WorkspacePage
				models={models}
				loading={loading}
				feedback={feedback}
				onCloseFeedback={hideFeedback}
				dropdownOptions={LANGUAGE_OPTIONS}
				onOpenModel={handleOpenModel}
				onNewModel={handleNewModel}
				onImportModel={handleImportModel}
				onExportModel={handleExportModel}
				onRenameModel={handleRenameModel}
				onDeleteModel={handleDeleteModel}
				onMenuOptionSelected={handleMenuOptionSelected}
				DropdownIconComponent={DropdownIcon}
			/>
		</>
	);
};

export default WorkspacePageWrapper;
