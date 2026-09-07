import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import RelationshipForm from "./RelationshipForm";

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

describe("RelationshipForm", () => {
	const defaultProps = {
		name: "TestRelationship",
		cellView: { model: { setColor: jest.fn() } },
		onUpdate: jest.fn(),
	};

	beforeEach(() => jest.clearAllMocks());

	test("renders name input with initial value", () => {
		render(<RelationshipForm {...defaultProps} />);
		expect(screen.getByLabelText("Name")).toHaveValue("TestRelationship");
	});

	test("calls onUpdate on name change", () => {
		render(<RelationshipForm {...defaultProps} />);
		fireEvent.change(screen.getByLabelText("Name"), { target: { value: "NewRel" } });
		expect(defaultProps.onUpdate).toHaveBeenCalledWith({ type: "name", value: "NewRel" });
	});

	test("calls onUpdate with relationship.associative on transform", () => {
		render(<RelationshipForm {...defaultProps} />);
		fireEvent.click(screen.getByText("Transform"));
		expect(defaultProps.onUpdate).toHaveBeenCalledWith({ type: "relationship.associative" });
	});

	test("calls cellView.model.setColor on color change", () => {
		render(<RelationshipForm {...defaultProps} />);
		fireEvent.click(screen.getByTestId("color-picker"));
		expect(defaultProps.cellView.model.setColor).toHaveBeenCalledWith("#ff0000");
	});
});
