import React, { lazy, Suspense, useState, useEffect, useCallback } from 'react';
import { Lk20Topic1T, Lk20TopicNames } from './domain/model/task/value-objects/Lk20Category.js';
import { UserProgress } from './domain/model/progress/UserProgress.js';
import { QuizSession } from './domain/model/quiz/QuizSession.js';
import { AnswerValue } from './domain/model/task/value-objects/StudentAnswer.js';
import { ExtendedEvaluationResult } from './domain/services/TaskEvaluatorService.js';
import { InMemoryTaskRepository } from './infrastructure/persistence/InMemoryTaskRepository.js';
import { IndexedDbProgressRepository } from './infrastructure/persistence/IndexedDbProgressRepository.js';
import { StartQuizUseCase } from './application/use-cases/StartQuizUseCase.js';
import { SubmitAnswerUseCase } from './application/use-cases/SubmitAnswerUseCase.js';
import { Navbar } from './ui/components/Navbar.js';
import { DashboardView } from './ui/views/DashboardView.js';
import { CompetenceMatrixView } from './ui/views/CompetenceMatrixView.js';
import { Task } from './domain/model/task/Task.js';
import { DomainEventPublisher } from './domain/events/DomainEventPublisher.js';
import { ProgressUpdatedDomainEvent } from './domain/events/ProgressUpdatedDomainEvent.js';
import { QuizCompletedDomainEvent } from './domain/events/QuizCompletedDomainEvent.js';
import { ToastContainer, ToastMessage } from './ui/components/Toast.js';
import { APP_VERSION } from './version.js';

const QuizView = lazy(() => import('./ui/views/QuizView.js').then((module) => ({ default: module.QuizView })));
const LectureView = lazy(() => import('./ui/views/LectureView.js').then((module) => ({ default: module.LectureView })));
const ExperimentalLabView = lazy(() => import('./ui/views/ExperimentalLabView.js').then((module) => ({ default: module.ExperimentalLabView })));

const taskRepo = new InMemoryTaskRepository();
const progressRepo = new IndexedDbProgressRepository();
const startQuizUseCase = new StartQuizUseCase(taskRepo);
const submitAnswerUseCase = new SubmitAnswerUseCase(progressRepo);

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'matrix' | 'lecture' | 'lab' | 'quiz'>('dashboard');
  const [progress, setProgress] = useState<UserProgress>(UserProgress.createEmpty());
  const [activeSession, setActiveSession] = useState<QuizSession | null>(null);
  const [activeTopic, setActiveTopic] = useState<Lk20Topic1T | null>(null);
  const [taskCatalog, setTaskCatalog] = useState<readonly Task[]>([]);
  const [isDark, setIsDark] = useState<boolean>(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev.slice(-3), { ...toast, id }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Abonner på domenehendelser (Domain Events)
  useEffect(() => {
    const publisher = DomainEventPublisher.getInstance();

    const unsubProgress = publisher.subscribe<ProgressUpdatedDomainEvent>(
      'ProgressUpdatedDomainEvent',
      (event) => {
        if (event.isCorrect && (event.newMasteryPercentage === 100 || event.newMasteryPercentage === 80)) {
          const topicName = Lk20TopicNames[event.topic] ?? event.topic;
          addToast({
            type: 'milestone',
            title: `Mestrings-milepæl! 🎯`,
            description: `Du har nådd ${event.newMasteryPercentage} % mestring i ${topicName}!`,
          });
        }
      }
    );

    const unsubQuiz = publisher.subscribe<QuizCompletedDomainEvent>(
      'QuizCompletedDomainEvent',
      (event) => {
        if (event.scorePercentage >= 80) {
          addToast({
            type: 'success',
            title: 'Quiz fullført med glans! 🏆',
            description: `${event.topicTitle}: ${event.correctCount} av ${event.totalTasks} riktige (${event.scorePercentage} %).`,
          });
        } else {
          addToast({
            type: 'info',
            title: 'Quiz fullført! 👍',
            description: `${event.topicTitle}: ${event.correctCount} av ${event.totalTasks} riktige (${event.scorePercentage} %).`,
          });
        }
      }
    );

    return () => {
      unsubProgress();
      unsubQuiz();
    };
  }, [addToast]);

  // Last inn progresjon og tema ved oppstart
  useEffect(() => {
    progressRepo.getProgress().then(setProgress);
    taskRepo.getAll().then(setTaskCatalog);

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

  const handleStartGoal = async (topic: Lk20Topic1T, goalLabels: readonly string[]) => {
    const sessionResult = await startQuizUseCase.executeGoal(topic, goalLabels);
    if (sessionResult.isSuccess) {
      setActiveSession(sessionResult.value);
      setCurrentView('quiz');
    }
  };

  const handleStartExam = async (taskCount: number = 12) => {
    const sessionResult = await startQuizUseCase.executeExam(taskCount);
    if (sessionResult.isSuccess) {
      setActiveSession(sessionResult.value);
      setCurrentView('quiz');
    }
  };

  const handleSubmitAnswer = async (
    answerValue: AnswerValue,
    hintsUsedCount: number,
    reasoning?: string
  ): Promise<ExtendedEvaluationResult | null> => {
    if (!activeSession) return null;

    const res = await submitAnswerUseCase.execute({
      session: activeSession,
      answerValue,
      hintsUsedCount,
      reasoning,
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
      if (activeSession.mode === 'exam') {
        await handleStartExam();
      } else {
        await handleStartTopic(activeSession.topicTitle as Lk20Topic1T);
      }
    }
  };

  let activeContent: React.ReactNode = null;
  if (currentView === 'dashboard') {
    activeContent = (
      <DashboardView
        progress={progress}
        taskCatalog={taskCatalog}
        onStartTopic={handleOpenTopic}
        onStartGoal={handleStartGoal}
        onStartExam={handleStartExam}
        onOpenMatrix={() => setCurrentView('matrix')}
      />
    );
  } else if (currentView === 'matrix') {
    activeContent = (
      <CompetenceMatrixView
        progress={progress}
        taskCatalog={taskCatalog}
        onOpenModule={handleOpenTopic}
        onStartGoal={handleStartGoal}
      />
    );
  } else if (currentView === 'lecture' && activeTopic) {
    activeContent = (
      <LectureView
        topic={activeTopic}
        onBack={handleGoHome}
        onStartPractice={() => handleStartTopic(activeTopic)}
      />
    );
  } else if (currentView === 'lab') {
    activeContent = <ExperimentalLabView onBack={handleGoHome} />;
  } else if (activeSession) {
    activeContent = (
      <QuizView
        session={activeSession}
        onSubmitAnswer={handleSubmitAnswer}
        onGoHome={handleGoHome}
        onRestart={handleRestartQuiz}
      />
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <Navbar
        streakDays={progress.streakDays}
        totalSolved={progress.totalSolved}
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
        onGoHome={handleGoHome}
        onOpenMatrix={() => setCurrentView('matrix')}
        isMatrixActive={currentView === 'matrix'}
        onOpenLab={() => setCurrentView('lab')}
        isLabActive={currentView === 'lab'}
      />

      <main>
        <Suspense fallback={<div className="mx-auto max-w-3xl px-4 py-16 text-center text-sm text-slate-400">Laster læringsinnhold ...</div>}>
          {activeContent}
        </Suspense>
      </main>

      <footer className="mx-auto max-w-7xl px-4 py-8 text-center text-xs text-slate-500 sm:px-6 lg:px-8">
        Laget av{' '}
        <a href="https://kisk.no" className="hover:text-slate-300 hover:underline">
          kisk.no
        </a>{' '}
        · Versjon {APP_VERSION}
      </footer>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};

export default App;
