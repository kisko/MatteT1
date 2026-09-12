import { describe, it, expect } from 'vitest';
import { Title } from '../../../../src/domain/model/task/value-objects/Title.js';
import { LatexDescription } from '../../../../src/domain/model/task/value-objects/LatexDescription.js';
import { Difficulty, DifficultyLevel } from '../../../../src/domain/model/task/value-objects/Difficulty.js';
import { Lk20Category, Lk20Topic1T } from '../../../../src/domain/model/task/value-objects/Lk20Category.js';
import { SolutionStep } from '../../../../src/domain/model/task/value-objects/SolutionStep.js';
import { StudentAnswer } from '../../../../src/domain/model/task/value-objects/StudentAnswer.js';

describe('Value Objects', () => {
  describe('Title', () => {
    it('skal opprette en gyldig tittel', () => {
      const res = Title.create('Faktorisering');
      expect(res.isSuccess).toBe(true);
      if (res.isSuccess) expect(res.value.value).toBe('Faktorisering');
    });

    it('skal feile for for kort tittel', () => {
      const res = Title.create('a');
      expect(res.isFailure).toBe(true);
    });
  });

  describe('LatexDescription', () => {
    it('skal feile på ubalanserte dollartegn', () => {
      const res = LatexDescription.create('Sjekk $x^2 = 4');
      expect(res.isFailure).toBe(true);
    });

    it('skal godta gyldig LaTeX', () => {
      const res = LatexDescription.create('Finn $x$ i $x^2 = 4$.');
      expect(res.isSuccess).toBe(true);
    });
  });

  describe('Difficulty', () => {
    it('skal godta gyldig vanskelighetsgrad', () => {
      const res = Difficulty.create(DifficultyLevel.KREVENDE);
      expect(res.isSuccess).toBe(true);
    });

    it('skal avvise ugyldig streng', () => {
      const res = Difficulty.create('SUPER_VANSKELIG');
      expect(res.isFailure).toBe(true);
    });
  });

  describe('Lk20Category', () => {
    it('skal godta gyldig emne', () => {
      const res = Lk20Category.create(Lk20Topic1T.FUNKSJONER);
      expect(res.isSuccess).toBe(true);
    });
  });

  describe('SolutionStep', () => {
    it('skal avvise ugylig stegnummer (0 eller negativt)', () => {
      const res = SolutionStep.create(0, 'Tittel', 'Forklaring');
      expect(res.isFailure).toBe(true);
    });
  });

  describe('StudentAnswer', () => {
    it('skal avvise NaN numerisk svar', () => {
      const res = StudentAnswer.create({ type: 'numeric', value: NaN });
      expect(res.isFailure).toBe(true);
    });
  });
});
