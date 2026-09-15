import { describe, it, expect, beforeEach } from 'vitest';
import { StartGuidedLessonUseCase } from '../../../src/application/use-cases/StartGuidedLessonUseCase.js';
import { RecordGuidedProgressUseCase } from '../../../src/application/use-cases/RecordGuidedProgressUseCase.js';
import { GuidedSession } from '../../../src/domain/model/guided/GuidedSession.js';
import { UserProgress } from '../../../src/domain/model/progress/UserProgress.js';
import { ProgressRepositoryPort } from '../../../src/application/ports/ProgressRepositoryPort.js';
import { Lk20Topic1T } from '../../../src/domain/model/task/value-objects/Lk20Category.js';
import { MisconceptionType } from '../../../src/domain/model/task/Misconception.js';
import { DomainEventPublisher } from '../../../src/domain/events/DomainEventPublisher.js';
import { DomainEvent } from '../../../src/domain/shared/DomainEvent.js';
import { GuidedContentCatalog } from '../../../src/domain/curriculum/guided/GuidedContentCatalog.js';
import { buildErrorHunt, buildWalkthrough } from '../../domain/model/guided/fixtures.js';

class InMemoryProgressRepository implements ProgressRepositoryPort {
  public saveCount = 0;
  private progress: UserProgress = UserProgress.createEmpty();

  public async getProgress(): Promise<UserProgress> {
    return this.progress;
  }

  public async saveProgress(progress: UserProgress): Promise<void> {
    this.saveCount += 1;
    this.progress = progress;
  }
}

/** Sesjon i øvingsfasen, med testinnhold og forutsigbar id. */
const practiceSession = (withHunt = true): GuidedSession => {
  const session = GuidedSession.start(
    buildWalkthrough(),
    withHunt ? buildErrorHunt() : null,
    'test-session'
  );
  const started = session.beginPractice();
  if (started.isFailure) {
    throw new Error(started.error.message);
  }
  return started.value;
};

const chooseOrThrow = (session: GuidedSession, optionId: string): GuidedSession => {
  const result = session.chooseOption(optionId);
  if (result.isFailure) {
    throw new Error(result.error.message);
  }
  return result.value;
};

describe('StartGuidedLessonUseCase', () => {
  beforeEach(() => {
    GuidedContentCatalog.resetCache();
  });

  it('starter en økt for et tema med innhold', () => {
    const result = new StartGuidedLessonUseCase().execute(Lk20Topic1T.TALL_OG_ALGEBRA);

    expect(result.isSuccess).toBe(true);
    if (result.isSuccess) {
      expect(result.value.stage).toBe('watch');
      expect(result.value.walkthrough.topic).toBe(Lk20Topic1T.TALL_OG_ALGEBRA);
      expect(result.value.errorHunt).not.toBeNull();
    }
  });

  it('starter en økt fra en utregnings-id', () => {
    const result = new StartGuidedLessonUseCase().executeById('GW-TRI-01');

    expect(result.isSuccess).toBe(true);
    if (result.isSuccess) {
      expect(result.value.walkthrough.id).toBe('GW-TRI-01');
      expect(result.value.topic).toBe(Lk20Topic1T.TRIGONOMETRI);
    }
  });

  it('feiler tydelig på ukjent id', () => {
    const result = new StartGuidedLessonUseCase().executeById('finnes-ikke');

    expect(result.isFailure).toBe(true);
    if (result.isFailure) {
      expect(result.error.code).toBe('INVALID_WALKTHROUGH');
      expect(result.error.message).toContain('finnes-ikke');
    }
  });

  it('gir en ny sesjon for hvert kall', () => {
    const useCase = new StartGuidedLessonUseCase();
    const first = useCase.execute(Lk20Topic1T.FUNKSJONER);
    const second = useCase.execute(Lk20Topic1T.FUNKSJONER);

    expect(first.isSuccess && second.isSuccess).toBe(true);
    if (first.isSuccess && second.isSuccess) {
      expect(first.value.id).not.toBe(second.value.id);
    }
  });
});

describe('RecordGuidedProgressUseCase', () => {
  let repository: InMemoryProgressRepository;
  let useCase: RecordGuidedProgressUseCase;
  let published: DomainEvent[];

  beforeEach(() => {
    DomainEventPublisher.resetInstance();
    repository = new InMemoryProgressRepository();
    useCase = new RecordGuidedProgressUseCase(repository);
    published = [];

    const publisher = DomainEventPublisher.getInstance();
    for (const eventName of [
      'GuidedStepCompletedDomainEvent',
      'GuidedLessonCompletedDomainEvent',
      'ProgressUpdatedDomainEvent',
    ]) {
      publisher.subscribe(eventName, (event) => {
        published.push(event);
      });
    }
  });

  it('registrerer et løst steg som mestring på temaet og ferdigheten', async () => {
    const session = chooseOrThrow(practiceSession(), 'riktig');

    const result = await useCase.execute({ session });

    expect(result.isSuccess).toBe(true);
    if (result.isSuccess) {
      expect(result.value.recordedSteps).toBe(1);
      const stats = result.value.progress.categoryStats.get(Lk20Topic1T.LIGNINGER_OG_ULIKHETER);
      expect(stats?.tasksAttempted).toBe(1);
      expect(stats?.tasksCorrect).toBe(1);
      expect(stats?.masteryPercentage).toBe(100);
      expect(result.value.progress.goalStats.get('Lineære ligninger')?.tasksCorrect).toBe(1);
      expect(result.value.progress.totalSolved).toBe(1);
    }
    expect(repository.saveCount).toBe(1);
  });

  it('registrerer et avslørt steg som forsøk uten mestring', async () => {
    const revealed = practiceSession().revealCurrentStep();
    expect(revealed.isSuccess).toBe(true);
    if (!revealed.isSuccess) return;

    const result = await useCase.execute({ session: revealed.value });

    expect(result.isSuccess).toBe(true);
    if (result.isSuccess) {
      const stats = result.value.progress.categoryStats.get(Lk20Topic1T.LIGNINGER_OG_ULIKHETER);
      expect(stats?.tasksAttempted).toBe(1);
      expect(stats?.tasksCorrect).toBe(0);
      expect(stats?.masteryPercentage).toBe(0);
      expect(result.value.progress.totalSolved).toBe(0);
    }
  });

  it('registrerer misoppfatningen eleven gikk i', async () => {
    let session = chooseOrThrow(practiceSession(), 'galt');
    session = chooseOrThrow(session, 'riktig');

    const result = await useCase.execute({ session });

    expect(result.isSuccess).toBe(true);
    if (result.isSuccess) {
      expect(result.value.progress.misconceptionStats.get(MisconceptionType.SIGN_ERROR)).toBe(1);
    }
  });

  it('publiserer steghendelsen og en progresjonshendelse', async () => {
    const session = chooseOrThrow(practiceSession(), 'riktig');

    await useCase.execute({ session });

    expect(published.map((event) => event.eventName)).toEqual([
      'GuidedStepCompletedDomainEvent',
      'ProgressUpdatedDomainEvent',
    ]);
  });

  it('tømmer hendelsene på sesjonen, slik at ingenting publiseres dobbelt', async () => {
    const session = chooseOrThrow(practiceSession(), 'riktig');

    await useCase.execute({ session });
    expect(session.domainEvents).toHaveLength(0);

    published = [];
    await useCase.execute({ session });
    expect(published).toEqual([]);
    expect(repository.saveCount).toBe(1);
  });

  it('lagrer ikke progresjon når ingen steg ble fullført', async () => {
    const session = chooseOrThrow(practiceSession(), 'galt');

    const result = await useCase.execute({ session });

    expect(result.isSuccess).toBe(true);
    if (result.isSuccess) {
      expect(result.value.recordedSteps).toBe(0);
    }
    expect(repository.saveCount).toBe(0);
    expect(published).toEqual([]);
  });

  it('publiserer øktfullført sammen med siste steg', async () => {
    let session = chooseOrThrow(practiceSession(false), 'riktig');
    await useCase.execute({ session });
    published = [];

    session = chooseOrThrow(session, 'riktig');
    await useCase.execute({ session });

    expect(published.map((event) => event.eventName)).toEqual([
      'GuidedStepCompletedDomainEvent',
      'GuidedLessonCompletedDomainEvent',
      'ProgressUpdatedDomainEvent',
    ]);
  });

  it('akkumulerer progresjon over flere steg', async () => {
    let session = chooseOrThrow(practiceSession(), 'riktig');
    await useCase.execute({ session });

    session = chooseOrThrow(session, 'riktig');
    const result = await useCase.execute({ session });

    expect(result.isSuccess).toBe(true);
    if (result.isSuccess) {
      const stats = result.value.progress.categoryStats.get(Lk20Topic1T.LIGNINGER_OG_ULIKHETER);
      expect(stats?.tasksAttempted).toBe(2);
      expect(stats?.tasksCorrect).toBe(2);
      expect(result.value.progress.goalStats.get('Lineære ligninger')?.tasksAttempted).toBe(2);
    }
    expect(repository.saveCount).toBe(2);
  });
});
