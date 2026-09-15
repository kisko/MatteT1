import React from 'react';
import { ArrowRight, Award, Eye, Lightbulb, RotateCcw, ShieldCheck, Target } from 'lucide-react';
import { GuidedSessionSummary } from '../../../domain/model/guided/GuidedSession.js';
import { GuidedWalkthrough } from '../../../domain/model/guided/GuidedWalkthrough.js';
import { MasteryLevel } from '../../../domain/services/GuidedSolverService.js';
import {
  MisconceptionType,
  MISCONCEPTION_INFO,
} from '../../../domain/model/task/Misconception.js';
import { MathView } from '../../MathView.js';

export interface GuidedSummaryPanelProps {
  summary: GuidedSessionSummary;
  walkthrough: GuidedWalkthrough;
  onRetryPractice: () => void;
  onRestart: () => void;
  onPickAnotherTopic: () => void;
  onStartQuiz?: () => void;
}

const levelStyles: Record<MasteryLevel, { label: string; frame: string; text: string }> = {
  mester: { label: 'Mester', frame: 'border-emerald-400/50 bg-emerald-500/10', text: 'text-emerald-200' },
  sterk: { label: 'Sterk', frame: 'border-cyan-400/50 bg-cyan-500/10', text: 'text-cyan-200' },
  god: { label: 'God', frame: 'border-amber-400/50 bg-amber-500/10', text: 'text-amber-200' },
  'på-vei': { label: 'På vei', frame: 'border-slate-600 bg-slate-800/60', text: 'text-slate-300' },
};

const Stat: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="rounded-xl border border-slate-700/80 bg-slate-950/50 p-3">
    <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-400">
      {icon} {label}
    </span>
    <strong className="mt-1 block text-lg font-black text-slate-100">{value}</strong>
  </div>
);

/**
 * Oppsummeringen. Den skal gjøre to ting samtidig: gi eleven noe å være stolt
 * av, og si helt konkret hva neste steg er.
 */
export const GuidedSummaryPanel: React.FC<GuidedSummaryPanelProps> = ({
  summary,
  walkthrough,
  onRetryPractice,
  onRestart,
  onPickAnotherTopic,
  onStartQuiz,
}) => {
  const level = levelStyles[summary.level];
  const avoidedTraps = walkthrough.watchedMisconceptions.filter(
    (type) => !summary.misconceptionsHit.includes(type)
  );

  return (
    <div className="grid gap-4">
      <section className={`guided-pop-in rounded-2xl border p-5 text-center sm:p-7 ${level.frame}`}>
        <span className="inline-flex items-center gap-2 rounded-full border border-slate-700/70 bg-slate-950/50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-300">
          <Award className="h-3.5 w-3.5" /> {level.label}
        </span>
        <p className={`mt-3 text-4xl font-black sm:text-5xl ${level.text}`}>
          {summary.experiencePoints} XP
        </p>
        <p className="mt-2 text-sm leading-relaxed text-slate-200 sm:text-base">{summary.closingMessage}</p>
      </section>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <Stat
          icon={<Target className="h-3.5 w-3.5" />}
          label="Første forsøk"
          value={`${summary.firstTrySteps} av ${summary.totalSteps}`}
        />
        <Stat
          icon={<Eye className="h-3.5 w-3.5" />}
          label="Vist for deg"
          value={`${summary.revealedSteps}`}
        />
        <Stat
          icon={<Lightbulb className="h-3.5 w-3.5" />}
          label="Hint brukt"
          value={`${summary.hintedSteps}`}
        />
        <Stat
          icon={<ShieldCheck className="h-3.5 w-3.5" />}
          label="Feiljakt"
          value={summary.errorHuntSolved ? 'Løst' : 'Ikke løst'}
        />
      </div>

      <section className="rounded-2xl border border-indigo-400/30 bg-indigo-950/20 p-4 sm:p-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-indigo-300">Ta med videre</p>
        <div className="mt-2 text-sm leading-relaxed text-slate-100 sm:text-base">
          <MathView latex={walkthrough.takeaway} />
        </div>
        <div className="mt-3 rounded-xl border border-indigo-400/20 bg-slate-950/50 px-3 py-2">
          <MathView latex={walkthrough.answerLatex} displayMode />
        </div>
      </section>

      {summary.misconceptionsHit.length > 0 && (
        <section className="rounded-2xl border border-rose-400/30 bg-rose-950/15 p-4 sm:p-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-rose-300">
            Fellene du gikk i denne runden
          </p>
          <ul className="mt-3 grid list-none gap-2 p-0">
            {summary.misconceptionsHit.map((type) => {
              const info = MISCONCEPTION_INFO[type as Exclude<MisconceptionType, MisconceptionType.NONE>];
              if (!info) return null;
              return (
                <li key={type} className="rounded-xl border border-slate-700/70 bg-slate-950/50 p-3">
                  <p className="text-sm font-bold text-rose-200">{info.title}</p>
                  <div className="mt-1 text-xs leading-relaxed text-slate-300">
                    <MathView latex={info.tip} />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {avoidedTraps.length > 0 && (
        <section className="rounded-2xl border border-emerald-400/25 bg-emerald-950/15 p-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-300">
            Feller du unngikk
          </p>
          <ul className="mt-2 flex list-none flex-wrap gap-2 p-0">
            {avoidedTraps.map((type) => {
              const info = MISCONCEPTION_INFO[type as Exclude<MisconceptionType, MisconceptionType.NONE>];
              if (!info) return null;
              return (
                <li
                  key={type}
                  className="rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-xs font-semibold text-emerald-200"
                >
                  {info.title}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onRetryPractice}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-black text-slate-950 transition-colors hover:bg-emerald-300"
        >
          <RotateCcw className="h-4 w-4" /> Kjør samme runde uten støtte
        </button>
        {onStartQuiz && (
          <button
            type="button"
            onClick={onStartQuiz}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-indigo-500"
          >
            Test deg med oppgaver <ArrowRight className="h-4 w-4" />
          </button>
        )}
        <button
          type="button"
          onClick={onRestart}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-600 bg-slate-800 px-4 py-2.5 text-sm font-bold text-slate-200 transition-colors hover:bg-slate-700"
        >
          Se gjennomgangen igjen
        </button>
        <button
          type="button"
          onClick={onPickAnotherTopic}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-bold text-slate-300 transition-colors hover:bg-slate-800"
        >
          Velg et annet tema
        </button>
      </div>
    </div>
  );
};

export default GuidedSummaryPanel;
