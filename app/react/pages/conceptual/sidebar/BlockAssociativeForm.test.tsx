import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import BlockAssociativeForm from "./BlockAssociativeForm";

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

describe("BlockAssociativeForm", () => {
	const defaultProps = {
		cellView: { model: { setColor: jest.fn() } },
		onUpdate: jest.fn(),
	};

	beforeEach(() => jest.clearAllMocks());

	test("shows placeholder before selection", () => {
		render(<BlockAssociativeForm {...defaultProps} />);
		expect(screen.getByTestId("dropdown")).toHaveValue("empty");
	});

	test("calls onUpdate with extention on specialize and updates selected value", () => {
		render(<BlockAssociativeForm {...defaultProps} />);
		fireEvent.change(screen.getByTestId("dropdown"), { target: { value: "(t, d)" } });
		expect(defaultProps.onUpdate).toHaveBeenCalledWith({ type: "extention", value: "(t, d)" });
		expect(screen.getByTestId("dropdown")).toHaveValue("(t, d)");
	});

	test("calls onUpdate with addAutoRelationship on button click", () => {
		render(<BlockAssociativeForm {...defaultProps} />);
		fireEvent.click(screen.getByText("Add"));
		expect(defaultProps.onUpdate).toHaveBeenCalledWith({ type: "addAutoRelationship" });
	});

	test("calls cellView.model.setColor on color change", () => {
		render(<BlockAssociativeForm {...defaultProps} />);
		fireEvent.click(screen.getByTestId("color-picker"));
		expect(defaultProps.cellView.model.setColor).toHaveBeenCalledWith("#ff0000");
	});
});
