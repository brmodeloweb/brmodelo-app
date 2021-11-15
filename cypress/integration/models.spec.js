describe('Models', () => {
  beforeEach(() => {
    cy.intercept('get', '/models?userId=*').as('getUserModels')
    cy.login()
    cy.visit('/#!/main')
    cy.cleanUpUserModels()
    cy.contains('a', 'Nova Modelagem').click()
    cy.get('create-model-modal').should('be.visible')
  })

  it('closes the "New Model" modal', () => {
    cy.contains('button', 'Cancelar').click()
    cy.get('create-model-modal').should('not.exist')
  })

  it('alerts when clicking SAVE without filling the title', () => {
    cy.contains('button', 'Salvar').click()
    cy.get('#name').should('have.class', 'error')
  })

  context('Model creation', () => {
    const modelTitle = 'User'

    beforeEach(() => cy.get('#name').type(modelTitle))

    it('creates a conceptual model', () => {
      cy.contains('button', 'Salvar').click()
  
      cy.contains('h2', `Modelo conceitual de: ${modelTitle}`)
        .should('be.visible')
    })
  
    it('creates a logical model', () => {
      cy.get('.modelselect').click()
      cy.contains('li span', 'Lógico').click()
      cy.contains('button', 'Salvar').click()
  
      cy.contains('h2', `Modelo lógico de: ${modelTitle}`)
        .should('be.visible')
    })
  })
})

Cypress.Commands.add('cleanUpUserModels', () => {
  cy.wait('@getUserModels').then(userModels => {
    cy.request('GET', userModels.response.url).then(userModelsResponse => {
      userModelsResponse.body.forEach(model => {
        cy.request(
          'DELETE',
          `${Cypress.config('apiUrl')}/models/:modelId?modelId=${model._id}`
        )
      })
    })
  })
  cy.reload()
})
