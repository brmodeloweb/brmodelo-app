import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import AttributeForm from "./AttributeForm";

jest.mock("react-i18next", () => ({
	useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock("../../../components/Dropdown", () => {
	return function MockDropdown({ onSelect, selected, options }: any) {
		return (
			<select
				data-testid="dropdown"
				value={selected.type}
				onChange={(e) => {
					const option = options.find((o: any) => o.type === e.target.value);
					if (option) onSelect(option);
				}}
			>
				{options.map((o: any) => (
					<option key={o.type} value={o.type}>{o.name}</option>
				))}
			</select>
		);
	};
});

jest.mock("../../../components/ElementColorPicker", () => ({
	__esModule: true,
	default: function MockColorPicker({ onColorChange }: any) {
		return <button data-testid="color-picker" onClick={() => onColorChange("#ff0000")}>Color</button>;
	},
	getCurrentColor: () => null,
}));

describe("AttributeForm", () => {
	const defaultProps = {
		name: "TestAttr",
		cardinality: "(1, 1)",
		composed: false,
		cellView: { model: { setColor: jest.fn() } },
		onUpdate: jest.fn(),
	};

	beforeEach(() => jest.clearAllMocks());

	test("renders name input with initial value", () => {
		render(<AttributeForm {...defaultProps} />);
		expect(screen.getByLabelText("Name")).toHaveValue("TestAttr");
	});

	test("calls onUpdate with attribute.name on name change", () => {
		render(<AttributeForm {...defaultProps} />);
		fireEvent.change(screen.getByLabelText("Name"), { target: { value: "NewAttr" } });
		expect(defaultProps.onUpdate).toHaveBeenCalledWith({ type: "attribute.name", value: "NewAttr" });
	});

	test("calls onUpdate with attribute.cardinality on dropdown change", () => {
		render(<AttributeForm {...defaultProps} />);
		fireEvent.change(screen.getByTestId("dropdown"), { target: { value: "(0, n)" } });
		expect(defaultProps.onUpdate).toHaveBeenCalledWith({ type: "attribute.cardinality", value: "(0, n)" });
	});

	test("renders composed checkbox unchecked by default", () => {
		render(<AttributeForm {...defaultProps} />);
		expect(screen.getByLabelText("Composed")).not.toBeChecked();
	});

	test("calls onUpdate with attribute.composed on checkbox toggle", () => {
		render(<AttributeForm {...defaultProps} />);
		fireEvent.click(screen.getByLabelText("Composed"));
		expect(defaultProps.onUpdate).toHaveBeenCalledWith({ type: "attribute.composed", value: true });
	});

	test("renders composed checkbox checked when prop is true", () => {
		render(<AttributeForm {...defaultProps} composed={true} />);
		expect(screen.getByLabelText("Composed")).toBeChecked();
	});

	test("syncs cardinality when prop changes", () => {
		const { rerender } = render(<AttributeForm {...defaultProps} />);
		rerender(<AttributeForm {...defaultProps} cardinality="(0, n)" />);
		expect(screen.getByTestId("dropdown")).toHaveValue("(0, n)");
	});
});
