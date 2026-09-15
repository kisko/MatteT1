import React from 'react';
import { Check, Eye, Lightbulb } from 'lucide-react';
import { StepRecord } from '../../../domain/model/guided/GuidedSession.js';

export interface StepRailProps {
  records: ReadonlyArray<StepRecord>;
  currentStepNumber: number;
  /** Progresjonsprosenten fra domenet. */
  progressPercentage: number;
  /** Om øvingen er i gang. I «Se det» er skinnen bare et kart. */
  isActive: boolean;
}

/**
 * «Du er her»-skinnen.
 *
 * Eleven skal til enhver tid se hvor mange steg som er igjen, hvilke som gikk
 * på første forsøk, og hvilke som måtte vises. Det er kontrollfølelsen: ingen
 * skjulte lengder, ingen overraskelser.
 */
export const StepRail: React.FC<StepRailProps> = ({
  records,
  currentStepNumber,
  progressPercentage,
  isActive,
}) => (
  <div className="rounded-2xl border border-slate-700/80 bg-slate-900/70 p-3 sm:p-4">
    <div className="mb-2.5 flex items-center justify-between gap-3">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Stegene dine</p>
      <p className="text-xs font-bold text-cyan-300">
        {records.filter((record) => record.solved).length} av {records.length} gjort
      </p>
    </div>

    <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
      <div
        className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-500"
        style={{ width: `${progressPercentage}%` }}
      />
    </div>

    <ol className="mt-3 flex list-none flex-wrap gap-2 p-0">
      {records.map((record) => {
        const isCurrent = isActive && record.stepNumber === currentStepNumber && !record.solved;
        const state = record.revealed
          ? 'border-amber-400/60 bg-amber-400/15 text-amber-200'
          : record.solved
          ? 'border-emerald-400/60 bg-emerald-400/15 text-emerald-200'
          : isCurrent
          ? 'border-cyan-400 bg-cyan-400/15 text-cyan-100 guided-pulse'
          : 'border-slate-700 bg-slate-950/50 text-slate-500';

        return (
          <li
            key={record.stepNumber}
            aria-current={isCurrent ? 'step' : undefined}
            className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-bold ${state}`}
            title={
              record.revealed
                ? `Steg ${record.stepNumber}: vist`
                : record.solved
                ? `Steg ${record.stepNumber}: løst på ${record.attempts} forsøk`
                : `Steg ${record.stepNumber}`
            }
          >
            <span>{record.stepNumber}</span>
            {record.revealed ? (
              <Eye className="h-3.5 w-3.5" />
            ) : record.solved ? (
              <Check className="h-3.5 w-3.5" />
            ) : record.hintUsed ? (
              <Lightbulb className="h-3.5 w-3.5" />
            ) : null}
          </li>
        );
      })}
    </ol>
  </div>
);

export default StepRail;
