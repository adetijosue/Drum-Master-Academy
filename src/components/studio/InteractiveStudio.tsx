import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Square, Sliders, Power, Waves, Grid, Layers, Plus, Trash2, Sparkles, Activity, Info, Award, Music 
} from 'lucide-react';
import { snappySpring, fadeInUp } from '../../lib/motion';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

interface Channel {
  id: string;
  name: string;
  instrumentId: string;
  volume: number; // 0 to 100
  pan: number; // -1.0 to 1.0
  pitch: number; // -12 to 12 semitones
  mute: boolean;
  solo: boolean;
  effects: {
    delay: boolean;
    reverb: boolean;
    distortion: boolean;
    filter: boolean;
  };
  patternSteps: {
    pat1: boolean[];
    pat2: boolean[];
    pat3: boolean[];
  };
}

export const InteractiveStudioSection: React.FC = () => {
  const [bpm, setBpm] = useState(120);
  const [isPlayingMetronome, setIsPlayingMetronome] = useState(false);
  const [isPlayingSequencer, setIsPlayingSequencer] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [currentBar, setCurrentBar] = useState(-1);
  const [volume, setVolume] = useState(75); // Master volume (0 to 100)
  const [swing, setSwing] = useState(0); // 0 to 100
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  
  // FL Studio DAW specific states
  const [selectedPattern, setSelectedPattern] = useState<'pat1' | 'pat2' | 'pat3'>('pat1');
  const [playMode, setPlayMode] = useState<'pat' | 'song'>('pat');
  const [playlist, setPlaylist] = useState<(string | null)[]>([
    'pat1', 'pat1', 'pat2', 'pat2', 'pat1', 'pat1', 'pat3', 'pat3'
  ]);
  const [isMixerExpanded, setIsMixerExpanded] = useState(true);
  const [activeMixerChannel, setActiveMixerChannel] = useState<string>('master');

  // Channels Rack
  const [channels, setChannels] = useState<Channel[]>([
    {
      id: 'kick',
      name: 'KICK',
      instrumentId: 'kick',
      volume: 85,
      pan: 0,
      pitch: 0,
      mute: false,
      solo: false,
      effects: { delay: false, reverb: false, distortion: false, filter: false },
      patternSteps: {
        pat1: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false],
        pat2: [true, false, false, false, false, false, true, false, false, false, true, false, false, false, false, false],
        pat3: [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false]
      }
    },
    {
      id: 'snare',
      name: 'SNARE',
      instrumentId: 'snare',
      volume: 75,
      pan: 0,
      pitch: 0,
      mute: false,
      solo: false,
      effects: { delay: false, reverb: true, distortion: false, filter: false },
      patternSteps: {
        pat1: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
        pat2: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, true],
        pat3: [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false]
      }
    },
    {
      id: 'hihat',
      name: 'HI-HAT',
      instrumentId: 'hihat',
      volume: 65,
      pan: -0.15,
      pitch: 0,
      mute: false,
      solo: false,
      effects: { delay: false, reverb: false, distortion: false, filter: false },
      patternSteps: {
        pat1: [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false],
        pat2: [true, true, false, true, true, true, false, true, true, true, false, true, true, true, false, true],
        pat3: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true]
      }
    },
    {
      id: 'shaker',
      name: 'SHAKER',
      instrumentId: 'shaker',
      volume: 45,
      pan: 0.25,
      pitch: 2,
      mute: false,
      solo: false,
      effects: { delay: true, reverb: false, distortion: false, filter: false },
      patternSteps: {
        pat1: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
        pat2: [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false],
        pat3: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false]
      }
    },
    {
      id: 'clap',
      name: 'CLAP',
      instrumentId: 'clap',
      volume: 70,
      pan: -0.2,
      pitch: -1,
      mute: false,
      solo: false,
      effects: { delay: true, reverb: true, distortion: false, filter: false },
      patternSteps: {
        pat1: [false, false, false, false, false, false, false, false, false, false, false, false, true, false, false, false],
        pat2: [false, false, false, false, false, false, true, false, false, false, false, false, true, false, false, false],
        pat3: [false, true, false, true, false, true, false, true, false, true, false, true, false, true, false, true]
      }
    },
    {
      id: 'cowbell',
      name: 'COWBELL',
      instrumentId: 'cowbell',
      volume: 60,
      pan: 0.15,
      pitch: 0,
      mute: false,
      solo: false,
      effects: { delay: false, reverb: false, distortion: false, filter: false },
      patternSteps: {
        pat1: [false, false, false, false, false, false, false, true, false, false, false, false, false, false, false, false],
        pat2: [true, false, false, true, false, false, true, false, false, false, true, false, false, true, false, false],
        pat3: [false, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false]
      }
    }
  ]);
  
  const [activePads, setActivePads] = useState<Record<string, boolean>>({
    kick: false,
    snare: false,
    hihat: false,
    crash: false,
  });

  const { user } = useAuth();
  const isLoggedIn = !!user;

  // Simulated/Demo play loop for visitors to trigger visual sequencer and pad flashing at 120 BPM
  useEffect(() => {
    if (isLoggedIn) return; // Only run if not logged in
    
    // Set to simulated play mode
    setIsPlayingSequencer(true);
    setPlayMode('pat');
    
    let step = 0;
    const intervalTime = (60 / 120) * 1000 / 4; // 120 BPM sixteenth steps (125ms)
    
    const timer = setInterval(() => {
      setCurrentStep(step);
      setCurrentBar(Math.floor(step / 4));
      
      // Flash active pads visually based on selected pattern steps for a beautiful demo!
      const currentPattern = selectedPattern; // pat1
      const activePadsUpdate: Record<string, boolean> = {};
      
      channels.forEach(ch => {
        if (ch.patternSteps[currentPattern]?.[step]) {
          activePadsUpdate[ch.id] = true;
        }
      });
      
      setActivePads(activePadsUpdate);
      
      // Turn off visual pads after a short delay
      setTimeout(() => {
        setActivePads({});
      }, 70);
      
      step = (step + 1) % 16;
    }, intervalTime);
    
    return () => {
      clearInterval(timer);
      setIsPlayingSequencer(false);
      setCurrentStep(-1);
      setCurrentBar(-1);
      setActivePads({});
    };
  }, [isLoggedIn, selectedPattern, channels]);

  const playKick = (ctx: AudioContext, dest: AudioNode, pitchFactor = 1.0) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(dest);
    osc.frequency.setValueAtTime(150 * pitchFactor, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(0.01 * pitchFactor, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(1.0, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  };

  const playSnare = (ctx: AudioContext, dest: AudioNode, pitchFactor = 1.0) => {
    const bufferSize = ctx.sampleRate * 0.2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.playbackRate.setValueAtTime(pitchFactor, ctx.currentTime);

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1000 * pitchFactor, ctx.currentTime);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.7, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180 * pitchFactor, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100 * pitchFactor, ctx.currentTime + 0.1);
    oscGain.gain.setValueAtTime(0.4, ctx.currentTime);
    oscGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    osc.connect(oscGain);
    oscGain.connect(dest);

    noise.start();
    osc.start();
    noise.stop(ctx.currentTime + 0.2);
    osc.stop(ctx.currentTime + 0.2);
  };

  const playHiHat = (ctx: AudioContext, dest: AudioNode, pitchFactor = 1.0) => {
    const bufferSize = ctx.sampleRate * 0.05;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.playbackRate.setValueAtTime(pitchFactor, ctx.currentTime);

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(8000 * pitchFactor, ctx.currentTime);
    filter.Q.setValueAtTime(8, ctx.currentTime);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(dest);
    noise.start();
    noise.stop(ctx.currentTime + 0.05);
  };

  const playOpenHat = (ctx: AudioContext, dest: AudioNode, pitchFactor = 1.0) => {
    const bufferSize = ctx.sampleRate * 0.35;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.playbackRate.setValueAtTime(pitchFactor, ctx.currentTime);

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(7500 * pitchFactor, ctx.currentTime);
    filter.Q.setValueAtTime(6, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.24, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.32);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(dest);
    noise.start();
    noise.stop(ctx.currentTime + 0.35);
  };

  const playCrash = (ctx: AudioContext, dest: AudioNode, pitchFactor = 1.0) => {
    const bufferSize = ctx.sampleRate * 1.2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.playbackRate.setValueAtTime(pitchFactor, ctx.currentTime);

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(5500 * pitchFactor, ctx.currentTime);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.0);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(dest);
    noise.start();
    noise.stop(ctx.currentTime + 1.2);
  };

  const playDjembeLow = (ctx: AudioContext, dest: AudioNode, pitchFactor = 1.0) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(dest);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(110 * pitchFactor, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(55 * pitchFactor, ctx.currentTime + 0.18);
    gain.gain.setValueAtTime(1.0, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18);
    osc.start();
    osc.stop(ctx.currentTime + 0.18);
  };

  const playDjembeHigh = (ctx: AudioContext, dest: AudioNode, pitchFactor = 1.0) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(dest);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(360 * pitchFactor, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200 * pitchFactor, ctx.currentTime + 0.1);
    
    const bufferSize = ctx.sampleRate * 0.04;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.playbackRate.setValueAtTime(pitchFactor, ctx.currentTime);
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200 * pitchFactor, ctx.currentTime);
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.35, ctx.currentTime);
    
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(dest);
    
    gain.gain.setValueAtTime(0.55, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    
    osc.start();
    noise.start();
    osc.stop(ctx.currentTime + 0.1);
    noise.stop(ctx.currentTime + 0.1);
  };

  const playTalkingDrum = (ctx: AudioContext, dest: AudioNode, pitchFactor = 1.0) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(dest);
    osc.type = 'sine';
    const now = ctx.currentTime;
    
    osc.frequency.setValueAtTime(260 * pitchFactor, now);
    osc.frequency.exponentialRampToValueAtTime(140 * pitchFactor, now + 0.08);
    osc.frequency.linearRampToValueAtTime(180 * pitchFactor, now + 0.2);
    
    gain.gain.setValueAtTime(0.85, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    osc.start(now);
    osc.stop(now + 0.22);
  };

  const playShekere = (ctx: AudioContext, dest: AudioNode, pitchFactor = 1.0) => {
    const bufferSize = ctx.sampleRate * 0.07;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.playbackRate.setValueAtTime(pitchFactor, ctx.currentTime);

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(6200 * pitchFactor, ctx.currentTime);
    filter.Q.setValueAtTime(4, ctx.currentTime);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(dest);
    noise.start();
    noise.stop(ctx.currentTime + 0.07);
  };

  const playWoodblock = (ctx: AudioContext, dest: AudioNode, pitchFactor = 1.0) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(dest);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1150 * pitchFactor, ctx.currentTime);
    gain.gain.setValueAtTime(0.55, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  };

  const playConga = (ctx: AudioContext, dest: AudioNode, pitchFactor = 1.0) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(dest);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(185 * pitchFactor, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(140 * pitchFactor, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.8, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  };

  const playCongaHigh = (ctx: AudioContext, dest: AudioNode, pitchFactor = 1.0) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(dest);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(290 * pitchFactor, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(220 * pitchFactor, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.7, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  };

  const playBongo = (ctx: AudioContext, dest: AudioNode, pitchFactor = 1.0) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(dest);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440 * pitchFactor, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(310 * pitchFactor, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  };

  const playCowbell = (ctx: AudioContext, dest: AudioNode, pitchFactor = 1.0) => {
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    
    osc1.type = 'square';
    osc1.frequency.setValueAtTime(540 * pitchFactor, ctx.currentTime);
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(800 * pitchFactor, ctx.currentTime);
    
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800 * pitchFactor, ctx.currentTime);
    filter.Q.setValueAtTime(3, ctx.currentTime);
    
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
    
    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(dest);
    
    osc1.start();
    osc2.start();
    osc1.stop(ctx.currentTime + 0.22);
    osc2.stop(ctx.currentTime + 0.22);
  };

  const playAgogo = (ctx: AudioContext, dest: AudioNode, pitchFactor = 1.0) => {
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc1.type = 'sine';
    osc2.type = 'sine';
    osc1.frequency.setValueAtTime(880 * pitchFactor, ctx.currentTime);
    osc2.frequency.setValueAtTime(1230 * pitchFactor, ctx.currentTime);
    
    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.16);
    
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(dest);
    
    osc1.start();
    osc2.start();
    osc1.stop(ctx.currentTime + 0.16);
    osc2.stop(ctx.currentTime + 0.16);
  };

  const playClave = (ctx: AudioContext, dest: AudioNode, pitchFactor = 1.0) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(dest);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(2050 * pitchFactor, ctx.currentTime);
    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  };

  const playClap = (ctx: AudioContext, dest: AudioNode, pitchFactor = 1.0) => {
    const bufferSize = ctx.sampleRate * 0.15;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      let amplitude = 0;
      if (i < ctx.sampleRate * 0.01) {
        amplitude = (Math.random() * 2 - 1) * 0.3;
      } else if (i < ctx.sampleRate * 0.02) {
        amplitude = (Math.random() * 2 - 1) * 0.4;
      } else if (i < ctx.sampleRate * 0.03) {
        amplitude = (Math.random() * 2 - 1) * 0.5;
      } else {
        const t = (i - ctx.sampleRate * 0.03) / (bufferSize - ctx.sampleRate * 0.03);
        amplitude = (Math.random() * 2 - 1) * Math.exp(-t * 6);
      }
      data[i] = amplitude;
    }
    
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.playbackRate.setValueAtTime(pitchFactor, ctx.currentTime);

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1000 * pitchFactor, ctx.currentTime);
    filter.Q.setValueAtTime(2, ctx.currentTime);
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.55, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(dest);
    noise.start();
    noise.stop(ctx.currentTime + 0.15);
  };

  const playShaker = (ctx: AudioContext, dest: AudioNode, pitchFactor = 1.0) => {
    const bufferSize = ctx.sampleRate * 0.08;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      const t = i / bufferSize;
      const envelope = t < 0.2 ? t / 0.2 : (1 - t) / 0.8;
      data[i] = (Math.random() * 2 - 1) * envelope;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.playbackRate.setValueAtTime(pitchFactor, ctx.currentTime);

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(7200 * pitchFactor, ctx.currentTime);
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(dest);
    noise.start();
    noise.stop(ctx.currentTime + 0.08);
  };

  const playTambourine = (ctx: AudioContext, dest: AudioNode, pitchFactor = 1.0) => {
    const bufferSize = ctx.sampleRate * 0.16;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      const t = i / bufferSize;
      data[i] = (Math.random() * 2 - 1) * Math.exp(-t * 7);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.playbackRate.setValueAtTime(pitchFactor, ctx.currentTime);

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(9500 * pitchFactor, ctx.currentTime);
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.16);
    
    const skinOsc = ctx.createOscillator();
    const skinGain = ctx.createGain();
    skinOsc.type = 'triangle';
    skinOsc.frequency.setValueAtTime(175 * pitchFactor, ctx.currentTime);
    skinGain.gain.setValueAtTime(0.25, ctx.currentTime);
    skinGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(dest);
    
    skinOsc.connect(skinGain);
    skinGain.connect(dest);
    
    noise.start();
    skinOsc.start();
    noise.stop(ctx.currentTime + 0.16);
    skinOsc.stop(ctx.currentTime + 0.16);
  };

  const playTriangle = (ctx: AudioContext, dest: AudioNode, pitchFactor = 1.0) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(dest);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(3100 * pitchFactor, ctx.currentTime);
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  };

  const playCajonBass = (ctx: AudioContext, dest: AudioNode, pitchFactor = 1.0) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(dest);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(95 * pitchFactor, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(20 * pitchFactor, ctx.currentTime + 0.14);
    
    const bufferSize = ctx.sampleRate * 0.05;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.12 * Math.exp(-i / (ctx.sampleRate * 0.01));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.connect(dest);
    
    gain.gain.setValueAtTime(0.95, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
    
    osc.start();
    noise.start();
    osc.stop(ctx.currentTime + 0.18);
    noise.stop(ctx.currentTime + 0.18);
  };

  const playCajonSlap = (ctx: AudioContext, dest: AudioNode, pitchFactor = 1.0) => {
    const bufferSize = ctx.sampleRate * 0.08;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      const t = i / bufferSize;
      data[i] = (Math.random() * 2 - 1) * Math.exp(-t * 12);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.playbackRate.setValueAtTime(pitchFactor, ctx.currentTime);
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400 * pitchFactor, ctx.currentTime);
    filter.Q.setValueAtTime(3, ctx.currentTime);
    
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(290 * pitchFactor, ctx.currentTime);
    oscGain.gain.setValueAtTime(0.4, ctx.currentTime);
    oscGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.7, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    
    noise.connect(filter);
    filter.connect(gain);
    osc.connect(oscGain);
    oscGain.connect(dest);
    gain.connect(dest);
    
    noise.start();
    osc.start();
    noise.stop(ctx.currentTime + 0.08);
    osc.stop(ctx.currentTime + 0.08);
  };

  const playTimbaleHigh = (ctx: AudioContext, dest: AudioNode, pitchFactor = 1.0) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(380 * pitchFactor, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(190 * pitchFactor, ctx.currentTime + 0.12);
    
    const bufferSize = ctx.sampleRate * 0.03;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.005));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(2200 * pitchFactor, ctx.currentTime);
    
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.35, ctx.currentTime);
    
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(dest);
    
    gain.gain.setValueAtTime(0.8, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    
    osc.connect(gain);
    gain.connect(dest);
    
    osc.start();
    noise.start();
    osc.stop(ctx.currentTime + 0.15);
    noise.stop(ctx.currentTime + 0.15);
  };

  const playTimbaleLow = (ctx: AudioContext, dest: AudioNode, pitchFactor = 1.0) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(dest);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(260 * pitchFactor, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(110 * pitchFactor, ctx.currentTime + 0.18);
    
    gain.gain.setValueAtTime(0.8, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  };

  const playGuiro = (ctx: AudioContext, dest: AudioNode, pitchFactor = 1.0) => {
    const bufferSize = ctx.sampleRate * 0.18;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      const t = i / bufferSize;
      const scrape = Math.sin(t * 110 * Math.PI) > 0 ? 1 : -1;
      const env = t < 0.2 ? t / 0.2 : t < 0.5 ? 0.3 : (1 - t) / 0.5;
      data[i] = (Math.random() * 2 - 1) * env * scrape * 0.6;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.playbackRate.setValueAtTime(pitchFactor, ctx.currentTime);
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(3200 * pitchFactor, ctx.currentTime);
    filter.Q.setValueAtTime(2, ctx.currentTime);
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.35, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(dest);
    noise.start();
    noise.stop(ctx.currentTime + 0.18);
  };

  const playMaracas = (ctx: AudioContext, dest: AudioNode, pitchFactor = 1.0) => {
    const bufferSize = ctx.sampleRate * 0.08;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      const t = i / bufferSize;
      const grain = Math.random() > 0.45 ? 1 : -1;
      data[i] = grain * Math.exp(-t * 9) * 0.5;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.playbackRate.setValueAtTime(pitchFactor, ctx.currentTime);
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(6500 * pitchFactor, ctx.currentTime);
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.24, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(dest);
    noise.start();
    noise.stop(ctx.currentTime + 0.08);
  };

  const playMetronomeTick = (ctx: AudioContext, dest: AudioNode, isDownbeat: boolean) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(dest);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(isDownbeat ? 1000 : 750, ctx.currentTime);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  };

  const SOUND_BANK: Record<string, {
    name: string;
    label: string;
    category: 'batterie' | 'afro' | 'latin' | 'moderne';
    play: (ctx: AudioContext, dest: AudioNode, pitchFactor?: number) => void;
  }> = {
    kick: { name: 'Grosse Caisse', label: 'KICK', category: 'batterie', play: playKick },
    snare: { name: 'Caisse Claire', label: 'SNARE', category: 'batterie', play: playSnare },
    hihat: { name: 'Charley Fermé', label: 'HI-HAT', category: 'batterie', play: playHiHat },
    openhat: { name: 'Charley Ouvert', label: 'OPEN-HAT', category: 'batterie', play: playOpenHat },
    crash: { name: 'Cymbale Crash', label: 'CRASH', category: 'batterie', play: playCrash },
    djembelow: { name: 'Djembe Grave', label: 'DJEM B', category: 'afro', play: playDjembeLow },
    djembehigh: { name: 'Djembe Aigu', label: 'DJEM H', category: 'afro', play: playDjembeHigh },
    talkingdrum: { name: 'Tama (Talking Drum)', label: 'TAMA', category: 'afro', play: playTalkingDrum },
    shekere: { name: 'Chéquéré', label: 'SHEKERE', category: 'afro', play: playShekere },
    woodblock: { name: 'Woodblock', label: 'WOODBLK', category: 'afro', play: playWoodblock },
    conga: { name: 'Conga Grave', label: 'CONGA G', category: 'latin', play: playConga },
    congahigh: { name: 'Conga Aiguë', label: 'CONGA A', category: 'latin', play: playCongaHigh },
    bongo: { name: 'Bongo', label: 'BONGO', category: 'latin', play: playBongo },
    cowbell: { name: 'Cloche Cowbell', label: 'COWBELL', category: 'latin', play: playCowbell },
    agogo: { name: 'Cloche Agogo', label: 'AGOGO', category: 'latin', play: playAgogo },
    clave: { name: 'Clave', label: 'CLAVE', category: 'latin', play: playClave },
    clap: { name: 'Hand Clap', label: 'CLAP', category: 'moderne', play: playClap },
    shaker: { name: 'Shaker', label: 'SHAKER', category: 'moderne', play: playShaker },
    tambourine: { name: 'Tambourin', label: 'TAMB', category: 'moderne', play: playTambourine },
    triangle: { name: 'Triangle', label: 'TRIANGLE', category: 'moderne', play: playTriangle },
    guiro: { name: 'Guiro', label: 'GUIRO', category: 'moderne', play: playGuiro },
    maracas: { name: 'Maracas', label: 'MARACAS', category: 'moderne', play: playMaracas },
    cajonbass: { name: 'Cajon Basse', label: 'CAJON B', category: 'moderne', play: playCajonBass },
    cajonslap: { name: 'Cajon Slap', label: 'CAJON S', category: 'moderne', play: playCajonSlap },
    timbalehigh: { name: 'Timbale Aiguë', label: 'TIMB H', category: 'latin', play: playTimbaleHigh },
    timbalelow: { name: 'Timbale Grave', label: 'TIMB L', category: 'latin', play: playTimbaleLow }
  };

  const makeDistortionCurve = (amount: number) => {
    const k = typeof amount === 'number' ? amount : 50;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  };

  const channelsRef = useRef(channels);
  const swingRef = useRef(swing);
  const selectedPatternRef = useRef(selectedPattern);
  const playModeRef = useRef(playMode);
  const playlistRef = useRef(playlist);
  const volumeRef = useRef(volume);

  useEffect(() => { channelsRef.current = channels; }, [channels]);
  useEffect(() => { swingRef.current = swing; }, [swing]);
  useEffect(() => { selectedPatternRef.current = selectedPattern; }, [selectedPattern]);
  useEffect(() => { playModeRef.current = playMode; }, [playMode]);
  useEffect(() => { playlistRef.current = playlist; }, [playlist]);
  useEffect(() => { volumeRef.current = volume; }, [volume]);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const mainVolumeGainRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const lastTickTimeRef = useRef<number>(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [rank, setRank] = useState('Débutant');

  const triggerMeter = (id: string, vol: number) => {
    const meterFill = document.getElementById(`mixer-meter-fill-${id}`);
    if (meterFill) {
      const peakHeight = Math.min(100, Math.max(0, vol * (0.65 + Math.random() * 0.35)));
      meterFill.style.height = `${peakHeight}%`;
      
      if (peakHeight > 80) {
        meterFill.style.backgroundColor = '#ef4444';
      } else if (peakHeight > 55) {
        meterFill.style.backgroundColor = '#f59e0b';
      } else {
        meterFill.style.backgroundColor = '#d4af37';
      }

      setTimeout(() => {
        meterFill.style.height = '0%';
      }, 140);
    }
  };

  const drawVisualizer = () => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) {
      animationFrameIdRef.current = requestAnimationFrame(drawVisualizer);
      return;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const draw = () => {
      animationFrameIdRef.current = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);
      
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, width, height);
      
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.05)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x < width; x += 25) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y < height; y += 12) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();
      
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 2.5;
      ctx.shadowBlur = 6;
      ctx.shadowColor = 'rgba(212, 175, 55, 0.4)';
      ctx.beginPath();
      
      const sliceWidth = width / bufferLength;
      let x = 0;
      
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * height) / 2;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        
        x += sliceWidth;
      }
      
      ctx.lineTo(width, height / 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    };
    
    draw();
  };

  useEffect(() => {
    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, []);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      const mainGain = ctx.createGain();
      mainGain.gain.setValueAtTime(volume / 100, ctx.currentTime);
      
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      mainGain.connect(analyser);
      analyser.connect(ctx.destination);
      
      audioCtxRef.current = ctx;
      mainVolumeGainRef.current = mainGain;
      analyserRef.current = analyser;
      
      drawVisualizer();
    } else {
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
    }
  };

  useEffect(() => {
    if (mainVolumeGainRef.current && audioCtxRef.current) {
      mainVolumeGainRef.current.gain.setValueAtTime(volume / 100, audioCtxRef.current.currentTime);
    }
  }, [volume]);

  const triggerStepAudio = (channel: Channel, _step: number) => {
    initAudio();
    if (!audioCtxRef.current || !mainVolumeGainRef.current) return;
    const ctx = audioCtxRef.current;
    const dest = mainVolumeGainRef.current;

    const instr = SOUND_BANK[channel.instrumentId];
    if (!instr) return;

    const chanGain = ctx.createGain();
    chanGain.gain.setValueAtTime(channel.volume / 100, ctx.currentTime);

    let currentSourceNode: AudioNode = chanGain;

    if (channel.effects.filter) {
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1500, ctx.currentTime);
      filter.Q.setValueAtTime(2.0, ctx.currentTime);
      currentSourceNode.connect(filter);
      currentSourceNode = filter;
    }

    if (channel.effects.distortion) {
      const shaper = ctx.createWaveShaper();
      shaper.curve = makeDistortionCurve(65);
      shaper.oversample = '4x';
      currentSourceNode.connect(shaper);
      currentSourceNode = shaper;
    }

    if (channel.effects.delay) {
      const delay = ctx.createDelay();
      const beatSec = 60 / bpm;
      delay.delayTime.setValueAtTime(beatSec * 0.375, ctx.currentTime);
      
      const feedback = ctx.createGain();
      feedback.gain.setValueAtTime(0.4, ctx.currentTime);
      
      currentSourceNode.connect(delay);
      delay.connect(feedback);
      feedback.connect(delay);
      
      const delayMix = ctx.createGain();
      delayMix.gain.setValueAtTime(0.55, ctx.currentTime);
      delay.connect(delayMix);
      
      const fxOutNode = ctx.createGain();
      currentSourceNode.connect(fxOutNode);
      delayMix.connect(fxOutNode);
      currentSourceNode = fxOutNode;
    }

    if (channel.effects.reverb) {
      const delay1 = ctx.createDelay();
      const delay2 = ctx.createDelay();
      const gain1 = ctx.createGain();
      const gain2 = ctx.createGain();
      
      delay1.delayTime.setValueAtTime(0.024, ctx.currentTime);
      delay2.delayTime.setValueAtTime(0.038, ctx.currentTime);
      gain1.gain.setValueAtTime(0.45, ctx.currentTime);
      gain2.gain.setValueAtTime(0.45, ctx.currentTime);
      
      currentSourceNode.connect(delay1);
      delay1.connect(gain1);
      gain1.connect(delay2);
      delay2.connect(gain2);
      gain2.connect(delay1);
      
      const wetGain = ctx.createGain();
      wetGain.gain.setValueAtTime(0.38, ctx.currentTime);
      delay1.connect(wetGain);
      
      const fxOutNode = ctx.createGain();
      currentSourceNode.connect(fxOutNode);
      wetGain.connect(fxOutNode);
      currentSourceNode = fxOutNode;
    }

    if (ctx.createStereoPanner) {
      const panner = ctx.createStereoPanner();
      panner.pan.setValueAtTime(channel.pan, ctx.currentTime);
      currentSourceNode.connect(panner);
      panner.connect(dest);
    } else {
      currentSourceNode.connect(dest);
    }

    const pitchFactor = Math.pow(2, channel.pitch / 12);
    instr.play(ctx, chanGain, pitchFactor);
  };

  const triggerInstrument = (id: string, isManual = false) => {
    initAudio();
    if (!audioCtxRef.current || !mainVolumeGainRef.current) return;
    const ctx = audioCtxRef.current;
    const dest = mainVolumeGainRef.current;

    setActivePads(prev => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setActivePads(prev => ({ ...prev, [id]: false }));
    }, 100);

    triggerMeter(id, 80);
    triggerMeter('master', volumeRef.current);

    if (id === 'kick') playKick(ctx, dest);
    else if (id === 'snare') playSnare(ctx, dest);
    else if (id === 'hihat') playHiHat(ctx, dest);
    else if (id === 'crash') playCrash(ctx, dest);

    if (isManual && (isPlayingMetronome || isPlayingSequencer)) {
      const beatDuration = (60 / bpm) * 1000;
      const pressTime = Date.now();
      const timeSinceLast = pressTime - lastTickTimeRef.current;
      const timeToNext = beatDuration - timeSinceLast;
      const errorMs = Math.min(timeSinceLast, timeToNext);

      let points = 0;
      let feed = '';
      if (errorMs < 75) { points = 100; feed = '🔥 PARFAIT !'; }
      else if (errorMs < 140) { points = 50; feed = '✨ SUPER !'; }
      else if (errorMs < 220) { points = 20; feed = '👍 BIEN'; }
      else { points = 0; feed = '❌ OUPS'; }

      if (points > 0) {
        setScore(prev => prev + points);
        setCombo(prev => {
          const next = prev + 1;
          if (next > maxCombo) setMaxCombo(next);
          return next;
        });
      } else {
        setCombo(0);
      }
      setFeedback(feed);
      setTimeout(() => setFeedback(''), 1000);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 's') triggerInstrument('snare', true);
      else if (key === 'd') triggerInstrument('hihat', true);
      else if (key === 'f') triggerInstrument('kick', true);
      else if (key === 'g') triggerInstrument('crash', true);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlayingMetronome, isPlayingSequencer, bpm]);

  useEffect(() => {
    if (score > 5000) setRank('🥁 RYTHME VIRTUOSE');
    else if (score > 2500) setRank('⚡ GROOVE MASTER');
    else if (score > 1000) setRank('🌟 BATTEUR PRO');
    else if (score > 300) setRank('🎵 INITIÉ');
    else setRank('Débutant');
  }, [score]);

  useEffect(() => {
    if (!isPlayingSequencer && !isPlayingMetronome) {
      setCurrentStep(-1);
      setCurrentBar(-1);
      return;
    }

    let timerId: any = null;

    const getStepDuration = (step: number) => {
      const stepDurationMs = (60 / bpm) * 1000 / 4;
      const currentSwing = swingRef.current;
      if (currentSwing === 0) return stepDurationMs;
      const swingFactor = (currentSwing / 100) * 0.33;
      return step % 2 === 0 ? stepDurationMs * (1 + swingFactor) : stepDurationMs * (1 - swingFactor);
    };

    const runTick = (step: number, bar: number) => {
      lastTickTimeRef.current = Date.now();
      setCurrentStep(step);
      setCurrentBar(bar);

      if (audioCtxRef.current && mainVolumeGainRef.current) {
        const ctx = audioCtxRef.current;
        const dest = mainVolumeGainRef.current;

        if (isPlayingSequencer) {
          const currentChannels = channelsRef.current;
          const hasAnySolo = currentChannels.some(ch => ch.solo);
          let activePatId: string | null = selectedPatternRef.current;
          if (playModeRef.current === 'song') {
            activePatId = playlistRef.current[bar];
          }

          if (activePatId) {
            currentChannels.forEach(channel => {
              const isActive = channel.patternSteps[activePatId as 'pat1' | 'pat2' | 'pat3']?.[step];
              if (isActive) {
                const isMuted = channel.mute || (hasAnySolo && !channel.solo);
                if (!isMuted) {
                  triggerMeter(channel.id, channel.volume);
                  triggerMeter('master', volumeRef.current);
                  triggerStepAudio(channel, step);
                }
              }
            });
          }
        }

        if (isPlayingMetronome && step % 4 === 0) {
          const isDownbeat = step === 0;
          playMetronomeTick(ctx, dest, isDownbeat);
          triggerMeter('metronome', 50);
          triggerMeter('master', 20);
        }
      }

      const nextStep = (step + 1) % 16;
      const nextBar = nextStep === 0 ? (bar + 1) % 8 : bar;
      const duration = getStepDuration(step);
      timerId = setTimeout(() => { runTick(nextStep, nextBar); }, duration);
    };

    runTick(0, 0);
    return () => { if (timerId) clearTimeout(timerId); };
  }, [isPlayingSequencer, isPlayingMetronome, bpm]);

  const loadPreset = (presetName: string) => {
    initAudio();
    if (presetName === 'gospel') {
      setChannels([
        {
          id: 'kick', name: 'KICK', instrumentId: 'kick', volume: 85, pan: 0, pitch: 0, mute: false, solo: false,
          effects: { delay: false, reverb: false, distortion: false, filter: false },
          patternSteps: {
            pat1: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false],
            pat2: [true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false],
            pat3: [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false]
          }
        },
        {
          id: 'snare', name: 'SNARE', instrumentId: 'snare', volume: 75, pan: 0, pitch: 0, mute: false, solo: false,
          effects: { delay: false, reverb: true, distortion: false, filter: false },
          patternSteps: {
            pat1: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
            pat2: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
            pat3: [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false]
          }
        },
        {
          id: 'hihat', name: 'HI-HAT', instrumentId: 'hihat', volume: 65, pan: -0.15, pitch: 0, mute: false, solo: false,
          effects: { delay: false, reverb: false, distortion: false, filter: false },
          patternSteps: {
            pat1: [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false],
            pat2: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false],
            pat3: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true]
          }
        },
        {
          id: 'clap', name: 'CLAP', instrumentId: 'clap', volume: 70, pan: -0.2, pitch: 0, mute: false, solo: false,
          effects: { delay: true, reverb: true, distortion: false, filter: false },
          patternSteps: {
            pat1: [false, false, false, false, false, false, false, false, false, false, false, false, true, false, false, false],
            pat2: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
            pat3: [false, false, false, false, false, false, false, false, false, false, false, false, true, false, true, false]
          }
        },
        {
          id: 'tambourine', name: 'TAMB', instrumentId: 'tambourine', volume: 60, pan: 0.2, pitch: 0, mute: false, solo: false,
          effects: { delay: false, reverb: true, distortion: false, filter: false },
          patternSteps: {
            pat1: [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false],
            pat2: [false, false, false, false, false, false, true, false, false, false, false, false, false, false, true, false],
            pat3: [false, true, false, true, false, true, false, true, false, true, false, true, false, true, false, true]
          }
        },
        {
          id: 'crash', name: 'CRASH', instrumentId: 'crash', volume: 60, pan: -0.4, pitch: 0, mute: false, solo: false,
          effects: { delay: false, reverb: true, distortion: false, filter: false },
          patternSteps: {
            pat1: [true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
            pat2: [true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
            pat3: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false]
          }
        }
      ]);
      setBpm(130);
    } else if (presetName === 'afro') {
      setChannels([
        {
          id: 'djembelow', name: 'DJEM B', instrumentId: 'djembelow', volume: 90, pan: -0.1, pitch: 0, mute: false, solo: false,
          effects: { delay: false, reverb: false, distortion: false, filter: false },
          patternSteps: {
            pat1: [true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false],
            pat2: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false],
            pat3: [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false]
          }
        },
        {
          id: 'djembehigh', name: 'DJEM H', instrumentId: 'djembehigh', volume: 80, pan: 0.1, pitch: 0, mute: false, solo: false,
          effects: { delay: false, reverb: true, distortion: false, filter: false },
          patternSteps: {
            pat1: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, true],
            pat2: [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false],
            pat3: [false, true, false, true, false, true, false, true, false, true, false, true, false, true, false, true]
          }
        },
        {
          id: 'talkingdrum', name: 'TAMA', instrumentId: 'talkingdrum', volume: 85, pan: -0.15, pitch: 1, mute: false, solo: false,
          effects: { delay: true, reverb: true, distortion: false, filter: false },
          patternSteps: {
            pat1: [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false],
            pat2: [true, false, false, true, false, false, true, false, true, false, false, true, false, false, true, false],
            pat3: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false]
          }
        },
        {
          id: 'shekere', name: 'SHEKERE', instrumentId: 'shekere', volume: 70, pan: 0.25, pitch: 0, mute: false, solo: false,
          effects: { delay: false, reverb: false, distortion: false, filter: false },
          patternSteps: {
            pat1: [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false],
            pat2: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            pat3: [true, false, false, true, true, false, false, true, true, false, false, true, true, false, false, true]
          }
        },
        {
          id: 'woodblock', name: 'WOODBLK', instrumentId: 'woodblock', volume: 60, pan: -0.25, pitch: 2, mute: false, solo: false,
          effects: { delay: false, reverb: false, distortion: false, filter: false },
          patternSteps: {
            pat1: [true, false, false, true, false, false, true, false, false, true, false, false, true, false, false, false],
            pat2: [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false],
            pat3: [true, true, false, false, true, true, false, false, true, true, false, false, true, true, false, false]
          }
        },
        {
          id: 'conga', name: 'CONGA G', instrumentId: 'conga', volume: 75, pan: -0.15, pitch: -1, mute: false, solo: false,
          effects: { delay: false, reverb: true, distortion: false, filter: false },
          patternSteps: {
            pat1: [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false],
            pat2: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
            pat3: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false]
          }
        }
      ]);
      setBpm(110);
    } else if (presetName === 'latin') {
      setChannels([
        {
          id: 'conga', name: 'CONGA G', instrumentId: 'conga', volume: 85, pan: -0.15, pitch: 0, mute: false, solo: false,
          effects: { delay: false, reverb: true, distortion: false, filter: false },
          patternSteps: {
            pat1: [false, false, false, false, true, false, false, true, false, false, false, false, true, false, false, true],
            pat2: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false],
            pat3: [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false]
          }
        },
        {
          id: 'bongo', name: 'BONGO', instrumentId: 'bongo', volume: 80, pan: 0.15, pitch: 2, mute: false, solo: false,
          effects: { delay: false, reverb: false, distortion: false, filter: false },
          patternSteps: {
            pat1: [true, false, true, true, false, true, false, true, true, false, true, true, false, true, false, true],
            pat2: [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false],
            pat3: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true]
          }
        },
        {
          id: 'cowbell', name: 'COWBELL', instrumentId: 'cowbell', volume: 70, pan: 0.2, pitch: 0, mute: false, solo: false,
          effects: { delay: false, reverb: false, distortion: false, filter: false },
          patternSteps: {
            pat1: [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false],
            pat2: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false],
            pat3: [true, false, true, true, true, false, true, true, true, false, true, true, true, false, true, true]
          }
        },
        {
          id: 'clave', name: 'CLAVE', instrumentId: 'clave', volume: 75, pan: -0.2, pitch: 0, mute: false, solo: false,
          effects: { delay: false, reverb: false, distortion: false, filter: false },
          patternSteps: {
            pat1: [true, false, false, true, false, false, true, false, false, false, true, false, true, false, false, false],
            pat2: [true, false, false, true, false, false, true, false, false, false, true, false, true, false, false, false],
            pat3: [true, false, false, true, false, false, true, false, false, false, true, false, true, false, false, false]
          }
        },
        {
          id: 'timbalehigh', name: 'TIMB H', instrumentId: 'timbalehigh', volume: 80, pan: -0.25, pitch: 1, mute: false, solo: false,
          effects: { delay: true, reverb: true, distortion: false, filter: false },
          patternSteps: {
            pat1: [false, false, false, false, false, false, true, false, false, false, false, false, true, false, true, false],
            pat2: [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false],
            pat3: [true, true, false, true, true, true, false, true, true, true, false, true, true, true, false, true]
          }
        },
        {
          id: 'kick', name: 'KICK', instrumentId: 'kick', volume: 80, pan: 0, pitch: 0, mute: false, solo: false,
          effects: { delay: false, reverb: false, distortion: false, filter: false },
          patternSteps: {
            pat1: [true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false],
            pat2: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false],
            pat3: [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false]
          }
        }
      ]);
      setBpm(124);
    } else if (presetName === 'hand') {
      setChannels([
        {
          id: 'cajonbass', name: 'CAJON B', instrumentId: 'cajonbass', volume: 85, pan: -0.05, pitch: 0, mute: false, solo: false,
          effects: { delay: false, reverb: false, distortion: false, filter: false },
          patternSteps: {
            pat1: [true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false],
            pat2: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false],
            pat3: [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false]
          }
        },
        {
          id: 'cajonslap', name: 'CAJON S', instrumentId: 'cajonslap', volume: 75, pan: 0.05, pitch: 0, mute: false, solo: false,
          effects: { delay: false, reverb: true, distortion: false, filter: false },
          patternSteps: {
            pat1: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
            pat2: [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false],
            pat3: [false, true, false, true, false, true, false, true, false, true, false, true, false, true, false, true]
          }
        },
        {
          id: 'shaker', name: 'SHAKER', instrumentId: 'shaker', volume: 60, pan: 0.2, pitch: 3, mute: false, solo: false,
          effects: { delay: true, reverb: false, distortion: false, filter: false },
          patternSteps: {
            pat1: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            pat2: [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false],
            pat3: [true, true, false, true, true, true, false, true, true, true, false, true, true, true, false, true]
          }
        },
        {
          id: 'guiro', name: 'GUIRO', instrumentId: 'guiro', volume: 55, pan: -0.2, pitch: 0, mute: false, solo: false,
          effects: { delay: false, reverb: false, distortion: false, filter: false },
          patternSteps: {
            pat1: [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false],
            pat2: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false],
            pat3: [false, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false]
          }
        },
        {
          id: 'maracas', name: 'MARACAS', instrumentId: 'maracas', volume: 65, pan: 0.25, pitch: 1, mute: false, solo: false,
          effects: { delay: false, reverb: true, distortion: false, filter: false },
          patternSteps: {
            pat1: [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false],
            pat2: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            pat3: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false]
          }
        },
        {
          id: 'triangle', name: 'TRIANGLE', instrumentId: 'triangle', volume: 50, pan: -0.3, pitch: 0, mute: false, solo: false,
          effects: { delay: true, reverb: true, distortion: false, filter: false },
          patternSteps: {
            pat1: [false, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false],
            pat2: [false, false, false, false, false, false, false, true, false, false, false, false, false, false, false, false],
            pat3: [true, false, false, true, true, false, false, true, true, false, false, true, true, false, false, true]
          }
        }
      ]);
      setBpm(115);
    }
  };

  const clearSequence = () => {
    setChannels(prev => prev.map(ch => ({
      ...ch,
      patternSteps: {
        ...ch.patternSteps,
        [selectedPattern]: Array(16).fill(false)
      }
    })));
  };

  const addChannel = () => {
    const newId = `channel_${Date.now()}`;
    setChannels(prev => [
      ...prev,
      {
        id: newId,
        name: 'COWBELL',
        instrumentId: 'cowbell',
        volume: 70,
        pan: 0,
        pitch: 0,
        mute: false,
        solo: false,
        effects: { delay: false, reverb: false, distortion: false, filter: false },
        patternSteps: {
          pat1: Array(16).fill(false),
          pat2: Array(16).fill(false),
          pat3: Array(16).fill(false)
        }
      }
    ]);
    setActiveMixerChannel(newId);
  };

  const deleteChannel = (id: string) => {
    setChannels(prev => prev.filter(ch => ch.id !== id));
    if (activeMixerChannel === id) {
      setActiveMixerChannel('master');
    }
  };

  const toggleMute = (id: string) => {
    setChannels(prev => prev.map(ch => ch.id === id ? { ...ch, mute: !ch.mute } : ch));
  };

  const toggleSolo = (id: string) => {
    setChannels(prev => prev.map(ch => ch.id === id ? { ...ch, solo: !ch.solo } : ch));
  };

  const selectInstrument = (channelId: string, instId: string) => {
    const instr = SOUND_BANK[instId];
    if (!instr) return;
    setChannels(prev => prev.map(ch => {
      if (ch.id === channelId) {
        return {
          ...ch,
          instrumentId: instId,
          name: instr.label
        };
      }
      return ch;
    }));
    setActiveDropdown(null);

    initAudio();
    if (audioCtxRef.current && mainVolumeGainRef.current) {
      instr.play(audioCtxRef.current, mainVolumeGainRef.current);
    }
  };

  const auditionChannel = (channel: Channel) => {
    initAudio();
    if (audioCtxRef.current && mainVolumeGainRef.current) {
      const instr = SOUND_BANK[channel.instrumentId];
      if (instr) {
        const chanGain = audioCtxRef.current.createGain();
        chanGain.gain.setValueAtTime(channel.volume / 100, audioCtxRef.current.currentTime);
        chanGain.connect(mainVolumeGainRef.current);
        const pitchFactor = Math.pow(2, channel.pitch / 12);
        instr.play(audioCtxRef.current, chanGain, pitchFactor);
      }
    }
    setActiveDropdown(prev => prev === channel.id ? null : channel.id);
  };

  const toggleChannelFx = (channelId: string, fxType: 'delay' | 'reverb' | 'distortion' | 'filter') => {
    setChannels(prev => prev.map(ch => {
      if (ch.id === channelId) {
        return {
          ...ch,
          effects: {
            ...ch.effects,
            [fxType]: !ch.effects[fxType]
          }
        };
      }
      return ch;
    }));
  };

  const togglePlaylistCell = (barIdx: number, patId: string) => {
    setPlaylist(prev => {
      const copy = [...prev];
      if (copy[barIdx] === patId) {
        copy[barIdx] = null;
      } else {
        copy[barIdx] = patId;
      }
      return copy;
    });
  };

  const duplicateSteps = (channelId: string) => {
    setChannels(prev => prev.map(ch => {
      if (ch.id === channelId) {
        const steps = ch.patternSteps[selectedPattern];
        const newSteps = [...steps];
        for (let i = 0; i < 8; i++) {
          newSteps[i + 8] = steps[i];
        }
        return {
          ...ch,
          patternSteps: {
            ...ch.patternSteps,
            [selectedPattern]: newSteps
          }
        };
      }
      return ch;
    }));
  };

  const shiftSteps = (channelId: string, direction: 'left' | 'right') => {
    setChannels(prev => prev.map(ch => {
      if (ch.id === channelId) {
        const steps = ch.patternSteps[selectedPattern];
        const newSteps = Array(16).fill(false);
        for (let i = 0; i < 16; i++) {
          if (direction === 'left') {
            newSteps[i] = steps[(i + 1) % 16];
          } else {
            newSteps[i] = steps[(i - 1 + 16) % 16];
          }
        }
        return {
          ...ch,
          patternSteps: {
            ...ch.patternSteps,
            [selectedPattern]: newSteps
          }
        };
      }
      return ch;
    }));
  };



  return (
    <section className="py-10 sm:py-12 bg-zinc-950/80 border-t border-b border-white/5 relative overflow-hidden" aria-label="DMA Interactive Studio">
      <div className="absolute top-1/4 left-1/10 w-64 sm:w-96 h-64 sm:h-96 bg-gold-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/10 w-64 sm:w-96 h-64 sm:h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          variants={fadeInUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-8 sm:mb-12 space-y-4"
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider text-gold-400 bg-gold-400/10 border border-gold-400/20 uppercase">
            <Sparkles className="w-3.5 h-3.5" /> DMA. VIRTUAL STUDIO
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold font-sans text-white">
            DMA. Studio &amp; <span className="text-gold-400">Boîte à Rythmes</span>
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto">
            Programmez des loops professionnelles, enchaînez des patterns avec l'arrangeur SONG, mixez avec la console et ajustez vos effets en temps réel à la manière de FL Studio !
          </p>
        </motion.div>

        <div className="relative">
          <div className={`transition-all duration-700 ${!isLoggedIn ? 'blur-[4.5px] select-none pointer-events-none brightness-[45%] contrast-[80%]' : ''}`}>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 mb-4 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-gold-500/30 to-transparent" />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
            <div className="lg:col-span-4 flex flex-wrap gap-3 items-center justify-between lg:justify-start border-b lg:border-b-0 lg:border-r border-zinc-800/80 pb-3 lg:pb-0 lg:pr-4">
              <div className="flex gap-1.5 bg-zinc-950 p-1 rounded-lg border border-white/5 shadow-inner">
                <button
                  onClick={() => {
                    initAudio();
                    setIsPlayingSequencer(prev => !prev);
                  }}
                  className={`w-8 h-8 rounded-md flex items-center justify-center border transition-all ${
                    isPlayingSequencer
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                  title={isPlayingSequencer ? 'Pause' : 'Jouer'}
                >
                  <Play className={`w-3.5 h-3.5 ${isPlayingSequencer ? 'animate-pulse' : ''}`} />
                </button>
                
                <button
                  onClick={() => {
                    setIsPlayingSequencer(false);
                    setCurrentStep(-1);
                    setCurrentBar(0);
                  }}
                  className="w-8 h-8 rounded-md flex items-center justify-center bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-rose-400 transition-colors"
                  title="Arrêter"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                </button>
                
                <button
                  className="w-8 h-8 rounded-md flex items-center justify-center bg-zinc-900 border border-zinc-800 text-rose-500/40 cursor-not-allowed"
                  title="Enregistrer (Décoratif)"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
                </button>
              </div>

              <div className="flex flex-col gap-0.5 items-center bg-zinc-950/80 px-2 py-0.5 rounded-lg border border-white/5 shadow-md">
                <span className="text-[7px] font-black text-zinc-500 tracking-widest uppercase">MODE PLAY</span>
                <div className="flex bg-zinc-900 rounded-md border border-zinc-850 p-0.5 relative">
                  <button
                    onClick={() => setPlayMode('pat')}
                    className={`px-2 py-0.5 text-[9px] font-black rounded transition-all uppercase tracking-wider ${
                      playMode === 'pat'
                        ? 'bg-gold-500 text-obsidian font-bold shadow-md'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    PAT
                  </button>
                  <button
                    onClick={() => {
                      initAudio();
                      setPlayMode('song');
                    }}
                    className={`px-2 py-0.5 text-[9px] font-black rounded transition-all uppercase tracking-wider ${
                      playMode === 'song'
                        ? 'bg-purple-600 text-white font-bold shadow-md'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    SONG
                  </button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 grid grid-cols-2 sm:grid-cols-4 gap-3 items-center justify-center">
              <div className="bg-zinc-950/80 p-1.5 rounded-lg border border-white/5 text-center flex flex-col justify-between h-[54px] min-w-[85px]">
                <span className="text-[7px] text-zinc-500 font-bold uppercase tracking-wider block leading-none">BPM / TEMPO</span>
                <span className="text-sm font-black text-gold-400 font-mono tracking-widest leading-none my-0.5">{bpm}</span>
                <input
                  type="range"
                  min="60"
                  max="180"
                  value={bpm}
                  onChange={(e) => setBpm(parseInt(e.target.value))}
                  className="w-full accent-gold-500 h-0.5 bg-zinc-800 rounded cursor-pointer"
                />
              </div>

              <div className="bg-zinc-950/80 p-1.5 rounded-lg border border-white/5 text-center flex flex-col justify-between h-[54px] min-w-[85px]">
                <span className="text-[7px] text-zinc-500 font-bold uppercase tracking-wider block leading-none">BAR / STEP</span>
                <span className="text-xs font-extrabold text-gold-400/90 font-mono tracking-widest my-0.5">
                  {currentBar >= 0 ? `${currentBar + 1}` : '--'}.{currentStep >= 0 ? `${currentStep + 1}` : '--'}
                </span>
                <span className="text-[7px] text-zinc-500/70 font-mono font-medium block leading-none">
                  {isPlayingSequencer ? 'LECTURE' : 'ARRÊTÉ'}
                </span>
              </div>

              <div className="bg-zinc-950/80 p-1.5 rounded-lg border border-white/5 text-center flex flex-col justify-between h-[54px] min-w-[85px]">
                <span className="text-[7px] text-zinc-500 font-bold uppercase tracking-wider block leading-none">GROOVE SWING</span>
                <span className="text-sm font-black text-purple-400 font-mono tracking-widest leading-none my-0.5">{swing}%</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={swing}
                  onChange={(e) => setSwing(parseInt(e.target.value))}
                  className="w-full accent-purple-500 h-0.5 bg-zinc-800 rounded cursor-pointer"
                />
              </div>

              <div className="bg-zinc-950/80 p-1 rounded-lg border border-white/5 flex flex-col justify-between items-center h-[54px] min-w-[85px]">
                <span className="text-[7px] text-zinc-500 font-bold uppercase tracking-wider leading-none">CLIC BEAT</span>
                <button
                  onClick={() => {
                    initAudio();
                    setIsPlayingMetronome(prev => !prev);
                  }}
                  className={`w-full py-0.5 text-[8px] font-black rounded border flex items-center justify-center gap-1 mt-0.5 transition-all ${
                    isPlayingMetronome
                      ? 'bg-gold-500/10 border-gold-500/30 text-gold-400'
                      : 'bg-zinc-900 border-zinc-850 text-zinc-500'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isPlayingMetronome ? 'bg-gold-400 animate-pulse' : 'bg-zinc-700'}`} />
                  METRONOME
                </button>
              </div>
            </div>

            <div className="lg:col-span-3 flex flex-col items-center justify-center bg-zinc-950/90 p-1.5 rounded-xl border border-white/5 shadow-inner">
              <span className="text-[7px] font-black text-gold-500/70 tracking-widest uppercase mb-0.5 flex items-center gap-1">
                <Waves className="w-3 h-3" /> DMA. OSCILLOSCOPE
              </span>
              <canvas
                ref={canvasRef}
                width="200"
                height="36"
                className="w-full h-[32px] rounded bg-zinc-950/90 border border-zinc-900"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4 items-stretch">
          <div className="lg:col-span-5 flex flex-col">
            <div className="glass-card p-3 sm:p-4 border-white/5 shadow-2xl relative flex-1 flex flex-col justify-between">
              
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold text-zinc-300 tracking-wider flex items-center gap-2">
                  <Activity className="w-4 h-4 text-gold-400 animate-pulse" /> 
                  <span className="hidden sm:inline">Pads de Batterie Actifs (Clavier: S - D - F - G)</span>
                  <span className="sm:hidden">Accompagnement Batterie</span>
                </span>
                <span className="text-[9px] bg-gold-400/10 border border-gold-400/20 text-gold-400 px-2 py-0.5 rounded font-black uppercase">LIVE PLAY</span>
              </div>

              <div className="grid grid-cols-2 gap-4 flex-1">
                {[
                  { id: 'crash', name: 'CRASH', key: 'G', color: 'from-purple-600 to-indigo-600', glowColor: 'rgba(168, 85, 247, 0.4)', bgGlow: 'bg-purple-500/20', soundName: 'Cymbal Crash' },
                  { id: 'hihat', name: 'HI-HAT', key: 'D', color: 'from-gold-600 to-amber-500', glowColor: 'rgba(212, 175, 55, 0.4)', bgGlow: 'bg-gold-500/20', soundName: 'Charley Fermé' },
                  { id: 'snare', name: 'SNARE', key: 'S', color: 'from-blue-600 to-cyan-500', glowColor: 'rgba(59, 130, 246, 0.4)', bgGlow: 'bg-blue-500/20', soundName: 'Caisse Claire' },
                  { id: 'kick', name: 'KICK', key: 'F', color: 'from-rose-600 to-orange-500', glowColor: 'rgba(244, 63, 94, 0.4)', bgGlow: 'bg-rose-500/20', soundName: 'Grosse Caisse' },
                ].map((pad) => (
                  <motion.button
                    key={pad.id}
                    onClick={() => triggerInstrument(pad.id, true)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      boxShadow: activePads[pad.id]
                        ? `0 0 25px ${pad.glowColor}`
                        : '0 4px 6px -1px rgba(0,0,0,0.1)'
                    }}
                    className={`relative aspect-[1.3/1] rounded-xl border transition-all duration-75 overflow-hidden flex flex-col items-center justify-between p-3 ${
                      activePads[pad.id]
                        ? `${pad.bgGlow} border-white/30 scale-[0.98]`
                        : 'bg-obsidian-card/40 border-white/5 hover:border-white/15'
                    }`}
                  >
                    {activePads[pad.id] && (
                      <motion.span
                        initial={{ opacity: 0.5, scale: 0.8 }}
                        animate={{ opacity: 0, scale: 1.5 }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0 rounded-xl border border-white/50 pointer-events-none"
                      />
                    )}

                    <div className="w-full flex justify-between items-start">
                      <div className="flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${activePads[pad.id] ? 'bg-white animate-ping' : 'bg-zinc-700'}`} />
                        <span className="text-[8px] text-zinc-500 uppercase tracking-widest hidden xs:inline">{pad.soundName}</span>
                      </div>
                      <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-zinc-950 border border-white/10 text-gold-400 shadow-md">
                        {pad.key}
                      </span>
                    </div>

                    <span className={`text-lg sm:text-xl font-black bg-gradient-to-r ${pad.color} bg-clip-text text-transparent`}>
                      {pad.name}
                    </span>

                    <div className="w-full h-1 flex gap-0.5 items-end justify-center">
                      {[...Array(4)].map((_, idx) => (
                        <motion.span
                          key={idx}
                          animate={{
                            height: activePads[pad.id] ? [3, Math.random() * 12 + 3, 3] : 3
                          }}
                          transition={{
                            duration: 0.15,
                            repeat: activePads[pad.id] ? 1 : 0
                          }}
                          className={`w-1 rounded-t bg-gradient-to-t ${pad.color}`}
                        />
                      ))}
                    </div>
                  </motion.button>
                ))}
              </div>

              <div className="glass-card mt-4 p-2.5 border-white/5 flex gap-3 items-center justify-between min-h-[42px]">
                <div className="flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-gold-400 shrink-0" />
                  <span className="text-[9px] text-zinc-400 leading-tight">
                    Jouez en rythme avec le séquenceur pour cumuler des points !
                  </span>
                </div>
                <AnimatePresence mode="wait">
                  {feedback && (
                    <motion.span
                      key={feedback}
                      initial={{ opacity: 0, scale: 0.6, y: 10 }}
                      animate={{ opacity: 1, scale: 1.1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8, y: -10 }}
                      transition={snappySpring}
                      className={`text-[9px] font-extrabold tracking-wider px-2 py-0.5 rounded border shadow-lg shrink-0 ${
                        feedback.includes('PARFAIT')
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : feedback.includes('SUPER')
                          ? 'bg-gold-500/10 border-gold-500/30 text-gold-400'
                          : feedback.includes('BIEN')
                          ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                          : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                      }`}
                    >
                      {feedback}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col justify-between">
            <div className="glass-card p-3 sm:p-4 border-white/5 shadow-2xl flex-1 flex flex-col justify-between">
              
              <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-3">
                <span className="text-[10px] font-bold text-zinc-400 tracking-wider flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-gold-400" /> JEU DE RYTHME
                </span>
                <span className="text-[9px] font-black text-gold-400 tracking-widest bg-gold-400/5 px-2 py-0.5 rounded border border-gold-400/10 uppercase">
                  {rank}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-zinc-950/60 p-2 rounded-lg border border-white/5 text-center">
                  <span className="text-[8px] text-zinc-500 block uppercase tracking-wider">Score</span>
                  <span className="text-sm font-extrabold text-white font-mono">{score}</span>
                </div>
                <div className="bg-zinc-950/60 p-2 rounded-lg border border-white/5 text-center">
                  <span className="text-[8px] text-zinc-500 block uppercase tracking-wider">Combo Actuel</span>
                  <span className="text-sm font-extrabold text-gold-400 font-mono animate-pulse">{combo}</span>
                </div>
                <div className="bg-zinc-950/60 p-2 rounded-lg border border-white/5 text-center">
                  <span className="text-[8px] text-zinc-500 block uppercase tracking-wider">Meilleur Combo</span>
                  <span className="text-sm font-extrabold text-purple-400 font-mono">{maxCombo}</span>
                </div>
              </div>

              <div className="bg-zinc-950/80 p-3.5 rounded-xl border border-white/5 shadow-inner">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-black text-zinc-400 tracking-widest uppercase flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-purple-400" /> ARRANGEUR PLAYLIST (MODE SONG)
                  </span>
                  <div className="flex gap-2">
                    <span className="text-[8px] text-zinc-500 font-medium">8 Mesures</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-16 text-[8px] text-zinc-600 font-extrabold uppercase">Timeline</div>
                    <div className="flex-1 grid grid-cols-8 gap-1 text-center shrink-0">
                      {[...Array(8)].map((_, idx) => (
                        <div
                          key={idx}
                          className={`text-[8px] font-black rounded-md py-0.5 border ${
                            currentBar === idx && isPlayingSequencer
                              ? 'text-white border-gold-400 bg-gold-400/10 shadow-[0_0_6px_rgba(212,175,55,0.2)]'
                              : 'text-zinc-600 border-transparent bg-zinc-900/40'
                          }`}
                        >
                          M{idx + 1}
                        </div>
                      ))}
                    </div>
                  </div>

                  {['pat1', 'pat2', 'pat3'].map((patId) => {
                    const patLabel = patId === 'pat1' ? 'PAT 1 (A)' : patId === 'pat2' ? 'PAT 2 (B)' : 'PAT 3 (C)';
                    const patColor = patId === 'pat1' ? 'from-gold-600 to-gold-400 text-obsidian border-gold-400/40' : patId === 'pat2' ? 'from-purple-600 to-indigo-500 text-white border-purple-500/40' : 'from-cyan-600 to-blue-500 text-white border-cyan-500/40';

                    return (
                      <div key={patId} className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedPattern(patId as 'pat1' | 'pat2' | 'pat3')}
                          className={`w-16 py-1.5 px-2 rounded-md text-[9px] font-black text-left border transition-all uppercase ${
                            selectedPattern === patId
                              ? 'bg-zinc-900 border-gold-500/40 text-gold-400 shadow-md font-bold'
                              : 'bg-zinc-950 border-white/5 text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          {patLabel}
                        </button>
                        
                        <div className="flex-1 grid grid-cols-8 gap-1">
                          {[...Array(8)].map((_, barIdx) => {
                            const isScheduled = playlist[barIdx] === patId;
                            const isPlayhead = currentBar === barIdx && isPlayingSequencer;

                            return (
                              <button
                                key={barIdx}
                                onClick={() => togglePlaylistCell(barIdx, patId)}
                                className={`h-6 rounded-md border flex items-center justify-center transition-all ${
                                  isScheduled
                                    ? `bg-gradient-to-r ${patColor} shadow-md`
                                    : isPlayhead
                                    ? 'bg-white/10 border-white/20'
                                    : 'bg-zinc-900 border-zinc-850 hover:bg-zinc-800'
                                }`}
                                aria-label={`Assigner ${patLabel} à la mesure ${barIdx + 1}`}
                              >
                                {isScheduled ? (
                                  <span className="text-[7px] font-extrabold uppercase select-none">ACTIF</span>
                                ) : isPlayhead ? (
                                  <div className="w-1.5 h-1.5 rounded-full bg-white/40 animate-ping" />
                                ) : null}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between items-center border-t border-white/5 pt-2.5 mt-2.5">
                  <span className="text-[8px] text-zinc-500 leading-tight">
                    * Cliquez sur les cases ci-dessus pour planifier l'enchaînement de vos patterns en mode SONG.
                  </span>
                  <button
                    onClick={() => setPlaylist(Array(8).fill(null))}
                    className="text-[8px] font-black text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 px-2 py-1 rounded border border-rose-500/20 transition-all uppercase"
                  >
                    Vider l'arrangement
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card p-3 sm:p-4 border-white/5 shadow-2xl relative mb-6">
          <div className="flex justify-between items-center border-b border-white/5 pb-2.5 mb-2.5">
            <span className="text-xs sm:text-sm font-bold text-white tracking-wider flex items-center gap-2 uppercase">
              <Grid className="w-4 h-4 text-gold-400" /> CHANNEL RACK : PATTERN {selectedPattern.replace('pat', '')}
            </span>

            <div className="flex items-center gap-2">
              <span className="text-[8px] sm:text-[10px] text-zinc-500 font-extrabold uppercase flex items-center gap-1">
                <Music className="w-3.5 h-3.5" /> Charger un Style
              </span>
              <div className="flex bg-zinc-950 p-0.5 rounded-md border border-white/5">
                {['gospel', 'afro', 'latin', 'hand'].map((style) => (
                  <button
                    key={style}
                    onClick={() => loadPreset(style)}
                    className="px-2 py-1 text-[8px] sm:text-[9px] font-black uppercase text-zinc-400 hover:text-white rounded transition-colors"
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gold-500/20 scrollbar-track-transparent">
            <div className="min-w-[750px] space-y-2">
              <div className="flex items-center gap-1.5 pb-1 border-b border-white/5 mb-1">
                <div className="w-[34px] text-[7px] text-zinc-600 font-black uppercase text-center">Mix</div>
                <div className="w-[68px] text-[7px] text-zinc-600 font-black uppercase text-center">Pan/Pit</div>
                <div className="w-[76px] text-[7px] text-zinc-600 font-black uppercase text-center">Instrument</div>
                <div className="w-[44px] text-[7px] text-zinc-600 font-black uppercase text-center">FX</div>
                <div className="flex-1 flex gap-1.5 shrink-0 items-center justify-between">
                  {[0, 1, 2, 3].map((beatIdx) => (
                    <div key={beatIdx} className="flex-1 grid grid-cols-4 gap-0.5 sm:gap-1 text-center">
                      {[0, 1, 2, 3].map((stepInBeat) => {
                        const idx = beatIdx * 4 + stepInBeat;
                        const isBeatStart = idx % 4 === 0;
                        return (
                          <span
                            key={idx}
                            className={`text-[7px] font-black rounded py-0.5 ${
                              currentStep === idx && isPlayingSequencer
                                ? 'text-white bg-white/10 scale-110 shadow-[0_0_6px_rgba(255,255,255,0.4)]'
                                : isBeatStart
                                ? 'text-gold-400 font-extrabold'
                                : 'text-zinc-600'
                            }`}
                          >
                            {isBeatStart ? `${(idx / 4) + 1}` : `.${(idx % 4) + 1}`}
                          </span>
                        );
                      })}
                    </div>
                  ))}
                </div>
                <div className="w-10 text-[7px] text-zinc-600 font-black uppercase text-center">Ed.</div>
              </div>

              <div className="space-y-0.5">
                {channels.map((channel) => (
                  <div
                    key={channel.id}
                    className={`flex items-center gap-1.5 bg-zinc-950/40 py-0.5 px-1.5 rounded-md border transition-all ${
                      channel.solo
                        ? 'border-amber-500/20 bg-amber-500/5'
                        : channel.mute
                        ? 'border-rose-950/20 opacity-50'
                        : activeMixerChannel === channel.id
                        ? 'border-gold-500/20 bg-gold-500/5'
                        : 'border-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-0.5 shrink-0 w-[34px] justify-center">
                      <button
                        onClick={() => toggleMute(channel.id)}
                        className={`w-3.5 h-3.5 rounded text-[7px] font-black flex items-center justify-center border transition-all ${
                          channel.mute
                            ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                            : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border-white/5'
                        }`}
                        title="Mute Track"
                      >
                        M
                      </button>
                      <button
                        onClick={() => toggleSolo(channel.id)}
                        className={`w-3.5 h-3.5 rounded text-[7px] font-black flex items-center justify-center border transition-all ${
                          channel.solo
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/30 shadow-md shadow-amber-500/20'
                            : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border-white/5'
                        }`}
                        title="Solo Track"
                      >
                        S
                      </button>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 w-[68px] justify-between">
                      <div className="flex flex-col items-center group/pan" title={`Panoramique: ${channel.pan}`}>
                        <span className="text-[5px] text-zinc-500 font-extrabold group-hover/pan:text-purple-400 transition-colors uppercase leading-none mb-0.5">PAN</span>
                        <input
                          type="range"
                          min="-1"
                          max="1"
                          step="0.1"
                          value={channel.pan}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            setChannels(prev => prev.map(ch => ch.id === channel.id ? { ...ch, pan: val } : ch));
                          }}
                          className="w-6 accent-purple-500 h-0.5 bg-zinc-800 rounded cursor-pointer group-hover/pan:scale-y-110"
                        />
                      </div>
                      
                      <div className="flex flex-col items-center group/pitch" title={`Pitch Shift: ${channel.pitch} semitones`}>
                        <span className="text-[5px] text-zinc-500 font-extrabold group-hover/pitch:text-gold-400 transition-colors uppercase leading-none mb-0.5">PIT</span>
                        <input
                          type="range"
                          min="-12"
                          max="12"
                          step="1"
                          value={channel.pitch}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            setChannels(prev => prev.map(ch => ch.id === channel.id ? { ...ch, pitch: val } : ch));
                          }}
                          className="w-6 accent-gold-500 h-0.5 bg-zinc-800 rounded cursor-pointer group-hover/pitch:scale-y-110"
                        />
                      </div>
                    </div>

                    <div className="relative w-[76px] shrink-0">
                      <button
                        onClick={() => auditionChannel(channel)}
                        className={`w-full py-0.5 px-1 text-left rounded-md font-sans text-[8px] font-black truncate transition-all border flex items-center justify-between ${
                          activeDropdown === channel.id
                            ? 'bg-gold-500 text-obsidian border-gold-400 shadow-gold-glow'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-200 hover:bg-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <span>{channel.name}</span>
                        <span className="text-[6px] opacity-65">▼</span>
                      </button>

                      {activeDropdown === channel.id && (
                        <div className="absolute left-0 top-full mt-1 w-52 bg-zinc-950/98 border border-white/10 rounded-lg shadow-2xl z-50 py-1 backdrop-blur-md max-h-64 overflow-y-auto scrollbar-thin">
                          <div className="px-2.5 py-1 text-[8px] font-black text-zinc-500 tracking-wider border-b border-white/5 uppercase">
                            Sélectionner l'Instrument
                          </div>
                          
                          {['batterie', 'afro', 'latin', 'moderne'].map((cat) => (
                            <div key={cat} className="space-y-0.5 py-1 border-b border-white/5 last:border-b-0">
                              <span className="px-2.5 text-[8px] font-black text-gold-500 uppercase tracking-widest opacity-60 block">
                                {cat}
                              </span>
                              {Object.entries(SOUND_BANK)
                                .filter(([_, info]) => info.category === cat)
                                .map(([instId, inst]) => (
                                  <button
                                    key={instId}
                                    onClick={() => selectInstrument(channel.id, instId)}
                                    className={`w-full px-3 py-1 text-left text-[11px] transition-colors flex justify-between items-center ${
                                      channel.instrumentId === instId
                                        ? 'text-gold-400 bg-gold-400/5 font-extrabold'
                                        : 'text-zinc-300 hover:bg-white/5'
                                    }`}
                                  >
                                    <span>{inst.name}</span>
                                    <span className="text-[8px] bg-zinc-900 px-1 py-0.5 rounded text-zinc-500 font-mono font-bold uppercase">{inst.label}</span>
                                  </button>
                                ))}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="w-[44px] shrink-0 flex items-center justify-between">
                      {[
                        { type: 'delay', label: 'D', tooltip: 'Delay/Écho' },
                        { type: 'reverb', label: 'R', tooltip: 'Reverb/Espace' },
                        { type: 'distortion', label: 'X', tooltip: 'Distortion' },
                        { type: 'filter', label: 'F', tooltip: 'Filtre Lowpass' }
                      ].map((fx) => {
                        const active = channel.effects[fx.type as keyof typeof channel.effects];
                        return (
                          <button
                            key={fx.type}
                            onClick={() => toggleChannelFx(channel.id, fx.type as any)}
                            title={fx.tooltip}
                            className={`w-2 h-2 rounded-full text-[5px] font-extrabold flex items-center justify-center transition-all ${
                              active
                                ? 'bg-purple-600 text-white shadow-[0_0_6px_#a855f7]'
                                : 'bg-zinc-900 border border-zinc-800 text-zinc-500 hover:border-zinc-700'
                            }`}
                          >
                            {fx.label}
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex-1 flex gap-1.5 shrink-0 items-center justify-between">
                      {[0, 1, 2, 3].map((beatIdx) => (
                        <div key={beatIdx} className="flex-1 grid grid-cols-4 gap-0.5 sm:gap-1 bg-black/45 p-0.5 rounded-[4px] border border-white/5 shadow-inner">
                          {[0, 1, 2, 3].map((stepInBeat) => {
                            const stepIdx = beatIdx * 4 + stepInBeat;
                            const isActive = channel.patternSteps[selectedPattern]?.[stepIdx];
                            const isBeatGroupA = beatIdx % 2 === 0;
                            const isPlayhead = currentStep === stepIdx && isPlayingSequencer;

                            return (
                              <button
                                key={stepIdx}
                                onClick={() => {
                                  initAudio();
                                  setChannels(prev => prev.map(ch => {
                                    if (ch.id === channel.id) {
                                      const stepsCopy = [...ch.patternSteps[selectedPattern]];
                                      stepsCopy[stepIdx] = !isActive;
                                      return {
                                        ...ch,
                                        patternSteps: {
                                          ...ch.patternSteps,
                                          [selectedPattern]: stepsCopy
                                        }
                                      };
                                    }
                                    return ch;
                                  }));
                                }}
                                className={`aspect-square max-h-4 sm:max-h-4.5 w-full rounded-[2.5px] border-[0.5px] flex items-center justify-center transition-all ${
                                  isActive
                                    ? isBeatGroupA
                                      ? 'bg-gradient-to-br from-gold-500 to-gold-400 text-obsidian border-gold-300 shadow-[0_0_8px_rgba(212,175,55,0.6)] scale-[0.91]'
                                      : 'bg-gradient-to-br from-purple-500 to-indigo-500 text-white border-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.6)] scale-[0.91]'
                                    : isPlayhead
                                    ? 'bg-white border-white shadow-[0_0_12px_rgba(255,255,255,0.9)] scale-105'
                                    : isBeatGroupA
                                    ? 'bg-zinc-900/60 border-zinc-800/40 text-gold-500/10 hover:bg-zinc-800 hover:border-zinc-750'
                                    : 'bg-zinc-950/60 border-zinc-900/40 text-purple-400/10 hover:bg-zinc-900 hover:border-zinc-850'
                                }`}
                                aria-label={`Piste ${channel.name} Pas ${stepIdx + 1}`}
                              >
                                {isPlayhead && !isActive && (
                                  <div className="w-1 h-1 rounded-full bg-white animate-ping" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      ))}
                    </div>

                    <div className="w-10 shrink-0 flex items-center justify-between gap-0.5">
                      <button
                        onClick={() => duplicateSteps(channel.id)}
                        className="text-[5px] bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 font-black px-0.5 rounded transition-colors uppercase py-0.5 shrink-0"
                        title="Dupliquer pas 1-8 sur 9-16"
                      >
                        2X
                      </button>
                      <button
                        onClick={() => shiftSteps(channel.id, 'right')}
                        className="text-[5px] bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 font-black px-0.5 rounded transition-colors uppercase py-0.5 shrink-0"
                        title="Décaler pas"
                      >
                        &gt;
                      </button>
                      <button
                        onClick={() => deleteChannel(channel.id)}
                        className="w-3 h-3 rounded text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 flex items-center justify-center transition-colors shrink-0"
                        title="Supprimer la Piste"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    </div>

                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-between border-t border-white/5 pt-4">
                <div className="flex gap-2">
                  <button
                    onClick={addChannel}
                    className="px-3 py-1.5 rounded-lg bg-gold-500 hover:bg-gold-400 text-obsidian font-bold text-[10px] sm:text-xs transition-all flex items-center gap-1.5 shadow-gold-glow"
                  >
                    <Plus className="w-3.5 h-3.5" /> Ajouter Piste
                  </button>
                  <button
                    onClick={clearSequence}
                    className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-[10px] sm:text-xs border border-white/5 transition-all flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Vider la Séquence
                  </button>
                </div>

                <div className="flex items-center gap-4 mt-4 sm:mt-0">
                  <button
                    onClick={() => setIsMixerExpanded(prev => !prev)}
                    className={`text-[10px] sm:text-xs font-black uppercase px-3.5 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${
                      isMixerExpanded
                        ? 'bg-gold-500/10 border-gold-500/30 text-gold-400 shadow-md'
                        : 'bg-zinc-900 border-zinc-850 text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    {isMixerExpanded ? 'Masquer Mixer' : 'Afficher Mixer'}
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Table de Mixage FL Studio Style */}
          <AnimatePresence>
            {isMixerExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                className="border-t border-white/5 mt-6 pt-6 overflow-hidden"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Section Console Mixage Faders (Col 9) */}
                  <div className="lg:col-span-9 bg-zinc-950/80 p-4 rounded-xl border border-white/5 shadow-inner">
                    <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
                      <span className="text-[10px] font-black text-zinc-400 tracking-widest uppercase flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5 text-gold-400" /> CONSOLE DE MIXAGE
                      </span>
                      <span className="text-[8px] sm:text-[9px] text-zinc-500 font-medium">Double-cliquez pour réinitialiser les volumes</span>
                    </div>

                    {/* Faders Horizontal Container */}
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gold-500/20 scrollbar-track-transparent min-h-[180px] items-stretch">
                      
                      {/* Master Track */}
                      <div
                        onClick={() => setActiveMixerChannel('master')}
                        className={`flex flex-col items-center justify-between p-2 w-[70px] rounded-lg border transition-all cursor-pointer shrink-0 ${
                          activeMixerChannel === 'master'
                            ? 'bg-gold-500/5 border-gold-400/30 ring-1 ring-gold-400/20'
                            : 'bg-zinc-900/30 border-white/5 hover:border-white/10'
                        }`}
                      >
                        <span className="text-[9px] font-black text-gold-400 tracking-wider text-center">MASTER</span>
                        
                        {/* Meter & Slider Row */}
                        <div className="flex items-stretch justify-center gap-2 h-24 my-2 relative w-full">
                          {/* Level Meter Gauge */}
                          <div className="w-1.5 bg-zinc-950 rounded overflow-hidden relative h-full">
                            <div
                              id="mixer-meter-fill-master"
                              className="absolute bottom-0 left-0 w-full bg-gold-500 transition-all duration-75"
                              style={{ height: '0%' }}
                            />
                          </div>

                          {/* Vertical Range Input */}
                          <div className="relative flex items-center justify-center w-4 h-full">
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={volume}
                              onChange={(e) => setVolume(parseInt(e.target.value))}
                              style={{ transform: 'rotate(-90deg)', transformOrigin: 'center', width: '96px' }}
                              className="absolute accent-gold-500 cursor-pointer h-1 rounded bg-zinc-950 w-24"
                              aria-label="Volume Master"
                            />
                          </div>
                        </div>

                        {/* Volume Text representation */}
                        <span className="text-[9px] font-mono text-zinc-400">{volume}%</span>
                      </div>

                      <div className="w-[1px] bg-white/5 shrink-0 self-stretch my-2" />

                      {/* Individual Channels Tracks */}
                      {channels.map((channel) => {
                        const isActive = activeMixerChannel === channel.id;
                        return (
                          <div
                            key={channel.id}
                            onClick={() => setActiveMixerChannel(channel.id)}
                            className={`flex flex-col items-center justify-between p-2 w-[70px] rounded-lg border transition-all cursor-pointer shrink-0 ${
                              isActive
                                ? 'bg-gold-500/5 border-gold-400/30 ring-1 ring-gold-400/20'
                                : 'bg-zinc-900/30 border-white/5 hover:border-white/10'
                            }`}
                          >
                            <span className="text-[9px] font-extrabold text-zinc-300 truncate w-full text-center uppercase" title={channel.name}>
                              {channel.name}
                            </span>

                            {/* Meter & Slider Row */}
                            <div className="flex items-stretch justify-center gap-2 h-24 my-2 relative w-full">
                              {/* Level Meter Gauge */}
                              <div className="w-1.5 bg-zinc-950 rounded overflow-hidden relative h-full">
                                <div
                                  id={`mixer-meter-fill-${channel.id}`}
                                  className="absolute bottom-0 left-0 w-full bg-gold-400 transition-all duration-75"
                                  style={{ height: '0%' }}
                                />
                              </div>

                              {/* Vertical Range Input */}
                              <div className="relative flex items-center justify-center w-4 h-full">
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  value={channel.volume}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    setChannels(prev => prev.map(ch => ch.id === channel.id ? { ...ch, volume: val } : ch));
                                  }}
                                  style={{ transform: 'rotate(-90deg)', transformOrigin: 'center', width: '96px' }}
                                  className="absolute accent-purple-500 cursor-pointer h-1 rounded bg-zinc-950 w-24"
                                  aria-label={`Volume ${channel.name}`}
                                />
                              </div>
                            </div>

                            {/* Volume Text representation */}
                            <span className="text-[9px] font-mono text-zinc-400">{channel.volume}%</span>
                          </div>
                        );
                      })}

                    </div>
                  </div>

                  {/* Section Effects Rack (Col 3) */}
                  <div className="lg:col-span-3 bg-zinc-950/80 p-4 rounded-xl border border-white/5 shadow-inner flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
                        <span className="text-[10px] font-black text-zinc-400 tracking-widest uppercase flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-purple-400" /> RACK EFFETS
                        </span>
                        <span className="text-[8px] bg-purple-500/10 border border-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded font-bold uppercase font-mono">
                          {activeMixerChannel === 'master' ? 'MASTER' : channels.find(c => c.id === activeMixerChannel)?.name || 'INCONNU'}
                        </span>
                      </div>

                      {activeMixerChannel === 'master' ? (
                        <div className="text-center py-8 text-zinc-500 space-y-2">
                          <Info className="w-8 h-8 text-zinc-600 mx-auto" />
                          <p className="text-[10px] leading-relaxed">
                            Les effets individuels sont configurables par piste de canal.<br />
                            Cliquez sur une piste ci-gauche pour éditer ses effets.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3.5">
                          {[
                            { type: 'delay', name: 'DELAY / ECHO', label: 'Slot 1', desc: 'Crée un écho synchronisé' },
                            { type: 'reverb', name: 'REVERB / COMB', label: 'Slot 2', desc: 'Donne de l\'espace et de l\'ampleur' },
                            { type: 'distortion', name: 'DISTORTION', label: 'Slot 3', desc: 'Sature et réchauffe le son' },
                            { type: 'filter', name: 'LOWPASS FILTER', label: 'Slot 4', desc: 'Filtre les fréquences aiguës' }
                          ].map((slot) => {
                            const channelObj = channels.find(c => c.id === activeMixerChannel);
                            const active = channelObj ? channelObj.effects[slot.type as keyof typeof channelObj.effects] : false;

                            return (
                              <div
                                key={slot.type}
                                className={`p-2.5 rounded-lg border transition-all flex items-center justify-between ${
                                  active
                                    ? 'bg-purple-900/10 border-purple-500/20'
                                    : 'bg-zinc-900/30 border-white/5 hover:bg-zinc-900/50'
                                }`}
                              >
                                <div className="space-y-0.5">
                                  <span className="text-[8px] font-mono text-zinc-500 font-bold block">{slot.label}</span>
                                  <span className={`text-[10px] font-black ${active ? 'text-purple-400' : 'text-zinc-400'}`}>
                                    {slot.name}
                                  </span>
                                  <span className="text-[8px] text-zinc-500 block leading-tight">{slot.desc}</span>
                                </div>

                                <button
                                  onClick={() => toggleChannelFx(activeMixerChannel, slot.type as any)}
                                  className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                                    active
                                      ? 'bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-600/30 animate-pulse'
                                      : 'bg-zinc-950 border-zinc-800 text-zinc-600 hover:text-zinc-400'
                                  }`}
                                  aria-label={`Activer ${slot.name}`}
                                >
                                  <Power className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {activeMixerChannel !== 'master' && (
                      <div className="mt-4 border-t border-white/5 pt-3.5 text-[8px] text-zinc-500 leading-tight">
                        * Les effets FL Studio utilisent la synthèse de Web Audio API en temps réel pour un rendu sans latence.
                      </div>
                    )}
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>

            </div>
          </div>

          {!isLoggedIn && (
            <div className="absolute inset-0 z-30 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="w-full max-w-lg glass-card bg-obsidian-card/85 border border-gold-500/30 p-8 rounded-2xl text-center space-y-6 shadow-[0_0_50px_rgba(212,175,55,0.15)] backdrop-blur-md relative"
              >
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-zinc-950 border border-gold-500/30 rounded-full flex items-center justify-center text-gold-400 shadow-gold-glow animate-pulse">
                  <Music className="w-10 h-10 animate-bounce-subtle" />
                </div>
                
                <div className="pt-6 space-y-2">
                  <span className="inline-flex items-center gap-1 bg-gold-400/10 border border-gold-400/20 text-gold-400 font-extrabold text-[10px] px-2.5 py-0.5 rounded uppercase tracking-wider">
                    Accès Membres Privés
                  </span>
                  <h3 className="text-white font-extrabold text-xl sm:text-2xl tracking-tight">
                    Débloquez le Studio Virtuel DMA
                  </h3>
                  <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
                    Rejoignez l'élite des batteurs. Programmez vos Gospel Chops, grooves Afro Fusion et compings Jazz à l'aide de nos synthétiseurs Web Audio de pointe et notre console d'effets professionnelle.
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-left bg-zinc-950/60 p-4 rounded-xl border border-white/5 text-[11px] text-zinc-300 font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="text-gold-400">🥁</span> Séquenceur 16 Pas complet
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gold-400">🎛️</span> Multi-pistes Audio &amp; Mixer
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gold-400">🎚️</span> Effets Reverb/Delay Pro
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gold-400">⚡</span> Synthétiseurs de Percussions
                  </div>
                </div>
                
                <div className="flex flex-col gap-3 pt-2">
                  <Link
                    to="/register"
                    className="btn-gold py-3 text-xs font-bold uppercase tracking-wider shadow-gold-glow-intense flex items-center justify-center gap-2 text-obsidian bg-gradient-to-r from-gold-600 to-gold-400 hover:from-gold-500 hover:to-gold-300 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 fill-obsidian shrink-0 animate-spin-slow" />
                    Créer un compte et débloquer
                  </Link>
                  <Link
                    to="/login"
                    className="text-zinc-400 hover:text-white text-xs font-bold transition-all underline"
                  >
                    Déjà membre ? Se connecter
                  </Link>
                </div>
              </motion.div>
            </div>
          )}

        </div>
      </div>
    </section>
  );
};
