describe("Model", () => {
	beforeEach(() => {
		cy.intercept("GET", "/models?userId=*").as("getUserModels");
		cy.login();
		cy.visit("/#!/main");
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
			// Adds two tables, connects them, and save
			cy.dragAndDropTableAt(200, 200);
			cy.dragAndDropTableAt(500, 200);
			cy.get(".paper-scroller .joint-type-uml-class").first().click();
			cy.get(".link").drag(
				".paper-scroller .joint-type-uml-class:nth-child(2)"
			);
			cy.contains("a", "Save").click();
			// Asserts the success message is displayed
			cy.contains(".alert-success p", "Saved successfully!").should(
				"be.visible"
			);
			// Reloads the page so that the success message disapears
			cy.reload();
			// Asserts the tables and connection are still there
			cy.get(".paper-scroller .joint-type-uml-class").should("have.length", 2);
			cy.get(".connection-wrap").should("have.length", 1);
		});
	});
});

Cypress.Commands.add("dragAndDropTableAt", (x, y) => {
	cy.get(".joint-type-uml-class").move({ deltaX: x, deltaY: y });
});
