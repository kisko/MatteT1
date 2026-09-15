import { Result } from '../../domain/shared/Result.js';
import { ExplorationSession } from '../../domain/model/exploration/ExplorationSession.js';
import { ExplorationCatalog } from '../../domain/curriculum/exploration/ExplorationCatalog.js';
import { createGuidedError, GuidedError } from '../../domain/model/guided/errors/GuidedError.js';
import {
  ExplorationProgressRepository,
  missionIdsForLab,
  missionKey,
} from '../../domain/model/exploration/ExplorationProgressRepository.js';
import { DomainEventPublisher } from '../../domain/events/DomainEventPublisher.js';

/**
 * Starter en utforskning, med de oppdragene eleven alt har løst.
 */
export class StartExplorationUseCase {
  constructor(private readonly repository: ExplorationProgressRepository) {}

  public async execute(labId: string): Promise<Result<ExplorationSession, GuidedError>> {
    const lab = ExplorationCatalog.byId(labId);

    if (!lab) {
      return Result.fail(
        createGuidedError('INVALID_WALKTHROUGH', `Fant ingen utforskning med id ${labId}.`, { labId })
      );
    }

    const keys = await this.repository.getCompletedMissionKeys();
    return Result.ok(ExplorationSession.start(lab, missionIdsForLab(keys, labId)));
  }
}

export interface ExplorationProgressOutcome {
  readonly savedMissions: number;
  /** Alle løste oppdrag på tvers av utforskninger, etter lagring. */
  readonly completedKeys: ReadonlyArray<string>;
}

/**
 * Lagrer løste oppdrag og publiserer hendelsene fra økta.
 */
export class RecordExplorationProgressUseCase {
  constructor(private readonly repository: ExplorationProgressRepository) {}

  public async execute(session: ExplorationSession): Promise<Result<ExplorationProgressOutcome, GuidedError>> {
    const events = [...session.domainEvents];
    const existing = await this.repository.getCompletedMissionKeys();

    const keysForSession = session.completedMissionIds.map((missionId) =>
      missionKey(session.lab.id, missionId)
    );
    const merged = [...new Set([...existing, ...keysForSession])];

    if (merged.length !== existing.length) {
      await this.repository.saveCompletedMissionKeys(merged);
    }

    const publisher = DomainEventPublisher.getInstance();
    await publisher.publishAll(events);
    session.clearDomainEvents();

    return Result.ok({
      savedMissions: merged.length - existing.length,
      completedKeys: merged,
    });
  }
}
