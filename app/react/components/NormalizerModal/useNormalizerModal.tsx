import { useContext } from "react";

import { ModalsContext } from "../../containers/Modals";
import NormalizerModal from "./NormalizerModal";

export function useNormalizerModal() {
	const context = useContext(ModalsContext);

	if (!context) {
		throw new Error("useNormalizerModal must be used inside ModalsProvider");
	}

	return {
		open: (tables: any[]) =>
			context.open<any[]>(({ onSuccess, onCancel }) => (
				<NormalizerModal
					open
					tables={tables}
					onSuccess={onSuccess}
					onCancel={onCancel}
				/>
			)),
	};
}
