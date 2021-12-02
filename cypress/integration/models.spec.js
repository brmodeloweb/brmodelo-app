/// <reference path="../support/commands.d.ts" />

const { random } = require("faker");

describe("Models view", () => {
	beforeEach(() => {
		cy.intercept("GET", "/models?userId=*").as("getUserModels");
		cy.login();
		cy.visit("/#!/main");
		cy.wait("@getUserModels").then((userModels) => {
			const userId = userModels.request.url.match(/userId=([^&]*)/)[1];

			cy.cleanUpUserModels(userModels);
			cy.createModelViaApi("conceptual", userId);
		});
		cy.reload();
		cy.wait("@getUserModels");
	});

	it("edits a model title", () => {
		const updatedModelName = random.word();

		cy.get(".fa-pencil").click({ force: true });
		cy.get("#rename-model").type(updatedModelName);
		cy.contains("button", "Rename").click();
		cy.contains("tr.listLine", updatedModelName).should("be.visible");
	});

	it("duplicates a model", () => {
		cy.get(".fa-files-o").click({ force: true });
		cy.contains("button", "Save").click();
		cy.reload();
		cy.get("tr.listLine")
			.should("have.length", 2)
			.last()
			.should("contain", "(copy)");
	});

	it("deletes a model", () => {
		cy.intercept("DELETE", "/models/**").as("deleteModels");
		cy.get(".fa-trash").click({ force: true });
		cy.contains("button", "Delete").click();
		cy.wait("@deleteModels").its("response.statusCode").should("be.equal", 200);
		cy.get("table tbody tr.listLine").should("not.exist");
	});
});
