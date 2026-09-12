import { describe, it, expect } from 'vitest';
import { HintGeneratorService } from '../../../src/domain/services/HintGeneratorService.js';
import { Task } from '../../../src/domain/model/task/Task.js';
import { Title } from '../../../src/domain/model/task/value-objects/Title.js';
import { LatexDescription } from '../../../src/domain/model/task/value-objects/LatexDescription.js';
import { Difficulty, DifficultyLevel } from '../../../src/domain/model/task/value-objects/Difficulty.js';
import { Lk20Category, Lk20Topic1T } from '../../../src/domain/model/task/value-objects/Lk20Category.js';
import { SolutionStep } from '../../../src/domain/model/task/value-objects/SolutionStep.js';

describe('HintGeneratorService', () => {
  it('skal generere hint basert på oppgavens løsningssteg', () => {
    const task = Task.create({
      title: Title.create('Oppgave').value,
      description: LatexDescription.create('Tekst').value,
      difficulty: Difficulty.create(DifficultyLevel.LETT).value,
      category: Lk20Category.create(Lk20Topic1T.FUNKSJONER).value,
      solutionSteps: [
        SolutionStep.create(1, 'Steg 1', 'Forklaring 1').value,
        SolutionStep.create(2, 'Steg 2', 'Forklaring 2').value,
      ],
      correctAnswer: { type: 'numeric', value: 1 },
    }).value;

    const hints = HintGeneratorService.getHintsForTask(task);
    expect(hints.length).toBeGreaterThan(0);
    expect(hints[0].level).toBe(1);
  });
});
