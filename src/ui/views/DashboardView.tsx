import { Task } from '../../domain/model/task/Task.js';
import { COMPETENCE_MATRIX } from '../../domain/curriculum/CompetenceMatrix.js';
import React from 'react';
import { Lk20Topic1T } from '../../domain/model/task/value-objects/Lk20Category.js';
import { UserProgress } from '../../domain/model/progress/UserProgress.js';
import { MISCONCEPTION_INFO, MisconceptionType } from '../../domain/model/task/Misconception.js';
import { CategoryCard } from '../components/CategoryCard.js';
import { Sparkles, BookOpenCheck, Target, Timer, TableProperties, AlertTriangle, Lightbulb } from 'lucide-react';

interface DashboardViewProps {
  progress: UserProgress;
  taskCatalog: readonly Task[];
  onStartTopic: (topic: Lk20Topic1T) => void;
  onStartGoal: (topic: Lk20Topic1T, goalLabels: readonly string[]) => void;
  onStartExam: (taskCount?: number) => void;
  onOpenMatrix: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  progress,
  taskCatalog,
  onStartTopic,
  onStartGoal,
  onStartExam,
  onOpenMatrix,
}) => {
  const topics = Object.values(Lk20Topic1T);

  // Sikker beregning av total mestring (defensiv moduler)
  const categoryStatsList = progress?.categoryStats ? Array.from(progress.categoryStats.values()) : [];
  const totalAttempted = categoryStatsList.reduce((acc, curr) => acc + (curr?.tasksAttempted ?? 0), 0);
  const totalCorrect = categoryStatsList.reduce((acc, curr) => acc + (curr?.tasksCorrect ?? 0), 0);
  const overallMastery = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;

  const weakestGoal = COMPETENCE_MATRIX
    .flatMap((definition) => definition.goals.map((goal) => ({ definition, goal })))
    .map(({ definition, goal }) => {
      const stats = goal.taskLabels
        .map((label) => progress?.goalStats?.get(label))
        .filter((stat): stat is NonNullable<typeof stat> => Boolean(stat));
      const attempted = stats.reduce((sum, stat) => sum + (stat.tasksAttempted ?? 0), 0);
      const correct = stats.reduce((sum, stat) => sum + (stat.tasksCorrect ?? 0), 0);
      return {
        definition,
        goal,
        attempted,
        mastery: attempted > 0 ? Math.round((correct / attempted) * 100) : -1,
      };
    })
    .filter((item) => item.definition.core)
    .sort((a, b) => a.mastery - b.mastery || a.attempted - b.attempted)[0];

  const hasMisconceptions = Boolean(progress?.misconceptionStats && progress.misconceptionStats.size > 0);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 w-full min-w-0 overflow-hidden">
      {/* Hero Banner - Fokus og Kognitiv balanse */}
      <div className="light-hero relative rounded-2xl sm:rounded-3xl bg-linear-to-r from-indigo-900/90 via-purple-900/80 to-slate-900 border border-indigo-500/30 p-5 sm:p-8 lg:p-10 mb-6 sm:mb-10 overflow-hidden shadow-2xl">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 text-xs font-bold mb-3 sm:mb-4">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>LK20 MAT09-02 · 1T-Matematikk</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-2 sm:mb-3">
            Lær hele matematikk 1T
          </h1>
          <p className="text-slate-300 text-sm sm:text-lg leading-relaxed mb-5 sm:mb-6">
            Bygg forståelse steg for steg med interaktive leksjoner, utforsk eksempler og øv med målrettet pedagogisk veiledning.
          </p>

          {/* Aksjons-knapper */}
          <div className="mb-6 flex flex-col sm:flex-row flex-wrap gap-2.5 sm:gap-3">
            <button
              onClick={() => onStartExam(12)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-400/50 bg-amber-400/15 px-4 py-3 text-xs sm:text-sm font-bold text-amber-200 transition-colors hover:bg-amber-400/25 active:scale-98"
            >
              <Timer className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Hurtig-test · 12 oppgaver (45 min)</span>
            </button>
            <button
              onClick={() => onStartExam(24)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-400/50 bg-indigo-400/15 px-4 py-3 text-xs sm:text-sm font-bold text-indigo-200 transition-colors hover:bg-indigo-400/25 active:scale-98"
            >
              <BookOpenCheck className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Full eksamensøkt · 24 oppgaver</span>
            </button>
          </div>

          {/* Mestringssammendrag */}
          <div className="flex items-center gap-6 pt-3 border-t border-slate-700/50">
            <div className="flex items-center gap-2.5">
              <div className="p-2 sm:p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-indigo-400">
                <Target className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <div className="text-[11px] sm:text-xs text-slate-400">Total mestring</div>
                <div className="text-base sm:text-lg font-bold text-white">{overallMastery}%</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="p-2 sm:p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-emerald-400">
                <BookOpenCheck className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <div className="text-[11px] sm:text-xs text-slate-400">Løste oppgaver</div>
                <div className="text-base sm:text-lg font-bold text-white">{progress?.totalSolved ?? 0}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Anbefalt neste steg (ZPD / Zone of Proximal Development) */}
      {weakestGoal && (
        <section className="mb-6 sm:mb-8 rounded-2xl border border-amber-400/30 bg-amber-950/20 p-4 sm:p-5" aria-labelledby="next-step-heading">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <p className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-amber-300">Anbefalt fokus for deg</p>
              <h2 id="next-step-heading" className="mt-0.5 text-base sm:text-lg font-bold text-white">
                {weakestGoal.mastery < 0 ? 'Start med' : 'Repeter'} {weakestGoal.goal.title}
              </h2>
              <p className="mt-0.5 text-xs sm:text-sm text-slate-300">
                {weakestGoal.mastery < 0
                  ? 'Dette kompetansemålet er et kjerneområde i læreplanen du kan starte på nå.'
                  : `Du har ${weakestGoal.mastery}% mestring på ${weakestGoal.attempted} forsøk.`}
              </p>
            </div>
            <button
              onClick={() => onStartTopic(weakestGoal.definition.topic)}
              className="w-full sm:w-auto shrink-0 rounded-xl bg-amber-500 px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-950 transition-colors hover:bg-amber-400 text-center"
            >
              Åpne emnemodul
            </button>
          </div>
        </section>
      )}

      {/* Pedagogisk misoppfatningsdiagnose */}
      {hasMisconceptions && (
        <section className="mb-6 sm:mb-8 rounded-2xl border border-rose-500/30 bg-rose-950/20 p-4 sm:p-5" aria-labelledby="diagnosis-heading">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0" />
            <h3 id="diagnosis-heading" className="text-sm sm:text-base font-bold text-white">
              Pedagogisk analyse: Misoppfatninger å være oppmerksom på
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from(progress.misconceptionStats.entries()).map(([miscType, count]) => {
              const info = MISCONCEPTION_INFO[miscType as Exclude<MisconceptionType, MisconceptionType.NONE>];
              if (!info) return null;
              return (
                <div key={miscType} className="rounded-xl border border-rose-500/20 bg-slate-900/80 p-3.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs sm:text-sm font-bold text-rose-200">{info.title}</span>
                    <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300">
                      {count} {count === 1 ? 'gang' : 'ganger'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{info.tip}</p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Emneoversikt (Grid of Categories) */}
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 mb-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Fagplanemner (1T MAT09-02)
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Velg et emne for å lese leksjonen eller starte oppgaver.
            </p>
          </div>
          <button
            onClick={onOpenMatrix}
            className="self-start sm:self-auto inline-flex items-center gap-2 rounded-lg border border-indigo-400/40 bg-indigo-500/10 px-3 py-2 text-xs sm:text-sm font-semibold text-indigo-200 transition-colors hover:bg-indigo-500/20"
          >
            <TableProperties className="h-4 w-4" />
            Kompetansemålmatrise
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {topics.map((topic) => {
          const mastery = progress?.categoryStats?.get(topic) || {
            topic,
            tasksAttempted: 0,
            tasksCorrect: 0,
            masteryPercentage: 0,
          };

          return (
            <CategoryCard
              key={topic}
              topic={topic}
              mastery={mastery}
              onStart={onStartTopic}
            />
          );
        })}
      </div>

    </div>
  );
};
