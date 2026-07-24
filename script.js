/**
 * Zooro JavaScript Lab - Main Interactive Logic
 * Author: Victor
 * Student No: 165080
 * Course Assignment: Web Development (JS Lab)
 */

document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. Personalised Welcome Message (5 Marks)
    // ==========================================
    function initWelcomeMessage() {
        const welcomeBanner = document.getElementById('welcome-banner');
        if (!welcomeBanner) return; // Guard clause if element isn't on current page

        // Retrieve saved username from sessionStorage to prevent prompt spam on reload
        let username = sessionStorage.getItem('zooro_user');

        if (!username) {
            username = prompt('Welcome to Zooro! Please enter your name:');

            // Sanitize and validate input
            if (username && username.trim() !== '') {
                username = username.trim();
                sessionStorage.setItem('zooro_user', username);
            } else {
                username = 'Valued Guest';
            }
        }

        welcomeBanner.innerHTML = `👋 Welcome back, <strong>${escapeHtml(username)}</strong>! Explore our services below.`;
    }

    // ==========================================
    // 2. Comprehensive Form Validation (10 Marks)
    // ==========================================
    function initFormValidation() {
        const contactForm = document.getElementById('contact-form');
        if (!contactForm) return; // Guard clause

        contactForm.addEventListener('submit', (event) => {
            event.preventDefault(); // Intercept browser submission
            
            let isFormValid = true;
            
            // Clear previous error messages and styling
            clearFormErrors(contactForm);

            // Fetch form fields
            const nameInput = document.getElementById('fullname');
            const emailInput = document.getElementById('email');
            const messageInput = document.getElementById('message');

            // 1. Validate Name
            if (!nameInput || nameInput.value.trim() === '') {
                showFieldError(nameInput, 'Full Name is required.');
                isFormValid = false;
            }

            // 2. Validate Email (Required + Format Regex)
            if (!emailInput || emailInput.value.trim() === '') {
                showFieldError(emailInput, 'Email address is required.');
                isFormValid = false;
            } else if (!isValidEmail(emailInput.value.trim())) {
                showFieldError(emailInput, 'Please enter a valid email address (e.g., name@domain.com).');
                isFormValid = false;
            }

            // 3. Validate Message
            if (!messageInput || messageInput.value.trim() === '') {
                showFieldError(messageInput, 'Please enter a message.');
                isFormValid = false;
            }

            // Successful Submission Confirmation
            if (isFormValid) {
                showSubmissionSuccess(contactForm);
            }
        });
    }

    // ==========================================
    // 3. Dynamic Content Features (10 Marks)
    // ==========================================

    // Feature A: Show/Hide (Expandable Content)
    function initExpandableContent() {
        const toggleButtons = document.querySelectorAll('.toggle-details-btn');

        toggleButtons.forEach((button) => {
            button.addEventListener('click', () => {
                const targetId = button.getAttribute('data-target');
                const targetContent = document.getElementById(targetId);

                if (targetContent) {
                    const isHidden = targetContent.classList.contains('hidden');
                    
                    if (isHidden) {
                        targetContent.classList.remove('hidden');
                        button.textContent = 'Show Less ▲';
                        button.classList.add('active-btn');
                    } else {
                        targetContent.classList.add('hidden');
                        button.textContent = 'Read More ▼';
                        button.classList.remove('active-btn');
                    }
                }
            });
        });
    }

    // Feature B: Interactive Card Selection & Dynamic Status Bar
    function initCardSelection() {
        const serviceCards = document.querySelectorAll('.interactive-card');
        const selectionNotice = document.getElementById('selection-status');

        serviceCards.forEach((card) => {
            card.addEventListener('click', () => {
                // Toggle active state across cards
                serviceCards.forEach(c => c.classList.remove('card-selected'));
                card.classList.add('card-selected');

                const serviceTitle = card.querySelector('h3') ? card.querySelector('h3').textContent : 'Service';
                
                if (selectionNotice) {
                    selectionNotice.innerHTML = `✅ You selected: <strong>${escapeHtml(serviceTitle)}</strong>. Click "Inquire Now" to get started!`;
                    selectionNotice.style.display = 'block';
                }
            });
        });
    }

    // Feature C: Dark/Light Mode Theme Toggle
    function initThemeToggle() {
        const themeBtn = document.getElementById('theme-toggle-btn');
        if (!themeBtn) return;

        themeBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark-theme');
            const isDark = document.body.classList.contains('dark-theme');
            themeBtn.textContent = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
        });
    }

    // ==========================================
    // Helper & Utility Functions
    // ==========================================
    
    function showFieldError(inputElement, errorMessage) {
        if (!inputElement) return;
        inputElement.classList.add('input-error');

        const errorSpan = document.createElement('span');
        errorSpan.className = 'error-text';
        errorSpan.textContent = errorMessage;

        if (inputElement.parentElement) {
            inputElement.parentElement.appendChild(errorSpan);
        }
    }

    function clearFormErrors(form) {
        const errorTexts = form.querySelectorAll('.error-text');
        errorTexts.forEach(el => el.remove());

        const errorInputs = form.querySelectorAll('.input-error');
        errorInputs.forEach(el => el.classList.remove('input-error'));

        const successMsg = form.querySelector('.success-message');
        if (successMsg) successMsg.remove();
    }

    function showSubmissionSuccess(form) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.innerHTML = '🎉 Thank you! Your message has been validated and submitted successfully.';
        
        form.reset();
        form.appendChild(successDiv);

        setTimeout(() => {
            successDiv.remove();
        }, 5000);
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function escapeHtml(str) {
        return str.replace(/[&<>"']/g, (m) => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        })[m]);
    }

    // Initialize all modules safely
    initWelcomeMessage();
    initFormValidation();
    initExpandableContent();
    initCardSelection();
    initThemeToggle();
});