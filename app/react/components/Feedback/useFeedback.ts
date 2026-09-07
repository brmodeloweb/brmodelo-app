import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FeedbackType } from "./Feedback";

interface FeedbackState {
	message: string;
	showing: boolean;
	type: FeedbackType;
}

const INITIAL_STATE: FeedbackState = { message: "", showing: false, type: "success" };

export const useFeedback = () => {
	const { t } = useTranslation(["common"]);
	const [feedback, setFeedback] = useState<FeedbackState>(INITIAL_STATE);

	const tRef = useRef(t);
	useEffect(() => {
		tRef.current = t;
	});

	const showFeedback = useCallback((message: string, showing: boolean, type: FeedbackType = "success") => {
		setFeedback({
			message: showing ? tRef.current(message) : "",
			showing,
			type,
		});
	}, []);

	const hideFeedback = useCallback(() => {
		setFeedback((prev) => ({ ...prev, message: "", showing: false }));
	}, []);

	return { feedback, showFeedback, hideFeedback };
};
