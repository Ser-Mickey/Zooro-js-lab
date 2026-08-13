/* ================================================================
   ZOORO KENYA — script.js
   JavaScript Lab | Web Application Development
   ------------------------------------------------------------
   * Victor Nyagah
   * Student No: 165080
   * BBIT, Web Application Project
   ================================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initWelcomeMessage();     // Feature 1: personalised welcome (Home)
  initHomeSearchValidation();
  initPostForm();           // Feature 2: form validation (Post a House)
  initHuntForm();           // Feature 2: form validation (House Hunt Request)
  initFormToggle();         // Dynamic content: List a Property / Request a House Hunt tabs
  initFileUploadPreview();  // Responsive file upload indicator (Post a House)
  initContactForm();        // Feature 2: form validation (Contact)
  initGalleryFavorites();   // Feature 3: dynamic content (Gallery)
  initListingsExpand();     // Feature 3: dynamic content (Listings)
  initListingsLiveFilter(); // Feature 3: dynamic content (Listings)
  initShortlistDrawer();    // Feature: My Shortlist slide-out drawer (Cart alternative)
  initThemeToggle();        // Bonus: site-wide dark mode
  initBackToTop();          // Bonus: site-wide back-to-top button
});

/* ================================================================
   SHARED HELPERS
   ================================================================ */

/** Escapes user-typed text before it's inserted as HTML. */
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/** Marks a field invalid and prints a short message right under it. */
function showFieldError(field, message) {
  clearFieldError(field);
  field.classList.add('input-error');
  const error = document.createElement('span');
  error.className = 'field-error';
  error.textContent = message;
  field.insertAdjacentElement('afterend', error);
}

/** Removes the error state + message for a single field. */
function clearFieldError(field) {
  field.classList.remove('input-error');
  const next = field.nextElementSibling;
  if (next && next.classList.contains('field-error')) {
    next.remove();
  }
}

/** Small floating toast used for validation results & confirmations. */
function showFormToast(message, isSuccess = true) {
  const existing = document.getElementById('form-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'form-toast';
  toast.className = `form-toast ${isSuccess ? 'success' : 'error'}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('show'));

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}

/* ================================================================
   FEATURE 1 — WELCOME MESSAGE (index.html)
   ================================================================ */
function initWelcomeMessage() {
  const heroContent = document.querySelector('.hero-content');
  const searchBar = document.querySelector('.search-bar');
  if (!heroContent || !searchBar) return;

  const STORAGE_KEY = 'zooro_visitor_name';
  let name = localStorage.getItem(STORAGE_KEY);

  if (!name) {
    const entered = window.prompt("👋 Welcome to Zooro Kenya! What's your name?");
    name = entered && entered.trim() ? entered.trim() : '';
    localStorage.setItem(STORAGE_KEY, name);
  }

  const greeting = name
    ? `Welcome back, <strong>${escapeHTML(name)}</strong>! Ready to find your next home in Nairobi?`
    : `Welcome to Zooro Kenya! Ready to find your next home in Nairobi?`;

  const banner = document.createElement('div');
  banner.className = 'js-welcome-banner';
  banner.innerHTML = `
    <span>👋 ${greeting}</span>
    ${name ? `<button type="button" id="reset-name-btn">Not ${escapeHTML(name)}?</button>` : ''}
  `;
  heroContent.insertBefore(banner, searchBar);

  const resetBtn = document.getElementById('reset-name-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      localStorage.removeItem(STORAGE_KEY);
      location.reload();
    });
  }
}

function initHomeSearchValidation() {
  const searchForm = document.querySelector('.search-bar');
  if (!searchForm) return;

  searchForm.addEventListener('submit', (e) => {
    const input = searchForm.querySelector('input[name="area"]');
    if (!input.value.trim()) {
      e.preventDefault();
      input.classList.add('input-error');
      const original = input.placeholder;
      input.placeholder = 'Please type an area first...';
      input.focus();
      setTimeout(() => {
        input.classList.remove('input-error');
        input.placeholder = original;
      }, 1800);
    }
  });
}

/* ================================================================
   FEATURE 2 — FORM VALIDATION & PROCESSORS
   ================================================================ */

function initPostForm() {
  const nameField = document.getElementById('landlord-name');
  if (!nameField) return;
  const form = nameField.closest('form');
  form.noValidate = true;

  const requiredIds = ['landlord-name', 'phone', 'location', 'house-type', 'rent', 'available-from'];

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let isValid = true;

    requiredIds.forEach((id) => {
      const field = document.getElementById(id);
      clearFieldError(field);
      if (!field.value.trim()) {
        showFieldError(field, 'This field is required.');
        isValid = false;
      }
    });

    const phone = document.getElementById('phone');
    if (phone.value.trim() && !/^\+?[\d\s-]{7,16}$/.test(phone.value.trim())) {
      showFieldError(phone, 'Enter a valid phone number.');
      isValid = false;
    }

    const rent = document.getElementById('rent');
    if (rent.value && Number(rent.value) < 1000) {
      showFieldError(rent, 'Rent should be at least KSh 1,000.');
      isValid = false;
    }

    const availableFrom = document.getElementById('available-from');
    if (availableFrom.value) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (new Date(availableFrom.value) < today) {
        showFieldError(availableFrom, 'Date cannot be in the past.');
        isValid = false;
      }
    }

    if (!isValid) {
      const errorFields = form.querySelectorAll('.input-error');
      if (errorFields.length > 0) {
        errorFields[0].focus();
        errorFields[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      showFormToast(`⚠️ Please fix the ${errorFields.length} error(s) highlighted below.`, false);
      return;
    }

    const isLocalHost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    if (isLocalHost) {
      const formData = new FormData(form);
      fetch('process_listing.php', {
        method: 'POST',
        body: formData
      })
      .then(response => {
        if (!response.ok) throw new Error(`Server status: ${response.status}`);
        return response.text();
      })
      .then(() => {
        showFormToast("🎉 Listing submitted and saved to database!", true);
        resetPostForm(form);
      })
      .catch(error => {
        console.error('PHP Post Error:', error);
        showFormToast('❌ Backend error. Make sure Apache & MySQL are running in XAMPP.', false);
      });
    } else {
      showFormToast("🎉 Listing submitted! We'll publish it within 24 hours.", true);
      resetPostForm(form);
    }
  });

  requiredIds.forEach((id) => {
    const field = document.getElementById(id);
    field.addEventListener('input', () => clearFieldError(field));
    field.addEventListener('change', () => clearFieldError(field));
  });
}

function resetPostForm(form) {
  form.reset();
  const uploadAreaText = form.querySelector('.file-upload-area p');
  if (uploadAreaText) uploadAreaText.textContent = 'Choose file or drag and drop here';
}

function initHuntForm() {
  const nameField = document.getElementById('hunt-name');
  if (!nameField) return;
  const form = nameField.closest('form');
  form.noValidate = true;

  const requiredIds = ['hunt-name', 'hunt-phone', 'hunt-location', 'hunt-house-type', 'hunt-budget', 'hunt-timeframe'];

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let isValid = true;

    requiredIds.forEach((id) => {
      const field = document.getElementById(id);
      clearFieldError(field);
      if (!field.value.trim()) {
        showFieldError(field, 'This field is required.');
        isValid = false;
      }
    });

    const phone = document.getElementById('hunt-phone');
    if (phone.value.trim() && !/^\+?[\d\s-]{7,16}$/.test(phone.value.trim())) {
      showFieldError(phone, 'Enter a valid phone number.');
      isValid = false;
    }

    if (!isValid) {
      const errorFields = form.querySelectorAll('.input-error');
      if (errorFields.length > 0) {
        errorFields[0].focus();
        errorFields[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      showFormToast(`⚠️ Please fix the ${errorFields.length} error(s) highlighted below.`, false);
      return;
    }

    const isLocalHost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    if (isLocalHost) {
      const formData = new FormData(form);
      fetch('process_hunt.php', {
        method: 'POST',
        body: formData
      })
      .then(response => {
        if (!response.ok) throw new Error(`Server status: ${response.status}`);
        return response.text();
      })
      .then(() => {
        showFormToast('🔍 House hunt request saved to database!', true);
        form.reset();
      })
      .catch(error => {
        console.error('PHP Hunt Error:', error);
        showFormToast('❌ Backend error. Make sure Apache & MySQL are running in XAMPP.', false);
      });
    } else {
      showFormToast('🔍 Request received! A Zooro scout will reach out within 24 hours.', true);
      form.reset();
    }
  });

  requiredIds.forEach((id) => {
    const field = document.getElementById(id);
    field.addEventListener('input', () => clearFieldError(field));
    field.addEventListener('change', () => clearFieldError(field));
  });
}

function initFormToggle() {
  const tabLandlord = document.getElementById('tab-landlord');
  const tabHunt = document.getElementById('tab-hunt');
  const panelLandlord = document.getElementById('panel-landlord');
  const panelHunt = document.getElementById('panel-hunt');
  if (!tabLandlord || !tabHunt || !panelLandlord || !panelHunt) return;

  function showLandlord() {
    panelLandlord.classList.remove('hidden');
    panelHunt.classList.add('hidden');
    tabLandlord.classList.add('active');
    tabHunt.classList.remove('active');
    tabLandlord.setAttribute('aria-selected', 'true');
    tabHunt.setAttribute('aria-selected', 'false');
  }

  function showHunt() {
    panelHunt.classList.remove('hidden');
    panelLandlord.classList.add('hidden');
    tabHunt.classList.add('active');
    tabLandlord.classList.remove('active');
    tabHunt.setAttribute('aria-selected', 'true');
    tabLandlord.setAttribute('aria-selected', 'false');
  }

  tabLandlord.addEventListener('click', showLandlord);
  tabHunt.addEventListener('click', showHunt);
}

function initFileUploadPreview() {
  const photoInput = document.getElementById('photo-upload');
  if (!photoInput) return;

  photoInput.addEventListener('change', (e) => {
    const uploadArea = e.target.closest('.file-upload-area');
    if (!uploadArea) return;
    const textElement = uploadArea.querySelector('p');

    if (e.target.files && e.target.files.length > 0) {
      const fileName = e.target.files[0].name;
      if (textElement) textElement.textContent = `Selected File: ${fileName}`;
      uploadArea.style.borderColor = '#10b981';
    } else {
      if (textElement) textElement.textContent = 'Choose file or drag and drop here';
      uploadArea.style.borderColor = '#cbd5e1';
    }
  });
}

function initContactForm() {
  const emailField = document.getElementById('email');
  if (!emailField) return;
  const form = emailField.closest('form');
  form.noValidate = true;

  const requiredIds = ['name', 'email', 'message'];

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let isValid = true;

    requiredIds.forEach((id) => {
      const field = document.getElementById(id);
      clearFieldError(field);
      if (!field.value.trim()) {
        showFieldError(field, 'This field is required.');
        isValid = false;
      }
    });

    if (emailField.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailField.value.trim())) {
      showFieldError(emailField, 'Enter a valid email address.');
      isValid = false;
    }

    const agree = form.querySelector('input[name="agree"]');
    if (agree) {
      const agreeLabel = agree.closest('.checkbox-label');
      const oldAgreeError = agreeLabel?.parentElement.querySelector('.field-error');
      if (oldAgreeError) oldAgreeError.remove();
      if (!agree.checked) {
        const error = document.createElement('span');
        error.className = 'field-error';
        error.textContent = 'Please confirm you agree to be contacted.';
        agreeLabel.insertAdjacentElement('afterend', error);
        isValid = false;
      }
    }

    if (!isValid) {
      const errorFields = form.querySelectorAll('.input-error');
      if (errorFields.length > 0) {
        errorFields[0].focus();
        errorFields[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      const count = errorFields.length;
      showFormToast(`⚠️ Please fix the ${count} error${count > 1 ? 's' : ''} highlighted below.`, false);
      return;
    }

    showFormToast("✅ Message sent! We'll get back to you within 24 hours.", true);
    form.reset();
  });

  requiredIds.forEach((id) => {
    const field = document.getElementById(id);
    field?.addEventListener('input', () => clearFieldError(field));
  });
}

/* ================================================================
   FEATURE 3 — DYNAMIC CONTENT & MY SHORTLIST
   ================================================================ */

/* Gallery: heart button on each flip-card, saved to localStorage */
function initGalleryFavorites() {
  const galleryGrid = document.querySelector('.gallery-grid');
  if (!galleryGrid) return;

  const STORAGE_KEY = 'zooro_shortlist_items';
  const savedItems = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

  const galleryHero = document.querySelector('.gallery-hero');
  const counter = document.createElement('p');
  counter.className = 'favorites-counter';
  galleryHero?.appendChild(counter);

  function updateCounter() {
    const current = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    counter.textContent = current.length > 0
      ? `❤️ You've saved ${current.length} propert${current.length === 1 ? 'y' : 'ies'}`
      : '🤍 Tap the heart on a card to save it to your Shortlist';
  }

  Array.from(galleryGrid.querySelectorAll('.flip-card')).forEach((card, index) => {
    const title = card.querySelector('h3')?.textContent || `Property #${index + 1}`;
    const price = card.querySelector('.price')?.textContent || 'KSh 25,000 / month';
    const img = card.querySelector('img')?.src || 'assets/images/placeholder.jpg';
    const itemId = `gallery-${index}`;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'favorite-btn';
    btn.setAttribute('aria-label', 'Save to shortlist');

    const isSaved = savedItems.some(item => item.id === itemId);
    if (isSaved) {
      btn.classList.add('active');
      btn.textContent = '❤️';
    } else {
      btn.textContent = '♡';
    }

    card.appendChild(btn);

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      let currentItems = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const existingIndex = currentItems.findIndex(item => item.id === itemId);

      if (existingIndex > -1) {
        currentItems.splice(existingIndex, 1);
        btn.classList.remove('active');
        btn.textContent = '♡';
        showFormToast('Removed from Shortlist', true);
      } else {
        currentItems.push({ id: itemId, title, price, img });
        btn.classList.add('active');
        btn.textContent = '❤️';
        showFormToast('Added to Shortlist!', true);
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentItems));
      updateCounter();

      // Dispatch custom event to notify shortlist drawer live
      window.dispatchEvent(new Event('shortlistUpdated'));
    });
  });

  updateCounter();
}

/* My Shortlist Slide-out Drawer (Shopping Cart Alternative) */
function initShortlistDrawer() {
  const navLinks = document.querySelector('.nav-links');
  if (!navLinks) return;

  const STORAGE_KEY = 'zooro_shortlist_items';

  // 1. Inject Shortlist Nav Button
  const li = document.createElement('li');
  const navBtn = document.createElement('button');
  navBtn.type = 'button';
  navBtn.id = 'shortlist-nav-btn';
  navBtn.innerHTML = `❤️ Shortlist <span class="shortlist-badge" id="shortlist-count">0</span>`;
  li.appendChild(navBtn);
  navLinks.appendChild(li);

  // 2. Inject Backdrop & Drawer HTML into body
  const overlay = document.createElement('div');
  overlay.className = 'shortlist-overlay';

  const drawer = document.createElement('aside');
  drawer.className = 'shortlist-drawer';
  drawer.innerHTML = `
    <div class="shortlist-header">
      <h3>❤️ My Shortlist</h3>
      <button class="shortlist-close-btn" aria-label="Close shortlist">&times;</button>
    </div>
    <div class="shortlist-body" id="shortlist-body"></div>
    <div class="shortlist-footer">
      <button class="btn-shortlist-action" id="shortlist-action-btn">Request Bulk Viewing Tour</button>
    </div>
  `;

  document.body.appendChild(overlay);
  document.body.appendChild(drawer);

  const bodyEl = drawer.querySelector('#shortlist-body');
  const countBadge = navBtn.querySelector('#shortlist-count');
  const closeBtn = drawer.querySelector('.shortlist-close-btn');
  const actionBtn = drawer.querySelector('#shortlist-action-btn');

  // 3. Render Drawer Items
  function renderShortlist() {
    const items = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    countBadge.textContent = items.length;

    if (items.length === 0) {
      bodyEl.innerHTML = `
        <div class="shortlist-empty">
          <p style="font-size: 2.5rem; margin-bottom: 5px;">🏡</p>
          <strong>Your shortlist is empty</strong>
          <p>Tap the heart icon on any house card to save properties here for comparison!</p>
        </div>
      `;
      actionBtn.disabled = true;
      return;
    }

    actionBtn.disabled = false;
    bodyEl.innerHTML = items.map((item) => `
      <div class="shortlist-item">
        <img src="${item.img}" alt="${escapeHTML(item.title)}">
        <div class="shortlist-item-info">
          <h4>${escapeHTML(item.title)}</h4>
          <p>${escapeHTML(item.price)}</p>
        </div>
        <button class="shortlist-remove-btn" data-id="${item.id}" aria-label="Remove item">&times;</button>
      </div>
    `).join('');

    // Attach Remove Event Handlers
    bodyEl.querySelectorAll('.shortlist-remove-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idToRemove = e.currentTarget.getAttribute('data-id');
        let current = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        current = current.filter(item => item.id !== idToRemove);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
        
        renderShortlist();
        
        // Reload gallery active hearts if on gallery page
        const galleryCardBtn = document.querySelector(`.favorite-btn[data-id="${idToRemove}"]`);
        if (galleryCardBtn) {
          galleryCardBtn.classList.remove('active');
          galleryCardBtn.textContent = '♡';
        }

        window.dispatchEvent(new Event('shortlistUpdated'));
      });
    });
  }

  // Toggle Drawer Open/Close
  function openDrawer() {
    renderShortlist();
    overlay.classList.add('active');
    drawer.classList.add('open');
  }

  function closeDrawer() {
    overlay.classList.remove('active');
    drawer.classList.remove('open');
  }

  navBtn.addEventListener('click', openDrawer);
  closeBtn.addEventListener('click', closeDrawer);
  overlay.addEventListener('click', closeDrawer);

  // Bulk Request Action Button
  actionBtn.addEventListener('click', () => {
    const items = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (items.length === 0) return;

    showFormToast(`📍 Viewing request sent for ${items.length} shortlisted home(s)!`, true);
    closeDrawer();
  });

  // Sync across tabs & components
  window.addEventListener('shortlistUpdated', renderShortlist);
  renderShortlist();
}

/* Listings: "View Details" expands an extra info panel per card */
function initListingsExpand() {
  const grid = document.querySelector('.listings-grid');
  const isListingsPage = document.querySelector('.filter-bar');
  if (!grid || !isListingsPage) return;

  grid.querySelectorAll('.listing-card').forEach((card) => {
    const link = card.querySelector('.btn-view');
    if (!link) return;

    const panel = document.createElement('div');
    panel.className = 'details-panel';
    panel.innerHTML = `<p>📍 Contact the landlord directly through Zooro to arrange a viewing.
      Deposit and utility terms vary by property — always confirm before paying anything.</p>`;
    card.querySelector('.listing-card-body').appendChild(panel);

    link.addEventListener('click', (e) => {
      e.preventDefault();
      const isOpen = panel.classList.toggle('open');
      link.textContent = isOpen ? 'Hide Details ↑' : 'View Details →';
    });
  });
}

/* Listings: filter bar re-filters the grid live */
function initListingsLiveFilter() {
  const filterForm = document.querySelector('.filter-bar');
  const grid = document.querySelector('.listings-grid');
  if (!filterForm || !grid) return;

  const locationSelect = document.getElementById('location');
  const priceSelect = document.getElementById('price');
  const typeSelect = document.getElementById('type');
  const cards = Array.from(grid.querySelectorAll('.listing-card'));

  const countEl = document.createElement('p');
  countEl.className = 'filter-results-count';
  grid.parentNode.insertBefore(countEl, grid);

  function priceInRange(price, rangeLabel) {
    if (!rangeLabel) return true;
    if (rangeLabel.includes('Under')) return price < 10000;
    if (rangeLabel.includes('10,000') && rangeLabel.includes('20,000')) return price >= 10000 && price <= 20000;
    if (rangeLabel.includes('20,000') && rangeLabel.includes('40,000')) return price >= 20000 && price <= 40000;
    if (rangeLabel.includes('40,000+')) return price > 40000;
    return true;
  }

  function applyFilters() {
    const loc = locationSelect.value;
    const priceRange = priceSelect.value;
    const type = typeSelect.value;
    let visibleCount = 0;

    cards.forEach((card) => {
      const heading = card.querySelector('h3')?.textContent || '';
      const tag = card.querySelector('.listing-tag')?.textContent.trim() || '';
      const priceText = card.querySelector('.listing-price')?.textContent || '';
      const priceNum = parseInt(priceText.replace(/[^\d]/g, ''), 10) || 0;

      const matchesLocation = !loc || heading.includes(loc);
      const matchesType = !type || tag === type;
      const matchesPrice = priceInRange(priceNum, priceRange);
      const visible = matchesLocation && matchesType && matchesPrice;

      card.style.display = visible ? '' : 'none';
      if (visible) visibleCount++;
    });

    countEl.textContent = `Showing ${visibleCount} of ${cards.length} listings`;
  }

  filterForm.addEventListener('submit', (e) => e.preventDefault());
  [locationSelect, priceSelect, typeSelect].forEach((select) => {
    select.addEventListener('change', applyFilters);
  });

  applyFilters();
}

/* ================================================================
   BONUS — SITE-WIDE POLISH
   ================================================================ */

function initThemeToggle() {
  const navLinks = document.querySelector('.nav-links');
  if (!navLinks) return;

  const li = document.createElement('li');
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.id = 'theme-toggle-btn';
  btn.setAttribute('aria-label', 'Toggle dark mode');
  li.appendChild(btn);
  navLinks.appendChild(li);

  const STORAGE_KEY = 'zooro_theme';

  function applyTheme(isDark) {
    document.body.classList.toggle('dark-theme', isDark);
    btn.textContent = isDark ? '☀️' : '🌙';
  }

  applyTheme(localStorage.getItem(STORAGE_KEY) === 'dark');

  btn.addEventListener('click', () => {
    const isDark = !document.body.classList.contains('dark-theme');
    applyTheme(isDark);
    localStorage.setItem(STORAGE_KEY, isDark ? 'dark' : 'light');
  });
}

function initBackToTop() {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.id = 'back-to-top';
  btn.setAttribute('aria-label', 'Back to top');
  btn.textContent = '↑';
  document.body.appendChild(btn);

  window.addEventListener('scroll', () => {
    btn.classList.toggle('show', window.scrollY > 400);
  });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
