import { DomainEvent } from '../shared/DomainEvent.js';
import { Lk20Topic1T } from '../model/task/value-objects/Lk20Category.js';

export class ProgressUpdatedDomainEvent implements DomainEvent {
  public readonly eventId: string;
  public readonly eventName: string = 'ProgressUpdatedDomainEvent';
  public readonly occurredAt: Date;

  constructor(
    public readonly topic: Lk20Topic1T,
    public readonly isCorrect: boolean,
    public readonly newMasteryPercentage: number,
    public readonly totalSolved: number,
    public readonly streakDays: number,
    public readonly goalLabel?: string,
    occurredAt: Date = new Date(),
    eventId?: string
  ) {
    this.occurredAt = occurredAt;
    this.eventId = eventId ?? crypto.randomUUID();
  }
}
