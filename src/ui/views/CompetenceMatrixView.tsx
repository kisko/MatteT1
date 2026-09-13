import React, { useState } from 'react';
import { COMPETENCE_MATRIX } from '../../domain/curriculum/CompetenceMatrix.js';
import { Lk20Topic1T } from '../../domain/model/task/value-objects/Lk20Category.js';
import { UserProgress } from '../../domain/model/progress/UserProgress.js';
import { Task } from '../../domain/model/task/Task.js';
import { ArrowRight, BookOpen, Crosshair, TableProperties } from 'lucide-react';

interface CompetenceMatrixViewProps {
  progress: UserProgress;
  taskCatalog: readonly Task[];
  onOpenModule: (topic: Lk20Topic1T) => void;
  onStartGoal: (topic: Lk20Topic1T, goalLabels: readonly string[]) => void;
}

export const CompetenceMatrixView: React.FC<CompetenceMatrixViewProps> = ({
  progress,
  taskCatalog,
  onOpenModule,
  onStartGoal,
}) => {
  const [selectedTopic, setSelectedTopic] = useState<Lk20Topic1T | 'all'>('all');
  const visibleTopics = selectedTopic === 'all'
    ? COMPETENCE_MATRIX
    : COMPETENCE_MATRIX.filter((definition) => definition.topic === selectedTopic);

  return (
    <div className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-6 lg:px-8 w-full min-w-0 overflow-hidden">
      <header className="mb-6 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
        <div>
          <div className="mb-1.5 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-indigo-300">
            <TableProperties className="h-4 w-4" /> Kompetanseoversikt
          </div>
          <h1 className="text-xl font-black text-white sm:text-3xl">Kompetansemålmatrise</h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">Velg et mål for presis trening, eller åpne hele treningsmodulen.</p>
        </div>
        <label className="flex w-full sm:w-auto flex-col gap-1 text-xs sm:text-sm font-semibold text-slate-300">
          <span>Vis tema</span>
          <select
            value={selectedTopic}
            onChange={(event) => setSelectedTopic(event.target.value as Lk20Topic1T | 'all')}
            className="w-full sm:w-auto rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs sm:text-sm text-slate-100 outline-none focus:border-indigo-400"
          >
            <option value="all">Alle tema</option>
            {COMPETENCE_MATRIX.map((definition) => <option key={definition.topic} value={definition.topic}>{definition.title}</option>)}
          </select>
        </label>
      </header>

      <div className="space-y-6">
        {visibleTopics.map((definition) => {
          const topicTasks = taskCatalog.filter((task) => task.category.mainTopic === definition.topic).length;
          return (
            <section key={definition.topic} className="border-t border-slate-800 pt-5 first:border-t-0 first:pt-0" aria-labelledby={`topic-${definition.topic}`}>
              <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h2 id={`topic-${definition.topic}`} className="text-lg sm:text-xl font-bold text-white">{definition.title}</h2>
                  <p className="mt-0.5 text-xs sm:text-sm text-slate-400">{definition.description}</p>
                </div>
                <button onClick={() => onOpenModule(definition.topic)} className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs sm:text-sm font-semibold text-slate-200 hover:border-indigo-400 hover:text-white">
                  <BookOpen className="h-4 w-4" /> Åpne modul
                </button>
              </div>
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {definition.goals.map((goal) => {
                  const availableTasks = taskCatalog.filter((task) => task.category.mainTopic === definition.topic && goal.taskLabels.includes(task.category.subCompetenceGoal ?? '')).length;
                  const stats = goal.taskLabels.map((label) => progress?.goalStats?.get(label)).filter((stat): stat is NonNullable<typeof stat> => Boolean(stat));
                  const attempted = stats.reduce((sum, stat) => sum + (stat.tasksAttempted ?? 0), 0);
                  const correct = stats.reduce((sum, stat) => sum + (stat.tasksCorrect ?? 0), 0);
                  const mastery = attempted > 0 ? Math.round((correct / attempted) * 100) : null;
                  return (
                    <article key={goal.id} className="flex min-h-44 flex-col rounded-xl border border-slate-800 bg-slate-900/60 p-4 transition-colors hover:border-slate-700">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold text-indigo-300">{goal.id}</span>
                        <span className={mastery !== null && mastery >= 70 ? 'text-xs font-bold text-emerald-300' : 'text-xs font-bold text-amber-300'}>{mastery === null ? 'Ikke prøvd' : `${mastery}%`}</span>
                      </div>
                      <h3 className="mt-2 text-sm sm:text-base font-bold text-slate-100">{goal.title}</h3>
                      <p className="mt-1.5 text-xs leading-relaxed text-slate-400">{goal.description}</p>
                      <div className="mt-auto pt-4">
                        <div className="mb-2.5 flex items-center justify-between text-[11px] text-slate-500"><span>{availableTasks}/{goal.targetTasks} oppgaver</span><span>{attempted} forsøk</span></div>
                        <button onClick={() => onStartGoal(definition.topic, goal.taskLabels)} className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-indigo-300 hover:text-indigo-200">
                          <Crosshair className="h-4 w-4" /> Tren målrettet <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
              <p className="mt-3 text-xs text-slate-500">{topicTasks} oppgaver i modulen</p>
            </section>
          );
        })}
      </div>
    </div>
  );
};