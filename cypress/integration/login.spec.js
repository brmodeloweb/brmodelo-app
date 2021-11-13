it('logs in', () => {
  cy.login()
  cy.contains('h2', 'Modelagens')
    .should('be.visible')
})
