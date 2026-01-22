// ===== HELPER =====
function safeSetInnerHTMLById(id, html) {
  const el = document.getElementById(id);
  if (!el) {
    console.warn(`safeSetInnerHTMLById: element with id="${id}" not found. Skipping update.`);
    return false;
  }
  el.innerHTML = html;
  return true;
}

// ===== DASHBOARD MODULE =====
const Dashboard = {
  container: null,

  init() {
    this.container = document.getElementById('dashboard');

    // Bind buttons inside dashboard if needed
    this.bindButtons();
  },

  bindButtons() {
    if (!this.container) return;

    const refreshBtn = this.container.querySelector('#dashboard-refresh-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        this.load();
      });
    }

    // Add more button bindings here
  },

  async load() {
    if (!this.container) {
      console.warn('Dashboard container missing; skipping load.');
      return;
    }

    // Show loading placeholder immediately
    safeSetInnerHTMLById('dashboard', '<p>Loading dashboard...</p>');

    try {
      const data = await API.call('/api/alerts/dashboard'); // <-- ensure correct endpoint

      const pantryCount = data?.pantry_count ?? 0;
      const recipeCount = data?.recipe_count ?? 0;

      const html = `
        <p>Pantry: ${pantryCount}</p>
        <p>Recipes: ${recipeCount}</p>
      `;

      safeSetInnerHTMLById('dashboard', html);

      // Re-bind buttons after content update (if needed)
      this.bindButtons();

    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      safeSetInnerHTMLById('dashboard', '<p>Unable to load dashboard</p>');
    }
  }
};

// ===== APP INIT =====
document.addEventListener("DOMContentLoaded", async () => {
  console.log("APP INIT START");

  Dashboard.init();
  Dashboard.load(); // no need to await, page can render while data loads

  console.log("APP INIT COMPLETE");
});
