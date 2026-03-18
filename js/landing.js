/* ===================================================================
   LANDING PAGE MODULE
   Handles landing page display, demo account, and transitions
   =================================================================== */

/**
 * Helper: returns 'YYYY-MM-DD' for a date offset from today
 */
function demoDate(dayOffset) {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  return d.toISOString().split('T')[0];
}

/**
 * Build demo data fresh each time so dates are always relative to today.
 * Saved to localStorage only, NOT synced to Supabase.
 */
function buildDemoData() {
  return {
    pantry: [
      {
        id: 'demo-pantry-1',
        name: 'Flour',
        unit: 'lb',
        category: 'Baking',
        min: 2,
        totalQty: 5,
        locations: [
          { id: 'demo-loc-1', location: 'Pantry', qty: 3, expiry: '' },
          { id: 'demo-loc-2', location: 'Storage', qty: 2, expiry: '' }
        ],
        notes: ''
      },
      {
        id: 'demo-pantry-2',
        name: 'Sugar',
        unit: 'lb',
        category: 'Baking',
        min: 1,
        totalQty: 3,
        locations: [
          { id: 'demo-loc-3', location: 'Pantry', qty: 3, expiry: '' }
        ],
        notes: ''
      },
      {
        id: 'demo-pantry-3',
        name: 'Eggs',
        unit: 'unit',
        category: 'Dairy',
        min: 12,
        totalQty: 4,
        locations: [
          { id: 'demo-loc-4', location: 'Fridge', qty: 4, expiry: demoDate(5) }
        ],
        notes: ''
      },
      {
        id: 'demo-pantry-4',
        name: 'Milk',
        unit: 'gal',
        category: 'Dairy',
        min: 1,
        totalQty: 0.25,
        locations: [
          { id: 'demo-loc-5', location: 'Fridge', qty: 0.25, expiry: demoDate(-2) }
        ],
        notes: ''
      },
      {
        id: 'demo-pantry-5',
        name: 'Butter',
        unit: 'lb',
        category: 'Dairy',
        min: 1,
        totalQty: 0.25,
        locations: [
          { id: 'demo-loc-6', location: 'Fridge', qty: 0.25, expiry: '' }
        ],
        notes: ''
      },
      {
        id: 'demo-pantry-6',
        name: 'Chicken Breast',
        unit: 'lb',
        category: 'Meat',
        min: 2,
        totalQty: 4,
        locations: [
          { id: 'demo-loc-7', location: 'Freezer', qty: 4, expiry: demoDate(30) }
        ],
        notes: ''
      },
      {
        id: 'demo-pantry-7',
        name: 'Tomatoes',
        unit: 'unit',
        category: 'Produce',
        min: 6,
        totalQty: 2,
        locations: [
          { id: 'demo-loc-8', location: 'Counter', qty: 2, expiry: '' }
        ],
        notes: ''
      },
      {
        id: 'demo-pantry-8',
        name: 'Pasta',
        unit: 'lb',
        category: 'Grains',
        min: 1,
        totalQty: 2,
        locations: [
          { id: 'demo-loc-9', location: 'Pantry', qty: 2, expiry: '' }
        ],
        notes: ''
      },
      {
        id: 'demo-pantry-9',
        name: 'Olive Oil',
        unit: 'bottle',
        category: 'Oils',
        min: 2,
        totalQty: 0.5,
        locations: [
          { id: 'demo-loc-10', location: 'Pantry', qty: 0.5, expiry: '' }
        ],
        notes: ''
      },
      {
        id: 'demo-pantry-10',
        name: 'Garlic',
        unit: 'bulb',
        category: 'Produce',
        min: 3,
        totalQty: 1,
        locations: [
          { id: 'demo-loc-11', location: 'Counter', qty: 1, expiry: '' }
        ],
        notes: ''
      },
      {
        id: 'demo-pantry-11',
        name: 'Chocolate Chips',
        unit: 'bag',
        category: 'Baking',
        min: 1,
        totalQty: 0,
        locations: [],
        notes: ''
      }
    ],
    recipes: [
      {
        id: 'demo-recipe-1',
        name: 'Chocolate Chip Cookies',
        servings: 24,
        ingredients: [
          { name: 'Flour', qty: 2.5, unit: 'cup' },
          { name: 'Sugar', qty: 1, unit: 'cup' },
          { name: 'Butter', qty: 0.5, unit: 'lb' },
          { name: 'Eggs', qty: 2, unit: 'unit' },
          { name: 'Chocolate Chips', qty: 2, unit: 'cup' }
        ],
        instructions: '1. Preheat oven to 375\u00B0F\n2. Mix butter and sugar until fluffy\n3. Add eggs and mix well\n4. Gradually add flour\n5. Fold in chocolate chips\n6. Drop spoonfuls onto baking sheet\n7. Bake 10-12 minutes until golden',
        photo: '',
        tags: ['Dessert', 'Baking'],
        isFavorite: true
      },
      {
        id: 'demo-recipe-2',
        name: 'Grilled Chicken',
        servings: 4,
        ingredients: [
          { name: 'Chicken Breast', qty: 2, unit: 'lb' },
          { name: 'Olive Oil', qty: 2, unit: 'tbsp' },
          { name: 'Garlic Powder', qty: 1, unit: 'tsp' },
          { name: 'Paprika', qty: 1, unit: 'tsp' }
        ],
        instructions: '1. Season chicken with oil and spices\n2. Let marinate 30 minutes\n3. Preheat grill to medium-high\n4. Grill 6-7 minutes per side\n5. Let rest 5 minutes before serving',
        photo: '',
        tags: ['Main Dish', 'Healthy', 'Quick'],
        isFavorite: true
      },
      {
        id: 'demo-recipe-3',
        name: 'Pasta with Tomato Sauce',
        servings: 4,
        ingredients: [
          { name: 'Pasta', qty: 1, unit: 'lb' },
          { name: 'Tomatoes', qty: 6, unit: 'unit' },
          { name: 'Olive Oil', qty: 3, unit: 'tbsp' },
          { name: 'Garlic', qty: 4, unit: 'clove' },
          { name: 'Basil', qty: 0.25, unit: 'cup' }
        ],
        instructions: '1. Boil water for pasta\n2. Dice tomatoes and saut\u00E9 with garlic and oil\n3. Cook pasta until al dente\n4. Combine pasta with sauce\n5. Top with fresh basil',
        photo: '',
        tags: ['Main Dish', 'Italian', 'Vegetarian'],
        isFavorite: false
      }
    ],
    planner: {
      [demoDate(-2)]: [
        { id: 'demo-meal-1', recipeId: 'demo-recipe-2', mealType: 'dinner', cooked: true }
      ],
      [demoDate(-1)]: [
        { id: 'demo-meal-2', recipeId: 'demo-recipe-3', mealType: 'dinner', cooked: true }
      ],
      [demoDate(0)]: [
        { id: 'demo-meal-3', recipeId: 'demo-recipe-2', mealType: 'dinner', cooked: false }
      ],
      [demoDate(1)]: [
        { id: 'demo-meal-4', recipeId: 'demo-recipe-1', mealType: 'snack', cooked: false }
      ],
      [demoDate(2)]: [
        { id: 'demo-meal-5', recipeId: 'demo-recipe-3', mealType: 'lunch', cooked: false },
        { id: 'demo-meal-6', recipeId: 'demo-recipe-2', mealType: 'dinner', cooked: false }
      ],
      [demoDate(3)]: [
        { id: 'demo-meal-7', recipeId: 'demo-recipe-1', mealType: 'dessert', cooked: false }
      ],
      [demoDate(4)]: [
        { id: 'demo-meal-8', recipeId: 'demo-recipe-3', mealType: 'dinner', cooked: false }
      ]
    }
  };
}

/* ===================================================================
   LANDING PAGE VISIBILITY
   =================================================================== */

/**
 * Show or hide landing page based on authentication state
 */
function updateLandingPageVisibility(isAuthenticated) {
  const landingPage = document.getElementById('landing-page');
  const body = document.body;

  if (!landingPage) return;

  // Check if in demo mode (don't show landing if demo is active)
  const isDemoMode = localStorage.getItem('demo-mode') === 'true';

  if (!isAuthenticated && !isDemoMode) {
    // Show landing page
    landingPage.classList.add('show');
    body.classList.add('landing-active');
  } else {
    // Hide landing page
    landingPage.classList.remove('show');
    body.classList.remove('landing-active');
  }
}

/* ===================================================================
   DEMO ACCOUNT FUNCTIONALITY
   =================================================================== */

/**
 * Load demo data into localStorage and show the app
 */
function loadDemoAccount() {
  try {
    // Set demo mode flag and store demo data in localStorage
    localStorage.setItem('demo-mode', 'true');
    const data = buildDemoData();
    localStorage.setItem('pantry', JSON.stringify(data.pantry));
    localStorage.setItem('recipes', JSON.stringify(data.recipes));
    localStorage.setItem('planner', JSON.stringify(data.planner));

    // Navigate to the app (auth-guard allows demo mode through)
    window.location.href = (window.CONFIG && window.CONFIG.BASE_PATH || '') + '/pantry/';
  } catch (err) {
    console.error('Error loading demo account:', err);
    if (window.showError) {
      window.showError('Failed to load demo');
    }
  }
}

/**
 * Exit demo mode and show landing page again
 */
function exitDemoMode() {
  if (confirm('Exit demo mode? All demo data will be cleared.')) {
    // Clear demo flag and data
    localStorage.removeItem('demo-mode');
    localStorage.removeItem('pantry');
    localStorage.removeItem('recipes');
    localStorage.removeItem('planner');

    // Navigate back to landing page
    window.location.href = (window.CONFIG && window.CONFIG.BASE_PATH || '') + '/';
  }
}

/**
 * Check if currently in demo mode
 */
function isDemoMode() {
  return localStorage.getItem('demo-mode') === 'true';
}

/* ===================================================================
   AUTH FORM HANDLERS
   =================================================================== */

/**
 * Activate a top-level tab (get-started or sign-in)
 */
function showGetStarted() {
  document.getElementById('panel-get-started').style.display = 'block';
  document.getElementById('panel-sign-in').style.display = 'none';
  document.getElementById('tab-get-started').classList.add('active');
  document.getElementById('tab-sign-in').classList.remove('active');
  clearErrors();
}

function showSignIn() {
  document.getElementById('panel-get-started').style.display = 'none';
  document.getElementById('panel-sign-in').style.display = 'block';
  document.getElementById('tab-sign-in').classList.add('active');
  document.getElementById('tab-get-started').classList.remove('active');
  hideSubPanels();
  clearErrors();
}

function hideSubPanels() {
  document.getElementById('panel-quick-access').style.display = 'none';
  document.getElementById('panel-password-access').style.display = 'none';
  document.getElementById('btn-quick-access').classList.remove('active');
  document.getElementById('btn-password-access').classList.remove('active');
}

function showQuickAccess() {
  document.getElementById('panel-quick-access').style.display = 'block';
  document.getElementById('panel-password-access').style.display = 'none';
  document.getElementById('btn-quick-access').classList.add('active');
  document.getElementById('btn-password-access').classList.remove('active');
  clearErrors();
}

function showPasswordAccess() {
  document.getElementById('panel-password-access').style.display = 'block';
  document.getElementById('panel-quick-access').style.display = 'none';
  document.getElementById('btn-password-access').classList.add('active');
  document.getElementById('btn-quick-access').classList.remove('active');
  clearErrors();
}

function clearErrors() {
  ['landing-auth-error', 'landing-signup-error', 'landing-quick-error'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = '';
  });
}

/**
 * Handle sign-in form submission
 */
async function handleLandingSignIn() {
  const emailInput = document.getElementById('landing-email');
  const passwordInput = document.getElementById('landing-password');
  const errorDiv = document.getElementById('landing-auth-error');
  const signInBtn = document.getElementById('landing-signin-btn');

  const email = emailInput?.value.trim();
  const password = passwordInput?.value;

  // Clear previous errors
  errorDiv.textContent = '';

  // Validation
  if (!email || !password) {
    errorDiv.textContent = 'Please enter both email and password';
    return;
  }

  if (!isValidEmail(email)) {
    errorDiv.textContent = 'Please enter a valid email address';
    return;
  }

  // Disable button during sign in
  const originalText = signInBtn.textContent;
  signInBtn.disabled = true;
  signInBtn.textContent = 'Signing in...';

  try {
    // Call the Python backend API
    const response = await API.call('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    if (response.session && response.session.access_token) {
      // Save full session details and navigate to the app
      API.setToken(response.session.access_token);
      if (response.session.refresh_token) {
        API.setRefreshToken(response.session.refresh_token);
      }
      if (response.household_id) {
        API.setActiveHouseholdId(response.household_id);
      }
      window.location.href = (window.CONFIG && window.CONFIG.BASE_PATH || '') + '/pantry/';
    } else {
      errorDiv.textContent = 'Sign in failed';
      signInBtn.disabled = false;
      signInBtn.textContent = originalText;
    }
  } catch (err) {
    console.error('Sign in error:', err);
    errorDiv.textContent = err.message || 'An error occurred. Please try again.';
    signInBtn.disabled = false;
    signInBtn.textContent = originalText;
  }
}

/**
 * Handle sign-up form submission
 */
async function handleLandingSignUp() {
  const emailInput = document.getElementById('landing-signup-email');
  const passwordInput = document.getElementById('landing-signup-password');
  const confirmInput = document.getElementById('landing-signup-confirm');
  const errorDiv = document.getElementById('landing-signup-error');
  const signUpBtn = document.getElementById('landing-signup-btn');

  const email = emailInput?.value.trim();
  const password = passwordInput?.value;
  const confirm = confirmInput?.value;

  // Clear previous errors
  errorDiv.textContent = '';

  // Validation
  if (!email || !password || !confirm) {
    errorDiv.textContent = 'Please fill in all fields';
    return;
  }

  if (!isValidEmail(email)) {
    errorDiv.textContent = 'Please enter a valid email address';
    return;
  }

  if (password.length < 6) {
    errorDiv.textContent = 'Password must be at least 6 characters';
    return;
  }

  if (password !== confirm) {
    errorDiv.textContent = 'Passwords do not match';
    return;
  }

  // Disable button during sign up
  const originalText = signUpBtn.textContent;
  signUpBtn.disabled = true;
  signUpBtn.textContent = 'Creating account...';

  try {
    // Call the Python backend API
    const response = await API.call('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    if (response.session && response.session.access_token) {
      // Save full session details and navigate to the app
      API.setToken(response.session.access_token);
      if (response.session.refresh_token) {
        API.setRefreshToken(response.session.refresh_token);
      }
      if (response.household_id) {
        API.setActiveHouseholdId(response.household_id);
      }
      window.location.href = (window.CONFIG && window.CONFIG.BASE_PATH || '') + '/pantry/';
    } else {
      // Account created but no session (email confirmation may be required)
      errorDiv.style.color = 'var(--color-accent-olive, #6b7a3d)';
      errorDiv.textContent = 'Account created! Please check your email to confirm, then sign in.';
      signUpBtn.disabled = false;
      signUpBtn.textContent = originalText;
    }
  } catch (err) {
    console.error('Sign up error:', err);
    errorDiv.textContent = err.message || 'An error occurred. Please try again.';
    signUpBtn.disabled = false;
    signUpBtn.textContent = originalText;
  }
}

/**
 * Handle Quick Access code submission (backend not yet implemented)
 */
async function handleQuickAccess() {
  const codeInput = document.getElementById('landing-quick-code');
  const errorDiv = document.getElementById('landing-quick-error');
  const code = codeInput?.value.trim();

  errorDiv.textContent = '';

  if (!code || code.length !== 5) {
    errorDiv.textContent = 'Please enter your 5-character access code';
    return;
  }

  // Placeholder until backend quick-access endpoint is implemented
  errorDiv.style.color = 'var(--color-accent-olive)';
  errorDiv.textContent = 'Quick Access sign-in coming soon. Please use Password Access for now.';
}

/**
 * Email validation helper
 */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Handle "Try Demo Account" button click
 */
function handleTryDemo() {
  loadDemoAccount();
}

/**
 * Scroll to top and activate the Get Started tab
 */
function scrollToTop(e) {
  e.preventDefault();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  showGetStarted();
}

/* ===================================================================
   INITIALIZATION
   =================================================================== */

/**
 * Initialize landing page - wire up event listeners
 */
function initLandingPage() {
  // Top-level tab buttons
  const tabGetStarted = document.getElementById('tab-get-started');
  const tabSignIn = document.getElementById('tab-sign-in');
  if (tabGetStarted) tabGetStarted.addEventListener('click', showGetStarted);
  if (tabSignIn) tabSignIn.addEventListener('click', showSignIn);

  // Sign-in sub-option buttons
  const btnQuickAccess = document.getElementById('btn-quick-access');
  const btnPasswordAccess = document.getElementById('btn-password-access');
  if (btnQuickAccess) btnQuickAccess.addEventListener('click', showQuickAccess);
  if (btnPasswordAccess) btnPasswordAccess.addEventListener('click', showPasswordAccess);

  // Quick Access submit
  const btnQuick = document.getElementById('landing-quick-btn');
  if (btnQuick) btnQuick.addEventListener('click', handleQuickAccess);

  // Enter key for quick access code input
  const quickCodeInput = document.getElementById('landing-quick-code');
  if (quickCodeInput) {
    quickCodeInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); handleQuickAccess(); }
    });
  }

  // Sign in button
  const btnSignIn = document.getElementById('landing-signin-btn');
  if (btnSignIn) btnSignIn.addEventListener('click', handleLandingSignIn);

  // Sign up button
  const btnSignUp = document.getElementById('landing-signup-btn');
  if (btnSignUp) btnSignUp.addEventListener('click', handleLandingSignUp);

  // Enter key support for password access form
  [document.getElementById('landing-email'), document.getElementById('landing-password')].forEach(input => {
    if (input) {
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); handleLandingSignIn(); }
      });
    }
  });

  // Enter key support for create account form
  [document.getElementById('landing-signup-email'), document.getElementById('landing-signup-password'), document.getElementById('landing-signup-confirm')].forEach(input => {
    if (input) {
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); handleLandingSignUp(); }
      });
    }
  });

  // Demo button
  const btnTryDemo = document.getElementById('landing-try-demo');
  if (btnTryDemo) btnTryDemo.addEventListener('click', handleTryDemo);

  // Scroll to top link
  const linkScrollTop = document.getElementById('landing-scroll-top');
  if (linkScrollTop) linkScrollTop.addEventListener('click', scrollToTop);

  // Password show/hide toggles
  document.querySelectorAll('.landing-pw-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = document.getElementById(btn.dataset.target);
      if (!input) return;
      const showing = input.type === 'text';
      input.type = showing ? 'password' : 'text';
      btn.textContent = showing ? 'Show' : 'Hide';
      btn.setAttribute('aria-label', showing ? 'Show password' : 'Hide password');
    });
  });

  // Demo exit link
  const linkDemoExit = document.getElementById('demo-exit-link');
  if (linkDemoExit) {
    linkDemoExit.addEventListener('click', (e) => {
      e.preventDefault();
      exitDemoMode();
    });
  }

  // Scroll-triggered animations for feature cards
  const featureCards = document.querySelectorAll('.landing-feature-card');
  if (featureCards.length && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    featureCards.forEach(card => observer.observe(card));
  } else {
    featureCards.forEach(card => card.classList.add('visible'));
  }

  // If already authenticated, redirect to the app immediately
  const isAuth = API.getToken() !== null;
  if (isAuth) {
    window.location.href = (window.CONFIG && window.CONFIG.BASE_PATH || '') + '/pantry/';
    return;
  }

  // If in demo mode, redirect to the app
  if (isDemoMode()) {
    window.location.href = (window.CONFIG && window.CONFIG.BASE_PATH || '') + '/pantry/';
    return;
  }

  // Show landing page for unauthenticated visitors
  updateLandingPageVisibility(false);
}

/* ===================================================================
   EXPORTS
   =================================================================== */

window.landing = {
  updateLandingPageVisibility,
  loadDemoAccount,
  exitDemoMode,
  isDemoMode,
  initLandingPage
};

// Initialize landing page when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLandingPage);
} else {
  initLandingPage();
}
