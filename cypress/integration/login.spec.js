/// <reference path="../support/commands.d.ts" />

describe("Login", () => {
	const user = Cypress.env("user");
	const password = Cypress.env("password");

	it("logs in and out successfully", () => {
		cy.intercept("GET", "/models?userId=*").as("getUserModels");

		cy.loginViaGui(user, password);

		cy.wait("@getUserModels");
		cy.url().should("be.equal", `${Cypress.config("baseUrl")}/#!/main`);
		cy.contains("h2", "Models").should("be.visible");

		cy.get("[data-cy='gear-button']").click();
		cy.contains(".dropdown-menu li", "Logout").click();

		cy.url().should("be.equal", `${Cypress.config("baseUrl")}/#!/`);
		cy.get(".login-form").should("be.visible");
	});

	it("switches languages", () => {
		cy.visit("/");

		cy.get('button[type="submit"]')
			.as("submitButton")
			.should("contain", "Login")
			.and("be.visible");

		cy.get("[data-cy='lang-pt-br']").click();

		cy.get("@submitButton").should("contain", "Entrar").and("be.visible");

		cy.get("[data-cy='lang-en-us']").click();

		cy.get("@submitButton").should("contain", "Login").and("be.visible");
	});

	context("Form validations", () => {
		it("alerts on invalid user email", () => {
			cy.loginViaGui("invalid#user.com", password);

			cy.contains(".alert-danger", "Fill the fields in red").should(
				"be.visible"
			);
			cy.get("#userEmail").should("have.class", "error");
			cy.get(".error").should("have.length", 1).and("be.visible");
		});

		it("alerts when clicking ENTER without filling the form", () => {
			cy.visit("/");
			cy.contains("button", "Login").click();

			cy.contains(".alert-danger", "Fill the fields in red").should(
				"be.visible"
			);
			cy.get("#userEmail").should("have.class", "error");
			cy.get("#userPassword").should("have.class", "error");
			cy.get(".error").should("have.length", 2).and("be.visible");
		});

		it("alerts on invalid user", () => {
			cy.loginViaGui("invalid@user.com", password);

			cy.contains(".alert-danger", "Incorrect login or password").should(
				"be.visible"
			);
		});

		it("alerts on invalid password", () => {
			cy.loginViaGui(user, "invalid-pwd");

			cy.contains(".alert-danger", "Incorrect login or password").should(
				"be.visible"
			);
		});
	});
});
