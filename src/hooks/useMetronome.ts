import { useState, useEffect, useRef, useCallback } from 'react';

export type SoundStyle = 'digital' | 'woodblock' | 'stick' | 'cowbell';
export type RhythmPreset = 'standard' | 'shuffle' | 'clave32' | 'clave23' | 'afrobeats';

export interface UseMetronomeOptions {
  onSetMetronomeCallback?: (bpm: number, subdivision: number, title: string) => void;
  showToast?: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export const useMetronome = (options?: UseMetronomeOptions) => {
  const { onSetMetronomeCallback, showToast } = options || {};

  const [bpm, setBpm] = useState(120);
  const [metronomePlaying, setMetronomePlaying] = useState(false);
  const [beatsPerMeasure, setBeatsPerMeasure] = useState(4);
  const [subdivision, setSubdivision] = useState(1);
  const [soundStyle, setSoundStyle] = useState<SoundStyle>('woodblock');
  const [accentFirstBeat, setAccentFirstBeat] = useState(true);

  // Speed Trainer
  const [speedTrainer, setSpeedTrainer] = useState(false);
  const [speedTrainerStep, setSpeedTrainerStep] = useState(2);
  const [speedTrainerInterval, setSpeedTrainerInterval] = useState(4); // every 4 measures
  const [measuresCount, setMeasuresCount] = useState(0);

  // Gap Click (Silent Measures)
  const [gapClick, setGapClick] = useState(false);
  const [gapClickPlay, setGapClickPlay] = useState(3);
  const [gapClickMute, setGapClickMute] = useState(1);
  const [isMutedMeasure, setIsMutedMeasure] = useState(false);

  // Visuals
  const [activeBeatVisual, setActiveBeatVisual] = useState(-1);
  const [activeSubdivisionVisual, setActiveSubdivisionVisual] = useState(-1);

  // Rhythm Presets
  const [rhythmPreset, setRhythmPreset] = useState<RhythmPreset>('standard');

  const [tapActive, setTapActive] = useState(false);

  // Web Audio Context & Scheduling Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const timerIDRef = useRef<number | null>(null);
  const nextNoteTimeRef = useRef(0.0);
  const currentBeatRef = useRef(0);
  const currentSubdivisionBeatRef = useRef(0);
  const measuresPlayedRef = useRef(0);
  const tapTimesRef = useRef<number[]>([]);
  const lastTapRef = useRef<number>(0);

  const lookahead = 25.0; // ms
  const scheduleAheadTime = 0.1; // seconds

  // Keep refs synchronized for the async scheduling thread to access the latest state
  const bpmRef = useRef(bpm);
  const beatsPerMeasureRef = useRef(beatsPerMeasure);
  const subdivisionRef = useRef(subdivision);
  const soundStyleRef = useRef(soundStyle);
  const accentFirstBeatRef = useRef(accentFirstBeat);
  const speedTrainerRef = useRef(speedTrainer);
  const speedTrainerStepRef = useRef(speedTrainerStep);
  const speedTrainerIntervalRef = useRef(speedTrainerInterval);
  const metronomePlayingRef = useRef(metronomePlaying);
  const gapClickRef = useRef(gapClick);
  const gapClickPlayRef = useRef(gapClickPlay);
  const gapClickMuteRef = useRef(gapClickMute);
  const rhythmPresetRef = useRef(rhythmPreset);

  useEffect(() => { bpmRef.current = bpm; }, [bpm]);
  useEffect(() => { beatsPerMeasureRef.current = beatsPerMeasure; }, [beatsPerMeasure]);
  useEffect(() => { subdivisionRef.current = subdivision; }, [subdivision]);
  useEffect(() => { soundStyleRef.current = soundStyle; }, [soundStyle]);
  useEffect(() => { accentFirstBeatRef.current = accentFirstBeat; }, [accentFirstBeat]);
  useEffect(() => { speedTrainerRef.current = speedTrainer; }, [speedTrainer]);
  useEffect(() => { speedTrainerStepRef.current = speedTrainerStep; }, [speedTrainerStep]);
  useEffect(() => { speedTrainerIntervalRef.current = speedTrainerInterval; }, [speedTrainerInterval]);
  useEffect(() => { metronomePlayingRef.current = metronomePlaying; }, [metronomePlaying]);
  useEffect(() => { gapClickRef.current = gapClick; }, [gapClick]);
  useEffect(() => { gapClickPlayRef.current = gapClickPlay; }, [gapClickPlay]);
  useEffect(() => { gapClickMuteRef.current = gapClickMute; }, [gapClickMute]);
  useEffect(() => { rhythmPresetRef.current = rhythmPreset; }, [rhythmPreset]);

  // Synthesis engines for professional acoustic timbres
  const playClick = useCallback((time: number, isAccent: boolean, isMainBeat: boolean) => {
    const audioCtx = audioContextRef.current;
    if (!audioCtx) return;

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    const style = soundStyleRef.current;

    if (style === 'digital') {
      osc.type = 'sine';
      if (isAccent && accentFirstBeatRef.current) {
        osc.frequency.setValueAtTime(1200, time);
        gainNode.gain.setValueAtTime(0.8, time);
      } else if (isMainBeat) {
        osc.frequency.setValueAtTime(800, time);
        gainNode.gain.setValueAtTime(0.55, time);
      } else {
        osc.frequency.setValueAtTime(600, time);
        gainNode.gain.setValueAtTime(0.25, time);
      }
      gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
      osc.start(time);
      osc.stop(time + 0.06);
    } 
    else if (style === 'woodblock') {
      osc.type = 'triangle';
      if (isAccent && accentFirstBeatRef.current) {
        osc.frequency.setValueAtTime(1400, time);
        osc.frequency.exponentialRampToValueAtTime(1000, time + 0.03);
        gainNode.gain.setValueAtTime(0.8, time);
      } else if (isMainBeat) {
        osc.frequency.setValueAtTime(1000, time);
        osc.frequency.exponentialRampToValueAtTime(700, time + 0.03);
        gainNode.gain.setValueAtTime(0.5, time);
      } else {
        osc.frequency.setValueAtTime(800, time);
        osc.frequency.exponentialRampToValueAtTime(550, time + 0.03);
        gainNode.gain.setValueAtTime(0.2, time);
      }
      gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.045);
      osc.start(time);
      osc.stop(time + 0.05);
    }
    else if (style === 'stick') {
      osc.type = 'triangle';
      if (isAccent && accentFirstBeatRef.current) {
        osc.frequency.setValueAtTime(2800, time);
        gainNode.gain.setValueAtTime(0.8, time);
      } else if (isMainBeat) {
        osc.frequency.setValueAtTime(2000, time);
        gainNode.gain.setValueAtTime(0.5, time);
      } else {
        osc.frequency.setValueAtTime(1600, time);
        gainNode.gain.setValueAtTime(0.2, time);
      }
      gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.015);
      osc.start(time);
      osc.stop(time + 0.02);
    }
    else if (style === 'cowbell') {
      const osc2 = audioCtx.createOscillator();
      osc.type = 'square';
      osc2.type = 'square';

      const f1 = isAccent && accentFirstBeatRef.current ? 840 : isMainBeat ? 800 : 760;
      const f2 = isAccent && accentFirstBeatRef.current ? 565 : isMainBeat ? 540 : 515;

      osc.frequency.setValueAtTime(f1, time);
      osc2.frequency.setValueAtTime(f2, time);

      const filter = audioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(isAccent && accentFirstBeatRef.current ? 1000 : 800, time);
      filter.Q.setValueAtTime(1.5, time);

      osc.connect(filter);
      osc2.connect(filter);
      filter.connect(gainNode);

      if (isAccent && accentFirstBeatRef.current) {
        gainNode.gain.setValueAtTime(0.7, time);
      } else if (isMainBeat) {
        gainNode.gain.setValueAtTime(0.4, time);
      } else {
        gainNode.gain.setValueAtTime(0.15, time);
      }
      gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.08);

      osc.start(time);
      osc.stop(time + 0.1);
      osc2.start(time);
      osc2.stop(time + 0.1);
    }
  }, []);

  // Scheduling scheduler engine
  const scheduler = useCallback(() => {
    const audioCtx = audioContextRef.current;
    if (!audioCtx) return;

    while (nextNoteTimeRef.current < audioCtx.currentTime + scheduleAheadTime) {
      const isMainBeat = currentSubdivisionBeatRef.current === 0;
      const isFirstBeat = isMainBeat && currentBeatRef.current === 0;

      const stepInMeasure = currentBeatRef.current * subdivisionRef.current + currentSubdivisionBeatRef.current;

      // Rhythm Presets logic
      let playThisStep = true;
      const activePreset = rhythmPresetRef.current;

      if (activePreset === 'shuffle') {
        if (subdivisionRef.current === 3) {
          playThisStep = currentSubdivisionBeatRef.current !== 1;
        }
      } else if (activePreset === 'clave32') {
        if (beatsPerMeasureRef.current === 4 && subdivisionRef.current === 4) {
          playThisStep = [0, 3, 6, 10, 12].includes(stepInMeasure);
        }
      } else if (activePreset === 'clave23') {
        if (beatsPerMeasureRef.current === 4 && subdivisionRef.current === 4) {
          playThisStep = [2, 5, 8, 11, 14].includes(stepInMeasure);
        }
      } else if (activePreset === 'afrobeats') {
        if (beatsPerMeasureRef.current === 4 && subdivisionRef.current === 4) {
          playThisStep = [0, 3, 6, 8, 11, 14].includes(stepInMeasure);
        }
      }

      // Gap Click silent measure muting logic
      let shouldMute = false;
      if (gapClickRef.current) {
        const totalCycle = gapClickPlayRef.current + gapClickMuteRef.current;
        const currentCycleMeasure = measuresPlayedRef.current % totalCycle;
        if (currentCycleMeasure >= gapClickPlayRef.current) {
          shouldMute = true;
        }
      }

      if (!shouldMute && playThisStep) {
        playClick(nextNoteTimeRef.current, isFirstBeat, isMainBeat);
      }

      const timeToPlay = nextNoteTimeRef.current - audioCtx.currentTime;
      const beatIndex = currentBeatRef.current;
      const subIndex = currentSubdivisionBeatRef.current;
      const currentMuteState = shouldMute;

      setTimeout(() => {
        if (metronomePlayingRef.current) {
          setActiveBeatVisual(beatIndex);
          setActiveSubdivisionVisual(subIndex);
          setIsMutedMeasure(currentMuteState);
        }
      }, Math.max(0, timeToPlay * 1000));

      const secondsPerSubdivision = (60.0 / bpmRef.current) / subdivisionRef.current;
      nextNoteTimeRef.current += secondsPerSubdivision;

      currentSubdivisionBeatRef.current++;
      if (currentSubdivisionBeatRef.current >= subdivisionRef.current) {
        currentSubdivisionBeatRef.current = 0;
        currentBeatRef.current++;
        if (currentBeatRef.current >= beatsPerMeasureRef.current) {
          currentBeatRef.current = 0;

          measuresPlayedRef.current++;
          const curMeasures = measuresPlayedRef.current;
          setTimeout(() => setMeasuresCount(curMeasures), 0);

          if (
            speedTrainerRef.current && 
            speedTrainerIntervalRef.current > 0 && 
            curMeasures % speedTrainerIntervalRef.current === 0
          ) {
            const nextBpm = Math.min(240, bpmRef.current + speedTrainerStepRef.current);
            setTimeout(() => {
              setBpm(nextBpm);
              if (showToast) {
                showToast(`Speed trainer : tempo accéléré à ${nextBpm} BPM ! ⚡`, "info");
              }
            }, 0);
          }
        }
      }
    }
    timerIDRef.current = window.setTimeout(() => scheduler(), lookahead);
  }, [playClick, showToast]);

  const toggleMetronome = useCallback(() => {
    if (metronomePlayingRef.current) {
      if (timerIDRef.current) {
        clearTimeout(timerIDRef.current);
        timerIDRef.current = null;
      }
      setMetronomePlaying(false);
      setActiveBeatVisual(-1);
      setActiveSubdivisionVisual(-1);
      setIsMutedMeasure(false);
    } else {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const audioCtx = audioContextRef.current;
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      setMetronomePlaying(true);
      currentBeatRef.current = 0;
      currentSubdivisionBeatRef.current = 0;
      measuresPlayedRef.current = 0;
      setMeasuresCount(0);
      setIsMutedMeasure(false);
      nextNoteTimeRef.current = audioCtx.currentTime + 0.05;

      scheduler();
    }
  }, [scheduler]);

  // Tap Tempo calculation
  const handleTapTempo = useCallback(() => {
    const now = Date.now();
    setTapActive(true);
    setTimeout(() => setTapActive(false), 120);

    if (lastTapRef.current === 0) {
      lastTapRef.current = now;
      return;
    }

    const diff = now - lastTapRef.current;
    lastTapRef.current = now;

    const times = [...tapTimesRef.current, diff].slice(-4);
    tapTimesRef.current = times;

    const avg = times.reduce((sum, t) => sum + t, 0) / times.length;
    const computedBpm = Math.round(60000 / avg);

    if (computedBpm >= 40 && computedBpm <= 240) {
      setBpm(computedBpm);
      if (showToast) {
        showToast(`Tempo détecté : ${computedBpm} BPM 🥁`, "info");
      }
    }
  }, [showToast]);

  // Global event listener for set-metronome (connecting Coach Widget everywhere!)
  useEffect(() => {
    const handleSetMetronomeEvent = (e: Event) => {
      const customEvt = e as CustomEvent<{ bpm: number; subdivision: number; title: string }>;
      const { bpm: newBpm, subdivision: newSub, title } = customEvt.detail;

      setBpm(newBpm);
      setSubdivision(newSub);
      setRhythmPreset('standard');

      if (onSetMetronomeCallback) {
        onSetMetronomeCallback(newBpm, newSub, title);
      }
    };

    window.addEventListener('dma-set-metronome', handleSetMetronomeEvent);
    return () => {
      window.removeEventListener('dma-set-metronome', handleSetMetronomeEvent);
    };
  }, [onSetMetronomeCallback]);

  // Clean up AudioContext and scheduling timers on unmount
  useEffect(() => {
    return () => {
      if (timerIDRef.current) {
        clearTimeout(timerIDRef.current);
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  return {
    bpm,
    setBpm,
    metronomePlaying,
    toggleMetronome,
    beatsPerMeasure,
    setBeatsPerMeasure,
    subdivision,
    setSubdivision,
    soundStyle,
    setSoundStyle,
    accentFirstBeat,
    setAccentFirstBeat,
    speedTrainer,
    setSpeedTrainer,
    speedTrainerStep,
    setSpeedTrainerStep,
    speedTrainerInterval,
    setSpeedTrainerInterval,
    measuresCount,
    gapClick,
    setGapClick,
    gapClickPlay,
    setGapClickPlay,
    gapClickMute,
    setGapClickMute,
    isMutedMeasure,
    activeBeatVisual,
    activeSubdivisionVisual,
    rhythmPreset,
    setRhythmPreset,
    handleTapTempo,
    tapActive
  };
};
