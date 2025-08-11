// Theme toggle functionality
document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;

    // Determine initial theme: saved override > system preference > light
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = stored ? stored : (prefersDark ? 'dark' : 'light');
    html.setAttribute('data-theme', initialTheme);
    updateToggleButton(initialTheme);
    
    // Theme toggle event listener
    themeToggle.addEventListener('click', function() {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateToggleButton(newTheme);
    });
    
    // Update toggle button text and icon
    function updateToggleButton(theme) {
        const isDark = theme === 'dark';
        themeToggle.innerHTML = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
        themeToggle.setAttribute('aria-pressed', String(isDark));
        themeToggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    }
    
    // Add smooth transitions to all elements when theme changes
    function addTransitions() {
        const elements = document.querySelectorAll('*');
        elements.forEach(element => {
            element.style.transition = 'background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease';
        });
    }
    
    // Initialize transitions
    addTransitions();
    
    // Add some interactive effects
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
        });
    });
    
    // Add fade-in animation to cards
    const cards = document.querySelectorAll('.card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 200);
    });

    // --- Puffin Guide Interactivity ---
    // Copy buttons for code blocks
    function attachCopyHandlers() {
        const copyButtons = document.querySelectorAll('.copy-code');
        copyButtons.forEach((btn) => {
            btn.addEventListener('click', () => {
                let codeEl;
                if (btn.dataset.target === 'previous') {
                    // copy previous sibling code block
                    const prev = btn.previousElementSibling;
                    codeEl = prev && prev.querySelector('code');
                } else if (btn.dataset.target) {
                    codeEl = document.querySelector(btn.dataset.target);
                }
                if (codeEl) {
                    const text = codeEl.innerText.trim();
                    navigator.clipboard.writeText(text).then(() => flash(btn));
                }
            });
        });

        // Copy token buttons
        const tokenButtons = document.querySelectorAll('.copy-token');
        tokenButtons.forEach((btn) => {
            btn.addEventListener('click', () => {
                const val = btn.dataset.value;
                if (val) navigator.clipboard.writeText(val).then(() => flash(btn));
            });
        });

        // Copy all color tokens
        const copyTokens = document.getElementById('copyColorTokens');
        if (copyTokens) {
            copyTokens.addEventListener('click', () => {
                const vars = `:root {\n  --primary: #1F4E79;\n  --secondary: #E87722;\n  --tertiary: #8B9CA7;\n  --danger: #E24A3B;\n  --background: #FFFFFF;\n  --text: #333333;\n  --surface: #F5F5F5;\n  --border: #E0E0E0;\n}`;
                navigator.clipboard.writeText(vars).then(() => flash(copyTokens));
            });
        }
    }

    // ARIA live region for announcements
    const live = document.createElement('div');
    live.setAttribute('role', 'status');
    live.setAttribute('aria-live', 'polite');
    live.style.position = 'absolute';
    live.style.width = '1px';
    live.style.height = '1px';
    live.style.margin = '-1px';
    live.style.padding = '0';
    live.style.overflow = 'hidden';
    live.style.clip = 'rect(0 0 0 0)';
    live.style.whiteSpace = 'nowrap';
    live.style.border = '0';
    document.body.appendChild(live);

    function announce(msg) {
        live.textContent = '';
        // Force assistive tech to pick up changes
        setTimeout(() => { live.textContent = msg; }, 50);
    }

    function flash(el) {
        const original = el.innerHTML;
        el.innerHTML = 'Copied!';
        el.setAttribute('aria-label', 'Copied to clipboard');
        announce('Copied to clipboard');
        setTimeout(() => {
            el.innerHTML = original;
            el.removeAttribute('aria-label');
        }, 1200);
    }

    attachCopyHandlers();

    // Smooth scroll for sidebar links
    const navLinks = document.querySelectorAll('.guide-sidebar .nav-link');
    navLinks.forEach((link) => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });
    });

    // Scrollspy to highlight active section
    const sections = document.querySelectorAll('.guide-content .section');
    if (sections.length && navLinks.length) {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const id = '#' + entry.target.id;
                        navLinks.forEach((lnk) => lnk.classList.toggle('active', lnk.getAttribute('href') === id));
                    }
                });
            },
            { rootMargin: '-40% 0px -50% 0px', threshold: 0.01 }
        );
        sections.forEach((sec) => observer.observe(sec));
    }

    // --- Modal logic ---
    const openers = document.querySelectorAll('[data-open-modal]');
    const closers = document.querySelectorAll('[data-close-modal]');
    let lastActiveEl = null;

    function getFocusable(container) {
        return container.querySelectorAll(
            'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
    }

    function openModal(selector) {
        const backdrop = document.querySelector(selector);
        if (!backdrop) return;
        lastActiveEl = document.activeElement;
        backdrop.classList.add('show');
        backdrop.removeAttribute('aria-hidden');
        const dialog = backdrop.querySelector('.modal');
        // Focus first focusable element in dialog
        const focusables = getFocusable(dialog);
        (focusables[0] || dialog).focus();

        function onKey(e) {
            if (e.key === 'Escape') {
                closeModal(backdrop);
            } else if (e.key === 'Tab') {
                // Simple focus trap
                const list = Array.from(getFocusable(dialog));
                if (!list.length) return;
                const first = list[0];
                const last = list[list.length - 1];
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault(); last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault(); first.focus();
                }
            }
        }
        backdrop.addEventListener('keydown', onKey);
        backdrop._onKey = onKey;

        // Click outside to close
        backdrop.addEventListener('click', (e) => {
            if (e.target === backdrop) closeModal(backdrop);
        }, { once: true });
    }

    function closeModal(backdrop) {
        if (!backdrop) return;
        backdrop.classList.remove('show');
        backdrop.setAttribute('aria-hidden', 'true');
        if (backdrop._onKey) {
            backdrop.removeEventListener('keydown', backdrop._onKey);
            delete backdrop._onKey;
        }
        // restore focus
        if (lastActiveEl && typeof lastActiveEl.focus === 'function') {
            lastActiveEl.focus();
        }
    }

    openers.forEach((btn) => {
        btn.addEventListener('click', () => {
            const sel = btn.getAttribute('data-open-modal');
            if (sel) openModal(sel);
        });
    });
    closers.forEach((btn) => {
        btn.addEventListener('click', () => {
            const backdrop = btn.closest('.modal-backdrop');
            closeModal(backdrop);
        });
    });

    // --- Toast logic ---
    function showToast(selector, message, duration = 2500) {
        const el = document.querySelector(selector);
        if (!el) return;
        if (message) el.textContent = message;
        el.classList.add('show');
        // ARIA announce
        announce(el.textContent || '');
        const hide = () => { el.classList.remove('show'); };
        if (el._timeout) clearTimeout(el._timeout);
        el._timeout = setTimeout(hide, duration);
    }

    document.querySelectorAll('[data-show-toast]').forEach((btn) => {
        btn.addEventListener('click', () => {
            const sel = btn.getAttribute('data-show-toast');
            showToast(sel, 'Saved successfully');
        });
    });
});
