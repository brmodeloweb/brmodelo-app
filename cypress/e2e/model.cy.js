/// <reference path="../support/commands.d.ts" />

describe("Model", () => {
	beforeEach(() => {
		cy.intercept("GET", "/models?userId=*").as("getUserModels");
		cy.loginViaGui();
		cy.wait("@getUserModels").then((userModels) => {
			cy.cleanUpUserModels(userModels);
			cy.reload();
			cy.contains("a", "New model").click();
			cy.get("create-model-modal").should("be.visible");
		});
	});

	it('closes the "New Model" modal', () => {
		cy.contains("button", "Cancel").click();
		cy.get("create-model-modal").should("not.exist");
	});

	it("alerts when clicking SAVE without filling the title", () => {
		cy.contains("button", "Save").click();
		cy.get("#name").should("have.class", "error");
	});

	context("Model creation", () => {
		const modelTitle = "User";

		beforeEach(() => cy.get("#name").type(modelTitle));

		it("creates a conceptual model", () => {
			cy.contains("button", "Save").click();

			cy.contains("h2", `Conceptual model of: ${modelTitle}`).should(
				"be.visible"
			);
		});

		it("creates a logical model", () => {
			// Selects the logical model and save
			cy.get(".modelselect").click();
			cy.contains("li span", "Logical").click();
			cy.contains("button", "Save").click();
			// Asserts the model was created
			cy.contains("h2", `Logical model of: ${modelTitle}`).should("be.visible");
		});
	});
});
