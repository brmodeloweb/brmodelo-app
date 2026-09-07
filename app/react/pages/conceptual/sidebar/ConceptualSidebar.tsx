import React from "react";
import EmptyStateForm from "./EmptyStateForm";
import EntityForm from "./EntityForm";
import RelationshipForm from "./RelationshipForm";
import AttributeForm from "./AttributeForm";
import KeyForm from "./KeyForm";
import LinkForm from "./LinkForm";
import ExtensionForm from "./ExtensionForm";
import NoteForm from "./NoteForm";
import BlockAssociativeForm from "./BlockAssociativeForm";

interface SelectedElement {
	value: any;
	type: string;
	element: any;
}

interface ConceptualSidebarProps {
	selectedElement: SelectedElement;
	onUpdate: (event: { type: string; value?: any }) => void;
	visible: boolean;
	onToggleVisible: () => void;
}

const ConceptualSidebar: React.FC<ConceptualSidebarProps> = React.memo(({
	selectedElement,
	onUpdate,
	visible,
	onToggleVisible,
}) => {
	const { value, element } = selectedElement;

	const renderForm = () => {
		switch (selectedElement.type) {
			case "Entity":
				return (
					<EntityForm
						key={element?.model?.id}
						name={value}
						cellView={element}
						onUpdate={onUpdate}
					/>
				);
			case "Relationship":
				return (
					<RelationshipForm
						key={element?.model?.id}
						name={value}
						cellView={element}
						onUpdate={onUpdate}
					/>
				);
			case "Attribute":
				return (
					<AttributeForm
						key={element?.model?.id}
						name={value.name}
						cardinality={value.cardinality}
						composed={value.composed}
						cellView={element}
						onUpdate={onUpdate}
					/>
				);
			case "Key":
				return (
					<KeyForm
						key={element?.model?.id}
						name={value}
						onUpdate={onUpdate}
					/>
				);
			case "Link":
				return (
					<LinkForm
						key={element?.model?.id}
						cardinality={value.cardinality}
						role={value.role}
						weak={value.weak}
						onUpdate={onUpdate}
					/>
				);
			case "Inheritance":
				return (
					<ExtensionForm
						key={element?.model?.id}
						extensionType={value}
						cellView={element}
						onUpdate={onUpdate}
					/>
				);
			case "Note":
				return (
					<NoteForm
						key={element?.model?.id}
						text={value}
						cellView={element}
					/>
				);
			case "erd.BlockAssociative":
				return (
					<BlockAssociativeForm
						key={element?.model?.id}
						cellView={element}
						onUpdate={onUpdate}
					/>
				);
			default:
				return <EmptyStateForm />;
		}
	};

	return (
		<aside className={`panelProperties floatingPanel${visible ? " open" : ""}`}>
			<button className="toggle-visibility" onClick={onToggleVisible}>
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

ConceptualSidebar.displayName = "ConceptualSidebar";

export default ConceptualSidebar;
