/**
 * DMA Components - Handles shared UI elements (Navbar & Footer)
 */

const UIComponents = {
    // Navbar Template
    getNavbar(currentPage = '') {
        const user = JSON.parse(localStorage.getItem('dma_current_session'));
        const isAuth = !!user;

        return `
            <div class="container nav-container">
                <a href="index.html" class="logo">
                    <img src="assets/images/logo.jpg" alt="DMA Logo" class="logo-img">
                    <span class="logo-text">DMA<span class="text-gold">.</span></span>
                </a>
                <ul class="nav-links" id="nav-links">
                    <li><a href="index.html" class="${currentPage === 'index.html' ? 'active' : ''}">Accueil</a></li>
                    <li><a href="about.html" class="${currentPage === 'about.html' ? 'active' : ''}">À propos</a></li>
                    <li><a href="history.html" class="${currentPage === 'history.html' ? 'active' : ''}">Notre Histoire</a></li>
                    <li><a href="courses.html" class="${currentPage === 'courses.html' ? 'active' : ''}">Formations</a></li>
                    <li><a href="blog.html" class="${currentPage === 'blog.html' ? 'active' : ''}">Blog</a></li>
                    <li><a href="events.html" class="${currentPage === 'events.html' ? 'active' : ''}">Événements</a></li>
                    <li><a href="contact.html" class="${currentPage === 'contact.html' ? 'active' : ''}">Contact</a></li>
                    ${isAuth ? `<li><a href="community.html" class="${currentPage === 'community.html' ? 'active' : ''}">Communauté</a></li>` : ''}
                    <li class="nav-btn-mobile-only" style="margin-top: 1.5rem; width: 100%; display: none; padding: 0 1.5rem;">
                        <a href="${isAuth ? 'dashboard.html' : 'login.html'}" class="btn btn-primary btn-student-space" style="width: 100%; text-align: center; justify-content: center; ${isAuth ? 'background: var(--gold-gradient); color: var(--bg-main); font-weight: 800;' : ''}">
                            ${isAuth ? 'Mon Espace' : 'Espace Étudiant'}
                        </a>
                    </li>
                </ul>
                <div class="nav-actions">
                    <a href="${isAuth ? 'dashboard.html' : 'login.html'}" class="btn btn-primary nav-btn-desktop btn-student-space" style="padding: 0.8rem 1.5rem; font-size: 0.85rem; ${isAuth ? 'background: var(--gold-gradient); color: var(--bg-main);' : ''}">
                        ${isAuth ? 'Mon Espace' : 'Espace Étudiant'}
                    </a>
                    <button class="hamburger" id="hamburger" aria-label="Ouvrir le menu" aria-expanded="false">
                        <span></span><span></span><span></span>
                    </button>
                </div>
            </div>
        `;
    },

    // Footer Template
    getFooter() {
        return `
            <div class="container">
                <div class="footer-grid">
                    <div>
                        <a href="index.html" class="footer-logo">
                            <img src="assets/images/logo.jpg" alt="DMA Logo" class="footer-logo-img">
                            <span class="logo-text">DMA<span class="text-gold">.</span></span>
                        </a>
                        <p style="font-size: 0.95rem;">L'académie de référence pour les batteurs qui souhaitent repousser leurs limites et s'imposer sur la scène internationale.</p>
                    </div>
                    <div class="footer-links">
                        <h5>Navigation</h5>
                        <ul>
                            <li><a href="index.html">Accueil</a></li>
                            <li><a href="about.html">L'Académie</a></li>
                            <li><a href="courses.html">Nos Formations</a></li>
                            <li><a href="dashboard.html" class="btn-student-space">Espace Étudiant</a></li>
                        </ul>
                    </div>
                    <div class="footer-links">
                        <h5>Ressources</h5>
                        <ul>
                            <li><a href="blog.html">Blog & Actus</a></li>
                            <li><a href="events.html">Événements</a></li>
                            <li><a href="mentions-legales.html">Mentions Légales</a></li>
                            <li><a href="confidentialite.html">Confidentialité</a></li>
                            <li><a href="cgv.html">CGV</a></li>
                        </ul>
                    </div>
                    <div class="footer-links">
                        <h5>Contact</h5>
                        <ul>
                            <li><a href="tel:+22893201132">Appel: +228 93 20 11 32</a></li>
                            <li><a href="https://wa.me/22897068056" target="_blank">WhatsApp: +228 97 06 80 56</a></li>
                            <li><a href="mailto:adetijosue@gmail.com">adetijosue@gmail.com</a></li>
                        </ul>
                    </div>
                </div>
                <div class="footer-bottom">
                    <p>&copy; 2026 Drum Master Academy. Tous droits réservés. <a href="mentions-legales.html" style="color: inherit; text-decoration: underline;">Mentions Légales</a> | <a href="confidentialite.html" style="color: inherit; text-decoration: underline;">Confidentialité</a> | <a href="cgv.html" style="color: inherit; text-decoration: underline;">CGV</a></p>
                </div>
            </div>
        `;
    },

    // Helper to load a script dynamically if not already loaded
    loadScript(src) {
        return new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`) || document.querySelector(`script[src*="${src.split('/').pop()}"]`)) {
                resolve();
                return;
            }
            const script = document.createElement('script');
            script.src = src;
            script.defer = true;
            script.onload = resolve;
            script.onerror = reject;
            document.body.appendChild(script);
        });
    },

    // Initialize UI
    init() {
        const header = document.getElementById('main-header');
        const footer = document.getElementById('main-footer');
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';

        if (header) {
            header.className = 'navbar';
            header.innerHTML = this.getNavbar(currentPage);
            
            // Re-bind hamburger logic if it exists in main.js
            // Or move it here
            this.initNavbarLogic();
        }

        if (footer) {
            footer.innerHTML = this.getFooter();
        }

        // Dynamic omnipresent Coach Widget Integration
        const isAuthPage = currentPage.includes('login') || currentPage.includes('register') || currentPage.includes('setup-profile');
        if (!isAuthPage) {
            this.loadScript('assets/js/gemini-coach.js')
                .then(() => this.loadScript('assets/js/josue-widget.js'))
                .then(() => {
                    // Check if JosueWidget needs manual initialization
                    if (window.JosueWidget && !document.getElementById('josue-widget-container')) {
                        window.JosueWidget.init();
                    }
                })
                .catch(err => console.warn("Could not load virtual coach automatically:", err));
        }
    },

    initNavbarLogic() {
        const hamburger = document.getElementById('hamburger');
        const navLinks = document.getElementById('nav-links');

        if (hamburger && navLinks) {
            hamburger.addEventListener('click', () => {
                const isOpen = hamburger.classList.toggle('open');
                navLinks.classList.toggle('open');
                document.body.classList.toggle('no-scroll', isOpen);
                hamburger.setAttribute('aria-expanded', isOpen);
            });

            // Close mobile menu when clicking a link
            navLinks.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    hamburger.classList.remove('open');
                    navLinks.classList.remove('open');
                    document.body.classList.remove('no-scroll');
                    hamburger.setAttribute('aria-expanded', 'false');
                });
            });
        }

        // Scroll effect with requestAnimationFrame
        let ticking = false;
        const updateHeader = () => {
            const header = document.getElementById('main-header');
            if (header) {
                header.classList.toggle('scrolled', window.scrollY > 50);
            }
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(updateHeader);
                ticking = true;
            }
        }, { passive: true });
        
        // Run once on load
        updateHeader();
    }
};

document.addEventListener('DOMContentLoaded', () => UIComponents.init());

/* ==========================================================================
   DMA CENTRAL NOTIFICATION ENGINE (DMAToast)
   ========================================================================== */
window.DMAToast = {
    container: null,

    init() {
        if (this.container) return;
        this.container = document.getElementById('dma-toast-container');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'dma-toast-container';
            document.body.appendChild(this.container);
        }
    },

    show(message, type = 'success', duration = 4000) {
        this.init();

        const toast = document.createElement('div');
        toast.className = `dma-toast dma-toast-${type}`;

        const icons = {
            success: '🏆',
            error: '⚠️',
            info: '✨',
            warning: '⚡'
        };
        const icon = icons[type] || '✨';

        toast.innerHTML = `
            <div class="dma-toast-icon">${icon}</div>
            <div class="dma-toast-content">${message}</div>
            <button class="dma-toast-close" aria-label="Fermer">✕</button>
            <div class="dma-toast-progress"></div>
        `;

        // Handle Close button click
        toast.querySelector('.dma-toast-close').onclick = (e) => {
            e.stopPropagation();
            this.dismiss(toast);
        };

        // Click on toast to dismiss
        toast.onclick = () => this.dismiss(toast);

        // Add to container
        this.container.appendChild(toast);

        // Auto progress bar countdown
        const progress = toast.querySelector('.dma-toast-progress');
        if (progress) {
            progress.style.width = '100%';
            setTimeout(() => {
                progress.style.transition = `width ${duration}ms linear`;
                progress.style.width = '0%';
            }, 50);
        }

        // Auto remove timeout
        const autoDismissTimer = setTimeout(() => {
            this.dismiss(toast);
        }, duration);

        // Save timer on toast element
        toast.dataset.timerId = autoDismissTimer;
    },

    dismiss(toast) {
        if (!toast || toast.classList.contains('dma-toast-fade-out')) return;
        
        // Clear auto dismiss timer if manual click happened
        if (toast.dataset.timerId) {
            clearTimeout(parseInt(toast.dataset.timerId));
        }

        toast.classList.add('dma-toast-fade-out');
        toast.addEventListener('animationend', () => {
            toast.remove();
        });
    },

    success(msg, dur) { this.show(msg, 'success', dur); },
    error(msg, dur) { this.show(msg, 'error', dur); },
    info(msg, dur) { this.show(msg, 'info', dur); },
    warning(msg, dur) { this.show(msg, 'warning', dur); }
};

// Surcharge globale backward compatibility (dashboard, settings, etc.)
window.showToast = function(message, icon = '?', isSuccess = true) {
    let type = 'success';
    if (isSuccess === false) type = 'error';
    else if (isSuccess === 'error' || isSuccess === 'danger') type = 'error';
    else if (isSuccess === 'info' || isSuccess === 'blue') type = 'info';
    else if (isSuccess === 'warn' || isSuccess === 'warning') type = 'warning';
    
    // Check icons for explicit error/warning cues
    if (icon === '❌') {
        type = 'error';
    } else if (icon === '⚠️') {
        type = 'warning';
    } else if (icon === '❓❓' || icon === '❓') {
        if (message.toLowerCase().includes('erreur') || message.toLowerCase().includes('échec') || message.toLowerCase().includes('vide')) {
            type = 'error';
        } else {
            type = 'warning';
        }
    }
    
    window.DMAToast.show(message, type);
};

