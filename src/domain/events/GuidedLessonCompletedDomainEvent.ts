import { DomainEvent } from '../shared/DomainEvent.js';
import { Lk20Topic1T } from '../model/task/value-objects/Lk20Category.js';
import { MisconceptionType } from '../model/task/Misconception.js';
import { MasteryLevel } from '../services/GuidedSolverService.js';

/**
 * Publiseres når en hel veiledet økt er gjennomført.
 * App-laget bruker dette til feiring og milepæler.
 */
export class GuidedLessonCompletedDomainEvent implements DomainEvent {
  public readonly eventId: string;
  public readonly eventName: string = 'GuidedLessonCompletedDomainEvent';
  public readonly occurredAt: Date;

  constructor(
    public readonly sessionId: string,
    public readonly walkthroughId: string,
    public readonly topic: Lk20Topic1T,
    public readonly goalId: string,
    public readonly skillLabel: string,
    public readonly averageScore: number,
    public readonly experiencePoints: number,
    public readonly level: MasteryLevel,
    public readonly revealedSteps: number,
    public readonly errorHuntSolved: boolean,
    public readonly misconceptionsHit: ReadonlyArray<MisconceptionType> = [],
    occurredAt: Date = new Date(),
    eventId?: string
  ) {
    this.occurredAt = occurredAt;
    this.eventId = eventId ?? crypto.randomUUID();
  }

  public get isFlawless(): boolean {
    return this.revealedSteps === 0 && this.averageScore === 1;
  }
}
