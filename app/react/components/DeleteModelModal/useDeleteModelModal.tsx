import React, { useContext } from "react";
import { ModalsContext } from "../../containers/Modals";
import DeleteModelModal, { DeleteModelResult } from "./DeleteModelModal";

interface DeleteModelModalOptions {
	cancelable?: boolean;
}

export function useDeleteModelModal() {
	const context = useContext(ModalsContext);
	if (!context) {
		throw new Error("useDeleteModelModal must be used within a ModalsProvider");
	}
	return {
		open: (modelId: string, options: DeleteModelModalOptions = {}) =>
			context.open<DeleteModelResult>(({ onSuccess, onCancel, onError }) => (
				<DeleteModelModal
					open
					modelId={modelId}
					cancelable={options.cancelable ?? true}
					onSuccess={onSuccess}
					onCancel={onCancel}
					onError={onError}
				/>
			)),
	};
}
