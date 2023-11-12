/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    /**
     * **Logs into the BR Modelo Wep App via the Graphical User Interface (GUI).**
     *
     * @param email string - The email of the user you want to log in with. Defaults to Cypress.env('user') if no value is provided.
     * @param password string - The password of the user you want to log in with. Defaults to Cypress.env('password') if no value is provided.
     *
     * @example cy.loginViaGui() // Logs into the app via GUI using the default email and password (defined as envs).
     * @example cy.loginViaGui('user@email.com', 'S3cRe7P@ssW0rd') // Logs into the app via GUI using the provided credentials.
     */
    loginViaGui(username?: string, password?: string)

    /**
     * **Deletes all models of the logged in user.**
     * 
     * This command is used for cleaning things up before tests start so that they start on a clean state.
     * 
     * @param userModels object - An object with the response of the request to '/models?userId=*'
     * 
     * @example cy.cleanUpUserModels(userModelsResponseObject) // Cleans up all models for the logged in user
     */
    cleanUpUserModels(userModelsRespondeObject: object): Cypress.Chainable<Cypress.Response<any>>

    /**
     * **Gets all user models for a specific userId via a GET request.**
     * 
     * @param url string - The URL for getting all the models of a specific userId
     * 
     * @example cy.getUserModelsViaApi('http://localhost:3000/models?userId=618f065ed18dc91b10651g98') // Gets all user models for userId=618f065ed18dc91b10651g98
     */
    getUserModelsViaApi(url: string): Cypress.Chainable<Cypress.Response<any>>

    /**
     * **Deletes a model via a DELETE request.**
     * 
     * @param modelId string - The id of a model (of the logged in user) that you want to delete
     * 
     * @example cy.deleteModelViaApi('61a8db9bc67e9824b66fc8g2')
     */
    deleteModelViaApi(modelId: string): Cypress.Chainable<Cypress.Response<any>>

    /**
     * **Creates a model via POST request.**
     * 
     * @param type string - The type of the model you want to create. The allowed types are 'conceptual' and 'logical'
     * @param userId string - The id of the user for which you want to create the model
     * @param model object - An object with a cells property as an array, defining all "cells" of a model. Default is an object with an empty array as the value of the cells property
     * 
     * @example cy.createModelViaApi('conceptual', '618f065ed18dc91b10650f99') // Creates a conceptual model for userId=618f065ed18dc91b10650f99
     * @example cy.createModelViaApi('logical', '618f065ed18dc91b10650f99') // Creates a logical model for userId=618f065ed18dc91b10650f99
     * @example cy.createModelViaApi('conceptual', '618f065ed18dc91b10650f99', conceptualModel) // Creates a conceptual model for userId=618f065ed18dc91b10650f99 passing a model object (`conceptualModel`), defined earlier, as a variable
     */
    createModelViaApi(type: string, userId: string, model?: object): Cypress.Chainable<Cypress.Response<any>>
  }
}
