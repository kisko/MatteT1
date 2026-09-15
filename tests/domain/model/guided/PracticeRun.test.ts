import { describe, it, expect } from 'vitest';
import { PracticeRun } from '../../../../src/domain/model/guided/PracticeRun.js';
import { GuidedSession } from '../../../../src/domain/model/guided/GuidedSession.js';
import { ExerciseTemplate } from '../../../../src/domain/model/guided/ExerciseTemplate.js';
import { templateById } from '../../../../src/domain/curriculum/guided/templates/index.js';
import { Lk20Topic1T } from '../../../../src/domain/model/task/value-objects/Lk20Category.js';
import { MisconceptionType } from '../../../../src/domain/model/task/Misconception.js';
import { buildWalkthrough, walkthroughDefinition } from './fixtures.js';

const template = templateById('T-LIG-01') as ExerciseTemplate;

const unwrap = <T>(result: { isSuccess: boolean; value?: T; error?: { message: string } }): T => {
  if (!result.isSuccess) {
    throw new Error(`Forventet suksess, men fikk: ${result.error?.message}`);
  }
  return result.value as T;
};

const startRun = (seed = 1): PracticeRun => unwrap(PracticeRun.start(template, seed));

/** Løser den aktive oppgaven ved å velge riktig alternativ i hvert steg. */
const solveCleanly = (run: PracticeRun): PracticeRun => {
  let current = run;
  while (current.session.stage === 'practice') {
    const step = current.session.currentStep;
    if (!step) break;
    const next = unwrap(current.session.chooseOption(step.correctOption.id));
    current = unwrap(current.withSession(next));
  }
  return current;
};

/** Løser oppgaven, men bommer én gang på første steg. */
const solveWithOneMiss = (run: PracticeRun): PracticeRun => {
  let current = run;
  const step = current.session.currentStep!;
  const wrongOption = step.options.find((option) => !option.isCorrect)!;
  current = unwrap(current.withSession(unwrap(current.session.chooseOption(wrongOption.id))));
  return solveCleanly(current);
};

/** Løser oppgaven ved å få alle steg vist. */
const solveByRevealing = (run: PracticeRun): PracticeRun => {
  let current = run;
  while (current.session.stage === 'practice') {
    const next = unwrap(current.session.revealCurrentStep());
    current = unwrap(current.withSession(next));
  }
  return current;
};

describe('PracticeRun – oppstart', () => {
  it('starter rett på øvingen, uten gjennomgang', () => {
    const run = startRun();

    expect(run.session.stage).toBe('practice');
    expect(run.session.currentStepNumber).toBe(1);
    expect(run.exerciseNumber).toBe(1);
    expect(run.cleanStreak).toBe(0);
    expect(run.isMastered).toBe(false);
    expect(run.masteredAt).toBeNull();
    expect(run.topic).toBe(Lk20Topic1T.LIGNINGER_OG_ULIKHETER);
    expect(run.skillLabel).toBe('Lineære ligninger');
  });

  it('har ingen feiljakt, slik at repetisjonen går raskt', () => {
    expect(startRun().session.errorHunt).toBeNull();
  });

  it('bruker frøet som ble oppgitt', () => {
    expect(startRun(7).seed).toBe(7);
    expect(startRun(7).session.walkthrough.id).toContain('7');
  });

  it('gir samme oppgave for samme frø, og ulik for ulike frø', () => {
    expect(startRun(3).session.walkthrough.problemLatex).toBe(
      startRun(3).session.walkthrough.problemLatex
    );
    expect(startRun(3).session.walkthrough.problemLatex).not.toBe(
      startRun(4).session.walkthrough.problemLatex
    );
  });

  it('feiler tydelig om malen lager ugyldig innhold', () => {
    const brokenTemplate: ExerciseTemplate = {
      ...template,
      generate: () => walkthroughDefinition({ steps: [] }),
    };

    const result = PracticeRun.start(brokenTemplate);

    expect(result.isFailure).toBe(true);
    if (result.isFailure) {
      expect(result.error.code).toBe('INVALID_WALKTHROUGH');
    }
  });

  it('forteller eleven hva målet er før første oppgave', () => {
    expect(startRun().summary.nextStepMessage).toContain('3 oppgaver på rad');
  });
});

describe('PracticeRun – gjennom en oppgave', () => {
  it('tar imot hver nye sesjonstilstand', () => {
    const run = startRun();
    const step = run.session.currentStep!;
    const advanced = unwrap(run.withSession(unwrap(run.session.chooseOption(step.correctOption.id))));

    expect(advanced.session.currentStepNumber).toBe(2);
    expect(advanced.exerciseNumber).toBe(1);
  });

  it('nekter en sesjon som tilhører en annen oppgave', () => {
    const foreignSession = GuidedSession.start(buildWalkthrough(), null);
    const result = startRun().withSession(foreignSession);

    expect(result.isFailure).toBe(true);
    if (result.isFailure) {
      expect(result.error.code).toBe('ILLEGAL_TRANSITION');
    }
  });

  it('markerer oppgaven som ferdig når alle steg er løst', () => {
    const run = solveCleanly(startRun());

    expect(run.isCurrentExerciseComplete).toBe(true);
    expect(run.session.stage).toBe('summary');
  });

  it('nekter å hente ny oppgave før den aktive er ferdig', () => {
    const result = startRun().nextExercise();

    expect(result.isFailure).toBe(true);
    if (result.isFailure) {
      expect(result.error.code).toBe('ILLEGAL_TRANSITION');
    }
  });

  it('kan starte den aktive oppgaven på nytt med samme tall', () => {
    const solved = solveCleanly(startRun(5));
    const retried = unwrap(solved.retryCurrentExercise());

    expect(retried.seed).toBe(5);
    expect(retried.session.stage).toBe('practice');
    expect(retried.session.solvedStepCount).toBe(0);
    expect(retried.exerciseNumber).toBe(1);
  });
});

describe('PracticeRun – rekken mot mestring', () => {
  const completeCleanly = (run: PracticeRun): PracticeRun => unwrap(solveCleanly(run).nextExercise());

  it('teller en feilfri oppgave som ett steg i rekken', () => {
    const run = completeCleanly(startRun());

    expect(run.cleanStreak).toBe(1);
    expect(run.exerciseNumber).toBe(2);
    expect(run.results).toHaveLength(1);
    expect(run.results[0].clean).toBe(true);
    expect(run.results[0].averageScore).toBe(1);
    expect(run.isMastered).toBe(false);
  });

  it('gir en ny variant etter hver oppgave', () => {
    const first = startRun();
    const second = completeCleanly(first);

    expect(second.seed).toBe(first.seed + 1);
    expect(second.session.walkthrough.id).not.toBe(first.session.walkthrough.id);
    expect(second.session.stage).toBe('practice');
    expect(second.session.solvedStepCount).toBe(0);
  });

  it('markerer ferdigheten som mestret etter tre feilfrie på rad', () => {
    let run = startRun();
    run = completeCleanly(run);
    run = completeCleanly(run);
    expect(run.isMastered).toBe(false);

    run = completeCleanly(run);

    expect(run.cleanStreak).toBe(3);
    expect(run.isMastered).toBe(true);
    expect(run.masteredAt).toBe(3);
    expect(run.summary.nextStepMessage).toContain('mestret');
  });

  it('nullstiller rekken når eleven bommer, men beholder framgangen', () => {
    let run = completeCleanly(startRun());
    expect(run.cleanStreak).toBe(1);

    run = unwrap(solveWithOneMiss(run).nextExercise());

    expect(run.cleanStreak).toBe(0);
    expect(run.results).toHaveLength(2);
    expect(run.results[1].clean).toBe(false);
    expect(run.results[1].averageScore).toBeLessThan(1);
    expect(run.summary.bestStreak).toBe(1);
  });

  it('regner et avslørt steg som ikke feilfritt', () => {
    const run = unwrap(solveByRevealing(startRun()).nextExercise());

    expect(run.cleanStreak).toBe(0);
    expect(run.results[0].clean).toBe(false);
    expect(run.results[0].revealedSteps).toBeGreaterThan(0);
    expect(run.results[0].experiencePoints).toBe(0);
  });

  it('beholder mestringen selv om eleven bommer senere', () => {
    let run = startRun();
    run = completeCleanly(run);
    run = completeCleanly(run);
    run = completeCleanly(run);
    expect(run.masteredAt).toBe(3);

    run = unwrap(solveWithOneMiss(run).nextExercise());

    expect(run.isMastered).toBe(true);
    expect(run.masteredAt).toBe(3);
    expect(run.cleanStreak).toBe(0);
  });

  it('lar eleven fortsette å øve etter mestring', () => {
    let run = startRun();
    for (let index = 0; index < 5; index += 1) {
      run = completeCleanly(run);
    }

    expect(run.isMastered).toBe(true);
    expect(run.results).toHaveLength(5);
    expect(run.exerciseNumber).toBe(6);
    expect(run.session.stage).toBe('practice');
  });

  it('husker den beste rekken gjennom hele serien', () => {
    let run = startRun();
    run = completeCleanly(run);
    run = completeCleanly(run);
    run = unwrap(solveWithOneMiss(run).nextExercise());
    run = completeCleanly(run);

    expect(run.summary.bestStreak).toBe(2);
    expect(run.cleanStreak).toBe(1);
  });
});

describe('PracticeRun – oppsummering', () => {
  it('summerer poeng, nivå og antall oppgaver', () => {
    let run = startRun();
    run = unwrap(solveCleanly(run).nextExercise());
    run = unwrap(solveCleanly(run).nextExercise());

    const summary = run.summary;
    expect(summary.exercisesCompleted).toBe(2);
    expect(summary.averageScore).toBe(1);
    expect(summary.level).toBe('mester');
    expect(summary.totalExperiencePoints).toBeGreaterThan(0);
    expect(summary.requiredStreak).toBe(PracticeRun.REQUIRED_CLEAN_STREAK);
  });

  it('samler misoppfatningene eleven gikk i, på tvers av oppgaver', () => {
    const run = unwrap(solveWithOneMiss(startRun()).nextExercise());

    expect(run.summary.misconceptionsHit.length).toBeGreaterThan(0);
    expect(run.summary.misconceptionsHit).toContain(MisconceptionType.SIGN_ERROR);
  });

  it('forteller hvor mange som gjenstår i rekken', () => {
    let run = startRun();
    run = unwrap(solveCleanly(run).nextExercise());

    expect(run.summary.nextStepMessage).toContain('1 på rad');
    expect(run.summary.nextStepMessage).toContain('2 igjen');
  });

  it('sier at rekken starter på nytt etter en bom', () => {
    const run = unwrap(solveWithOneMiss(startRun()).nextExercise());

    expect(run.summary.nextStepMessage).toContain('på nytt');
  });

  it('gir tom oppsummering før første oppgave er fullført', () => {
    const summary = startRun().summary;

    expect(summary.exercisesCompleted).toBe(0);
    expect(summary.totalExperiencePoints).toBe(0);
    expect(summary.averageScore).toBe(0);
    expect(summary.misconceptionsHit).toEqual([]);
  });
});
