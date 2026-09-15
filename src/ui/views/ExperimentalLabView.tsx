import React, { useMemo } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  FlaskConical,
  Layers3,
  Search,
  Sparkles,
  Target,
} from 'lucide-react';
import { Lk20Topic1T, Lk20TopicNames } from '../../domain/model/task/value-objects/Lk20Category.js';
import { UserProgress } from '../../domain/model/progress/UserProgress.js';
import { GuidedSession } from '../../domain/model/guided/GuidedSession.js';
import { GuidedContentCatalog } from '../../domain/curriculum/guided/GuidedContentCatalog.js';
import { GuidedSolverService } from '../../domain/services/GuidedSolverService.js';
import { MathView } from '../MathView.js';
import { GuidedSolverStation } from './lab/GuidedSolverStation.js';
import { ParabolaSandbox } from './lab/ParabolaSandbox.js';

export type LabStation = 'guided' | 'sandbox';

export interface ExperimentalLabViewProps {
  progress: UserProgress;
  station: LabStation;
  onStationChange: (station: LabStation) => void;
  /** Aktiv veiledet økt, eller null når eleven skal velge tema. */
  session: GuidedSession | null;
  onStartTopic: (topic: Lk20Topic1T) => void;
  onSessionChange: (session: GuidedSession) => void;
  onExitSession: () => void;
  onStartQuiz: (topic: Lk20Topic1T) => void;
  onBack: () => void;
}

const stations: Array<{ id: LabStation; label: string; description: string; icon: React.ReactNode }> = [
  {
    id: 'guided',
    label: 'Mesterlab',
    description: 'Se en utregning gjort riktig, gjør den selv, og jakt den typiske feilen.',
    icon: <Target className="h-4 w-4" />,
  },
  {
    id: 'sandbox',
    label: 'Utforskerlab',
    description: 'Dra i koeffisientene og undersøk hva som skjer med grafen.',
    icon: <Layers3 className="h-4 w-4" />,
  },
];

/**
 * Laben er en hub med to stasjoner.
 *
 * Mesterlab er den veiledede veien: vist først, så gjort selv, med feiljakt til
 * slutt. Utforskerlab er den åpne sandkassen. De to utfyller hverandre – den
 * ene bygger framgangsmåte, den andre bygger intuisjon.
 */
export const ExperimentalLabView: React.FC<ExperimentalLabViewProps> = ({
  progress,
  station,
  onStationChange,
  session,
  onStartTopic,
  onSessionChange,
  onExitSession,
  onStartQuiz,
  onBack,
}) => {
  const topics = useMemo(() => {
    return GuidedContentCatalog.availableTopics().map((topic) => {
      const content = GuidedContentCatalog.contentForTopic(topic);
      const mastery = progress.categoryStats.get(topic)?.masteryPercentage ?? 0;
      const skillLabel = content.walkthrough?.skillLabel;
      const skillStats = skillLabel ? progress.goalStats.get(skillLabel) : undefined;
      return { topic, content, mastery, skillStats };
    });
  }, [progress]);

  return (
    <div className="mx-auto max-w-7xl px-3 py-5 sm:px-6 sm:py-8 lg:px-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Til alle moduler
        </button>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-cyan-300">
          <FlaskConical className="h-3.5 w-3.5" /> Laboratorium
        </span>
      </div>

      <nav aria-label="Stasjoner i laboratoriet" className="mb-6 grid gap-2.5 sm:grid-cols-2">
        {stations.map((item) => {
          const isActive = station === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onStationChange(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`rounded-2xl border p-3.5 text-left transition-all sm:p-4 ${
                isActive
                  ? 'border-cyan-400/60 bg-cyan-500/10 shadow-lg shadow-cyan-950/30'
                  : 'border-slate-700 bg-slate-900/60 hover:border-slate-500 hover:bg-slate-800/70'
              }`}
            >
              <span
                className={`inline-flex items-center gap-2 text-sm font-black ${
                  isActive ? 'text-cyan-100' : 'text-slate-200'
                }`}
              >
                {item.icon} {item.label}
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-slate-400">{item.description}</span>
            </button>
          );
        })}
      </nav>

      {station === 'sandbox' && <ParabolaSandbox />}

      {station === 'guided' && session && (
        <GuidedSolverStation
          session={session}
          onSessionChange={onSessionChange}
          onPickAnotherTopic={onExitSession}
          onStartQuiz={() => onStartQuiz(session.topic)}
        />
      )}

      {station === 'guided' && !session && (
        <>
          <div className="mb-6 max-w-3xl">
            <p className="mb-2 text-sm font-bold uppercase tracking-[0.18em] text-cyan-400">Mesterlab</p>
            <h1 className="text-3xl font-black tracking-tight text-white sm:text-5xl">
              Først ser du det. Så gjør du det.
            </h1>
            <p className="mt-3 text-base leading-relaxed text-slate-300">
              Hvert tema har én utregning som vises steg for steg, og én feiljakt der du finner tabben en
              annen elev gjorde. Du skriver ingenting – du velger neste steg.
            </p>
          </div>

          <ol className="mb-6 grid list-none gap-2 p-0 sm:grid-cols-4">
            {[
              { label: 'Se det', text: 'Utregningen rulles ut med bilde ved hver linje.' },
              { label: 'Gjør det', text: 'Du velger neste lovlige steg selv.' },
              { label: 'Finn feilen', text: 'Du retter en typisk elevfeil.' },
              { label: 'Kontroll', text: 'Poeng, nivå og hva som sitter.' },
            ].map((phase, index) => (
              <li key={phase.label} className="rounded-xl border border-slate-700/80 bg-slate-900/60 p-3">
                <p className="text-[11px] font-black uppercase tracking-wide text-cyan-300">
                  {index + 1}. {phase.label}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">{phase.text}</p>
              </li>
            ))}
          </ol>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {topics.map(({ topic, content, mastery, skillStats }) => {
              const walkthrough = content.walkthrough;
              if (!walkthrough) return null;
              const level = GuidedSolverService.masteryLevel(mastery / 100);

              return (
                <article
                  key={topic}
                  className="flex flex-col rounded-2xl border border-slate-700/80 bg-slate-900/70 p-4 transition-colors hover:border-cyan-400/50"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        {Lk20TopicNames[topic]}
                      </p>
                      <h2 className="mt-1 text-lg font-bold leading-snug text-white">{walkthrough.title}</h2>
                    </div>
                    <span className="shrink-0 rounded-lg border border-slate-700 bg-slate-950/60 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                      {walkthrough.goalId}
                    </span>
                  </div>

                  <div className="mt-2.5 text-sm leading-relaxed text-slate-300">
                    <MathView latex={walkthrough.situation} />
                  </div>

                  <div className="mt-3 rounded-xl border border-slate-700/70 bg-slate-950/50 px-3 py-2">
                    <MathView latex={walkthrough.problemLatex} />
                  </div>

                  <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-lg bg-slate-800/60 px-2.5 py-2">
                      <dt className="text-slate-400">Steg</dt>
                      <dd className="font-bold text-slate-100">{walkthrough.stepCount}</dd>
                    </div>
                    <div className="rounded-lg bg-slate-800/60 px-2.5 py-2">
                      <dt className="text-slate-400">Mestring</dt>
                      <dd className="font-bold text-slate-100">
                        {skillStats ? `${mastery} %` : 'ikke startet'}
                      </dd>
                    </div>
                  </dl>

                  {skillStats && (
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400"
                        style={{ width: `${mastery}%` }}
                      />
                    </div>
                  )}

                  {content.errorHunt && (
                    <p className="mt-3 flex items-start gap-1.5 text-xs leading-relaxed text-fuchsia-200/80">
                      <Search className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      Feiljakt: {content.errorHunt.title}
                    </p>
                  )}

                  <div className="mt-auto pt-4">
                    <button
                      type="button"
                      onClick={() => onStartTopic(topic)}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-black text-slate-950 transition-colors hover:bg-cyan-300"
                    >
                      {skillStats ? 'Kjør igjen' : 'Start'}
                      <ArrowRight className="h-4 w-4" />
                    </button>
                    {skillStats && (
                      <p className="mt-2 text-center text-[11px] text-slate-500">
                        Nivå: {level} · {skillStats.tasksCorrect} av {skillStats.tasksAttempted} steg klart selv
                      </p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>

          <p className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
            <Sparkles className="h-3.5 w-3.5" /> Alt du gjør her teller inn i mestringen din på temaet.
          </p>
        </>
      )}
    </div>
  );
};

export default ExperimentalLabView;
