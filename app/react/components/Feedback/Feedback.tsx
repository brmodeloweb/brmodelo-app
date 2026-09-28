import React, { useEffect } from "react";

export type FeedbackType = "success" | "error" | "warning";

interface FeedbackProps {
	message: string;
	showing: boolean;
	type: FeedbackType;
	onClose: () => void;
	autoDismissMs?: number;
}

const ALERT_CLASS: Record<FeedbackType, string> = {
	success: "alert-success",
	error: "alert-danger",
	warning: "alert-warning",
};

const DEFAULT_AUTO_DISMISS_MS = 5000;

const Feedback: React.FC<FeedbackProps> = ({
	message,
	showing,
	type,
	onClose,
	autoDismissMs = DEFAULT_AUTO_DISMISS_MS,
}) => {
	useEffect(() => {
		if (!showing || autoDismissMs <= 0) return;
		const timer = setTimeout(onClose, autoDismissMs);
		return () => clearTimeout(timer);
	}, [showing, autoDismissMs, onClose, message]);

	return (
		<aside className="feedback">
			<div className={`alert ${showing ? "" : "hide"} ${ALERT_CLASS[type]}`} role="alert">
				<p>{message}</p>
			</div>
		</aside>
	);
};

export default Feedback;
