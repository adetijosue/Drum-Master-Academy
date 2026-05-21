/**
 * DMA Authentication Helper
 * Manages Navbar state and enforces onboarding flow
 */

document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('dma_current_session'));
    const currentPage = window.location.pathname.split('/').pop();
    const publicPages = ['', 'index.html', 'about.html', 'history.html', 'courses.html', 'blog.html', 'events.html', 'contact.html', 'login.html', 'register.html'];
    const setupPage = 'setup-profile.html';

    // 1. Mandatory Setup Redirect
    if (user && !user.setupCompleted && !user.setupPostponed && currentPage !== setupPage && !publicPages.includes(currentPage)) {
        console.log("[DMA AUTH] Redirection vers la configuration du profil...");
        window.location.href = setupPage;
        return;
    }

    // 2. Course Cards Updates (if applicable)
    if (user) {
        const courseButtons = document.querySelectorAll('.course-card .btn');
        courseButtons.forEach(btn => {
            const courseLink = btn.getAttribute('href');
            if (courseLink) {
                const match = courseLink.match(/course-(.+)\.html/);
                if (match && match[1]) {
                    const courseId = match[1];
                    if (user.enrolledCourses && user.enrolledCourses.includes(courseId)) {
                        btn.textContent = 'Accéder au contenu';
                        btn.classList.add('btn-success');
                    }
                }
            }
        });
    }
});
