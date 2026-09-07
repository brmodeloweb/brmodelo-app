import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ViewForm from "./ViewForm";

jest.mock("react-i18next", () => ({
	useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock("../queryExpressionService", () => ({
	comparasionOperators: {},
}));

const makeTable = (name: string, id: string, columns: string[]) => ({
	name,
	id,
	columns: columns.map(c => ({ name: c })),
});

const getCheckbox = (id: string) => document.getElementById(id) as HTMLInputElement;

describe("ViewForm", () => {
	const defaultProps = {
		element: { model: { id: "v1", attributes: { name: "MyView", objects: [] } } },
		tables: [],
		onUpdate: jest.fn(),
	};

	beforeEach(() => jest.clearAllMocks());

	test("renders view name from element", () => {
		render(<ViewForm {...defaultProps} />);
		expect(screen.getByLabelText("Name")).toHaveValue("MyView");
	});

	test("renders all tables from graph as unchecked", () => {
		const tables = [
			makeTable("Users", "t1", ["id", "name"]),
			makeTable("Orders", "t2", ["id", "total"]),
		];
		render(<ViewForm {...defaultProps} tables={tables} />);
		expect(getCheckbox("Users")).not.toBeChecked();
		expect(getCheckbox("Orders")).not.toBeChecked();
	});

	test("shows new columns added to an existing table", () => {
		const savedView = {
			name: "MyView",
			tables: [
				{ name: "Users", id: "t1", selected: true, columns: [{ name: "id", selected: true }, { name: "name", selected: false }] },
			],
			queryConditions: {},
		};
		const currentTables = [
			makeTable("Users", "t1", ["id", "name", "email"]),
		];

		render(<ViewForm {...defaultProps} tables={currentTables} view={savedView} />);

		expect(getCheckbox("Users")).toBeChecked();
		expect(getCheckbox("Usersid")).toBeInTheDocument();
		expect(getCheckbox("Usersname")).toBeInTheDocument();
		expect(getCheckbox("Usersemail")).toBeInTheDocument();
	});

	test("preserves selected state of previously saved columns", () => {
		const savedView = {
			name: "MyView",
			tables: [
				{ name: "Users", id: "t1", selected: true, columns: [{ name: "id", selected: true }, { name: "name", selected: false }] },
			],
			queryConditions: {},
		};
		const currentTables = [
			makeTable("Users", "t1", ["id", "name", "email"]),
		];

		render(<ViewForm {...defaultProps} tables={currentTables} view={savedView} />);

		expect(getCheckbox("Usersid")).toBeChecked();
		expect(getCheckbox("Usersname")).not.toBeChecked();
		expect(getCheckbox("Usersemail")).not.toBeChecked();
	});

	test("removes columns that no longer exist in the table", () => {
		const savedView = {
			name: "MyView",
			tables: [
				{ name: "Users", id: "t1", selected: true, columns: [{ name: "id", selected: true }, { name: "old_col", selected: true }] },
			],
			queryConditions: {},
		};
		const currentTables = [
			makeTable("Users", "t1", ["id", "name"]),
		];

		render(<ViewForm {...defaultProps} tables={currentTables} view={savedView} />);

		expect(getCheckbox("Usersid")).toBeChecked();
		expect(getCheckbox("Usersname")).toBeInTheDocument();
		expect(getCheckbox("Usersold_col")).not.toBeInTheDocument();
	});

	test("adds new tables not present in saved view", () => {
		const savedView = {
			name: "MyView",
			tables: [
				{ name: "Users", id: "t1", selected: true, columns: [{ name: "id", selected: true }] },
			],
			queryConditions: {},
		};
		const currentTables = [
			makeTable("Users", "t1", ["id"]),
			makeTable("Orders", "t2", ["id", "total"]),
		];

		render(<ViewForm {...defaultProps} tables={currentTables} view={savedView} />);

		expect(getCheckbox("Users")).toBeChecked();
		expect(getCheckbox("Orders")).not.toBeChecked();
	});

	test("calls onUpdate with saveView on save", () => {
		const tables = [makeTable("Users", "t1", ["id"])];
		render(<ViewForm {...defaultProps} tables={tables} />);

		fireEvent.click(getCheckbox("Users"));
		fireEvent.click(screen.getByText("Save"));

		expect(defaultProps.onUpdate).toHaveBeenCalledWith(
			expect.objectContaining({ type: "saveView" })
		);
	});

	test("calls onDismiss when Cancel is clicked", () => {
		const onDismiss = jest.fn();
		render(<ViewForm {...defaultProps} onDismiss={onDismiss} />);
		fireEvent.click(screen.getByText("Cancel"));
		expect(onDismiss).toHaveBeenCalled();
	});

	test("toggles column selection", () => {
		const savedView = {
			name: "MyView",
			tables: [
				{ name: "Users", id: "t1", selected: true, columns: [{ name: "id", selected: false }, { name: "name", selected: false }] },
			],
			queryConditions: {},
		};
		const currentTables = [makeTable("Users", "t1", ["id", "name"])];

		render(<ViewForm {...defaultProps} tables={currentTables} view={savedView} />);

		expect(getCheckbox("Usersid")).not.toBeChecked();
		fireEvent.click(getCheckbox("Usersid"));
		expect(getCheckbox("Usersid")).toBeChecked();
	});
});
