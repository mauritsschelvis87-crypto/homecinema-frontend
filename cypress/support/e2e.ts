beforeEach(() => {
  cy.intercept('POST', '**/api/auth/register', {
    statusCode: 200,
    body: {},
  }).as('appRegister');
});
