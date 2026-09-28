import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Dropdown from "./Dropdown";

jest.mock("react-i18next", () => ({
	useTranslation: () => ({ t: (key: string) => key }),
}));

const OPTIONS = [
	{ name: "Option A", type: "a" },
	{ name: "Option B", type: "b" },
	{ name: "Option C", type: "c" },
];

describe("Dropdown", () => {
	test("renders selected value as button text", () => {
		render(
			<Dropdown
				options={OPTIONS}
				selected={{ name: "Option A", type: "a" }}
				onSelect={jest.fn()}
			/>
		);
		expect(screen.getByRole("button")).toHaveTextContent("Option A");
	});

	test("renders all options in the list", () => {
		render(
			<Dropdown
				options={OPTIONS}
				selected={{ name: "Option A", type: "a" }}
				onSelect={jest.fn()}
			/>
		);
		const items = screen.getAllByRole("option");
		expect(items).toHaveLength(3);
		expect(items[0]).toHaveTextContent("Option A");
		expect(items[1]).toHaveTextContent("Option B");
		expect(items[2]).toHaveTextContent("Option C");
	});

	test("toggles expanded state on button click", () => {
		render(
			<Dropdown
				options={OPTIONS}
				selected={{ name: "Option A", type: "a" }}
				onSelect={jest.fn()}
			/>
		);
		const container = screen.getByRole("button").closest(".dropdown-tmp");
		expect(container).not.toHaveClass("expanded");

		fireEvent.click(screen.getByRole("button"));
		expect(container).toHaveClass("expanded");

		fireEvent.click(screen.getByRole("button"));
		expect(container).not.toHaveClass("expanded");
	});

	test("calls onSelect and closes on item mousedown", () => {
		const onSelect = jest.fn();
		render(
			<Dropdown
				options={OPTIONS}
				selected={{ name: "Option A", type: "a" }}
				onSelect={onSelect}
			/>
		);

		fireEvent.click(screen.getByRole("button"));
		fireEvent.mouseDown(screen.getAllByRole("option")[1]);

		expect(onSelect).toHaveBeenCalledWith({ name: "Option B", type: "b" });

		const container = screen.getByRole("button").closest(".dropdown-tmp");
		expect(container).not.toHaveClass("expanded");
	});

	test("disables button when disabled prop is true", () => {
		render(
			<Dropdown
				options={OPTIONS}
				selected={{ name: "Option A", type: "a" }}
				onSelect={jest.fn()}
				disabled
			/>
		);
		expect(screen.getByRole("button")).toBeDisabled();
	});

	test("sets aria-haspopup and aria-expanded attributes", () => {
		render(
			<Dropdown
				options={OPTIONS}
				selected={{ name: "Option A", type: "a" }}
				onSelect={jest.fn()}
			/>
		);
		const button = screen.getByRole("button");
		expect(button).toHaveAttribute("aria-haspopup", "listbox");
		expect(button).toHaveAttribute("aria-expanded", "false");

		fireEvent.click(button);
		expect(button).toHaveAttribute("aria-expanded", "true");
	});

	test("closes dropdown on focusout when relatedTarget is outside", () => {
		render(
			<Dropdown
				options={OPTIONS}
				selected={{ name: "Option A", type: "a" }}
				onSelect={jest.fn()}
			/>
		);
		const button = screen.getByRole("button");
		const container = button.closest(".dropdown-tmp")!;

		fireEvent.click(button);
		expect(container).toHaveClass("expanded");

		fireEvent.focusOut(container, { relatedTarget: document.body });
		expect(container).not.toHaveClass("expanded");
	});
});
