describe("Login", () => {
	const userLoginData = {
		user: Cypress.env("user"),
		password: Cypress.env("password"),
		useCachedSession: {
			cacheSession: false,
		},
	};

	const { user, password, useCachedSession } = userLoginData;

	it("logs in successfully", () => {
		cy.intercept("GET", "/models?userId=*").as("getUserModels");

		cy.login(user, password, useCachedSession);

		cy.wait("@getUserModels");
		cy.url().should("be.equal", `${Cypress.config("baseUrl")}/#!/main`);
		cy.contains("h2", "Models").should("be.visible");
	});

	context("Form validations", () => {
		it("alerts on invalid user email", () => {
			cy.login("invalid#user.com", password, useCachedSession);

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
			cy.login("invalid@user.com", password, useCachedSession);

			cy.contains(".alert-danger", "Incorrect login or password").should(
				"be.visible"
			);
		});

		it("alerts on invalid password", () => {
			cy.login(user, "invalid-pwd", useCachedSession);

			cy.contains(".alert-danger", "Incorrect login or password").should(
				"be.visible"
			);
		});
	});
});
