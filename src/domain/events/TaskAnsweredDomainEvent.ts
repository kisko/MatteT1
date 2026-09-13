import { DomainEvent } from '../shared/DomainEvent.js';
import { EvaluationResult } from '../model/task/value-objects/EvaluationResult.js';
import { StudentAnswer } from '../model/task/value-objects/StudentAnswer.js';
import { Lk20Topic1T } from '../model/task/value-objects/Lk20Category.js';

export class TaskAnsweredDomainEvent implements DomainEvent {
  public readonly eventId: string;
  public readonly eventName: string = 'TaskAnsweredDomainEvent';
  public readonly occurredAt: Date;

  constructor(
    public readonly sessionId: string,
    public readonly taskId: string,
    public readonly topic: Lk20Topic1T,
    public readonly answer: StudentAnswer,
    public readonly result: EvaluationResult,
    public readonly hintsUsedCount: number,
    public readonly reasoning?: string,
    occurredAt: Date = new Date(),
    eventId?: string
  ) {
    this.occurredAt = occurredAt;
    this.eventId = eventId ?? crypto.randomUUID();
  }
}
