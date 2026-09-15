import React from 'react';
import { Check, X } from 'lucide-react';
import { StepOption } from '../../../domain/model/guided/value-objects/StepOption.js';
import { GuidedSolverService } from '../../../domain/services/GuidedSolverService.js';
import { MathView } from '../../MathView.js';

export interface StepChoiceListProps {
  options: ReadonlyArray<StepOption>;
  /** Alternativer eleven alt har prøvd og bommet på. */
  chosenWrongIds: readonly string[];
  /** Satt når steget er løst ved et valg (ikke ved avsløring). */
  solvedOptionId?: string;
  disabled?: boolean;
  onChoose: (optionId: string) => void;
}

/**
 * Valglisten er hele inndatamekanikken i Mesterlab.
 *
 * Ingen fritekst: eleven trykker på den neste linjen i utregningen. Et bom blir
 * stående med sin egen forklaring, slik at feilen er noe man leser, ikke noe
 * som forsvinner.
 */
export const StepChoiceList: React.FC<StepChoiceListProps> = ({
  options,
  chosenWrongIds,
  solvedOptionId,
  disabled = false,
  onChoose,
}) => (
  <ul className="grid list-none gap-2.5 p-0">
    {options.map((option, index) => {
      const isWrongPick = chosenWrongIds.includes(option.id);
      const isSolvedPick = solvedOptionId === option.id;
      const isLocked = disabled || isWrongPick || Boolean(solvedOptionId);

      const stateClasses = isSolvedPick
        ? 'border-emerald-400/70 bg-emerald-500/10'
        : isWrongPick
        ? 'border-rose-400/60 bg-rose-500/10 opacity-80'
        : isLocked
        ? 'border-slate-700 bg-slate-900/60 opacity-60'
        : 'border-slate-700 bg-slate-900/70 hover:border-cyan-400/70 hover:bg-slate-800/80 active:scale-[0.99]';

      return (
        <li key={option.id}>
          <button
            type="button"
            onClick={() => onChoose(option.id)}
            disabled={isLocked}
            aria-pressed={isSolvedPick || isWrongPick}
            className={`flex w-full items-start gap-3 rounded-2xl border p-3.5 text-left transition-all sm:p-4 ${stateClasses} disabled:cursor-not-allowed`}
          >
            <span
              className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-black ${
                isSolvedPick
                  ? 'border-emerald-400 bg-emerald-400 text-slate-950'
                  : isWrongPick
                  ? 'border-rose-400 bg-rose-400 text-slate-950'
                  : 'border-slate-600 bg-slate-800 text-slate-300'
              }`}
            >
              {isSolvedPick ? (
                <Check className="h-4 w-4" />
              ) : isWrongPick ? (
                <X className="h-4 w-4" />
              ) : (
                String.fromCharCode(65 + index)
              )}
            </span>

            <span className="min-w-0 flex-1">
              <span className="block break-words text-[15px] leading-relaxed text-slate-100 sm:text-base">
                <MathView latex={option.latex} />
              </span>
              {(isWrongPick || isSolvedPick) && (
                <span
                  className={`mt-2 block text-xs leading-relaxed sm:text-sm ${
                    isSolvedPick ? 'text-emerald-200' : 'text-rose-200'
                  }`}
                >
                  <MathView latex={GuidedSolverService.feedbackForOption(option)} />
                </span>
              )}
            </span>
          </button>
        </li>
      );
    })}
  </ul>
);

export default StepChoiceList;
