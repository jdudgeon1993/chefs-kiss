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
      var meals = window.planner[dateKey];
      if (!Array.isArray(meals) || meals.length === 0) return;

      scheduledMeals[dateKey] = meals.map(function(meal) {
        var recipeName = 'Unknown Recipe';
        if (window.recipes) {
          var recipe = window.recipes.find(function(r) { return r.id === meal.recipeId; });
          if (recipe) recipeName = recipe.name;
        }
        return {
          id: meal.id,
          recipeId: meal.recipeId,
          recipeName: recipeName,
          mealType: meal.mealType || 'Dinner',
          cooked: meal.cooked || false
        };
      });
    });
  }

  // ── Calendar Rendering ──────────────────────────────────────────

  function renderCalendar() {
    var container = document.getElementById('calendar-container');
    var periodLabel = document.getElementById('calendar-period-label');
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
    var year = currentDate.getFullYear();
    var month = currentDate.getMonth();
    var monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'];
    periodLabel.textContent = monthNames[month] + ' ' + year;

    var firstDay = new Date(year, month, 1);
    var lastDay = new Date(year, month + 1, 0);
    var daysInMonth = lastDay.getDate();
    var firstDayOfWeek = firstDay.getDay();

    // Empty cells before month starts
    for (var i = 0; i < firstDayOfWeek; i++) {
      var emptyCell = document.createElement('div');
      emptyCell.className = 'calendar-day disabled';
      emptyCell.setAttribute('aria-hidden', 'true');
      container.appendChild(emptyCell);
    }

    var today = new Date();
    today.setHours(0, 0, 0, 0);

    for (var day = 1; day <= daysInMonth; day++) {
      var date = new Date(year, month, day);
      date.setHours(0, 0, 0, 0);
      var dateKey = formatDateKey(date);
      container.appendChild(createDayCell(date, dateKey, today));
    }
  }

  function renderWeekView(container, periodLabel) {
    var today = new Date();
    today.setHours(0, 0, 0, 0);

    var startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    var endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var startMonth = monthNames[startOfWeek.getMonth()];
    var endMonth = monthNames[endOfWeek.getMonth()];

    if (startMonth === endMonth) {
      periodLabel.textContent = startMonth + ' ' + startOfWeek.getDate() + '\u2013' + endOfWeek.getDate();
    } else {
      periodLabel.textContent = startMonth + ' ' + startOfWeek.getDate() + ' \u2013 ' + endMonth + ' ' + endOfWeek.getDate();
    }

    for (var i = 0; i < 7; i++) {
      var date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      var dateKey = formatDateKey(date);
      container.appendChild(createDayCell(date, dateKey, today));
    }
  }

  function createDayCell(date, dateKey, today) {
    var dayCell = document.createElement('div');
    dayCell.className = 'calendar-day';
    dayCell.setAttribute('role', 'gridcell');
    dayCell.setAttribute('aria-label', date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }));

    var isPast = date < today;
    var isToday = date.getTime() === today.getTime();
    var meals = scheduledMeals[dateKey] || [];
    var hasMeals = meals.length > 0;

    if (isPast) dayCell.classList.add('past');
    if (isToday) dayCell.classList.add('today');
    if (hasMeals) dayCell.classList.add('has-meal');

    // Day header
    var dayHeader = document.createElement('div');
    dayHeader.className = 'calendar-day-header';

    var dayNumber = document.createElement('div');
    dayNumber.className = 'calendar-day-number';
    dayNumber.textContent = date.getDate();

    var dayName = document.createElement('div');
    dayName.className = 'calendar-day-name';
    var dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayName.textContent = dayNames[date.getDay()];

    dayHeader.appendChild(dayNumber);
    dayHeader.appendChild(dayName);
    dayCell.appendChild(dayHeader);

    // Meals list
    var mealsContainer = document.createElement('div');
    mealsContainer.className = 'calendar-day-meals';

    if (meals.length > 0) {
      meals.forEach(function(meal) {
        var mealItem = document.createElement('div');
        mealItem.className = 'calendar-meal-item';

        // Add state classes instead of inline styles
        if (isPast && !meal.cooked) mealItem.classList.add('missed');
        if (meal.cooked) mealItem.classList.add('cooked');

        // Meal type badge
        var badge = document.createElement('span');
        badge.className = 'meal-type-badge';
        badge.textContent = getMealTypeAbbrev(meal.mealType);
        mealItem.appendChild(badge);

        var nameSpan = document.createElement('span');
        nameSpan.textContent = meal.recipeName;
        mealItem.appendChild(nameSpan);

        mealsContainer.appendChild(mealItem);
      });
    } else {
      var emptyMsg = document.createElement('div');
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
    var abbrevs = { Breakfast: 'B', Lunch: 'L', Dinner: 'D', Snack: 'S' };
    return abbrevs[type] || '';
  }

  function openMealScheduleModal(date, dateKey) {
    if (window.openDayModal) {
      window.openDayModal(dateKey);
    }
  }

  // ── Scheduled Recipes List ──────────────────────────────────────

  function renderScheduledRecipesList() {
    var listContainer = document.getElementById('scheduled-recipes-list');
    if (!listContainer) return;

    listContainer.innerHTML = '';

    var today = new Date();
    today.setHours(0, 0, 0, 0);

    // Collect all meals
    var allMeals = [];
    Object.keys(scheduledMeals).forEach(function(dateKey) {
      var date = new Date(dateKey + 'T12:00:00');
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
    var currentGroup = '';
    allMeals.forEach(function(meal) {
      var groupLabel = meal.date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
      if (groupLabel !== currentGroup) {
        currentGroup = groupLabel;
        var header = document.createElement('div');
        header.className = 'scheduled-date-group';
        var isPast = meal.date < today;
        var isToday = meal.date.toDateString() === today.toDateString();
        header.textContent = isToday ? 'Today' : groupLabel;
        if (isPast) header.style.opacity = '0.5';
        listContainer.appendChild(header);
      }

      listContainer.appendChild(createScheduledRecipeCard(meal, today));
    });
  }

  function createScheduledRecipeCard(meal, today) {
    var card = document.createElement('div');
    card.className = 'scheduled-recipe-card';

    var info = document.createElement('div');
    info.className = 'scheduled-recipe-info';

    // Emoji
    var emoji = document.createElement('div');
    emoji.className = 'scheduled-recipe-emoji';
    var recipeEmoji = '🍽️';
    if (window.recipes) {
      var recipe = window.recipes.find(function(r) { return r.id === meal.recipeId || r.name === meal.recipeName; });
      if (recipe) {
        recipeEmoji = getRecipeEmoji(recipe);
      }
    }
    emoji.textContent = recipeEmoji;

    // Details
    var details = document.createElement('div');
    details.className = 'scheduled-recipe-details';

    var name = document.createElement('div');
    name.className = 'scheduled-recipe-name';
    name.textContent = meal.recipeName;

    var meta = document.createElement('div');
    meta.className = 'scheduled-recipe-meta';

    var dateDiv = document.createElement('div');
    dateDiv.className = 'scheduled-recipe-date';
    var isPast = meal.date < today;
    if (isPast) {
      dateDiv.classList.add('past-date');
      dateDiv.textContent = meal.cooked ? 'Cooked' : 'Not cooked';
    } else {
      dateDiv.textContent = meal.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }

    var typeBadge = document.createElement('span');
    typeBadge.className = 'scheduled-recipe-type';
    typeBadge.textContent = meal.mealType;

    meta.appendChild(dateDiv);
    meta.appendChild(typeBadge);
    details.appendChild(name);
    details.appendChild(meta);

    info.appendChild(emoji);
    info.appendChild(details);
    card.appendChild(info);

    // Cook Now button
    var cookBtn = document.createElement('button');
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

    var recipe = window.recipes.find(function(r) { return r.id === meal.recipeId || r.name === meal.recipeName; });
    if (!recipe) return;

    if (window.openCookNowModal) {
      window.openCookNowModal(recipe, meal.dateKey, meal.id);
    }
  }

  function formatDateKey(date) {
    var year = date.getFullYear();
    var month = String(date.getMonth() + 1).padStart(2, '0');
    var day = String(date.getDate()).padStart(2, '0');
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
    var btn = document.getElementById('btn-today');
    if (!btn) return;

    var today = new Date();
    var isCurrent = false;

    if (viewMode === 'month') {
      isCurrent = currentDate.getFullYear() === today.getFullYear() &&
                  currentDate.getMonth() === today.getMonth();
    } else {
      var startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      var endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      isCurrent = today >= startOfWeek && today <= endOfWeek;
    }

    btn.classList.toggle('is-current', isCurrent);
  }

  function setupEventListeners() {
    var prevBtn = document.getElementById('btn-prev-period');
    var nextBtn = document.getElementById('btn-next-period');
    var todayBtn = document.getElementById('btn-today');

    if (prevBtn) prevBtn.addEventListener('click', navigatePrev);
    if (nextBtn) nextBtn.addEventListener('click', navigateNext);
    if (todayBtn) todayBtn.addEventListener('click', navigateToday);

    // Debounced resize handler
    window.addEventListener('resize', debounce(function() {
      var prev = viewMode;
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
    var container = document.getElementById('calendar-container');
    if (!container) return;

    var startX = 0;
    var startY = 0;
    var tracking = false;

    container.addEventListener('touchstart', function(e) {
      if (e.touches.length !== 1) return;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      tracking = true;
    }, { passive: true });

    container.addEventListener('touchend', function(e) {
      if (!tracking) return;
      tracking = false;

      var endX = e.changedTouches[0].clientX;
      var endY = e.changedTouches[0].clientY;
      var dx = endX - startX;
      var dy = endY - startY;

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
