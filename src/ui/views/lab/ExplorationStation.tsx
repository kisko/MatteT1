import React, { useCallback, useEffect } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Lightbulb,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Target,
} from 'lucide-react';
import { ExplorationSession } from '../../../domain/model/exploration/ExplorationSession.js';
import { Lk20TopicNames } from '../../../domain/model/task/value-objects/Lk20Category.js';
import { Result } from '../../../domain/shared/Result.js';
import { GuidedError } from '../../../domain/model/guided/errors/GuidedError.js';
import { VisualTone } from '../../../domain/model/guided/value-objects/StepVisual.js';
import { MathView } from '../../MathView.js';
import { StepVisualCanvas } from '../../components/guided/StepVisualCanvas.js';

export interface ExplorationStationProps {
  session: ExplorationSession;
  onSessionChange: (session: ExplorationSession) => void;
  onExit: () => void;
  /** Om animasjonen kjører. Styres av foreldren, så tidtakeren lever utenfor domenet. */
  isAnimating: boolean;
  onToggleAnimation: () => void;
}

const readoutToneClass: Record<VisualTone, string> = {
  primary: 'text-cyan-200',
  accent: 'text-violet-200',
  correct: 'text-emerald-200',
  error: 'text-rose-200',
  muted: 'text-slate-300',
};

const feedbackStyles: Record<string, { frame: string; title: string }> = {
  correct: { frame: 'border-emerald-400/40 bg-emerald-500/10', title: 'text-emerald-200' },
  mission: { frame: 'border-emerald-400/50 bg-emerald-500/15', title: 'text-emerald-200' },
  incorrect: { frame: 'border-rose-400/40 bg-rose-500/10', title: 'text-rose-200' },
  info: { frame: 'border-cyan-400/30 bg-cyan-500/10', title: 'text-cyan-200' },
};

/**
 * En utforskningsøkt: glidebryterne, bildet, tallene og oppdragene.
 *
 * Oppdragene sjekkes av domenet hver gang en parameter endres, så det finnes
 * ingen «sjekk svar»-knapp. Eleven ser at oppdraget løste seg, og det er hele
 * poenget: modellen svarer selv.
 */
export const ExplorationStation: React.FC<ExplorationStationProps> = ({
  session,
  onSessionChange,
  onExit,
  isAnimating,
  onToggleAnimation,
}) => {
  const lab = session.lab;
  const progress = session.progress;
  const animatedParameter = lab.animatedParameterId
    ? lab.parameter(lab.animatedParameterId)
    : undefined;

  const apply = useCallback(
    (transition: Result<ExplorationSession, GuidedError>) => {
      if (transition.isSuccess) {
        onSessionChange(transition.value);
      }
    },
    [onSessionChange]
  );

  // Animasjonen drar den valgte parameteren gjennom sitt eget intervall.
  useEffect(() => {
    if (!isAnimating || !animatedParameter) return;

    const timer = window.setInterval(() => {
      const current = session.values[animatedParameter.id];
      const next =
        current + animatedParameter.step > animatedParameter.max
          ? animatedParameter.min
          : current + animatedParameter.step;
      apply(session.setParameter(animatedParameter.id, next));
    }, 650);

    return () => window.clearInterval(timer);
  }, [isAnimating, animatedParameter, session, apply]);

  const feedbackStyle = session.feedback
    ? feedbackStyles[session.feedback.tone] ?? feedbackStyles.info
    : null;

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:gap-6">
      <div className="grid min-w-0 gap-4">
        <header className="rounded-2xl border border-violet-400/25 bg-gradient-to-br from-slate-900 via-slate-900 to-violet-950/30 p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={onExit}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" /> Alle utforskninger
            </button>
            <span className="rounded-full border border-violet-400/30 bg-violet-950/40 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-violet-300">
              {Lk20TopicNames[lab.topic]} · {lab.goalId}
            </span>
          </div>

          <h2 className="mt-3 text-2xl font-black tracking-tight text-white sm:text-3xl">{lab.title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-violet-100/90 sm:text-base">
            <MathView latex={lab.bigQuestion} />
          </p>
          <p className="mt-1.5 text-xs leading-relaxed text-slate-400">{lab.description}</p>

          <div className="mt-4">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wide text-slate-400">
              <span>Framgang</span>
              <span className="text-violet-200">{progress.percentage} %</span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-400 to-emerald-400 transition-all duration-500"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
          </div>
        </header>

        <section className="rounded-2xl border border-slate-700/80 bg-slate-900/70 p-4 sm:p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-violet-300">Modellen</p>
            <div className="flex flex-wrap gap-2">
              {animatedParameter && (
                <button
                  type="button"
                  onClick={onToggleAnimation}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-fuchsia-400/40 bg-fuchsia-400/10 px-3 py-1.5 text-xs font-bold text-fuchsia-200 transition-colors hover:bg-fuchsia-400/20"
                  aria-label={isAnimating ? 'Stopp animasjonen' : `Animer ${animatedParameter.label}`}
                >
                  {isAnimating ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                  {isAnimating ? 'Stopp' : `Animer ${animatedParameter.label}`}
                </button>
              )}
              <button
                type="button"
                onClick={() => onSessionChange(session.resetParameters())}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-600 bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-300 transition-colors hover:bg-slate-700"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Nullstill
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-violet-400/20 bg-slate-950/60 px-3 py-2">
            <MathView latex={session.modelLatex} />
          </div>

          <div className="mt-4">
            <StepVisualCanvas visual={session.visual} />
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {lab.parameters.map((parameter) => (
              <label key={parameter.id} className="rounded-xl border border-slate-700 bg-slate-800/60 p-3">
                <span className="flex items-center justify-between text-sm font-bold text-slate-200">
                  <span>{parameter.label}</span>
                  <span className="font-mono text-violet-200">{session.values[parameter.id]}</span>
                </span>
                <input
                  type="range"
                  min={parameter.min}
                  max={parameter.max}
                  step={parameter.step}
                  value={session.values[parameter.id]}
                  onChange={(event) => apply(session.setParameter(parameter.id, Number(event.target.value)))}
                  aria-label={parameter.label}
                  className="mt-3 w-full accent-violet-400"
                />
                <span className="mt-1 flex justify-between text-[10px] text-slate-500" aria-hidden="true">
                  <span>{parameter.min}</span>
                  <span>{parameter.max}</span>
                </span>
                <span className="mt-1 block text-xs leading-relaxed text-slate-400">
                  {parameter.meaning}
                </span>
              </label>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-amber-400/25 bg-amber-950/15 p-4 sm:p-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-amber-300">
            Vurder påstandene
          </p>
          <p className="mt-1 text-xs leading-relaxed text-amber-100/70">
            Bruk modellen til å avgjøre. Du kan dra i glidebryterne mens du tenker.
          </p>

          <ul className="mt-3 grid list-none gap-2.5 p-0">
            {lab.claims.map((claim) => {
              const verdict = session.verdictFor(claim.id);
              const isSettled = verdict?.isCorrect === true;

              return (
                <li
                  key={claim.id}
                  className={`rounded-xl border p-3 transition-colors ${
                    isSettled
                      ? 'border-emerald-400/50 bg-emerald-500/10'
                      : verdict
                      ? 'border-rose-400/50 bg-rose-500/10'
                      : 'border-slate-700 bg-slate-950/50'
                  }`}
                >
                  <div className="text-sm leading-relaxed text-slate-100">
                    <MathView latex={claim.text} />
                  </div>

                  {!isSettled && (
                    <div className="mt-2.5 flex gap-2">
                      <button
                        type="button"
                        onClick={() => apply(session.answerClaim(claim.id, true))}
                        className="rounded-lg border border-slate-600 bg-slate-800 px-4 py-1.5 text-xs font-bold text-slate-200 transition-colors hover:border-emerald-400/60"
                      >
                        Stemmer
                      </button>
                      <button
                        type="button"
                        onClick={() => apply(session.answerClaim(claim.id, false))}
                        className="rounded-lg border border-slate-600 bg-slate-800 px-4 py-1.5 text-xs font-bold text-slate-200 transition-colors hover:border-rose-400/60"
                      >
                        Stemmer ikke
                      </button>
                    </div>
                  )}

                  {verdict && (
                    <div
                      className={`mt-2 text-xs leading-relaxed ${
                        verdict.isCorrect ? 'text-emerald-200' : 'text-rose-200'
                      }`}
                    >
                      <MathView latex={claim.explanation} />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        {progress.isComplete && (
          <section className="guided-pop-in rounded-2xl border border-emerald-400/40 bg-emerald-500/10 p-5 text-center">
            <Sparkles className="mx-auto h-6 w-6 text-emerald-300" />
            <h3 className="mt-2 text-xl font-black text-white">Utforskningen er gjennomført</h3>
            <p className="mt-2 text-sm leading-relaxed text-emerald-100/90">
              <MathView latex={lab.insight} />
            </p>
          </section>
        )}
      </div>

      <aside className="grid gap-3 lg:sticky lg:top-20">
        <section className="rounded-2xl border border-slate-700/80 bg-slate-900/70 p-3.5">
          <div className="flex items-center justify-between gap-2">
            <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
              <Target className="h-3.5 w-3.5" /> Oppdrag
            </p>
            <span className="text-xs font-bold text-emerald-300">
              {progress.completedMissions} av {progress.totalMissions}
            </span>
          </div>

          <ul className="mt-3 grid list-none gap-2 p-0">
            {lab.missions.map((mission) => {
              const isDone = session.isMissionCompleted(mission.id);
              const hintShown = session.isHintRevealed(mission.id);

              return (
                <li
                  key={mission.id}
                  className={`rounded-xl border p-2.5 transition-colors ${
                    isDone ? 'border-emerald-400/50 bg-emerald-500/10' : 'border-slate-700 bg-slate-950/50'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {isDone ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                    ) : (
                      <Circle className="mt-0.5 h-4 w-4 shrink-0 text-slate-600" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div
                        className={`text-xs leading-relaxed ${
                          isDone ? 'text-emerald-100' : 'text-slate-200'
                        }`}
                      >
                        <MathView latex={mission.prompt} />
                      </div>

                      {isDone ? (
                        <p className="mt-1 text-[11px] leading-relaxed text-emerald-200/80">
                          {mission.successMessage}
                        </p>
                      ) : hintShown ? (
                        <p className="mt-1 text-[11px] leading-relaxed text-amber-200/90">
                          <MathView latex={mission.hint} />
                        </p>
                      ) : (
                        <button
                          type="button"
                          onClick={() => apply(session.revealHint(mission.id))}
                          className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 transition-colors hover:text-amber-200"
                        >
                          <Lightbulb className="h-3 w-3" /> Hint
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        {session.feedback && feedbackStyle && (
          <div
            className={`guided-fade-in rounded-2xl border p-3.5 ${feedbackStyle.frame}`}
            role="status"
            aria-live="polite"
          >
            <p className={`text-sm font-bold ${feedbackStyle.title}`}>{session.feedback.title}</p>
            <div className="mt-1 text-xs leading-relaxed text-slate-200">
              <MathView latex={session.feedback.message} />
            </div>
          </div>
        )}

        <section className="rounded-2xl border border-slate-700/80 bg-slate-900/70 p-3.5">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
            Tallene akkurat nå
          </p>
          <dl className="mt-2.5 grid gap-2">
            {session.readouts.map((readout) => (
              <div key={readout.id} className="flex items-baseline justify-between gap-3 text-xs">
                <dt className="text-slate-400">
                  <MathView latex={readout.label} />
                </dt>
                <dd className={`text-right font-bold ${readoutToneClass[readout.tone ?? 'muted']}`}>
                  <MathView latex={readout.value} />
                </dd>
              </div>
            ))}
          </dl>
        </section>
      </aside>
    </div>
  );
};

export default ExplorationStation;
