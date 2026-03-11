describe('Login page', () => {
  it('logs in successfully and redirects to the splash screen', () => {
    cy.intercept('POST', '**/api/auth/login', {
      statusCode: 200,
      body: { email: 'dev@test.local' },
    }).as('loginRequest');

    cy.visit('/login');

    cy.get('input[name="email"]').clear().type('dev@test.local');
    cy.get('input[name="password"]').clear().type('test');
    cy.contains('button', 'Inloggen').click();

    cy.wait('@loginRequest')
      .its('request.body')
      .should('deep.equal', {
        email: 'dev@test.local',
        password: 'test',
      });

    cy.url().should('include', '/splash-screen');
  });

  it('shows an error message for invalid credentials', () => {
    cy.intercept('POST', '**/api/auth/login', {
      statusCode: 401,
      body: {},
    }).as('loginRequest');

    cy.visit('/login');
    cy.contains('button', 'Inloggen').click();

    cy.wait('@loginRequest');
    cy.contains('Ongeldige inloggegevens.').should('be.visible');
  });
});
