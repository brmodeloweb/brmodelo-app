/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    /**
     * **Logs into the BR Modelo Wep App with the possibility of caching the session.**
     *
     * @param username string - The email of the user you want to log in with
     * @param password string - The password of the user you want to log in with
     * @param options object - An object with the property `cacheSession` that can be `true` or `false` (default is `true`)
     *
     * @example cy.login() // Logs into the app using the default email and password (defined as envs), and caches the session
     * @example cy.login('user@email.com', 'S3cRe7P@ssW0rd') // Logs into the app using the provided credentials, and caches the session
     * @example cy.login(Cypress.env('USER_EMAIL'), Cypress.env('USER_PASSWORD'), { cacheSession: false }) // Logs into the app using email and password defined as envs, and does not cache the session
     */
    login(username?: string, password?: string, options?: object): void | Cypress.Chainable<null>

    /**
     * **Deletes all models of the logged in user.**
     * 
     * This command is used for cleaning things up before tests start so that they start on a clean state.
     * 
     * @param userModels object - An object with the response of the request to '/models?userId=*'
     * 
     * @example cy.cleanUpUserModels(userModelsResponseObject) // Cleans up all models for the logged in user
     */
    cleanUpUserModels(userModelsRespondeObject): Cypress.Chainable<Cypress.Response<any>>

    /**
     * **Gets all user models for a specific userId via a GET request.**
     * 
     * @param url string - The URL for getting all the models of a specific userId
     * 
     * @example cy.getUserModelsViaApi('http://localhost:3000/models?userId=618f065ed18dc91b10651g98') // Gets all user models for userId=618f065ed18dc91b10651g98
     */
    getUserModelsViaApi(url): Cypress.Chainable<Cypress.Response<any>>

    /**
     * **Deletes a model via a DELETE request.**
     * 
     * @param modelId string - The id of a model (of the logged in user) that you want to delete
     * 
     * @example cy.deleteModelViaApi('61a8db9bc67e9824b66fc8g2')
     */
    deleteModelViaApi(modelId): Cypress.Chainable<Cypress.Response<any>>

    /**
     * **Creates a model via POST request.**
     * 
     * @param type string - The type of the model you want to create. The allowed types are 'conceptual' and 'logical'
     * @param userId string - The id of the user for which you want to create the model
     * 
     * @example cy.createModelViaApi('conceptual', '618f065ed18dc91b10650f99') // Creates a conceptual model for userId=618f065ed18dc91b10650f99
     * @example cy.createModelViaApi('logical', '618f065ed18dc91b10650f99') // Creates a logical model for userId=618f065ed18dc91b10650f99
     */
    createModelViaApi(type, userId): Cypress.Chainable<Cypress.Response<any>>
  }
}