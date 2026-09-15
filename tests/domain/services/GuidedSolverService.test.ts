import { describe, it, expect } from 'vitest';
import { GuidedSolverService } from '../../../src/domain/services/GuidedSolverService.js';
import { StepOption } from '../../../src/domain/model/guided/value-objects/StepOption.js';
import { MisconceptionType } from '../../../src/domain/model/task/Misconception.js';

const option = (overrides: Partial<Parameters<typeof StepOption.create>[0]> = {}): StepOption => {
  const result = StepOption.create({
    id: 'valg',
    latex: '$x = 4$',
    isCorrect: false,
    feedback: 'Fortegnet ble ikke endret.',
    ...overrides,
  });
  if (result.isFailure) {
    throw new Error(result.error.message);
  }
  return result.value;
};

describe('GuidedSolverService.scoreForStep', () => {
  it('gir full score på første forsøk', () => {
    expect(GuidedSolverService.scoreForStep({ attempts: 1, hintUsed: false, revealed: false })).toBe(1);
  });

  it('trapper ned score med antall forsøk', () => {
    expect(GuidedSolverService.scoreForStep({ attempts: 2, hintUsed: false, revealed: false })).toBe(0.6);
    expect(GuidedSolverService.scoreForStep({ attempts: 3, hintUsed: false, revealed: false })).toBe(0.35);
    expect(GuidedSolverService.scoreForStep({ attempts: 7, hintUsed: false, revealed: false })).toBe(0.35);
  });

  it('demper score når hintet er brukt', () => {
    expect(GuidedSolverService.scoreForStep({ attempts: 1, hintUsed: true, revealed: false })).toBe(0.8);
    expect(GuidedSolverService.scoreForStep({ attempts: 2, hintUsed: true, revealed: false })).toBe(0.48);
  });

  it('gir null for avslørte steg og for steg uten forsøk', () => {
    expect(GuidedSolverService.scoreForStep({ attempts: 1, hintUsed: false, revealed: true })).toBe(0);
    expect(GuidedSolverService.scoreForStep({ attempts: 0, hintUsed: false, revealed: false })).toBe(0);
  });
});

describe('GuidedSolverService – snitt, poeng og nivå', () => {
  it('regner ut gjennomsnitt og runder til to desimaler', () => {
    expect(GuidedSolverService.averageScore([1, 0.6])).toBe(0.8);
    expect(GuidedSolverService.averageScore([1, 1, 0])).toBe(0.67);
    expect(GuidedSolverService.averageScore([])).toBe(0);
  });

  it('gir erfaringspoeng som heltall', () => {
    expect(GuidedSolverService.experiencePoints([1, 1])).toBe(200);
    expect(GuidedSolverService.experiencePoints([0.35, 0.6])).toBe(95);
    expect(GuidedSolverService.experiencePoints([])).toBe(0);
  });

  it('plasserer nivå etter snittet', () => {
    expect(GuidedSolverService.masteryLevel(1)).toBe('mester');
    expect(GuidedSolverService.masteryLevel(0.95)).toBe('mester');
    expect(GuidedSolverService.masteryLevel(0.8)).toBe('sterk');
    expect(GuidedSolverService.masteryLevel(0.5)).toBe('god');
    expect(GuidedSolverService.masteryLevel(0.2)).toBe('på-vei');
  });

  it('regner ut progresjon i prosent', () => {
    expect(GuidedSolverService.progressPercentage(0, 4)).toBe(0);
    expect(GuidedSolverService.progressPercentage(1, 3)).toBe(33);
    expect(GuidedSolverService.progressPercentage(4, 4)).toBe(100);
    expect(GuidedSolverService.progressPercentage(9, 4)).toBe(100);
    expect(GuidedSolverService.progressPercentage(1, 0)).toBe(0);
  });
});

describe('GuidedSolverService.adviceAfterWrongChoice', () => {
  it('foreslår hintet først når det ikke er brukt', () => {
    const advice = GuidedSolverService.adviceAfterWrongChoice(1, false);

    expect(advice.tone).toBe('hint');
    expect(advice.message).toContain('hintet');
  });

  it('dytter eleven videre når hintet er brukt', () => {
    expect(GuidedSolverService.adviceAfterWrongChoice(1, true).tone).toBe('nudge');
  });

  it('tilbyr å vise steget etter nok bom', () => {
    expect(GuidedSolverService.adviceAfterWrongChoice(3, false).tone).toBe('reveal');
    expect(GuidedSolverService.adviceAfterWrongChoice(3, true).tone).toBe('reveal');
  });
});

describe('GuidedSolverService.feedbackForOption', () => {
  it('bruker alternativets egen tekst for riktige valg', () => {
    const correct = option({ id: 'riktig', isCorrect: true, feedback: 'Riktig gjort.' });

    expect(GuidedSolverService.feedbackForOption(correct)).toBe('Riktig gjort.');
  });

  it('legger på tipset fra misoppfatningsregisteret for kjente feil', () => {
    const wrong = option({ misconceptionType: MisconceptionType.SIGN_ERROR });
    const feedback = GuidedSolverService.feedbackForOption(wrong);

    expect(feedback).toContain('Fortegnet ble ikke endret.');
    expect(feedback).toContain('Pass ekstra på fortegnsregler');
  });

  it('bruker bare alternativets tekst når feilen ikke er en kjent klassiker', () => {
    const wrong = option();

    expect(GuidedSolverService.feedbackForOption(wrong)).toBe('Fortegnet ble ikke endret.');
  });

  it('gir tips for de nye misoppfatningene i Mesterlab', () => {
    const trig = option({ misconceptionType: MisconceptionType.TRIG_RATIO_MIXUP });
    const unit = option({ misconceptionType: MisconceptionType.UNIT_INTERPRETATION_ERROR });
    const probability = option({
      misconceptionType: MisconceptionType.PROBABILITY_COMBINATION_ERROR,
    });

    expect(GuidedSolverService.feedbackForOption(trig)).toContain('SOH-CAH-TOA');
    expect(GuidedSolverService.feedbackForOption(unit)).toContain('enhet');
    expect(GuidedSolverService.feedbackForOption(probability)).toContain('samtidig');
  });
});

describe('GuidedSolverService.closingMessage', () => {
  it('gir en egen melding per nivå', () => {
    expect(GuidedSolverService.closingMessage('mester', 0)).toContain('første forsøk');
    expect(GuidedSolverService.closingMessage('sterk', 0)).toContain('Sterk');
    expect(GuidedSolverService.closingMessage('god', 0)).toContain('fant veien selv');
    expect(GuidedSolverService.closingMessage('god', 2)).toContain('fikk se stegene');
    expect(GuidedSolverService.closingMessage('på-vei', 3)).toContain('Se det');
  });
});
