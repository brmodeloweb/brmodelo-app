import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ConceptualSidebar from "./ConceptualSidebar";

jest.mock("react-i18next", () => ({
	useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock("./EmptyStateForm", () => {
	return function MockEmptyState() {
		return <div data-testid="empty-state">Empty</div>;
	};
});

jest.mock("./EntityForm", () => {
	return function MockEntityForm() {
		return <div data-testid="entity-form">EntityForm</div>;
	};
});

jest.mock("./RelationshipForm", () => {
	return function MockRelationshipForm() {
		return <div data-testid="relationship-form">RelationshipForm</div>;
	};
});

jest.mock("./AttributeForm", () => {
	return function MockAttributeForm() {
		return <div data-testid="attribute-form">AttributeForm</div>;
	};
});

jest.mock("./KeyForm", () => {
	return function MockKeyForm() {
		return <div data-testid="key-form">KeyForm</div>;
	};
});

jest.mock("./LinkForm", () => {
	return function MockLinkForm() {
		return <div data-testid="link-form">LinkForm</div>;
	};
});

jest.mock("./ExtensionForm", () => {
	return function MockExtensionForm() {
		return <div data-testid="extension-form">ExtensionForm</div>;
	};
});

jest.mock("./NoteForm", () => {
	return function MockNoteForm() {
		return <div data-testid="note-form">NoteForm</div>;
	};
});

jest.mock("./BlockAssociativeForm", () => {
	return function MockBlockAssociativeForm() {
		return <div data-testid="block-associative-form">BlockAssociativeForm</div>;
	};
});

const mockElement = { model: { id: "test-id" } };

describe("ConceptualSidebar", () => {
	const defaultProps = {
		selectedElement: { value: "", type: "blank", element: null },
		onUpdate: jest.fn(),
		visible: true,
		onToggleVisible: jest.fn(),
	};

	test("renders empty state when type is blank", () => {
		render(<ConceptualSidebar {...defaultProps} />);
		expect(screen.getByTestId("empty-state")).toBeInTheDocument();
	});

	test("renders empty state when sidebar is not visible", () => {
		render(
			<ConceptualSidebar
				{...defaultProps}
				selectedElement={{ value: "Test", type: "Entity", element: mockElement }}
				visible={false}
			/>
		);
		expect(screen.getByTestId("empty-state")).toBeInTheDocument();
	});

	test("renders EntityForm for Entity type", () => {
		render(
			<ConceptualSidebar
				{...defaultProps}
				selectedElement={{ value: "TestEntity", type: "Entity", element: mockElement }}
			/>
		);
		expect(screen.getByTestId("entity-form")).toBeInTheDocument();
	});

	test("renders RelationshipForm for Relationship type", () => {
		render(
			<ConceptualSidebar
				{...defaultProps}
				selectedElement={{ value: "TestRel", type: "Relationship", element: mockElement }}
			/>
		);
		expect(screen.getByTestId("relationship-form")).toBeInTheDocument();
	});

	test("renders AttributeForm for Attribute type", () => {
		render(
			<ConceptualSidebar
				{...defaultProps}
				selectedElement={{
					value: { name: "attr", cardinality: "(1,1)", composed: false },
					type: "Attribute",
					element: mockElement,
				}}
			/>
		);
		expect(screen.getByTestId("attribute-form")).toBeInTheDocument();
	});

	test("renders KeyForm for Key type", () => {
		render(
			<ConceptualSidebar
				{...defaultProps}
				selectedElement={{ value: "key1", type: "Key", element: mockElement }}
			/>
		);
		expect(screen.getByTestId("key-form")).toBeInTheDocument();
	});

	test("renders LinkForm for Link type", () => {
		render(
			<ConceptualSidebar
				{...defaultProps}
				selectedElement={{
					value: { cardinality: "(1,1)", role: "", weak: false },
					type: "Link",
					element: mockElement,
				}}
			/>
		);
		expect(screen.getByTestId("link-form")).toBeInTheDocument();
	});

	test("renders ExtensionForm for Inheritance type", () => {
		render(
			<ConceptualSidebar
				{...defaultProps}
				selectedElement={{ value: "(t, d)", type: "Inheritance", element: mockElement }}
			/>
		);
		expect(screen.getByTestId("extension-form")).toBeInTheDocument();
	});

	test("renders NoteForm for Note type", () => {
		render(
			<ConceptualSidebar
				{...defaultProps}
				selectedElement={{ value: "note text", type: "Note", element: mockElement }}
			/>
		);
		expect(screen.getByTestId("note-form")).toBeInTheDocument();
	});

	test("renders BlockAssociativeForm for erd.BlockAssociative type", () => {
		render(
			<ConceptualSidebar
				{...defaultProps}
				selectedElement={{ value: "", type: "erd.BlockAssociative", element: mockElement }}
			/>
		);
		expect(screen.getByTestId("block-associative-form")).toBeInTheDocument();
	});

	test("has open class when visible", () => {
		const { container } = render(<ConceptualSidebar {...defaultProps} />);
		expect(container.querySelector(".panelProperties")).toHaveClass("open");
	});

	test("does not have open class when not visible", () => {
		const { container } = render(<ConceptualSidebar {...defaultProps} visible={false} />);
		expect(container.querySelector(".panelProperties")).not.toHaveClass("open");
	});

	test("calls onToggleVisible when toggle button is clicked", () => {
		render(<ConceptualSidebar {...defaultProps} />);
		fireEvent.click(screen.getByRole("button"));
		expect(defaultProps.onToggleVisible).toHaveBeenCalled();
	});
});
