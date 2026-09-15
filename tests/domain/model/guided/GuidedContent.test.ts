import { describe, it, expect } from 'vitest';
import { GuidedWalkthrough } from '../../../../src/domain/model/guided/GuidedWalkthrough.js';
import { ErrorHunt } from '../../../../src/domain/model/guided/ErrorHunt.js';
import { MisconceptionType } from '../../../../src/domain/model/task/Misconception.js';
import {
  buildWalkthrough,
  errorHuntDefinition,
  stepDefinition,
  walkthroughDefinition,
} from './fixtures.js';

describe('GuidedWalkthrough.fromDefinition', () => {
  it('bygger en gyldig utregning med nummererte steg', () => {
    const walkthrough = buildWalkthrough();

    expect(walkthrough.stepCount).toBe(2);
    expect(walkthrough.steps[0].stepNumber).toBe(1);
    expect(walkthrough.steps[1].stepNumber).toBe(2);
    expect(walkthrough.stepAt(2)?.prompt).toBe('Og hva blir da $x$?');
    expect(walkthrough.stepAt(9)).toBeUndefined();
  });

  it('krever minst to steg', () => {
    const result = GuidedWalkthrough.fromDefinition(
      walkthroughDefinition({ steps: [stepDefinition()] })
    );

    expect(result.isFailure).toBe(true);
    if (result.isFailure) {
      expect(result.error.code).toBe('INVALID_WALKTHROUGH');
    }
  });

  it('krever id, tittel, situasjon, problem, svar, lærdom og ferdighet', () => {
    const emptyFields: Array<Partial<Parameters<typeof walkthroughDefinition>[0]>> = [
      { id: ' ' },
      { title: '' },
      { situation: '' },
      { problemLatex: '' },
      { answerLatex: '' },
      { takeaway: '' },
      { skillLabel: '' },
    ];

    for (const overrides of emptyFields) {
      const result = GuidedWalkthrough.fromDefinition(walkthroughDefinition(overrides));
      expect(result.isFailure, `forventet feil for ${JSON.stringify(overrides)}`).toBe(true);
    }
  });

  it('forplanter feil fra et ugyldig steg', () => {
    const result = GuidedWalkthrough.fromDefinition(
      walkthroughDefinition({ steps: [stepDefinition(), stepDefinition({ hint: '' })] })
    );

    expect(result.isFailure).toBe(true);
    if (result.isFailure) {
      expect(result.error.code).toBe('INVALID_GUIDED_STEP');
    }
  });

  it('forplanter feil fra et ugyldig alternativ', () => {
    const result = GuidedWalkthrough.fromDefinition(
      walkthroughDefinition({
        steps: [
          stepDefinition({
            options: [
              { id: 'a', latex: '$x$', isCorrect: true, feedback: 'ok' },
              { id: 'b', latex: '$y$', feedback: '' },
            ],
          }),
          stepDefinition(),
        ],
      })
    );

    expect(result.isFailure).toBe(true);
    if (result.isFailure) {
      expect(result.error.code).toBe('INVALID_STEP_OPTION');
    }
  });

  it('samler misoppfatningene utregningen utsetter eleven for, uten duplikater', () => {
    const walkthrough = buildWalkthrough();

    expect(walkthrough.watchedMisconceptions).toEqual([MisconceptionType.SIGN_ERROR]);
  });
});

describe('ErrorHunt.fromDefinition', () => {
  it('bygger en gyldig feiljakt med nummererte linjer', () => {
    const result = ErrorHunt.fromDefinition(errorHuntDefinition());

    expect(result.isSuccess).toBe(true);
    if (result.isSuccess) {
      const hunt = result.value;
      expect(hunt.lines.map((line) => line.lineNumber)).toEqual([1, 2, 3]);
      expect(hunt.correctRepair.id).toBe('snu');
      expect(hunt.lineAt(2)?.note).toContain('Her er feilen');
      expect(hunt.lineAt(7)).toBeUndefined();
      expect(hunt.findRepair('behold')?.isCorrect).toBe(false);
      expect(hunt.findRepair('finnes-ikke')).toBeUndefined();
    }
  });

  it('krever minst tre linjer', () => {
    const result = ErrorHunt.fromDefinition(
      errorHuntDefinition({
        lines: [
          { latex: '$a$', note: 'oppgaven' },
          { latex: '$b$', note: 'feilen' },
        ],
      })
    );

    expect(result.isFailure).toBe(true);
  });

  it('nekter at den første linjen er feilen, siden det er oppgaveteksten', () => {
    const result = ErrorHunt.fromDefinition(errorHuntDefinition({ flawedLineNumber: 1 }));

    expect(result.isFailure).toBe(true);
    if (result.isFailure) {
      expect(result.error.code).toBe('INVALID_ERROR_HUNT');
    }
  });

  it('krever at linjenummeret for feilen finnes', () => {
    expect(ErrorHunt.fromDefinition(errorHuntDefinition({ flawedLineNumber: 9 })).isFailure).toBe(true);
    expect(ErrorHunt.fromDefinition(errorHuntDefinition({ flawedLineNumber: 2.5 })).isFailure).toBe(true);
  });

  it('krever en konkret misoppfatning', () => {
    const result = ErrorHunt.fromDefinition(
      errorHuntDefinition({ misconceptionType: MisconceptionType.NONE })
    );

    expect(result.isFailure).toBe(true);
  });

  it('krever nøyaktig én riktig reparasjon', () => {
    const noCorrect = ErrorHunt.fromDefinition(
      errorHuntDefinition({
        repairOptions: [
          { id: 'a', latex: '$x$', feedback: 'nei' },
          { id: 'b', latex: '$y$', feedback: 'nei' },
        ],
      })
    );
    const twoCorrect = ErrorHunt.fromDefinition(
      errorHuntDefinition({
        repairOptions: [
          { id: 'a', latex: '$x$', isCorrect: true, feedback: 'ja' },
          { id: 'b', latex: '$y$', isCorrect: true, feedback: 'ja' },
        ],
      })
    );

    expect(noCorrect.isFailure).toBe(true);
    expect(twoCorrect.isFailure).toBe(true);
  });

  it('krever minst to reparasjonsalternativer', () => {
    const result = ErrorHunt.fromDefinition(
      errorHuntDefinition({
        repairOptions: [{ id: 'a', latex: '$x$', isCorrect: true, feedback: 'ja' }],
      })
    );

    expect(result.isFailure).toBe(true);
  });

  it('avviser duplikate id-er blant reparasjonene', () => {
    const result = ErrorHunt.fromDefinition(
      errorHuntDefinition({
        repairOptions: [
          { id: 'samme', latex: '$x$', isCorrect: true, feedback: 'ja' },
          { id: 'samme', latex: '$y$', feedback: 'nei' },
        ],
      })
    );

    expect(result.isFailure).toBe(true);
  });

  it('krever innhold i alle linjer, merknader, forklaring og lærdom', () => {
    const cases: Array<Partial<Parameters<typeof errorHuntDefinition>[0]>> = [
      { id: '' },
      { title: '' },
      { claim: '' },
      { explanation: '' },
      { takeaway: '' },
      {
        lines: [
          { latex: '$a$', note: 'oppgaven' },
          { latex: '', note: 'feilen' },
          { latex: '$c$', note: 'svaret' },
        ],
      },
      {
        lines: [
          { latex: '$a$', note: 'oppgaven' },
          { latex: '$b$', note: '' },
          { latex: '$c$', note: 'svaret' },
        ],
      },
    ];

    for (const overrides of cases) {
      const result = ErrorHunt.fromDefinition(errorHuntDefinition(overrides));
      expect(result.isFailure, `forventet feil for ${JSON.stringify(overrides)}`).toBe(true);
    }
  });

  it('avviser en feiljakt med en visualisering som ikke kan tegnes', () => {
    const result = ErrorHunt.fromDefinition(
      errorHuntDefinition({ visual: { kind: 'bars', bars: [], caption: 'tom' } })
    );

    expect(result.isFailure).toBe(true);
    if (result.isFailure) {
      expect(result.error.code).toBe('INVALID_VISUAL');
    }
  });
});
