import { Result } from '../../domain/shared/Result.js';
import { QuizSession } from '../../domain/model/quiz/QuizSession.js';
import { Task } from '../../domain/model/task/Task.js';
import { Lk20Topic1T } from '../../domain/model/task/value-objects/Lk20Category.js';
import { DifficultyLevel } from '../../domain/model/task/value-objects/Difficulty.js';
import { TaskRepositoryPort } from '../ports/TaskRepositoryPort.js';
import { createTaskError, TaskError } from '../../domain/model/task/errors/TaskError.js';
import { QuizSessionOptions } from '../../domain/model/quiz/QuizSession.js';

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

  public async executeExam(taskCount: number = 12): Promise<Result<QuizSession, TaskError>> {
    const coreTopics = Object.values(Lk20Topic1T).filter(
      (topic) => topic !== Lk20Topic1T.SANNSYNLIGHET
    );
    const tasksByTopic = await Promise.all(
      coreTopics.map((topic) => this.taskRepository.getByTopic(topic))
    );
    const shuffledByTopic = tasksByTopic.map((topicTasks) =>
      [...topicTasks].sort(() => Math.random() - 0.5)
    );
    const selectedTasks: Task[] = [];
    for (let round = 0; selectedTasks.length < taskCount; round++) {
      let addedThisRound = false;
      for (const topicTasks of shuffledByTopic) {
        const task = topicTasks[round];
        if (task) {
          selectedTasks.push(task);
          addedThisRound = true;
        }
        if (selectedTasks.length >= taskCount) break;
      }
      if (!addedThisRound) break;
    }
    const options: QuizSessionOptions = { mode: 'exam', timeLimitSeconds: 45 * 60 };

    if (selectedTasks.length === 0) {
      return Result.fail(
        createTaskError('INVALID_LK20_CATEGORY', 'Ingen oppgaver tilgjengelig for eksamenstrening.')
      );
    }

    return QuizSession.create(selectedTasks, 'EKSAMENSTRENING', options);
  }
}
