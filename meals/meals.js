// Meal Planning Calendar — Mobile-first, desktop-enhanced
(function() {
  let currentDate = new Date();
  let viewMode = 'week'; // default mobile
  let scheduledMeals = {}; // { 'YYYY-MM-DD': [meal objects] }

  // Debounce utility
  function debounce(fn, ms) {
    let timer;
    return function() {
      clearTimeout(timer);
      timer = setTimeout(fn, ms);
    };
  }

  function initCalendar() {
    updateViewMode();
    loadScheduledMeals();
    renderCalendar();
    renderScheduledRecipesList();
    setupEventListeners();
    setupSwipeNavigation();
    updateTodayButton();
  }

  function updateViewMode() {
    viewMode = window.innerWidth >= 769 ? 'month' : 'week';
  }

  function loadScheduledMeals() {
    scheduledMeals = {};

    if (!window.planner || typeof window.planner !== 'object') return;

    Object.keys(window.planner).forEach(function(dateKey) {
      const meals = window.planner[dateKey];
      if (!Array.isArray(meals) || meals.length === 0) return;

      scheduledMeals[dateKey] = meals.map(function(meal) {
        let recipeName = 'Unknown Recipe';
        if (window.recipes) {
          const recipe = window.recipes.find(function(r) { return r.id === meal.recipeId; });
          if (recipe) recipeName = recipe.name;
        }
        return {
          id: meal.id,
          recipeId: meal.recipeId,
          recipeName: recipeName,
          mealType: meal.mealType || 'Dinner',
          cooked: meal.cooked || false,
          servingMultiplier: meal.servingMultiplier || 1
        };
      });
    });
  }

  // ── Calendar Rendering ──────────────────────────────────────────

  function renderCalendar() {
    const container = document.getElementById('calendar-container');
    const periodLabel = document.getElementById('calendar-period-label');
    if (!container || !periodLabel) return;

    container.innerHTML = '';

    if (viewMode === 'month') {
      renderMonthView(container, periodLabel);
    } else {
      renderWeekView(container, periodLabel);
    }

    updateTodayButton();
  }

  function renderMonthView(container, periodLabel) {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                        'July', 'August', 'September', 'October', 'November', 'December'];
    periodLabel.textContent = monthNames[month] + ' ' + year;

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const firstDayOfWeek = firstDay.getDay();

    // Empty cells before month starts
    for (let i = 0; i < firstDayOfWeek; i++) {
      const emptyCell = document.createElement('div');
      emptyCell.className = 'calendar-day disabled';
      emptyCell.setAttribute('aria-hidden', 'true');
      container.appendChild(emptyCell);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      date.setHours(0, 0, 0, 0);
      const dateKey = formatDateKey(date);
      container.appendChild(createDayCell(date, dateKey, today));
    }
  }

  function renderWeekView(container, periodLabel) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const startMonth = monthNames[startOfWeek.getMonth()];
    const endMonth = monthNames[endOfWeek.getMonth()];

    if (startMonth === endMonth) {
      periodLabel.textContent = startMonth + ' ' + startOfWeek.getDate() + '\u2013' + endOfWeek.getDate();
    } else {
      periodLabel.textContent = startMonth + ' ' + startOfWeek.getDate() + ' \u2013 ' + endMonth + ' ' + endOfWeek.getDate();
    }

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const dateKey = formatDateKey(date);
      container.appendChild(createDayCell(date, dateKey, today));
    }
  }

  function createDayCell(date, dateKey, today) {
    const dayCell = document.createElement('div');
    dayCell.className = 'calendar-day';
    dayCell.setAttribute('role', 'gridcell');
    dayCell.setAttribute('aria-label', date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }));

    const isPast = date < today;
    const isToday = date.getTime() === today.getTime();
    const meals = scheduledMeals[dateKey] || [];
    const hasMeals = meals.length > 0;

    if (isPast) dayCell.classList.add('past');
    if (isToday) dayCell.classList.add('today');
    if (hasMeals) dayCell.classList.add('has-meal');

    // Day header
    const dayHeader = document.createElement('div');
    dayHeader.className = 'calendar-day-header';

    const dayNumber = document.createElement('div');
    dayNumber.className = 'calendar-day-number';
    dayNumber.textContent = date.getDate();

    const dayName = document.createElement('div');
    dayName.className = 'calendar-day-name';
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayName.textContent = dayNames[date.getDay()];

    dayHeader.appendChild(dayNumber);
    dayHeader.appendChild(dayName);
    dayCell.appendChild(dayHeader);

    // Meals list
    const mealsContainer = document.createElement('div');
    mealsContainer.className = 'calendar-day-meals';

    if (meals.length > 0) {
      meals.forEach(function(meal) {
        const mealItem = document.createElement('div');
        mealItem.className = 'calendar-meal-item';

        // Add state classes instead of inline styles
        if (isPast && !meal.cooked) mealItem.classList.add('missed');
        if (meal.cooked) mealItem.classList.add('cooked');

        // Meal type badge
        const badge = document.createElement('span');
        badge.className = 'meal-type-badge';
        badge.textContent = getMealTypeAbbrev(meal.mealType);
        mealItem.appendChild(badge);

        const nameSpan = document.createElement('span');
        nameSpan.textContent = meal.recipeName;
        mealItem.appendChild(nameSpan);

        mealsContainer.appendChild(mealItem);
      });
    } else {
      const emptyMsg = document.createElement('div');
      emptyMsg.className = 'calendar-day-empty';
      emptyMsg.textContent = isToday ? 'Plan something!' : 'No meals';
      mealsContainer.appendChild(emptyMsg);
    }

    dayCell.appendChild(mealsContainer);

    // Click handler
    if (!isPast || hasMeals) {
      dayCell.addEventListener('click', function() {
        openMealScheduleModal(date, dateKey);
      });
    }

    return dayCell;
  }

  function getMealTypeAbbrev(type) {
    const abbrevs = { Breakfast: 'B', Lunch: 'L', Dinner: 'D', Snack: 'S' };
    return abbrevs[type] || '';
  }

  function openMealScheduleModal(date, dateKey) {
    if (window.openDayModal) {
      window.openDayModal(dateKey);
    }
  }

  // ── Scheduled Recipes List ──────────────────────────────────────

  function renderScheduledRecipesList() {
    const listContainer = document.getElementById('scheduled-recipes-list');
    if (!listContainer) return;

    listContainer.innerHTML = '';

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Collect all meals
    const allMeals = [];
    Object.keys(scheduledMeals).forEach(function(dateKey) {
      const date = new Date(dateKey + 'T12:00:00');
      scheduledMeals[dateKey].forEach(function(meal) {
        allMeals.push({
          date: date,
          dateKey: dateKey,
          id: meal.id,
          recipeId: meal.recipeId,
          recipeName: meal.recipeName,
          mealType: meal.mealType,
          cooked: meal.cooked
        });
      });
    });

    allMeals.sort(function(a, b) { return a.date - b.date; });

    if (allMeals.length === 0) {
      listContainer.innerHTML =
        '<div class="scheduled-recipes-empty">' +
          '<div class="empty-icon">📅</div>' +
          '<div class="empty-text">No meals planned yet.<br>Tap a date on the calendar to get started!</div>' +
        '</div>';
      return;
    }

    // Group by date for visual clarity
    let currentGroup = '';
    allMeals.forEach(function(meal) {
      const groupLabel = meal.date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
      if (groupLabel !== currentGroup) {
        currentGroup = groupLabel;
        const header = document.createElement('div');
        header.className = 'scheduled-date-group';
        const isPast = meal.date < today;
        const isToday = meal.date.toDateString() === today.toDateString();
        header.textContent = isToday ? 'Today' : groupLabel;
        if (isPast) header.style.opacity = '0.5';
        listContainer.appendChild(header);
      }

      listContainer.appendChild(createScheduledRecipeCard(meal, today));
    });
  }

  function createScheduledRecipeCard(meal, today) {
    const card = document.createElement('div');
    card.className = 'scheduled-recipe-card';

    const info = document.createElement('div');
    info.className = 'scheduled-recipe-info';

    // Emoji
    const emoji = document.createElement('div');
    emoji.className = 'scheduled-recipe-emoji';
    let recipeEmoji = '🍽️';
    if (window.recipes) {
      const recipe = window.recipes.find(function(r) { return r.id === meal.recipeId || r.name === meal.recipeName; });
      if (recipe) {
        recipeEmoji = getRecipeEmoji(recipe);
      }
    }
    emoji.textContent = recipeEmoji;

    // Details
    const details = document.createElement('div');
    details.className = 'scheduled-recipe-details';

    const name = document.createElement('div');
    name.className = 'scheduled-recipe-name';
    name.textContent = meal.recipeName;

    const meta = document.createElement('div');
    meta.className = 'scheduled-recipe-meta';

    const dateDiv = document.createElement('div');
    dateDiv.className = 'scheduled-recipe-date';
    const isPast = meal.date < today;
    if (isPast) {
      dateDiv.classList.add('past-date');
      dateDiv.textContent = meal.cooked ? 'Cooked' : 'Not cooked';
    } else {
      dateDiv.textContent = meal.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }

    const typeBadge = document.createElement('span');
    typeBadge.className = 'scheduled-recipe-type';
    typeBadge.textContent = meal.mealType;

    const multiplier = meal.servingMultiplier || 1;
    const multBadge = document.createElement('span');
    multBadge.className = 'scheduled-recipe-multiplier';
    multBadge.textContent = '\u00d7' + multiplier;
    multBadge.title = 'Tap to change serving scale';

    multBadge.addEventListener('click', function(e) {
      e.stopPropagation();
      // Remove any existing popover
      const existing = meta.querySelector('.multiplier-inline-stepper');
      if (existing) { existing.remove(); return; }

      const stepper = document.createElement('div');
      stepper.className = 'multiplier-inline-stepper';

      [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4].forEach(function(step) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'multiplier-step-btn' + (step === multiplier ? ' active' : '');
        btn.textContent = '\u00d7' + step;
        btn.addEventListener('click', async function(ev) {
          ev.stopPropagation();
          stepper.remove();
          multBadge.textContent = '\u00d7' + step;

          // Demo mode
          if (localStorage.getItem('demo-mode') === 'true') {
            const planner = JSON.parse(localStorage.getItem('planner') || '{}');
            for (const dateStr of Object.keys(planner)) {
              const m = (planner[dateStr] || []).find(function(x) { return x.id === meal.id; });
              if (m) { m.servingMultiplier = step; break; }
            }
            localStorage.setItem('planner', JSON.stringify(planner));
            for (const dateStr of Object.keys(window.planner || {})) {
              const m = (window.planner[dateStr] || []).find(function(x) { return x.id === meal.id; });
              if (m) { m.servingMultiplier = step; break; }
            }
            if (typeof window.reloadCalendar === 'function') window.reloadCalendar();
            return;
          }

          try {
            await API.call('/meal-plans/' + meal.id, {
              method: 'PATCH',
              body: JSON.stringify({ serving_multiplier: step })
            });
            await Promise.all([window.loadMealPlans(), window.loadShoppingList()]);
            if (typeof window.reloadCalendar === 'function') window.reloadCalendar();
          } catch (err) {
            console.error('Error updating multiplier:', err);
          }
        });
        stepper.appendChild(btn);
      });

      meta.appendChild(stepper);

      // Close on outside click
      function onOutside(ev) {
        if (!stepper.contains(ev.target) && ev.target !== multBadge) {
          stepper.remove();
          document.removeEventListener('click', onOutside);
        }
      }
      document.addEventListener('click', onOutside);
    });

    meta.appendChild(dateDiv);
    meta.appendChild(typeBadge);
    meta.appendChild(multBadge);
    details.appendChild(name);
    details.appendChild(meta);

    info.appendChild(emoji);
    info.appendChild(details);
    card.appendChild(info);

    // Cook Now button
    const cookBtn = document.createElement('button');
    cookBtn.className = 'btn-cook-now';
    cookBtn.disabled = meal.cooked;

    if (meal.cooked) {
      cookBtn.textContent = 'Cooked \u2713';
    } else {
      cookBtn.textContent = 'Cook Now';
      cookBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        cookNow(meal);
      });
    }

    card.appendChild(cookBtn);
    return card;
  }

  function cookNow(meal) {
    if (!window.recipes) return;

    const recipe = window.recipes.find(function(r) { return r.id === meal.recipeId || r.name === meal.recipeName; });
    if (!recipe) return;

    if (window.openCookNowModal) {
      window.openCookNowModal(recipe, meal.dateKey, meal.id);
    }
  }

  function formatDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return year + '-' + month + '-' + day;
  }

  // ── Navigation ──────────────────────────────────────────────────

  function navigatePrev() {
    if (viewMode === 'month') {
      currentDate.setMonth(currentDate.getMonth() - 1);
    } else {
      currentDate.setDate(currentDate.getDate() - 7);
    }
    renderCalendar();
    renderScheduledRecipesList();
  }

  function navigateNext() {
    if (viewMode === 'month') {
      currentDate.setMonth(currentDate.getMonth() + 1);
    } else {
      currentDate.setDate(currentDate.getDate() + 7);
    }
    renderCalendar();
    renderScheduledRecipesList();
  }

  function navigateToday() {
    currentDate = new Date();
    renderCalendar();
    renderScheduledRecipesList();
  }

  function updateTodayButton() {
    const btn = document.getElementById('btn-today');
    if (!btn) return;

    const today = new Date();
    let isCurrent = false;

    if (viewMode === 'month') {
      isCurrent = currentDate.getFullYear() === today.getFullYear() &&
                  currentDate.getMonth() === today.getMonth();
    } else {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      isCurrent = today >= startOfWeek && today <= endOfWeek;
    }

    btn.classList.toggle('is-current', isCurrent);
  }

  function setupEventListeners() {
    const prevBtn = document.getElementById('btn-prev-period');
    const nextBtn = document.getElementById('btn-next-period');
    const todayBtn = document.getElementById('btn-today');

    if (prevBtn) prevBtn.addEventListener('click', navigatePrev);
    if (nextBtn) nextBtn.addEventListener('click', navigateNext);
    if (todayBtn) todayBtn.addEventListener('click', navigateToday);

    // Debounced resize handler
    window.addEventListener('resize', debounce(function() {
      const prev = viewMode;
      updateViewMode();
      if (prev !== viewMode) renderCalendar();
    }, 200));

    // Delegate modal close to data-action attributes
    document.addEventListener('click', function(e) {
      if (e.target.matches('[data-action="close-modal"]')) {
        if (typeof window.closeModal === 'function') window.closeModal();
      }
    });
  }

  // ── Swipe Navigation (mobile) ──────────────────────────────────

  function setupSwipeNavigation() {
    const container = document.getElementById('calendar-container');
    if (!container) return;

    let startX = 0;
    let startY = 0;
    let tracking = false;

    container.addEventListener('touchstart', function(e) {
      if (e.touches.length !== 1) return;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      tracking = true;
    }, { passive: true });

    container.addEventListener('touchend', function(e) {
      if (!tracking) return;
      tracking = false;

      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const dx = endX - startX;
      const dy = endY - startY;

      // Require horizontal swipe > 60px and more horizontal than vertical
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        if (dx < 0) {
          navigateNext();
        } else {
          navigatePrev();
        }
      }
    }, { passive: true });
  }

  // ── Initialization ──────────────────────────────────────────────

  function waitForDataAndInit() {
    if (window.recipes && window.planner) {
      initCalendar();
    } else {
      setTimeout(waitForDataAndInit, 200);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForDataAndInit);
  } else {
    waitForDataAndInit();
  }

  // Expose reload for external callers (app.js)
  window.reloadCalendar = function() {
    loadScheduledMeals();
    renderCalendar();
    renderScheduledRecipesList();
  };
})();
