import React from 'react';
import { Eye, Lightbulb } from 'lucide-react';
import { GuidedSession } from '../../../domain/model/guided/GuidedSession.js';
import { GuidedStep } from '../../../domain/model/guided/value-objects/GuidedStep.js';
import { StepRecord } from '../../../domain/model/guided/GuidedSession.js';
import { MathView } from '../../MathView.js';
import { StepChoiceList } from './StepChoiceList.js';
import { StepVisualCanvas } from './StepVisualCanvas.js';

export interface PracticeStepPanelProps {
  session: GuidedSession;
  step: GuidedStep;
  record: StepRecord;
  onChoose: (optionId: string) => void;
  onUseHint: () => void;
  onReveal: () => void;
}

/**
 * Selve øvingsflaten: spørsmålet, bildet og valgene.
 *
 * Den brukes både i den veiledede leksjonen og i øvingsserien, slik at
 * mekanikken er identisk uansett hvor eleven møter den.
 */
export const PracticeStepPanel: React.FC<PracticeStepPanelProps> = ({
  session,
  step,
  record,
  onChoose,
  onUseHint,
  onReveal,
}) => (
  <>
    <section className="rounded-2xl border border-slate-700/80 bg-slate-900/70 p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-cyan-400">
          Steg {step.stepNumber} av {session.walkthrough.stepCount}
        </p>
        <div className="text-[11px] font-semibold text-slate-500">
          <MathView latex={session.walkthrough.problemLatex} />
        </div>
      </div>
      <h3 className="mt-2 text-lg font-bold leading-snug text-white sm:text-xl">
        <MathView latex={step.prompt} />
      </h3>
      <div className="mt-3">
        <StepVisualCanvas visual={step.visual} />
      </div>
    </section>

    <section className="rounded-2xl border border-cyan-400/20 bg-slate-900/60 p-4 sm:p-5">
      <p className="mb-3 text-sm font-bold text-slate-200">Velg den neste linjen i utregningen</p>
      <StepChoiceList
        options={step.options}
        chosenWrongIds={record.wrongOptionIds}
        onChoose={onChoose}
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onUseHint}
          disabled={record.hintUsed}
          className="inline-flex items-center gap-1.5 rounded-xl border border-amber-400/40 bg-amber-400/10 px-3 py-2 text-xs font-bold text-amber-200 transition-colors hover:bg-amber-400/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Lightbulb className="h-4 w-4" />
          {record.hintUsed ? 'Hint brukt' : 'Hent hint'}
        </button>
        <button
          type="button"
          onClick={onReveal}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-600 bg-slate-800 px-3 py-2 text-xs font-bold text-slate-300 transition-colors hover:bg-slate-700"
        >
          <Eye className="h-4 w-4" /> Vis meg steget
        </button>
      </div>
    </section>
  </>
);

export default PracticeStepPanel;
