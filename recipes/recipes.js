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
      const esc = typeof escapeHTML === 'function' ? escapeHTML : (s) => s;
      const safePhotoUrl = recipe.photo ? encodeURI(recipe.photo) : '';
      const thumbnailHTML = recipe.photo
        ? `<div class="recipe-card-thumbnail" style="background-image: url('${safePhotoUrl}'); background-size: cover; background-position: center;"></div>`
        : `<div class="recipe-card-thumbnail">${emoji}</div>`;

      // Tags HTML
      const tagsHTML = recipe.tags && recipe.tags.length > 0
        ? `<div class="recipe-card-tags">
            ${recipe.tags.slice(0, 3).map(tag => `<span class="recipe-tag-pill">${esc(tag)}</span>`).join('')}
            ${recipe.tags.length > 3 ? '<span class="recipe-tag-pill" style="opacity: 0.6;">+' + (recipe.tags.length - 3) + '</span>' : ''}
          </div>`
        : '';

      // Favorite star
      const favoriteHTML = recipe.isFavorite ? '<div class="recipe-card-favorite-star">⭐</div>' : '';

      card.innerHTML = `
        ${favoriteHTML}
        ${thumbnailHTML}
        <div class="recipe-card-content">
          ${recipe.category ? `<div class="recipe-card-category">${esc(recipe.category)}</div>` : ''}
          <div class="recipe-card-name">${esc(recipe.name || 'Untitled Recipe')}</div>
          <div class="recipe-card-meta">
            <span>${esc(String(servings))} servings</span>
            <span>${esc(String(time))}</span>
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

    const esc = typeof escapeHTML === 'function' ? escapeHTML : (s) => String(s);
    const safeId = esc(String(recipe.id));

    const ingredientsHTML = recipe.ingredients && recipe.ingredients.length > 0
      ? recipe.ingredients.map(ing => `<li>${esc(String(ing.qty || ''))} ${esc(ing.unit || '')} ${esc(ing.name || '')}</li>`).join('')
      : '<li style="opacity: 0.6;">No ingredients listed</li>';

    const instructionsHTML = esc(recipe.instructions || recipe.method || 'No instructions provided');
    const servings = recipe.servings || recipe.yield || '4';
    const time = recipe.cookTime || recipe.time || '30min';
    const safePhotoUrl = recipe.photo ? encodeURI(recipe.photo) : '';

    const tagsHTML = recipe.tags.map(tag => {
      const safeTag = esc(tag);
      return `
      <span class="recipe-tag-pill" data-tag="${safeTag}">
        ${safeTag}
        <button class="recipe-tag-remove" data-tag-name="${safeTag}" data-recipe-id="${safeId}">×</button>
      </span>
    `;
    }).join('');

    recipeDetailModal.innerHTML = `
      <button class="recipe-modal-close" onclick="this.closest('.recipe-detail-modal').remove()">✕</button>
      <div class="recipe-detail-modal-content">
        <div class="recipe-vintage-card">
          <div class="recipe-vintage-header-row">
            <div class="recipe-vintage-card-id">FROM THE ARCHIVE OF THE HEARTH</div>
            <button class="btn-favorite-toggle" data-recipe-id="${safeId}" title="${recipe.isFavorite ? 'Remove from favorites' : 'Add to favorites'}">
              ${recipe.isFavorite ? '⭐' : '☆'}
            </button>
          </div>
          ${safePhotoUrl ? `<div class="recipe-vintage-card-photo"><img src="${safePhotoUrl}" alt="${esc(recipe.name)}"></div>` : ''}
          <h1 class="recipe-vintage-card-title">${esc(recipe.name || 'Untitled Recipe')}</h1>
          <div class="recipe-vintage-card-meta">
            <span><strong>YIELD:</strong> ${esc(String(servings))}</span>
            <span><strong>TIME:</strong> ${esc(String(time))}</span>
          </div>

          <div class="recipe-tags-section">
            <div class="recipe-tags-header">
              <span class="recipe-tags-label">Tags:</span>
              <div class="recipe-tags-display">
                ${tagsHTML || '<span class="empty-hint">No tags yet</span>'}
              </div>
            </div>
            <div class="recipe-tag-add-row">
              <input type="text" class="recipe-tag-input" data-recipe-id="${safeId}" placeholder="Add tag (e.g., #quick, #italian)" enterkeyhint="done">
              <button class="btn btn-secondary btn-sm btn-add-tag" data-recipe-id="${safeId}">Add</button>
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
            <button class="btn btn-edit-recipe" data-recipe-id="${safeId}">EDIT LEDGER</button>
            <button class="btn btn-delete-recipe" data-recipe-id="${safeId}">[ BURN CARD ]</button>
          </div>
        </div>
      </div>
    `;

    // Wire up event listeners safely (no inline onclick with user data)
    recipeDetailModal.querySelector('.btn-favorite-toggle').addEventListener('click', () => toggleFavorite(recipe.id));
    recipeDetailModal.querySelector('.btn-edit-recipe').addEventListener('click', () => {
      window.openRecipeModal(recipe.id);
      document.querySelector('.recipe-detail-modal')?.remove();
    });
    recipeDetailModal.querySelector('.btn-delete-recipe').addEventListener('click', () => {
      if (window.deleteRecipe) {
        window.deleteRecipe(recipe.id);
        document.querySelector('.recipe-detail-modal')?.remove();
      }
    });
    const tagInput = recipeDetailModal.querySelector('.recipe-tag-input');
    if (tagInput) {
      tagInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') { addTag(tagInput.value, recipe.id); tagInput.value = ''; }
      });
    }
    const addTagBtn = recipeDetailModal.querySelector('.btn-add-tag');
    if (addTagBtn) {
      addTagBtn.addEventListener('click', () => { addTag(tagInput.value, recipe.id); tagInput.value = ''; });
    }
    recipeDetailModal.querySelectorAll('.recipe-tag-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        removeTag(btn.dataset.tagName, recipe.id);
      });
    });

    // Close on background click
    recipeDetailModal.onclick = (e) => {
      if (e.target === recipeDetailModal) {
        recipeDetailModal.remove();
      }
    };

    // Close on ESC key
    function handleEsc(e) {
      if (e.key === 'Escape') {
        recipeDetailModal.remove();
        document.removeEventListener('keydown', handleEsc);
      }
    }
    document.addEventListener('keydown', handleEsc);

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

    let debounceTimer;
    searchInput.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(filterRecipes, 200);
    });
  }

  // Guard flag used by filterRecipes to prevent re-entry
  let _recipeRenderInProgress = false;

  // Re-render when recipe data changes externally (e.g. realtime sync, app.js reload)
  function setupRecipeDataWatcher() {
    let lastRecipeRef = window.recipes;
    const interval = setInterval(() => {
      if (window.recipes && window.recipes !== lastRecipeRef) {
        lastRecipeRef = window.recipes;
        filteredRecipes = [...window.recipes];
        renderFilterPills();
        renderTagFilterPills();
        renderRecipesGrid();
      }
    }, 1000);
    // Clean up if page unloads
    window.addEventListener('unload', () => clearInterval(interval));
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initRecipeGridView();
      setupRecipeDataWatcher();
    });
  } else {
    initRecipeGridView();
    setupRecipeDataWatcher();
  }
})();
