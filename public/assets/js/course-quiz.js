/**
 * DMA Course Quiz Engine
 * Handles module-specific evaluations and final exams.
 */

const CourseQuiz = {
    // Database of quizzes (Example for the "Rythmes" course)
    DB: {
        'rythmes': {
            'module1': {
                title: "Évaluation : Rythmes Occidentaux",
                questions: [
                    { q: "Sur quel temps se place généralement le 'Backbeat' en Rock ?", options: ["1 et 3", "2 et 4", "Tous les temps"], correct: 1 },
                    { q: "Qu'est-ce qui caractérise le Funk ?", options: ["La simplicité", "Les Ghost notes et syncopes", "Le tempo très lent"], correct: 1 }
                ]
            },
            'module2': {
                title: "Évaluation : Rythmes Africains",
                questions: [
                    { q: "Le Highlife est originaire de quel pays principalement ?", options: ["Ghana", "Brésil", "USA"], correct: 0 },
                    { q: "Dans l'Afrobeat, quel instrument dicte souvent la clave ?", options: ["La caisse claire", "La cloche ou le shaker", "Les cymbales"], correct: 1 }
                ]
            },
            'final': {
                title: "EXAMEN FINAL : Maîtrise des Rythmes",
                questions: [
                    { q: "La Clave 3:2 est typique de quel style ?", options: ["Rock", "Salsa/Latin", "Jazz"], correct: 1 },
                    { q: "Qu'est-ce que la subdivision ternaire ?", options: ["Diviser le temps en 2", "Diviser le temps en 3", "Jouer sans métronome"], correct: 1 },
                    { q: "Le 'Dilla Feel' est lié à quel courant ?", options: ["Jazz Classique", "Neo Soul / Hip Hop", "Reggae"], correct: 1 }
                ]
            }
        }
    },

    currentQuiz: null,
    currentQuestionIdx: 0,
    score: 0,
    currentCourseId: null,
    currentModuleId: null,

    init(courseId, moduleId) {
        const quizData = this.DB[courseId][moduleId];
        if (!quizData) return;

        this.currentQuiz = quizData;
        this.currentQuestionIdx = 0;
        this.score = 0;
        this.currentCourseId = courseId;
        this.currentModuleId = moduleId;

        this.renderModal();
        this.showQuestion();
    },

    renderModal() {
        let modal = document.getElementById('quiz-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'quiz-modal';
            modal.style.cssText = `
                position: fixed; inset: 0; background: rgba(0,0,0,0.95);
                z-index: 9999; display: flex; align-items: center; justify-content: center;
                padding: 2rem;
            `;
            document.body.appendChild(modal);
        }
        modal.style.display = 'flex';
        modal.innerHTML = `
            <div style="background: #111; border: 1px solid var(--gold-primary); padding: 3rem; border-radius: 16px; width: 100%; max-width: 600px; position: relative;">
                <button onclick="CourseQuiz.close()" style="position: absolute; top: 1rem; right: 1rem; background: none; border: none; color: white; cursor: pointer; font-size: 1.5rem;">✕</button>
                <h3 id="quiz-title" style="color: var(--gold-primary); margin-bottom: 2rem;"></h3>
                <div id="quiz-content"></div>
            </div>
        `;
        document.getElementById('quiz-title').textContent = this.currentQuiz.title;
    },

    showQuestion() {
        const q = this.currentQuiz.questions[this.currentQuestionIdx];
        const container = document.getElementById('quiz-content');
        
        container.innerHTML = `
            <p style="font-size: 1.1rem; margin-bottom: 2rem;">${q.q}</p>
            <div style="display: flex; flex-direction: column; gap: 1rem;">
                ${q.options.map((opt, i) => `
                    <button class="btn btn-outline" onclick="CourseQuiz.submitAnswer(${i})" style="text-align: left; padding: 1rem;">${opt}</button>
                `).join('')}
            </div>
            <p style="margin-top: 2rem; font-size: 0.8rem; color: #555;">Question ${this.currentQuestionIdx + 1} sur ${this.currentQuiz.questions.length}</p>
        `;
    },

    submitAnswer(idx) {
        if (idx === this.currentQuiz.questions[this.currentQuestionIdx].correct) {
            this.score++;
        }

        this.currentQuestionIdx++;
        if (this.currentQuestionIdx < this.currentQuiz.questions.length) {
            this.showQuestion();
        } else {
            this.showResult();
        }
    },

    showResult() {
        const total = this.currentQuiz.questions.length;
        const percent = (this.score / total) * 100;
        const passed = percent >= 70;

        const container = document.getElementById('quiz-content');
        container.innerHTML = `
            <div style="text-align: center;">
                <h2 style="color: ${passed ? '#44bb44' : '#ff4444'}; font-size: 3rem; margin-bottom: 1rem;">${percent}%</h2>
                <p style="font-size: 1.2rem; margin-bottom: 2rem;">
                    ${passed ? "Félicitations ! Vous avez maîtrisé ce module." : "Dommage... Un peu plus d'étude est nécessaire."}
                </p>
                <button class="btn btn-primary" onclick="CourseQuiz.close()">${passed ? "Continuer le cours" : "Réessayer"}</button>
            </div>
        `;

        if (passed) {
            this.markAsCompleted();
        }
    },

    markAsCompleted() {
        if (this.currentCourseId && this.currentModuleId) {
            AuthCore.updateCourseProgress(this.currentCourseId, this.currentModuleId);
            alert("✓ Excellent ! Tu as réussi l'évaluation et validé ce module.");
            location.reload();
        }
    },

    close() {
        document.getElementById('quiz-modal').style.display = 'none';
    }
};
