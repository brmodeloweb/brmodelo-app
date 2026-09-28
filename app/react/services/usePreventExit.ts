import { useCallback, useEffect, useRef } from "react";
import { useBlocker } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useConfirmationModal } from "../components/ConfirmationModal";

interface DirtyTrackable {
	dirty: boolean;
}

export function usePreventExit() {
	const editorRef = useRef<DirtyTrackable | null>(null);
	const { confirm } = useConfirmationModal();
	const { t } = useTranslation(["common"]);

	const blocker = useBlocker(({ currentLocation, nextLocation }) =>
		!!editorRef.current?.dirty && currentLocation.pathname !== nextLocation.pathname,
	);

	useEffect(() => {
		if (blocker.state !== "blocked") return;
		confirm({
			title: t("Unsaved changes"),
			content: t("You have unsaved changes. Are you sure you want to exit without saving?"),
			confirmLabel: t("Exit without saving"),
		})
			.then(() => blocker.proceed?.())
			.catch(() => blocker.reset?.());
	}, [blocker, confirm, t]);

	useEffect(() => {
		const handler = (event: BeforeUnloadEvent) => {
			if (editorRef.current?.dirty) {
				event.preventDefault();
				event.returnValue = "";
			}
		};
		window.addEventListener("beforeunload", handler);
		return () => window.removeEventListener("beforeunload", handler);
	}, []);

	return useCallback((editor: DirtyTrackable | null) => {
		editorRef.current = editor;
	}, []);
}
