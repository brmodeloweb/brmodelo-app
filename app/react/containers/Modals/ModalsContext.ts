import { createContext } from "react";

export interface ModalHandlers<R> {
	onSuccess: (result: R) => void;
	onCancel: () => void;
	onError: (error: unknown) => void;
}

export type ModalRenderFn<R> = (handlers: ModalHandlers<R>) => React.ReactNode;

export interface ModalsContextValue {
	open: <R>(render: ModalRenderFn<R>) => Promise<R>;
}

export const ModalsContext = createContext<ModalsContextValue | null>(null);
