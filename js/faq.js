/* ============================================================================
   FAQ MODAL
   ============================================================================ */

const FAQ_SECTIONS = [
  {
    title: '🌿 The Essentials',
    items: [
      {
        q: 'What makes Peachy Pantry different from a regular shopping list?',
        a: 'The pantry is the heart of your kitchen. Without ingredients, you have no recipes and nothing to plan for meals. Peachy Pantry allows your recipes, inventory, and shopping lists to breathe as one. When you plan a meal, ingredients are automatically "Reserved" and "Available" stock is updated instantly.'
      },
      {
        q: 'What is the difference between On Hand, Reserved, and Available?',
        a: `<ul class="faq-list">
              <li><strong>On Hand (OH):</strong> The total physical count of the item currently in your kitchen.</li>
              <li><strong>Reserved (RE):</strong> The amount allocated to upcoming planned meals.</li>
              <li><strong>Available (AV):</strong> What's left for spontaneous cooking — On Hand minus Reserved.</li>
            </ul>`
      },
      {
        q: 'Why can\'t I enter numbers in the "Unit of Measure" field?',
        a: 'To keep your data clean, Units of Measure are text-based (e.g., ea, slices, pkg, bag, oz, fl, servings). This ensures your recipes and pantry items match exactly, preventing errors. You enter numerical quantities in the "Add Location" or "Bulk Entry" sections.'
      },
      {
        q: 'When should I use "Bulk Entry"?',
        a: 'Use Bulk Entry for your initial kitchen setup. Once your pantry is established, individual "Add Location" entries are best for maintaining precise expiration dates and specific storage spots.'
      }
    ]
  },
  {
    title: '🏠 Household & Syncing',
    items: [
      {
        q: 'What is a Household ID and how do I share it?',
        a: 'Your Household ID lets you sync your pantry with others. Sharing your ID gives someone the ability to view, edit, delete, and add data — perfect for roommates or family members who share a kitchen. Find your ID in the Account panel (👤 icon, top right).'
      },
      {
        q: 'What is "Quick Access" mode?',
        a: 'Quick Access lets you log into your kitchen from a mobile device using a short code instead of your email and password every time. After a one-time verification, your browser is trusted and you can use the code to jump straight in. You can regenerate your code at any time from the Account panel.'
      },
      {
        q: 'How does real-time data work?',
        a: 'Peachy Pantry updates live. If a family member checks an item off the shopping list while you\'re in the kitchen, your view updates automatically.<br><br><em>Note: If your view falls out of sync due to a connection issue, a sync notification will appear at the top of your screen. Simply refresh the page to pull the most current data.</em>'
      }
    ]
  },
  {
    title: '📅 Recipes & Meal Planning',
    items: [
      {
        q: 'Do I have to type my ingredients twice?',
        a: 'No! Ingredient names and units of measure carry over between your pantry and your recipes. No more guessing how you worded something or which unit you used.'
      },
      {
        q: 'What happens when I click "Cook" on a planned meal?',
        a: 'Clicking "Cook" tells the app you\'ve used those ingredients and automatically depletes your On Hand stock.<br><br><em>Pro-tip: If you don\'t have enough of an ingredient, a warning will appear. You can still proceed, but your pantry won\'t be depleted — keeping your stock levels accurate.</em>'
      },
      {
        q: 'Why does my calendar look different on mobile vs. desktop?',
        a: 'Peachy Pantry is built mobile-first. On phones it shows a weekly planner for easy scrolling on the go. On desktop it shows the full month\'s view for long-term planning.'
      }
    ]
  },
  {
    title: '🛒 Shopping Mode',
    items: [
      {
        q: 'How does the Shopping List know what I need?',
        a: `The list populates automatically two ways:
            <ol class="faq-list">
              <li><strong>Thresholds:</strong> When an ingredient's On Hand count drops below the minimum you set in pantry settings.</li>
              <li><strong>Missing Ingredients:</strong> When you've reserved an ingredient for a meal but have nothing on hand.</li>
            </ol>`
      },
      {
        q: 'What is "Focus Mode"?',
        a: 'Focus Mode brings your shopping list full screen so you can concentrate on getting through the store. Tap an item to check it off as you go.'
      },
      {
        q: 'What happens at "Checkout"?',
        a: 'Checkout is your final review before your pantry is updated. You can confirm where each new ingredient is being stored, adjust quantities, and optionally add expiration dates — all before anything is committed.'
      }
    ]
  },
  {
    title: '🛠️ Troubleshooting',
    items: [
      {
        q: 'I updated my pantry, but my family member can\'t see the changes.',
        a: 'Make sure both users are signed into the same Household ID. If data still isn\'t showing, look for the sync notification at the top of the screen and refresh the page.'
      },
      {
        q: 'Can I delete or rename a pantry location or category?',
        a: 'Yes — open the Settings panel (⚙️, top right). You can fully customise your storage locations (e.g., "Fridge", "Bottom Drawer") and item categories to match your kitchen.'
      }
    ]
  }
];

function openFaqModal() {
  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return;

  const sectionsHTML = FAQ_SECTIONS.map(section => `
    <div class="faq-section">
      <h3 class="faq-section-title">${section.title}</h3>
      ${section.items.map(item => `
        <div class="faq-item">
          <button class="faq-q" onclick="this.closest('.faq-item').classList.toggle('faq-open')">
            <span class="faq-q-text">${item.q}</span>
            <span class="faq-chevron">›</span>
          </button>
          <div class="faq-a">${item.a}</div>
        </div>
      `).join('')}
    </div>
  `).join('');

  modalRoot.innerHTML = `
    <div class="modal-overlay" onclick="closeModal()">
      <div class="modal-content faq-modal" onclick="event.stopPropagation()">
        <button class="modal-close" onclick="closeModal()">×</button>
        <h2>❓ Help & FAQ</h2>
        <div class="faq-sections">
          ${sectionsHTML}
        </div>
      </div>
    </div>
  `;
}

window.openFaqModal = openFaqModal;
