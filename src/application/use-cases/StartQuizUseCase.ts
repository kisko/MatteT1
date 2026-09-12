import { Result } from '../../domain/shared/Result.js';
import { QuizSession } from '../../domain/model/quiz/QuizSession.js';
import { Lk20Topic1T } from '../../domain/model/task/value-objects/Lk20Category.js';
import { DifficultyLevel } from '../../domain/model/task/value-objects/Difficulty.js';
import { TaskRepositoryPort } from '../ports/TaskRepositoryPort.js';
import { createTaskError, TaskError } from '../../domain/model/task/errors/TaskError.js';

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
}
