import React, { useCallback } from 'react';
import { ArrowLeft, ArrowRight, Award, Flame, RotateCcw, Sparkles, Target } from 'lucide-react';
import { PracticeRun } from '../../../domain/model/guided/PracticeRun.js';
import { GuidedSession } from '../../../domain/model/guided/GuidedSession.js';
import { Lk20TopicNames } from '../../../domain/model/task/value-objects/Lk20Category.js';
import {
  MisconceptionType,
  MISCONCEPTION_INFO,
} from '../../../domain/model/task/Misconception.js';
import { Result } from '../../../domain/shared/Result.js';
import { GuidedError } from '../../../domain/model/guided/errors/GuidedError.js';
import { MathView } from '../../MathView.js';
import { StepRail } from '../../components/guided/StepRail.js';
import { FeedbackBanner } from '../../components/guided/FeedbackBanner.js';
import { PracticeStepPanel } from '../../components/guided/PracticeStepPanel.js';

export interface PracticeStationProps {
  run: PracticeRun;
  onRunChange: (run: PracticeRun) => void;
  /** Kalles med hver nye sesjonstilstand, slik at progresjonen lagres. */
  onSessionProgress: (session: GuidedSession) => void;
  onExit: () => void;
}

/**
 * Øvingsserien: samme oppgavetype igjen og igjen, med nye tall hver gang.
 *
 * Serien tar aldri slutt. Rekken på tre feilfrie oppgaver er et mål eleven
 * kan sikte mot, ikke en dør som lukkes.
 */
export const PracticeStation: React.FC<PracticeStationProps> = ({
  run,
  onRunChange,
  onSessionProgress,
  onExit,
}) => {
  const session = run.session;
  const summary = run.summary;
  const currentStep = session.currentStep;
  const currentRecord = session.currentRecord;

  /** Sender en sesjonsovergang inn i serien, og videre til lagring. */
  const applySession = useCallback(
    (transition: Result<GuidedSession, GuidedError>) => {
      if (transition.isFailure) return;

      const updated = run.withSession(transition.value);
      if (updated.isSuccess) {
        onRunChange(updated.value);
        onSessionProgress(transition.value);
      }
    },
    [run, onRunChange, onSessionProgress]
  );

  const goToNextExercise = () => {
    const next = run.nextExercise();
    if (next.isSuccess) {
      onRunChange(next.value);
    }
  };

  const retryExercise = () => {
    const retried = run.retryCurrentExercise();
    if (retried.isSuccess) {
      onRunChange(retried.value);
    }
  };

  const streakDots = Array.from({ length: summary.requiredStreak }, (_, index) => index < run.cleanStreak);
  const exerciseSummary = session.isComplete ? session.summary : null;

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start lg:gap-6">
      <div className="grid min-w-0 gap-4">
        <header className="rounded-2xl border border-emerald-400/25 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/30 p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={onExit}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" /> Avslutt økten
            </button>
            <span className="rounded-full border border-emerald-400/30 bg-emerald-950/40 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-300">
              {Lk20TopicNames[run.topic]} · {run.template.goalId}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-300">
                Øver på
              </p>
              <h2 className="mt-1 text-2xl font-black tracking-tight text-white sm:text-3xl">
                {run.template.title}
              </h2>
              <p className="mt-1 text-xs text-slate-400">{run.skillLabel}</p>
            </div>

            {run.isMastered && (
              <span className="guided-pop-in inline-flex items-center gap-1.5 rounded-xl border border-emerald-400/50 bg-emerald-400/15 px-3 py-2 text-xs font-black text-emerald-200">
                <Award className="h-4 w-4" /> Mestret
              </span>
            )}
          </div>

          <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl border border-slate-700/70 bg-slate-950/50 px-2 py-2">
              <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Oppgave</dt>
              <dd className="text-lg font-black text-slate-100">{run.exerciseNumber}</dd>
            </div>
            <div className="rounded-xl border border-slate-700/70 bg-slate-950/50 px-2 py-2">
              <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Rekke</dt>
              <dd className="flex items-center justify-center gap-1 pt-1.5">
                {streakDots.map((filled, index) => (
                  <span
                    key={index}
                    className={`h-3 w-3 rounded-full border transition-colors ${
                      filled ? 'border-emerald-300 bg-emerald-400' : 'border-slate-600 bg-slate-800'
                    }`}
                  />
                ))}
              </dd>
            </div>
            <div className="rounded-xl border border-slate-700/70 bg-slate-950/50 px-2 py-2">
              <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-500">XP</dt>
              <dd className="text-lg font-black text-emerald-300">{summary.totalExperiencePoints}</dd>
            </div>
          </dl>
        </header>

        {!session.isComplete && currentStep && currentRecord && (
          <PracticeStepPanel
            session={session}
            step={currentStep}
            record={currentRecord}
            onChoose={(optionId) => applySession(session.chooseOption(optionId))}
            onUseHint={() => applySession(session.useHint())}
            onReveal={() => applySession(session.revealCurrentStep())}
          />
        )}

        {session.isComplete && exerciseSummary && (
          <section className="guided-pop-in rounded-2xl border border-emerald-400/30 bg-emerald-950/15 p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-300">
                  Oppgave {run.exerciseNumber} ferdig
                </p>
                <h3 className="mt-1 text-xl font-black text-white">
                  {exerciseSummary.revealedSteps === 0 &&
                  exerciseSummary.firstTrySteps === exerciseSummary.totalSteps
                    ? 'Feilfritt!'
                    : 'Gjennomført'}
                </h3>
              </div>
              <span className="text-2xl font-black text-emerald-300">
                +{exerciseSummary.experiencePoints} XP
              </span>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-slate-200">{exerciseSummary.closingMessage}</p>

            <div className="mt-3 rounded-xl border border-slate-700/70 bg-slate-950/50 p-3">
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Svar</p>
              <div className="mt-1 text-sm text-slate-100">
                <MathView latex={session.walkthrough.answerLatex} />
              </div>
            </div>

            <p className="mt-3 flex items-start gap-2 text-sm leading-relaxed text-emerald-100/90">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
              {summary.nextStepMessage}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={goToNextExercise}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-5 py-3 text-sm font-black text-slate-950 transition-colors hover:bg-emerald-300"
              >
                Neste oppgave <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={retryExercise}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-600 bg-slate-800 px-4 py-3 text-sm font-bold text-slate-200 transition-colors hover:bg-slate-700"
              >
                <RotateCcw className="h-4 w-4" /> Samme oppgave igjen
              </button>
              <button
                type="button"
                onClick={onExit}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-bold text-slate-400 transition-colors hover:bg-slate-800"
              >
                Avslutt
              </button>
            </div>
          </section>
        )}
      </div>

      <aside className="grid gap-3 lg:sticky lg:top-20">
        <StepRail
          records={session.stepRecords}
          currentStepNumber={session.currentStepNumber}
          progressPercentage={session.progressPercentage}
          isActive={!session.isComplete}
        />

        {session.feedback && (
          <FeedbackBanner
            feedback={session.feedback}
            hintAlreadyUsed={currentRecord?.hintUsed ?? false}
            onUseHint={!session.isComplete ? () => applySession(session.useHint()) : undefined}
            onReveal={!session.isComplete ? () => applySession(session.revealCurrentStep()) : undefined}
          />
        )}

        <section className="rounded-2xl border border-slate-700/80 bg-slate-900/70 p-3.5">
          <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
            <Target className="h-3.5 w-3.5" /> Økten din
          </p>
          <dl className="mt-2 grid gap-1.5 text-xs">
            <div className="flex justify-between">
              <dt className="text-slate-400">Fullførte oppgaver</dt>
              <dd className="font-bold text-slate-200">{summary.exercisesCompleted}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-400">Feilfrie på rad</dt>
              <dd className="font-bold text-slate-200">
                {run.cleanStreak} av {summary.requiredStreak}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-400">Beste rekke</dt>
              <dd className="flex items-center gap-1 font-bold text-amber-300">
                <Flame className="h-3.5 w-3.5" /> {summary.bestStreak}
              </dd>
            </div>
            {summary.exercisesCompleted > 0 && (
              <div className="flex justify-between">
                <dt className="text-slate-400">Nivå</dt>
                <dd className="font-bold text-slate-200">{summary.level}</dd>
              </div>
            )}
          </dl>
        </section>

        {summary.misconceptionsHit.length > 0 && (
          <section className="rounded-2xl border border-rose-400/25 bg-rose-950/15 p-3.5">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-rose-300">
              Følg med på dette
            </p>
            <ul className="mt-2 grid list-none gap-1.5 p-0">
              {summary.misconceptionsHit.map((type) => {
                const info = MISCONCEPTION_INFO[type as Exclude<MisconceptionType, MisconceptionType.NONE>];
                if (!info) return null;
                return (
                  <li key={type} className="text-xs leading-relaxed text-slate-300">
                    <span className="font-bold text-rose-200">{info.title}.</span>{' '}
                    <MathView latex={info.tip} />
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </aside>
    </div>
  );
};

export default PracticeStation;
