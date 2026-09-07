import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ElementColorPicker from "./ElementColorPicker";

jest.mock("react-i18next", () => ({
	useTranslation: () => ({ t: (key: string) => key }),
}));

describe("ElementColorPicker", () => {
	test("renders color label", () => {
		render(<ElementColorPicker onColorChange={jest.fn()} />);
		expect(screen.getByText("Color")).toBeInTheDocument();
	});

	test("renders 8 color radio options", () => {
		render(<ElementColorPicker onColorChange={jest.fn()} />);
		const radios = screen.getAllByRole("radio");
		expect(radios).toHaveLength(8);
	});

	test("renders all color labels", () => {
		render(<ElementColorPicker onColorChange={jest.fn()} />);
		expect(screen.getByText("White")).toBeInTheDocument();
		expect(screen.getByText("Salmon")).toBeInTheDocument();
		expect(screen.getByText("Orange")).toBeInTheDocument();
		expect(screen.getByText("Yellow")).toBeInTheDocument();
		expect(screen.getByText("Green")).toBeInTheDocument();
		expect(screen.getByText("Blue")).toBeInTheDocument();
		expect(screen.getByText("Purple")).toBeInTheDocument();
		expect(screen.getByText("Pink")).toBeInTheDocument();
	});

	test("calls onColorChange with hex value when a color is selected", () => {
		const onColorChange = jest.fn();
		render(<ElementColorPicker onColorChange={onColorChange} />);

		const radios = screen.getAllByRole("radio");
		fireEvent.click(radios[0]);
		expect(onColorChange).toHaveBeenCalledWith("#ffffff");
	});

	test("all radios share the same group name", () => {
		render(<ElementColorPicker onColorChange={jest.fn()} />);
		const radios = screen.getAllByRole("radio");
		const groupName = radios[0].getAttribute("name");
		expect(groupName).toBeTruthy();
		radios.forEach((radio) => {
			expect(radio).toHaveAttribute("name", groupName);
		});
	});
});
