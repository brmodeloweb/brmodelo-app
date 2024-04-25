/// <reference path="../support/commands.d.ts" />

import { faker } from '@faker-js/faker/locale/en';

describe("Models view", () => {
	beforeEach(() => {
		cy.intercept("GET", "/models?userId=*").as("getUserModels");
		cy.loginViaGui();
		cy.wait("@getUserModels").then((userModels) => {
			const userId = userModels.request.url.match(/userId=([^&]*)/)[1];

			cy.cleanUpUserModels(userModels);
			cy.createModelViaApi("conceptual", userId);
		});
		cy.reload();
		cy.wait("@getUserModels");
	});

	it("edits a model title", () => {
		const updatedModelName = faker.lorem.word();

		cy.get(".fa-pencil").click({ force: true });
		cy.get("#rename-model").type(updatedModelName);
		cy.contains("button", "Rename").click();
		cy.contains("tr.listLine", updatedModelName).should("be.visible");
	});

	// @TODO: figure out why model duplication isn't working.
	it.skip("duplicates a model", () => {
		cy.intercept("POST", "/models").as("postModel");
		cy.get(".fa-files-o").click({ force: true });
		cy.contains("button", "Save").click();
		cy.wait("@postModel").its("response.statusCode").should("be.equal", 200);
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

	it("opens and closes the modals", () => {
		// Opens the rename model modal
		cy.get(".fa-pencil").click({ force: true });
		// Make sure the modal is visible and closes it
		cy.get(".modal-dialog")
			.as("modal")
			.should("be.visible")
			.find("button:contains(Cancel)")
			.click();
		// Make sure the modal doesn't exist in the DOM anymore
		cy.get("@modal").should("not.exist");
		// Opens the duplicate model modal
		cy.get(".fa-files-o").click({ force: true });
		// Make sure the modal is visible and closes it
		cy.get("@modal")
			.should("be.visible")
			.find("button:contains(Cancel)")
			.click();
		// Make sure the modal doesn't exist in the DOM anymore
		cy.get("@modal").should("not.exist");
		// Opens the delete model modal
		cy.get(".fa-trash").click({ force: true });
		// Make sure the modal is visible and closes it
		cy.get("@modal")
			.should("be.visible")
			.find("button:contains(Cancel)")
			.click();
		// Make sure the modal doesn't exist in the DOM anymore
		cy.get("@modal").should("not.exist");
	});
});
