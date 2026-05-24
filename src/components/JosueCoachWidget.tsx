import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { X, RefreshCw, Send } from 'lucide-react';
import { snappySpring, springTransition } from '../lib/motion';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
}

const MODEL = 'gemini-2.5-flash';
// API key loaded from environment variable — never hardcode secrets client-side
const getApiKey = (): string => {
  const envKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
  const storedKey = typeof window !== 'undefined' ? localStorage.getItem('dma_gemini_api_key') : null;
  return storedKey || envKey || '';
};

export const JosueCoachWidget: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [chatHistory, setChatHistory] = useState<{ role: string; parts: { text: string }[] }[]>([]);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Hide widget on auth screens
  const isAuthPage = ['/login', '/register', '/setup-profile', '/forgot-password', '/reset-password'].includes(location.pathname);

  useEffect(() => {
    // Initial welcome message
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          role: 'model',
          text: `Salut ${user ? user.name.split(' ')[0] : ''} ! Je suis Josué, ton coach virtuel 24/7. Comment puis-je t'aider aujourd'hui avec ta batterie ? 🥁`
        }
      ]);
    }
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleReset = () => {
    if (showResetConfirm) {
      setMessages([
        {
          id: 'welcome-reset',
          role: 'model',
          text: "Conversation réinitialisée. Comment puis-je t'aider ? 🥁"
        }
      ]);
      setChatHistory([]);
      setShowResetConfirm(false);
    } else {
      setShowResetConfirm(true);
      // Auto-cancel after 3 seconds
      setTimeout(() => setShowResetConfirm(false), 3000);
    }
  };

  const getActiveKey = () => {
    return getApiKey();
  };

  const getApiUrl = () => {
    const key = getActiveKey();
    if (!key) {
      console.warn('[DMA Coach] No Gemini API key configured. Set VITE_GEMINI_API_KEY in .env');
    }
    return `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`;
  };

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
- Tu motives et encourage constamment.
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
- Garde des réponses concises mais complètes (max 300 mots sauf si l'étudiant demande plus de détails)

RECOMMANDATION D'EXERCICES (TRÈS IMPORTANT) :
Quand tu suggères un exercice ou un rythme spécifique à pratiquer, tu dois ABSOLUMENT inclure à la fin de ton explication le format de commande suivant sur une ligne seule :
[EXERCISE: Nom de l'exercice | BPM: ValeurBPM | Sub: Subdivision]

Subdivision possible :
- 1 pour Noires
- 2 pour Croches
- 3 pour Triolets
- 4 pour Double croches

Exemple d'intégration :
"Je te conseille de travailler ton paradiddle pour délier les doigts :
[EXERCISE: Paradiddle Délié | BPM: 100 | Sub: 4]"

Ce format sera intercepté par le système pour créer une carte d'action interactive magique permettant à l'élève de configurer son métronome ou de logguer sa session en 1 clic !`;

  const getLocalResponse = (msg: string): string => {
    const query = msg.toLowerCase().trim();
    const firstName = user ? user.name.split(' ')[0] : '';
    const greeting = firstName ? `Salut ${firstName} ! ` : `Salut ! `;

    if (query.includes('échauffement') || query.includes('echauffer') || query.includes('warmup') || query.includes('routine') || query.includes('poignet') || query.includes('mains')) {
      return greeting + `Pour un bon **échauffement**, je te conseille ma routine personnelle en 3 étapes (à faire au métronome à 60 BPM pour commencer) :\n\n` +
        `1. **Single Stroke Roll (Frisé)** : 2 minutes. Focus sur la régularité et la détente complète des poignets.\n` +
        `2. **Double Stroke Roll (Roulé)** : 2 minutes. Travaille bien le rebond de chaque deuxième coup.\n` +
        `3. **Paradiddle (Moulin)** : 2 minutes. Accentue bien le premier coup de chaque groupe de 4.\n\n` +
        `Reste bien détendu, respire, et ne force jamais. C'est la régularité quotidienne qui paie ! 🥁💪\n\n[EXERCISE: Routine Échauffement | BPM: 60 | Sub: 1]`;
    }

    if (query.includes('moulin') || query.includes('paradiddle') || query.includes('technique') || query.includes('rudiment') || query.includes('flam') || query.includes('drag') || query.includes('stick control')) {
      return greeting + `Les **moulins (paradiddles)**, c'est la base de tout ! Le doigté est simple : **D-G-D-D G-D-G-G**.\n\n` +
        `Pour bien les bosser, voici mon secret d'instructeur :\n` +
        `1. **L'accentuation** : Accentue bien le premier coup de chaque groupe de 4 (**D**-g-d-d **G**-d-g-g).\n` +
        `2. **La hauteur de frappe** : Les coups non accentués doivent rester très bas (ghost notes), près de la peau.\n` +
        `3. **Le métronome** : Commence très lentement (60 BPM) et n'augmente le tempo que lorsque ton jeu est parfaitement propre.\n\n` +
        `Travaille ça 10 minutes par jour et tu verras ton agilité exploser ! 🥢✨\n\n[EXERCISE: Moulin Technique | BPM: 80 | Sub: 4]`;
    }

    if (query.includes('motivation') || query.includes('découragé') || query.includes('motiver') || query.includes('fatigué') || query.includes('bloqué') || query.includes('stagner') || query.includes('perdu')) {
      return greeting + `Ne te décourage pas, c'est tout à fait normal de passer par des phases de plateau ! La batterie est un instrument exigeant.\n\n` +
        `Quand tu te sens bloqué, fais ceci :\n` +
        `1. **Réduis la vitesse** : Divise par deux le tempo de l'exercice qui te pose problème.\n` +
        `2. **Change de focus** : Laisse tomber l'exercice difficile pendant 2 jours et joue juste pour le plaisir sur tes morceaux préférés.\n` +
        `3. **Célèbre les petites victoires** : Même 10 minutes de pratique régulière valent mieux qu'une heure par semaine.\n\n` +
        `Je suis super fier de ton engagement à la Drum Master Academy. Relève la tête, prends tes baguettes et garde le groove ! 🔥🥁\n\n[EXERCISE: Practice Flow Zen | BPM: 70 | Sub: 1]`;
    }

    if (query.includes('gospel') || query.includes('chops') || query.includes('fill') || query.includes('groove gospel') || query.includes('linéaire') || query.includes('linear')) {
      return greeting + `Le **Gospel drumming**, c'est de l'énergie pure alliée à une précision chirurgicale !\n\n` +
        `Pour commencer à développer tes Gospel chops :\n` +
        `1. **Le phrasé linéaire** : Joue des patterns où aucun membre ne frappe en même temps (ex: D-G-Pied-D-G-Pied).\n` +
        `2. **La dynamique** : Travaille la nuance entre tes ghost notes légères sur la caisse claire et tes rimshots puissants.\n` +
        `3. **L'écoute** : Écoute beaucoup de Gospel pour t'imprégner du 'feel' (regarde nos modules dans la Masterclass Gospel de la DMA).\n\n` +
        `Bosser lentement est la clé pour que ça sonne fluide et propre ! 🥁🔥\n\n[EXERCISE: Gospel Linear Chop | BPM: 90 | Sub: 4]`;
    }

    if (query.includes('afro') || query.includes('fusion') || query.includes('afrobeat') || query.includes('coupé') || query.includes('décalé') || query.includes('makossa') || query.includes('highlife') || query.includes('bénin') || query.includes('benin')) {
      return greeting + `Ah, l'**Afro Fusion**, c'est toute mon histoire ! Le rythme est la fondation de tout.\n\n` +
        `Pour bien choper le groove Afrobeat de Fela Kuti ou les rythmes traditionnels :\n` +
        `1. **L'indépendance du pied droit** : Le kick doit être ultra régulier, souvent sur tous les temps (four-on-the-floor) ou en syncope complexe.\n` +
        `2. **Le hi-hat précis** : Travaille ton ouverture de charleston sur les contretemps.\n` +
        `3. **Le rimshot caisse claire** : Le son typique de l'Afrobeat demande un rimshot bien sec et boisé.\n\n` +
        `Va faire un tour sur notre formation *Spécialisation Afro Fusion*, je t'y montre tous mes patterns préférés pas à pas ! 🌴🥁\n\n[EXERCISE: Afrobeat Groove | BPM: 95 | Sub: 4]`;
    }

    if (query.includes('jazz') || query.includes('swing') || query.includes('comping') || query.includes('balai') || query.includes('brushes') || query.includes('polyrhythm') || query.includes('polyrhythmie')) {
      return greeting + `Le **Jazz Moderne**, c'est l'art de la conversation et de l'improvisation.\n\n` +
        `Voici tes 3 chantiers pour swinguer :\n` +
        `1. **Le Ride Pattern** : Le fameux chabada (ta-tu-ta, ta-tu-ta). Il doit être ultra régulier et aérien.\n` +
        `2. **Le Hi-Hat sur le 2 et le 4** : C'est ta colonne vertébrale rythmique.\n` +
        `3. **Le Comping** : Apprends à ponctuer à la caisse claire et au kick de manière indépendante sans perturber ton chabada.\n\n` +
        `Travaille la souplesse de ton poignet droit, c'est de là que vient toute la légèreté du swing ! 🎵✨\n\n[EXERCISE: Chabada Swing | BPM: 110 | Sub: 3]`;
    }

    if (query.includes('vitesse') || query.includes('indépendance') || query.includes('coordination') || query.includes('rapide') || query.includes('rapidité') || query.includes('syncope') || query.includes('coordonner')) {
      return greeting + `Travailler la **vitesse** et l'**indépendance** demande de la rigueur et beaucoup de patience.\n\n` +
        `Voici ma méthode éprouvée :\n` +
        `1. **L'indépendance** : Prends un ostinato simple (ex: hi-hat à la noire) et essaie de frapper différentes figures rythmiques à la caisse claire par-dessus.\n` +
        `2. **La vitesse** : Utilise le métronome. Fais 1 minute lente, 1 minute rapide (à ta limite propre), et 1 minute lente. Répète.\n` +
        `3. **Le relâchement** : Si tes muscles se contractent, tu t'arrêtes immédiatement. La vitesse vient de la décontraction, pas de la force.\n\n` +
        `Prends ton temps, le corps a besoin de répétition pour imprimer ces connexions neuronales ! 💪🥢\n\n[EXERCISE: Pyramide de Vitesse | BPM: 120 | Sub: 4]`;
    }

    if (query.includes('tuning') || query.includes('accorder') || query.includes('accordage') || query.includes('matériel') || query.includes('baguette') || query.includes('caisse claire') || query.includes('peau') || query.includes('cymbales')) {
      return greeting + `Bien **accorder sa batterie** change tout, même sur un kit d'entrée de gamme !\n\n` +
        `Mes conseils rapides :\n` +
        `1. **La caisse claire** : Tends la peau du dessous (résonance) très fort pour avoir un timbre bien réactif. La peau de frappe doit être tendue selon le pitch désiré.\n` +
        `2. **Les toms** : Accorde en croix pour équilibrer la tension autour des tirants. Essaie d'obtenir la même note devant chaque tirant.\n` +
        `3. **Le Kick** : Mets une petite couverture ou un coussin à l'intérieur qui touche légèrement les deux peaux pour un son mat et puissant.\n\n` +
        `Un bon son donne toujours envie de travailler plus ! 🥁✨\n\n[EXERCISE: Test Accordage Groove | BPM: 80 | Sub: 2]`;
    }

    if (query.includes('cours') || query.includes('formation') || query.includes('site') || query.includes('métronome') || query.includes('vidéo') || query.includes('pdf') || query.includes('exercice') || query.includes('masterclass')) {
      return greeting + `La Drum Master Academy est conçue pour t'amener du niveau débutant à pro !\n\n` +
        `Nous avons plusieurs parcours fantastiques :\n` +
        `- **40 Drum Basic Rudiments** : Pour une technique de mains irréprochable.\n` +
        `- **Masterclass Gospel** : Pour le groove et les chops.\n` +
        `- **Spécialisation Afro Fusion** : Pour explorer les rythmes africains.\n` +
        `- **Jazz Moderne & Studio** : Pour la musicalité et le jeu pro.\n\n` +
        `N'oublie pas d'utiliser notre **métronome interactif** dans ton espace étudiant pour tes sessions quotidiennes. Dis-moi quel cours tu suis en ce moment ! 🥁💻`;
    }

    if (query.includes('bonjour') || query.includes('salut') || query.includes('hello') || query.includes('coucou') || query.includes('ca va') || query.includes('ça va')) {
      return greeting + `Ravi de te retrouver ! J'espère que tu es en pleine forme et prêt à faire chauffer les baguettes aujourd'hui. 🥁\n\n` +
        `Dis-moi, sur quoi est-ce que tu travailles en ce moment ? As-tu des questions sur un exercice particulier ou sur nos cours ? Je suis là pour t'accompagner ! 💪🔥`;
    }

    if (query.includes('merci') || query.includes('super') || query.includes('génial') || query.includes('top') || query.includes('cool')) {
      return `Avec grand plaisir ! C'est ça l'esprit de la Drum Master Academy. 🥁✨\n\n` +
        `N'hésite jamais si tu as d'autres questions. Reste concentré, garde le groove et pratique régulièrement. À très vite derrière les fûts ! 💪🔥`;
    }

    return greeting + `Je comprends tout à fait ! Dis-moi, quel est ton plus grand défi à la batterie en ce moment ?\n\n` +
      `Est-ce la **vitesse**, la **régularité du tempo**, l'**indépendance des membres**, ou un style de musique particulier comme le **Gospel** ou l'**Afro Fusion** ? Parle-moi aussi de tes batteurs préférés, ça m'aidera à mieux t'accompagner ! 🥁🔥`;
  };

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input.trim();
    if (!textToSend) return;

    setInput('');
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }

    // Add user message
    const userMsgId = crypto.randomUUID();
    const userMsg: ChatMessage = { id: userMsgId, role: 'user', text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    // Build context prefix
    let contextPrefix = '';
    if (user) {
      const name = user.name ? user.name.split(' ')[0] : '';
      const level = user.level || 'beginner';
      const interests = user.interests ? user.interests.join(', ') : '';
      contextPrefix = `[CONTEXTE ÉTUDIANT — nom: ${name}, niveau: ${level}, intérêts: ${interests}]\n\n`;
    }

    const newHistory = [...chatHistory, { role: 'user', parts: [{ text: contextPrefix + textToSend }] }];
    setChatHistory(newHistory);

    try {
      const requestBody = {
        system_instruction: {
          parts: [{ text: SYSTEM_INSTRUCTION }]
        },
        contents: newHistory,
        generationConfig: {
          temperature: 0.8,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 1024
        }
      };

      const response = await fetch(getApiUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error("HTTP error on Gemini API call");
      }

      const data = await response.json();
      const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!responseText) {
        throw new Error("Empty response from Gemini server");
      }

      // Add response
      const replyId = crypto.randomUUID();
      setMessages(prev => [...prev, {
        id: replyId,
        role: 'model',
        text: responseText
      }]);
      setChatHistory(prev => [...prev, { role: 'model', parts: [{ text: responseText }] }]);
    } catch (e) {
      console.warn("JosueCoach API failed, using intelligent offline fallback.", e);
      // Fallback
      setTimeout(() => {
        const responseText = getLocalResponse(textToSend);
        const fallbackId = crypto.randomUUID();
        setMessages(prev => [...prev, {
          id: fallbackId,
          role: 'model',
          text: responseText
        }]);
        setChatHistory(prev => [...prev, { role: 'model', parts: [{ text: responseText }] }]);
      }, 700);
    } finally {
      setIsTyping(false);
    }
  };

  const renderFormattedText = (text: string) => {
    return text.split('\n').map((line, lineIdx) => {
      // Bold rendering
      let parts: React.ReactNode[] = [line];
      const boldRegex = /\*\*(.*?)\*\*/g;
      let match;
      
      if (line.includes('**')) {
        const lineParts: React.ReactNode[] = [];
        let lastIndex = 0;
        let matchCount = 0;
        
        while ((match = boldRegex.exec(line)) !== null) {
          if (match.index > lastIndex) {
            lineParts.push(line.substring(lastIndex, match.index));
          }
          lineParts.push(<strong key={`bold-${lineIdx}-${matchCount}`} className="text-gold-400 font-bold">{match[1]}</strong>);
          lastIndex = boldRegex.lastIndex;
          matchCount++;
        }
        
        if (lastIndex < line.length) {
          lineParts.push(line.substring(lastIndex));
        }
        parts = lineParts;
      }

      return (
        <span key={`line-${lineIdx}`} className="block min-h-[0.5rem]">
          {parts}
        </span>
      );
    });
  };

  const renderMessageContent = (msg: ChatMessage) => {
    if (msg.role === 'user') {
      return renderFormattedText(msg.text);
    }

    // Check for [EXERCISE: Name | BPM: X | Sub: Y]
    const exerciseRegex = /\[EXERCISE:\s*([^|\]]+)\|\s*BPM:\s*(\d+)\s*\|\s*Sub:\s*(\d+)\]/gi;
    
    const exercises: { name: string; bpm: number; sub: number }[] = [];
    let match;
    exerciseRegex.lastIndex = 0;
    while ((match = exerciseRegex.exec(msg.text)) !== null) {
      exercises.push({
        name: match[1].trim(),
        bpm: parseInt(match[2]),
        sub: parseInt(match[3])
      });
    }

    // Clean text by removing the exercise tags
    const cleanText = msg.text.replace(exerciseRegex, '').trim();

    return (
      <div className="space-y-3">
        {cleanText && <div>{renderFormattedText(cleanText)}</div>}
        {exercises.map((ex, exIdx) => (
          <motion.div
            key={exIdx}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={springTransition}
            className="mt-2 p-3 bg-zinc-950/80 rounded-xl border border-gold-500/30 shadow-lg relative overflow-hidden flex flex-col gap-2.5"
          >
            {/* Ambient gold glow on card */}
            <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-gold-500/10 blur-xl pointer-events-none" />
            
            <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
              <span className="text-[10px] text-gold-400 font-extrabold uppercase tracking-widest flex items-center gap-1">
                ⚡ Exercice Recommandé
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">
                Sub: {ex.sub === 1 ? 'Noires' : ex.sub === 2 ? 'Croches' : ex.sub === 3 ? 'Triolets' : 'Dbl croches'}
              </span>
            </div>

            <div className="space-y-1">
              <h5 className="font-extrabold text-white text-xs tracking-wide">{ex.name}</h5>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-zinc-900 border border-white/5 text-[10px] text-gold-400 font-black font-mono">
                  {ex.bpm} BPM
                </span>
                <span className="text-[9px] text-zinc-500 font-medium">
                  Cible quotidienne
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-1">
              <button
                onClick={() => {
                  const event = new CustomEvent('dma-set-metronome', {
                    detail: {
                      bpm: ex.bpm,
                      subdivision: ex.sub,
                      title: ex.name
                    }
                  });
                  window.dispatchEvent(event);
                }}
                className="py-1.5 px-2 rounded-lg bg-gold-600 hover:bg-gold-500 text-obsidian font-extrabold text-[9px] tracking-wider uppercase text-center transition-all active:scale-95 shadow-md"
              >
                🥁 Lancer Clic
              </button>
              <button
                onClick={() => {
                  const event = new CustomEvent('dma-log-practice', {
                    detail: {
                      title: ex.name,
                      bpm: ex.bpm
                    }
                  });
                  window.dispatchEvent(event);
                }}
                className="py-1.5 px-2 rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-white/10 text-zinc-300 hover:text-white font-bold text-[9px] tracking-wider uppercase text-center transition-all active:scale-95"
              >
                📝 Log Journal
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  if (isAuthPage) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[99999] font-sans">
      {/* Floating Action Button (FAB) */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Discuter avec Josué"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        transition={snappySpring}
        className="relative group"
      >
        {/* Hover Speech Bubble */}
        <div className="absolute right-16 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-zinc-900/90 backdrop-blur-md border border-gold-500/30 text-gold-400 text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0 shadow-lg pointer-events-none">
          Besoin d'aide ? 🥁
        </div>

        <div className="w-14 h-14 rounded-full p-0.5 bg-gradient-to-r from-gold-600 via-gold-400 to-gold-600 border border-white/10 shadow-gold-glow animate-pulse-gold overflow-hidden relative">
          <img 
            src="/assets/images/josue_avatar.jpg" 
            alt="Coach Josué ADETI" 
            className="w-full h-full rounded-full object-cover object-top scale-110"
          />
          {/* Subtle overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent rounded-full" />
        </div>
        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-zinc-950 rounded-full animate-pulse" />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 50 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="absolute bottom-20 right-0 w-[calc(100vw-2.5rem)] xs:w-[380px] h-[550px] max-h-[75vh] flex flex-col bg-zinc-950/85 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full p-0.5 bg-gradient-to-r from-gold-600 to-gold-400 border border-white/10 overflow-hidden relative shrink-0 shadow-md">
                  <img 
                    src="/assets/images/josue_avatar.jpg" 
                    alt="Coach Josué" 
                    className="w-full h-full rounded-full object-cover object-top scale-110"
                  />
                </div>
                <div>
                  <h4 className="text-white font-medium text-sm leading-tight">Josué ADETI</h4>
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block animate-pulse" />
                    En ligne 24/7
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  transition={snappySpring}
                  onClick={handleReset}
                  title={showResetConfirm ? "Confirmer la réinitialisation" : "Recommencer"}
                  className={`p-1.5 rounded-md transition-colors ${showResetConfirm ? 'bg-rose-500/10 text-rose-400' : 'hover:bg-white/5 text-zinc-400 hover:text-white'}`}
                >
                  <RefreshCw className="w-4 h-4" />
                </motion.button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-md hover:bg-white/5 text-zinc-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Message Body */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 scrollbar-thin" role="log" aria-live="polite" aria-label="Messages du chat">
              {messages.map((msg, idx) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ ...springTransition, delay: idx === messages.length - 1 ? 0.05 : 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-2.5 items-end`}
                >
                  {msg.role === 'model' && (
                    <div className="w-6 h-6 rounded-full border border-gold-500/30 overflow-hidden shrink-0 shadow-inner">
                      <img 
                        src="/assets/images/josue_avatar.jpg" 
                        alt="Josué" 
                        className="w-full h-full object-cover object-top scale-110"
                      />
                    </div>
                  )}
                  <div
                    className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-zinc-800 text-white rounded-tr-none border border-white/5'
                        : 'bg-gold-500/5 border border-gold-500/15 text-zinc-200 rounded-tl-none'
                    }`}
                  >
                    {renderMessageContent(msg)}
                  </div>
                </motion.div>
              ))}
              
              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gold-500/5 border border-gold-500/10 rounded-xl rounded-tl-none px-4 py-3">
                    <div className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 bg-gold-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-2.5 h-2.5 bg-gold-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-2.5 h-2.5 bg-gold-400 rounded-full animate-bounce" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2 overflow-x-auto px-4 py-2 bg-black/20 no-scrollbar select-none border-t border-white/5">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={snappySpring}
                onClick={() => handleSend("Quels exercices me conseilles-tu pour m'échauffer aujourd'hui ?")}
                className="shrink-0 px-3 py-1.5 rounded-full text-xs bg-white/5 hover:bg-gold-500/10 border border-white/10 hover:border-gold-500/30 text-zinc-400 hover:text-gold-400 transition-colors"
              >
                🥁 Échauffement
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={snappySpring}
                onClick={() => handleSend("Peux-tu m'expliquer comment bien travailler mes moulins ?")}
                className="shrink-0 px-3 py-1.5 rounded-full text-xs bg-white/5 hover:bg-gold-500/10 border border-white/10 hover:border-gold-500/30 text-zinc-400 hover:text-gold-400 transition-colors"
              >
                🥢 Technique
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={snappySpring}
                onClick={() => handleSend("J'ai du mal à rester motivé. Des conseils ?")}
                className="shrink-0 px-3 py-1.5 rounded-full text-xs bg-white/5 hover:bg-gold-500/10 border border-white/10 hover:border-gold-500/30 text-zinc-400 hover:text-gold-400 transition-colors"
              >
                🔥 Motivation
              </motion.button>
            </div>

            {/* Footer Form */}
            <div className="p-3 bg-zinc-950 border-t border-white/5 flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                rows={1}
                placeholder="Pose ta question à Josué..."
                className="flex-1 bg-white/5 border border-white/10 hover:border-white/20 focus:border-gold-500/50 rounded-xl px-4 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none resize-none max-h-20"
                style={{ height: 'auto' }}
              />
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                transition={snappySpring}
                onClick={() => handleSend()}
                disabled={!input.trim() || isTyping}
                className="w-9 h-9 shrink-0 flex items-center justify-center rounded-xl bg-gradient-to-r from-gold-600 to-gold-400 hover:from-gold-500 hover:to-gold-300 disabled:opacity-50 text-obsidian font-bold transition-colors shadow-gold-glow"
              >
                <Send className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
