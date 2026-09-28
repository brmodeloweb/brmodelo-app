import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import KeyForm from "./KeyForm";

jest.mock("react-i18next", () => ({
	useTranslation: () => ({ t: (key: string) => key }),
}));

describe("KeyForm", () => {
	const defaultProps = {
		name: "TestKey",
		onUpdate: jest.fn(),
	};

	beforeEach(() => jest.clearAllMocks());

	test("renders name input with initial value", () => {
		render(<KeyForm {...defaultProps} />);
		expect(screen.getByLabelText("Name")).toHaveValue("TestKey");
	});

	test("calls onUpdate with name event on change", () => {
		render(<KeyForm {...defaultProps} />);
		fireEvent.change(screen.getByLabelText("Name"), { target: { value: "NewKey" } });
		expect(defaultProps.onUpdate).toHaveBeenCalledWith({ type: "name", value: "NewKey" });
	});

	test("does not call onUpdate for empty name", () => {
		render(<KeyForm {...defaultProps} />);
		fireEvent.change(screen.getByLabelText("Name"), { target: { value: "" } });
		expect(defaultProps.onUpdate).not.toHaveBeenCalled();
	});

	test("syncs name when prop changes", () => {
		const { rerender } = render(<KeyForm {...defaultProps} />);
		rerender(<KeyForm {...defaultProps} name="UpdatedKey" />);
		expect(screen.getByLabelText("Name")).toHaveValue("UpdatedKey");
	});
});
