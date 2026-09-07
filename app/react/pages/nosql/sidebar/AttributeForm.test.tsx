import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import AttributeForm from "./AttributeForm";

jest.mock("react-i18next", () => ({
	useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock("../../../components/Dropdown/Dropdown", () => {
	return function MockDropdown({ onSelect, selected, options }: any) {
		return (
			<select
				data-testid="type-dropdown"
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

describe("NoSQL AttributeForm", () => {
	const onSave = jest.fn();
	const onDismiss = jest.fn();
	const onDelete = jest.fn();

	beforeEach(() => jest.clearAllMocks());

	// //////////////////////////////////////////////////////////////////
	// Basic rendering
	// //////////////////////////////////////////////////////////////////

	test("renders name input with placeholder", () => {
		render(<AttributeForm onSave={onSave} onDismiss={onDismiss} />);
		expect(screen.getByPlaceholderText("Attribute name")).toBeInTheDocument();
	});

	test("renders all attribute types in dropdown by default", () => {
		render(<AttributeForm onSave={onSave} onDismiss={onDismiss} />);
		const dropdown = screen.getByTestId("type-dropdown");
		const options = Array.from(dropdown.querySelectorAll("option"));
		const types = options.map(o => o.value);
		expect(types).toEqual(["block", "ID", "string", "int", "float", "boolean", "date"]);
	});

	test("renders initialValues when provided", () => {
		render(
			<AttributeForm
				initialValues={{ name: "codigo", type: "int", cardinalityEnabled: false, minCardinality: 0, maxCardinality: 1 }}
				onSave={onSave}
				onDismiss={onDismiss}
			/>
		);
		expect(screen.getByDisplayValue("codigo")).toBeInTheDocument();
		expect(screen.getByTestId("type-dropdown")).toHaveValue("int");
	});

	// //////////////////////////////////////////////////////////////////
	// Save behavior
	// //////////////////////////////////////////////////////////////////

	test("calls onSave with attribute data on submit", () => {
		render(
			<AttributeForm
				initialValues={{ name: "nome", type: "string", cardinalityEnabled: false, minCardinality: 0, maxCardinality: 1 }}
				onSave={onSave}
				onDismiss={onDismiss}
			/>
		);
		fireEvent.click(screen.getByText("Save"));
		expect(onSave).toHaveBeenCalledWith({
			name: "nome",
			type: "string",
			cardinalityEnabled: false,
			minCardinality: 0,
			maxCardinality: 1,
			isReference: false,
		});
	});

	test("does not call onSave when name is empty", () => {
		render(<AttributeForm onSave={onSave} onDismiss={onDismiss} />);
		fireEvent.click(screen.getByText("Save"));
		expect(onSave).not.toHaveBeenCalled();
	});

	test("marks name input with error class after attempting to save with empty name", () => {
		render(<AttributeForm onSave={onSave} onDismiss={onDismiss} />);
		const input = screen.getByPlaceholderText("Attribute name");
		expect(input).not.toHaveClass("error");
		fireEvent.click(screen.getByText("Save"));
		expect(input).toHaveClass("error");
		expect(onSave).not.toHaveBeenCalled();
	});

	// //////////////////////////////////////////////////////////////////
	// Cardinality
	// //////////////////////////////////////////////////////////////////

	test("shows cardinality checkbox by default", () => {
		render(<AttributeForm onSave={onSave} onDismiss={onDismiss} />);
		expect(screen.getByLabelText("Cardinality")).toBeInTheDocument();
	});

	test("shows min/max fields when cardinality is enabled", () => {
		render(
			<AttributeForm
				initialValues={{ name: "x", type: "string", cardinalityEnabled: true, minCardinality: 0, maxCardinality: "N" }}
				onSave={onSave}
				onDismiss={onDismiss}
			/>
		);
		expect(screen.getByText("Min")).toBeInTheDocument();
		expect(screen.getByText("Max")).toBeInTheDocument();
	});

	// //////////////////////////////////////////////////////////////////
	// Identifier behavior
	// //////////////////////////////////////////////////////////////////

	test("shows only ID, string, int types when identifier is true", () => {
		render(
			<AttributeForm
				initialValues={{ name: "_id", type: "ID", cardinalityEnabled: false, minCardinality: 0, maxCardinality: 1 }}
				onSave={onSave}
				onDismiss={onDismiss}
				identifier
			/>
		);
		const dropdown = screen.getByTestId("type-dropdown");
		const options = Array.from(dropdown.querySelectorAll("option"));
		const types = options.map(o => o.value);
		expect(types).toEqual(["ID", "string", "int"]);
	});

	test("shows identifier checkbox when identifier is true", () => {
		render(
			<AttributeForm
				initialValues={{ name: "_id", type: "ID", cardinalityEnabled: false, minCardinality: 0, maxCardinality: 1 }}
				onSave={onSave}
				onDismiss={onDismiss}
				identifier
			/>
		);
		expect(screen.getByLabelText("Identifier")).toBeInTheDocument();
		expect(screen.getByLabelText("Identifier")).toBeChecked();
		expect(screen.getByLabelText("Identifier")).toBeDisabled();
	});

	test("hides cardinality checkbox when identifier is true", () => {
		render(
			<AttributeForm
				initialValues={{ name: "_id", type: "ID", cardinalityEnabled: false, minCardinality: 0, maxCardinality: 1 }}
				onSave={onSave}
				onDismiss={onDismiss}
				identifier
			/>
		);
		expect(screen.queryByLabelText("Cardinality")).not.toBeInTheDocument();
	});

	test("forces cardinalityEnabled to false on save when identifier is true", () => {
		render(
			<AttributeForm
				initialValues={{ name: "_id", type: "ID", cardinalityEnabled: true, minCardinality: 1, maxCardinality: "N" }}
				onSave={onSave}
				onDismiss={onDismiss}
				identifier
			/>
		);
		fireEvent.click(screen.getByText("Save"));
		expect(onSave).toHaveBeenCalledWith(
			expect.objectContaining({ cardinalityEnabled: false })
		);
	});

	test("hides cardinality min/max fields when identifier is true even if cardinalityEnabled", () => {
		render(
			<AttributeForm
				initialValues={{ name: "_id", type: "ID", cardinalityEnabled: true, minCardinality: 0, maxCardinality: 1 }}
				onSave={onSave}
				onDismiss={onDismiss}
				identifier
			/>
		);
		expect(screen.queryByText("Min")).not.toBeInTheDocument();
		expect(screen.queryByText("Max")).not.toBeInTheDocument();
	});

	test("allows changing type within allowed types when identifier is true", () => {
		render(
			<AttributeForm
				initialValues={{ name: "_id", type: "ID", cardinalityEnabled: false, minCardinality: 0, maxCardinality: 1 }}
				onSave={onSave}
				onDismiss={onDismiss}
				identifier
			/>
		);
		fireEvent.change(screen.getByTestId("type-dropdown"), { target: { value: "string" } });
		fireEvent.click(screen.getByText("Save"));
		expect(onSave).toHaveBeenCalledWith(
			expect.objectContaining({ name: "_id", type: "string" })
		);
	});

	// //////////////////////////////////////////////////////////////////
	// Delete button
	// //////////////////////////////////////////////////////////////////

	test("shows delete button when onDelete is provided", () => {
		render(
			<AttributeForm
				initialValues={{ name: "x", type: "string", cardinalityEnabled: false, minCardinality: 0, maxCardinality: 1 }}
				onSave={onSave}
				onDismiss={onDismiss}
				onDelete={onDelete}
			/>
		);
		expect(screen.getByText("Delete")).toBeInTheDocument();
	});

	test("hides delete button when onDelete is not provided", () => {
		render(
			<AttributeForm
				initialValues={{ name: "_id", type: "ID", cardinalityEnabled: false, minCardinality: 0, maxCardinality: 1 }}
				onSave={onSave}
				onDismiss={onDismiss}
			/>
		);
		expect(screen.queryByText("Delete")).not.toBeInTheDocument();
	});
});
