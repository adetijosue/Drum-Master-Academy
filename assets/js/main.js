/**
 * DRUM MASTER ACADEMY - Site Brain (Main Logic)
 * Handles: Navigation, Animations, Counters, and Interactivity
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize components only if their functions exist
    if (typeof initPageLoader === 'function') initPageLoader();
    if (typeof initScrollProgress === 'function') initScrollProgress();
    if (typeof initNavigation === 'function') initNavigation();
    if (typeof initScrollReveal === 'function') initScrollReveal();
    if (typeof initCounters === 'function') initCounters();
    if (typeof initFormValidation === 'function') initFormValidation();
    if (typeof initSmoothScroll === 'function') initSmoothScroll();
});

/**
 * Page Loader Logic
 * Hides the loader after page is fully loaded
 */
function initPageLoader() {
    const loader = document.getElementById('page-loader');
    if (!loader) return; // Exit if loader element not found
    window.addEventListener('load', () => {
        setTimeout(() => {
            loader.style.opacity = '0';
            loader.style.visibility = 'hidden';
        }, 500);
    });
}

/**
 * Scroll Progress Bar
 * Updates the width of the progress bar based on scroll position
 */
function initScrollProgress() {
    const progress = document.getElementById('scroll-progress');
    if (!progress) return;
    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
                const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
                const scrolled = (winScroll / height) * 100;
                progress.style.width = scrolled + "%";
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
}

/**
 * Navigation Logic
 * Sticky header and Mobile Hamburger Menu
 */
/**
 * Scroll Reveal Logic
 * Uses Intersection Observer for maximum performance
 */
function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) return;
    
    const revealOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Reveal only once
            }
        });
    }, revealOptions);

    reveals.forEach(el => revealObserver.observe(el));
}

/**
 * Optimized Scroll Handlers
 * Uses requestAnimationFrame for smooth UI updates
 */
function initNavigation() {
    // Navigation and Hamburger mobile menu logic are now centralized in components.js
    // to prevent dual-trigger event collisions and handle state transitions cleanly.
}

/**
 * Animated Counters Logic
 * Animates numbers from 0 to target value
 */
function initCounters() {
    const counters = document.querySelectorAll('.count-up');
    if (!counters.length) return;
    
    const animate = (el) => {
        if (el.dataset.animated) return;
        el.dataset.animated = true;

        const target = parseInt(el.dataset.target);
        const suffix = el.dataset.suffix || '';
        const duration = 2000;
        const frameRate = 60;
        const totalFrames = (duration / 1000) * frameRate;
        const increment = target / totalFrames;
        
        let current = 0;
        let frame = 0;

        const counterAnimate = () => {
            frame++;
            current += increment;
            
            if (frame >= totalFrames) {
                el.textContent = target + suffix;
            } else {
                el.textContent = Math.floor(current) + suffix;
                window.requestAnimationFrame(counterAnimate);
            }
        };
        
        window.requestAnimationFrame(counterAnimate);
    };

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animate(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => counterObserver.observe(counter));
}

/**
 * Form Interactivity
 * Premium feedback for contact forms
 */
function initFormValidation() {
    const forms = document.querySelectorAll('form');
    if (!forms.length) return;
    
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = form.querySelector('button');
            if (!btn) return;
            const originalText = btn.textContent;
            
            // Premium animation for button
            btn.disabled = true;
            btn.textContent = 'Envoi en cours...';
            btn.style.opacity = '0.7';

            setTimeout(() => {
                btn.textContent = 'Message envoyé ! ✓';
                btn.classList.add('btn-success');
                form.reset();
                
                setTimeout(() => {
                    btn.disabled = false;
                    btn.textContent = originalText;
                    btn.style.opacity = '1';
                }, 3000);
            }, 1500);
        });
    });
}

/**
 * Smooth Scroll for internal links
 */
function initSmoothScroll() {
    const anchors = document.querySelectorAll('a[href^="#"]');
    if (!anchors.length) return;
    anchors.forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (!href || href === '#') return;
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
}
