import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ColumnForm from "./ColumnForm";

jest.mock("react-i18next", () => ({
	useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock("../../../components/Dropdown/Dropdown", () => {
	return function MockDropdown({ onSelect, selected, options, disabled }: any) {
		return (
			<select
				data-testid={`dropdown-${selected.name}`}
				value={selected.type}
				disabled={disabled}
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

jest.mock("./CheckConstraint", () => {
	return function MockCheckConstraint() { return <div data-testid="check-constraint">Check</div>; };
});

describe("ColumnForm", () => {
	const defaultColumn = {
		name: "id",
		PK: true,
		FK: false,
		NOT_NULL: false,
		UNIQUE: false,
		AUTO_INCREMENT: false,
		defaultValue: "",
		type: "INT",
		tableOrigin: { idOrigin: "", idLink: "", idName: "" },
	};

	const defaultProps = {
		column: defaultColumn,
		tableNames: [{ name: "Users", value: "user1" }, { name: "Orders", value: "order1" }],
		onSave: jest.fn(),
		onDismiss: jest.fn(),
	};

	beforeEach(() => jest.clearAllMocks());

	test("renders column name input", () => {
		render(<ColumnForm {...defaultProps} />);
		expect(screen.getByLabelText("Name")).toHaveValue("id");
	});

	test("renders PK checkbox checked", () => {
		render(<ColumnForm {...defaultProps} />);
		expect(screen.getByLabelText("PK")).toBeChecked();
	});

	test("renders FK checkbox unchecked", () => {
		render(<ColumnForm {...defaultProps} />);
		expect(screen.getByLabelText("FK")).not.toBeChecked();
	});

	test("disables NOT NULL when PK is checked", () => {
		render(<ColumnForm {...defaultProps} />);
		expect(screen.getByLabelText("NOT NULL")).toBeDisabled();
	});

	test("disables Default when PK is checked", () => {
		render(<ColumnForm {...defaultProps} />);
		expect(screen.getByLabelText("Default")).toBeDisabled();
	});

	test("calls onSave with column data when Save is clicked", () => {
		render(<ColumnForm {...defaultProps} />);
		fireEvent.click(screen.getByText("Save"));
		expect(defaultProps.onSave).toHaveBeenCalledWith(
			expect.objectContaining({ name: "id", PK: true }),
			undefined
		);
	});

	test("calls onDismiss when Cancel is clicked", () => {
		render(<ColumnForm {...defaultProps} />);
		fireEvent.click(screen.getByText("Cancel"));
		expect(defaultProps.onDismiss).toHaveBeenCalled();
	});

	test("renders Delete button when onDelete is provided", () => {
		const onDelete = jest.fn();
		render(<ColumnForm {...defaultProps} onDelete={onDelete} index={0} />);
		expect(screen.getByText("Delete")).toBeInTheDocument();
		fireEvent.click(screen.getByText("Delete"));
		expect(onDelete).toHaveBeenCalledWith(0);
	});

	test("does not render Delete button when onDelete is not provided", () => {
		render(<ColumnForm {...defaultProps} />);
		expect(screen.queryByText("Delete")).not.toBeInTheDocument();
	});

	test("renders check constraint component", () => {
		render(<ColumnForm {...defaultProps} />);
		expect(screen.getByTestId("check-constraint")).toBeInTheDocument();
	});

	test("updates column name on input change", () => {
		render(<ColumnForm {...defaultProps} />);
		fireEvent.change(screen.getByLabelText("Name"), { target: { value: "username" } });
		expect(screen.getByLabelText("Name")).toHaveValue("username");
	});

	test("normalizes state when FK is toggled on", () => {
		const column = { ...defaultColumn, PK: false, type: "VARCHAR(n)", defaultValue: "test", AUTO_INCREMENT: true };
		render(<ColumnForm {...defaultProps} column={column} />);
		fireEvent.click(screen.getByLabelText("FK"));
		fireEvent.click(screen.getByText("Save"));
		expect(defaultProps.onSave).toHaveBeenCalledWith(
			expect.objectContaining({ FK: true, type: "INT", defaultValue: "", AUTO_INCREMENT: false }),
			undefined
		);
	});

	test("clears tableOrigin when FK is toggled off", () => {
		const column = { ...defaultColumn, PK: false, FK: true, tableOrigin: { idOrigin: "t1", idLink: "l1", idName: "Users" } };
		render(<ColumnForm {...defaultProps} column={column} />);
		fireEvent.click(screen.getByLabelText("FK"));
		fireEvent.click(screen.getByText("Save"));
		expect(defaultProps.onSave).toHaveBeenCalledWith(
			expect.objectContaining({ FK: false, tableOrigin: { idOrigin: "", idLink: "", idName: "" } }),
			undefined
		);
	});
});
