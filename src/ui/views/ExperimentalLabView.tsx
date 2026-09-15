import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Dumbbell,
  Eye,
  FlaskConical,
  Layers3,
  Search,
  Sparkles,
  Target,
} from 'lucide-react';
import { Lk20Topic1T, Lk20TopicNames } from '../../domain/model/task/value-objects/Lk20Category.js';
import { UserProgress } from '../../domain/model/progress/UserProgress.js';
import { GuidedSession } from '../../domain/model/guided/GuidedSession.js';
import { PracticeRun } from '../../domain/model/guided/PracticeRun.js';
import { ExplorationSession } from '../../domain/model/exploration/ExplorationSession.js';
import { GuidedContentCatalog } from '../../domain/curriculum/guided/GuidedContentCatalog.js';
import { templatesForTopic } from '../../domain/curriculum/guided/templates/index.js';
import { ExplorationCatalog } from '../../domain/curriculum/exploration/ExplorationCatalog.js';
import { missionKey } from '../../domain/model/exploration/ExplorationProgressRepository.js';
import { MathView } from '../MathView.js';
import { GuidedSolverStation } from './lab/GuidedSolverStation.js';
import { PracticeStation } from './lab/PracticeStation.js';
import { ExplorationStation } from './lab/ExplorationStation.js';
import { ParabolaSandbox } from './lab/ParabolaSandbox.js';

export type LabStation = 'guided' | 'sandbox';

export interface ExperimentalLabViewProps {
  progress: UserProgress;
  station: LabStation;
  onStationChange: (station: LabStation) => void;
  /** Aktiv veiledet leksjon, eller null. */
  session: GuidedSession | null;
  /** Aktiv øvingsserie, eller null. */
  practiceRun: PracticeRun | null;
  onStartTopic: (topic: Lk20Topic1T) => void;
  onSessionChange: (session: GuidedSession) => void;
  onExitSession: () => void;
  onStartPractice: (templateId: string) => void;
  onPracticeRunChange: (run: PracticeRun) => void;
  onPracticeSessionProgress: (session: GuidedSession) => void;
  onExitPractice: () => void;
  /** Aktiv utforskning, eller null når eleven skal velge. */
  explorationSession: ExplorationSession | null;
  /** Løste oppdrag på tvers av utforskninger, på formen `labId:missionId`. */
  completedMissionKeys: readonly string[];
  onStartExploration: (labId: string) => void;
  onExplorationChange: (session: ExplorationSession) => void;
  onExitExploration: () => void;
  isAnimating: boolean;
  onToggleAnimation: () => void;
  onStartQuiz: (topic: Lk20Topic1T) => void;
  onBack: () => void;
}

const stations: Array<{ id: LabStation; label: string; description: string; icon: React.ReactNode }> = [
  {
    id: 'guided',
    label: 'Mesterlab',
    description: 'Se en utregning gjort riktig, gjør den selv, og øv til metoden sitter.',
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
 * Mesterlab har to nivåer: velg tema, og deretter ferdighet. Hver ferdighet
 * har en gjennomgang du kan se én gang, og en øvingsserie som aldri går tom.
 */
export const ExperimentalLabView: React.FC<ExperimentalLabViewProps> = ({
  progress,
  station,
  onStationChange,
  session,
  practiceRun,
  onStartTopic,
  onSessionChange,
  onExitSession,
  onStartPractice,
  onPracticeRunChange,
  onPracticeSessionProgress,
  onExitPractice,
  explorationSession,
  completedMissionKeys,
  onStartExploration,
  onExplorationChange,
  onExitExploration,
  isAnimating,
  onToggleAnimation,
  onStartQuiz,
  onBack,
}) => {
  const [openTopic, setOpenTopic] = useState<Lk20Topic1T | null>(null);
  const [showClassicSandbox, setShowClassicSandbox] = useState(false);

  const explorations = useMemo(
    () =>
      ExplorationCatalog.all().map((lab) => {
        const completed = lab.missions.filter((mission) =>
          completedMissionKeys.includes(missionKey(lab.id, mission.id))
        ).length;
        return { lab, completed };
      }),
    [completedMissionKeys]
  );

  const topics = useMemo(
    () =>
      GuidedContentCatalog.availableTopics().map((topic) => {
        const content = GuidedContentCatalog.contentForTopic(topic);
        const templates = templatesForTopic(topic);
        const mastery = progress.categoryStats.get(topic)?.masteryPercentage ?? 0;
        const masteredSkills = templates.filter((template) => {
          const stats = progress.goalStats.get(template.skillLabel);
          return stats !== undefined && stats.tasksAttempted >= 3 && stats.masteryPercentage >= 80;
        }).length;
        const variants = templates.reduce((total, template) => total + template.variantCount, 0);

        return { topic, content, templates, mastery, masteredSkills, variants };
      }),
    [progress]
  );

  const openTopicData = openTopic ? topics.find((entry) => entry.topic === openTopic) : undefined;

  const isDrilling = Boolean(practiceRun);
  const isInLesson = Boolean(session) || Boolean(explorationSession) || showClassicSandbox;

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

      {!isDrilling && !isInLesson && (
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
                <span className="mt-1 block text-xs leading-relaxed text-slate-400">
                  {item.description}
                </span>
              </button>
            );
          })}
        </nav>
      )}

      {station === 'sandbox' && explorationSession && (
        <ExplorationStation
          session={explorationSession}
          onSessionChange={onExplorationChange}
          onExit={onExitExploration}
          isAnimating={isAnimating}
          onToggleAnimation={onToggleAnimation}
        />
      )}

      {station === 'sandbox' && !explorationSession && showClassicSandbox && (
        <>
          <button
            type="button"
            onClick={() => setShowClassicSandbox(false)}
            className="mb-5 inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Alle utforskninger
          </button>
          <ParabolaSandbox />
        </>
      )}

      {station === 'sandbox' && !explorationSession && !showClassicSandbox && (
        <>
          <div className="mb-6 max-w-3xl">
            <p className="mb-2 text-sm font-bold uppercase tracking-[0.18em] text-violet-400">
              Utforskerlab
            </p>
            <h1 className="text-3xl font-black tracking-tight text-white sm:text-5xl">
              Dra i årsaken. Se virkningen.
            </h1>
            <p className="mt-3 text-base leading-relaxed text-slate-300">
              Her er det ingen riktig framgangsmåte å følge. Du endrer modellen og ser hva som skjer.
              Hvert oppdrag er noe modellen selv kan bekrefte, så du trenger ingen fasit for å vite at du
              fikk det til.
            </p>
          </div>

          <div className="mb-6 grid gap-2 sm:grid-cols-3">
            {[
              { label: 'Forutsi', text: 'Gjett hva som skjer før du drar.' },
              { label: 'Utforsk', text: 'Endre én parameter om gangen.' },
              { label: 'Forklar', text: 'Vurder påstandene med modellen som bevis.' },
            ].map((phase, index) => (
              <div key={phase.label} className="rounded-xl border border-slate-700/80 bg-slate-900/60 p-3">
                <p className="text-[11px] font-black uppercase tracking-wide text-violet-300">
                  {index + 1}. {phase.label}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">{phase.text}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {explorations.map(({ lab, completed }) => {
              const isComplete = completed === lab.missions.length;

              return (
                <article
                  key={lab.id}
                  className="flex flex-col rounded-2xl border border-slate-700/80 bg-slate-900/70 p-4 transition-colors hover:border-violet-400/50"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        {Lk20TopicNames[lab.topic]} · {lab.goalId}
                      </p>
                      <h2 className="mt-1 text-lg font-bold leading-snug text-white">{lab.title}</h2>
                    </div>
                    {isComplete && (
                      <span
                        className="shrink-0 rounded-lg border border-emerald-400/40 bg-emerald-400/10 p-1.5 text-emerald-300"
                        title="Alle oppdrag er løst"
                      >
                        <Award className="h-4 w-4" />
                      </span>
                    )}
                  </div>

                  <div className="mt-2 text-sm leading-relaxed text-slate-300">
                    <MathView latex={lab.bigQuestion} />
                  </div>

                  <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-lg bg-slate-800/60 px-2.5 py-2">
                      <dt className="text-slate-400">Å dra i</dt>
                      <dd className="font-bold text-slate-100">{lab.parameters.length} parametere</dd>
                    </div>
                    <div className="rounded-lg bg-slate-800/60 px-2.5 py-2">
                      <dt className="text-slate-400">Oppdrag</dt>
                      <dd className="font-bold text-slate-100">
                        {completed} av {lab.missions.length}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-violet-400 to-emerald-400"
                      style={{ width: `${(completed / lab.missions.length) * 100}%` }}
                    />
                  </div>

                  <div className="mt-auto pt-4">
                    <button
                      type="button"
                      onClick={() => onStartExploration(lab.id)}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-400 px-4 py-2.5 text-sm font-black text-slate-950 transition-colors hover:bg-violet-300"
                    >
                      <Layers3 className="h-4 w-4" />
                      {completed > 0 ? 'Utforsk videre' : 'Start utforskning'}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setShowClassicSandbox(true)}
            className="mt-6 w-full rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-4 text-left transition-colors hover:border-slate-500 hover:bg-slate-900/70"
          >
            <span className="flex items-center gap-2 text-sm font-bold text-slate-300">
              <Sparkles className="h-4 w-4 text-cyan-300" /> Klassisk parabelsandkasse
            </span>
            <span className="mt-1 block text-xs leading-relaxed text-slate-500">
              Den opprinnelige utforskningen med hypotesetesting og mellomregning for toppunkt og
              nullpunkter.
            </span>
          </button>
        </>
      )}

      {station === 'guided' && practiceRun && (
        <PracticeStation
          run={practiceRun}
          onRunChange={onPracticeRunChange}
          onSessionProgress={onPracticeSessionProgress}
          onExit={onExitPractice}
        />
      )}

      {station === 'guided' && !practiceRun && session && (
        <GuidedSolverStation
          session={session}
          onSessionChange={onSessionChange}
          onPickAnotherTopic={onExitSession}
          onStartQuiz={() => onStartQuiz(session.topic)}
        />
      )}

      {/* Nivå 2: ferdighetene i ett tema. */}
      {station === 'guided' && !practiceRun && !session && openTopicData && (
        <>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setOpenTopic(null)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" /> Alle temaer
            </button>
            <span className="text-xs text-slate-500">
              {openTopicData.templates.length} ferdigheter · {openTopicData.variants} oppgaver
            </span>
          </div>

          <div className="mb-6 max-w-3xl">
            <p className="mb-2 text-sm font-bold uppercase tracking-[0.18em] text-cyan-400">
              {Lk20TopicNames[openTopicData.topic]}
            </p>
            <h1 className="text-2xl font-black tracking-tight text-white sm:text-4xl">
              Velg hva du vil øve på
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              Se gjennomgangen først hvis metoden er ny. Er du klar til å øve, gir øvingsseriene deg nye
              oppgaver så lenge du vil.
            </p>
          </div>

          {openTopicData.content.walkthrough && (
            <section className="mb-5 rounded-2xl border border-indigo-400/30 bg-indigo-950/20 p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-indigo-300">
                    <Eye className="h-3.5 w-3.5" /> Se det først
                  </p>
                  <h2 className="mt-1 text-lg font-bold text-white">
                    {openTopicData.content.walkthrough.title}
                  </h2>
                  <div className="mt-1.5 text-sm leading-relaxed text-slate-300">
                    <MathView latex={openTopicData.content.walkthrough.situation} />
                  </div>
                  {openTopicData.content.errorHunt && (
                    <p className="mt-2 flex items-start gap-1.5 text-xs leading-relaxed text-fuchsia-200/80">
                      <Search className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      Med feiljakt: {openTopicData.content.errorHunt.title}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => onStartTopic(openTopicData.topic)}
                  className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-black text-white transition-colors hover:bg-indigo-400"
                >
                  Start gjennomgang <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </section>
          )}

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {openTopicData.templates.map((template) => {
              const stats = progress.goalStats.get(template.skillLabel);
              const isMastered =
                stats !== undefined && stats.tasksAttempted >= 3 && stats.masteryPercentage >= 80;

              return (
                <article
                  key={template.id}
                  className="flex flex-col rounded-2xl border border-slate-700/80 bg-slate-900/70 p-4 transition-colors hover:border-emerald-400/50"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        {template.goalId} · {template.skillLabel}
                      </p>
                      <h3 className="mt-1 text-lg font-bold leading-snug text-white">{template.title}</h3>
                    </div>
                    {isMastered && (
                      <span
                        className="shrink-0 rounded-lg border border-emerald-400/40 bg-emerald-400/10 p-1.5 text-emerald-300"
                        title="Ferdigheten er mestret"
                      >
                        <Award className="h-4 w-4" />
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-sm leading-relaxed text-slate-300">{template.description}</p>

                  <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-lg bg-slate-800/60 px-2.5 py-2">
                      <dt className="text-slate-400">Oppgaver</dt>
                      <dd className="font-bold text-slate-100">{template.variantCount}</dd>
                    </div>
                    <div className="rounded-lg bg-slate-800/60 px-2.5 py-2">
                      <dt className="text-slate-400">Mestring</dt>
                      <dd className="font-bold text-slate-100">
                        {stats ? `${stats.masteryPercentage} %` : 'ikke startet'}
                      </dd>
                    </div>
                  </dl>

                  {stats && (
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400"
                        style={{ width: `${stats.masteryPercentage}%` }}
                      />
                    </div>
                  )}

                  <div className="mt-auto pt-4">
                    <button
                      type="button"
                      onClick={() => onStartPractice(template.id)}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-black text-slate-950 transition-colors hover:bg-emerald-300"
                    >
                      <Dumbbell className="h-4 w-4" />
                      {stats ? 'Øv mer' : 'Start øving'}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}

      {/* Nivå 1: temaene. */}
      {station === 'guided' && !practiceRun && !session && !openTopicData && (
        <>
          <div className="mb-6 max-w-3xl">
            <p className="mb-2 text-sm font-bold uppercase tracking-[0.18em] text-cyan-400">Mesterlab</p>
            <h1 className="text-3xl font-black tracking-tight text-white sm:text-5xl">
              Først ser du det. Så øver du til det sitter.
            </h1>
            <p className="mt-3 text-base leading-relaxed text-slate-300">
              Hvert tema har en gjennomgang med feiljakt, og en øvingsserie for hver ferdighet i
              kompetansemålene. Du skriver ingenting – du velger neste steg.
            </p>
          </div>

          <ol className="mb-6 grid list-none gap-2 p-0 sm:grid-cols-4">
            {[
              { label: 'Se det', text: 'Utregningen rulles ut med bilde ved hver linje.' },
              { label: 'Gjør det', text: 'Du velger neste lovlige steg selv.' },
              { label: 'Øv', text: 'Nye tall hver gang, så lenge du vil.' },
              { label: 'Mestre', text: 'Tre feilfrie på rad, og ferdigheten er din.' },
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
            {topics.map(({ topic, templates, mastery, masteredSkills, variants }) => (
              <button
                key={topic}
                type="button"
                onClick={() => setOpenTopic(topic)}
                className="flex flex-col rounded-2xl border border-slate-700/80 bg-slate-900/70 p-4 text-left transition-colors hover:border-cyan-400/50 hover:bg-slate-800/70"
              >
                <div className="flex w-full items-start justify-between gap-2">
                  <h2 className="text-lg font-bold leading-snug text-white">{Lk20TopicNames[topic]}</h2>
                  {masteredSkills > 0 && (
                    <span className="shrink-0 rounded-lg border border-emerald-400/40 bg-emerald-400/10 px-2 py-1 text-[10px] font-black text-emerald-300">
                      {masteredSkills}/{templates.length} mestret
                    </span>
                  )}
                </div>

                <p className="mt-2 text-xs leading-relaxed text-slate-400">
                  {templates.length} ferdigheter · {variants} oppgaver å øve på
                </p>

                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400"
                    style={{ width: `${mastery}%` }}
                  />
                </div>
                <p className="mt-1.5 text-[11px] text-slate-500">
                  {mastery > 0 ? `${mastery} % mestring på temaet` : 'ikke startet'}
                </p>

                <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-cyan-300">
                  Velg ferdighet <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </button>
            ))}
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
