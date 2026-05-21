/**
 * METRONOME & TOOLS ENGINE
 * Basic implementation for the Drum Master Academy student dashboard.
 */

const ToolsEngine = {
    audioContext: null,
    isPlaying: false,
    bpm: 120,
    timerID: null,
    nextNoteTime: 0.0,
    currentBeat: 0,
    lookahead: 25.0, // ms
    scheduleAheadTime: 0.1, // s

    // Elements
    bpmDisplay: null,
    bpmSlider: null,
    btnPlay: null,
    btnMinus: null,
    btnPlus: null,
    btnTapTempo: null,

    // Tap Tempo variables
    tapTimes: [],

    init() {
        this.bpmDisplay = document.getElementById('bpm-display');
        this.bpmSlider = document.getElementById('bpm-slider');
        this.btnPlay = document.getElementById('btn-play-metronome');
        this.btnMinus = document.getElementById('btn-minus-bpm');
        this.btnPlus = document.getElementById('btn-plus-bpm');
        this.btnTapTempo = document.getElementById('btn-tap-tempo');

        if (!this.btnPlay) return;

        this.setupEventListeners();
    },

    setupEventListeners() {
        this.btnPlay.addEventListener('click', () => this.togglePlay());
        
        this.bpmSlider.addEventListener('input', (e) => {
            this.setBPM(parseInt(e.target.value));
        });

        this.btnMinus.addEventListener('click', () => {
            this.setBPM(this.bpm - 1);
        });

        this.btnPlus.addEventListener('click', () => {
            this.setBPM(this.bpm + 1);
        });

        this.btnTapTempo.addEventListener('click', () => this.tapTempo());
    },

    setBPM(newBPM) {
        if (newBPM < 40) newBPM = 40;
        if (newBPM > 240) newBPM = 240;
        this.bpm = newBPM;
        this.bpmDisplay.textContent = this.bpm;
        this.bpmSlider.value = this.bpm;
    },

    nextNote() {
        const secondsPerBeat = 60.0 / this.bpm;
        this.nextNoteTime += secondsPerBeat;
        this.currentBeat++;
        if (this.currentBeat === 4) {
            this.currentBeat = 0;
        }
    },

    playClick(time, isAccent) {
        if (!this.audioContext) return;
        
        const osc = this.audioContext.createOscillator();
        const envelope = this.audioContext.createGain();

        osc.connect(envelope);
        envelope.connect(this.audioContext.destination);

        if (isAccent) {
            osc.frequency.value = 1200.0;
        } else {
            osc.frequency.value = 800.0;
        }

        envelope.gain.value = 1;
        envelope.gain.exponentialRampToValueAtTime(1, time + 0.001);
        envelope.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

        osc.start(time);
        osc.stop(time + 0.05);
    },

    scheduler() {
        while (this.nextNoteTime < this.audioContext.currentTime + this.scheduleAheadTime) {
            this.playClick(this.nextNoteTime, this.currentBeat === 0);
            this.nextNote();
        }
        this.timerID = setTimeout(() => this.scheduler(), this.lookahead);
    },

    togglePlay() {
        if (this.isPlaying) {
            clearTimeout(this.timerID);
            this.isPlaying = false;
            this.btnPlay.textContent = 'PLAY';
            this.btnPlay.classList.remove('btn-outline');
            this.btnPlay.classList.add('btn-primary');
            this.btnPlay.style.borderColor = '';
            this.btnPlay.style.color = '';
        } else {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            this.isPlaying = true;
            this.btnPlay.textContent = 'STOP';
            this.btnPlay.classList.remove('btn-primary');
            this.btnPlay.classList.add('btn-outline');
            this.btnPlay.style.borderColor = '#ff4444';
            this.btnPlay.style.color = '#ff4444';
            
            this.currentBeat = 0;
            this.nextNoteTime = this.audioContext.currentTime + 0.05;
            this.scheduler();
        }
    },

    tapTempo() {
        const now = Date.now();
        this.tapTimes.push(now);

        // Keep only last 4 taps
        if (this.tapTimes.length > 4) {
            this.tapTimes.shift();
        }

        if (this.tapTimes.length >= 2) {
            // Calculate differences
            let sum = 0;
            for (let i = 1; i < this.tapTimes.length; i++) {
                sum += this.tapTimes[i] - this.tapTimes[i-1];
            }
            const avgDiff = sum / (this.tapTimes.length - 1);
            
            // Convert to BPM
            let newBPM = Math.round(60000 / avgDiff);
            this.setBPM(newBPM);
        }

        // Add visual feedback
        this.btnTapTempo.style.background = 'var(--social-accent)';
        this.btnTapTempo.style.color = '#000';
        setTimeout(() => {
            this.btnTapTempo.style.background = 'transparent';
            this.btnTapTempo.style.color = 'var(--social-accent)';
        }, 100);

        // Reset if too much time passed (> 2 seconds)
        clearTimeout(this.tapResetTimer);
        this.tapResetTimer = setTimeout(() => {
            this.tapTimes = [];
        }, 2000);
    }
};

document.addEventListener('DOMContentLoaded', () => ToolsEngine.init());
