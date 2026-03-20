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
 * Saved to localStorage only — demo mode, no API calls.
 *
 * Narrative: pantry is mostly stocked but a few items are running low.
 * The tutorial walks the user through adding garlic, planning Chicken
 * Stir-Fry for tomorrow, then reveals the shopping list showing both
 * the recipe gaps and the unrelated low-stock items.
 */
function buildDemoData() {
  return {
    pantry: [
      // ── Stir-Fry ingredients (recipe is planned during tutorial) ──
      {
        id: 'demo-pantry-1',
        name: 'Chicken Breast',
        unit: 'lb',
        category: 'Meat',
        min: 1,
        totalQty: 1.5,
        locations: [{ id: 'demo-loc-1', location: 'Freezer', qty: 1.5, expiry: demoDate(30) }],
        notes: ''
      },
      {
        // Missing entirely — recipe gap
        id: 'demo-pantry-2',
        name: 'Bell Pepper',
        unit: 'whole',
        category: 'Produce',
        min: 2,
        totalQty: 0,
        locations: [],
        notes: ''
      },
      {
        id: 'demo-pantry-3',
        name: 'Broccoli',
        unit: 'cup',
        category: 'Produce',
        min: 1,
        totalQty: 2,
        locations: [{ id: 'demo-loc-3', location: 'Fridge', qty: 2, expiry: demoDate(4) }],
        notes: ''
      },
      {
        // Low threshold AND recipe gap — shows merged breakdown
        id: 'demo-pantry-4',
        name: 'Soy Sauce',
        unit: 'tbsp',
        category: 'Condiments',
        min: 3,
        totalQty: 1,
        locations: [{ id: 'demo-loc-4', location: 'Pantry', qty: 1, expiry: '' }],
        notes: ''
      },
      {
        id: 'demo-pantry-5',
        name: 'Sesame Oil',
        unit: 'tbsp',
        category: 'Oils',
        min: 2,
        totalQty: 3,
        locations: [{ id: 'demo-loc-5', location: 'Pantry', qty: 3, expiry: '' }],
        notes: ''
      },
      {
        // Low threshold AND recipe gap — shows merged breakdown
        id: 'demo-pantry-6',
        name: 'Rice',
        unit: 'cup',
        category: 'Grains',
        min: 1.5,
        totalQty: 0.5,
        locations: [{ id: 'demo-loc-6', location: 'Pantry', qty: 0.5, expiry: '' }],
        notes: ''
      },
      // ── Other items — low stock, unrelated to tonight's recipe ──
      {
        id: 'demo-pantry-7',
        name: 'Eggs',
        unit: 'unit',
        category: 'Dairy',
        min: 6,
        totalQty: 3,
        locations: [{ id: 'demo-loc-7', location: 'Fridge', qty: 3, expiry: demoDate(7) }],
        notes: ''
      },
      {
        id: 'demo-pantry-8',
        name: 'Milk',
        unit: 'gal',
        category: 'Dairy',
        min: 1,
        totalQty: 0.5,
        locations: [{ id: 'demo-loc-8', location: 'Fridge', qty: 0.5, expiry: demoDate(3) }],
        notes: ''
      },
      // ── Well-stocked items — makes pantry feel real ──
      {
        id: 'demo-pantry-9',
        name: 'Pasta',
        unit: 'lb',
        category: 'Grains',
        min: 0.5,
        totalQty: 1,
        locations: [{ id: 'demo-loc-9', location: 'Pantry', qty: 1, expiry: '' }],
        notes: ''
      },
      {
        id: 'demo-pantry-10',
        name: 'Olive Oil',
        unit: 'bottle',
        category: 'Oils',
        min: 1,
        totalQty: 1.5,
        locations: [{ id: 'demo-loc-10', location: 'Pantry', qty: 1.5, expiry: '' }],
        notes: ''
      },
      {
        id: 'demo-pantry-11',
        name: 'Onion',
        unit: 'whole',
        category: 'Produce',
        min: 2,
        totalQty: 3,
        locations: [{ id: 'demo-loc-11', location: 'Counter', qty: 3, expiry: '' }],
        notes: ''
      }
      // Note: Garlic is intentionally absent — the tutorial adds it
    ],
    recipes: [
      {
        id: 'demo-recipe-1',
        name: 'Spaghetti Bolognese',
        servings: 4,
        ingredients: [
          { name: 'Pasta', qty: 0.5, unit: 'lb' },
          { name: 'Olive Oil', qty: 2, unit: 'tbsp' },
          { name: 'Onion', qty: 1, unit: 'whole' }
        ],
        instructions: '1. Boil pasta until al dente\n2. Saut\u00E9 onion in olive oil\n3. Add sauce and simmer 20 minutes\n4. Toss with pasta and serve',
        photo: '',
        tags: ['Main Dish', 'Italian'],
        isFavorite: true
      },
      {
        id: 'demo-recipe-2',
        name: 'Veggie Omelette',
        servings: 2,
        ingredients: [
          { name: 'Eggs', qty: 3, unit: 'unit' },
          { name: 'Milk', qty: 2, unit: 'tbsp' },
          { name: 'Olive Oil', qty: 1, unit: 'tbsp' }
        ],
        instructions: '1. Whisk eggs and milk\n2. Heat oil in non-stick pan\n3. Pour egg mixture and cook until edges set\n4. Fold and serve',
        photo: '',
        tags: ['Breakfast', 'Quick', 'Vegetarian'],
        isFavorite: false
      },
      {
        // Tutorial target recipe — partially stocked
        id: 'demo-recipe-3',
        name: 'Chicken Stir-Fry',
        servings: 2,
        ingredients: [
          { name: 'Chicken Breast', qty: 1, unit: 'lb' },
          { name: 'Bell Pepper', qty: 2, unit: 'whole' },
          { name: 'Broccoli', qty: 1, unit: 'cup' },
          { name: 'Soy Sauce', qty: 2, unit: 'tbsp' },
          { name: 'Sesame Oil', qty: 1, unit: 'tbsp' },
          { name: 'Rice', qty: 2, unit: 'cup' },
          { name: 'Garlic', qty: 2, unit: 'cloves' }
        ],
        instructions: '1. Cook rice per package instructions\n2. Slice chicken and stir-fry 5-6 minutes\n3. Add vegetables and cook 3-4 minutes\n4. Add soy sauce and sesame oil\n5. Mince garlic and stir in\n6. Serve over rice',
        photo: '',
        tags: ['Main Dish', 'Asian', 'Quick'],
        isFavorite: true
      }
    ],
    planner: {
      // Past cooked meals — gives the calendar history
      [demoDate(-3)]: [
        { id: 'demo-meal-1', recipeId: 'demo-recipe-1', mealType: 'Dinner', cooked: true }
      ],
      [demoDate(-1)]: [
        { id: 'demo-meal-2', recipeId: 'demo-recipe-2', mealType: 'Breakfast', cooked: true }
      ]
      // Tomorrow is deliberately empty — tutorial plans Chicken Stir-Fry there
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
    localStorage.setItem('demo-tutorial-step', '0');
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
    localStorage.removeItem('demo-tutorial-step');
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
  document.getElementById('landing-quick-fallback').style.display = 'none';
  clearErrors();

  // Show first-time fields only when this browser has no device token yet
  const isFirstTime = !localStorage.getItem('ck-device-token');
  document.getElementById('quick-access-first-time').style.display = isFirstTime ? 'block' : 'none';
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
 * Handle Quick Access code submission.
 *
 * Returning browser  — sends { code, device_token }
 * First-time browser — sends { code, email, password }
 *
 * On success the device_token is persisted in localStorage so future
 * logins on this browser only need the 5-char code.
 */
async function handleQuickAccess() {
  const codeInput    = document.getElementById('landing-quick-code');
  const errorDiv     = document.getElementById('landing-quick-error');
  const btn          = document.getElementById('landing-quick-btn');
  const fallbackBtn  = document.getElementById('landing-quick-fallback');

  errorDiv.textContent   = '';
  errorDiv.style.color   = '#d32f2f';
  fallbackBtn.style.display = 'none';

  const code = (codeInput?.value || '').trim().toUpperCase();
  if (!code || code.length !== 5) {
    errorDiv.textContent = 'Please enter your 5-character access code';
    return;
  }

  const deviceToken = localStorage.getItem('ck-device-token');
  let body;

  if (deviceToken) {
    body = { code, device_token: deviceToken };
  } else {
    const email    = document.getElementById('landing-quick-email')?.value.trim();
    const password = document.getElementById('landing-quick-password')?.value;
    if (!email || !password) {
      errorDiv.textContent = 'Please enter your email and password for first-time verification';
      return;
    }
    body = { code, email, password };
  }

  const originalText = btn.textContent;
  btn.disabled    = true;
  btn.textContent = 'Verifying…';

  try {
    const response = await API.call('/auth/quickaccess', {
      method: 'POST',
      body:   JSON.stringify(body)
    });

    if (response.session && response.session.access_token) {
      if (response.device_token) {
        localStorage.setItem('ck-device-token', response.device_token);
      }
      API.setToken(response.session.access_token);
      if (response.session.refresh_token) {
        API.setRefreshToken(response.session.refresh_token);
      }
      if (response.household_id) {
        API.setActiveHouseholdId(response.household_id);
      }
      window.location.href = (window.CONFIG && window.CONFIG.BASE_PATH || '') + '/pantry/';
    }
  } catch (err) {
    // If the device token was rejected, clear it so next attempt goes
    // back through the first-time verification flow
    if (deviceToken && err.message && err.message.toLowerCase().includes('invalid')) {
      localStorage.removeItem('ck-device-token');
      document.getElementById('quick-access-first-time').style.display = 'block';
    }
    errorDiv.textContent = err.message || 'Verification failed. Please try again.';
    fallbackBtn.style.display = 'block';
    btn.disabled    = false;
    btn.textContent = originalText;
  }
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

  // Fallback — switch to Password Access after a failure
  const btnQuickFallback = document.getElementById('landing-quick-fallback');
  if (btnQuickFallback) btnQuickFallback.addEventListener('click', showPasswordAccess);

  // Enter key for quick access inputs
  ['landing-quick-code', 'landing-quick-email', 'landing-quick-password'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); handleQuickAccess(); }
    });
  });

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

  // Scroll-triggered animations
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    document.querySelectorAll('.landing-feature-card, .fade-in-up').forEach(el => {
      revealObserver.observe(el);
    });
  } else {
    // Fallback: show everything immediately
    document.querySelectorAll('.landing-feature-card, .fade-in-up').forEach(el => {
      el.classList.add('visible');
    });
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
