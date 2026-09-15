import React from 'react';
import { Search, SkipForward, Wrench } from 'lucide-react';
import { ErrorHunt } from '../../../domain/model/guided/ErrorHunt.js';
import { HuntState } from '../../../domain/model/guided/GuidedSession.js';
import { MathView } from '../../MathView.js';
import { StepChoiceList } from './StepChoiceList.js';
import { StepVisualCanvas } from './StepVisualCanvas.js';

export interface ErrorHuntBoardProps {
  hunt: ErrorHunt;
  state: HuntState;
  /** Linjer eleven har pekt på som viste seg å være i orden. */
  clearedLines: readonly number[];
  onSelectLine: (lineNumber: number) => void;
  onChooseRepair: (optionId: string) => void;
  onSkip: () => void;
  wrongRepairIds: readonly string[];
}

/**
 * «Finn feilen».
 *
 * Å rette en annens utregning er lettere å begynne på enn å produsere sin egen,
 * og det er her de vanligste tabbene blir synlige. Eleven peker på linjen først,
 * og velger reparasjonen etterpå.
 */
export const ErrorHuntBoard: React.FC<ErrorHuntBoardProps> = ({
  hunt,
  state,
  clearedLines,
  onSelectLine,
  onChooseRepair,
  onSkip,
  wrongRepairIds,
}) => {
  const isFinding = state.phase === 'find';
  const flawedFound = state.phase !== 'find';

  return (
    <div className="grid gap-4">
      <section className="rounded-2xl border border-fuchsia-400/30 bg-fuchsia-950/20 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 rounded-xl bg-fuchsia-400/15 p-2 text-fuchsia-200">
            <Search className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-fuchsia-300">Finn feilen</p>
            <h3 className="mt-1 text-lg font-bold text-white">{hunt.title}</h3>
            <div className="mt-2 text-sm leading-relaxed text-slate-200">
              <MathView latex={hunt.claim} />
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-700/80 bg-slate-900/70 p-4 sm:p-5">
        <p className="mb-3 text-sm font-bold text-slate-200">
          {isFinding
            ? 'Trykk på linjen der utregningen sporer av.'
            : `Feilen står på linje ${hunt.flawedLineNumber}.`}
        </p>

        <ol className="grid list-none gap-2 p-0">
          {hunt.lines.map((line) => {
            const isFlawed = line.lineNumber === hunt.flawedLineNumber;
            const isCleared = clearedLines.includes(line.lineNumber);
            const isRevealedFlaw = flawedFound && isFlawed;
            const isSelectable = isFinding && !isCleared;

            const stateClasses = isRevealedFlaw
              ? 'border-rose-400/70 bg-rose-500/10'
              : isCleared
              ? 'border-emerald-400/40 bg-emerald-500/5 opacity-75'
              : isSelectable
              ? 'border-slate-700 bg-slate-950/50 hover:border-fuchsia-400/70 hover:bg-slate-800/70'
              : 'border-slate-700 bg-slate-950/40 opacity-70';

            return (
              <li key={line.lineNumber}>
                <button
                  type="button"
                  onClick={() => onSelectLine(line.lineNumber)}
                  disabled={!isSelectable}
                  className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-all ${stateClasses} disabled:cursor-not-allowed`}
                >
                  <span
                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[11px] font-black ${
                      isRevealedFlaw
                        ? 'bg-rose-400 text-slate-950'
                        : isCleared
                        ? 'bg-emerald-400/80 text-slate-950'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {line.lineNumber}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block break-words text-sm text-slate-100 sm:text-[15px]">
                      <MathView latex={line.latex} />
                    </span>
                    {(isCleared || isRevealedFlaw) && (
                      <span
                        className={`mt-1.5 block text-xs leading-relaxed ${
                          isRevealedFlaw ? 'text-rose-200' : 'text-emerald-200/80'
                        }`}
                      >
                        <MathView latex={line.note} />
                      </span>
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        {isFinding && (
          <button
            type="button"
            onClick={onSkip}
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition-colors hover:text-slate-300"
          >
            <SkipForward className="h-3.5 w-3.5" /> Hopp over feiljakten
          </button>
        )}
      </section>

      {flawedFound && (
        <>
          <section className="guided-fade-in rounded-2xl border border-rose-400/30 bg-rose-950/20 p-4 sm:p-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-rose-300">Hva gikk galt</p>
            <div className="mt-2 text-sm leading-relaxed text-slate-200">
              <MathView latex={hunt.explanation} />
            </div>
            <div className="mt-3">
              <StepVisualCanvas visual={hunt.visual} />
            </div>
          </section>

          <section className="guided-fade-in rounded-2xl border border-emerald-400/30 bg-emerald-950/15 p-4 sm:p-5">
            <div className="mb-3 flex items-center gap-2">
              <Wrench className="h-4 w-4 text-emerald-300" />
              <p className="text-sm font-bold text-emerald-100">Hvordan skal linjen rettes?</p>
            </div>
            <StepChoiceList
              options={hunt.repairOptions}
              chosenWrongIds={wrongRepairIds}
              solvedOptionId={state.solved ? hunt.correctRepair.id : undefined}
              disabled={state.solved}
              onChoose={onChooseRepair}
            />
          </section>
        </>
      )}
    </div>
  );
};

export default ErrorHuntBoard;
