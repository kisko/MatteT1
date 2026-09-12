import { describe, it, expect } from 'vitest';
import { SubmitAnswerUseCase } from '../../../src/application/use-cases/SubmitAnswerUseCase.js';
import { QuizSession } from '../../../src/domain/model/quiz/QuizSession.js';
import { Task } from '../../../src/domain/model/task/Task.js';
import { Title } from '../../../src/domain/model/task/value-objects/Title.js';
import { LatexDescription } from '../../../src/domain/model/task/value-objects/LatexDescription.js';
import { Difficulty, DifficultyLevel } from '../../../src/domain/model/task/value-objects/Difficulty.js';
import { Lk20Category, Lk20Topic1T } from '../../../src/domain/model/task/value-objects/Lk20Category.js';
import { SolutionStep } from '../../../src/domain/model/task/value-objects/SolutionStep.js';
import { LocalStorageProgressRepository } from '../../../src/infrastructure/persistence/LocalStorageProgressRepository.js';

describe('SubmitAnswerUseCase', () => {
  it('skal evaluere svar og oppdatere brukerens progresjon', async () => {
    const task = Task.create({
      title: Title.create('Faktorisering').value,
      description: LatexDescription.create('$x^2 - 4$').value,
      difficulty: Difficulty.create(DifficultyLevel.LETT).value,
      category: Lk20Category.create(Lk20Topic1T.TALL_OG_ALGEBRA).value,
      solutionSteps: [SolutionStep.create(1, 'Bruk konjugatsetning', '$(x-2)(x+2)$').value],
      correctAnswer: { type: 'expression', latex: '(x - 2)(x + 2)' },
    }).value;

    const session = QuizSession.create([task], 'Algebra').value;
    const progressRepo = new LocalStorageProgressRepository();
    const useCase = new SubmitAnswerUseCase(progressRepo);

    const result = await useCase.execute({
      session,
      answerValue: { type: 'expression', latex: '(x-2)(x+2)' },
    });

    expect(result.isSuccess).toBe(true);
    if (result.isSuccess) {
      expect(result.value.result.isCorrect).toBe(true);
    }
  });
});
