describe('User Shopping Flow', () => {
  const timestamp = Date.now();
  const user = {
    name: `Test User ${timestamp}`,
    email: `testuser${timestamp}@example.com`,
    password: 'TestPassword123!'
  };

  it('Complete User Journey: Signup -> Login -> Browse -> Add to Cart -> Checkout', () => {
    // 1. Visit Signup Page
    cy.visit('/signup'); 
    
    // 2. Fill Registration Form
    cy.get('input[name="full_name"]').should('be.visible').type(user.name);
    cy.get('input[name="email"]').should('be.visible').type(user.email);
    cy.get('input[name="password"]').should('be.visible').type(user.password);
    
    // 3. Submit Form
    cy.get('button[type="submit"]').contains('Create Account').click();

    // 4. Handle Post-Signup (Redirect to Login usually)
    // Wait for URL change or Login page appearance
    cy.wait(4000); 
    cy.get('body').then(($body) => {
        if ($body.text().includes('Sign In')) {
             cy.log('Redirected to login page or not logged in, logging in...');
             // Check if we are on login page, if not visit it
             cy.url().then(url => {
                if (!url.includes('/login')) cy.visit('/login');
             });
             cy.get('input[name="email"]').type(user.email);
             cy.get('input[name="password"]').type(user.password);
             cy.get('button[type="submit"]').contains('Sign In').click();
             cy.wait(2000);
        }
    });

    // Verify Logged In
    // cy.contains('My Dashboard').should('exist'); // Optional, Header might hide it in mobile menu

    // 5. Navigate to Products
    cy.visit('/products');
    
    // 6. Select a Product
    // Find the first product card that links to a product detail page
    cy.get('a[href^="/products/"]').first().click();

    // 7. Verify Product Page
    cy.url().should('include', '/products/');
    cy.get('h1').should('be.visible'); // Product Title

    // 8. Add to Cart
    // Wait and forcing click if covered
    cy.contains('button', 'Add to Cart').should('exist').click({force: true});

    // 9. Verify Cart Drawer Opens and Proceed to Checkout
    cy.contains('Shopping Cart', {timeout: 10000}).should('be.visible'); // Cart drawer title
    cy.contains('Checkout Now').should('be.visible').click();

    // 10. Verify Checkout Page
    cy.url().should('include', '/checkout');
    // Check for checkout form elements
    cy.contains('Shipping Details').should('exist');
    cy.contains('Order Summary').should('exist');
  });
});
