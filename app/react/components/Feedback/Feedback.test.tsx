import React from "react";
import { render, screen, act } from "@testing-library/react";
import Feedback from "./Feedback";

jest.useFakeTimers();

describe("Feedback", () => {
	test("renders message with success class by default", () => {
		render(<Feedback message="Saved!" showing type="success" onClose={jest.fn()} />);
		const alert = screen.getByRole("alert");
		expect(alert).toHaveTextContent("Saved!");
		expect(alert.className).toContain("alert-success");
		expect(alert.className).not.toContain("hide");
	});

	test("hides alert when showing is false", () => {
		render(<Feedback message="Saved!" showing={false} type="success" onClose={jest.fn()} />);
		expect(screen.getByRole("alert").className).toContain("hide");
	});

	test("maps error type to alert-danger", () => {
		render(<Feedback message="Boom" showing type="error" onClose={jest.fn()} />);
		expect(screen.getByRole("alert").className).toContain("alert-danger");
	});

	test("maps warning type to alert-warning", () => {
		render(<Feedback message="Heads up" showing type="warning" onClose={jest.fn()} />);
		expect(screen.getByRole("alert").className).toContain("alert-warning");
	});

	test("auto-dismisses after the default timeout when showing", () => {
		const onClose = jest.fn();
		render(<Feedback message="Saved!" showing type="success" onClose={onClose} />);
		expect(onClose).not.toHaveBeenCalled();
		act(() => { jest.advanceTimersByTime(5000); });
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	test("respects a custom autoDismissMs", () => {
		const onClose = jest.fn();
		render(<Feedback message="Saved!" showing type="success" onClose={onClose} autoDismissMs={1000} />);
		act(() => { jest.advanceTimersByTime(999); });
		expect(onClose).not.toHaveBeenCalled();
		act(() => { jest.advanceTimersByTime(1); });
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	test("does not auto-dismiss when autoDismissMs is 0", () => {
		const onClose = jest.fn();
		render(<Feedback message="Saved!" showing type="success" onClose={onClose} autoDismissMs={0} />);
		act(() => { jest.advanceTimersByTime(60000); });
		expect(onClose).not.toHaveBeenCalled();
	});

	test("does not schedule timer while hidden", () => {
		const onClose = jest.fn();
		render(<Feedback message="" showing={false} type="success" onClose={onClose} />);
		act(() => { jest.advanceTimersByTime(10000); });
		expect(onClose).not.toHaveBeenCalled();
	});
});
