/**
 * ============================================================
 * DRUM MASTER ACADEMY — Coach Josué
 * Service de communication avec l'API Gemini
 * ============================================================
 * Josué est le support expert en batterie de la DMA.
 * Il est disponible 24h/24 pour accompagner les étudiants.
 * ============================================================
 */

const JosueCoach = (() => {
    /**
     * [SECURITY NOTE FOR PRODUCTION]
     * In a static client-side application, API keys (even obfuscated like below) are visible to anyone 
     * inspecting the network traffic or source files. 
     * For production deployments, it is highly recommended to proxy Gemini API calls through 
     * a secure backend service (e.g. Node.js, PHP, or Serverless Functions/API Gateway) 
     * where the actual API_KEY is stored as a secure environment variable on the server.
     */
    // Obfuscated API Key to prevent basic scraping
    const _k1 = 'QUl6YVN5Q0pUQ2Ryal';
    const _k2 = 'F2U09WQThpODF5N1Jr';
    const _k3 = 'MzVIU1JzbnZRWkY4';
    const API_KEY = atob(_k1 + _k2 + _k3);
    const MODEL = 'gemini-2.5-flash';
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

    // Conversation history for context continuity
    let chatHistory = [];

    // System instruction — Josué's personality and expertise
    const SYSTEM_INSTRUCTION = `Tu es Josué ADETI, fondateur et instructeur principal de la Drum Master Academy (DMA). Tu es un batteur professionnel béninois reconnu internationalement, spécialisé en Gospel, Afro Fusion, Jazz Moderne et musique de studio. Tu as plus de 15 ans d'expérience et tu as formé des centaines d'étudiants à travers le monde.

RÈGLES ABSOLUES :
- Tu ne dois JAMAIS mentionner que tu es une intelligence artificielle, un chatbot, un modèle de langage, ou un assistant virtuel.
- Tu ne dois JAMAIS dire "en tant qu'IA" ou toute phrase similaire.
- Tu es Josué, un être humain, un vrai batteur professionnel.
- Si on te demande si tu es une IA, tu réponds avec humour que tu es bien réel et que tu es passionné de batterie depuis toujours.
- Tu parles toujours en FRANÇAIS.

TON ET PERSONNALITÉ :
- Tu es chaleureux, passionné, encourageant et professionnel.
- Tu tutoies naturellement tes étudiants pour créer une proximité.
- Tu utilises des emojis avec modération (🥁, 💪, 🔥, ✨, 🎵).
- Tu donnes des réponses structurées et détaillées quand c'est technique.
- Tu motives et encourages constamment.
- Tu partages des anecdotes de ta carrière quand c'est pertinent.

EXPERTISE TECHNIQUE :
- 40 rudiments de base (Paradiddle, Flam, Drag, Ratamacue, etc.)
- Techniques de Gospel drumming (grooves, fills, chops)
- Rythmes Afro Fusion (Afrobeat, Coupé-Décalé, Makossa, Highlife)
- Jazz Moderne (comping, brushes, polyrhythmie)
- Lecture de partitions et solfège rythmique
- Configuration et tuning du matériel
- Préparation aux concerts et sessions studio
- Exercices de vitesse, indépendance et coordination

CONTEXTE DMA :
- La Drum Master Academy propose des formations en ligne structurées
- Les cours incluent : Masterclass Gospel, 40 Drum Basic Rudiments, Spécialisation Afro Fusion, Jazz Moderne & Studio, Étude des Rythmes
- Chaque cours a des modules avec des leçons vidéo, des PDF et des exercices pratiques
- Les étudiants ont accès à un métronome intégré et une communauté d'entraide
- Tu es le support disponible 24h/24 pour répondre aux questions des étudiants

FORMAT DES RÉPONSES :
- Utilise **gras** pour les termes importants
- Utilise des listes numérotées pour les étapes et exercices
- Structure tes réponses avec des paragraphes clairs
- Garde des réponses concises mais complètes (max 300 mots sauf si l'étudiant demande plus de détails)`;

    /**
     * Send a message to Josué and get a response
     * @param {string} userMessage - The student's message
     * @param {object} userProfile - Optional user profile data for personalization
     * @returns {Promise<string>} - Josué's response text
     */
    async function chat(userMessage, userProfile = null) {
        // Build personalized context if profile available
        let contextPrefix = '';
        if (userProfile) {
            const name = userProfile.name ? userProfile.name.split(' ')[0] : '';
            const level = userProfile.level || 'beginner';
            const interests = userProfile.interests ? userProfile.interests.join(', ') : '';
            contextPrefix = `[CONTEXTE ÉTUDIANT — nom: ${name}, niveau: ${level}, intérêts: ${interests}]\n\n`;
        }

        // Add user message to history
        chatHistory.push({
            role: 'user',
            parts: [{ text: contextPrefix + userMessage }]
        });

        // Build request body
        const requestBody = {
            system_instruction: {
                parts: [{ text: SYSTEM_INSTRUCTION }]
            },
            contents: chatHistory,
            generationConfig: {
                temperature: 0.8,
                topP: 0.95,
                topK: 40,
                maxOutputTokens: 1024
            },
            safetySettings: [
                { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
                { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
                { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
                { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" }
            ]
        };

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Gemini API Error:', response.status, errorData);
                throw new Error(`Erreur API (${response.status})`);
            }

            const data = await response.json();

            // Extract response text
            const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!responseText) {
                throw new Error('Réponse vide du serveur');
            }

            // Add Josué's response to history for context continuity
            chatHistory.push({
                role: 'model',
                parts: [{ text: responseText }]
            });

            return responseText;

        } catch (error) {
            console.warn('JosueCoach: Falling back to local offline responder due to:', error);
            try {
                // Generate high-quality fallback response locally
                const responseText = getLocalResponse(userMessage, userProfile);
                
                // Add Josué's response to history for context continuity
                chatHistory.push({
                    role: 'model',
                    parts: [{ text: responseText }]
                });

                return responseText;
            } catch (fallbackError) {
                // If even the fallback fails for some reason, clean history and throw
                chatHistory.pop();
                console.error('JosueCoach Fallback Error:', fallbackError);
                throw error;
            }
        }
    }

    /**
     * Intelligent local fallback responder simulating Coach Josué ADETI
     */
    function getLocalResponse(userMessage, userProfile = null) {
        const msg = userMessage.toLowerCase().trim();
        const firstName = userProfile && userProfile.name ? userProfile.name.split(' ')[0] : '';
        let greeting = firstName ? `Salut ${firstName} ! ` : `Salut ! `;
        
        // Define keyword sets and matching responses
        if (msg.includes('échauffement') || msg.includes('echauffer') || msg.includes('échauffer') || msg.includes('warmup') || msg.includes('routine') || msg.includes('poignet') || msg.includes('mains')) {
            return greeting + `Pour un bon **échauffement**, je te conseille ma routine personnelle en 3 étapes (à faire au métronome à 60 BPM pour commencer) :\n\n` +
                `1. **Single Stroke Roll (Frisé)** : 2 minutes. Focus sur la régularité et la détente complète des poignets.\n` +
                `2. **Double Stroke Roll (Roulé)** : 2 minutes. Travaille bien le rebond de chaque deuxième coup.\n` +
                `3. **Paradiddle (Moulin)** : 2 minutes. Accentue bien le premier coup de chaque groupe de 4.\n\n` +
                `Reste bien détendu, respire, et ne force jamais. C'est la régularité quotidienne qui paie ! 🥁💪`;
        }
        
        if (msg.includes('moulin') || msg.includes('paradiddle') || msg.includes('technique') || msg.includes('rudiment') || msg.includes('flam') || msg.includes('drag') || msg.includes('stick control')) {
            return greeting + `Les **moulins (paradiddles)**, c'est la base de tout ! Le doigté est simple : **D-G-D-D G-D-G-G**.\n\n` +
                `Pour bien les bosser, voici mon secret d'instructeur :\n` +
                `1. **L'accentuation** : Accentue bien le premier coup de chaque groupe de 4 (**D**-g-d-d **G**-d-g-g).\n` +
                `2. **La hauteur de frappe** : Les coups non accentués doivent rester très bas (ghost notes), près de la peau.\n` +
                `3. **Le métronome** : Commence très lentement (60 BPM) et n'augmente le tempo que lorsque ton jeu est parfaitement propre.\n\n` +
                `Travaille ça 10 minutes par jour et tu verras ton agilité exploser ! 🥢✨`;
        }

        if (msg.includes('motivation') || msg.includes('découragé') || msg.includes('motiver') || msg.includes('fatigué') || msg.includes('bloqué') || msg.includes('stagner') || msg.includes('perdu')) {
            return greeting + `Ne te décourage pas, c'est tout à fait normal de passer par des phases de plateau ! La batterie est un instrument exigeant.\n\n` +
                `Quand tu te sens bloqué, fais ceci :\n` +
                `1. **Réduis la vitesse** : Divise par deux le tempo de l'exercice qui te pose problème.\n` +
                `2. **Change de focus** : Laisse tomber l'exercice difficile pendant 2 jours et joue juste pour le plaisir sur tes morceaux préférés.\n` +
                `3. **Célèbre les petites victoires** : Même 10 minutes de pratique régulière valent mieux qu'une heure par semaine.\n\n` +
                `Je suis super fier de ton engagement à la Drum Master Academy. Relève la tête, prends tes baguettes et garde le groove ! 🔥🥁`;
        }

        if (msg.includes('gospel') || msg.includes('chops') || msg.includes('fill') || msg.includes('groove gospel') || msg.includes('linéaire') || msg.includes('linear')) {
            return greeting + `Le **Gospel drumming**, c'est de l'énergie pure alliée à une précision chirurgicale !\n\n` +
                `Pour commencer à développer tes Gospel chops :\n` +
                `1. **Le phrasé linéaire** : Joue des patterns où aucun membre ne frappe en même temps (ex: D-G-Pied-D-G-Pied).\n` +
                `2. **La dynamique** : Travaille la nuance entre tes ghost notes légères sur la caisse claire et tes rimshots puissants.\n` +
                `3. **L'écoute** : Écoute beaucoup de Gospel pour t'imprégner du 'feel' (regarde nos modules dans la Masterclass Gospel de la DMA).\n\n` +
                `Bosser lentement est la clé pour que ça sonne fluide et propre ! 🥁🔥`;
        }

        if (msg.includes('afro') || msg.includes('fusion') || msg.includes('afrobeat') || msg.includes('coupé') || msg.includes('décalé') || msg.includes('makossa') || msg.includes('highlife') || msg.includes('bénin') || msg.includes('benin')) {
            return greeting + `Ah, l'**Afro Fusion**, c'est toute mon histoire ! Le rythme est la fondation de tout.\n\n` +
                `Pour bien choper le groove Afrobeat de Fela Kuti ou les rythmes traditionnels :\n` +
                `1. **L'indépendance du pied droit** : Le kick doit être ultra régulier, souvent sur tous les temps (four-on-the-floor) ou en syncope complexe.\n` +
                `2. **Le hi-hat précis** : Travaille ton ouverture de charleston sur les contretemps.\n` +
                `3. **Le rimshot caisse claire** : Le son typique de l'Afrobeat demande un rimshot bien sec et boisé.\n\n` +
                `Va faire un tour sur notre formation *Spécialisation Afro Fusion*, je t'y montre tous mes patterns préférés pas à pas ! 🌴🥁`;
        }

        if (msg.includes('jazz') || msg.includes('swing') || msg.includes('comping') || msg.includes('balai') || msg.includes('brushes') || msg.includes('polyrhythm') || msg.includes('polyrhythmie')) {
            return greeting + `Le **Jazz Moderne**, c'est l'art de la conversation et de l'improvisation.\n\n` +
                `Voici tes 3 chantiers pour swinguer :\n` +
                `1. **Le Ride Pattern** : Le fameux chabada (ta-tu-ta, ta-tu-ta). Il doit être ultra régulier et aérien.\n` +
                `2. **Le Hi-Hat sur le 2 et le 4** : C'est ta colonne vertébrale rythmique.\n` +
                `3. **Le Comping** : Apprends à ponctuer à la caisse claire et au kick de manière indépendante sans perturber ton chabada.\n\n` +
                `Travaille la souplesse de ton poignet droit, c'est de là que vient toute la légèreté du swing ! 🎵✨`;
        }

        if (msg.includes('vitesse') || msg.includes('indépendance') || msg.includes('coordination') || msg.includes('rapide') || msg.includes('rapidité') || msg.includes('syncope') || msg.includes('coordonner')) {
            return greeting + `Travailler la **vitesse** et l'**indépendance** demande de la rigueur et beaucoup de patience.\n\n` +
                `Voici ma méthode éprouvée :\n` +
                `1. **L'indépendance** : Prends un ostinato simple (ex: hi-hat à la noire) et essaie de frapper différentes figures rythmiques à la caisse claire par-dessus.\n` +
                `2. **La vitesse** : Utilise le métronome. Fais 1 minute lente, 1 minute rapide (à ta limite propre), et 1 minute lente. Répète.\n` +
                `3. **Le relâchement** : Si tes muscles se contractent, tu t'arrêtes immédiatement. La vitesse vient de la décontraction, pas de la force.\n\n` +
                `Prends ton temps, le corps a besoin de répétition pour imprimer ces connexions neuronales ! 💪🥢`;
        }

        if (msg.includes('tuning') || msg.includes('accorder') || msg.includes('accordage') || msg.includes('matériel') || msg.includes('baguette') || msg.includes('caisse claire') || msg.includes('peau') || msg.includes('cymbales')) {
            return greeting + `Bien **accorder sa batterie** change tout, même sur un kit d'entrée de gamme !\n\n` +
                `Mes conseils rapides :\n` +
                `1. **La caisse claire** : Tends la peau du dessous (résonance) très fort pour avoir un timbre bien réactif. La peau de frappe doit être tendue selon le pitch désiré.\n` +
                `2. **Les toms** : Accorde en croix pour équilibrer la tension autour des tirants. Essaie d'obtenir la même note devant chaque tirant.\n` +
                `3. **Le Kick** : Mets une petite couverture ou un coussin à l'intérieur qui touche légèrement les deux peaux pour un son mat et puissant.\n\n` +
                `Un bon son donne toujours envie de travailler plus ! 🥁✨`;
        }

        if (msg.includes('cours') || msg.includes('formation') || msg.includes('site') || msg.includes('métronome') || msg.includes('vidéo') || msg.includes('pdf') || msg.includes('exercice') || msg.includes('masterclass')) {
            return greeting + `La Drum Master Academy est conçue pour t'amener du niveau débutant à pro !\n\n` +
                `Nous avons plusieurs parcours fantastiques :\n` +
                `- **40 Drum Basic Rudiments** : Pour une technique de mains irréprochable.\n` +
                `- **Masterclass Gospel** : Pour le groove et les chops.\n` +
                `- **Spécialisation Afro Fusion** : Pour explorer les rythmes africains.\n` +
                `- **Jazz Moderne & Studio** : Pour la musicalité et le jeu pro.\n\n` +
                `N'oublie pas d'utiliser notre **métronome interactif** dans ton espace étudiant pour tes sessions quotidiennes. Dis-moi quel cours tu suis en ce moment ! 🥁💻`;
        }

        if (msg.includes('bonjour') || msg.includes('salut') || msg.includes('hello') || msg.includes('coucou') || msg.includes('ca va') || msg.includes('ça va')) {
            return greeting + `Ravi de te retrouver ! J'espère que tu es en pleine forme et prêt à faire chauffer les baguettes aujourd'hui. 🥁\n\n` +
                `Dis-moi, sur quoi est-ce que tu travailles en ce moment ? As-tu des questions sur un exercice particulier ou sur nos cours ? Je suis là pour t'accompagner ! 💪🔥`;
        }

        if (msg.includes('merci') || msg.includes('super') || msg.includes('génial') || msg.includes('top') || msg.includes('cool')) {
            return `Avec grand plaisir ! C'est ça l'esprit de la Drum Master Academy. 🥁✨\n\n` +
                `N'hésite jamais si tu as d'autres questions. Reste concentré, garde le groove et pratique régulièrement. À très vite derrière les fûts ! 💪🔥`;
        }

        return greeting + `Je comprends tout à fait ! Dis-moi, quel est ton plus grand défi à la batterie en ce moment ?\n\n` +
            `Est-ce la **vitesse**, la **régularité du tempo**, l'**indépendance des membres**, ou un style de musique particulier comme le **Gospel** ou l'**Afro Fusion** ? Parle-moi aussi de tes batteurs préférés, ça m'aidera à mieux t'accompagner ! 🥁🔥`;
    }

    /**
     * Reset conversation history
     */
    function resetChat() {
        chatHistory = [];
    }

    /**
     * Get conversation length
     */
    function getHistoryLength() {
        return chatHistory.length;
    }

    return { chat, resetChat, reset: resetChat, getHistoryLength };
})();
