describe('Task Management', () => {
    it('should allow a user to register, login, and create a task', () => {
        cy.visit('/');
        
        // Register
        cy.get('#register-username').type('testuser');
        cy.get('#register-password').type('TestPass123');
        cy.get('#register-form').submit();
        
        // Login
        cy.get('#login-username').type('testuser');
        cy.get('#login-password').type('TestPass123');
        cy.get('#login-form').submit();

        // Create a task
        cy.get('#task-title').type('New Task');
        cy.get('#task-description').type('Task Description');
        cy.get('#task-form').submit();

        // Verify the task appears in the list
        cy.get('#task-list').should('contain', 'New Task');
    });
});
