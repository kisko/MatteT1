import React, { useEffect, useState } from 'react';
import { QuizSession } from '../../domain/model/quiz/QuizSession.js';
import { AnswerValue } from '../../domain/model/task/value-objects/StudentAnswer.js';
import { ExtendedEvaluationResult } from '../../domain/services/TaskEvaluatorService.js';
import { QuizCard } from '../components/QuizCard.js';
import { QuizSummaryModal } from '../components/QuizSummaryModal.js';
import { ArrowLeft } from 'lucide-react';

interface QuizViewProps {
  session: QuizSession;
  onSubmitAnswer: (answerValue: AnswerValue, hintsUsedCount: number, reasoning?: string) => Promise<ExtendedEvaluationResult | null>;
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
  const [remainingSeconds, setRemainingSeconds] = useState(session.timeLimitSeconds ?? 0);
  const task = session.currentTask;
  const isExamMode = session.mode === 'exam';

  useEffect(() => {
    if (!isExamMode || !session.timeLimitSeconds || isCompleted) return;

    const timer = window.setInterval(() => {
      setRemainingSeconds((seconds) => {
        if (seconds <= 1) {
          session.complete();
          setIsCompleted(true);
          return 0;
        }
        return seconds - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isExamMode, isCompleted, session]);

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
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 w-full min-w-0 overflow-hidden">
      {/* Back Button & Header */}
      <div className="mb-4 sm:mb-6 flex flex-wrap items-center justify-between gap-2.5">
        <button
          onClick={onGoHome}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-2 transition-colors shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Avbryt økt</span>
        </button>

        <span className="order-3 w-full truncate text-center text-xs font-bold text-indigo-300 sm:order-none sm:w-auto sm:text-sm">
          Øving: {session.topicTitle.replaceAll('_', ' ')}
        </span>
        {isExamMode && (
          <span className={`text-xs sm:text-sm font-bold shrink-0 ${remainingSeconds < 300 ? 'text-rose-300' : 'text-amber-300'}`}>
            Tid igjen: {Math.floor(remainingSeconds / 60).toString().padStart(2, '0')}:{(remainingSeconds % 60).toString().padStart(2, '0')}
          </span>
        )}
      </div>

      {/* Active Task Card */}
      <QuizCard
        task={task}
        taskIndex={session.currentIndex}
        totalTasks={session.totalTasks}
        onSubmitAnswer={onSubmitAnswer}
        onNextTask={handleNextTask}
        isLastTask={session.currentIndex === session.totalTasks - 1}
        isExamMode={isExamMode}
      />

      {/* Summary Modal upon Completion */}
      {isCompleted && (
        <QuizSummaryModal
          scoreSummary={session.calculateTotalScore()}
          topicScores={session.calculateTopicScores()}
          totalTasks={session.totalTasks}
          isExamMode={isExamMode}
          onRestart={onRestart}
          onGoHome={onGoHome}
        />
      )}
    </div>
  );
};
