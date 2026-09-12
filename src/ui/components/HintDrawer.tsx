import React from 'react';
import { Lightbulb, ChevronRight } from 'lucide-react';
import { Hint } from '../../domain/model/task/Hint.js';
import { MathView } from '../MathView.js';

interface HintDrawerProps {
  hints: Hint[];
  currentHintLevel: number;
  onRequestNextHint: () => void;
}

export const HintDrawer: React.FC<HintDrawerProps> = ({
  hints,
  currentHintLevel,
  onRequestNextHint,
}) => {
  const visibleHints = hints.slice(0, currentHintLevel);
  const hasMoreHints = currentHintLevel < hints.length;

  return (
    <div className="rounded-xl bg-slate-800/80 border border-amber-500/30 p-5 mt-4 text-slate-200">
      <div className="flex items-center justify-between mb-3 border-b border-slate-700/60 pb-3">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-base">
          <Lightbulb className="w-5 h-5 text-amber-400 fill-amber-400/20" />
          <span>Pedagogisk Hint ({currentHintLevel} av {hints.length})</span>
        </div>

        {hasMoreHints && (
          <button
            onClick={onRequestNextHint}
            className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center gap-1 transition-colors"
          >
            <span>Neste hint</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="space-y-3">
        {visibleHints.map((hint) => (
          <div
            key={hint.level}
            className="p-3 rounded-lg bg-slate-900/60 border border-slate-700/50"
          >
            <h4 className="text-xs font-semibold text-amber-300 uppercase tracking-wider mb-1">
              Hint {hint.level}: {hint.title}
            </h4>
            <div className="text-sm text-slate-200 leading-relaxed">
              <MathView latex={hint.latexContent} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
