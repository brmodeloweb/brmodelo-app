import { describe, expect, jest, test } from "@jest/globals";
import {
	InvalidModelFileError,
	downloadModelFile,
	parseModelFileContent,
} from "./modelFileIO";

describe("modelFileIO", () => {
	test("parseModelFileContent accepts a valid envelope", () => {
		const parsed = parseModelFileContent(JSON.stringify({
			name: "Demo",
			type: "logic",
			model: JSON.stringify({ cells: [] }),
		}));
		expect(parsed).toEqual({
			name: "Demo",
			type: "logic",
			model: JSON.stringify({ cells: [] }),
		});
	});

	test("parseModelFileContent stringifies object model graphs", () => {
		const parsed = parseModelFileContent(JSON.stringify({
			name: "Demo",
			type: "conceptual",
			model: { cells: [] },
		}));
		expect(JSON.parse(parsed.model)).toEqual({ cells: [] });
	});

	test("parseModelFileContent rejects invalid payloads", () => {
		expect(() => parseModelFileContent("{")).toThrow(InvalidModelFileError);
		expect(() => parseModelFileContent(JSON.stringify({ type: "logic", model: "{}" }))).toThrow(InvalidModelFileError);
		expect(() => parseModelFileContent(JSON.stringify({ name: "x", type: "other", model: "{}" }))).toThrow(InvalidModelFileError);
	});

	test("downloadModelFile creates an object URL", () => {
		const createObjectURL = jest.fn(() => "blob:mock");
		const revokeObjectURL = jest.fn();
		const click = jest.fn();
		Object.defineProperty(URL, "createObjectURL", { value: createObjectURL, configurable: true });
		Object.defineProperty(URL, "revokeObjectURL", { value: revokeObjectURL, configurable: true });
		const originalCreate = document.createElement.bind(document);
		jest.spyOn(document, "createElement").mockImplementation((tag: string) => {
			const el = originalCreate(tag);
			if (tag === "a") {
				Object.defineProperty(el, "click", { value: click });
			}
			return el;
		});

		downloadModelFile({
			_id: "1",
			name: "My Model",
			type: "logic",
			model: "{}",
			created: "2026-01-01",
			updated: "2026-01-01",
			version: 1,
		});

		expect(createObjectURL).toHaveBeenCalled();
		expect(click).toHaveBeenCalled();
		expect(revokeObjectURL).toHaveBeenCalled();
	});
});
