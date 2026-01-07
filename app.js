/* ---------------------------------------------------
   Chef's Cove — Cottagecore Edition
   PART 1: State, Storage, Utilities, Modal System
--------------------------------------------------- */

/* -----------------------------
   GLOBAL STATE (Empty Start)
----------------------------- */
let pantry = [];          // { id, name, category, locations: [{place, qty}], unit, expiry }
let recipes = [];         // { id, name, ingredients: [...], steps: "...", tags: [] }
let planner = {};         // { "2026-01-07": recipeId }
let shopping = [];        // { id, name, source, checked }
let seasonal = [];        // generated dynamically

/* -----------------------------
   LOCAL STORAGE HELPERS
----------------------------- */
function saveState() {
  localStorage.setItem("cc_pantry", JSON.stringify(pantry));
  localStorage.setItem("cc_recipes", JSON.stringify(recipes));
  localStorage.setItem("cc_planner", JSON.stringify(planner));
  localStorage.setItem("cc_shopping", JSON.stringify(shopping));
}

function loadState() {
  pantry = JSON.parse(localStorage.getItem("cc_pantry")) || [];
  recipes = JSON.parse(localStorage.getItem("cc_recipes")) || [];
  planner = JSON.parse(localStorage.getItem("cc_planner")) || {};
  shopping = JSON.parse(localStorage.getItem("cc_shopping")) || [];
}

/* -----------------------------
   UTILITY FUNCTIONS
----------------------------- */
function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

function formatDatePretty(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
}

function getWeekDates() {
  const today = new Date();
  const day = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((day + 6) % 7));

  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(d.toISOString().split("T")[0]);
  }
  return days;
}

/* -----------------------------
   MODAL SYSTEM (Dynamic)
----------------------------- */
let modalRoot = null;

function injectModalRoot() {
  modalRoot = document.createElement("div");
  modalRoot.id = "modal-root";
  document.body.appendChild(modalRoot);
}

function closeModal() {
  if (modalRoot) modalRoot.innerHTML = "";
}

function showModal(html) {
  modalRoot.innerHTML = `
    <div class="modal-overlay">
      <div class="modal-card">
        ${html}
      </div>
    </div>
  `;

  // Close on overlay click
  modalRoot.querySelector(".modal-overlay").addEventListener("click", (e) => {
    if (e.target.classList.contains("modal-overlay")) closeModal();
  });
}

/* -----------------------------
   SECTION REFERENCES
----------------------------- */
let elPantryList;
let elRecipeList;
let elDayGrid;
let elShoppingList;
let elSeasonalList;
let elDashTodayMeal;
let elDashReadyRecipes;

function hookElements() {
  elPantryList = document.getElementById("pantry-display");
  elRecipeList = document.getElementById("recipe-list");
  elDayGrid = document.getElementById("day-grid");
  elShoppingList = document.getElementById("shopping-list");
  elSeasonalList = document.getElementById("seasonal-list");
  elDashTodayMeal = document.getElementById("dash-today-meal");
  elDashReadyRecipes = document.getElementById("dash-ready-recipes");
}

/* ---------------------------------------------------
   PART 2: Pantry Logic & Rendering
--------------------------------------------------- */

/* -----------------------------
   PANTRY RENDERING
----------------------------- */

function getTotalQty(pantryItem) {
  return pantryItem.locations?.reduce((sum, loc) => sum + (Number(loc.qty) || 0), 0) || 0;
}

function renderPantry() {
  if (!elPantryList) return;

  const categoryFilter = document.getElementById("filter-category")?.value || "";
  elPantryList.innerHTML = "";

  const items = pantry
    .filter(item => !categoryFilter || item.category === categoryFilter)
    .sort((a, b) => a.name.localeCompare(b.name));

  if (!items.length) {
    elPantryList.innerHTML = `<p>No ingredients yet. Start by stocking your pantry with what you really use.</p>`;
    return;
  }

  items.forEach(item => {
    const totalQty = getTotalQty(item);
    const low = totalQty <= 0;

    const expiryText = item.expiry
      ? `Best before: ${formatDatePretty(item.expiry)}`
      : `No expiry set`;

    const locationsText = item.locations && item.locations.length
      ? item.locations.map(loc => `${loc.place}: ${loc.qty} ${item.unit || ""}`).join(" · ")
      : `No locations yet`;

    const barPercent = Math.max(5, Math.min(100, totalQty * 20)); // super soft visual

    const div = document.createElement("div");
    div.className = "pantry-item";
    div.innerHTML = `
      <h3>${item.name}</h3>
      <div class="pantry-locations">${locationsText}</div>
      <p><em>${item.category || "Uncategorized"}</em></p>
      <p>${expiryText}</p>
      <div class="bar-container">
        <div class="bar-fill ${low ? "low" : ""}" style="width:${barPercent}%;"></div>
      </div>
      <div style="margin-top:10px; display:flex; gap:8px; flex-wrap:wrap;">
        <button class="btn btn-ghost btn-edit-ingredient" data-id="${item.id}">Edit</button>
        <button class="btn btn-ghost btn-delete-ingredient" data-id="${item.id}">Remove</button>
      </div>
    `;

    elPantryList.appendChild(div);
  });

  attachPantryItemButtons();
}

/* -----------------------------
   PANTRY MODALS
----------------------------- */

function openIngredientModal(existingId = null) {
  const editing = !!existingId;
  const item = editing ? pantry.find(p => p.id === existingId) : null;

  const name = editing ? item.name : "";
  const category = editing ? item.category || "" : "";
  const unit = editing ? item.unit || "" : "";
  const expiry = editing ? (item.expiry || "") : "";
  const firstLocation = editing && item.locations && item.locations[0]
    ? item.locations[0].place
    : "";
  const firstQty = editing && item.locations && item.locations[0]
    ? item.locations[0].qty
    : "";

  showModal(`
    <h2>${editing ? "Edit ingredient" : "Add ingredient"}</h2>
    <p>Keep it honest and human. Name it how you think of it.</p>
    <form id="ingredient-form">
      <label>
        Name<br>
        <input type="text" id="ing-name" value="${name}">
      </label>
      <br><br>
      <label>
        Category<br>
        <select id="ing-category">
          <option value="">Choose</option>
          <option value="Meat" ${category === "Meat" ? "selected" : ""}>Meat</option>
          <option value="Dairy" ${category === "Dairy" ? "selected" : ""}>Dairy</option>
          <option value="Produce" ${category === "Produce" ? "selected" : ""}>Produce</option>
          <option value="Pantry" ${category === "Pantry" ? "selected" : ""}>Pantry Staples</option>
          <option value="Frozen" ${category === "Frozen" ? "selected" : ""}>Frozen</option>
          <option value="Spices" ${category === "Spices" ? "selected" : ""}>Spices</option>
          <option value="Other" ${category === "Other" ? "selected" : ""}>Other</option>
        </select>
      </label>
      <br><br>
      <label>
        Soft unit (cups, pieces, bags, etc.)<br>
        <input type="text" id="ing-unit" value="${unit}">
      </label>
      <br><br>
      <label>
        Location<br>
        <input type="text" id="ing-location" placeholder="Fridge, Freezer, Pantry..." value="${firstLocation}">
      </label>
      <br><br>
      <label>
        Quantity<br>
        <input type="number" step="0.1" id="ing-qty" value="${firstQty}">
      </label>
      <br><br>
      <label>
        Best-by date (optional)<br>
        <input type="date" id="ing-expiry" value="${expiry}">
      </label>
      <br><br>
      <div style="display:flex; gap:10px; justify-content:flex-end; margin-top:10px;">
        <button type="button" class="btn btn-ghost" id="btn-cancel-ingredient">Cancel</button>
        <button type="submit" class="btn">${editing ? "Save changes" : "Add to pantry"}</button>
      </div>
    </form>
  `);

  const form = document.getElementById("ingredient-form");
  const btnCancel = document.getElementById("btn-cancel-ingredient");

  btnCancel.addEventListener("click", (e) => {
    e.preventDefault();
    closeModal();
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const ingName = document.getElementById("ing-name").value.trim();
    const ingCat = document.getElementById("ing-category").value;
    const ingUnit = document.getElementById("ing-unit").value.trim();
    const ingLoc = document.getElementById("ing-location").value.trim();
    const ingQty = parseFloat(document.getElementById("ing-qty").value || "0");
    const ingExp = document.getElementById("ing-expiry").value || "";

    if (!ingName) {
      alert("Give this ingredient a name you’ll recognize.");
      return;
    }

    if (editing && item) {
      item.name = ingName;
      item.category = ingCat;
      item.unit = ingUnit;
      item.expiry = ingExp || null;
      item.locations = ingLoc
        ? [{ place: ingLoc, qty: ingQty || 0 }]
        : [];
    } else {
      const newItem = {
        id: uid(),
        name: ingName,
        category: ingCat,
        unit: ingUnit,
        expiry: ingExp || null,
        locations: ingLoc
          ? [{ place: ingLoc, qty: ingQty || 0 }]
          : []
      };
      pantry.push(newItem);
    }

    saveState();
    renderPantry();
    closeModal();
  });
}

/* -----------------------------
   PANTRY ITEM BUTTONS
----------------------------- */

function attachPantryItemButtons() {
  const editButtons = document.querySelectorAll(".btn-edit-ingredient");
  const deleteButtons = document.querySelectorAll(".btn-delete-ingredient");

  editButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      openIngredientModal(id);
    });
  });

  deleteButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      const item = pantry.find(p => p.id === id);
      const confirmDelete = confirm(
        item
          ? `Remove "${item.name}" from your pantry?`
          : "Remove this ingredient?"
      );
      if (!confirmDelete) return;
      pantry = pantry.filter(p => p.id !== id);
      saveState();
      renderPantry();
    });
  });
}

/* -----------------------------
   PANTRY EVENT HOOKS
----------------------------- */

function setupPantryInteractions() {
  const btnAdd = document.getElementById("btn-add-ingredient");
  const filterCat = document.getElementById("filter-category");

  if (btnAdd) {
    btnAdd.addEventListener("click", () => openIngredientModal(null));
  }

  if (filterCat) {
    filterCat.addEventListener("change", () => renderPantry());
  }
}

/* ---------------------------------------------------
   PART 3: Recipes — Cards, Modals, Cooking Flow
--------------------------------------------------- */

/* -----------------------------
   RENDER RECIPE GRID
----------------------------- */

function renderRecipes() {
  if (!elRecipeList) return;

  if (!recipes.length) {
    elRecipeList.innerHTML = `<p>No recipes yet. Start by adding something cozy.</p>`;
    return;
  }

  elRecipeList.innerHTML = "";

  recipes
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach(recipe => {
      const ready = recipe.ingredients.every(ing => {
        const pantryItem = pantry.find(p => p.name.toLowerCase() === ing.name.toLowerCase());
        if (!pantryItem) return false;
        const total = getTotalQty(pantryItem);
        return total >= ing.qty;
      });

      const card = document.createElement("div");
      card.className = "recipe-card";
      card.setAttribute("data-id", recipe.id);

      card.innerHTML = `
        <div class="recipe-name">${recipe.name}</div>
        <div class="recipe-status">${ready ? "Ready to cook" : "Missing ingredients"}</div>
        <div class="recipe-tags">
          ${(recipe.tags || []).map(t => `<span class="tag">${t}</span>`).join("")}
        </div>
      `;

      card.addEventListener("click", () => openRecipeViewModal(recipe.id));
      elRecipeList.appendChild(card);
    });
}

/* -----------------------------
   RECIPE VIEW MODAL
----------------------------- */

function openRecipeViewModal(id) {
  const recipe = recipes.find(r => r.id === id);
  if (!recipe) return;

  const ingredientsHTML = recipe.ingredients
    .map(ing => {
      const pantryItem = pantry.find(p => p.name.toLowerCase() === ing.name.toLowerCase());
      const total = pantryItem ? getTotalQty(pantryItem) : 0;
      const enough = total >= ing.qty;

      return `
        <li>
          ${ing.qty} ${ing.unit || ""} ${ing.name}
          <span style="opacity:0.7;">(${enough ? "✓" : "✗"})</span>
        </li>
      `;
    })
    .join("");

  const stepsHTML = recipe.steps
    ? `<p style="white-space:pre-wrap;">${recipe.steps}</p>`
    : `<p>No steps added yet.</p>`;

  showModal(`
    <h2>${recipe.name}</h2>
    <h3>Ingredients</h3>
    <ul>${ingredientsHTML}</ul>
    <h3>Steps</h3>
    ${stepsHTML}

    <div style="display:flex; gap:10px; margin-top:20px; flex-wrap:wrap;">
      <button class="btn btn-ghost" id="btn-edit-recipe" data-id="${recipe.id}">Edit</button>
      <button class="btn btn-ghost" id="btn-delete-recipe" data-id="${recipe.id}">Delete</button>
      <button class="btn" id="btn-cook-recipe" data-id="${recipe.id}">Cook now</button>
    </div>
  `);

  document.getElementById("btn-edit-recipe").addEventListener("click", () => {
    closeModal();
    openRecipeEditModal(recipe.id);
  });

  document.getElementById("btn-delete-recipe").addEventListener("click", () => {
    const confirmDelete = confirm(`Delete recipe "${recipe.name}"?`);
    if (!confirmDelete) return;
    recipes = recipes.filter(r => r.id !== recipe.id);
    saveState();
    renderRecipes();
    closeModal();
  });

  document.getElementById("btn-cook-recipe").addEventListener("click", () => {
    closeModal();
    openCookConfirmModal(recipe.id);
  });
}

/* -----------------------------
   ADD / EDIT RECIPE MODAL
----------------------------- */

function openRecipeEditModal(existingId = null) {
  const editing = !!existingId;
  const recipe = editing ? recipes.find(r => r.id === existingId) : null;

  const name = editing ? recipe.name : "";
  const tags = editing ? (recipe.tags || []).join(", ") : "";
  const steps = editing ? recipe.steps || "" : "";

  const ingredients = editing ? recipe.ingredients : [];

  showModal(`
    <h2>${editing ? "Edit recipe" : "New recipe"}</h2>
    <form id="recipe-form">
      <label>
        Name<br>
        <input type="text" id="rec-name" value="${name}">
      </label>
      <br><br>

      <label>
        Tags (comma separated)<br>
        <input type="text" id="rec-tags" value="${tags}">
      </label>
      <br><br>

      <label>
        Ingredients<br>
        <div id="ingredient-list">
          ${ingredients
            .map(
              ing => `
            <div class="recipe-ing-row">
              <input type="text" class="ing-name" value="${ing.name}" placeholder="Name">
              <input type="number" class="ing-qty" value="${ing.qty}" step="0.1" placeholder="Qty">
              <input type="text" class="ing-unit" value="${ing.unit || ""}" placeholder="Unit">
            </div>
          `
            )
            .join("")}
        </div>
        <button type="button" class="btn btn-ghost" id="btn-add-ing-row">Add ingredient</button>
      </label>
      <br><br>

      <label>
        Steps<br>
        <textarea id="rec-steps" rows="5">${steps}</textarea>
      </label>

      <br><br>
      <div style="display:flex; gap:10px; justify-content:flex-end;">
        <button type="button" class="btn btn-ghost" id="btn-cancel-recipe">Cancel</button>
        <button type="submit" class="btn">${editing ? "Save changes" : "Add recipe"}</button>
      </div>
    </form>
  `);

  document.getElementById("btn-cancel-recipe").addEventListener("click", () => closeModal());

  document.getElementById("btn-add-ing-row").addEventListener("click", () => {
    const list = document.getElementById("ingredient-list");
    const row = document.createElement("div");
    row.className = "recipe-ing-row";
    row.innerHTML = `
      <input type="text" class="ing-name" placeholder="Name">
      <input type="number" class="ing-qty" step="0.1" placeholder="Qty">
      <input type="text" class="ing-unit" placeholder="Unit">
    `;
    list.appendChild(row);
  });

  document.getElementById("recipe-form").addEventListener("submit", (e) => {
    e.preventDefault();

    const recName = document.getElementById("rec-name").value.trim();
    const recTags = document.getElementById("rec-tags").value
      .split(",")
      .map(t => t.trim())
      .filter(Boolean);
    const recSteps = document.getElementById("rec-steps").value.trim();

    if (!recName) {
      alert("Give this recipe a name that feels like home.");
      return;
    }

    const ingRows = [...document.querySelectorAll(".recipe-ing-row")];
    const recIngredients = ingRows
      .map(row => {
        const name = row.querySelector(".ing-name").value.trim();
        const qty = parseFloat(row.querySelector(".ing-qty").value || "0");
        const unit = row.querySelector(".ing-unit").value.trim();
        if (!name) return null;
        return { name, qty, unit };
      })
      .filter(Boolean);

    if (editing) {
      recipe.name = recName;
      recipe.tags = recTags;
      recipe.steps = recSteps;
      recipe.ingredients = recIngredients;
    } else {
      recipes.push({
        id: uid(),
        name: recName,
        tags: recTags,
        steps: recSteps,
        ingredients: recIngredients
      });
    }

    saveState();
    renderRecipes();
    closeModal();
  });
}

/* -----------------------------
   COOKING FLOW
----------------------------- */

function openCookConfirmModal(id) {
  const recipe = recipes.find(r => r.id === id);
  if (!recipe) return;

  showModal(`
    <h2>Cook "${recipe.name}"?</h2>
    <p>This will gently subtract ingredients from your pantry.</p>
    <div style="display:flex; gap:10px; justify-content:flex-end; margin-top:20px;">
      <button class="btn btn-ghost" id="btn-cancel-cook">Cancel</button>
      <button class="btn" id="btn-confirm-cook">Cook</button>
    </div>
  `);

  document.getElementById("btn-cancel-cook").addEventListener("click", () => closeModal());

  document.getElementById("btn-confirm-cook").addEventListener("click", () => {
    recipe.ingredients.forEach(ing => {
      const pantryItem = pantry.find(p => p.name.toLowerCase() === ing.name.toLowerCase());
      if (!pantryItem) return;

      let remaining = ing.qty;

      pantryItem.locations.forEach(loc => {
        if (remaining <= 0) return;
        const used = Math.min(loc.qty, remaining);
        loc.qty -= used;
        remaining -= used;
      });

      pantryItem.locations = pantryItem.locations.filter(loc => loc.qty > 0);
    });

    saveState();
    renderPantry();
    renderRecipes();
    closeModal();
  });
}

/* -----------------------------
   RECIPE EVENT HOOKS
----------------------------- */

function setupRecipeInteractions() {
  const btnNew = document.getElementById("btn-new-recipe");
  if (btnNew) {
    btnNew.addEventListener("click", () => openRecipeEditModal(null));
  }
}

/* ---------------------------------------------------
   PART 4: Planner & Dashboard (Monthly Calendar)
--------------------------------------------------- */

/* -----------------------------
   MONTH HELPERS
----------------------------- */

function getCurrentMonthInfo() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0–11

  // First day of month
  const first = new Date(year, month, 1);
  const firstWeekday = first.getDay(); // 0=Sun, 1=Mon, ...

  // Days in month
  const nextMonth = new Date(year, month + 1, 0);
  const daysInMonth = nextMonth.getDate();

  return { year, month, firstWeekday, daysInMonth };
}

function getMonthLabel() {
  const now = new Date();
  return now.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric"
  });
}

/* -----------------------------
   RENDER MONTHLY PLANNER (7x6)
----------------------------- */

function renderPlanner() {
  if (!elDayGrid) return;

  const { year, month, firstWeekday, daysInMonth } = getCurrentMonthInfo();

  elDayGrid.innerHTML = "";

  // Add a heading inside the planner section if desired
  const plannerTitle = document.getElementById("planner-month-label");
  if (plannerTitle) {
    plannerTitle.textContent = getMonthLabel();
  }

  // Always render 6 rows x 7 columns = 42 cells
  const totalCells = 42;

  for (let cellIndex = 0; cellIndex < totalCells; cellIndex++) {
    const dayNumber = cellIndex - firstWeekday + 1;
    const validDay = dayNumber >= 1 && dayNumber <= daysInMonth;

    const cell = document.createElement("div");
    cell.className = "calendar-day";

    if (!validDay) {
      cell.classList.add("calendar-day--empty");
      elDayGrid.appendChild(cell);
      continue;
    }

    // yyyy-mm-dd for planner state
    const dateISO = new Date(year, month, dayNumber).toISOString().split("T")[0];
    const assignedId = planner[dateISO];
    const recipe = recipes.find(r => r.id === assignedId);

    const isToday = dateISO === todayISO();

    cell.setAttribute("data-date", dateISO);

    cell.innerHTML = `
      <div class="calendar-day-inner ${isToday ? "calendar-day--today" : ""}">
        <div class="calendar-date-badge">
          <span class="calendar-date">${dayNumber}</span>
        </div>
        <div class="calendar-content">
          ${
            recipe
              ? `<div class="calendar-recipe-pill">${recipe.name}</div>`
              : `<div class="calendar-empty-note">No meal planned</div>`
          }
        </div>
        <button class="btn btn-ghost btn-plan-day" data-date="${dateISO}">
          ${recipe ? "Change" : "Plan"}
        </button>
      </div>
    `;

    elDayGrid.appendChild(cell);
  }

  attachPlannerButtons();
}

/* -----------------------------
   PLAN DAY MODAL (unchanged)
----------------------------- */

function openPlanDayModal(date) {
  const assignedId = planner[date] || "";
  const recipeOptions = recipes
    .map(
      r => `<option value="${r.id}" ${assignedId === r.id ? "selected" : ""}>${r.name}</option>`
    )
    .join("");

  showModal(`
    <h2>Plan for ${formatDatePretty(date)}</h2>
    <p>Choose a recipe for this day.</p>
    <label>
      Recipe<br>
      <select id="plan-select">
        <option value="">Nothing planned</option>
        ${recipeOptions}
      </select>
    </label>

    <div style="display:flex; gap:10px; justify-content:flex-end; margin-top:20px;">
      <button class="btn btn-ghost" id="btn-cancel-plan">Cancel</button>
      <button class="btn" id="btn-save-plan">Save</button>
    </div>
  `);

  document.getElementById("btn-cancel-plan").addEventListener("click", () => closeModal());

  document.getElementById("btn-save-plan").addEventListener("click", () => {
    const selected = document.getElementById("plan-select").value;
    if (selected) {
      planner[date] = selected;
    } else {
      delete planner[date];
    }

    saveState();
    renderPlanner();
    updateDashboard();
    closeModal();
  });
}

/* -----------------------------
   PLANNER BUTTON HOOKS
----------------------------- */

function attachPlannerButtons() {
  const buttons = document.querySelectorAll(".btn-plan-day");
  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      const date = btn.getAttribute("data-date");
      openPlanDayModal(date);
    });
  });
}

/* -----------------------------
   DASHBOARD LOGIC (same idea)
----------------------------- */

function updateDashboard() {
  if (!elDashTodayMeal || !elDashReadyRecipes) return;

  // Today’s meal
  const today = todayISO();
  const todayId = planner[today];
  const todayRecipe = recipes.find(r => r.id === todayId);

  elDashTodayMeal.textContent = todayRecipe ? todayRecipe.name : "Not planned";

  // Ready recipes count
  const readyCount = recipes.filter(r =>
    r.ingredients.every(ing => {
      const pantryItem = pantry.find(p => p.name.toLowerCase() === ing.name.toLowerCase());
      if (!pantryItem) return false;
      return getTotalQty(pantryItem) >= ing.qty;
    })
  ).length;

  elDashReadyRecipes.textContent = readyCount || "0";
}

/* -----------------------------
   PLANNER EVENT HOOKS
----------------------------- */

function setupPlannerInteractions() {
  // Reserved for any planner-specific controls later
  // (month navigation, filters, etc.)
}

/* ---------------------------------------------------
   PART 5: Shopping List Logic & Checkout Flow
--------------------------------------------------- */

/* -----------------------------
   RENDER SHOPPING LIST
----------------------------- */

function renderShoppingList() {
  if (!elShoppingList) return;

  if (!shopping.length) {
    elShoppingList.innerHTML = `<p>Your list is empty. Add items or let the planner generate them.</p>`;
    return;
  }

  elShoppingList.innerHTML = "";

  shopping.forEach(item => {
    const div = document.createElement("div");
    div.className = "shopping-item";

    div.innerHTML = `
      <input type="checkbox" class="shop-check" data-id="${item.id}" ${item.checked ? "checked" : ""}>
      <div class="shopping-label">
        <strong>${item.name}</strong>
        <div class="shopping-meta">${item.source || "Custom"}</div>
      </div>
      <button class="btn btn-ghost btn-remove-shop" data-id="${item.id}">Remove</button>
    `;

    elShoppingList.appendChild(div);
  });

  attachShoppingButtons();
}

/* -----------------------------
   GENERATE SHOPPING LIST FROM PLANNER
----------------------------- */

function generateShoppingFromPlanner() {
  const { year, month, daysInMonth } = getCurrentMonthInfo();
  const needed = {};

  for (let day = 1; day <= daysInMonth; day++) {
    const dateISO = new Date(year, month, day).toISOString().split("T")[0];
    const recipeId = planner[dateISO];
    if (!recipeId) continue;

    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe) continue;

    recipe.ingredients.forEach(ing => {
      const key = ing.name.toLowerCase();
      if (!needed[key]) {
        needed[key] = { name: ing.name, qty: 0, unit: ing.unit || "" };
      }
      needed[key].qty += ing.qty;
    });
  }

  // Compare with pantry
  Object.values(needed).forEach(ing => {
    const pantryItem = pantry.find(p => p.name.toLowerCase() === ing.name.toLowerCase());
    const total = pantryItem ? getTotalQty(pantryItem) : 0;

    if (total < ing.qty) {
      const missing = ing.qty - total;

      // Avoid duplicates
      if (!shopping.find(s => s.name.toLowerCase() === ing.name.toLowerCase())) {
        shopping.push({
          id: uid(),
          name: `${ing.name} (${missing} ${ing.unit})`,
          source: "Planner",
          checked: false
        });
      }
    }
  });

  saveState();
  renderShoppingList();
}

/* -----------------------------
   ADD CUSTOM SHOPPING ITEM
----------------------------- */

function addCustomShoppingItem() {
  const input = document.getElementById("user-item-name");
  if (!input) return;

  const name = input.value.trim();
  if (!name) return;

  shopping.push({
    id: uid(),
    name,
    source: "Custom",
    checked: false
  });

  input.value = "";
  saveState();
  renderShoppingList();
}

/* -----------------------------
   SHOPPING BUTTON HOOKS
----------------------------- */

function attachShoppingButtons() {
  const checkboxes = document.querySelectorAll(".shop-check");
  const removeButtons = document.querySelectorAll(".btn-remove-shop");

  checkboxes.forEach(box => {
    box.addEventListener("change", () => {
      const id = box.getAttribute("data-id");
      const item = shopping.find(s => s.id === id);
      if (item) {
        item.checked = box.checked;
        saveState();
      }
    });
  });

  removeButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      shopping = shopping.filter(s => s.id !== id);
      saveState();
      renderShoppingList();
    });
  });
}

/* -----------------------------
   CHECKOUT MODAL
----------------------------- */

function openCheckoutModal() {
  const purchased = shopping.filter(s => s.checked);

  if (!purchased.length) {
    alert("Check off items you bought before checking out.");
    return;
  }

  const listHTML = purchased
    .map(item => `<li>${item.name}</li>`)
    .join("");

  showModal(`
    <h2>Checkout</h2>
    <p>Add these items to your pantry?</p>
    <ul>${listHTML}</ul>

    <div style="display:flex; gap:10px; justify-content:flex-end; margin-top:20px;">
      <button class="btn btn-ghost" id="btn-cancel-checkout">Cancel</button>
      <button class="btn" id="btn-confirm-checkout">Add to pantry</button>
    </div>
  `);

  document.getElementById("btn-cancel-checkout").addEventListener("click", () => closeModal());

  document.getElementById("btn-confirm-checkout").addEventListener("click", () => {
    purchased.forEach(item => {
      // Extract name + qty if formatted like "Tomatoes (2 cups)"
      const match = item.name.match(/^(.*?)\s*\((.*?)\)$/);
      let name = item.name;
      let qty = 1;
      let unit = "";

      if (match) {
        name = match[1].trim();
        const qtyParts = match[2].split(" ");
        qty = parseFloat(qtyParts[0]) || 1;
        unit = qtyParts.slice(1).join(" ");
      }

      let pantryItem = pantry.find(p => p.name.toLowerCase() === name.toLowerCase());

      if (!pantryItem) {
        pantryItem = {
          id: uid(),
          name,
          category: "",
          unit,
          expiry: null,
          locations: [{ place: "Pantry", qty }]
        };
        pantry.push(pantryItem);
      } else {
        // Add to first location or create one
        if (!pantryItem.locations.length) {
          pantryItem.locations.push({ place: "Pantry", qty });
        } else {
          pantryItem.locations[0].qty += qty;
        }
      }
    });

    // Remove purchased items from shopping list
    shopping = shopping.filter(s => !s.checked);

    saveState();
    renderPantry();
    renderShoppingList();
    closeModal();
  });
}

/* -----------------------------
   SHOPPING EVENT HOOKS
----------------------------- */

function setupShoppingInteractions() {
  const btnAdd = document.getElementById("btn-add-custom-item");
  if (btnAdd) {
    btnAdd.addEventListener("click", addCustomShoppingItem);
  }

  // Auto-generate from planner when page loads
  generateShoppingFromPlanner();

  // Add checkout button if you want one later
}

/* ---------------------------------------------------
   PART 6: Seasonal Nudges, Theme Switching, Init
--------------------------------------------------- */

/* -----------------------------
   SEASONAL NUDGES
----------------------------- */

function generateSeasonalNudges() {
  const month = new Date().getMonth(); // 0–11
  const nudges = [];

  const monthThemes = {
    0: ["January whispers soup and sourdough.", "Warm stews love cold nights."],
    1: ["February leans into chocolate and comfort.", "A good time for slow roasts."],
    2: ["March brings greens and gentle transitions.", "Try something bright and fresh."],
    3: ["April loves herbs and light broths.", "Spring produce begins to shine."],
    4: ["May invites salads and early berries.", "Freshness is your friend."],
    5: ["June calls for grilling and citrus.", "Summer flavors are waking up."],
    6: ["July celebrates cold drinks and crisp veggies.", "Keep meals light and lively."],
    7: ["August leans into tomatoes and stone fruit.", "Peak produce season."],
    8: ["September welcomes warm spices.", "Harvest flavors begin to appear."],
    9: ["October loves squash and cozy bakes.", "A perfect month for roasting."],
    10: ["November whispers gratitude and gatherings.", "Root veggies shine now."],
    11: ["December brings baking and warm spices.", "Comfort food season is here."]
  };

  nudges.push(...(monthThemes[month] || []));

  pantry.forEach(item => {
    if (!item.expiry) return;
    const diff = (new Date(item.expiry) - new Date()) / (1000 * 60 * 60 * 24);
    if (diff >= 0 && diff <= 3) {
      nudges.push(`Your ${item.name} wants to be used soon.`);
    }
  });

  seasonal = nudges;
  renderSeasonal();
}

function renderSeasonal() {
  if (!elSeasonalList) return;

  if (!seasonal.length) {
    elSeasonalList.innerHTML = `<p>The seasons are quiet right now.</p>`;
    return;
  }

  elSeasonalList.innerHTML = seasonal
    .map(n => `<div class="seasonal-item">${n}</div>`)
    .join("");
}

/* -----------------------------
   THEME SWITCHING (Optional)
----------------------------- */

function setTheme(theme) {
  document.body.className = theme;
  localStorage.setItem("cc_theme", theme);
}

function loadTheme() {
  const saved = localStorage.getItem("cc_theme") || "theme-daylight";
  document.body.className = saved;
}

/* -----------------------------
   INIT — The Heartbeat
----------------------------- */

function init() {
  loadState();
  loadTheme();
  hookElements();
  injectModalRoot();

  renderPantry();
  renderRecipes();
  renderPlanner();
  renderShoppingList();
  generateSeasonalNudges();
  updateDashboard();

  setupPantryInteractions();
  setupRecipeInteractions();
  setupPlannerInteractions();
  setupShoppingInteractions();
}

document.addEventListener("DOMContentLoaded", init);