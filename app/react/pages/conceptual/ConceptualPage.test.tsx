import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ConceptualPage from "./ConceptualPage";

jest.mock("react-i18next", () => ({
	useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock("./conceptualEditor", () => {
	return jest.fn().mockImplementation(() => ({
		loadModel: jest.fn(),
		destroy: jest.fn(),
		zoomIn: jest.fn(),
		zoomOut: jest.fn(),
		zoomNone: jest.fn(),
		undo: jest.fn(),
		redo: jest.fn(),
		print: jest.fn(),
		setGrid: jest.fn(),
		setGridSize: jest.fn(),
		setSnaplines: jest.fn(),
		setPageBreaks: jest.fn(),
		setDirty: jest.fn(),
		onUpdate: jest.fn(),
		dirty: false,
		graph: { cells: [] },
	}));
});

jest.mock("../../components/PanelTools", () => {
	return function MockPanelTools() {
		return <div data-testid="panel-tools">PanelTools</div>;
	};
});

jest.mock("../../components/Icons", () => ({
	ConceptualIcon: function MockIcon({ title }: any) {
		return <span data-testid="conceptual-icon">{title}</span>;
	},
}));

jest.mock("./sidebar/ConceptualSidebar", () => {
	return function MockSidebar({ selectedElement, visible }: any) {
		return (
			<div data-testid="sidebar" data-visible={visible} data-type={selectedElement.type}>
				Sidebar
			</div>
		);
	};
});

describe("ConceptualPage", () => {
	const defaultProps = {
		modelId: "model-123",
		onLoadModel: jest.fn().mockResolvedValue({
			_id: "model-123",
			name: "Test Model",
			type: "conceptual",
			updated: "2024-01-01T00:00:00Z",
			model: '{"cells":[]}',
		}),
		onSaveModel: jest.fn().mockResolvedValue(undefined),
		onNavigateToWorkspace: jest.fn(),
		onConvert: jest.fn(),
		onBeforeUnload: jest.fn().mockReturnValue(jest.fn()),
		onTransitionStart: jest.fn(),
		onCleanup: jest.fn().mockReturnValue(jest.fn()),
	};

	beforeEach(() => jest.clearAllMocks());

	test("renders header with model name after loading", async () => {
		render(<ConceptualPage {...defaultProps} />);
		await waitFor(() => {
			expect(screen.getByText("Test Model")).toBeInTheDocument();
		});
	});

	test("renders navigation back button", () => {
		render(<ConceptualPage {...defaultProps} />);
		expect(screen.getByLabelText("back to Model list")).toBeInTheDocument();
	});

	test("calls onNavigateToWorkspace when back button is clicked", () => {
		render(<ConceptualPage {...defaultProps} />);
		fireEvent.click(screen.getByLabelText("back to Model list"));
		expect(defaultProps.onNavigateToWorkspace).toHaveBeenCalled();
	});

	test("renders save button", () => {
		render(<ConceptualPage {...defaultProps} />);
		expect(screen.getByText("Save")).toBeInTheDocument();
	});

	test("renders sidebar component", () => {
		render(<ConceptualPage {...defaultProps} />);
		expect(screen.getByTestId("sidebar")).toBeInTheDocument();
	});

	test("renders panel tools", () => {
		render(<ConceptualPage {...defaultProps} />);
		expect(screen.getByTestId("panel-tools")).toBeInTheDocument();
	});

	test("renders shapePalette toggle with aria-label", () => {
		render(<ConceptualPage {...defaultProps} />);
		expect(screen.getByLabelText("Toggle elements panel")).toBeInTheDocument();
	});

	test("calls onLoadModel with modelId", async () => {
		render(<ConceptualPage {...defaultProps} />);
		await waitFor(() => {
			expect(defaultProps.onLoadModel).toHaveBeenCalledWith("model-123");
		});
	});

	test("navigates back to workspace when the model is not found", async () => {
		const error = { status: 404 };
		const props = { ...defaultProps, onLoadModel: jest.fn().mockRejectedValue(error) };
		render(<ConceptualPage {...props} />);
		await waitFor(() => {
			expect(props.onNavigateToWorkspace).toHaveBeenCalled();
		});
	});

	test("shows last saved date after loading", async () => {
		render(<ConceptualPage {...defaultProps} />);
		await waitFor(() => {
			expect(screen.getByText(/Last saved/)).toBeInTheDocument();
		});
	});

	test("does not load model when modelId is empty", async () => {
		render(<ConceptualPage {...defaultProps} modelId="" />);
		expect(defaultProps.onLoadModel).not.toHaveBeenCalled();
	});
});
