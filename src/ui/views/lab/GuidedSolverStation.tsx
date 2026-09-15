import React, { useCallback } from 'react';
import { ArrowLeft } from 'lucide-react';
import { GuidedSession } from '../../../domain/model/guided/GuidedSession.js';
import { Lk20TopicNames } from '../../../domain/model/task/value-objects/Lk20Category.js';
import { Result } from '../../../domain/shared/Result.js';
import { GuidedError } from '../../../domain/model/guided/errors/GuidedError.js';
import { MathView } from '../../MathView.js';
import { StepRail } from '../../components/guided/StepRail.js';
import { PracticeStepPanel } from '../../components/guided/PracticeStepPanel.js';
import { FeedbackBanner } from '../../components/guided/FeedbackBanner.js';
import { WorkedExample } from '../../components/guided/WorkedExample.js';
import { ErrorHuntBoard } from '../../components/guided/ErrorHuntBoard.js';
import { GuidedSummaryPanel } from '../../components/guided/GuidedSummaryPanel.js';

export interface GuidedSolverStationProps {
  session: GuidedSession;
  /** Kalles med hver nye sesjonstilstand. Foreldren lagrer progresjon. */
  onSessionChange: (session: GuidedSession) => void;
  onPickAnotherTopic: () => void;
  onStartQuiz?: () => void;
}

const stageLabels: Record<GuidedSession['stage'], string> = {
  watch: 'Se det',
  practice: 'Gjør det',
  hunt: 'Finn feilen',
  summary: 'Kontroll',
};

const stageOrder: Array<GuidedSession['stage']> = ['watch', 'practice', 'hunt', 'summary'];

/**
 * Stasjonen som kjører en veiledet økt.
 *
 * Komponenten tar ingen matematiske avgjørelser. Den sender handlinger inn i
 * aggregatet, og tegner tilstanden som kommer ut. Alle ulovlige handlinger
 * stoppes av domenet, så UI-et trenger ingen egne vakter.
 */
export const GuidedSolverStation: React.FC<GuidedSolverStationProps> = ({
  session,
  onSessionChange,
  onPickAnotherTopic,
  onStartQuiz,
}) => {
  const walkthrough = session.walkthrough;
  const currentStep = session.currentStep;
  const currentRecord = session.currentRecord;

  /** Tar imot en overgang fra aggregatet og sender den videre, eller ignorerer den. */
  const apply = useCallback(
    (transition: Result<GuidedSession, GuidedError>) => {
      if (transition.isSuccess) {
        onSessionChange(transition.value);
      }
    },
    [onSessionChange]
  );

  const activeStageIndex = stageOrder.indexOf(session.stage);

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start lg:gap-6">
      <div className="grid min-w-0 gap-4">
        <header className="rounded-2xl border border-cyan-400/25 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/40 p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={onPickAnotherTopic}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" /> Alle temaer
            </button>
            <span className="rounded-full border border-cyan-400/30 bg-cyan-950/40 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-cyan-300">
              {Lk20TopicNames[walkthrough.topic]} · {walkthrough.goalId}
            </span>
          </div>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-white sm:text-3xl">
            {walkthrough.title}
          </h2>
          <ol className="mt-4 grid list-none grid-cols-4 gap-1.5 p-0 text-center text-[10px] font-bold uppercase tracking-wide sm:text-[11px]">
            {stageOrder.map((stage, index) => {
              const isDone = index < activeStageIndex;
              const isActive = stage === session.stage;
              return (
                <li
                  key={stage}
                  aria-current={isActive ? 'step' : undefined}
                  className={`rounded-lg border px-1.5 py-2 transition-colors ${
                    isActive
                      ? 'border-cyan-400/60 bg-cyan-400/15 text-cyan-100'
                      : isDone
                      ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-200/80'
                      : 'border-slate-700 bg-slate-950/40 text-slate-500'
                  }`}
                >
                  {stageLabels[stage]}
                </li>
              );
            })}
          </ol>
        </header>

        {session.stage === 'watch' && (
          <WorkedExample
            walkthrough={walkthrough}
            revealedSteps={session.revealedWatchSteps}
            onRevealNext={() => apply(session.revealNextWatchStep())}
            onRevealAll={() => apply(session.revealAllWatchSteps())}
            onBeginPractice={() => apply(session.beginPractice())}
          />
        )}

        {session.stage === 'practice' && currentStep && currentRecord && (
          <PracticeStepPanel
            session={session}
            step={currentStep}
            record={currentRecord}
            onChoose={(optionId) => apply(session.chooseOption(optionId))}
            onUseHint={() => apply(session.useHint())}
            onReveal={() => apply(session.revealCurrentStep())}
          />
        )}

        {session.stage === 'hunt' && session.errorHunt && (
          <ErrorHuntBoard
            hunt={session.errorHunt}
            state={session.hunt}
            clearedLines={session.hunt.clearedLineNumbers}
            wrongRepairIds={session.hunt.wrongRepairIds}
            onSelectLine={(lineNumber) => apply(session.selectHuntLine(lineNumber))}
            onChooseRepair={(optionId) => apply(session.chooseRepair(optionId))}
            onSkip={() => apply(session.skipHunt())}
          />
        )}

        {session.stage === 'summary' && (
          <GuidedSummaryPanel
            summary={session.summary}
            walkthrough={walkthrough}
            onRetryPractice={() => onSessionChange(session.retryPractice())}
            onRestart={() => onSessionChange(session.restart())}
            onPickAnotherTopic={onPickAnotherTopic}
            onStartQuiz={onStartQuiz}
          />
        )}
      </div>

      <aside className="grid gap-3 lg:sticky lg:top-20">
        <StepRail
          records={session.stepRecords}
          currentStepNumber={session.currentStepNumber}
          progressPercentage={session.progressPercentage}
          isActive={session.stage === 'practice'}
        />

        {session.feedback && (
          <FeedbackBanner
            feedback={session.feedback}
            hintAlreadyUsed={currentRecord?.hintUsed ?? false}
            onUseHint={session.stage === 'practice' ? () => apply(session.useHint()) : undefined}
            onReveal={session.stage === 'practice' ? () => apply(session.revealCurrentStep()) : undefined}
          />
        )}

        {session.stage !== 'summary' && (
          <section className="rounded-2xl border border-slate-700/80 bg-slate-900/70 p-3.5">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Oppgaven</p>
            <div className="mt-2 text-sm text-slate-200">
              <MathView latex={walkthrough.problemLatex} />
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              Ferdighet: {walkthrough.skillLabel}
            </p>
          </section>
        )}
      </aside>
    </div>
  );
};

export default GuidedSolverStation;
