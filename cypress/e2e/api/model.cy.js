/// <reference path="../../support/commands.d.ts" />

const conceptualModel = require("../../fixtures/conceptualModel.json");

describe("Models - Creation via API call", () => {
	beforeEach(() => {
		cy.intercept("GET", "/models?userId=*").as("getUserModels");
		cy.loginViaGui();
		cy.wait("@getUserModels").then((userModels) => {
			cy.cleanUpUserModels(userModels);
		});
		cy.reload();
	});

	it("successfully creates a conceptual model via API", () => {
		cy.wait("@getUserModels").then((userModels) => {
			const userId = userModels.request.url.match(/userId=([^&]*)/)[1];

			cy.createModelViaApi("conceptual", userId, conceptualModel);
		});
		cy.reload();
		cy.contains("td", "Conceptual").click();

		cy.get(".editor-scroller [data-type='erd.Entity']").should("have.length", 2);
		cy.get(".editor-scroller [data-type='erd.Relationship']").should(
			"have.length",
			1
		);
		cy.get(".editor-scroller [data-type='erd.Link']").should("have.length", 2);
	});
});
