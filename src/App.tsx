import React, { useState, useEffect } from 'react';
import { Lk20Topic1T } from './domain/model/task/value-objects/Lk20Category.js';
import { UserProgress } from './domain/model/progress/UserProgress.js';
import { QuizSession } from './domain/model/quiz/QuizSession.js';
import { AnswerValue } from './domain/model/task/value-objects/StudentAnswer.js';
import { ExtendedEvaluationResult } from './domain/services/TaskEvaluatorService.js';
import { InMemoryTaskRepository } from './infrastructure/persistence/InMemoryTaskRepository.js';
import { LocalStorageProgressRepository } from './infrastructure/persistence/LocalStorageProgressRepository.js';
import { StartQuizUseCase } from './application/use-cases/StartQuizUseCase.js';
import { SubmitAnswerUseCase } from './application/use-cases/SubmitAnswerUseCase.js';
import { Navbar } from './ui/components/Navbar.js';
import { DashboardView } from './ui/views/DashboardView.js';
import { QuizView } from './ui/views/QuizView.js';
import { LectureView } from './ui/views/LectureView.js';

const taskRepo = new InMemoryTaskRepository();
const progressRepo = new LocalStorageProgressRepository();
const startQuizUseCase = new StartQuizUseCase(taskRepo);
const submitAnswerUseCase = new SubmitAnswerUseCase(progressRepo);

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'lecture' | 'quiz'>('dashboard');
  const [progress, setProgress] = useState<UserProgress>(UserProgress.createEmpty());
  const [activeSession, setActiveSession] = useState<QuizSession | null>(null);
  const [activeTopic, setActiveTopic] = useState<Lk20Topic1T | null>(null);
  const [isDark, setIsDark] = useState<boolean>(true);

  // Last inn progresjon og tema ved oppstart
  useEffect(() => {
    progressRepo.getProgress().then(setProgress);

    const savedTheme = localStorage.getItem('mattet1_theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme ? savedTheme === 'dark' : prefersDark;

    setIsDark(shouldBeDark);
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const handleToggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    localStorage.setItem('mattet1_theme', nextDark ? 'dark' : 'light');
    if (nextDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleOpenTopic = (topic: Lk20Topic1T) => {
    setActiveTopic(topic);
    setCurrentView('lecture');
  };

  const handleStartTopic = async (topic: Lk20Topic1T) => {
    const sessionResult = await startQuizUseCase.execute(topic);
    if (sessionResult.isSuccess) {
      setActiveSession(sessionResult.value);
      setCurrentView('quiz');
    }
  };

  const handleSubmitAnswer = async (
    answerValue: AnswerValue,
    hintsUsedCount: number
  ): Promise<ExtendedEvaluationResult | null> => {
    if (!activeSession) return null;

    const res = await submitAnswerUseCase.execute({
      session: activeSession,
      answerValue,
      hintsUsedCount,
    });

    if (res.isSuccess) {
      // Oppdater lokal progress state
      const updatedProgress = await progressRepo.getProgress();
      setProgress(updatedProgress);
      return res.value;
    }
    return null;
  };

  const handleGoHome = () => {
    setActiveSession(null);
    setActiveTopic(null);
    setCurrentView('dashboard');
  };

  const handleRestartQuiz = async () => {
    if (activeSession) {
      await handleStartTopic(activeSession.topicTitle as Lk20Topic1T);
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <Navbar
        streakDays={progress.streakDays}
        totalSolved={progress.totalSolved}
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
        onGoHome={handleGoHome}
      />

      <main>
        {currentView === 'dashboard' ? (
          <DashboardView progress={progress} onStartTopic={handleOpenTopic} />
        ) : currentView === 'lecture' && activeTopic ? (
          <LectureView
            topic={activeTopic}
            onBack={handleGoHome}
            onStartPractice={() => handleStartTopic(activeTopic)}
          />
        ) : activeSession ? (
          <QuizView
            session={activeSession}
            onSubmitAnswer={handleSubmitAnswer}
            onGoHome={handleGoHome}
            onRestart={handleRestartQuiz}
          />
        ) : null}
      </main>
    </div>
  );
};

export default App;
