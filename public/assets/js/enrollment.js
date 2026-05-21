/**
 * DMA Enrollment & Progression Helper
 * Manages course enrollment actions and dynamically injects module validation controls.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Resolve Course ID
    let enrollBtn = document.querySelector('.btn-enroll-action');
    let courseId = enrollBtn ? enrollBtn.dataset.courseId : null;
    
    if (!courseId) {
        // Fallback: guess from URL filename (e.g. course-afro.html -> afro)
        const match = window.location.pathname.match(/course-(.+)\.html/);
        if (match && match[1]) {
            courseId = match[1];
        }
    }
    
    if (!courseId) return;

    const user = AuthCore.getCurrentUser();
    
    // Show PDF download button if it exists and user is logged in
    const downloadBtn = document.getElementById('btn-download-pdf');
    if (downloadBtn && user) {
        downloadBtn.style.display = 'inline-block';
    }

    function updateButtonState() {
        if (!enrollBtn) return;
        
        if (!user) {
            enrollBtn.textContent = 'Se connecter pour s\'inscrire';
            enrollBtn.href = 'login.html';
        } else if (AuthCore.isEnrolled(courseId)) {
            enrollBtn.textContent = 'Déjà inscrit - Accéder au contenu';
            enrollBtn.classList.add('btn-success');
            enrollBtn.style.background = '#2ec4b6';
            enrollBtn.style.borderColor = '#2ec4b6';
            enrollBtn.style.color = 'white';
            enrollBtn.href = '#module1'; // Jump to first module
        } else {
            enrollBtn.textContent = 'S\'inscrire à cette formation';
            enrollBtn.addEventListener('click', (e) => {
                e.preventDefault();
                AuthCore.enrollCourse(courseId);
                alert('Félicitations ! Vous êtes maintenant inscrit à ce cours.');
                location.reload();
            });
        }
    }

    // 2. Progression Engine (Interactive module validation)
    function initProgressionEngine() {
        if (!user || !AuthCore.isEnrolled(courseId)) {
            // User not enrolled or logged out - do not inject validation controls
            return;
        }

        // Find all module sections (id="module1" to id="module6")
        const modules = document.querySelectorAll('[id^="module"]');
        
        modules.forEach(section => {
            const moduleId = section.id;
            // Ignore non-standard module ids
            if (!/^module[1-6]$/.test(moduleId)) return;

            const isCompleted = user.courseProgress && 
                                user.courseProgress[courseId] && 
                                user.courseProgress[courseId].completedLessons.includes(moduleId);

            const statusContainer = document.createElement('div');
            statusContainer.className = 'completion-status';

            if (isCompleted) {
                // Completed State
                statusContainer.innerHTML = `
                    <span class="badge-completed">
                        <span style="font-size: 1.1rem;">✓</span> Module validé 🥁
                    </span>
                `;
                section.appendChild(statusContainer);
            } else {
                // Not Completed State
                // Check if this module has a quiz button (contains 'CourseQuiz.init')
                const hasQuiz = section.innerHTML.includes('CourseQuiz.init');

                if (hasQuiz) {
                    // Show premium quiz prompt instead of manual complete button
                    statusContainer.innerHTML = `
                        <span class="btn-complete-module" style="border-style: dashed; cursor: default; background: rgba(214,163,47,0.02);">
                            📝 Réussir l'évaluation pour valider
                        </span>
                    `;
                } else {
                    // Manual verification button
                    const btn = document.createElement('button');
                    btn.className = 'btn-complete-module';
                    btn.innerHTML = `<span>🥁</span> Valider ce module`;
                    btn.addEventListener('click', () => {
                        AuthCore.updateCourseProgress(courseId, moduleId);
                        
                        // Micro-animation / state change
                        btn.style.transform = 'scale(0.95)';
                        btn.style.opacity = '0.7';
                        
                        setTimeout(() => {
                            statusContainer.innerHTML = `
                                <span class="badge-completed" style="animation: fadeInUp 0.5s ease;">
                                    ✓ Module validé 🥁
                                </span>
                            `;
                            alert("Félicitations ! Tu as validé le " + moduleId.replace('module', 'Module ') + " ! 💪 Keep drumming!");
                            location.reload();
                        }, 300);
                    });
                    statusContainer.appendChild(btn);
                }
                statusContainer.style.marginTop = '2rem';
                section.appendChild(statusContainer);
            }
        });
    }

    updateButtonState();
    initProgressionEngine();
});
