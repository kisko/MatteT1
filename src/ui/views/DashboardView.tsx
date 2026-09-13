import { Task } from '../../domain/model/task/Task.js';
import { COMPETENCE_MATRIX } from '../../domain/curriculum/CompetenceMatrix.js';
import React from 'react';
import { Lk20Topic1T } from '../../domain/model/task/value-objects/Lk20Category.js';
import { UserProgress } from '../../domain/model/progress/UserProgress.js';
import { CategoryCard } from '../components/CategoryCard.js';
import { Sparkles, BookOpenCheck, Target, Timer } from 'lucide-react';

interface DashboardViewProps {
  progress: UserProgress;
  taskCatalog: readonly Task[];
  onStartTopic: (topic: Lk20Topic1T) => void;
  onStartGoal: (topic: Lk20Topic1T, goalLabels: readonly string[]) => void;
  onStartExam: (taskCount?: number) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  progress,
    taskCatalog,
  onStartTopic,
    onStartGoal,
  onStartExam,
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
        <h2 className="text-2xl font-bold text-white mb-2">
          Fagplanemner (MAT09-02)
        </h2>
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

      <section className="mt-12" aria-labelledby="competence-matrix-heading">
        <div className="mb-6">
          <h2 id="competence-matrix-heading" className="text-2xl font-bold text-white mb-2">
            Kompetansemålmatrise
          </h2>
          <p className="text-sm text-slate-400">
            Se hvilke mål oppgavebanken dekker, og hvor det fortsatt trengs mer trening.
          </p>
        </div>
        <div className="space-y-5">
          {COMPETENCE_MATRIX.map((definition) => (
            <div key={definition.topic} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">{definition.title}</h3>
                  <p className="text-sm text-slate-400 mt-1">{definition.description}</p>
                </div>
                <span className="text-xs font-semibold text-slate-400">
                  {taskCatalog.filter((task) => task.category.mainTopic === definition.topic).length} oppgaver totalt
                </span>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {definition.goals.map((goal) => {
                  const availableTasks = taskCatalog.filter(
                    (task) => task.category.mainTopic === definition.topic && goal.taskLabels.includes(task.category.subCompetenceGoal ?? '')
                  ).length;
                  const coverage = Math.min(100, Math.round((availableTasks / goal.targetTasks) * 100));
                  const mastery = goal.taskLabels
                    .map((label) => progress.goalStats.get(label))
                    .filter((stat): stat is NonNullable<typeof stat> => Boolean(stat));
                  const attempted = mastery.reduce((sum, stat) => sum + stat.tasksAttempted, 0);
                  const correct = mastery.reduce((sum, stat) => sum + stat.tasksCorrect, 0);
                  const masteryPercentage = attempted > 0 ? Math.round((correct / attempted) * 100) : null;

                  return (
                    <div key={goal.id} className="rounded-xl border border-slate-800/80 bg-slate-950/50 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-bold tracking-wide text-indigo-300">{goal.id}</p>
                          <h4 className="font-semibold text-slate-100 mt-1">{goal.title}</h4>
                        </div>
                        <span className={`text-xs font-bold ${masteryPercentage !== null && masteryPercentage >= 70 ? 'text-emerald-300' : 'text-amber-300'}`}>
                          {masteryPercentage === null ? 'Ikke prøvd' : `${masteryPercentage}% mestret`}
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed text-slate-400 mt-2">{goal.description}</p>
                      <div className="mt-3 flex items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-800" aria-label={`${coverage}% oppavedekning`}>
                          <div className={`h-full rounded-full ${coverage >= 100 ? 'bg-emerald-400' : 'bg-amber-400'}`} style={{ width: `${coverage}%` }} />
                        </div>
                        <span className="text-[10px] text-slate-500">{availableTasks}/{goal.targetTasks} oppgaver</span>
                      </div>
                      <button
                        onClick={() => onStartGoal(definition.topic, goal.taskLabels)}
                        className="mt-3 text-xs font-semibold text-indigo-300 transition-colors hover:text-indigo-200"
                      >
                        Øv på dette målet
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
