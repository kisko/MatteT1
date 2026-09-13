import { Result } from '../../domain/shared/Result.js';
import { QuizSession, QuizSessionOptions } from '../../domain/model/quiz/QuizSession.js';
import { Task } from '../../domain/model/task/Task.js';
import { Lk20Topic1T } from '../../domain/model/task/value-objects/Lk20Category.js';
import { DifficultyLevel } from '../../domain/model/task/value-objects/Difficulty.js';
import { TaskRepositoryPort } from '../ports/TaskRepositoryPort.js';
import { createTaskError, TaskError } from '../../domain/model/task/errors/TaskError.js';

const shuffleTasks = <T,>(tasks: readonly T[]): T[] => {
  const shuffled = [...tasks];
  const randomValues = new Uint32Array(shuffled.length);
  crypto.getRandomValues(randomValues);

  for (let index = shuffled.length - 1; index > 0; index--) {
    const swapIndex = randomValues[index] % (index + 1);
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
};

export class StartQuizUseCase {
  constructor(private readonly taskRepository: TaskRepositoryPort) {}

  public async execute(
    topic: Lk20Topic1T,
    difficulty?: DifficultyLevel
  ): Promise<Result<QuizSession, TaskError>> {
    const tasks = await this.taskRepository.getByTopic(topic, difficulty);

    if (!tasks || tasks.length === 0) {
      return Result.fail(
        createTaskError(
          'INVALID_LK20_CATEGORY',
          `Ingen oppgaver funnet for temaet ${topic}.`
        )
      );
    }

    return QuizSession.create(tasks, topic);
  }

  public async executeGoal(
    topic: Lk20Topic1T,
    goalLabels: readonly string[]
  ): Promise<Result<QuizSession, TaskError>> {
    const taskGroups = await Promise.all(
      goalLabels.map((goalLabel) => this.taskRepository.getByCompetenceGoal(goalLabel))
    );
    const tasks = taskGroups
      .flat()
      .filter((task) => task.category.mainTopic === topic);

    if (tasks.length === 0) {
      return Result.fail(
        createTaskError('INVALID_LK20_CATEGORY', 'Ingen oppgaver funnet for kompetansemålet.')
      );
    }

    return QuizSession.create(tasks, topic);
  }

  public async executeExam(taskCount: number = 12): Promise<Result<QuizSession, TaskError>> {
    const coreTopics = Object.values(Lk20Topic1T).filter(
      (topic) => topic !== Lk20Topic1T.SANNSYNLIGHET
    );
    const tasksByTopic = await Promise.all(
      coreTopics.map((topic) => this.taskRepository.getByTopic(topic))
    );
    const shuffledByTopic = tasksByTopic.map((topicTasks) => shuffleTasks(topicTasks));
    const selectedTasks: Task[] = [];
    const selectedIds = new Set<string>();
    const difficultyTargets = new Map<DifficultyLevel, number>([
      [DifficultyLevel.LETT, Math.round(taskCount * 0.25)],
      [DifficultyLevel.MIDDELS, Math.round(taskCount * 0.5)],
      [DifficultyLevel.KREVENDE, Math.max(1, taskCount - Math.round(taskCount * 0.25) - Math.round(taskCount * 0.5))],
    ]);

    const addTask = (task: Task | undefined): void => {
      if (!task || selectedTasks.length >= taskCount || selectedIds.has(task.id.value)) return;
      selectedTasks.push(task);
      selectedIds.add(task.id.value);
      const remaining = difficultyTargets.get(task.difficulty.level) ?? 0;
      if (remaining > 0) difficultyTargets.set(task.difficulty.level, remaining - 1);
    };

    // Først sikres minst én oppgave fra hvert kjerneområde.
    for (const topicTasks of shuffledByTopic) {
      addTask(
        topicTasks.find((task) => task.difficulty.level === DifficultyLevel.MIDDELS) ??
          topicTasks.find((task) => task.difficulty.level === DifficultyLevel.LETT) ??
          topicTasks[0]
      );
    }

    const remainingTasks = shuffleTasks(shuffledByTopic.flat());
    for (const difficulty of [DifficultyLevel.LETT, DifficultyLevel.MIDDELS, DifficultyLevel.KREVENDE]) {
      for (const task of remainingTasks.filter((candidate) => candidate.difficulty.level === difficulty)) {
        if ((difficultyTargets.get(difficulty) ?? 0) > 0) addTask(task);
      }
    }

    for (const task of remainingTasks) {
      addTask(task);
      if (selectedTasks.length >= taskCount) break;
    }
    const options: QuizSessionOptions = {
      mode: 'exam',
      timeLimitSeconds: taskCount >= 24 ? 90 * 60 : 45 * 60,
    };

    if (selectedTasks.length === 0) {
      return Result.fail(
        createTaskError('INVALID_LK20_CATEGORY', 'Ingen oppgaver tilgjengelig for eksamenstrening.')
      );
    }

    return QuizSession.create(selectedTasks, 'EKSAMENSTRENING', options);
  }
}
