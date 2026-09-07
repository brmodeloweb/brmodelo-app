import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import CheckConstraint from "./CheckConstraint";

jest.mock("react-i18next", () => ({
	useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock("../../../components/Dropdown/Dropdown", () => {
	return function MockDropdown({ onSelect, selected, options }: any) {
		return (
			<select
				data-testid="check-dropdown"
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

describe("CheckConstraint", () => {
	const defaultProps = {
		column: { type: "INT", checkConstraint: {} },
		onChange: jest.fn(),
	};

	beforeEach(() => jest.clearAllMocks());

	test("renders in preset mode by default (no checkExpression)", () => {
		render(<CheckConstraint {...defaultProps} />);
		expect(screen.getByTestId("check-dropdown")).toBeInTheDocument();
	});

	test("renders in manual mode when checkExpression exists", () => {
		const props = {
			...defaultProps,
			column: { type: "INT", checkConstraint: { checkExpression: "> 0" } },
		};
		render(<CheckConstraint {...props} />);
		expect(screen.getByPlaceholderText("Type the expression check")).toBeInTheDocument();
	});

	test("toggles between manual and preset modes", () => {
		render(<CheckConstraint {...defaultProps} />);
		expect(screen.getByTestId("check-dropdown")).toBeInTheDocument();

		fireEvent.click(screen.getByText("Create check constraint manually"));
		expect(screen.getByPlaceholderText("Type the expression check")).toBeInTheDocument();
		expect(defaultProps.onChange).toHaveBeenCalledWith("checkConstraint", { checkExpression: "" });

		fireEvent.click(screen.getByText("Show options to create constraint"));
		expect(screen.getByTestId("check-dropdown")).toBeInTheDocument();
		expect(defaultProps.onChange).toHaveBeenCalledWith("checkConstraint", {});
	});

	test("shows number options for INT type", () => {
		render(<CheckConstraint {...defaultProps} />);
		const dropdown = screen.getByTestId("check-dropdown");
		const options = dropdown.querySelectorAll("option");
		const optionValues = Array.from(options).map(o => o.getAttribute("value"));
		expect(optionValues).toContain("EQUAL_TO");
		expect(optionValues).toContain("BETWEEN");
	});

	test("shows string options for VARCHAR type", () => {
		const props = {
			...defaultProps,
			column: { type: "VARCHAR(n)", checkConstraint: {} },
		};
		render(<CheckConstraint {...props} />);
		const dropdown = screen.getByTestId("check-dropdown");
		const options = dropdown.querySelectorAll("option");
		const optionValues = Array.from(options).map(o => o.getAttribute("value"));
		expect(optionValues).toContain("IS");
		expect(optionValues).toContain("CONTAINS");
	});

	test("calls onChange when constraint type is selected", () => {
		render(<CheckConstraint {...defaultProps} />);
		fireEvent.change(screen.getByTestId("check-dropdown"), { target: { value: "EQUAL_TO" } });
		expect(defaultProps.onChange).toHaveBeenCalledWith("checkConstraint", expect.objectContaining({
			type: "EQUAL_TO",
			name: "Equal to",
		}));
	});

	test("calls onChange when manual expression is typed", () => {
		render(<CheckConstraint {...defaultProps} />);
		fireEvent.click(screen.getByText("Create check constraint manually"));
		fireEvent.change(screen.getByPlaceholderText("Type the expression check"), { target: { value: "> 0" } });
		expect(defaultProps.onChange).toHaveBeenCalledWith("checkConstraint", expect.objectContaining({
			checkExpression: "> 0",
		}));
	});
});
