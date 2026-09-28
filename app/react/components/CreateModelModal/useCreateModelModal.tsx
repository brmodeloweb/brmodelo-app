import React, { useContext } from "react";
import { ModalsContext } from "../../containers/Modals";
import CreateModelModal, { CreateModelResult } from "./CreateModelModal";

interface CreateModelModalOptions {
	cancelable?: boolean;
}

export function useCreateModelModal() {
	const context = useContext(ModalsContext);
	if (!context) {
		throw new Error("useCreateModelModal must be used within a ModalsProvider");
	}
	return {
		open: (options: CreateModelModalOptions = {}) =>
			context.open<CreateModelResult>(({ onSuccess, onCancel, onError }) => (
				<CreateModelModal
					open
					cancelable={options.cancelable ?? true}
					onSuccess={onSuccess}
					onCancel={onCancel}
					onError={onError}
				/>
			)),
	};
}
