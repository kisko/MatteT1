import { describe, it, expect } from 'vitest';
import { AlgebraEvaluatorService } from '../../../../src/domain/task/services/AlgebraEvaluatorService.js';
import { StudentAnswer } from '../../../../src/domain/task/value-objects/StudentAnswer.js';

describe('AlgebraEvaluatorService', () => {
  describe('areEquivalent - Forenkling av rasjonale uttrykk', () => {
    it('skal godta faktorisert svar som ekvivalent med utvidet svar for rasjonalt uttrykk', () => {
      // Ekvivalente uttrykk: \frac{x^2 - 1}{x - 1}  <=>  x + 1
      const fasit = '\\frac{x^2 - 1}{x - 1}';
      const elevFaktorisert = 'x + 1';

      const isEquiv = AlgebraEvaluatorService.areEquivalent(fasit, elevFaktorisert);
      expect(isEquiv).toBe(true);
    });

    it('skal godta fullt faktorisert teller for brøk med andregradsuttrykk', () => {
      // \frac{x^2 - 5x + 6}{x - 2} <=> x - 3
      const fasit = '\\frac{(x - 2)(x - 3)}{x - 2}';
      const elevUtvidet = '\\frac{x^2 - 5x + 6}{x - 2}';

      const isEquiv = AlgebraEvaluatorService.areEquivalent(fasit, elevUtvidet);
      expect(isEquiv).toBe(true);
    });

    it('skal godta ulike faktoriserte former for rasjonale uttrykk', () => {
      // \frac{2x + 4}{x^2 - 4} <=> \frac{2}{x - 2}
      const fasit = '\\frac{2(x + 2)}{(x - 2)(x + 2)}';
      const elevForenklet = '\\frac{2}{x - 2}';

      const isEquiv = AlgebraEvaluatorService.areEquivalent(fasit, elevForenklet);
      expect(isEquiv).toBe(true);
    });

    it('skal avvise uttrykk som ikke er matematisk ekvivalente', () => {
      const fasit = '\\frac{x^2 - 1}{x - 1}';
      const feilSvar = 'x - 1';

      const isEquiv = AlgebraEvaluatorService.areEquivalent(fasit, feilSvar);
      expect(isEquiv).toBe(false);
    });
  });

  describe('evaluateAlgebraicAnswer', () => {
    it('skal returnere korrekt EvaluationResult for ekvivalent elevsvar', () => {
      const fasit = '\\frac{x^2 - 4}{x + 2}';
      const studentAnswerResult = StudentAnswer.create({
        type: 'expression',
        latex: 'x - 2',
      });

      expect(studentAnswerResult.isSuccess).toBe(true);

      if (studentAnswerResult.isSuccess) {
        const evalResult = AlgebraEvaluatorService.evaluateAlgebraicAnswer(
          fasit,
          studentAnswerResult.value
        );

        expect(evalResult.isSuccess).toBe(true);
        if (evalResult.isSuccess) {
          expect(evalResult.value.isCorrect).toBe(true);
          expect(evalResult.value.score).toBe(1.0);
        }
      }
    });

    it('skal returnere ikke-korrekt EvaluationResult for feil elevsvar', () => {
      const fasit = '\\frac{x^2 - 4}{x + 2}';
      const studentAnswerResult = StudentAnswer.create({
        type: 'expression',
        latex: 'x + 2',
      });

      expect(studentAnswerResult.isSuccess).toBe(true);

      if (studentAnswerResult.isSuccess) {
        const evalResult = AlgebraEvaluatorService.evaluateAlgebraicAnswer(
          fasit,
          studentAnswerResult.value
        );

        expect(evalResult.isSuccess).toBe(true);
        if (evalResult.isSuccess) {
          expect(evalResult.value.isCorrect).toBe(false);
          expect(evalResult.value.score).toBe(0.0);
        }
      }
    });
  });
});
