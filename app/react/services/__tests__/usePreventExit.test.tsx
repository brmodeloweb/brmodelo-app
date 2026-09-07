import React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { RouterProvider, createMemoryRouter, useNavigate } from "react-router-dom";
import { usePreventExit } from "../usePreventExit";
import { useConfirmationModal } from "../../components/ConfirmationModal";

jest.mock("../../components/ConfirmationModal", () => ({
	useConfirmationModal: jest.fn(),
}));

jest.mock("react-i18next", () => ({
	useTranslation: () => ({ t: (key: string) => key }),
}));

const Editor: React.FC = () => {
	const setEditor = usePreventExit();
	const navigate = useNavigate();
	const editor = React.useRef({ dirty: false });

	return (
		<div>
			<span>editor</span>
			<button onClick={() => { editor.current.dirty = true; setEditor(editor.current); }}>
				make-dirty
			</button>
			<button onClick={() => { editor.current.dirty = false; setEditor(editor.current); }}>
				make-clean
			</button>
			<button onClick={() => navigate("/other")}>navigate</button>
		</div>
	);
};

const renderRouter = () => {
	const router = createMemoryRouter(
		[
			{ path: "/", element: <Editor /> },
			{ path: "/other", element: <div>other page</div> },
		],
		{ initialEntries: ["/"] },
	);
	render(<RouterProvider router={router} />);
	return router;
};

describe("usePreventExit", () => {
	let confirm: jest.Mock;
	let confirmDeferred: { resolve: () => void; reject: (reason?: unknown) => void } | null;

	beforeEach(() => {
		confirmDeferred = null;
		confirm = jest.fn(
			() =>
				new Promise<void>((resolve, reject) => {
					confirmDeferred = { resolve, reject };
				}),
		);
		(useConfirmationModal as jest.Mock).mockReturnValue({ confirm });
	});

	test("does not block navigation when editor is clean", async () => {
		const router = renderRouter();
		fireEvent.click(screen.getByText("navigate"));
		await waitFor(() => expect(router.state.location.pathname).toBe("/other"));
		expect(confirm).not.toHaveBeenCalled();
	});

	test("does not block navigation before editor is set", async () => {
		const router = renderRouter();
		fireEvent.click(screen.getByText("navigate"));
		await waitFor(() => expect(router.state.location.pathname).toBe("/other"));
		expect(confirm).not.toHaveBeenCalled();
	});

	test("blocks and proceeds when user confirms exit", async () => {
		const router = renderRouter();
		fireEvent.click(screen.getByText("make-dirty"));
		fireEvent.click(screen.getByText("navigate"));

		await waitFor(() => expect(confirm).toHaveBeenCalledTimes(1));
		expect(router.state.location.pathname).toBe("/");

		await act(async () => {
			confirmDeferred?.resolve();
		});

		await waitFor(() => expect(router.state.location.pathname).toBe("/other"));
	});

	test("blocks and stays when user rejects exit", async () => {
		const router = renderRouter();
		fireEvent.click(screen.getByText("make-dirty"));
		fireEvent.click(screen.getByText("navigate"));

		await waitFor(() => expect(confirm).toHaveBeenCalledTimes(1));

		await act(async () => {
			confirmDeferred?.reject({ reason: "cancel" });
		});

		await waitFor(() => expect(router.state.location.pathname).toBe("/"));
	});

	test("does not block when editor goes clean before navigation", async () => {
		const router = renderRouter();
		fireEvent.click(screen.getByText("make-dirty"));
		fireEvent.click(screen.getByText("make-clean"));
		fireEvent.click(screen.getByText("navigate"));

		await waitFor(() => expect(router.state.location.pathname).toBe("/other"));
		expect(confirm).not.toHaveBeenCalled();
	});
});
