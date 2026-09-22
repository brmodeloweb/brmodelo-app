import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import KeyForm from "./KeyForm";

jest.mock("react-i18next", () => ({
	useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock("../../../components/Dropdown", () => {
	return function MockDropdown({ onSelect, selected, options }: any) {
		return (
			<select
				data-testid={`dropdown-${selected.type}`}
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

jest.mock("../../../components/TypeParamsFields/TypeParamsFields", () => {
	return function MockTypeParamsFields() {
		return null;
	};
});

describe("KeyForm", () => {
	const defaultProps = {
		name: "TestKey",
		dataType: "INT",
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

	test("calls onUpdate with attribute.dataType when type changes", () => {
		render(<KeyForm {...defaultProps} />);
		fireEvent.change(screen.getByTestId("dropdown-INT"), { target: { value: "UUID" } });
		expect(defaultProps.onUpdate).toHaveBeenCalledWith({
			type: "attribute.dataType",
			value: expect.objectContaining({ dataType: "UUID" }),
		});
	});
});
