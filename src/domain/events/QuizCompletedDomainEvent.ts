import { DomainEvent } from '../shared/DomainEvent.js';

export class QuizCompletedDomainEvent implements DomainEvent {
  public readonly eventId: string;
  public readonly eventName: string = 'QuizCompletedDomainEvent';
  public readonly occurredAt: Date;

  constructor(
    public readonly sessionId: string,
    public readonly topicTitle: string,
    public readonly totalTasks: number,
    public readonly correctCount: number,
    public readonly scorePercentage: number,
    public readonly completedAt: Date = new Date(),
    eventId?: string
  ) {
    this.occurredAt = completedAt;
    this.eventId = eventId ?? crypto.randomUUID();
  }
}
