import { DomainEvent } from '../shared/DomainEvent.js';
import { Lk20Topic1T } from '../model/task/value-objects/Lk20Category.js';

/**
 * Publiseres når eleven klarer et oppdrag i en utforskning, altså har fått
 * modellen til å oppføre seg på en bestemt måte.
 */
export class ExplorationMissionCompletedDomainEvent implements DomainEvent {
  public readonly eventId: string;
  public readonly eventName: string = 'ExplorationMissionCompletedDomainEvent';
  public readonly occurredAt: Date;

  constructor(
    public readonly labId: string,
    public readonly missionId: string,
    public readonly topic: Lk20Topic1T,
    public readonly missionPrompt: string,
    public readonly completedCount: number,
    public readonly totalCount: number,
    occurredAt: Date = new Date(),
    eventId?: string
  ) {
    this.occurredAt = occurredAt;
    this.eventId = eventId ?? crypto.randomUUID();
  }
}

/** Publiseres når alle oppdragene i en utforskning er klart. */
export class ExplorationLabCompletedDomainEvent implements DomainEvent {
  public readonly eventId: string;
  public readonly eventName: string = 'ExplorationLabCompletedDomainEvent';
  public readonly occurredAt: Date;

  constructor(
    public readonly labId: string,
    public readonly topic: Lk20Topic1T,
    public readonly labTitle: string,
    public readonly missionCount: number,
    public readonly claimsAnsweredCorrectly: number,
    public readonly claimCount: number,
    occurredAt: Date = new Date(),
    eventId?: string
  ) {
    this.occurredAt = occurredAt;
    this.eventId = eventId ?? crypto.randomUUID();
  }
}
