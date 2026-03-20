/* =============================================================
   DEMO TUTORIAL
   Guided walkthrough for demo mode. Runs only when
   localStorage['demo-mode'] === 'true' and a step is queued.
   ============================================================= */

(function () {
  'use strict';

  const BASE     = (window.CONFIG && window.CONFIG.BASE_PATH) || '';
  const STEP_KEY = 'demo-tutorial-step';

  // ── Helpers ──────────────────────────────────────────────────

  function curStep()   { return parseInt(localStorage.getItem(STEP_KEY) ?? '-1', 10); }
  function saveStep(n) { localStorage.setItem(STEP_KEY, String(n)); }
  function clearStep() { localStorage.removeItem(STEP_KEY); }
  function curPage()   { return document.body.dataset.section || ''; }

  function tomorrowKey() {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }

  // Account for demo strip (38px) when present
  function stripH() {
    return document.body.classList.contains('demo-mode-active') ? 38 : 0;
  }

  // Top of safe viewport area (below fixed header + demo strip)
  function safeTop() { return 70 + stripH() + 10; }

  // ── Step definitions ─────────────────────────────────────────

  const STEPS = [

    // 0 — Welcome (pantry)
    {
      id: 'welcome',
      page: 'pantry',
      type: 'center',
      title: 'Welcome to Peachy Pantry',
      body: "A quick 2-minute tour. We\u2019ll add a grocery item, plan a meal for tomorrow, then watch the shopping list do its thing.",
      btn: "Let\u2019s go \u2192"
    },

    // 1 — Pantry overview (pantry)
    {
      id: 'pantry-scan',
      page: 'pantry',
      type: 'spotlight',
      target: '#pantry-ledger-table',
      fallback: '#pantry-section',
      position: 'below',
      title: 'Your Pantry',
      body: 'Everything you have at home, tracked in one place \u2014 categories, quantities, locations, and expiry dates.',
      btn: 'Next \u2192'
    },

    // 2 — Low stock callout (pantry)
    {
      id: 'low-stock',
      page: 'pantry',
      type: 'spotlight',
      target: '.ledger-row-low-stock',
      fallback: '#pantry-ledger-table',
      position: 'below',
      title: 'Running low',
      body: "Items below your minimum threshold are flagged automatically. You set the minimums \u2014 Peachy does the watching.",
      btn: 'Got it \u2192'
    },

    // 3 — Add garlic (pantry) — form pre-filled, user clicks Save
    {
      id: 'add-garlic',
      page: 'pantry',
      type: 'spotlight',
      target: '#panel-add-item',
      fallback: '#pantry-section',
      position: 'right',
      title: 'Adding an item',
      body: "You just got back from the store with garlic. We\u2019ve pre-filled the form: <strong>name, category, unit</strong>, a <strong>minimum of 4</strong> so you get a low-stock alert, and <strong>4 cloves on the Counter</strong>. Take a look at each field, then hit <strong>Save</strong>.",
      waiting: 'Waiting for you to hit Save\u2026',
      waitFor: 'demo-item-saved',
      onShow() {
        if (typeof window.openIngredientModal === 'function') {
          window.openIngredientModal({
            name: 'Garlic',
            category: 'Produce',
            unit: 'cloves',
            min: 4,
            preferredStore: '',
            locations: [{ location: 'Counter', qty: 4, quantity: 4, expiry: '', expiration_date: '' }]
          });
          setTimeout(() => repositionSpot('#panel-add-item', 'right'), 400);
        }
      }
    },

    // 4 — Navigate to meals (pantry)
    {
      id: 'nav-to-meals',
      page: 'pantry',
      type: 'center',
      title: "Now let\u2019s plan dinner",
      body: "Garlic is in your pantry. You\u2019ve got a Chicken Stir-Fry recipe saved \u2014 let\u2019s plan it for tomorrow and see what the shopping list makes of it.",
      btn: 'Go to Meal Planning \u2192',
      navigate: '/meals/'
    },

    // 5 — Plan the meal (meals) — card positioned beside the modal
    {
      id: 'plan-meal',
      page: 'meals',
      type: 'modal-adjacent',
      title: 'Plan a meal',
      body: "Chicken Stir-Fry is pre-selected for tomorrow\u2019s dinner. Take a look, then hit <strong>Add to Plan</strong>.",
      waiting: 'Waiting for you to add the meal\u2026',
      waitFor: 'demo-meal-saved',
      onShow() {
        const key = tomorrowKey();
        if (typeof window.openDayModal === 'function') {
          window.openDayModal(key);
          setTimeout(() => {
            const recSel = document.getElementById('meal-recipe');
            if (recSel) {
              const opt = Array.from(recSel.options).find(o => o.text.toLowerCase().includes('stir'));
              if (opt) recSel.value = opt.value;
            }
            const typeSel = document.getElementById('meal-type');
            if (typeSel) {
              const opt = Array.from(typeSel.options).find(o =>
                o.value.toLowerCase() === 'dinner' || o.text.toLowerCase() === 'dinner'
              );
              if (opt) typeSel.value = opt.value;
            }
            // Reposition card now that modal has rendered
            placeCardAdjacentToModal();
          }, 250);
        }
      }
    },

    // 6 — Navigate to shopping (meals)
    {
      id: 'nav-to-shopping',
      page: 'meals',
      type: 'center',
      title: "Heads up \u2014 you\u2019re short on a few things",
      body: "Chicken Stir-Fry is on the plan for tomorrow. But your pantry doesn\u2019t have everything. Let\u2019s check what you need.",
      btn: 'Check Shopping List \u2192',
      navigate: '/shopping/'
    },

    // 7 — Shopping list reveal (shopping)
    {
      id: 'shopping-reveal',
      page: 'shopping',
      type: 'spotlight',
      target: '#shopping-list',
      fallback: 'main',
      position: 'above',
      title: "Not just tonight\u2019s recipe",
      body: "Peachy built this from two sources: what your <strong>Chicken Stir-Fry</strong> needs, and what your <strong>pantry was already running low on</strong>. One list \u2014 nothing falls through the cracks.",
      btn: 'Next \u2192'
    },

    // 8 — CTA (shopping)
    {
      id: 'cta',
      page: 'shopping',
      type: 'cta',
      title: 'Your kitchen, managed.',
      body: "That\u2019s Peachy Pantry \u2014 your pantry, recipes, meal plan, and shopping list, all connected. Create a free account to start tracking your own kitchen."
    }

  ];

  // ── DOM refs ─────────────────────────────────────────────────

  let overlay, spotBox, card, currentCleanup;

  // ── Styles ───────────────────────────────────────────────────

  function injectStyles() {
    if (document.getElementById('dt-styles')) return;
    const el = document.createElement('style');
    el.id = 'dt-styles';
    el.textContent = `
      #dt-overlay {
        position: fixed; inset: 0; z-index: 8900;
        pointer-events: none;
      }
      #dt-overlay.dt-dimmed {
        background: rgba(0,0,0,0.58);
        pointer-events: all;
      }
      #dt-spot {
        position: fixed;
        border-radius: 6px;
        box-shadow: 0 0 0 9999px rgba(0,0,0,0.55);
        z-index: 8950;
        pointer-events: none;
      }
      #dt-card {
        position: fixed;
        z-index: 9100;
        background: #fffcf5;
        border-radius: 14px;
        padding: 1.4rem 1.6rem;
        max-width: 340px;
        width: calc(100vw - 32px);
        box-shadow: 0 8px 40px rgba(0,0,0,0.28);
        font-family: inherit;
      }
      @media (min-width: 769px) {
        #dt-card { max-width: 400px; }
        #dt-card.dt-centered { max-width: 460px; }
      }
      #dt-card.dt-centered {
        top: 50% !important;
        left: 50% !important;
        transform: translate(-50%, -50%);
        max-width: 440px;
      }
      .dt-label {
        font-size: 0.68rem;
        font-weight: 700;
        letter-spacing: .07em;
        text-transform: uppercase;
        color: #b07d48;
        margin-bottom: .45rem;
      }
      #dt-card h3 {
        margin: 0 0 .55rem;
        font-size: 1.05rem;
        color: #2a241e;
        line-height: 1.35;
      }
      #dt-card p {
        margin: 0 0 1rem;
        font-size: 0.875rem;
        color: #5a4e42;
        line-height: 1.6;
      }
      .dt-actions { display: flex; gap: .6rem; flex-wrap: wrap; align-items: center; }
      .dt-btn-primary {
        background: #d4a96a; color: #fff;
        border: none; border-radius: 8px;
        padding: .55rem 1.1rem;
        font-size: .875rem; font-weight: 600; cursor: pointer;
      }
      .dt-btn-primary:hover { background: #c09058; }
      .dt-btn-ghost {
        background: none; border: none;
        color: #a09080; font-size: .8rem; cursor: pointer; padding: .4rem .2rem;
      }
      .dt-btn-ghost:hover { color: #5a4e42; }
      .dt-waiting {
        font-size: 0.78rem; color: #b07d48; font-style: italic; margin: 0;
      }
      .dt-cta-primary {
        display: block; width: 100%;
        background: #3a7a4a; color: #fff;
        border: none; border-radius: 10px;
        padding: .8rem 1rem;
        font-size: 1rem; font-weight: 700; cursor: pointer;
        text-align: center; margin-bottom: .6rem;
        text-decoration: none;
      }
      .dt-cta-primary:hover { background: #2d6038; }
      .dt-cta-secondary {
        display: block; width: 100%;
        background: none; border: 1px solid #d4c4b0;
        border-radius: 10px; padding: .65rem 1rem;
        font-size: .875rem; color: #5a4e42; cursor: pointer; text-align: center;
      }
      .dt-cta-secondary:hover { background: #f5efe8; }
    `;
    document.head.appendChild(el);
  }

  function buildDOM() {
    if (document.getElementById('dt-card')) return;
    injectStyles();

    overlay = document.createElement('div');
    overlay.id = 'dt-overlay';
    document.body.appendChild(overlay);

    spotBox = document.createElement('div');
    spotBox.id = 'dt-spot';
    spotBox.style.display = 'none';
    document.body.appendChild(spotBox);

    card = document.createElement('div');
    card.id = 'dt-card';
    document.body.appendChild(card);
  }

  function destroyDOM() {
    ['dt-overlay', 'dt-spot', 'dt-card', 'dt-styles'].forEach(id => {
      document.getElementById(id)?.remove();
    });
    overlay = spotBox = card = null;
  }

  // ── Positioning ───────────────────────────────────────────────

  function repositionSpot(selector, position) {
    const el = selector ? document.querySelector(selector) : null;
    if (!el || !spotBox) return;
    placeSpot(el);
    placeCard(el, position || 'below');
  }

  function placeSpot(el) {
    const r   = el.getBoundingClientRect();
    const pad = 8;
    const h   = Math.min(r.height, 460);
    spotBox.style.display = 'block';
    spotBox.style.top    = (r.top  - pad) + 'px';
    spotBox.style.left   = (r.left - pad) + 'px';
    spotBox.style.width  = (r.width  + pad * 2) + 'px';
    spotBox.style.height = (h + pad * 2) + 'px';
  }

  function cardWidth() {
    // Respect the max-width set by CSS (400px on desktop, 340px on mobile)
    return Math.min(window.innerWidth >= 769 ? 400 : 340, window.innerWidth - 32);
  }

  function placeCard(el, pref) {
    const r   = el.getBoundingClientRect();
    const W   = cardWidth();
    const H   = 240; // conservative estimate
    const gap = 18;
    const vw  = window.innerWidth;
    const vh  = window.innerHeight;
    const top0 = safeTop();

    let top, left;

    if (pref === 'below' && r.bottom + H + gap < vh) {
      top  = r.bottom + gap;
      left = Math.max(16, Math.min(r.left, vw - W - 16));
    } else if (pref === 'above' && r.top - H - gap > top0) {
      top  = r.top - H - gap;
      left = Math.max(16, Math.min(r.left, vw - W - 16));
    } else if (pref === 'right' && r.right + W + gap < vw) {
      top  = Math.max(top0, Math.min(r.top, vh - H - 16));
      left = r.right + gap;
    } else if (pref === 'left' && r.left - W - gap > 0) {
      top  = Math.max(top0, Math.min(r.top, vh - H - 16));
      left = r.left - W - gap;
    } else {
      // Fallback: below, clamped to viewport
      top  = Math.min(r.bottom + gap, vh - H - 16);
      left = Math.max(16, Math.min(r.left, vw - W - 16));
    }

    card.style.top  = top  + 'px';
    card.style.left = left + 'px';
    card.style.transform = '';
  }

  // Position card adjacent to an open modal (step 5)
  function placeCardAdjacentToModal() {
    if (!card) return;
    const modalEl = document.querySelector('#modal-root > *');
    const vw  = window.innerWidth;
    const vh  = window.innerHeight;
    const W   = cardWidth();
    const H   = 220;
    const gap = 16;
    const top0 = safeTop();

    if (modalEl) {
      const r = modalEl.getBoundingClientRect();
      // Prefer right of modal on desktop
      if (r.right + W + gap <= vw - 8) {
        card.style.top  = Math.max(top0, Math.min(r.top, vh - H - 16)) + 'px';
        card.style.left = (r.right + gap) + 'px';
      } else if (r.left - W - gap >= 8) {
        card.style.top  = Math.max(top0, Math.min(r.top, vh - H - 16)) + 'px';
        card.style.left = (r.left - W - gap) + 'px';
      } else {
        // Below modal (mobile / narrow screens)
        card.style.top  = Math.min(r.bottom + gap, vh - H - 16) + 'px';
        card.style.left = Math.max(16, (vw - W) / 2) + 'px';
      }
    } else {
      // Modal not found yet — park below safe area
      card.style.top  = top0 + 'px';
      card.style.left = Math.max(16, (vw - W) / 2) + 'px';
    }
    card.style.transform = '';
    card.style.width = W + 'px';
  }

  // ── Rendering ─────────────────────────────────────────────────

  function render(n) {
    if (currentCleanup) { currentCleanup(); currentCleanup = null; }

    const step = STEPS[n];
    if (!step || step.page !== curPage()) return;

    saveStep(n);

    const label = `Step ${n + 1} of ${STEPS.length}`;

    if (step.type === 'center' || step.type === 'cta') {
      renderCenter(step, label);
    } else if (step.type === 'modal-adjacent') {
      renderModalAdjacent(step, label);
    } else {
      renderSpotlight(step, label);
    }

    if (step.onShow) step.onShow();

    if (step.waitFor) {
      const handler = () => advance();
      window.addEventListener(step.waitFor, handler, { once: true });
      currentCleanup = () => window.removeEventListener(step.waitFor, handler);
    }
  }

  function renderCenter(step, label) {
    if (spotBox) spotBox.style.display = 'none';
    if (overlay) overlay.classList.add('dt-dimmed');

    card.className = 'dt-centered';

    if (step.type === 'cta') {
      card.innerHTML = `
        <div class="dt-label">${label}</div>
        <h3>${step.title}</h3>
        <p>${step.body}</p>
        <button class="dt-cta-primary" onclick="window.demoCreateAccount()">Create a free account \u2192</button>
        <button class="dt-cta-secondary" onclick="window.demoTutorial.finish()">Keep exploring the demo</button>
      `;
    } else {
      card.innerHTML = `
        <div class="dt-label">${label}</div>
        <h3>${step.title}</h3>
        <p>${step.body}</p>
        <div class="dt-actions">
          <button class="dt-btn-primary" id="dt-next-btn">${step.btn || 'Next \u2192'}</button>
          <button class="dt-btn-ghost" onclick="window.demoTutorial.finish()">Skip tour</button>
        </div>
      `;
      document.getElementById('dt-next-btn').addEventListener('click', () => advance());
    }
  }

  // Modal-adjacent: no extra dimming (modal provides its own backdrop),
  // card positioned beside the modal so the form stays fully accessible.
  function renderModalAdjacent(step, label) {
    if (spotBox) spotBox.style.display = 'none';
    if (overlay) overlay.classList.remove('dt-dimmed');

    buildSpotCard(step, label);

    // Initial placement (modal may not exist yet — onShow will reposition)
    placeCardAdjacentToModal();
  }

  function renderSpotlight(step, label) {
    if (overlay) overlay.classList.remove('dt-dimmed');

    const target   = step.target  ? document.querySelector(step.target)  : null;
    const fallback = step.fallback ? document.querySelector(step.fallback) : null;
    const el       = target || fallback;

    if (el) {
      placeSpot(el);
      buildSpotCard(step, label);
      placeCard(el, step.position || 'below');
    } else {
      if (spotBox) spotBox.style.display = 'none';
      if (overlay) overlay.classList.add('dt-dimmed');
      buildSpotCard(step, label);
      card.className = 'dt-centered';
    }
  }

  function buildSpotCard(step, label) {
    card.className = '';
    card.style.transform = '';

    const footer = step.waitFor
      ? `<p class="dt-waiting">${step.waiting || 'Waiting for you to complete the action\u2026'}</p>`
      : `<div class="dt-actions">
           <button class="dt-btn-primary" id="dt-next-btn">${step.btn || 'Next \u2192'}</button>
           <button class="dt-btn-ghost" onclick="window.demoTutorial.finish()">Skip tour</button>
         </div>`;

    card.innerHTML = `
      <div class="dt-label">${label}</div>
      <h3>${step.title}</h3>
      <p>${step.body}</p>
      ${footer}
    `;

    if (!step.waitFor) {
      document.getElementById('dt-next-btn')?.addEventListener('click', () => advance());
    }
  }

  // ── Navigation ────────────────────────────────────────────────

  function advance() {
    const currentN = curStep();
    const n        = currentN + 1;

    if (n >= STEPS.length) { finish(); return; }

    const currentStep = STEPS[currentN];
    const nextStep    = STEPS[n];

    if (nextStep.page !== curPage()) {
      saveStep(n);
      window.location.href = BASE + (currentStep.navigate || '/');
      return;
    }

    render(n);
  }

  function finish() {
    if (currentCleanup) { currentCleanup(); currentCleanup = null; }
    clearStep();
    destroyDOM();
  }

  // ── Bootstrap ─────────────────────────────────────────────────

  function start() {
    if (localStorage.getItem('demo-mode') !== 'true') return;

    const n    = curStep();
    const step = n >= 0 ? STEPS[n] : null;
    if (!step || step.page !== curPage()) return;

    buildDOM();
    render(n);
  }

  // Public API
  window.demoTutorial = { advance, finish };

  // Wait for the app to finish loading demo data before starting
  window.addEventListener('demo-app-ready', start);

}());
