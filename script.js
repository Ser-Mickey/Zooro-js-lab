/* ================================================================
   ZOORO KENYA — script.js
   JavaScript Lab | Web Application Development
   ------------------------------------------------------------
   * Victor Nyagah
   * Student No: 165080
   * BBIT, Web Application Project
   ================================================================ */

document.addEventListener('DOMContentLoaded', () => {
   const shortlistBtns = document.querySelectorAll('.shortlist-btn');

  shortlistBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      const icon = btn.querySelector('i');
      btn.classList.toggle('active');

      if (btn.classList.contains('active')) {
        icon.classList.remove('fa-regular');
        icon.classList.add('fa-solid');
      } else {
        icon.classList.remove('fa-solid');
        icon.classList.add('fa-regular');
      }
    });
  });
});
  initWelcomeMessage();     // Feature 1: personalised welcome (Home)
  initHomeSearchValidation();
  initPostForm();           // Feature 2: form validation (Post a House)
  initHuntForm();           // Feature 2: form validation (House Hunt Request)
  initFormToggle();         // Dynamic content: List a Property / Request a House Hunt tabs
  initFileUploadPreview();  // Responsive file upload indicator (Post a House)
  initContactForm();        // Feature 2: form validation (Contact)
  initGalleryFavorites();   // Feature 3: dynamic content (Gallery & Listings Shortlist)
  initListingsExpand();     // Feature 3: dynamic content (Listings)
  initListingsLiveFilter(); // Feature 3: dynamic content (Listings)
  initShortlistDrawer();    // Feature: My Shortlist slide-out drawer
  initBookingModal();       // Feature 2: Client Property Booking & Application Modal
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
    if (!input || !input.value.trim()) {
      e.preventDefault();
      if (input) {
        input.classList.add('input-error');
        const original = input.placeholder;
        input.placeholder = 'Please type an area first...';
        input.focus();
        setTimeout(() => {
          input.classList.remove('input-error');
          input.placeholder = original;
        }, 1800);
      }
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
  if (!form) return;
  form.noValidate = true;

  const requiredIds = ['landlord-name', 'phone', 'location', 'house-type', 'rent', 'available-from'];

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let isValid = true;

    requiredIds.forEach((id) => {
      const field = document.getElementById(id);
      if (!field) return;
      clearFieldError(field);
      if (!field.value.trim()) {
        showFieldError(field, 'This field is required.');
        isValid = false;
      }
    });

    const phone = document.getElementById('phone');
    if (phone && phone.value.trim() && !/^\+?[\d\s-]{7,16}$/.test(phone.value.trim())) {
      showFieldError(phone, 'Enter a valid phone number.');
      isValid = false;
    }

    const rent = document.getElementById('rent');
    if (rent && rent.value && Number(rent.value) < 1000) {
      showFieldError(rent, 'Rent should be at least KSh 1,000.');
      isValid = false;
    }

    const availableFrom = document.getElementById('available-from');
    if (availableFrom && availableFrom.value) {
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
    if (!field) return;
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
  if (!form) return;
  form.noValidate = true;

  const requiredIds = ['hunt-name', 'hunt-phone', 'hunt-location', 'hunt-house-type', 'hunt-budget', 'hunt-timeframe'];

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let isValid = true;

    requiredIds.forEach((id) => {
      const field = document.getElementById(id);
      if (!field) return;
      clearFieldError(field);
      if (!field.value.trim()) {
        showFieldError(field, 'This field is required.');
        isValid = false;
      }
    });

    const phone = document.getElementById('hunt-phone');
    if (phone && phone.value.trim() && !/^\+?[\d\s-]{7,16}$/.test(phone.value.trim())) {
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
    if (!field) return;
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
      uploadArea.style.borderColor = 'var(--green-main, #10b981)';
    } else {
      if (textElement) textElement.textContent = 'Choose file or drag and drop here';
      uploadArea.style.borderColor = '';
    }
  });
}

function initContactForm() {
  const emailField = document.getElementById('email');
  if (!emailField) return;
  const form = emailField.closest('form');
  if (!form) return;
  form.noValidate = true;

  const requiredIds = ['name', 'email', 'message'];

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let isValid = true;

    requiredIds.forEach((id) => {
      const field = document.getElementById(id);
      if (!field) return;
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
        if (agreeLabel) {
          agreeLabel.insertAdjacentElement('afterend', error);
        } else {
          agree.insertAdjacentElement('afterend', error);
        }
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
   FEATURE 2.1 — PROPERTY BOOKING & APPLICATION MODAL
   ================================================================ */
function initBookingModal() {
  // Inject modal into HTML body if not existing
  let modal = document.getElementById('booking-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'booking-modal';
    modal.className = 'booking-modal-overlay';
    modal.innerHTML = `
      <div class="booking-modal-content">
        <div class="booking-modal-header">
          <h3>🏡 Book Property / Submit Application</h3>
          <button type="button" class="booking-modal-close">&times;</button>
        </div>
        <form id="booking-form" noValidate>
          <div class="form-group">
            <label for="booking-property">Selected Property</label>
            <input type="text" id="booking-property" name="property_title" readonly>
          </div>
          <div class="form-group">
            <label for="booking-price">Rent Price</label>
            <input type="text" id="booking-price" name="property_price" readonly>
          </div>
          <div class="form-group">
            <label for="booking-name">Your Full Name *</label>
            <input type="text" id="booking-name" name="client_name" required placeholder="John Doe">
          </div>
          <div class="form-group">
            <label for="booking-phone">Phone Number *</label>
            <input type="tel" id="booking-phone" name="client_phone" required placeholder="0712345678">
          </div>
          <div class="form-group">
            <label for="booking-email">Email Address</label>
            <input type="email" id="booking-email" name="client_email" placeholder="john@example.com">
          </div>
          <div class="form-group">
            <label for="booking-date">Preferred Viewing / Move-in Date *</label>
            <input type="date" id="booking-date" name="preferred_date" required>
          </div>
          <div class="form-group">
            <label for="booking-notes">Special Requests / Notes</label>
            <textarea id="booking-notes" name="notes" rows="2" placeholder="Any specific requirements..."></textarea>
          </div>
          <button type="submit" class="btn-primary" style="width:100%; margin-top:10px;">Submit Application</button>
        </form>
      </div>
    `;
    document.body.appendChild(modal);
  }

  const closeBtn = modal.querySelector('.booking-modal-close');
  const form = modal.querySelector('#booking-form');

  function openModal(title, price) {
    const savedName = localStorage.getItem('zooro_visitor_name') || '';
    modal.querySelector('#booking-property').value = title || 'General Property Booking';
    modal.querySelector('#booking-price').value = price || 'N/A';
    modal.querySelector('#booking-name').value = savedName;
    modal.classList.add('active');
  }

  function closeModal() {
    modal.classList.remove('active');
    form.reset();
  }

  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Attach modal trigger to global window for external script trigger
  window.openBookingModal = openModal;

  // Handle Booking Submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let isValid = true;

    const nameInput = form.querySelector('#booking-name');
    const phoneInput = form.querySelector('#booking-phone');
    const dateInput = form.querySelector('#booking-date');

    [nameInput, phoneInput, dateInput].forEach(field => clearFieldError(field));

    if (!nameInput.value.trim()) { showFieldError(nameInput, 'Name is required.'); isValid = false; }
    if (!phoneInput.value.trim() || !/^\+?[\d\s-]{7,16}$/.test(phoneInput.value.trim())) { 
      showFieldError(phoneInput, 'Valid phone number is required.'); isValid = false; 
    }
    if (!dateInput.value) { showFieldError(dateInput, 'Date is required.'); isValid = false; }

    if (!isValid) return;

    const isLocalHost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    if (isLocalHost) {
      const formData = new FormData(form);
      fetch('process_booking.php', {
        method: 'POST',
        body: formData
      })
      .then(response => {
        if (!response.ok) throw new Error(`Server status: ${response.status}`);
        return response.text();
      })
      .then(() => {
        showFormToast('🎉 Booking request saved to database!', true);
        closeModal();
      })
      .catch(error => {
        console.error('PHP Booking Error:', error);
        showFormToast('❌ Backend error. Ensure Apache & MySQL are running in XAMPP.', false);
      });
    } else {
      showFormToast('🎉 Booking application submitted successfully!', true);
      closeModal();
    }
  });
}

/* ================================================================
   FEATURE 3 — DYNAMIC CONTENT & MY SHORTLIST
   ================================================================ */

/* Helper function to dynamically extract the exact title from flip cards or listings */
function extractCardTitle(card, fallbackIndex) {
  const titleSelectors = [
    '.flip-card-back h3',
    '.flip-card-front h3',
    'h3',
    'h4',
    '.listing-title',
    '.card-title',
    '.property-title'
  ];

  for (const selector of titleSelectors) {
    const el = card.querySelector(selector);
    if (el && el.textContent.trim()) {
      return el.textContent.trim();
    }
  }

  const candidates = card.querySelectorAll('p, span, div, strong');
  for (const el of candidates) {
    const txt = el.textContent.trim();
    if (el.children.length === 0 && (txt.includes('Bedroom') || txt.includes('Bedsitter') || txt.includes('Studio') || txt.includes('Apartment') || txt.includes('House'))) {
      return txt;
    }
  }

  return `Property Listing #${fallbackIndex + 1}`;
}

/* Helper function to dynamically extract the exact price from a card */
function extractCardPrice(card) {
  const priceSelectors = ['.listing-price', '.price', '.card-price', '.property-price'];
  for (const selector of priceSelectors) {
    const el = card.querySelector(selector);
    if (el && el.textContent.trim()) {
      return el.textContent.trim();
    }
  }

  const candidates = card.querySelectorAll('p, span, div, h4, strong');
  for (const el of candidates) {
    const txt = el.textContent.trim();
    if (el.children.length === 0 && (txt.includes('KSh') || txt.includes('ksh') || txt.includes('/ month'))) {
      return txt;
    }
  }

  return 'Price on Request';
}

/* Gallery & Listings: Heart button on each card */
function initGalleryFavorites() {
  const allCards = Array.from(document.querySelectorAll('.flip-card, .listing-card'));
  if (allCards.length === 0) return;

  const STORAGE_KEY = 'zooro_shortlist_items';

  const heroSection = document.querySelector('.gallery-hero') || document.querySelector('.listings-hero');
  let counter = heroSection?.querySelector('.favorites-counter');
  if (heroSection && !counter) {
    counter = document.createElement('p');
    counter.className = 'favorites-counter';
    heroSection.appendChild(counter);
  }

  function updateCounter() {
    if (!counter) return;
    const current = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    counter.textContent = current.length > 0
      ? `❤️ You've saved ${current.length} propert${current.length === 1 ? 'y' : 'ies'}`
      : '🤍 Tap the heart on a card to save it to your Shortlist';
  }

  function syncCardStates() {
    const savedItems = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    document.querySelectorAll('.favorite-btn').forEach((btn) => {
      const itemId = btn.getAttribute('data-id');
      const isSaved = savedItems.some(item => item.id === itemId);
      if (isSaved) {
        btn.classList.add('active');
        btn.textContent = '❤️';
      } else {
        btn.classList.remove('active');
        btn.textContent = '♡';
      }
    });
    updateCounter();
  }

  allCards.forEach((card, index) => {
    const itemId = `property-${index}`;

    // Ensure heart button exists
    let btn = card.querySelector('.favorite-btn');
    if (!btn) {
      btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'favorite-btn';
      btn.setAttribute('data-id', itemId);
      btn.setAttribute('aria-label', 'Save to shortlist');
      card.appendChild(btn);
    }

    btn.addEventListener('click', (e) => {
      e.stopPropagation();

      const title = extractCardTitle(card, index);
      const price = extractCardPrice(card);
      const img = card.querySelector('img')?.src || 'assets/images/placeholder.jpg';

      let currentItems = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const existingIndex = currentItems.findIndex(item => item.id === itemId);

      if (existingIndex > -1) {
        currentItems.splice(existingIndex, 1);
        showFormToast(`Removed "${title}" from Shortlist`, true);
      } else {
        currentItems.push({ id: itemId, title, price, img });
        showFormToast(`Saved "${title}" (${price}) to Shortlist!`, true);
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentItems));
      syncCardStates();

      window.dispatchEvent(new Event('shortlistUpdated'));
    });
  });

  syncCardStates();
  window.addEventListener('shortlistUpdated', syncCardStates);
}

/* My Shortlist Slide-out Drawer */
function initShortlistDrawer() {
  const navLinks = document.querySelector('.nav-links');
  if (!navLinks) return;

  const STORAGE_KEY = 'zooro_shortlist_items';

  // 1. Inject Shortlist Nav Button
  let navBtn = document.getElementById('shortlist-nav-btn');
  if (!navBtn) {
    const li = document.createElement('li');
    navBtn = document.createElement('button');
    navBtn.type = 'button';
    navBtn.id = 'shortlist-nav-btn';
    navBtn.innerHTML = `❤️ Shortlist <span class="shortlist-badge" id="shortlist-count">0</span>`;
    li.appendChild(navBtn);
    navLinks.appendChild(li);
  }

  // 2. Inject Backdrop & Drawer HTML
  let overlay = document.querySelector('.shortlist-overlay');
  let drawer = document.querySelector('.shortlist-drawer');

  if (!drawer) {
    overlay = document.createElement('div');
    overlay.className = 'shortlist-overlay';

    drawer = document.createElement('aside');
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
  }

  const bodyEl = drawer.querySelector('#shortlist-body');
  const countBadge = navBtn.querySelector('#shortlist-count');
  const closeBtn = drawer.querySelector('.shortlist-close-btn');
  const actionBtn = drawer.querySelector('#shortlist-action-btn');

  function renderShortlist() {
    const items = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (countBadge) countBadge.textContent = items.length;

    if (!bodyEl) return;

    if (items.length === 0) {
      bodyEl.innerHTML = `
        <div class="shortlist-empty">
          <p style="font-size: 2.5rem; margin-bottom: 5px;">🏡</p>
          <strong>Your shortlist is empty</strong>
          <p>Tap the heart icon on any house card to save properties here for comparison!</p>
        </div>
      `;
      if (actionBtn) actionBtn.disabled = true;
      return;
    }

    if (actionBtn) actionBtn.disabled = false;
    bodyEl.innerHTML = items.map((item) => `
      <div class="shortlist-item">
        <img src="${item.img}" alt="${escapeHTML(item.title)}">
        <div class="shortlist-item-info">
          <h4>${escapeHTML(item.title)}</h4>
          <p class="shortlist-item-price">${escapeHTML(item.price)}</p>
        </div>
        <button class="shortlist-remove-btn" data-id="${item.id}" aria-label="Remove item">&times;</button>
      </div>
    `).join('');

    bodyEl.querySelectorAll('.shortlist-remove-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idToRemove = e.currentTarget.getAttribute('data-id');
        let current = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        current = current.filter(item => item.id !== idToRemove);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(current));

        renderShortlist();
        window.dispatchEvent(new Event('shortlistUpdated'));
      });
    });
  }

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
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (overlay) overlay.addEventListener('click', closeDrawer);

  // Bulk Request Action Button -> Opens modal with shortlisted titles
  if (actionBtn) {
    actionBtn.addEventListener('click', () => {
      const items = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      if (items.length === 0) return;

      const titles = items.map(i => i.title).join(', ');
      closeDrawer();
      if (window.openBookingModal) {
        window.openBookingModal(`Bulk Tour (${items.length} homes): ${titles}`, 'Multiple');
      }
    });
  }

  window.addEventListener('shortlistUpdated', renderShortlist);
  renderShortlist();
}

/* Listings: "View Details" expands extra info panel + Book Viewing button */
function initListingsExpand() {
  const grid = document.querySelector('.listings-grid');
  const isListingsPage = document.querySelector('.filter-bar');
  if (!grid || !isListingsPage) return;

  grid.querySelectorAll('.listing-card').forEach((card, index) => {
    const link = card.querySelector('.btn-view');
    if (!link) return;

    const cardBody = card.querySelector('.listing-card-body') || card;
    const panel = document.createElement('div');
    panel.className = 'details-panel';
    panel.innerHTML = `
      <p>📍 Contact the landlord directly through Zooro to arrange a viewing.
      Deposit and utility terms vary by property — always confirm before paying anything.</p>
      <button type="button" class="btn-primary btn-apply-now" style="margin-top:10px; width:100%;">⚡ Apply / Book Viewing</button>
    `;
    cardBody.appendChild(panel);

    const applyBtn = panel.querySelector('.btn-apply-now');
    if (applyBtn) {
      applyBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const title = extractCardTitle(card, index);
        const price = extractCardPrice(card);
        if (window.openBookingModal) window.openBookingModal(title, price);
      });
    }

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
  const loc = locationSelect ? locationSelect.value : '';
  const priceRange = priceSelect ? priceSelect.value : '';
  const type = typeSelect ? typeSelect.value : '';

  const visibleCards = [];
  const hiddenCards = [];

  // 1. Evaluate filter matches
  cards.forEach((card) => {
    // Reset any previous recommendation styling
    card.classList.remove('is-recommendation');

    const heading = card.querySelector('h3')?.textContent || '';
    const tag = card.querySelector('.listing-tag')?.textContent.trim() || '';
    const priceText = card.querySelector('.listing-price')?.textContent || '';
    const priceNum = parseInt(priceText.replace(/[^\d]/g, ''), 10) || 0;

    const matchesLocation = !loc || heading.toLowerCase().includes(loc.toLowerCase());
    const matchesType = !type || tag === type;
    const matchesPrice = priceInRange(priceNum, priceRange);

    if (matchesLocation && matchesType && matchesPrice) {
      visibleCards.push(card);
    } else {
      hiddenCards.push(card);
    }
  });

  // 2. Hide all cards first
  cards.forEach((card) => (card.style.display = 'none'));

  // 3. Show matching cards
  visibleCards.forEach((card) => (card.style.display = ''));

  // 4. Recommendation Logic & Counter Text
  const countElement = document.querySelector('.filter-results-count');

  if (visibleCards.length === 1 && hiddenCards.length > 0) {
    // Show 1 or 2 recommended listings alongside the 1 match
    const recommendations = hiddenCards.slice(0, 2);
    recommendations.forEach((card) => {
      card.style.display = '';
      card.classList.add('is-recommendation');
    });

    if (countElement) {
      countElement.textContent = `Showing 1 exact match and ${recommendations.length} recommended listing(s)`;
    }
  } else {
    if (countElement) {
      countElement.textContent = `Showing ${visibleCards.length} of ${cards.length} listings`;
    }
  }
}

    countEl.textContent = `Showing ${visibleCount} of ${cards.length} listings`;
  }

  filterForm.addEventListener('submit', (e) => e.preventDefault());
  [locationSelect, priceSelect, typeSelect].forEach((select) => {
    if (select) {
      select.addEventListener('change', applyFilters);
    }
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
