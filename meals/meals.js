// Meal Planning Calendar - Extracted from index.html
(function() {
  let currentDate = new Date();
  let viewMode = 'month'; // 'month' for desktop, 'week' for mobile
  let scheduledMeals = {}; // Format: { 'YYYY-MM-DD': [recipeIds] }

  function initCalendar() {
    updateViewMode();
    loadScheduledMeals();
    renderCalendar();
    renderScheduledRecipesList();
    setupEventListeners();

    // Re-check view mode on window resize
    window.addEventListener('resize', () => {
      updateViewMode();
      renderCalendar();
    });
  }

  function updateViewMode() {
    viewMode = window.innerWidth <= 768 ? 'week' : 'month';
  }

  async function loadScheduledMeals() {
    // Load from app.js planner object (date keys -> meal arrays)
    scheduledMeals = {};

    if (window.planner && typeof window.planner === 'object') {
      Object.keys(window.planner).forEach(dateKey => {
        const meals = window.planner[dateKey];
        if (Array.isArray(meals) && meals.length > 0) {
          scheduledMeals[dateKey] = meals.map(meal => {
            // Get recipe name from window.recipes
            let recipeName = 'Unknown Recipe';
            if (window.recipes) {
              const recipe = window.recipes.find(r => r.id === meal.recipeId);
              if (recipe) {
                recipeName = recipe.name;
              }
            }

            return {
              id: meal.id,
              recipeId: meal.recipeId,
              recipeName: recipeName,
              mealType: meal.mealType || 'Dinner',
              cooked: meal.cooked || false
            };
          });
        }
      });
    }
  }

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
  }

  function renderMonthView(container, periodLabel) {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Update period label
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                        'July', 'August', 'September', 'October', 'November', 'December'];
    periodLabel.textContent = `${monthNames[month]} ${year}`;

    // Get first and last day of month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    // Get day of week for first day (0 = Sunday)
    const firstDayOfWeek = firstDay.getDay();

    // Render empty cells for days before month starts
    for (let i = 0; i < firstDayOfWeek; i++) {
      const emptyCell = document.createElement('div');
      emptyCell.className = 'calendar-day disabled';
      container.appendChild(emptyCell);
    }

    // Render each day of the month
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      date.setHours(0, 0, 0, 0);
      const dateKey = formatDateKey(date);

      const dayCell = createDayCell(date, dateKey, today);
      container.appendChild(dayCell);
    }
  }

  function renderWeekView(container, periodLabel) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get start of current week (Sunday)
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    // Get end of week (Saturday)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    // Update period label
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const startMonth = monthNames[startOfWeek.getMonth()];
    const endMonth = monthNames[endOfWeek.getMonth()];
    const startDay = startOfWeek.getDate();
    const endDay = endOfWeek.getDate();

    if (startMonth === endMonth) {
      periodLabel.textContent = `Week of ${startMonth} ${startDay}-${endDay}`;
    } else {
      periodLabel.textContent = `Week of ${startMonth} ${startDay} - ${endMonth} ${endDay}`;
    }

    // Render 7 days
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const dateKey = formatDateKey(date);

      const dayCell = createDayCell(date, dateKey, today);
      container.appendChild(dayCell);
    }
  }

  function createDayCell(date, dateKey, today) {
    const dayCell = document.createElement('div');
    dayCell.className = 'calendar-day';

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
    if (viewMode === 'week') {
      dayHeader.appendChild(dayName);
    }

    dayCell.appendChild(dayHeader);

    // Meals list
    const mealsContainer = document.createElement('div');
    mealsContainer.className = 'calendar-day-meals';

    if (meals.length > 0) {
      meals.forEach(meal => {
        const mealItem = document.createElement('div');
        mealItem.className = 'calendar-meal-item';
        mealItem.textContent = meal.recipeName;
        if (isPast && !meal.cooked) {
          mealItem.style.color = '#B36A5E';
          mealItem.style.fontWeight = '600';
        }
        mealsContainer.appendChild(mealItem);
      });
    } else {
      const emptyMsg = document.createElement('div');
      emptyMsg.className = 'calendar-day-empty';
      emptyMsg.textContent = 'No meals';
      mealsContainer.appendChild(emptyMsg);
    }

    dayCell.appendChild(mealsContainer);

    // Click handler to schedule meal
    if (!isPast || hasMeals) {
      dayCell.addEventListener('click', () => {
        openMealScheduleModal(date, dateKey);
      });
    }

    return dayCell;
  }

  function openMealScheduleModal(date, dateKey) {
    // Use the existing openDayModal function from app.js
    if (window.openDayModal) {
      window.openDayModal(dateKey);
    } else {
      console.error('openDayModal function not found');
    }
  }

  function renderScheduledRecipesList() {
    const listContainer = document.getElementById('scheduled-recipes-list');
    if (!listContainer) return;

    listContainer.innerHTML = '';

    // Get all scheduled meals sorted by date
    const allMeals = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    Object.keys(scheduledMeals).forEach(dateKey => {
      // Parse date at noon to avoid timezone issues
      const date = new Date(dateKey + 'T12:00:00');
      scheduledMeals[dateKey].forEach(meal => {
        allMeals.push({
          date: date,
          dateKey: dateKey,
          ...meal
        });
      });
    });

    // Sort by date
    allMeals.sort((a, b) => a.date - b.date);

    if (allMeals.length === 0) {
      listContainer.innerHTML = '<div class="scheduled-recipes-empty">No scheduled meals yet. Click a date on the calendar to schedule a meal!</div>';
      return;
    }

    allMeals.forEach(meal => {
      const card = createScheduledRecipeCard(meal, today);
      listContainer.appendChild(card);
    });
  }

  function createScheduledRecipeCard(meal, today) {
    const card = document.createElement('div');
    card.className = 'scheduled-recipe-card';

    const info = document.createElement('div');
    info.className = 'scheduled-recipe-info';

    // Emoji/photo
    const emoji = document.createElement('div');
    emoji.className = 'scheduled-recipe-emoji';

    // Try to find recipe in window.recipes to get emoji
    let recipeEmoji = '🍽️';
    if (window.recipes) {
      const recipe = window.recipes.find(r => r.id === meal.recipeId || r.name === meal.recipeName);
      if (recipe) {
        recipeEmoji = getRecipeEmojiFromCategory(recipe.category) || '🍽️';
      }
    }
    emoji.textContent = recipeEmoji;

    const details = document.createElement('div');
    details.className = 'scheduled-recipe-details';

    const name = document.createElement('div');
    name.className = 'scheduled-recipe-name';
    name.textContent = meal.recipeName;

    const dateDiv = document.createElement('div');
    dateDiv.className = 'scheduled-recipe-date';
    const isPast = meal.date < today;
    if (isPast) {
      dateDiv.classList.add('past-date');
      dateDiv.textContent = meal.cooked ?
        `${meal.date.toLocaleDateString()} - Cooked ✓` :
        `${meal.date.toLocaleDateString()} - Not cooked yet!`;
    } else {
      dateDiv.textContent = meal.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }

    details.appendChild(name);
    details.appendChild(dateDiv);

    info.appendChild(emoji);
    info.appendChild(details);

    card.appendChild(info);

    // Cook Now button
    const cookBtn = document.createElement('button');
    cookBtn.className = 'btn-cook-now';
    cookBtn.textContent = meal.cooked ? 'Cooked ✓' : 'Cook Now';
    cookBtn.disabled = meal.cooked;

    cookBtn.addEventListener('click', () => {
      cookNow(meal);
    });

    card.appendChild(cookBtn);

    return card;
  }

  function cookNow(meal) {
    // Find the recipe
    if (!window.recipes) {
      alert('Recipes not loaded yet');
      return;
    }

    const recipe = window.recipes.find(r => r.id === meal.recipeId || r.name === meal.recipeName);
    if (!recipe) {
      alert('Recipe not found');
      return;
    }

    // Use existing Cook Now modal from app.js
    if (window.openCookNowModal) {
      window.openCookNowModal(recipe, meal.dateKey, meal.id);
    } else {
      alert('Cook Now functionality not available');
    }
  }

  function getRecipeEmojiFromCategory(category) {
    const emojis = {
      'Breakfast': '🍳',
      'Lunch': '🥗',
      'Dinner': '🍝',
      'Dessert': '🍰',
      'Snack': '🍿',
      'Appetizer': '🥟',
      'Soup': '🍲',
      'Salad': '🥗',
      'Main': '🍽️',
      'Side': '🥘'
    };
    return emojis[category] || '🍽️';
  }

  function formatDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function setupEventListeners() {
    const prevBtn = document.getElementById('btn-prev-period');
    const nextBtn = document.getElementById('btn-next-period');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (viewMode === 'month') {
          currentDate.setMonth(currentDate.getMonth() - 1);
        } else {
          currentDate.setDate(currentDate.getDate() - 7);
        }
        renderCalendar();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (viewMode === 'month') {
          currentDate.setMonth(currentDate.getMonth() + 1);
        } else {
          currentDate.setDate(currentDate.getDate() + 7);
        }
        renderCalendar();
      });
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCalendar);
  } else {
    // DOM already loaded, but wait a bit for window.recipes to load
    setTimeout(initCalendar, 1000);
  }

  // Expose reload function for external use
  window.reloadCalendar = function() {
    loadScheduledMeals();
    renderCalendar();
    renderScheduledRecipesList();
  };
})();
