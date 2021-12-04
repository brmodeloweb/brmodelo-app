// eslint-disable-next-line import/no-extraneous-dependencies
const { animal } = require("faker");

Cypress.Commands.add(
	"login",
	(
		user = Cypress.env("user"),
		password = Cypress.env("password"),
		{ cacheSession = true } = {}
	) => {
		const fillLoginFormAndSubmit = () => {
			cy.visit("/");
			cy.get("#userEmail").type(user);
			cy.get("#userPassword").type(password, { log: false });
			cy.contains("button", "Login").click();
		};

		if (cacheSession) {
			cy.session([user], fillLoginFormAndSubmit);
		} else {
			fillLoginFormAndSubmit();
		}
	}
);

Cypress.Commands.add("cleanUpUserModels", (userModels) => {
	cy.getUserModelsViaApi(userModels.response.url).then(
		(userModelsResponseUrl) => {
			userModelsResponseUrl.body.forEach((model) => {
				cy.deleteModelViaApi(model._id);
			});
		}
	);
});

Cypress.Commands.add("getUserModelsViaApi", (url) => {
	cy.request("GET", url);
});

Cypress.Commands.add("deleteModelViaApi", (modelId) => {
	cy.request(
		"DELETE",
		`${Cypress.config("apiUrl")}/models/:modelId?modelId=${modelId}`
	);
});

Cypress.Commands.add(
	"createModelViaApi",
	(type, userId, model = { cell: [] }) => {
		cy.request({
			method: "POST",
			url: `${Cypress.config("apiUrl")}/models`,
			body: {
				name: animal.type(),
				user: userId,
				type,
				model,
			},
		});
	}
);
