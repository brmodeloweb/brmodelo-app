import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import LogicSidebar from "./LogicSidebar";

jest.mock("react-i18next", () => ({
	useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock("../../conceptual/sidebar/EmptyStateForm", () => {
	return function MockEmptyState() { return <div data-testid="empty-state">Empty</div>; };
});

jest.mock("../../conceptual/sidebar/NoteForm", () => {
	return function MockNoteForm({ text }: any) { return <div data-testid="note-form">{text}</div>; };
});

jest.mock("./TableForm", () => {
	return function MockTableForm() { return <div data-testid="table-form">Table</div>; };
});

jest.mock("./ViewForm", () => {
	return function MockViewForm() { return <div data-testid="view-form">View</div>; };
});

jest.mock("./LinkCardinalityForm", () => {
	return function MockLinkCardinalityForm() { return <div data-testid="link-form">Link</div>; };
});

describe("LogicSidebar", () => {
	const defaultProps = {
		selectedElement: { value: "", type: "blank", element: null, tables: [], relatedViews: [] },
		onUpdate: jest.fn(),
		showFeedback: jest.fn(),
		visible: true,
		onToggleVisible: jest.fn(),
		onClearSelection: jest.fn(),
		onOpenQueryExpression: jest.fn().mockResolvedValue(undefined),
	};

	beforeEach(() => jest.clearAllMocks());

	test("renders empty state when no element selected", () => {
		render(<LogicSidebar {...defaultProps} />);
		expect(screen.getByTestId("empty-state")).toBeInTheDocument();
	});

	test("renders NoteForm when Note is selected", () => {
		const props = {
			...defaultProps,
			selectedElement: {
				value: "My note text",
				type: "custom.Note",
				element: { model: { id: "note1" } },
				tables: [],
				relatedViews: [],
			},
		};
		render(<LogicSidebar {...props} />);
		expect(screen.getByTestId("note-form")).toBeInTheDocument();
	});

	test("renders TableForm when Table is selected", () => {
		const props = {
			...defaultProps,
			selectedElement: {
				value: "TestTable",
				type: "logic.Table",
				element: { model: { id: "table1", attributes: { name: "TestTable", rows: [] } } },
				tables: [],
				relatedViews: [],
			},
		};
		render(<LogicSidebar {...props} />);
		expect(screen.getByTestId("table-form")).toBeInTheDocument();
	});

	test("renders ViewForm when Abstract/View is selected", () => {
		const props = {
			...defaultProps,
			selectedElement: {
				value: "TestView",
				type: "uml.Abstract",
				element: { model: { id: "view1", attributes: { name: "TestView" } } },
				tables: [],
				relatedViews: [],
			},
		};
		render(<LogicSidebar {...props} />);
		expect(screen.getByTestId("view-form")).toBeInTheDocument();
	});

	test("renders LinkCardinalityForm when Link is selected", () => {
		const props = {
			...defaultProps,
			selectedElement: {
				value: "",
				type: "Link",
				element: { model: { id: "link1", attributes: { labels: [] } } },
				tables: [],
				relatedViews: [],
			},
		};
		render(<LogicSidebar {...props} />);
		expect(screen.getByTestId("link-form")).toBeInTheDocument();
	});

	test("renders empty state when not visible", () => {
		const props = {
			...defaultProps,
			visible: false,
			selectedElement: {
				value: "TestTable",
				type: "logic.Table",
				element: { model: { id: "table1", attributes: { name: "TestTable", rows: [] } } },
				tables: [],
				relatedViews: [],
			},
		};
		render(<LogicSidebar {...props} />);
		expect(screen.getByTestId("empty-state")).toBeInTheDocument();
	});

	test("calls onToggleVisible when toggle button is clicked", () => {
		render(<LogicSidebar {...defaultProps} />);
		fireEvent.click(screen.getByRole("button", { name: "Toggle sidebar" }));
		expect(defaultProps.onToggleVisible).toHaveBeenCalled();
	});
});
