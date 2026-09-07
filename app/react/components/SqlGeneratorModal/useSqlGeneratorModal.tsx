import React, { useContext } from "react";
import { ModalsContext } from "../../containers/Modals";
import SqlGeneratorModal from "./SqlGeneratorModal";

export function useSqlGeneratorModal() {
	const context = useContext(ModalsContext);
	if (!context) {
		throw new Error("useSqlGeneratorModal must be used within a ModalsProvider");
	}
	return {
		open: (sql: string) =>
			context.open<void>(({ onSuccess, onCancel, onError }) => (
				<SqlGeneratorModal
					open
					sql={sql}
					onSuccess={() => onSuccess()}
					onCancel={() => onSuccess()}
					onError={onError}
				/>
			)),
	};
}
