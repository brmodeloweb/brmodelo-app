describe('Models', () => {
  beforeEach(() => {
    cy.intercept('GET', '/models?userId=*').as('getUserModels')
    cy.login()
    cy.visit('/#!/main')
    cy.cleanUpUserModelsAndReoload()
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
      // Selects the logical model and save
      cy.get('.modelselect').click()
      cy.contains('li span', 'Lógico').click()
      cy.contains('button', 'Salvar').click()
      // Asserts the model was created
      cy.contains('h2', `Modelo lógico de: ${modelTitle}`)
        .should('be.visible')
      // Adds two tables, connects them, and save
      cy.dragAndDropTableAt(200, 200)
      cy.dragAndDropTableAt(500, 200)
      cy.get('.paper-scroller .joint-type-uml-class')
        .first()
        .click()
      cy.get('.link')
        .drag('.paper-scroller .joint-type-uml-class:nth-child(2)')
      cy.contains('a', 'Salvar').click()
      // Asserts the success message is displayed
      cy.contains('.alert-success p', 'Salvo com sucesso!')
        .should('be.visible')
      // Reloads the page so that the success message disapears
      cy.reload()
      // Asserts the tables and connection are still there
      cy.get('.paper-scroller .joint-type-uml-class')
        .should('have.length', 2)
      cy.get('.connection-wrap')
        .should('have.length', 1)
    })
  })
})

Cypress.Commands.add('cleanUpUserModelsAndReoload', () => {
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

Cypress.Commands.add('dragAndDropTableAt', (x, y) => {
  cy.get('.joint-type-uml-class')
    .move({ deltaX: x, deltaY: y })
})
