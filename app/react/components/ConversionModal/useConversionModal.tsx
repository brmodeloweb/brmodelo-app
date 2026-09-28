import React, { useContext } from "react";
import { ModalsContext } from "../../containers/Modals";
import ConversionModal, {
	ConversionModalResult,
	ConversionTarget,
	ValidationError,
} from "./ConversionModal";

export function useConversionModal() {
	const context = useContext(ModalsContext);
	if (!context) {
		throw new Error("useConversionModal must be used within a ModalsProvider");
	}
	return {
		showErrors: (errors: ValidationError[]) =>
			context.open<void>(({ onSuccess, onError }) => (
				<ConversionModal
					open
					mode="error"
					errors={errors}
					onSuccess={() => onSuccess()}
					onCancel={() => onSuccess()}
					onError={onError}
				/>
			)),
		selectTarget: (targets: ConversionTarget[]) =>
			context.open<ConversionModalResult>(({ onSuccess, onCancel, onError }) => (
				<ConversionModal
					open
					mode="target_selection"
					targets={targets}
					onSuccess={onSuccess}
					onCancel={onCancel}
					onError={onError}
				/>
			)),
	};
}
