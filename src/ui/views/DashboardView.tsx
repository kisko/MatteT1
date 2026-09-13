import { Task } from '../../domain/model/task/Task.js';
import { COMPETENCE_MATRIX } from '../../domain/curriculum/CompetenceMatrix.js';
import React from 'react';
import { Lk20Topic1T } from '../../domain/model/task/value-objects/Lk20Category.js';
import { UserProgress } from '../../domain/model/progress/UserProgress.js';
import { CategoryCard } from '../components/CategoryCard.js';
import { Sparkles, BookOpenCheck, Target, Timer, TableProperties } from 'lucide-react';

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

  // Beregn total mestring
  const totalAttempted = Array.from(progress.categoryStats.values()).reduce(
    (acc, curr) => acc + curr.tasksAttempted,
    0
  );
  const totalCorrect = Array.from(progress.categoryStats.values()).reduce(
    (acc, curr) => acc + curr.tasksCorrect,
    0
  );
  const overallMastery = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;
  const weakestGoal = COMPETENCE_MATRIX
    .flatMap((definition) => definition.goals.map((goal) => ({ definition, goal })))
    .map(({ definition, goal }) => {
      const stats = goal.taskLabels
        .map((label) => progress.goalStats.get(label))
        .filter((stat): stat is NonNullable<typeof stat> => Boolean(stat));
      const attempted = stats.reduce((sum, stat) => sum + stat.tasksAttempted, 0);
      const correct = stats.reduce((sum, stat) => sum + stat.tasksCorrect, 0);
      return {
        definition,
        goal,
        attempted,
        mastery: attempted > 0 ? Math.round((correct / attempted) * 100) : -1,
      };
    })
    .filter((item) => item.definition.core)
    .sort((a, b) => a.mastery - b.mastery || a.attempted - b.attempted)[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Banner */}
      <div className="light-hero relative rounded-3xl bg-linear-to-r from-indigo-900/90 via-purple-900/80 to-slate-900 border border-indigo-500/30 p-8 sm:p-10 mb-10 overflow-hidden shadow-2xl">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 text-xs font-bold mb-4">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Gjeldende MAT09-02 · 1T</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-3">
            Lær hele matematikk 1T
          </h1>
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed mb-6">
            Følg komplette leksjoner, bygg forståelse trinn for trinn og øv med oppgaver som gir forklaringer og pedagogiske hint ved feilsvar.
          </p>

          <div className="mb-6 flex flex-wrap gap-3">
            <button
              onClick={() => onStartExam(12)}
              className="inline-flex items-center gap-2 rounded-xl border border-amber-400/50 bg-amber-400/15 px-4 py-3 text-sm font-bold text-amber-200 transition-colors hover:bg-amber-400/25"
            >
              <Timer className="h-5 w-5" />
              <span>Kort eksamen · 12 oppgaver · 45 min</span>
            </button>
            <button
              onClick={() => onStartExam(24)}
              className="inline-flex items-center gap-2 rounded-xl border border-indigo-400/50 bg-indigo-400/15 px-4 py-3 text-sm font-bold text-indigo-200 transition-colors hover:bg-indigo-400/25"
            >
              <BookOpenCheck className="h-5 w-5" />
              <span>Full økt · 24 oppgaver · 90 min</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-6 pt-2 border-t border-slate-700/50">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-indigo-400">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-400">Total mestring</div>
                <div className="text-lg font-bold text-white">{overallMastery}%</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-emerald-400">
                <BookOpenCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-400">Løste oppgaver</div>
                <div className="text-lg font-bold text-white">{progress.totalSolved}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Emneoversikt (Grid of Categories) */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <h2 className="text-2xl font-bold text-white">
          Fagplanemner (MAT09-02)
          </h2>
          <button
            onClick={onOpenMatrix}
            className="inline-flex items-center gap-2 rounded-lg border border-indigo-400/40 bg-indigo-500/10 px-3 py-2 text-sm font-semibold text-indigo-200 transition-colors hover:bg-indigo-500/20"
          >
            <TableProperties className="h-4 w-4" />
            Kompetansemål
          </button>
        </div>
        <p className="text-sm text-slate-400">
          Start med leksjonen. Hovedemnene dekker kompetansemålene; sannsynlighet ligger som ekstra repetisjon.
        </p>
      </div>

      {weakestGoal && (
        <section className="mb-8 rounded-2xl border border-amber-400/30 bg-amber-950/20 p-5" aria-labelledby="next-step-heading">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-amber-300">Anbefalt neste steg</p>
              <h2 id="next-step-heading" className="mt-1 text-lg font-bold text-white">
                {weakestGoal.mastery < 0 ? 'Start med' : 'Repeter'} {weakestGoal.goal.title}
              </h2>
              <p className="mt-1 text-sm text-slate-300">
                {weakestGoal.mastery < 0
                  ? 'Dette kompetansemålet er ikke prøvd ennå.'
                  : `Du har ${weakestGoal.mastery}% riktig på ${weakestGoal.attempted} forsøk.`}
              </p>
            </div>
            <button
              onClick={() => onStartTopic(weakestGoal.definition.topic)}
              className="rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-slate-950 transition-colors hover:bg-amber-400"
            >
              Gå til modulen
            </button>
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {topics.map((topic) => {
          const mastery = progress.categoryStats.get(topic) || {
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
