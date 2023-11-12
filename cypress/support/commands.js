
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
	cy.getCookie('userToken').then(({ value }) => {
		cy.request({
			method: "GET",
			url,
			headers: { "brx-access-token": value },
		});
	});
});

Cypress.Commands.add("deleteModelViaApi", (modelId) => {
	cy.getCookie('userToken').then(({ value }) => {
		cy.request({
			method: "DELETE",
			url: `${Cypress.env("apiUrl")}/models/:modelId?modelId=${modelId}`,
			headers: { "brx-access-token": value },
		});
	});
});

Cypress.Commands.add(
	"createModelViaApi",
	(type, userId, model = { cell: [] }) => {
		cy.getCookie('userToken').then(({ value }) => {
			cy.request({
				method: "POST",
				url: `${Cypress.env("apiUrl")}/models`,
				headers: { "brx-access-token": value },
				body: {
					name: faker.animal.type(),
					user: userId,
					type,
					model,
				},
			});
		});
	}
);
