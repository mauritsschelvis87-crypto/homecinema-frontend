describe('Register page', () => {
  it('submits the register form and redirects to the homepage', () => {
    let requestCount = 0;

    cy.intercept('POST', '**/api/auth/register', (request) => {
      requestCount += 1;
      request.reply({
        statusCode: 200,
        body: {},
      });
    }).as('registerRequest');

    cy.visit('/register');

    cy.get('input[name="email"]').clear().type('new@test.local');
    cy.get('input[name="password"]').clear().type('secret123');
    cy.contains('button', 'Registreer').click();

    cy.wait('@registerRequest');
    cy.wait('@registerRequest');
    cy.then(() => {
      expect(requestCount).to.be.greaterThan(1);
    });

    cy.url().should('eq', `${Cypress.config('baseUrl')}/`);
  });

  it('shows the conflict message for an existing account', () => {
    let requestCount = 0;

    cy.intercept('POST', '**/api/auth/register', (request) => {
      requestCount += 1;
      request.reply({
        statusCode: requestCount === 1 ? 200 : 409,
        body: {},
      });
    }).as('registerRequest');

    cy.visit('/register');

    cy.get('input[name="email"]').clear().type('dev@test.local');
    cy.get('input[name="password"]').clear().type('test');
    cy.contains('button', 'Registreer').click();

    cy.wait('@registerRequest');
    cy.wait('@registerRequest');

    cy.contains('Testaccount bestaat al en is klaar voor gebruik.').should('be.visible');
  });
});
