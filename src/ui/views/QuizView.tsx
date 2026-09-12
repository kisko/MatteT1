import React, { useState } from 'react';
import { QuizSession } from '../../domain/model/quiz/QuizSession.js';
import { AnswerValue } from '../../domain/model/task/value-objects/StudentAnswer.js';
import { ExtendedEvaluationResult } from '../../domain/services/TaskEvaluatorService.js';
import { QuizCard } from '../components/QuizCard.js';
import { QuizSummaryModal } from '../components/QuizSummaryModal.js';
import { ArrowLeft } from 'lucide-react';

interface QuizViewProps {
  session: QuizSession;
  onSubmitAnswer: (answerValue: AnswerValue, hintsUsedCount: number) => Promise<ExtendedEvaluationResult | null>;
  onGoHome: () => void;
  onRestart: () => void;
}

export const QuizView: React.FC<QuizViewProps> = ({
  session,
  onSubmitAnswer,
  onGoHome,
  onRestart,
}) => {
  const [isCompleted, setIsCompleted] = useState(session.isCompleted);
  const task = session.currentTask;

  const handleNextTask = () => {
    const hasMore = session.nextTask();
    if (!hasMore) {
      setIsCompleted(true);
    }
  };

  if (!task) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <h2 className="text-xl font-bold text-white mb-4">Ingen oppgaver tilgjengelig.</h2>
        <button
          onClick={onGoHome}
          className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold"
        >
          Gå tilbake til dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button & Header */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={onGoHome}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-2 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Avbryt økt</span>
        </button>

        <span className="text-sm font-bold text-indigo-300">
          Øving: {session.topicTitle.replace(/_/g, ' ')}
        </span>
      </div>

      {/* Active Task Card */}
      <QuizCard
        task={task}
        taskIndex={session.currentIndex}
        totalTasks={session.totalTasks}
        onSubmitAnswer={onSubmitAnswer}
        onNextTask={handleNextTask}
        isLastTask={session.currentIndex === session.totalTasks - 1}
      />

      {/* Summary Modal upon Completion */}
      {isCompleted && (
        <QuizSummaryModal
          scoreSummary={session.calculateTotalScore()}
          totalTasks={session.totalTasks}
          onRestart={onRestart}
          onGoHome={onGoHome}
        />
      )}
    </div>
  );
};
