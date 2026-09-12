import React from 'react';
import { Trophy, ArrowRight, RefreshCw } from 'lucide-react';

interface QuizSummaryModalProps {
  scoreSummary: { correctCount: number; totalScore: number; percentage: number };
  totalTasks: number;
  onRestart: () => void;
  onGoHome: () => void;
}

export const QuizSummaryModal: React.FC<QuizSummaryModalProps> = ({
  scoreSummary,
  totalTasks,
  onRestart,
  onGoHome,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 mx-auto mb-4 shadow-lg shadow-amber-500/20">
          <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center">
            <Trophy className="w-8 h-8 text-amber-400" />
          </div>
        </div>

        <h2 className="text-2xl font-extrabold text-white mb-2">
          Sesjon Fullført!
        </h2>
        <p className="text-sm text-slate-400 mb-6">
          Flott innsats! Her er oppsummeringen av resultatet ditt:
        </p>

        {/* Score Ring / Badge */}
        <div className="my-6 p-6 rounded-2xl bg-slate-800/80 border border-slate-700">
          <div className="text-4xl font-extrabold bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent mb-1">
            {scoreSummary.percentage}%
          </div>
          <div className="text-sm text-slate-300 font-semibold">
            {scoreSummary.correctCount} av {totalTasks} oppgaver riktig besvart
          </div>
        </div>

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
