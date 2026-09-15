import { describe, it, expect, beforeEach } from 'vitest';
import {
  RecordExplorationProgressUseCase,
  StartExplorationUseCase,
} from '../../../src/application/use-cases/ExplorationUseCases.js';
import { ExplorationProgressRepository } from '../../../src/domain/model/exploration/ExplorationProgressRepository.js';
import { ExplorationCatalog } from '../../../src/domain/curriculum/exploration/ExplorationCatalog.js';
import { ExplorationSession } from '../../../src/domain/model/exploration/ExplorationSession.js';
import { DomainEventPublisher } from '../../../src/domain/events/DomainEventPublisher.js';
import { DomainEvent } from '../../../src/domain/shared/DomainEvent.js';

class InMemoryExplorationRepository implements ExplorationProgressRepository {
  public saveCount = 0;
  private keys: string[] = [];

  constructor(initial: readonly string[] = []) {
    this.keys = [...initial];
  }

  public async getCompletedMissionKeys(): Promise<ReadonlyArray<string>> {
    return [...this.keys];
  }

  public async saveCompletedMissionKeys(keys: readonly string[]): Promise<void> {
    this.saveCount += 1;
    this.keys = [...keys];
  }
}

const unwrap = <T,>(result: { isSuccess: boolean; value?: T; error?: { message: string } }): T => {
  if (!result.isSuccess) {
    throw new Error(`Forventet suksess, men fikk: ${result.error?.message}`);
  }
  return result.value as T;
};

describe('StartExplorationUseCase', () => {
  beforeEach(() => {
    ExplorationCatalog.resetCache();
  });

  it('starter en utforskning på startverdiene', async () => {
    const useCase = new StartExplorationUseCase(new InMemoryExplorationRepository());
    const session = unwrap(await useCase.execute('E-FUN-01'));

    expect(session.lab.id).toBe('E-FUN-01');
    expect(session.values).toEqual(session.lab.initialValues);
    expect(session.completedMissionIds).toEqual([]);
  });

  it('gjenoppretter oppdrag eleven alt har løst', async () => {
    const repository = new InMemoryExplorationRepository([
      'E-FUN-01:no-roots',
      'E-FUN-01:make-linear',
      'E-TRI-01:equal-legs',
    ]);
    const session = unwrap(await new StartExplorationUseCase(repository).execute('E-FUN-01'));

    expect(session.completedMissionIds).toHaveLength(2);
    expect(session.isMissionCompleted('no-roots')).toBe(true);
    expect(session.isMissionCompleted('make-linear')).toBe(true);
    // Oppdrag fra en annen utforskning skal ikke lekke inn.
    expect(session.isMissionCompleted('equal-legs')).toBe(false);
  });

  it('ignorerer lagrede oppdrag som ikke finnes lenger', async () => {
    const repository = new InMemoryExplorationRepository(['E-FUN-01:fjernet-oppdrag']);
    const session = unwrap(await new StartExplorationUseCase(repository).execute('E-FUN-01'));

    expect(session.completedMissionIds).toEqual([]);
  });

  it('feiler tydelig på ukjent utforskning', async () => {
    const result = await new StartExplorationUseCase(new InMemoryExplorationRepository()).execute(
      'finnes-ikke'
    );

    expect(result.isFailure).toBe(true);
    if (result.isFailure) {
      expect(result.error.code).toBe('INVALID_WALKTHROUGH');
      expect(result.error.message).toContain('finnes-ikke');
    }
  });
});

describe('RecordExplorationProgressUseCase', () => {
  let repository: InMemoryExplorationRepository;
  let useCase: RecordExplorationProgressUseCase;
  let published: DomainEvent[];

  beforeEach(() => {
    DomainEventPublisher.resetInstance();
    ExplorationCatalog.resetCache();
    repository = new InMemoryExplorationRepository();
    useCase = new RecordExplorationProgressUseCase(repository);
    published = [];

    const publisher = DomainEventPublisher.getInstance();
    for (const eventName of [
      'ExplorationMissionCompletedDomainEvent',
      'ExplorationLabCompletedDomainEvent',
    ]) {
      publisher.subscribe(eventName, (event) => {
        published.push(event);
      });
    }
  });

  const parabolaSession = (): ExplorationSession =>
    ExplorationSession.start(ExplorationCatalog.byId('E-FUN-01')!);

  it('lagrer et løst oppdrag med nøkkel per utforskning', async () => {
    const session = unwrap(parabolaSession().setParameter('a', 0));

    const outcome = unwrap(await useCase.execute(session));

    expect(outcome.savedMissions).toBe(1);
    expect(outcome.completedKeys).toContain('E-FUN-01:make-linear');
    expect(repository.saveCount).toBe(1);
  });

  it('publiserer hendelsene og tømmer dem fra økta', async () => {
    const session = unwrap(parabolaSession().setParameter('a', 0));

    await useCase.execute(session);

    expect(published.map((event) => event.eventName)).toEqual([
      'ExplorationMissionCompletedDomainEvent',
    ]);
    expect(session.domainEvents).toHaveLength(0);
  });

  it('lagrer ikke på nytt når ingenting er endret', async () => {
    const session = unwrap(parabolaSession().setParameter('a', 0));
    await useCase.execute(session);
    expect(repository.saveCount).toBe(1);

    published = [];
    await useCase.execute(session);

    expect(repository.saveCount).toBe(1);
    expect(published).toEqual([]);
  });

  it('slår sammen med oppdrag fra andre utforskninger', async () => {
    repository = new InMemoryExplorationRepository(['E-TRI-01:equal-legs']);
    useCase = new RecordExplorationProgressUseCase(repository);

    const session = unwrap(parabolaSession().setParameter('a', 0));
    const outcome = unwrap(await useCase.execute(session));

    expect(outcome.completedKeys).toContain('E-TRI-01:equal-legs');
    expect(outcome.completedKeys).toContain('E-FUN-01:make-linear');
  });

  it('lagrer ingenting når ingen oppdrag er løst', async () => {
    const outcome = unwrap(await useCase.execute(parabolaSession()));

    expect(outcome.savedMissions).toBe(0);
    expect(repository.saveCount).toBe(0);
  });

  it('lagrer flere oppdrag som ble løst i samme handling', async () => {
    // a = 1, b = 4, c = 4 gir D = 0 (ett nullpunkt) og symmetriakse i x = -2.
    const session = unwrap(parabolaSession().setValues({ a: 1, b: 4, c: 4 }));
    expect(session.completedMissionIds.length).toBeGreaterThanOrEqual(2);

    const outcome = unwrap(await useCase.execute(session));

    expect(outcome.savedMissions).toBeGreaterThanOrEqual(2);
    expect(outcome.completedKeys).toContain('E-FUN-01:one-root');
    expect(outcome.completedKeys).toContain('E-FUN-01:axis-at-minus-two');
  });
});
