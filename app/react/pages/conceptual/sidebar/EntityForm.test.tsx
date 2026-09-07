import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import EntityForm from "./EntityForm";

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
				<option value={selected.type}>{selected.name}</option>
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

describe("EntityForm", () => {
	const defaultProps = {
		name: "TestEntity",
		cellView: { model: { setColor: jest.fn() } },
		onUpdate: jest.fn(),
	};

	beforeEach(() => jest.clearAllMocks());

	test("renders name input with initial value", () => {
		render(<EntityForm {...defaultProps} />);
		expect(screen.getByLabelText("Name")).toHaveValue("TestEntity");
	});

	test("calls onUpdate on name change", () => {
		render(<EntityForm {...defaultProps} />);
		fireEvent.change(screen.getByLabelText("Name"), { target: { value: "NewName" } });
		expect(defaultProps.onUpdate).toHaveBeenCalledWith({ type: "name", value: "NewName" });
	});

	test("does not call onUpdate for empty name", () => {
		render(<EntityForm {...defaultProps} />);
		fireEvent.change(screen.getByLabelText("Name"), { target: { value: "" } });
		expect(defaultProps.onUpdate).not.toHaveBeenCalled();
	});

	test("shows placeholder before selection", () => {
		render(<EntityForm {...defaultProps} />);
		expect(screen.getByTestId("dropdown")).toHaveValue("empty");
	});

	test("calls onUpdate with extention event on specialize and updates selected value", () => {
		render(<EntityForm {...defaultProps} />);
		fireEvent.change(screen.getByTestId("dropdown"), { target: { value: "(t, d)" } });
		expect(defaultProps.onUpdate).toHaveBeenCalledWith({ type: "extention", value: "(t, d)" });
		expect(screen.getByTestId("dropdown")).toHaveValue("(t, d)");
	});

	test("calls onUpdate with addAutoRelationship on self relationship button", () => {
		render(<EntityForm {...defaultProps} />);
		fireEvent.click(screen.getByText("Add"));
		expect(defaultProps.onUpdate).toHaveBeenCalledWith({ type: "addAutoRelationship" });
	});

	test("calls cellView.model.setColor on color change", () => {
		render(<EntityForm {...defaultProps} />);
		fireEvent.click(screen.getByTestId("color-picker"));
		expect(defaultProps.cellView.model.setColor).toHaveBeenCalledWith("#ff0000");
	});

	test("syncs name when prop changes", () => {
		const { rerender } = render(<EntityForm {...defaultProps} />);
		rerender(<EntityForm {...defaultProps} name="UpdatedName" />);
		expect(screen.getByLabelText("Name")).toHaveValue("UpdatedName");
	});
});
