import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import LinkForm from "./LinkForm";

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

describe("LinkForm", () => {
	const defaultProps = {
		cardinality: "(1, 1)",
		role: "has",
		weak: false,
		onUpdate: jest.fn(),
	};

	beforeEach(() => jest.clearAllMocks());

	test("renders cardinality dropdown with initial value", () => {
		render(<LinkForm {...defaultProps} />);
		expect(screen.getByTestId("dropdown")).toHaveValue("(1, 1)");
	});

	test("renders role input with initial value", () => {
		render(<LinkForm {...defaultProps} />);
		expect(screen.getByLabelText("Role")).toHaveValue("has");
	});

	test("renders weak checkbox unchecked", () => {
		render(<LinkForm {...defaultProps} />);
		expect(screen.getByLabelText("Weak")).not.toBeChecked();
	});

	test("calls onUpdate with link.cardinality on dropdown change", () => {
		render(<LinkForm {...defaultProps} />);
		fireEvent.change(screen.getByTestId("dropdown"), { target: { value: "(0, n)" } });
		expect(defaultProps.onUpdate).toHaveBeenCalledWith({ type: "link.cardinality", value: "(0, n)" });
	});

	test("calls onUpdate with link.role on role change", () => {
		render(<LinkForm {...defaultProps} />);
		fireEvent.change(screen.getByLabelText("Role"), { target: { value: "belongs to" } });
		expect(defaultProps.onUpdate).toHaveBeenCalledWith({ type: "link.role", value: "belongs to" });
	});

	test("calls onUpdate with link.weak on checkbox toggle", () => {
		render(<LinkForm {...defaultProps} />);
		fireEvent.click(screen.getByLabelText("Weak"));
		expect(defaultProps.onUpdate).toHaveBeenCalledWith({ type: "link.weak", value: true });
	});

	test("renders weak checkbox checked when prop is true", () => {
		render(<LinkForm {...defaultProps} weak={true} />);
		expect(screen.getByLabelText("Weak")).toBeChecked();
	});

	test("syncs cardinality when prop changes", () => {
		const { rerender } = render(<LinkForm {...defaultProps} />);
		rerender(<LinkForm {...defaultProps} cardinality="(0, n)" />);
		expect(screen.getByTestId("dropdown")).toHaveValue("(0, n)");
	});
});
