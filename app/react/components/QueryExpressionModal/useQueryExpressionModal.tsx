import React, { useContext } from "react";
import { ModalsContext } from "../../containers/Modals";
import QueryExpressionModal, {
	QueryConditions,
	QueryExpressionResult,
	Table,
} from "./QueryExpressionModal";

export function useQueryExpressionModal() {
	const context = useContext(ModalsContext);
	if (!context) {
		throw new Error("useQueryExpressionModal must be used within a ModalsProvider");
	}
	return {
		open: (tables: Table[], queryConditions?: QueryConditions) =>
			context.open<QueryExpressionResult>(({ onSuccess, onCancel, onError }) => (
				<QueryExpressionModal
					open
					tables={tables}
					queryConditions={queryConditions}
					onSuccess={onSuccess}
					onCancel={onCancel}
					onError={onError}
				/>
			)),
	};
}
