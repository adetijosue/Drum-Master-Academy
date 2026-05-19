/**
 * DMA Premium YouTube Video Integration System
 * Centralized video database and dynamic responsive player engine.
 * 
 * ==============================================================================
 * INSTRUCTIONS POUR JOSUÉ :
 * Pour ajouter ou modifier une vidéo d'un module, remplacez simplement les valeurs
 * "PLACEHOLDER_..." ci-dessous par :
 *   - Soit l'identifiant YouTube (ex: "dQw4w9WgXcQ")
 *   - Soit le lien complet de la vidéo (ex: "https://www.youtube.com/watch?v=...")
 *   - Soit le lien court (ex: "https://youtu.be/...")
 * 
 * Le système s'occupe de tout extraire et de l'afficher proprement de manière fluide !
 * ==============================================================================
 */

const COURSE_VIDEOS = {
    // 1. Spécial Drum Master Academy (course-dma-special.html)
    'dma-special': {
        'module1': 'PLACEHOLDER_DMA_MOD1', // Fondation : Posture & Tenue
        'module2': 'PLACEHOLDER_DMA_MOD2', // Tes Premiers Grooves (4/4)
        'module3': 'PLACEHOLDER_DMA_MOD3', // Puissance & Précision des Pieds
        'module4': 'PLACEHOLDER_DMA_MOD4', // Rudiments & Déplacements
        'module5': 'PLACEHOLDER_DMA_MOD5', // Intermédiaire : Nuances & Ghost Notes
        'module6': 'PLACEHOLDER_DMA_MOD6'  // Lire, Écouter & Créer
    },

    // 2. Masterclass Gospel (course-gospel.html)
    'gospel': {
        'module1': 'PLACEHOLDER_GOSPEL_MOD1', // Les Fondations du Gospel Drumming
        'module2': 'PLACEHOLDER_GOSPEL_MOD2', // Grooves & Worship Dynamics
        'module3': 'PLACEHOLDER_GOSPEL_MOD3', // Le Langage des "Chops"
        'module4': 'PLACEHOLDER_GOSPEL_MOD4', // Shout & Praise Break
        'module5': 'PLACEHOLDER_GOSPEL_MOD5', // Musicalité & Accompagnement
        'module6': 'PLACEHOLDER_GOSPEL_MOD6'  // Configuration & Studio
    },

    // 3. Spécialisation Afro Fusion (course-afro.html)
    'afro': {
        'module1': 'PLACEHOLDER_AFRO_MOD1', // Racines & Polyrythmies 6/8
        'module2': 'PLACEHOLDER_AFRO_MOD2', // Afrobeat Master
        'module3': 'PLACEHOLDER_AFRO_MOD3', // Highlife & Soukous
        'module4': 'PLACEHOLDER_AFRO_MOD4', // Rythmes du Terroir (Togo & Bénin)
        'module5': 'PLACEHOLDER_AFRO_MOD5', // Modern Fusion & Amapiano
        'module6': 'PLACEHOLDER_AFRO_MOD6'  // Le "Rolling" Feel
    },

    // 4. Jazz Moderne & Studio (course-jazz.html)
    'jazz': {
        'module1': 'PLACEHOLDER_JAZZ_MOD1',
        'module2': 'PLACEHOLDER_JAZZ_MOD2',
        'module3': 'PLACEHOLDER_JAZZ_MOD3',
        'module4': 'PLACEHOLDER_JAZZ_MOD4',
        'module5': 'PLACEHOLDER_JAZZ_MOD5',
        'module6': 'PLACEHOLDER_JAZZ_MOD6'
    },

    // 5. Etudes des Rythmes (course-rythmes.html)
    'rythmes': {
        'module1': 'PLACEHOLDER_RYTHMES_MOD1',
        'module2': 'PLACEHOLDER_RYTHMES_MOD2',
        'module3': 'PLACEHOLDER_RYTHMES_MOD3',
        'module4': 'PLACEHOLDER_RYTHMES_MOD4',
        'module5': 'PLACEHOLDER_RYTHMES_MOD5',
        'module6': 'PLACEHOLDER_RYTHMES_MOD6'
    },

    // 6. 40 Drum Basic Rudiments (course-rudiments.html)
    'rudiments': {
        'module1': 'PLACEHOLDER_RUDIMENTS_MOD1', // Single & Double Stroke Rolls
        'module2': 'PLACEHOLDER_RUDIMENTS_MOD2', // Paradiddles Master
        'module3': 'PLACEHOLDER_RUDIMENTS_MOD3', // Flams & Drags (Ornementations)
        'module4': 'PLACEHOLDER_RUDIMENTS_MOD4', // Rolls (5, 7, 9, 13, 17)
        'module5': 'PLACEHOLDER_RUDIMENTS_MOD5', // Application Musicale au Kit
        'module6': 'PLACEHOLDER_RUDIMENTS_MOD6'  // La Routine Quotidienne d'Élite
    }
};

/**
 * Moteur d'injection et de gestion des lecteurs vidéo
 */
const CourseVideosManager = {
    // Mapping des miniatures d'arrière-plan des players en fonction du cours
    getThumbnail: function(courseId) {
        const mapping = {
            'gospel': 'assets/images/gospel-pro-thumbnail.png',
            'rudiments': 'assets/images/rudiments-pro-thumbnail.png',
            'afro': 'assets/images/Afro Fusion.png',
            'rythmes': 'assets/images/etudes_rythmes.jpg',
            'dma-special': 'assets/images/studio-session.png',
            'jazz': 'assets/images/drums-closeup.png'
        };
        return mapping[courseId] || 'assets/images/studio-session.png';
    },

    // Nom convivial du cours pour le titre du lecteur
    getCourseTitle: function(courseId) {
        const mapping = {
            'dma-special': 'Zéro à Héros (Spécial DMA)',
            'gospel': 'Masterclass Gospel Pro',
            'afro': 'Spécialisation Afro Fusion',
            'jazz': 'Jazz Moderne & Studio',
            'rythmes': 'Études des Rythmes',
            'rudiments': '40 Drum Basic Rudiments'
        };
        return mapping[courseId] || 'Formation DMA';
    },

    // Extraire l'ID vidéo YouTube depuis n'importe quel format d'URL
    extractYouTubeId: function(input) {
        if (!input || typeof input !== 'string') return null;
        
        // Nettoyer les espaces superflus
        const cleanInput = input.trim();
        
        // Si c'est déjà un ID simple de 11 caractères
        if (/^[a-zA-Z0-9_-]{11}$/.test(cleanInput)) {
            return cleanInput;
        }

        // Patterns d'expressions régulières pour extraire l'ID
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = cleanInput.match(regExp);

        return (match && match[2].length === 11) ? match[2] : null;
    },

    // Déterminer le Course ID à partir du nom du fichier HTML courant
    getCurrentCourseId: function() {
        const match = window.location.pathname.match(/course-(.+)\.html/);
        if (match && match[1]) {
            return match[1];
        }
        return null;
    },

    // Formater la durée en minutes:secondes (ex: 75 -> "1:15")
    formatTime: function(secs) {
        const m = Math.floor(secs / 60);
        const s = Math.floor(secs % 60);
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    },

    // Initialiser le système sur la page de cours
    init: function() {
        const courseId = this.getCurrentCourseId();
        if (!courseId || !COURSE_VIDEOS[courseId]) return;

        const user = typeof AuthCore !== 'undefined' ? AuthCore.getCurrentUser() : null;
        const isEnrolled = typeof AuthCore !== 'undefined' ? AuthCore.isEnrolled(courseId) : false;
        const thumbnail = this.getThumbnail(courseId);
        const courseTitle = this.getCourseTitle(courseId);

        // Récupérer tous les éléments de module standardisés (module1 à module6)
        for (let i = 1; i <= 6; i++) {
            const moduleId = `module${i}`;
            const moduleSection = document.getElementById(moduleId);
            if (!moduleSection) continue;

            // Extraire le titre du module depuis le DOM de la page
            const h2Element = moduleSection.querySelector('h2');
            const moduleTitle = h2Element ? h2Element.textContent.trim() : `Module ${i}`;

            // Créer le conteneur du lecteur Premium
            const videoCard = document.createElement('div');
            videoCard.className = 'premium-video-card';
            
            // Chercher la valeur dans la config
            const videoConfigVal = COURSE_VIDEOS[courseId][moduleId];
            const youtubeId = this.extractYouTubeId(videoConfigVal);

            let cardContentHtml = '';

            if (!user || !isEnrolled) {
                // SCÉNARIO 1 : ÉTUDIANT NON INSCRIT OU NON CONNECTÉ -> LECTEUR VERROUILLÉ AVEC DESIGN YOUTUBE
                cardContentHtml = `
                    <div class="video-frame-wrapper" style="position: relative;">
                        <div class="youtube-mock-player" style="background-image: url('${thumbnail}');">
                            <div class="player-overlay-gradient"></div>
                            
                            <div class="yt-top-bar">
                                <h5 class="yt-video-title">DMA - ${courseTitle} - ${moduleTitle}</h5>
                                <div class="yt-top-actions">
                                    <span>🕒</span>
                                    <span>↗</span>
                                </div>
                            </div>
                            
                            <div class="yt-lock-glass">
                                <div class="lock-icon" style="font-size: 2.5rem; margin-bottom: 0.8rem;">🔒</div>
                                <h5 style="margin-bottom: 0.4rem; color: #fff; font-family: var(--font-heading);">Contenu Vidéo Premium</h5>
                                <p style="font-size: 0.85rem; color: #ccc; max-width: 380px; margin: 0 0 1.2rem 0; line-height: 1.4;">Cette leçon vidéo exclusive et son suivi de progression sont réservés aux membres inscrits à cette formation.</p>
                                <a href="#" class="btn btn-primary" onclick="event.preventDefault(); event.stopPropagation(); document.querySelector('.btn-enroll-action').click();" style="padding: 0.5rem 1.2rem; font-size: 0.75rem; border-radius: 4px; font-weight: 700; text-transform: uppercase;">🔓 Rejoindre le cours</a>
                            </div>
                            
                            <div class="yt-controls-bar" style="opacity: 0.4; pointer-events: none;">
                                <div class="yt-progress-container">
                                    <div class="yt-progress-bar" style="width: 0%;"></div>
                                </div>
                                <div class="yt-controls-row">
                                    <div class="yt-controls-left">
                                        <span class="yt-control-btn">▶</span>
                                        <span class="yt-control-btn">⏭</span>
                                        <span class="yt-control-btn">🔊</span>
                                        <span class="yt-time-display">0:00 / 12:45</span>
                                    </div>
                                    <div class="yt-controls-right">
                                        <span class="yt-control-btn">⚙️</span>
                                        <span class="yt-control-btn">⤢</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="video-details-bar">
                        <span class="video-badge-tag" style="border-color: rgba(255, 68, 68, 0.3); color: #ff4444; background: rgba(255, 68, 68, 0.05);">🔒 Contenu protégé</span>
                        <span>⏱️ Durée estimée : ~12-15 min</span>
                    </div>
                `;
            } else if (!youtubeId) {
                // SCÉNARIO 2 : ÉTUDIANT INSCRIT, MAIS VIDÉO EN PRÉPARATION (MOCK PLAYER YOUTUBE INTERACTIF !)
                cardContentHtml = `
                    <div class="video-frame-wrapper" style="position: relative;">
                        <div class="youtube-mock-player" data-course="${courseId}" data-module="${moduleId}" style="background-image: url('${thumbnail}');">
                            <div class="player-overlay-gradient"></div>
                            
                            <div class="yt-top-bar">
                                <h5 class="yt-video-title">DMA - ${courseTitle} - ${moduleTitle}</h5>
                                <div class="yt-top-actions">
                                    <span class="yt-control-btn">🕒</span>
                                    <span class="yt-control-btn">↗</span>
                                </div>
                            </div>
                            
                            <!-- Gros bouton de lecture rouge YouTube -->
                            <div class="yt-play-btn"></div>
                            
                            <!-- Panneau d'information et Visualiseur (s'affiche lors du clic sur play) -->
                            <div class="yt-demo-notification" style="display: none;">
                                <h5 style="color: var(--gold-primary); font-family: var(--font-heading); margin-top: 0; margin-bottom: 0.5rem; font-size: 1.15rem;">🥁 Mode Démo Interactif</h5>
                                <p style="font-size: 0.85rem; color: #fff; margin-bottom: 0.8rem; line-height: 1.4;">
                                    Votre coach <strong>Josué ADETI</strong> finalise le montage de cette leçon.<br>
                                    Le lien YouTube privé sera inséré ici très prochainement !
                                </p>
                                
                                <div class="yt-visualizer">
                                    <div class="yt-vis-bar"></div>
                                    <div class="yt-vis-bar"></div>
                                    <div class="yt-vis-bar"></div>
                                    <div class="yt-vis-bar"></div>
                                    <div class="yt-vis-bar"></div>
                                    <div class="yt-vis-bar"></div>
                                </div>
                                
                                <span style="font-size: 0.7rem; color: var(--gold-primary); text-transform: uppercase; font-weight: 700; letter-spacing: 1px; border: 1px solid rgba(214,163,47,0.3); padding: 0.3rem 0.6rem; border-radius: 4px;">🚀 Prochainement disponible</span>
                            </div>
                            
                            <div class="yt-controls-bar">
                                <div class="yt-progress-container">
                                    <div class="yt-progress-bar"></div>
                                    <div class="yt-progress-scrubber"></div>
                                </div>
                                <div class="yt-controls-row">
                                    <div class="yt-controls-left">
                                        <span class="yt-control-btn yt-play-toggle">▶</span>
                                        <span class="yt-control-btn">⏭</span>
                                        <span class="yt-control-btn">🔊</span>
                                        <span class="yt-time-display">0:00 / 12:45</span>
                                    </div>
                                    <div class="yt-controls-right">
                                        <span class="yt-control-btn">⚙️</span>
                                        <span class="yt-control-btn yt-fullscreen-btn">⤢</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="video-details-bar">
                        <span class="video-badge-tag" style="background: rgba(214, 163, 47, 0.1); color: var(--gold-primary); border-color: rgba(214, 163, 47, 0.2);">🎬 En préparation</span>
                        <span>🥁 Drum Master Academy Premium Preview</span>
                    </div>
                `;
            } else {
                // SCÉNARIO 3 : ÉTUDIANT INSCRIT ET VIDÉO YOUTUBE ACTIVE
                cardContentHtml = `
                    <div class="video-frame-wrapper">
                        <!-- Utilisation de youtube-nocookie.com pour respecter la vie privée et éviter la pub tierce -->
                        <iframe 
                            src="https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0&modestbranding=1&showinfo=0" 
                            title="DMA Leçon Vidéo - ${moduleId}"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowfullscreen
                            loading="lazy">
                        </iframe>
                    </div>
                    <div class="video-details-bar">
                        <span class="video-badge-tag" style="background: rgba(46, 196, 182, 0.1); color: #2ec4b6; border-color: rgba(46, 196, 182, 0.2);">▶️ Leçon active</span>
                        <span>🎥 Support vidéo inclus</span>
                    </div>
                `;
            }

            videoCard.innerHTML = cardContentHtml;

            // Insérer la carte vidéo juste avant le bloc .curriculum-grid du module
            const gridElement = moduleSection.querySelector('.curriculum-grid');
            if (gridElement) {
                gridElement.before(videoCard);
            } else {
                // Si pas de grid, insérer avant les contrôles de validation
                const completionElement = moduleSection.querySelector('.completion-status');
                if (completionElement) {
                    completionElement.before(videoCard);
                } else {
                    moduleSection.appendChild(videoCard);
                }
            }

            // Si c'est le scénario 2, attacher les gestionnaires d'événements interactifs !
            if (isEnrolled && !youtubeId) {
                this.setupInteractiveMockPlayer(videoCard.querySelector('.youtube-mock-player'));
            }
        }
    },

    // Installer les interactions riches sur le mock player
    setupInteractiveMockPlayer: function(playerEl) {
        if (!playerEl) return;

        const playBtn = playerEl.querySelector('.yt-play-btn');
        const playToggle = playerEl.querySelector('.yt-play-toggle');
        const demoNotification = playerEl.querySelector('.yt-demo-notification');
        const progressBar = playerEl.querySelector('.yt-progress-bar');
        const progressScrubber = playerEl.querySelector('.yt-progress-scrubber');
        const progressContainer = playerEl.querySelector('.yt-progress-container');
        const timeDisplay = playerEl.querySelector('.yt-time-display');
        const fullscreenBtn = playerEl.querySelector('.yt-fullscreen-btn');

        let isPlaying = false;
        let virtualTime = 0;
        const totalDuration = 765; // 12 minutes 45 secondes
        let playbackInterval = null;

        const togglePlay = (e) => {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }

            isPlaying = !isPlaying;

            if (isPlaying) {
                playerEl.classList.add('playing');
                if (playBtn) playBtn.style.display = 'none';
                if (playToggle) playToggle.textContent = '❚❚';
                if (demoNotification) demoNotification.style.display = 'block';

                // Démarrer la lecture virtuelle
                playbackInterval = setInterval(() => {
                    if (virtualTime >= totalDuration) {
                        virtualTime = 0;
                    }
                    virtualTime++;
                    updatePlayerUI();
                }, 1000);
            } else {
                playerEl.classList.remove('playing');
                if (playBtn) playBtn.style.display = 'flex';
                if (playToggle) playToggle.textContent = '▶';
                if (demoNotification) demoNotification.style.display = 'none';

                if (playbackInterval) {
                    clearInterval(playbackInterval);
                    playbackInterval = null;
                }
            }
        };

        const updatePlayerUI = () => {
            // Formater le temps
            const currentStr = this.formatTime(virtualTime);
            const durationStr = this.formatTime(totalDuration);
            if (timeDisplay) timeDisplay.textContent = `${currentStr} / ${durationStr}`;

            // Mettre à jour la barre de progression
            const pct = (virtualTime / totalDuration) * 100;
            if (progressBar) progressBar.style.width = `${pct}%`;
            if (progressScrubber) progressScrubber.style.left = `${pct}%`;
        };

        // Gérer le clic sur le conteneur de progression pour chercher (seek)
        if (progressContainer) {
            progressContainer.addEventListener('click', (e) => {
                e.stopPropagation();
                const rect = progressContainer.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const pct = clickX / rect.width;
                virtualTime = Math.floor(pct * totalDuration);
                updatePlayerUI();
            });
        }

        // Clic sur l'ensemble du player pour basculer play/pause
        playerEl.addEventListener('click', togglePlay);

        // Clic sur le toggle play/pause en bas
        if (playToggle) {
            playToggle.addEventListener('click', togglePlay);
        }

        // Clic sur le mode plein écran pour impressionner l'utilisateur
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (!document.fullscreenElement) {
                    playerEl.parentElement.requestFullscreen().catch(err => {
                        console.log("Erreur d'activation plein écran : ", err);
                    });
                } else {
                    document.exitFullscreen();
                }
            });
        }
    }
};

// Lancer le script au chargement du DOM
document.addEventListener('DOMContentLoaded', () => {
    CourseVideosManager.init();
});
