describe('Login', () => {
  beforeEach(() => cy.visit('/'))

  it('logs in successfully', () => {
    cy.login()
    cy.url()
    .should('be.equal', `${Cypress.config('baseUrl')}/#!/main`)
    cy.contains('h2', 'Modelagens')
      .should('be.visible')
  })

  context('Form validations', () => {
    it('alerts on invalid user email', () => {
      cy.login('invalid#user.com', Cypress.env('password'))

      cy.contains('.alert', 'Preencha os campos em vermelho')
        .should('be.visible')
      cy.get('.error')
          .should('have.length', 1)
          .and('be.visible')
    })

    it('alerts when clicking ENTER without filling the form', () => {
      cy.contains('button', 'Entrar')
        .click()

      cy.contains('.alert', 'Preencha os campos em vermelho')
        .should('be.visible')
      cy.get('.error')
        .should('have.length', 2)
        .and('be.visible')
    })

    it('alerts on invalid user', () => {
      cy.login('invalid@user.com', Cypress.env('password'))

      cy.contains('.alert', 'Login ou senha incorretos')
        .should('be.visible')
    })

    it('alerts on invalid password', () => {
      cy.login(Cypress.env('user'), 'invalid-pwd')

      cy.contains('.alert', 'Login ou senha incorretos')
        .should('be.visible')
    })
  })
})
