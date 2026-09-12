import { describe, it, expect } from 'vitest';
import { TaskEvaluatorService } from '../../../src/domain/services/TaskEvaluatorService.js';
import { StudentAnswer } from '../../../src/domain/model/task/value-objects/StudentAnswer.js';
import { MisconceptionType } from '../../../src/domain/model/task/Misconception.js';

describe('TaskEvaluatorService', () => {
  it('skal evaluere numeriske svar korrekt og gi suksess', () => {
    const expected = { type: 'numeric' as const, value: 3.14, tolerance: 0.01 };
    const answer = StudentAnswer.create({ type: 'numeric', value: 3.1415 }).value;

    const res = TaskEvaluatorService.evaluateWithAnalysis(expected, answer);
    expect(res.isSuccess).toBe(true);
    if (res.isSuccess) {
      expect(res.value.result.isCorrect).toBe(true);
    }
  });

  it('skal oppdage fortegnsfeil for numeriske svar', () => {
    const expected = { type: 'numeric' as const, value: 5 };
    const answer = StudentAnswer.create({ type: 'numeric', value: -5 }).value;

    const res = TaskEvaluatorService.evaluateWithAnalysis(expected, answer);
    expect(res.isSuccess).toBe(true);
    if (res.isSuccess) {
      expect(res.value.result.isCorrect).toBe(false);
      expect(res.value.misconception?.type).toBe(MisconceptionType.SIGN_ERROR);
    }
  });

  it('skal oppdage kvadratsetningsfeil (a+b)^2 = a^2+b^2', () => {
    const expected = { type: 'expression' as const, latex: 'x^2 + 6x + 9' };
    const answer = StudentAnswer.create({ type: 'expression', latex: 'x^2 + 9' }).value;

    const res = TaskEvaluatorService.evaluateWithAnalysis(expected, answer);
    expect(res.isSuccess).toBe(true);
    if (res.isSuccess) {
      expect(res.value.result.isCorrect).toBe(false);
      expect(res.value.misconception?.type).toBe(MisconceptionType.BRACKET_EXPANSION_ERROR);
    }
  });

  it('skal oppdage glemt negativ rot feil', () => {
    const expected = { type: 'expression' as const, latex: 'x = \\pm 2' };
    const answer = StudentAnswer.create({ type: 'expression', latex: 'x = 2' }).value;

    const res = TaskEvaluatorService.evaluateWithAnalysis(expected, answer);
    expect(res.isSuccess).toBe(true);
    if (res.isSuccess) {
      expect(res.value.result.isCorrect).toBe(false);
      expect(res.value.misconception?.type).toBe(MisconceptionType.FORGOT_NEGATIVE_ROOT);
    }
  });

  it('skal avvise feil type svar med forklaring', () => {
    const expected = { type: 'numeric' as const, value: 10 };
    const answer = StudentAnswer.create({ type: 'expression', latex: 'x+1' }).value;

    const res = TaskEvaluatorService.evaluateWithAnalysis(expected, answer);
    expect(res.isSuccess).toBe(true);
    if (res.isSuccess) {
      expect(res.value.result.isCorrect).toBe(false);
    }
  });
});
