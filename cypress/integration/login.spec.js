describe('Login', () => {
  const userLoginData = {
    user: Cypress.env('user'),
    password: Cypress.env('password'),
    useCachedSession: {
      cacheSession: false
    }
  }

  const { user, password, useCachedSession } = userLoginData

  it('logs in successfully', () => {
    cy.intercept('get', '/models?userId=*').as('getUserModels')

    cy.login(user, password, useCachedSession)

    cy.wait('@getUserModels')
    cy.url()
      .should('be.equal', `${Cypress.config('baseUrl')}/#!/main`)
    cy.contains('h2', 'Modelagens')
      .should('be.visible')
  })

  context('Form validations', () => {
    it('alerts on invalid user email', () => {
      cy.login('invalid#user.com', password, useCachedSession)

      cy.contains('.alert-danger', 'Preencha os campos em vermelho')
        .should('be.visible')
      cy.get('#userEmail')
        .should('have.class', 'error')
      cy.get('.error')
          .should('have.length', 1)
          .and('be.visible')
    })

    it('alerts when clicking ENTER without filling the form', () => {
      cy.visit('/')
      cy.contains('button', 'Entrar')
        .click()

      cy.contains('.alert-danger', 'Preencha os campos em vermelho')
        .should('be.visible')
      cy.get('#userEmail')
        .should('have.class', 'error')
      cy.get('#userPassword')
        .should('have.class', 'error')
      cy.get('.error')
        .should('have.length', 2)
        .and('be.visible')
    })

    it('alerts on invalid user', () => {
      cy.login('invalid@user.com', password, useCachedSession)

      cy.contains('.alert-danger', 'Login ou senha incorretos')
        .should('be.visible')
    })

    it('alerts on invalid password', () => {
      cy.login(Cypress.env('user'), 'invalid-pwd', useCachedSession)

      cy.contains('.alert-danger', 'Login ou senha incorretos')
        .should('be.visible')
    })
  })
})
