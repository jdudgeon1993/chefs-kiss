// Recipe Grid View - Extracted from index.html
(function() {
  let filteredRecipes = [];
  let currentFilter = 'All';
  let recipeDetailModal = null;

  let selectedTags = []; // Track selected tag filters

  function initRecipeGridView() {
    // Wait for window.recipes to be available
    if (!window.recipes || window.recipes.length === 0) {
      setTimeout(initRecipeGridView, 500);
      return;
    }

    filteredRecipes = [...window.recipes];
    renderFilterPills();
    renderTagFilterPills();
    renderRecipesGrid();
    setupSearch();
    setupSortDropdown();
  }

  function setupSortDropdown() {
    const sortSelect = document.getElementById('recipe-sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', renderRecipesGrid);
    }
  }

  function renderFilterPills() {
    const pillsContainer = document.getElementById('recipe-filter-pills');
    if (!pillsContainer) return;

    // Get unique categories
    const categories = ['All', ...new Set(window.recipes.map(r => r.category || 'Uncategorized').filter(Boolean))];

    pillsContainer.innerHTML = '';
    categories.forEach(category => {
      const pill = document.createElement('button');
      pill.className = 'recipe-filter-pill';
      if (category === currentFilter) pill.classList.add('active');
      pill.textContent = category;
      pill.onclick = () => {
        currentFilter = category;
        filterRecipes();
      };
      pillsContainer.appendChild(pill);
    });
  }

  function renderTagFilterPills() {
    const pillsContainer = document.getElementById('recipe-tag-filter-pills');
    if (!pillsContainer) return;

    // Get all unique tags from all recipes
    const allTags = new Set();
    window.recipes.forEach(recipe => {
      if (recipe.tags && Array.isArray(recipe.tags)) {
        recipe.tags.forEach(tag => allTags.add(tag));
      }
    });

    if (allTags.size === 0) {
      pillsContainer.innerHTML = '<span style="opacity: 0.5; font-size: 0.85rem;">No tags yet. Add tags to recipes to filter by them!</span>';
      return;
    }

    pillsContainer.innerHTML = '';
    allTags.forEach(tag => {
      const pill = document.createElement('button');
      pill.className = 'recipe-filter-pill';
      if (selectedTags.includes(tag)) pill.classList.add('active');
      pill.innerHTML = `#${tag}`;
      pill.onclick = () => {
        if (selectedTags.includes(tag)) {
          selectedTags = selectedTags.filter(t => t !== tag);
        } else {
          selectedTags.push(tag);
        }
        renderTagFilterPills();
        filterRecipes();
      };
      pillsContainer.appendChild(pill);
    });

    // Add "Clear Tags" button if any tags are selected
    if (selectedTags.length > 0) {
      const clearBtn = document.createElement('button');
      clearBtn.className = 'recipe-filter-pill';
      clearBtn.style.background = 'var(--btn-danger)';
      clearBtn.style.color = 'white';
      clearBtn.style.border = 'none';
      clearBtn.textContent = 'Clear Tags';
      clearBtn.onclick = () => {
        selectedTags = [];
        renderTagFilterPills();
        filterRecipes();
      };
      pillsContainer.appendChild(clearBtn);
    }
  }

  function filterRecipes() {
    const searchInput = document.getElementById('recipe-search-ledger');
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

    filteredRecipes = window.recipes.filter(recipe => {
      const recipeCat = recipe.category || 'Uncategorized';
      const matchesCategory = currentFilter === 'All' || recipeCat === currentFilter || recipeCat.split(' & ').includes(currentFilter);
      const matchesSearch = !query ||
        recipe.name.toLowerCase().includes(query) ||
        (recipe.ingredients && recipe.ingredients.some(ing => ing.name.toLowerCase().includes(query)));

      // Tag filtering: recipe must have ALL selected tags (AND logic)
      const matchesTags = selectedTags.length === 0 ||
        (recipe.tags && selectedTags.every(tag => recipe.tags.includes(tag)));

      return matchesCategory && matchesSearch && matchesTags;
    });

    // Set guard so the MutationObserver doesn't reset our filtered results
    _recipeRenderInProgress = true;
    try {
      renderFilterPills();
      renderTagFilterPills();
      renderRecipesGrid();
    } finally {
      Promise.resolve().then(() => { _recipeRenderInProgress = false; });
    }
  }

  function renderRecipesGrid() {
    const gridContainer = document.getElementById('recipes-grid');
    if (!gridContainer) return;

    gridContainer.innerHTML = '';

    if (filteredRecipes.length === 0) {
      gridContainer.innerHTML = '<p style="text-align: center; opacity: 0.6; padding: 3rem; grid-column: 1 / -1;">No recipes found. Click + to add your first recipe!</p>';
      return;
    }

    // Sort recipes based on current sort option
    const sortSelect = document.getElementById('recipe-sort-select');
    const sortOption = sortSelect ? sortSelect.value : 'a-z';

    let sortedRecipes = [...filteredRecipes];

    switch (sortOption) {
      case 'z-a':
        sortedRecipes.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'favorites':
        sortedRecipes.sort((a, b) => {
          if (a.isFavorite && !b.isFavorite) return -1;
          if (!a.isFavorite && b.isFavorite) return 1;
          return a.name.localeCompare(b.name);
        });
        break;
      case 'recent':
        // Sort by ID descending (newest first) - assumes higher IDs are newer
        sortedRecipes.sort((a, b) => (b.id || 0) - (a.id || 0));
        break;
      case 'a-z':
      default:
        sortedRecipes.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    sortedRecipes.forEach(recipe => {
      const card = document.createElement('div');
      card.className = 'recipe-grid-card';
      card.onclick = () => openRecipeDetailModal(recipe);

      const emoji = getRecipeEmoji(recipe);
      const servings = recipe.servings || recipe.yield || '4';
      const time = recipe.cookTime || recipe.time || '30min';

      // Use photo if available, otherwise show emoji
      const thumbnailHTML = recipe.photo
        ? `<div class="recipe-card-thumbnail" style="background-image: url('${recipe.photo}'); background-size: cover; background-position: center;"></div>`
        : `<div class="recipe-card-thumbnail">${emoji}</div>`;

      // Tags HTML
      const tagsHTML = recipe.tags && recipe.tags.length > 0
        ? `<div class="recipe-card-tags">
            ${recipe.tags.slice(0, 3).map(tag => `<span class="recipe-tag-pill">${tag}</span>`).join('')}
            ${recipe.tags.length > 3 ? '<span class="recipe-tag-pill" style="opacity: 0.6;">+' + (recipe.tags.length - 3) + '</span>' : ''}
          </div>`
        : '';

      // Favorite star
      const favoriteHTML = recipe.isFavorite ? '<div class="recipe-card-favorite-star">⭐</div>' : '';

      card.innerHTML = `
        ${favoriteHTML}
        ${thumbnailHTML}
        <div class="recipe-card-content">
          ${recipe.category ? `<div class="recipe-card-category">${recipe.category}</div>` : ''}
          <div class="recipe-card-name">${recipe.name || 'Untitled Recipe'}</div>
          <div class="recipe-card-meta">
            <span>${servings} servings</span>
            <span>${time}</span>
          </div>
          ${tagsHTML}
        </div>
      `;

      gridContainer.appendChild(card);
    });
  }

  function getRecipeEmoji(recipe) {
    const category = (recipe.category || '').toLowerCase();
    const emojis = {
      'dinner': '🍝',
      'lunch': '🥗',
      'breakfast': '🍳',
      'dessert': '🍰',
      'snack': '🍪',
      'appetizer': '🥙',
      'soup': '🍲',
      'salad': '🥗',
      'pasta': '🍝',
      'pizza': '🍕',
      'burger': '🍔',
      'sandwich': '🥪',
      'seafood': '🦞',
      'chicken': '🍗',
      'beef': '🥩',
      'pork': '🥓',
      'vegetarian': '🥬',
      'vegan': '🌱',
      'bread': '🥖',
      'cake': '🎂',
      'cookie': '🍪'
    };

    for (const [key, emoji] of Object.entries(emojis)) {
      if (category.includes(key)) return emoji;
    }

    return '🍽️';
  }

  function openRecipeDetailModal(recipe) {
    // Initialize tags and favorite if not present
    if (!recipe.tags) recipe.tags = [];
    if (recipe.isFavorite === undefined) recipe.isFavorite = false;

    // Create modal
    recipeDetailModal = document.createElement('div');
    recipeDetailModal.className = 'recipe-detail-modal';

    const ingredientsHTML = recipe.ingredients && recipe.ingredients.length > 0
      ? recipe.ingredients.map(ing => `<li>${ing.qty || ''} ${ing.unit || ''} ${ing.name || ''}</li>`).join('')
      : '<li style="opacity: 0.6;">No ingredients listed</li>';

    const instructionsHTML = recipe.instructions || recipe.method || 'No instructions provided';
    const servings = recipe.servings || recipe.yield || '4';
    const time = recipe.cookTime || recipe.time || '30min';

    const tagsHTML = recipe.tags.map(tag => `
      <span class="recipe-tag-pill" data-tag="${tag}">
        ${tag}
        <button class="recipe-tag-remove" onclick="event.stopPropagation(); removeTag('${tag.replace(/'/g, "\\'")}', '${recipe.id}')">×</button>
      </span>
    `).join('');

    recipeDetailModal.innerHTML = `
      <button class="recipe-modal-close" onclick="this.closest('.recipe-detail-modal').remove()">✕</button>
      <div class="recipe-detail-modal-content">
        <div class="recipe-vintage-card">
          <div class="recipe-vintage-card-header-row" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <div class="recipe-vintage-card-id" style="flex: 1; border: none; padding: 0; margin: 0;">FROM THE ARCHIVE OF THE HEARTH</div>
            <button class="btn-favorite-toggle" style="background: none; border: none; font-size: 2rem; cursor: pointer; padding: 0.25rem;" onclick="toggleFavorite('${recipe.id}')" title="${recipe.isFavorite ? 'Remove from favorites' : 'Add to favorites'}">
              ${recipe.isFavorite ? '⭐' : '☆'}
            </button>
          </div>
          <h1 class="recipe-vintage-card-title">${recipe.name || 'Untitled Recipe'}</h1>
          <div class="recipe-vintage-card-meta">
            <span><strong>YIELD:</strong> ${servings}</span>
            <span><strong>TIME:</strong> ${time}</span>
          </div>

          <!-- Tags Section -->
          <div class="recipe-tags-section" style="margin: 1rem 0; padding: 1rem 0; border-top: 1px solid var(--color-recipe-border); border-bottom: 1px solid var(--color-recipe-border);">
            <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.5rem;">
              <span style="font-family: 'Caveat', cursive; font-size: 1.2rem; color: var(--clay-warm); font-weight: 600;">Tags:</span>
              <div class="recipe-tags-display" style="display: flex; gap: 0.5rem; flex-wrap: wrap; flex: 1;">
                ${tagsHTML || '<span style="opacity: 0.5; font-size: 0.85rem;">No tags yet</span>'}
              </div>
            </div>
            <div style="display: flex; gap: 0.5rem;">
              <input type="text" class="recipe-tag-input" placeholder="Add tag (e.g., #quick, #italian)" style="flex: 1; padding: 0.5rem; border: 1px solid var(--color-recipe-border); border-radius: 4px; font-size: 0.85rem;" onkeypress="if(event.key === 'Enter') { addTag(this.value, '${recipe.id}'); this.value = ''; }">
              <button class="btn btn-secondary" style="padding: 0.5rem 1rem; font-size: 0.75rem;" onclick="const input = this.previousElementSibling; addTag(input.value, '${recipe.id}'); input.value = '';">Add</button>
            </div>
          </div>

          <div class="recipe-vintage-card-columns">
            <div class="recipe-vintage-card-column">
              <h3>Ingredients</h3>
              <ul>${ingredientsHTML}</ul>
            </div>
            <div class="recipe-vintage-card-column">
              <h3>Preparation</h3>
              <div class="recipe-vintage-method">${instructionsHTML}</div>
            </div>
          </div>
          <div class="recipe-vintage-card-actions">
            <button class="btn btn-edit-recipe" onclick="window.openRecipeModal('${recipe.id}'); document.querySelector('.recipe-detail-modal')?.remove();">EDIT LEDGER</button>
            <button class="btn btn-delete-recipe" onclick="if(window.deleteRecipe) { window.deleteRecipe('${recipe.id}'); document.querySelector('.recipe-detail-modal')?.remove(); }">[ BURN CARD ]</button>
          </div>
        </div>
      </div>
    `;

    // Close on background click
    recipeDetailModal.onclick = (e) => {
      if (e.target === recipeDetailModal) {
        recipeDetailModal.remove();
      }
    };

    document.body.appendChild(recipeDetailModal);
  }

  // Toggle favorite status
  window.toggleFavorite = function(recipeId) {
    if (!window.recipes) return;

    const recipeIndex = window.recipes.findIndex(r =>
      r.id === recipeId || r.id === recipeId.id
    );

    if (recipeIndex !== -1) {
      const recipe = window.recipes[recipeIndex];
      recipe.isFavorite = !recipe.isFavorite;

      // Persist via API (quiet — no toast or full reload)
      if (typeof API !== 'undefined') {
        API.call('/recipes/' + recipe.id, {
          method: 'PUT',
          body: JSON.stringify({ is_favorite: recipe.isFavorite })
        }).catch(err => {
          console.error('Error saving favorite:', err);
        });
      }

      // Re-render modal and grid
      const modal = document.querySelector('.recipe-detail-modal');
      if (modal) {
        modal.remove();
        openRecipeDetailModal(recipe);
      }
      renderRecipesGrid();
    }
  };

  // Add tag to recipe
  window.addTag = function(tagValue, recipeId) {
    if (!tagValue || !window.recipes) return;

    // Clean up tag value (remove # if present, trim whitespace)
    let tag = tagValue.trim();
    if (tag.startsWith('#')) {
      tag = tag.substring(1);
    }
    if (!tag) return;

    const recipeIndex = window.recipes.findIndex(r =>
      r.id === recipeId || r.id === recipeId.id
    );

    if (recipeIndex !== -1) {
      const recipe = window.recipes[recipeIndex];
      if (!recipe.tags) {
        recipe.tags = [];
      }

      // Don't add duplicate tags
      if (!recipe.tags.includes(tag)) {
        recipe.tags.push(tag);

        // Persist via API (quiet — no toast or full reload)
        if (typeof API !== 'undefined') {
          API.call('/recipes/' + recipe.id, {
            method: 'PUT',
            body: JSON.stringify({ tags: recipe.tags })
          }).catch(err => {
            console.error('Error saving tags:', err);
          });
        }

        // Re-render modal and grid
        const modal = document.querySelector('.recipe-detail-modal');
        if (modal) {
          modal.remove();
          openRecipeDetailModal(recipe);
        }
        renderRecipesGrid();
      }
    }
  };

  // Remove tag from recipe
  window.removeTag = function(tag, recipeId) {
    if (!window.recipes) return;

    const recipeIndex = window.recipes.findIndex(r =>
      r.id === recipeId || r.id === recipeId.id
    );

    if (recipeIndex !== -1 && window.recipes[recipeIndex].tags) {
      const recipe = window.recipes[recipeIndex];
      recipe.tags = recipe.tags.filter(t => t !== tag);

      // Persist via API
      if (window.updateRecipe) {
        window.updateRecipe(recipe.id, { tags: recipe.tags }).catch(err => {
          console.error('Error saving tags:', err);
        });
      }

      // Re-render modal and grid
      const modal = document.querySelector('.recipe-detail-modal');
      if (modal) {
        modal.remove();
        openRecipeDetailModal(recipe);
      }
      renderRecipesGrid();
    }
  };

  function setupSearch() {
    const searchInput = document.getElementById('recipe-search-ledger');
    if (!searchInput) return;

    searchInput.addEventListener('input', filterRecipes);
  }

  // Watch for recipe data changes
  let _recipeRenderInProgress = false;

  function safeRenderRecipesGrid() {
    if (_recipeRenderInProgress) return;
    _recipeRenderInProgress = true;
    try {
      filteredRecipes = [...window.recipes];
      renderFilterPills();
      renderTagFilterPills();
      renderRecipesGrid();
    } finally {
      // Release flag after current microtask so observer callbacks from this render are ignored
      Promise.resolve().then(() => { _recipeRenderInProgress = false; });
    }
  }

  function setupRecipeObserver() {
    const recipesGrid = document.getElementById('recipes-grid');
    if (!recipesGrid) {
      setTimeout(setupRecipeObserver, 500);
      return;
    }

    const observer = new MutationObserver(() => {
      safeRenderRecipesGrid();
    });

    observer.observe(recipesGrid, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initRecipeGridView();
      setupRecipeObserver();
    });
  } else {
    initRecipeGridView();
    setupRecipeObserver();
  }
})();
