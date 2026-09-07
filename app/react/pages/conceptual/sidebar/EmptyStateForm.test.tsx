import React from "react";
import { render, screen } from "@testing-library/react";
import EmptyStateForm from "./EmptyStateForm";

jest.mock("react-i18next", () => ({
	useTranslation: () => ({ t: (key: string) => key }),
}));

describe("EmptyStateForm", () => {
	test("renders the empty state message", () => {
		render(<EmptyStateForm />);
		expect(screen.getByText("Select an element to edit")).toBeInTheDocument();
	});
});
