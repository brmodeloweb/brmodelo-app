import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import NoteForm from "./NoteForm";

jest.mock("react-i18next", () => ({
	useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock("../../../components/ElementColorPicker", () => ({
	__esModule: true,
	default: function MockColorPicker({ onColorChange }: any) {
		return <button data-testid="color-picker" onClick={() => onColorChange("#ff0000")}>Color</button>;
	},
	getCurrentColor: () => null,
}));

describe("NoteForm", () => {
	const defaultProps = {
		text: "Test note content",
		cellView: { setText: jest.fn(), model: { setColor: jest.fn() } },
	};

	beforeEach(() => jest.clearAllMocks());

	test("renders textarea with initial text", () => {
		render(<NoteForm {...defaultProps} />);
		expect(screen.getByLabelText("Note")).toHaveValue("Test note content");
	});

	test("calls cellView.setText on text change", () => {
		render(<NoteForm {...defaultProps} />);
		fireEvent.change(screen.getByLabelText("Note"), { target: { value: "Updated note" } });
		expect(defaultProps.cellView.setText).toHaveBeenCalledWith("Updated note");
	});

	test("calls cellView.model.setColor on color change", () => {
		render(<NoteForm {...defaultProps} />);
		fireEvent.click(screen.getByTestId("color-picker"));
		expect(defaultProps.cellView.model.setColor).toHaveBeenCalledWith("#ff0000");
	});

	test("syncs text when prop changes", () => {
		const { rerender } = render(<NoteForm {...defaultProps} />);
		rerender(<NoteForm {...defaultProps} text="New note text" />);
		expect(screen.getByLabelText("Note")).toHaveValue("New note text");
	});

	test("handles missing cellView methods gracefully", () => {
		render(<NoteForm text="Test" cellView={{}} />);
		expect(() => {
			fireEvent.change(screen.getByLabelText("Note"), { target: { value: "New" } });
		}).not.toThrow();
	});
});
