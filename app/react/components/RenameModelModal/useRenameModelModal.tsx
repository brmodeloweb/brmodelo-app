import React, { useContext } from "react";
import { ModalsContext } from "../../containers/Modals";
import RenameModelModal, { RenameModelResult } from "./RenameModelModal";

interface RenameModelModalOptions {
	cancelable?: boolean;
}

export function useRenameModelModal() {
	const context = useContext(ModalsContext);
	if (!context) {
		throw new Error("useRenameModelModal must be used within a ModalsProvider");
	}
	return {
		open: (
			modelId: string,
			currentName: string,
			options: RenameModelModalOptions = {},
		) =>
			context.open<RenameModelResult>(({ onSuccess, onCancel, onError }) => (
				<RenameModelModal
					open
					modelId={modelId}
					currentName={currentName}
					cancelable={options.cancelable ?? true}
					onSuccess={onSuccess}
					onCancel={onCancel}
					onError={onError}
				/>
			)),
	};
}
