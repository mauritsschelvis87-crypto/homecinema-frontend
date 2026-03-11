describe('Home page', () => {
  it('shows the main homepage sections', () => {
    cy.visit('/');

    cy.contains('h1', 'The Collection').should('be.visible');
    cy.contains('h1', 'French New Wave').should('be.visible');
    cy.contains('h1', 'Technicolor').should('be.visible');
  });

  it('opens the menu and navigates to Explore History', () => {
    cy.visit('/');

    cy.get('button[aria-label="Menu"]').click();
    cy.contains('a', 'Explore History').click();

    cy.url().should('include', '/explore');
    cy.contains('h1', 'Jean Luc Godard').should('be.visible');
  });
});
