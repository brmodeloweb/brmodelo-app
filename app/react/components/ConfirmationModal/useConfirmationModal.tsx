import React, { useContext } from "react";
import { ModalsContext } from "../../containers/Modals";
import ConfirmationModal from "./ConfirmationModal";

export interface ConfirmOptions {
	title: string;
	content: React.ReactNode;
	cancelLabel?: string;
	confirmLabel?: string;
	cancelable?: boolean;
}

export function useConfirmationModal() {
	const context = useContext(ModalsContext);
	if (!context) {
		throw new Error("useConfirmationModal must be used within a ModalsProvider");
	}
	return {
		confirm: (options: ConfirmOptions) =>
			context.open<void>(({ onSuccess, onCancel, onError }) => (
				<ConfirmationModal
					open
					title={options.title}
					content={options.content}
					cancelLabel={options.cancelLabel}
					confirmLabel={options.confirmLabel}
					cancelable={options.cancelable ?? true}
					onSuccess={() => onSuccess()}
					onCancel={onCancel}
					onError={onError}
				/>
			)),
	};
}
