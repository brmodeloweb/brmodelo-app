
import { faker } from '@faker-js/faker/locale/en';

Cypress.Commands.add(
	"loginViaGui",
	(user = Cypress.env("user"), password = Cypress.env("password")) => {
		cy.visit("/");
		cy.get("#userEmail").type(user);
		cy.get("#userPassword").type(password, { log: false });
		cy.contains("button", "Login").click();
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
				name: faker.animal.type(),
				user: userId,
				type,
				model,
			},
		});
	}
);

Cypress.Commands.add("dragAndDropTableAt", (x, y) => {
	cy.get(".joint-type-uml-class").move({ deltaX: x, deltaY: y });
});
