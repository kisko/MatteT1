import { describe, it, expect } from 'vitest';
import { StartQuizUseCase } from '../../../src/application/use-cases/StartQuizUseCase.js';
import { InMemoryTaskRepository } from '../../../src/infrastructure/persistence/InMemoryTaskRepository.js';
import { Lk20Topic1T } from '../../../src/domain/model/task/value-objects/Lk20Category.js';

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
});
