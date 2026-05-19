/**
 * ============================================================
 * JOSUÉ COACH - GLOBAL WIDGET
 * Injecte un popup flottant de discussion sur toutes les pages.
 * ============================================================
 */

const JosueWidget = {
    init() {
        // Ne pas afficher sur la page de login ou register
        const path = window.location.pathname;
        if (path.includes('login') || path.includes('register') || path.includes('setup-profile')) {
            return;
        }

        this.injectHTML();
        this.injectStyles();
        this.setupEventListeners();
        
        // Message de bienvenue si l'historique est vide
        setTimeout(() => {
            if (this.chatMessages.children.length === 0) {
                this.appendJosueMessage("Salut ! Je suis Josué, ton coach virtuel 24/7. Comment puis-je t'aider aujourd'hui avec ta batterie ? 🥁");
            }
        }, 1000);
    },

    injectHTML() {
        const container = document.createElement('div');
        container.id = 'josue-widget-container';
        container.innerHTML = `
            <!-- Floating Button -->
            <button id="josue-fab" aria-label="Discuter avec Josué">
                <div class="fab-avatar">JA</div>
                <span class="fab-indicator"></span>
            </button>

            <!-- Chat Window -->
            <div id="josue-chat-window" class="hidden">
                <div class="chat-header">
                    <div class="header-info">
                        <div class="header-avatar">JA</div>
                        <div>
                            <h4>Josué ADETI</h4>
                            <span>En ligne 24/7</span>
                        </div>
                    </div>
                    <div class="header-actions">
                        <button id="josue-reset-btn" title="Recommencer" aria-label="Réinitialiser">🔄</button>
                        <button id="josue-close-btn" aria-label="Fermer">✖</button>
                    </div>
                </div>

                <div class="chat-body" id="josue-chat-messages">
                    <!-- Messages will be injected here -->
                </div>

                <div class="quick-actions" id="josue-quick-actions">
                    <button class="quick-action-btn" data-msg="Quels exercices me conseilles-tu pour m'échauffer aujourd'hui ?">🥁 Échauffement</button>
                    <button class="quick-action-btn" data-msg="Peux-tu m'expliquer comment bien travailler mes moulins ?">🥢 Technique</button>
                    <button class="quick-action-btn" data-msg="J'ai du mal à rester motivé. Des conseils ?">🔥 Motivation</button>
                </div>

                <div id="josue-typing" class="hidden">
                    <div class="typing-indicator">
                        <span></span><span></span><span></span>
                    </div>
                </div>

                <div class="chat-footer">
                    <textarea id="josue-chat-input" placeholder="Pose ta question à Josué..." rows="1"></textarea>
                    <button id="josue-send-btn">🚀</button>
                </div>
            </div>
        `;
        document.body.appendChild(container);

        this.fab = document.getElementById('josue-fab');
        this.chatWindow = document.getElementById('josue-chat-window');
        this.closeBtn = document.getElementById('josue-close-btn');
        this.resetBtn = document.getElementById('josue-reset-btn');
        this.sendBtn = document.getElementById('josue-send-btn');
        this.chatInput = document.getElementById('josue-chat-input');
        this.chatMessages = document.getElementById('josue-chat-messages');
        this.typingIndicator = document.getElementById('josue-typing');
        this.quickActions = document.querySelectorAll('.quick-action-btn');
    },

    injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            #josue-widget-container {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 99999;
                font-family: 'Inter', sans-serif;
            }

            /* Floating Action Button */
            #josue-fab {
                background: none;
                border: none;
                cursor: pointer;
                position: absolute;
                bottom: 0;
                right: 0;
                transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            }
            #josue-fab:hover { transform: scale(1.1); }
            .fab-avatar {
                width: 60px;
                height: 60px;
                background: linear-gradient(135deg, #d6a32f 0%, #ffdf73 100%);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.5rem;
                font-weight: 800;
                color: #111;
                border: 2px solid #fff;
                box-shadow: 0 4px 20px rgba(214,163,47,0.4);
            }
            .fab-indicator {
                position: absolute;
                bottom: 2px;
                right: 2px;
                width: 14px;
                height: 14px;
                background: #22c55e;
                border: 2px solid #111;
                border-radius: 50%;
                animation: pulse 2s infinite;
            }

            /* Chat Window */
            #josue-chat-window {
                position: absolute;
                bottom: 80px;
                right: 0;
                width: 380px;
                height: 60vh;
                min-height: 400px;
                max-height: 600px;
                background: rgba(15, 15, 15, 0.85);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 16px;
                display: flex;
                flex-direction: column;
                box-shadow: 0 10px 40px rgba(0,0,0,0.5);
                transition: opacity 0.3s ease, transform 0.3s ease;
                transform-origin: bottom right;
                overflow: hidden;
            }
            #josue-chat-window.hidden {
                opacity: 0;
                transform: scale(0.8);
                pointer-events: none;
            }

            @media (max-width: 480px) {
                #josue-widget-container { bottom: 10px; right: 10px; }
                #josue-chat-window {
                    width: calc(100vw - 20px);
                    height: calc(100vh - 100px);
                    max-height: none;
                }
            }

            /* Header */
            .chat-header {
                padding: 1rem 1.5rem;
                background: rgba(0,0,0,0.4);
                border-bottom: 1px solid rgba(255,255,255,0.05);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .header-info { display: flex; align-items: center; gap: 0.8rem; }
            .header-avatar {
                width: 36px; height: 36px;
                background: linear-gradient(135deg, #d6a32f, #ffdf73);
                border-radius: 50%;
                display: flex; align-items: center; justify-content: center;
                font-size: 0.9rem; font-weight: bold; color: #111;
            }
            .header-info h4 { margin: 0; color: #fff; font-size: 1rem; }
            .header-info span { font-size: 0.75rem; color: #22c55e; }
            .header-actions button {
                background: none; border: none; color: #999;
                cursor: pointer; font-size: 1.2rem; padding: 0.2rem;
                transition: color 0.2s;
            }
            .header-actions button:hover { color: #fff; }

            /* Body */
            .chat-body {
                flex: 1;
                padding: 1.5rem;
                overflow-y: auto;
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }
            .chat-body::-webkit-scrollbar { width: 6px; }
            .chat-body::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }

            .msg-wrapper { max-width: 85%; }
            .msg-wrapper.user { margin-left: auto; }
            .msg-wrapper.josue { margin-right: auto; }
            
            .msg-bubble {
                padding: 0.8rem 1rem;
                border-radius: 12px;
                font-size: 0.9rem;
                line-height: 1.5;
            }
            .user .msg-bubble {
                background: #2a2a2a;
                color: #fff;
                border-bottom-right-radius: 4px;
            }
            .josue .msg-bubble {
                background: rgba(214,163,47,0.1);
                border: 1px solid rgba(214,163,47,0.2);
                color: #ddd;
                border-bottom-left-radius: 4px;
            }
            .josue .msg-bubble strong { color: #d6a32f; }

            /* Quick Actions */
            .quick-actions {
                padding: 0 1rem;
                display: flex;
                gap: 0.5rem;
                overflow-x: auto;
                white-space: nowrap;
            }
            .quick-actions::-webkit-scrollbar { display: none; }
            .quick-action-btn {
                background: rgba(255,255,255,0.05);
                border: 1px solid rgba(255,255,255,0.1);
                color: #aaa;
                border-radius: 20px;
                padding: 0.4rem 0.8rem;
                font-size: 0.8rem;
                cursor: pointer;
                transition: all 0.2s;
            }
            .quick-action-btn:hover {
                background: rgba(214,163,47,0.1);
                border-color: #d6a32f;
                color: #fff;
            }

            /* Footer */
            .chat-footer {
                padding: 1rem;
                background: rgba(0,0,0,0.4);
                border-top: 1px solid rgba(255,255,255,0.05);
                display: flex;
                align-items: flex-end;
                gap: 0.8rem;
            }
            #josue-chat-input {
                flex: 1;
                background: rgba(255,255,255,0.05);
                border: 1px solid rgba(255,255,255,0.1);
                border-radius: 20px;
                padding: 0.6rem 1rem;
                color: #fff;
                font-family: inherit;
                font-size: 0.9rem;
                resize: none;
                max-height: 100px;
            }
            #josue-chat-input:focus { outline: none; border-color: #d6a32f; }
            #josue-send-btn {
                background: linear-gradient(135deg, #d6a32f, #ffdf73);
                border: none;
                width: 36px; height: 36px;
                border-radius: 50%;
                color: #111;
                cursor: pointer;
                display: flex; align-items: center; justify-content: center;
                transition: transform 0.2s;
            }
            #josue-send-btn:hover:not(:disabled) { transform: scale(1.1); }
            #josue-send-btn:disabled { opacity: 0.5; cursor: not-allowed; }

            /* Typing Indicator */
            #josue-typing { padding: 0.5rem 1.5rem; }
            .typing-indicator span {
                display: inline-block; width: 6px; height: 6px;
                background: #d6a32f; border-radius: 50%;
                animation: bounce 1.4s infinite ease-in-out both; margin: 0 2px;
            }
            .typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
            .typing-indicator span:nth-child(2) { animation-delay: -0.16s; }
            @keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }
            @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); } 70% { box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); } 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); } }
        `;
        document.head.appendChild(style);
    },

    setupEventListeners() {
        this.fab.addEventListener('click', () => {
            this.chatWindow.classList.toggle('hidden');
            if (!this.chatWindow.classList.contains('hidden')) {
                this.chatInput.focus();
                this.scrollToBottom();
            }
        });

        this.closeBtn.addEventListener('click', () => {
            this.chatWindow.classList.add('hidden');
        });

        this.resetBtn.addEventListener('click', () => {
            if (confirm("Voulez-vous effacer la conversation ?")) {
                if (window.JosueCoach) JosueCoach.reset();
                this.chatMessages.innerHTML = '';
                this.appendJosueMessage("Conversation réinitialisée. Comment puis-je t'aider ? 🥁");
            }
        });

        this.sendBtn.addEventListener('click', () => this.sendMessage());

        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        this.chatInput.addEventListener('input', () => {
            this.chatInput.style.height = 'auto';
            this.chatInput.style.height = Math.min(this.chatInput.scrollHeight, 100) + 'px';
        });

        this.quickActions.forEach(btn => {
            btn.addEventListener('click', () => {
                const text = btn.getAttribute('data-msg');
                this.sendMessage(text);
            });
        });
    },

    appendJosueMessage(text) {
        const div = document.createElement('div');
        div.className = 'msg-wrapper josue';
        
        let formattedText = text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>');

        div.innerHTML = `<div class="msg-bubble">${formattedText}</div>`;
        this.chatMessages.appendChild(div);
        this.scrollToBottom();
    },

    appendUserMessage(text) {
        const div = document.createElement('div');
        div.className = 'msg-wrapper user';
        div.innerHTML = `<div class="msg-bubble">${text.replace(/\n/g, '<br>')}</div>`;
        this.chatMessages.appendChild(div);
        this.scrollToBottom();
    },

    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    },

    async sendMessage(textOverride = null) {
        const text = textOverride || this.chatInput.value.trim();
        if (!text) return;

        this.chatInput.value = '';
        this.chatInput.style.height = 'auto';
        this.appendUserMessage(text);
        
        this.typingIndicator.classList.remove('hidden');
        this.sendBtn.disabled = true;
        this.scrollToBottom();

        try {
            if (!window.JosueCoach) {
                throw new Error("Service JosueCoach non trouvé. Vérifiez l'inclusion de gemini-coach.js.");
            }

            // Récupérer le contexte utilisateur si connecté
            let userProfile = null;
            const session = localStorage.getItem('dma_current_session');
            if (session) {
                const u = JSON.parse(session);
                userProfile = { name: u.name, level: u.level, interests: u.interests };
            }

            const response = await JosueCoach.chat(text, userProfile);
            
            this.typingIndicator.classList.add('hidden');
            this.appendJosueMessage(response);
        } catch (error) {
            console.error(error);
            this.typingIndicator.classList.add('hidden');
            this.appendJosueMessage("Désolé, ma connexion a sauté ! Peux-tu répéter ? 🥁");
        } finally {
            this.sendBtn.disabled = false;
            this.chatInput.focus();
            this.scrollToBottom();
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    JosueWidget.init();
});
