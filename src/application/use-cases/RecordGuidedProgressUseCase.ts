import { Result } from '../../domain/shared/Result.js';
import { UserProgress } from '../../domain/model/progress/UserProgress.js';
import { GuidedSession } from '../../domain/model/guided/GuidedSession.js';
import { GuidedError } from '../../domain/model/guided/errors/GuidedError.js';
import { ProgressRepositoryPort } from '../ports/ProgressRepositoryPort.js';
import { DomainEventPublisher } from '../../domain/events/DomainEventPublisher.js';
import { ProgressUpdatedDomainEvent } from '../../domain/events/ProgressUpdatedDomainEvent.js';
import { GuidedStepCompletedDomainEvent } from '../../domain/events/GuidedStepCompletedDomainEvent.js';

export interface RecordGuidedProgressDTO {
  /** Sesjonen slik den ser ut *etter* handlingen eleven utførte. */
  readonly session: GuidedSession;
}

export interface GuidedProgressOutcome {
  readonly progress: UserProgress;
  readonly recordedSteps: number;
}

/**
 * Tar imot en veiledet sesjon etter en handling, lagrer progresjonen og
 * publiserer domenehendelsene.
 *
 * Et steg regnes som mestret når eleven kom fram til det selv – også etter et
 * par bom. Et steg som måtte vises, registreres som et forsøk uten mestring.
 * Det er den ærlige linjen: å bli vist et steg er lov, men det er ikke det
 * samme som å kunne det.
 */
export class RecordGuidedProgressUseCase {
  constructor(private readonly progressRepository: ProgressRepositoryPort) {}

  public async execute(
    dto: RecordGuidedProgressDTO
  ): Promise<Result<GuidedProgressOutcome, GuidedError>> {
    const session = dto.session;
    const events = [...session.domainEvents];
    const stepEvents = events.filter(
      (event): event is GuidedStepCompletedDomainEvent =>
        event.eventName === 'GuidedStepCompletedDomainEvent'
    );

    let progress = await this.progressRepository.getProgress();

    for (const stepEvent of stepEvents) {
      progress = progress.recordAttempt(
        stepEvent.topic,
        !stepEvent.revealed,
        session.walkthrough.skillLabel,
        stepEvent.misconceptionsHit[0]
      );
    }

    if (stepEvents.length > 0) {
      await this.progressRepository.saveProgress(progress);
    }

    const publisher = DomainEventPublisher.getInstance();
    await publisher.publishAll(events);
    session.clearDomainEvents();

    if (stepEvents.length > 0) {
      const topicStats = progress.categoryStats.get(session.topic);
      const lastStep = stepEvents[stepEvents.length - 1];
      await publisher.publish(
        new ProgressUpdatedDomainEvent(
          session.topic,
          !lastStep.revealed,
          topicStats?.masteryPercentage ?? 0,
          progress.totalSolved,
          progress.streakDays,
          session.walkthrough.skillLabel
        )
      );
    }

    return Result.ok({ progress, recordedSteps: stepEvents.length });
  }
}
