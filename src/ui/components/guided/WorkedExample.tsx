import React from 'react';
import { ArrowRight, FastForward, Play } from 'lucide-react';
import { GuidedWalkthrough } from '../../../domain/model/guided/GuidedWalkthrough.js';
import { MathView } from '../../MathView.js';
import { StepVisualCanvas } from './StepVisualCanvas.js';

export interface WorkedExampleProps {
  walkthrough: GuidedWalkthrough;
  revealedSteps: number;
  onRevealNext: () => void;
  onRevealAll: () => void;
  onBeginPractice: () => void;
}

/**
 * «Se det»: en ferdig utregning som rulles ut én linje om gangen, med
 * visualiseringen ved siden av linjen.
 *
 * Eleven kan hoppe rett videre. Det er et bevisst valg – den som alt kan
 * framgangsmåten skal ikke tvinges gjennom den.
 */
export const WorkedExample: React.FC<WorkedExampleProps> = ({
  walkthrough,
  revealedSteps,
  onRevealNext,
  onRevealAll,
  onBeginPractice,
}) => {
  const allRevealed = revealedSteps >= walkthrough.stepCount;
  const visibleSteps = walkthrough.steps.slice(0, revealedSteps);

  return (
    <div className="grid gap-4">
      <section className="rounded-2xl border border-indigo-400/30 bg-indigo-950/20 p-4 sm:p-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-indigo-300">Situasjonen</p>
        <div className="mt-2 text-sm leading-relaxed text-slate-200 sm:text-base">
          <MathView latex={walkthrough.situation} />
        </div>
        <div className="mt-3 rounded-xl border border-indigo-400/20 bg-slate-950/60 px-3 py-2">
          <MathView latex={walkthrough.problemLatex} displayMode />
        </div>
      </section>

      {revealedSteps === 0 && (
        <section className="rounded-2xl border border-cyan-400/30 bg-cyan-950/20 p-4 text-center sm:p-6">
          <p className="text-sm leading-relaxed text-cyan-100">
            Først ser du hele utregningen gjort riktig, ett steg om gangen. Deretter gjør du den samme
            utregningen selv.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={onRevealNext}
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-black text-slate-950 transition-colors hover:bg-cyan-300"
            >
              <Play className="h-4 w-4" /> Vis meg første steg
            </button>
            <button
              type="button"
              onClick={onBeginPractice}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-600 bg-slate-800 px-4 py-2.5 text-sm font-bold text-slate-200 transition-colors hover:bg-slate-700"
            >
              Jeg prøver selv med en gang <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      )}

      <ol className="grid list-none gap-4 p-0">
        {visibleSteps.map((step) => (
          <li
            key={step.stepNumber}
            className="guided-slide-in rounded-2xl border border-slate-700/80 bg-slate-900/70 p-4 sm:p-5"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-cyan-400/50 bg-cyan-400/15 text-sm font-black text-cyan-200">
                {step.stepNumber}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-white sm:text-base">
                  <MathView latex={step.prompt} />
                </p>
                <div className="mt-2 rounded-xl border border-emerald-400/25 bg-emerald-950/25 px-3 py-2">
                  <MathView latex={step.correctOption.latex} displayMode />
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-300 sm:text-sm">
                  <MathView latex={step.rationale} />
                </p>
              </div>
            </div>
            <div className="mt-3">
              <StepVisualCanvas visual={step.visual} />
            </div>
          </li>
        ))}
      </ol>

      {revealedSteps > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-700/80 bg-slate-900/70 p-3 sm:p-4">
          <p className="text-xs text-slate-400">
            {allRevealed
              ? 'Hele utregningen er vist. Klar til å gjøre den selv?'
              : `Steg ${revealedSteps} av ${walkthrough.stepCount} vist.`}
          </p>
          <div className="flex flex-wrap gap-2">
            {!allRevealed && (
              <>
                <button
                  type="button"
                  onClick={onRevealNext}
                  className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-black text-slate-950 transition-colors hover:bg-cyan-300"
                >
                  Neste steg <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={onRevealAll}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-600 bg-slate-800 px-3.5 py-2.5 text-xs font-bold text-slate-300 transition-colors hover:bg-slate-700"
                >
                  <FastForward className="h-4 w-4" /> Vis resten
                </button>
              </>
            )}
            <button
              type="button"
              onClick={onBeginPractice}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-black transition-colors ${
                allRevealed
                  ? 'bg-emerald-400 text-slate-950 hover:bg-emerald-300'
                  : 'border border-slate-600 bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
            >
              Nå prøver jeg selv <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkedExample;
