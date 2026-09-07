import React, { useContext, useMemo } from "react";
import { ModalsContext } from "../../containers/Modals";
import ConversionAttributeModal, { ConversionAttributeResult } from "./ConversionAttributeModal";

export interface ConversionAttributeService {
	open: (attributeName: string, tableName: string) => Promise<ConversionAttributeResult>;
}

export function useConversionAttributeModal(): ConversionAttributeService {
	const context = useContext(ModalsContext);
	if (!context) {
		throw new Error("useConversionAttributeModal must be used within a ModalsProvider");
	}

	return useMemo<ConversionAttributeService>(
		() => ({
			open: (attributeName, tableName) =>
				context.open<ConversionAttributeResult>(({ onSuccess, onCancel, onError }) => (
					<ConversionAttributeModal
						open
						attributeName={attributeName}
						tableName={tableName}
						onSuccess={onSuccess}
						onCancel={onCancel}
						onError={onError}
					/>
				)),
		}),
		[context],
	);
}
