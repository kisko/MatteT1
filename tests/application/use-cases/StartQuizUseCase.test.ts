import { describe, it, expect } from 'vitest';
import { StartQuizUseCase } from '../../../src/application/use-cases/StartQuizUseCase.js';
import { InMemoryTaskRepository } from '../../../src/infrastructure/persistence/InMemoryTaskRepository.js';
import { Lk20Topic1T } from '../../../src/domain/model/task/value-objects/Lk20Category.js';
import { DifficultyLevel } from '../../../src/domain/model/task/value-objects/Difficulty.js';

describe('StartQuizUseCase', () => {
  it('skal starte en quiz-sesjon for et gyldig tema', async () => {
    const repo = new InMemoryTaskRepository();
    const useCase = new StartQuizUseCase(repo);

    const result = await useCase.execute(Lk20Topic1T.TALL_OG_ALGEBRA);
    expect(result.isSuccess).toBe(true);
    if (result.isSuccess) {
      expect(result.value.totalTasks).toBeGreaterThan(0);
    }
  });

  it('skal ha en startbar quiz for alle curriculum-moduler', async () => {
    const repo = new InMemoryTaskRepository();
    const useCase = new StartQuizUseCase(repo);

    for (const topic of Object.values(Lk20Topic1T)) {
      const result = await useCase.execute(topic);

      expect(result.isSuccess, `${topic} kan ikke starte quiz`).toBe(true);
      if (result.isSuccess) {
        expect(result.value.topicTitle).toBe(topic);
        expect(result.value.totalTasks).toBeGreaterThanOrEqual(3);
      }
    }
  });

  it('skal starte en blandet tidsbegrenset eksamensøkt', async () => {
    const repo = new InMemoryTaskRepository();
    const useCase = new StartQuizUseCase(repo);

    const result = await useCase.executeExam();

    expect(result.isSuccess).toBe(true);
    if (result.isSuccess) {
      expect(result.value.mode).toBe('exam');
      expect(result.value.timeLimitSeconds).toBe(45 * 60);
      expect(result.value.totalTasks).toBe(12);
      expect(new Set(result.value.tasks.map((task) => task.category.mainTopic)).size).toBeGreaterThanOrEqual(5);
      expect(result.value.tasks.every((task) => task.category.mainTopic !== Lk20Topic1T.SANNSYNLIGHET)).toBe(true);
      expect(result.value.tasks.filter((task) => task.difficulty.level === DifficultyLevel.LETT).length).toBeGreaterThanOrEqual(2);
      expect(result.value.tasks.filter((task) => task.difficulty.level === DifficultyLevel.MIDDELS).length).toBeGreaterThanOrEqual(4);
      expect(result.value.tasks.filter((task) => task.difficulty.level === DifficultyLevel.KREVENDE).length).toBeGreaterThanOrEqual(2);
    }
  });

  it('skal starte en målrettet økt for ett kompetansemål', async () => {
    const repo = new InMemoryTaskRepository();
    const useCase = new StartQuizUseCase(repo);

    const goalLabels = ['Nullpunkter', 'Andregradsfunksjoner', 'Parametre'];
    const result = await useCase.executeGoal(Lk20Topic1T.FUNKSJONER, goalLabels);

    expect(result.isSuccess).toBe(true);
    if (result.isSuccess) {
      expect(result.value.tasks.length).toBeGreaterThanOrEqual(2);
      expect(result.value.tasks.every((task) => goalLabels.includes(task.category.subCompetenceGoal ?? ''))).toBe(true);
    }
  });

  it('skal kunne starte en full eksamensøkt med utvidet tid', async () => {
    const repo = new InMemoryTaskRepository();
    const useCase = new StartQuizUseCase(repo);

    const result = await useCase.executeExam(24);

    expect(result.isSuccess).toBe(true);
    if (result.isSuccess) {
      expect(result.value.totalTasks).toBe(24);
      expect(result.value.timeLimitSeconds).toBe(90 * 60);
    }
  });

  it('skal returnere feil når temaet ikke har oppgaver', async () => {
    const emptyRepository = {
      getByTopic: async () => [],
      getByCompetenceGoal: async () => [],
    } as unknown as InMemoryTaskRepository;
    const useCase = new StartQuizUseCase(emptyRepository);

    const result = await useCase.execute(Lk20Topic1T.FUNKSJONER);

    expect(result.isFailure).toBe(true);
  });

  it('skal returnere feil når kompetansemål ikke gir oppgaver i temaet', async () => {
    const repository = {
      getByCompetenceGoal: async () => [],
    } as unknown as InMemoryTaskRepository;
    const useCase = new StartQuizUseCase(repository);

    const result = await useCase.executeGoal(Lk20Topic1T.FUNKSJONER, ['Ukjent mål']);

    expect(result.isFailure).toBe(true);
  });

  it('skal returnere feil når eksamensrepositoryet er tomt', async () => {
    const emptyRepository = {
      getByTopic: async () => [],
    } as unknown as InMemoryTaskRepository;
    const useCase = new StartQuizUseCase(emptyRepository);

    const result = await useCase.executeExam(12);

    expect(result.isFailure).toBe(true);
  });
});
