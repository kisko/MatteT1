import { Result } from '../../shared/Result.js';
import { AggregateRoot } from '../../shared/AggregateRoot.js';
import { Task } from '../task/Task.js';
import { StudentAnswer } from '../task/value-objects/StudentAnswer.js';
import { EvaluationResult } from '../task/value-objects/EvaluationResult.js';
import { createTaskError, TaskError } from '../task/errors/TaskError.js';
import { Lk20Topic1T } from '../task/value-objects/Lk20Category.js';
import { TaskAnsweredDomainEvent } from '../../events/TaskAnsweredDomainEvent.js';
import { QuizCompletedDomainEvent } from '../../events/QuizCompletedDomainEvent.js';

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
  readonly reasoning?: string;
  readonly answeredAt: Date;
}

export type QuizMode = 'practice' | 'exam';

export interface QuizSessionOptions {
  readonly mode?: QuizMode;
  readonly timeLimitSeconds?: number;
}

export interface TopicScoreSummary {
  readonly topic: Lk20Topic1T;
  readonly correctCount: number;
  readonly answeredCount: number;
  readonly totalTasks: number;
  readonly percentage: number;
}

export class QuizSession extends AggregateRoot<QuizSessionId> {
  private _currentIndex: number = 0;
  private readonly _answers: Map<string, TaskAnswerRecord> = new Map();
  private _isCompleted: boolean = false;
  private _completedAt?: Date;

  private constructor(
    private readonly _id: QuizSessionId,
    public readonly tasks: ReadonlyArray<Task>,
    public readonly topicTitle: string,
    public readonly startedAt: Date = new Date(),
    public readonly mode: QuizMode = 'practice',
    public readonly timeLimitSeconds?: number
  ) {
    super();
  }

  public override get id(): QuizSessionId {
    return this._id;
  }

  public static create(
    tasks: Task[],
    topicTitle: string,
    options: QuizSessionOptions = {}
  ): Result<QuizSession, TaskError> {
    if (!tasks || tasks.length === 0) {
      return Result.fail(
        createTaskError('INVALID_SOLUTION_STEPS', 'Et quiz må bestå av minst én oppgave.')
      );
    }
    return Result.ok(
      new QuizSession(
        QuizSessionId.create(),
        tasks,
        topicTitle,
        new Date(),
        options.mode ?? 'practice',
        options.timeLimitSeconds
      )
    );
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
    hintsUsedCount: number = 0,
    reasoning?: string
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
      reasoning: reasoning?.trim() || undefined,
      answeredAt: new Date(),
    });

    this.addDomainEvent(
      new TaskAnsweredDomainEvent(
        this._id.value,
        task.id.value,
        task.category.mainTopic,
        answer,
        evalResult.value,
        hintsUsedCount,
        reasoning
      )
    );

    return evalResult;
  }

  public get answeredWithReasoningCount(): number {
    return Array.from(this._answers.values()).filter((record) => Boolean(record.reasoning)).length;
  }

  public nextTask(): boolean {
    if (this._currentIndex < this.tasks.length - 1) {
      this._currentIndex++;
      return true;
    } else {
      this.complete();
      return false;
    }
  }

  public complete(): void {
    if (!this._isCompleted) {
      this._isCompleted = true;
      this._completedAt = new Date();
      const score = this.calculateTotalScore();
      this.addDomainEvent(
        new QuizCompletedDomainEvent(
          this._id.value,
          this.topicTitle,
          this.totalTasks,
          score.correctCount,
          score.percentage,
          this._completedAt
        )
      );
    }
  }

  public calculateTotalScore(): {
    correctCount: number;
    answeredCount: number;
    unansweredCount: number;
    reasoningCount: number;
    totalScore: number;
    percentage: number;
  } {
    let correctCount = 0;
    let totalScore = 0;
    let reasoningCount = 0;

    for (const record of this._answers.values()) {
      if (record.result.isCorrect) {
        correctCount++;
      }
      totalScore += record.result.score;
      if (record.reasoning) {
        reasoningCount++;
      }
    }

    const answeredCount = this._answers.size;
    const unansweredCount = Math.max(0, this.tasks.length - answeredCount);
    const percentage = this.tasks.length > 0 ? (totalScore / this.tasks.length) * 100 : 0;
    return {
      correctCount,
      answeredCount,
      unansweredCount,
      reasoningCount,
      totalScore,
      percentage: Math.round(percentage),
    };
  }

  public calculateTopicScores(): TopicScoreSummary[] {
    const summaries = new Map<Lk20Topic1T, { correctCount: number; answeredCount: number; totalTasks: number }>();

    for (const task of this.tasks) {
      const topic = task.category.mainTopic;
      const current = summaries.get(topic) ?? { correctCount: 0, answeredCount: 0, totalTasks: 0 };
      const answer = this._answers.get(task.id.value);
      summaries.set(topic, {
        correctCount: current.correctCount + (answer?.result.isCorrect ? 1 : 0),
        answeredCount: current.answeredCount + (answer ? 1 : 0),
        totalTasks: current.totalTasks + 1,
      });
    }

    return Array.from(summaries.entries()).map(([topic, summary]) => ({
      topic,
      ...summary,
      percentage: summary.totalTasks > 0 ? Math.round((summary.correctCount / summary.totalTasks) * 100) : 0,
    }));
  }
}
