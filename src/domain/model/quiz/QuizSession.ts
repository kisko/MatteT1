import { Result } from '../../shared/Result.js';
import { Task } from '../task/Task.js';
import { StudentAnswer } from '../task/value-objects/StudentAnswer.js';
import { EvaluationResult } from '../task/value-objects/EvaluationResult.js';
import { createTaskError, TaskError } from '../task/errors/TaskError.js';

export class QuizSessionId {
  private constructor(public readonly value: string) {}

  public static create(id?: string): QuizSessionId {
    return new QuizSessionId(id ?? crypto.randomUUID());
  }
}

export interface TaskAnswerRecord {
  readonly taskId: string;
  readonly answer: StudentAnswer;
  readonly result: EvaluationResult;
  readonly hintsUsedCount: number;
  readonly answeredAt: Date;
}

export class QuizSession {
  private _currentIndex: number = 0;
  private _answers: Map<string, TaskAnswerRecord> = new Map();
  private _isCompleted: boolean = false;
  private _completedAt?: Date;

  private constructor(
    public readonly id: QuizSessionId,
    public readonly tasks: ReadonlyArray<Task>,
    public readonly topicTitle: string,
    public readonly startedAt: Date = new Date()
  ) {}

  public static create(
    tasks: Task[],
    topicTitle: string
  ): Result<QuizSession, TaskError> {
    if (!tasks || tasks.length === 0) {
      return Result.fail(
        createTaskError('INVALID_SOLUTION_STEPS', 'Et quiz må bestå av minst én oppgave.')
      );
    }
    return Result.ok(new QuizSession(QuizSessionId.create(), tasks, topicTitle));
  }

  public get currentTask(): Task | undefined {
    return this.tasks[this._currentIndex];
  }

  public get currentIndex(): number {
    return this._currentIndex;
  }

  public get totalTasks(): number {
    return this.tasks.length;
  }

  public get isCompleted(): boolean {
    return this._isCompleted;
  }

  public get completedAt(): Date | undefined {
    return this._completedAt;
  }

  public get answers(): ReadonlyMap<string, TaskAnswerRecord> {
    return this._answers;
  }

  public submitAnswer(
    answer: StudentAnswer,
    hintsUsedCount: number = 0
  ): Result<EvaluationResult, TaskError> {
    const task = this.currentTask;
    if (!task) {
      return Result.fail(
        createTaskError('EVALUATION_ERROR', 'Ingen aktiv oppgave i denne sesjonen.')
      );
    }

    if (this._isCompleted) {
      return Result.fail(
        createTaskError('EVALUATION_ERROR', 'Quiz-sesjonen er allerede fullført.')
      );
    }

    const evalResult = task.evaluate(answer);
    if (evalResult.isFailure) {
      return evalResult;
    }

    this._answers.set(task.id.value, {
      taskId: task.id.value,
      answer,
      result: evalResult.value,
      hintsUsedCount,
      answeredAt: new Date(),
    });

    return evalResult;
  }

  public nextTask(): boolean {
    if (this._currentIndex < this.tasks.length - 1) {
      this._currentIndex++;
      return true;
    } else {
      this._isCompleted = true;
      this._completedAt = new Date();
      return false;
    }
  }

  public calculateTotalScore(): { correctCount: number; totalScore: number; percentage: number } {
    let correctCount = 0;
    let totalScore = 0;

    for (const record of this._answers.values()) {
      if (record.result.isCorrect) {
        correctCount++;
      }
      totalScore += record.result.score;
    }

    const percentage = this.tasks.length > 0 ? (correctCount / this.tasks.length) * 100 : 0;
    return { correctCount, totalScore, percentage: Math.round(percentage) };
  }
}
