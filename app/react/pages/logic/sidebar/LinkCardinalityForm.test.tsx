import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import LinkCardinalityForm from "./LinkCardinalityForm";

jest.mock("react-i18next", () => ({
	useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock("../../../components/Dropdown/Dropdown", () => {
	return function MockDropdown({ onSelect, selected, options }: any) {
		return (
			<select
				data-testid={`dropdown-${selected.name}`}
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

describe("LinkCardinalityForm", () => {
	const defaultProps = {
		element: {
			model: {
				id: "link1",
				attributes: {
					labels: [
						{ attrs: { text: { text: "(1, 1)" } } },
						{ attrs: { text: { text: "(0, n)" } } },
					],
				},
			},
		},
		onUpdate: jest.fn(),
	};

	beforeEach(() => jest.clearAllMocks());

	test("renders cardinality A and B dropdowns", () => {
		render(<LinkCardinalityForm {...defaultProps} />);
		expect(screen.getByText("Cardinality A")).toBeInTheDocument();
		expect(screen.getByText("Cardinality B")).toBeInTheDocument();
	});

	test("shows current cardinality values", () => {
		render(<LinkCardinalityForm {...defaultProps} />);
		expect(screen.getByTestId("dropdown-(1, 1)")).toBeInTheDocument();
		expect(screen.getByTestId("dropdown-(0, n)")).toBeInTheDocument();
	});

	test("calls onUpdate with editCardinalityA when A changes", () => {
		render(<LinkCardinalityForm {...defaultProps} />);
		fireEvent.change(screen.getByTestId("dropdown-(1, 1)"), { target: { value: "(0, 1)" } });
		expect(defaultProps.onUpdate).toHaveBeenCalledWith({
			type: "editCardinalityA",
			element: defaultProps.element,
			value: "(0, 1)",
		});
	});

	test("calls onUpdate with editCardinalityB when B changes", () => {
		render(<LinkCardinalityForm {...defaultProps} />);
		fireEvent.change(screen.getByTestId("dropdown-(0, n)"), { target: { value: "(1, n)" } });
		expect(defaultProps.onUpdate).toHaveBeenCalledWith({
			type: "editCardinalityB",
			element: defaultProps.element,
			value: "(1, n)",
		});
	});

	test("defaults to (1, 1) when labels are missing", () => {
		const props = {
			...defaultProps,
			element: { model: { id: "link2", attributes: { labels: [] } } },
		};
		render(<LinkCardinalityForm {...props} />);
		const dropdowns = screen.getAllByTestId("dropdown-(1, 1)");
		expect(dropdowns).toHaveLength(2);
	});
});
