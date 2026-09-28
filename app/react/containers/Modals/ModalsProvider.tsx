import React, { useCallback, useMemo, useState } from "react";
import { ModalsContext, ModalsContextValue, ModalRenderFn } from "./ModalsContext";

interface ModalsProviderProps {
	children: React.ReactNode;
}

export const CANCELLED = { reason: "cancel" as const };

const ModalsProvider: React.FC<ModalsProviderProps> = ({ children }) => {
	const [active, setActive] = useState<React.ReactNode>(null);

	const open = useCallback(
		<R,>(render: ModalRenderFn<R>) =>
			new Promise<R>((resolve, reject) => {
				const close = () => setActive(null);
				setActive(
					render({
						onSuccess: (result) => {
							resolve(result);
							close();
						},
						onCancel: () => {
							reject(CANCELLED);
							close();
						},
						onError: (error) => {
							reject(error);
							close();
						},
					}),
				);
			}),
		[],
	);

	const value = useMemo<ModalsContextValue>(() => ({ open }), [open]);

	return (
		<ModalsContext.Provider value={value}>
			{children}
			{active}
		</ModalsContext.Provider>
	);
};

export default ModalsProvider;
