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

  it('skal bruke oppgitt antall desimaler når toleranse ikke er angitt', () => {
    const expected = { type: 'numeric' as const, value: 2.35, precision: 2 };
    const answer = StudentAnswer.create({ type: 'numeric', value: 2.354 }).value;

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

  it('skal oppdage potensregelfeil (x^2 * x^3 = x^6 i stedet for x^5)', () => {
    const expected = { type: 'expression' as const, latex: 'x^5' };
    const answer = StudentAnswer.create({ type: 'expression', latex: 'x^6' }).value;

    const res = TaskEvaluatorService.evaluateWithAnalysis(expected, answer);
    expect(res.isSuccess).toBe(true);
    if (res.isSuccess) {
      expect(res.value.result.isCorrect).toBe(false);
      expect(res.value.misconception?.type).toBe(MisconceptionType.EXPONENT_RULE_ERROR);
    }
  });

  it('skal oppdage manglende koeffisient ved derivasjon av potens', () => {
    const expected = { type: 'expression' as const, latex: '3x^2' };
    const answer = StudentAnswer.create({ type: 'expression', latex: 'x^2' }).value;

    const res = TaskEvaluatorService.evaluateWithAnalysis(expected, answer);
    expect(res.isSuccess).toBe(true);
    if (res.isSuccess) {
      expect(res.value.result.isCorrect).toBe(false);
      expect(res.value.misconception?.type).toBe(MisconceptionType.DERIVATIVE_POWER_RULE);
    }
  });

  it('skal oppdage logaritmeregel-feil for produkt', () => {
    const expected = { type: 'expression' as const, latex: '\\lg(a) + \\lg(b)' };
    const answer = StudentAnswer.create({ type: 'expression', latex: '\\lg(a) \\cdot \\lg(b)' }).value;

    const res = TaskEvaluatorService.evaluateWithAnalysis(expected, answer);
    expect(res.isSuccess).toBe(true);
    if (res.isSuccess) {
      expect(res.value.result.isCorrect).toBe(false);
      expect(res.value.misconception?.type).toBe(MisconceptionType.LOGARITHM_RULE_ERROR);
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

  it('skal gi retning uten å avsløre fasiten ved feil numerisk svar', () => {
    const expected = { type: 'numeric' as const, value: 42 };
    const answer = StudentAnswer.create({ type: 'numeric', value: 17 }).value;

    const res = TaskEvaluatorService.evaluateWithAnalysis(expected, answer);
    expect(res.isSuccess).toBe(true);
    if (res.isSuccess) {
      expect(res.value.result.isCorrect).toBe(false);
      expect(res.value.result.feedbackLatex).not.toContain('42');
      expect(res.value.result.feedbackLatex).toContain('Prøv igjen');
    }
  });
});
