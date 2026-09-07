import React from "react";
import { useTranslation } from "react-i18next";
import EmptyStateForm from "../../conceptual/sidebar/EmptyStateForm";
import NoteForm from "../../conceptual/sidebar/NoteForm";
import CollectionForm from "./CollectionForm";
import type { CollectionOption, NoSqlUpdateEvent } from "../INoSqlEditor";

interface SelectedElement {
	value: any;
	type: string;
	element: any;
}

interface NoSqlSidebarProps {
	selectedElement: SelectedElement;
	onUpdate: (event: NoSqlUpdateEvent) => void;
	showFeedback: (message: string, showing: boolean, type?: "success" | "error" | "warning") => void;
	visible: boolean;
	onToggleVisible: () => void;
	focusedRowPath?: number[] | null;
	onFocusedRowConsumed?: () => void;
	collections?: CollectionOption[];
}

const NoSqlSidebar: React.FC<NoSqlSidebarProps> = React.memo(({
	selectedElement,
	onUpdate,
	showFeedback,
	visible,
	onToggleVisible,
	focusedRowPath,
	onFocusedRowConsumed,
	collections,
}) => {
	const { value, element } = selectedElement;

	const renderForm = () => {
		switch (selectedElement.type) {
			case "custom.Note":
				return (
					<NoteForm
						key={element?.model?.id}
						text={value}
						cellView={element}
					/>
				);
			case "nosql.Collection":
				return (
					<CollectionForm
						key={element?.model?.id}
						element={element}
						onUpdate={onUpdate}
						showFeedback={showFeedback}
						focusedRowPath={focusedRowPath}
						onFocusedRowConsumed={onFocusedRowConsumed}
						collections={collections}
					/>
				);
			default:
				return <EmptyStateForm />;
		}
	};

	return (
		<aside className={`panelProperties floatingPanel${visible ? " open" : ""}`}>
			<button className="toggle-visibility" onClick={onToggleVisible} aria-label="Toggle sidebar">
				<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none">
					<path
						fill="#fff"
						fillRule="evenodd"
						d="M4.558 14.817c.244.244.64.244.884 0L10 10.259l4.558 4.558a.625.625 0 1 0 .884-.884l-5-5a.625.625 0 0 0-.884 0l-5 5a.625.625 0 0 0 0 .884ZM3 6.5a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 0-1h-13a.5.5 0 0 0-.5.5Z"
						clipRule="evenodd"
					/>
				</svg>
			</button>

			<div className="properties-content">
				{selectedElement.type !== "blank" && visible ? renderForm() : <EmptyStateForm />}
			</div>
		</aside>
	);
});

NoSqlSidebar.displayName = "NoSqlSidebar";

export default NoSqlSidebar;
