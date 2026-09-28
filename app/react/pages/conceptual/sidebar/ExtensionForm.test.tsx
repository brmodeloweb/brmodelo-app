import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ExtensionForm from "./ExtensionForm";

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

describe("ExtensionForm", () => {
	const defaultProps = {
		extensionType: "(t, d)",
		cellView: { model: { setColor: jest.fn() } },
		onUpdate: jest.fn(),
	};

	beforeEach(() => jest.clearAllMocks());

	test("renders dropdown with initial extension type", () => {
		render(<ExtensionForm {...defaultProps} />);
		expect(screen.getByTestId("dropdown")).toHaveValue("(t, d)");
	});

	test("calls onUpdate with editExtention on dropdown change", () => {
		render(<ExtensionForm {...defaultProps} />);
		fireEvent.change(screen.getByTestId("dropdown"), { target: { value: "(p, c)" } });
		expect(defaultProps.onUpdate).toHaveBeenCalledWith({ type: "editExtention", value: "(p, c)" });
	});

	test("updates dropdown display after selection", () => {
		render(<ExtensionForm {...defaultProps} />);
		fireEvent.change(screen.getByTestId("dropdown"), { target: { value: "(p, c)" } });
		expect(screen.getByTestId("dropdown")).toHaveValue("(p, c)");
	});

	test("calls cellView.model.setColor on color change", () => {
		render(<ExtensionForm {...defaultProps} />);
		fireEvent.click(screen.getByTestId("color-picker"));
		expect(defaultProps.cellView.model.setColor).toHaveBeenCalledWith("#ff0000");
	});
});
