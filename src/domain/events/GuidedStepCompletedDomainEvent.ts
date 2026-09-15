import { DomainEvent } from '../shared/DomainEvent.js';
import { Lk20Topic1T } from '../model/task/value-objects/Lk20Category.js';
import { MisconceptionType } from '../model/task/Misconception.js';

/**
 * Publiseres når et veiledet steg er ferdig, enten fordi eleven valgte riktig
 * eller fordi steget ble vist. Gir analytikken innsikt i *hvor* det butter.
 */
export class GuidedStepCompletedDomainEvent implements DomainEvent {
  public readonly eventId: string;
  public readonly eventName: string = 'GuidedStepCompletedDomainEvent';
  public readonly occurredAt: Date;

  constructor(
    public readonly sessionId: string,
    public readonly walkthroughId: string,
    public readonly topic: Lk20Topic1T,
    public readonly stepNumber: number,
    public readonly attempts: number,
    public readonly hintUsed: boolean,
    public readonly revealed: boolean,
    public readonly score: number,
    public readonly misconceptionsHit: ReadonlyArray<MisconceptionType> = [],
    occurredAt: Date = new Date(),
    eventId?: string
  ) {
    this.occurredAt = occurredAt;
    this.eventId = eventId ?? crypto.randomUUID();
  }

  public get wasFirstTry(): boolean {
    return !this.revealed && this.attempts === 1;
  }
}
