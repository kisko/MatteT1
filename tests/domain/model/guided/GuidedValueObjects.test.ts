import { describe, it, expect } from 'vitest';
import { StepOption } from '../../../../src/domain/model/guided/value-objects/StepOption.js';
import { GuidedStep } from '../../../../src/domain/model/guided/value-objects/GuidedStep.js';
import {
  evaluateCurve,
  evaluateCurveSlope,
  StepVisual,
  validateVisual,
} from '../../../../src/domain/model/guided/value-objects/StepVisual.js';
import { MisconceptionType } from '../../../../src/domain/model/task/Misconception.js';

const optionProps = (overrides: Partial<Parameters<typeof StepOption.create>[0]> = {}) => ({
  id: 'valg-1',
  latex: '$2x = 8$',
  isCorrect: false,
  feedback: 'En forklaring eleven kan lære av.',
  ...overrides,
});

describe('StepOption', () => {
  it('oppretter et gyldig alternativ med forklaring', () => {
    const result = StepOption.create(optionProps({ isCorrect: true }));

    expect(result.isSuccess).toBe(true);
    if (result.isSuccess) {
      expect(result.value.isCorrect).toBe(true);
      expect(result.value.misconceptionType).toBeUndefined();
    }
  });

  it('krever forklaring, slik at eleven alltid får vite hvorfor', () => {
    const result = StepOption.create(optionProps({ feedback: '   ' }));

    expect(result.isFailure).toBe(true);
    if (result.isFailure) {
      expect(result.error.code).toBe('INVALID_STEP_OPTION');
    }
  });

  it('avviser tomt alternativ og manglende id', () => {
    expect(StepOption.create(optionProps({ latex: '' })).isFailure).toBe(true);
    expect(StepOption.create(optionProps({ id: ' ' })).isFailure).toBe(true);
  });

  it('nekter at et riktig alternativ er knyttet til en misoppfatning', () => {
    const result = StepOption.create(
      optionProps({ isCorrect: true, misconceptionType: MisconceptionType.SIGN_ERROR })
    );

    expect(result.isFailure).toBe(true);
  });

  it('behandler MisconceptionType.NONE som ingen misoppfatning', () => {
    const result = StepOption.create(
      optionProps({ isCorrect: true, misconceptionType: MisconceptionType.NONE })
    );

    expect(result.isSuccess).toBe(true);
    if (result.isSuccess) {
      expect(result.value.misconceptionType).toBeUndefined();
    }
  });

  it('beholder misoppfatningen på et galt alternativ', () => {
    const result = StepOption.create(
      optionProps({ misconceptionType: MisconceptionType.BRACKET_EXPANSION_ERROR })
    );

    expect(result.isSuccess).toBe(true);
    if (result.isSuccess) {
      expect(result.value.misconceptionType).toBe(MisconceptionType.BRACKET_EXPANSION_ERROR);
    }
  });

  it('sammenligner alternativer på id', () => {
    const first = StepOption.create(optionProps()).value as StepOption;
    const same = StepOption.create(optionProps({ latex: '$x = 4$' })).value as StepOption;
    const other = StepOption.create(optionProps({ id: 'valg-2' })).value as StepOption;

    expect(first.equals(same)).toBe(true);
    expect(first.equals(other)).toBe(false);
    expect(first.equals(undefined)).toBe(false);
  });
});

const buildOptions = (correctCount: number, total = 2): StepOption[] =>
  Array.from({ length: total }, (_, index) => {
    const result = StepOption.create(
      optionProps({ id: `valg-${index}`, isCorrect: index < correctCount })
    );
    return result.value as StepOption;
  });

const stepProps = (overrides: Partial<Parameters<typeof GuidedStep.create>[0]> = {}) => ({
  stepNumber: 1,
  kind: 'transform' as const,
  prompt: 'Hva er neste steg?',
  options: buildOptions(1),
  resultLatex: '$2x = 8$',
  rationale: 'Samme operasjon på begge sider.',
  hint: 'Se på konstantleddet.',
  visual: { kind: 'none' } as StepVisual,
  ...overrides,
});

describe('GuidedStep', () => {
  it('oppretter et gyldig steg og finner det riktige alternativet', () => {
    const result = GuidedStep.create(stepProps());

    expect(result.isSuccess).toBe(true);
    if (result.isSuccess) {
      expect(result.value.correctOption.id).toBe('valg-0');
      expect(result.value.findOption('valg-1')?.isCorrect).toBe(false);
      expect(result.value.findOption('finnes-ikke')).toBeUndefined();
    }
  });

  it('krever nøyaktig ett riktig alternativ', () => {
    expect(GuidedStep.create(stepProps({ options: buildOptions(0) })).isFailure).toBe(true);
    expect(GuidedStep.create(stepProps({ options: buildOptions(2) })).isFailure).toBe(true);
  });

  it('krever minst to alternativer, ellers er det ikke et valg', () => {
    const result = GuidedStep.create(stepProps({ options: buildOptions(1, 1) }));

    expect(result.isFailure).toBe(true);
    if (result.isFailure) {
      expect(result.error.code).toBe('INVALID_GUIDED_STEP');
    }
  });

  it('avviser duplikate alternativ-id-er', () => {
    const duplicated = [buildOptions(1)[0], buildOptions(1)[0]];
    expect(GuidedStep.create(stepProps({ options: duplicated })).isFailure).toBe(true);
  });

  it('krever stegnummer, spørsmål, resultat, begrunnelse og hint', () => {
    expect(GuidedStep.create(stepProps({ stepNumber: 0 })).isFailure).toBe(true);
    expect(GuidedStep.create(stepProps({ stepNumber: 1.5 })).isFailure).toBe(true);
    expect(GuidedStep.create(stepProps({ prompt: ' ' })).isFailure).toBe(true);
    expect(GuidedStep.create(stepProps({ resultLatex: '' })).isFailure).toBe(true);
    expect(GuidedStep.create(stepProps({ rationale: '' })).isFailure).toBe(true);
    expect(GuidedStep.create(stepProps({ hint: '' })).isFailure).toBe(true);
  });

  it('avviser et steg med en visualisering som ikke kan tegnes', () => {
    const result = GuidedStep.create(
      stepProps({ visual: { kind: 'bars', bars: [], caption: 'tom' } })
    );

    expect(result.isFailure).toBe(true);
    if (result.isFailure) {
      expect(result.error.code).toBe('INVALID_VISUAL');
    }
  });
});

describe('evaluateCurve', () => {
  it('regner ut polynomverdier fra koeffisientene', () => {
    const curve = { kind: 'polynomial' as const, coefficients: [0, 20, -5], tone: 'primary' as const };

    expect(evaluateCurve(curve, 0)).toBe(0);
    expect(evaluateCurve(curve, 2)).toBe(20);
    expect(evaluateCurve(curve, 4)).toBe(0);
  });

  it('regner ut eksponentialverdier', () => {
    const curve = { kind: 'exponential' as const, coefficients: [200, 1.3], tone: 'primary' as const };

    expect(evaluateCurve(curve, 0)).toBe(200);
    expect(evaluateCurve(curve, 1)).toBeCloseTo(260, 6);
  });

  it('gir stigningstallet til et polynom', () => {
    const curve = { kind: 'polynomial' as const, coefficients: [0, -5, 0, 2], tone: 'primary' as const };

    // f(x) = 2x^3 - 5x  =>  f'(x) = 6x^2 - 5  =>  f'(2) = 19
    expect(evaluateCurveSlope(curve, 2)).toBe(19);
    expect(evaluateCurveSlope(curve, 0)).toBe(-5);
  });

  it('gir stigningstallet til en eksponentialfunksjon', () => {
    const curve = { kind: 'exponential' as const, coefficients: [1, Math.E], tone: 'primary' as const };

    expect(evaluateCurveSlope(curve, 0)).toBeCloseTo(1, 6);
  });

  it('gir stigning 0 for en eksponential med ugyldig grunntall', () => {
    const curve = { kind: 'exponential' as const, coefficients: [1, 0], tone: 'primary' as const };

    expect(evaluateCurveSlope(curve, 1)).toBe(0);
  });
});

describe('validateVisual', () => {
  it('godtar ingen visualisering', () => {
    expect(validateVisual({ kind: 'none' }).isSuccess).toBe(true);
  });

  it('krever minst én kurve og et gyldig x-intervall for grafer', () => {
    const noCurves: StepVisual = { kind: 'graph', curves: [], xRange: [0, 1], caption: 'c' };
    const badRange: StepVisual = {
      kind: 'graph',
      curves: [{ kind: 'polynomial', coefficients: [1], tone: 'primary' }],
      xRange: [2, 2],
      caption: 'c',
    };
    const noCoefficients: StepVisual = {
      kind: 'graph',
      curves: [{ kind: 'polynomial', coefficients: [], tone: 'primary' }],
      xRange: [0, 1],
      caption: 'c',
    };

    expect(validateVisual(noCurves).isFailure).toBe(true);
    expect(validateVisual(badRange).isFailure).toBe(true);
    expect(validateVisual(noCoefficients).isFailure).toBe(true);
  });

  it('krever at tallinjen har markeringer innenfor sitt eget intervall', () => {
    const empty: StepVisual = { kind: 'numberline', min: 0, max: 10, caption: 'c' };
    const outside: StepVisual = {
      kind: 'numberline',
      min: 0,
      max: 10,
      points: [{ value: 12, label: 'utenfor', tone: 'primary' }],
      caption: 'c',
    };
    const flipped: StepVisual = { kind: 'numberline', min: 5, max: 5, caption: 'c' };
    const valid: StepVisual = {
      kind: 'numberline',
      min: 0,
      max: 10,
      intervals: [{ from: 0, to: 6, label: 'ok', tone: 'correct' }],
      caption: 'c',
    };

    expect(validateVisual(empty).isFailure).toBe(true);
    expect(validateVisual(outside).isFailure).toBe(true);
    expect(validateVisual(flipped).isFailure).toBe(true);
    expect(validateVisual(valid).isSuccess).toBe(true);
  });

  it('krever ledd i begge vektskålene', () => {
    const emptyPan: StepVisual = {
      kind: 'balance',
      left: { terms: [] },
      right: { terms: ['8'] },
      caption: 'c',
    };
    const valid: StepVisual = {
      kind: 'balance',
      left: { terms: ['2x'] },
      right: { terms: ['8'] },
      caption: 'c',
    };

    expect(validateVisual(emptyPan).isFailure).toBe(true);
    expect(validateVisual(valid).isSuccess).toBe(true);
  });

  it('krever at arealmodellen har én rute per rad og kolonne', () => {
    const missingPart: StepVisual = {
      kind: 'areaModel',
      rowLabels: ['x', '6'],
      columnLabels: ['x', '6'],
      parts: [{ rowLabel: 'x', columnLabel: 'x', productLatex: 'x^2', tone: 'primary' }],
      caption: 'c',
    };
    const noRows: StepVisual = {
      kind: 'areaModel',
      rowLabels: [],
      columnLabels: ['x'],
      parts: [],
      caption: 'c',
    };

    expect(validateVisual(missingPart).isFailure).toBe(true);
    expect(validateVisual(noRows).isFailure).toBe(true);
  });

  it('krever en spiss vinkel i trekanten', () => {
    const base = {
      kind: 'triangle' as const,
      adjacentLabel: 'a',
      oppositeLabel: 'b',
      hypotenuseLabel: 'c',
      highlight: 'sin' as const,
      caption: 'c',
    };

    expect(validateVisual({ ...base, angleDegrees: 0 }).isFailure).toBe(true);
    expect(validateVisual({ ...base, angleDegrees: 90 }).isFailure).toBe(true);
    expect(validateVisual({ ...base, angleDegrees: 65 }).isSuccess).toBe(true);
  });

  it('validerer vekstmodeller', () => {
    const base = { kind: 'growth' as const, startValue: 100, growthFactor: 1.05, periods: 5, caption: 'c' };

    expect(validateVisual({ ...base, periods: 0 }).isFailure).toBe(true);
    expect(validateVisual({ ...base, growthFactor: 0 }).isFailure).toBe(true);
    expect(validateVisual({ ...base, highlightPeriod: 9 }).isFailure).toBe(true);
    expect(validateVisual({ ...base, highlightPeriod: 3 }).isSuccess).toBe(true);
  });

  it('avviser stolpediagram uten stolper eller med negative verdier', () => {
    expect(validateVisual({ kind: 'bars', bars: [], caption: 'c' }).isFailure).toBe(true);
    expect(
      validateVisual({
        kind: 'bars',
        bars: [{ label: 'a', value: -1, tone: 'primary' }],
        caption: 'c',
      }).isFailure
    ).toBe(true);
  });
});
