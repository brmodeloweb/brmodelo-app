import React from "react";
import { FeedbackType } from "./Feedback";

interface InlineFeedbackProps {
	message: string;
	showing: boolean;
	type: FeedbackType;
}

const ALERT_CLASS: Record<FeedbackType, string> = {
	success: "alert-success",
	error: "alert-danger",
	warning: "alert-warning",
};

const InlineFeedback: React.FC<InlineFeedbackProps> = ({ message, showing, type }) => (
	<aside className={`feedback-inline ${showing ? "" : "hide"}`}>
		<div className={`alert ${ALERT_CLASS[type]}`} role="alert">
			<p>{message}</p>
		</div>
	</aside>
);

export default InlineFeedback;
