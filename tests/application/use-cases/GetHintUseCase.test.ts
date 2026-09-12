import { describe, it, expect } from 'vitest';
import { GetHintUseCase } from '../../../src/application/use-cases/GetHintUseCase.js';
import { Task } from '../../../src/domain/model/task/Task.js';
import { Title } from '../../../src/domain/model/task/value-objects/Title.js';
import { LatexDescription } from '../../../src/domain/model/task/value-objects/LatexDescription.js';
import { Difficulty, DifficultyLevel } from '../../../src/domain/model/task/value-objects/Difficulty.js';
import { Lk20Category, Lk20Topic1T } from '../../../src/domain/model/task/value-objects/Lk20Category.js';
import { SolutionStep } from '../../../src/domain/model/task/value-objects/SolutionStep.js';

describe('GetHintUseCase', () => {
  const task = Task.create({
    title: Title.create('Test').value,
    description: LatexDescription.create('$x = 1$').value,
    difficulty: Difficulty.create(DifficultyLevel.LETT).value,
    category: Lk20Category.create(Lk20Topic1T.FUNKSJONER).value,
    solutionSteps: [SolutionStep.create(1, 'Steg 1', 'Forklaring').value],
    correctAnswer: { type: 'numeric', value: 1 },
  }).value;

  it('skal returnere hint for gyldig nivå', () => {
    const useCase = new GetHintUseCase();
    const hint = useCase.execute(task, 1);
    expect(hint).not.toBeNull();
    expect(hint?.level).toBe(1);
  });

  it('skal returnere null for ugyldig hint-nivå', () => {
    const useCase = new GetHintUseCase();
    const hint = useCase.execute(task, 99);
    expect(hint).toBeNull();
  });
});
