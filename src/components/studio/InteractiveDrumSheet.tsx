import React from 'react';
import { Music, FileText } from 'lucide-react';

interface InteractiveDrumSheetProps {
  tablature: string;
  metronomePlaying: boolean;
  activeBeatVisual: number;
  activeSubdivisionVisual: number;
  beatsPerMeasure: number;
  subdivision: number;
}

export interface DrumTrack {
  name: string;
  steps: string[];
}

/**
 * Parses monospace drum tabs into structured tracks
 */
export const parseTablature = (tab: string): DrumTrack[] | null => {
  const lines = tab.split('\n');
  const tracks: DrumTrack[] = [];
  
  for (const line of lines) {
    if (!line.includes('|')) continue;
    
    // Split by the first pipe character
    const pipeIndex = line.indexOf('|');
    const lastPipeIndex = line.lastIndexOf('|');
    if (pipeIndex === lastPipeIndex) continue; // Needs at least two pipes
    
    const name = line.substring(0, pipeIndex).trim();
    // Validate that the track name is short and fits drum notations
    if (!name || name.length > 8 || name.toLowerCase().includes('tempo') || name.toLowerCase().includes('légende')) continue;
    
    const stepsStr = line.substring(pipeIndex + 1, lastPipeIndex);
    // Split steps by spaces, and filter empty values
    const stepsRaw = stepsStr.split(' ');
    const steps = stepsRaw
      .map(s => s.trim())
      .filter(s => s !== ''); // Filter out empty strings
      
    if (steps.length > 0) {
      tracks.push({ name, steps });
    }
  }
  
  if (tracks.length < 2) return null; // Not a standard multi-track drum tab
  
  // Normalize track lengths
  const maxLength = Math.max(...tracks.map(t => t.steps.length));
  for (const track of tracks) {
    while (track.steps.length < maxLength) {
      track.steps.push('-');
    }
  }
  
  return tracks;
};

const staffLinesY = [30, 45, 60, 75, 90];

/**
 * Maps drum track name to vertical Y coordinate on a standard staff
 */
const getYPosition = (trackName: string): number => {
  const name = trackName.toUpperCase();
  if (name.includes('H') || name.includes('HH') || name.includes('CH')) return staffLinesY[0]; // Hi-hat on the top line
  if (name.includes('C') || name.includes('CR') || name.includes('CY')) return staffLinesY[0] - 15; // Crash above the top line
  if (name.includes('S') || name.includes('SD') || name.includes('SN')) return staffLinesY[2]; // Snare in the middle space (line 2)
  if (name.includes('T') || name.includes('T1') || name.includes('T2')) return staffLinesY[1]; // High Tom
  if (name.includes('F') || name.includes('FT')) return staffLinesY[3]; // Floor Tom
  if (name.includes('B') || name.includes('BD') || name.includes('K')) return staffLinesY[4]; // Bass Drum on the bottom line
  return staffLinesY[2];
};

export const InteractiveDrumSheet: React.FC<InteractiveDrumSheetProps> = ({
  tablature,
  metronomePlaying,
  activeBeatVisual,
  activeSubdivisionVisual,
  beatsPerMeasure,
  subdivision,
}) => {
  const tracks = parseTablature(tablature);

  if (!tracks) {
    return (
      <div className="flex flex-col items-center justify-center p-8 rounded-3xl bg-zinc-900/50 border border-white/5 text-zinc-400">
        <Music className="w-8 h-8 mb-2 text-zinc-600" />
        <span className="text-xs">Aucune tablature interactive disponible pour cette leçon.</span>
      </div>
    );
  }

  const stepsCount = tracks[0].steps.length;
  const marginLeft = 60;
  const marginRight = 20;
  const stepWidth = 35;
  const width = marginLeft + stepsCount * stepWidth + marginRight;
  const height = 120;
  const stepsPerMeasure = beatsPerMeasure * subdivision;
  
  // Calculate current step (0-indexed)
  const currentStep = activeBeatVisual * subdivision + activeSubdivisionVisual;

  return (
    <div className="p-6 rounded-3xl bg-zinc-950/40 border border-white/5 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Music className="w-5 h-5 text-gold-400" />
          <h3 className="text-sm font-bold text-white tracking-wide">Tablature Interactive</h3>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-white/5">
          <FileText className="w-3.5 h-3.5 text-zinc-500" />
          <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Partition SVG</span>
        </div>
      </div>

      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent pb-2">
        <svg width={width} height={height} className="mx-auto">
          {/* Render staff lines */}
          {staffLinesY.map((y, idx) => (
            <line
              key={idx}
              x1={marginLeft}
              y1={y}
              x2={width - marginRight}
              y2={y}
              stroke="rgba(255, 255, 255, 0.15)"
              strokeWidth="1"
            />
          ))}

          {/* Render measure bar lines */}
          {Array.from({ length: Math.floor(stepsCount / stepsPerMeasure) + 1 }).map((_, idx) => {
            const x = marginLeft + idx * stepsPerMeasure * stepWidth;
            return (
              <line
                key={idx}
                x1={x}
                y1={staffLinesY[0]}
                x2={x}
                y2={staffLinesY[4]}
                stroke="rgba(255, 255, 255, 0.3)"
                strokeWidth={idx === 0 || idx === Math.floor(stepsCount / stepsPerMeasure) ? 2 : 1}
              />
            );
          })}

          {/* Render tracks (instrument labels and notes) */}
          {tracks.map((track) => {
            const y = getYPosition(track.name);
            return (
              <g key={track.name}>
                {/* Instrument label */}
                <text
                  x={marginLeft - 15}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="12"
                  fontWeight="bold"
                  fill="#A1A1AA"
                  className="font-mono"
                >
                  {track.name}
                </text>

                {/* Note heads */}
                {track.steps.map((step, stepIdx) => {
                  const x = marginLeft + stepIdx * stepWidth + stepWidth / 2;
                  
                  if (step === '-') return null;

                  if (step.toLowerCase() === 'x') {
                    // Draw X notehead
                    return (
                      <g key={stepIdx}>
                        <line x1={x - 4} y1={y - 4} x2={x + 4} y2={y + 4} stroke="#D4AF37" strokeWidth="2" />
                        <line x1={x - 4} y1={y + 4} x2={x + 4} y2={y - 4} stroke="#D4AF37" strokeWidth="2" />
                      </g>
                    );
                  } else if (step === 'o') {
                    // Draw small hollow gray circle for ghost notes
                    return (
                      <circle
                        key={stepIdx}
                        cx={x}
                        cy={y}
                        r="4"
                        fill="none"
                        stroke="#71717A"
                        strokeWidth="1.5"
                      />
                    );
                  } else if (step === '(x)') {
                    // Rimclick
                    return (
                      <text
                        key={stepIdx}
                        x={x}
                        y={y + 3.5}
                        textAnchor="middle"
                        fontSize="9"
                        fill="#D4AF37"
                        className="font-bold font-mono"
                      >
                        (x)
                      </text>
                    );
                  } else {
                    // Regular drum hit (O or any other non-silent value)
                    return (
                      <circle
                        key={stepIdx}
                        cx={x}
                        cy={y}
                        r="5.5"
                        fill="#D4AF37"
                      />
                    );
                  }
                })}
              </g>
            );
          })}

          {/* Render playhead cursor */}
          {metronomePlaying && activeBeatVisual >= 0 && (
            <g>
              <rect
                x={marginLeft + currentStep * stepWidth}
                y={staffLinesY[0] - 15}
                width={stepWidth}
                height={staffLinesY[4] - staffLinesY[0] + 30}
                fill="rgba(212, 175, 55, 0.08)"
                className="pointer-events-none"
              />
              <line
                x1={marginLeft + currentStep * stepWidth + stepWidth / 2}
                y1={staffLinesY[0] - 18}
                x2={marginLeft + currentStep * stepWidth + stepWidth / 2}
                y2={staffLinesY[4] + 18}
                stroke="#FFFFFF"
                strokeWidth={2}
                className="pointer-events-none"
              />
            </g>
          )}
        </svg>
      </div>

      {/* Guide details */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2 text-[10px] font-medium text-zinc-500">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded bg-zinc-950 flex items-center justify-center font-mono text-gold-400 text-[10px] font-bold border border-white/5">X</span>
          <span>Hi-Hat (Charleston) / Cymbales</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-gold-400 flex items-center justify-center font-mono text-obsidian text-[10px] font-bold"></span>
          <span>Snare (Caisse Claire) / Grosse Caisse</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded bg-zinc-950 flex items-center justify-center font-mono text-zinc-500 text-[10px] font-bold border border-white/5">o</span>
          <span>Ghost Note (Frappe légère)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded bg-zinc-950 flex items-center justify-center font-mono text-gold-400 text-[10px] font-bold border border-white/5">(x)</span>
          <span>Rimclick (Frappe sur cercle)</span>
        </div>
      </div>
    </div>
  );
};

export default InteractiveDrumSheet;
