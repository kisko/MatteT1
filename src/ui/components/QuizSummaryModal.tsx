import React from 'react';
import { Trophy, ArrowRight, RefreshCw } from 'lucide-react';
import { TopicScoreSummary } from '../../domain/model/quiz/QuizSession.js';
import { Lk20TopicNames } from '../../domain/model/task/value-objects/Lk20Category.js';

interface QuizSummaryModalProps {
  scoreSummary: {
    correctCount: number;
    answeredCount: number;
    unansweredCount: number;
    reasoningCount: number;
    totalScore: number;
    percentage: number;
  };
  totalTasks: number;
  topicScores: readonly TopicScoreSummary[];
  isExamMode: boolean;
  onRestart: () => void;
  onGoHome: () => void;
}

export const QuizSummaryModal: React.FC<QuizSummaryModalProps> = ({
  scoreSummary,
  totalTasks,
  topicScores,
  isExamMode,
  onRestart,
  onGoHome,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md max-h-[calc(100dvh-2rem)] overflow-y-auto bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-5 sm:p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-linear-to-tr from-amber-500 to-yellow-300 p-0.5 mx-auto mb-4 shadow-lg shadow-amber-500/20">
          <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center">
            <Trophy className="w-8 h-8 text-amber-400" />
          </div>
        </div>

        <h2 className="text-2xl font-extrabold text-white mb-2">
          {isExamMode ? 'Eksamenstrening levert!' : 'Sesjon Fullført!'}
        </h2>
        <p className="text-sm text-slate-400 mb-6">
          {isExamMode ? 'Her er resultatet fra den blandede økten.' : 'Flott innsats! Her er oppsummeringen av resultatet ditt:'}
        </p>

        {/* Score Ring / Badge */}
        <div className="my-6 p-6 rounded-2xl bg-slate-800/80 border border-slate-700">
          <div className="text-4xl font-extrabold bg-linear-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent mb-1">
            {scoreSummary.percentage}%
          </div>
          <div className="text-sm text-slate-300 font-semibold">
            {scoreSummary.correctCount} av {totalTasks} oppgaver riktig besvart
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-400">
            <span>{scoreSummary.totalScore.toFixed(1)} / {totalTasks} poeng</span>
            <span>{scoreSummary.unansweredCount} ubesvart</span>
            {isExamMode && <span className="col-span-2">{scoreSummary.reasoningCount} begrunnelser levert</span>}
          </div>
        </div>

        {topicScores.length > 0 && (
          <div className="mb-6 text-left">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Resultat per modul</h3>
            <div className="space-y-2">
              {topicScores.map((topicScore) => (
                <div key={topicScore.topic} className="rounded-xl border border-slate-800 bg-slate-950/50 px-3 py-2">
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <span className="truncate text-slate-300">{Lk20TopicNames[topicScore.topic]}</span>
                    <span className={topicScore.percentage >= 70 ? 'text-emerald-300' : 'text-amber-300'}>
                      {topicScore.correctCount}/{topicScore.totalTasks} ({topicScore.percentage}%)
                    </span>
                  </div>
                  <div className="mt-1 h-1 overflow-hidden rounded-full bg-slate-800">
                    <div className="h-full rounded-full bg-indigo-400" style={{ width: `${topicScore.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={onRestart}
            className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Prøv på nytt</span>
          </button>

          <button
            onClick={onGoHome}
            className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 transition-colors flex items-center justify-center gap-2"
          >
            <span>Tilbake til oversikten</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
