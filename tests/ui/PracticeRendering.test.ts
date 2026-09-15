import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { PracticeStation } from '../../src/ui/views/lab/PracticeStation.js';
import { PracticeRun } from '../../src/domain/model/guided/PracticeRun.js';
import { EXERCISE_TEMPLATES } from '../../src/domain/curriculum/guided/templates/index.js';
import { ExerciseTemplate } from '../../src/domain/model/guided/ExerciseTemplate.js';

/**
 * Render-røyktest for de genererte oppgavene.
 *
 * Malene lager tall ingen har sett på forhånd, og det er nettopp i
 * visualiseringene slike tall gjør skade: en negativ skala, en divisjon på
 * null, en koordinat utenfor rammen. Her tegnes hver mal med flere frø, i
 * alle tilstander eleven kan havne i.
 */

const SEEDS = [1, 7, 23];

const unwrap = <T,>(result: { isSuccess: boolean; value?: T; error?: { message: string } }): T => {
  if (!result.isSuccess) {
    throw new Error(`Forventet suksess, men fikk: ${result.error?.message}`);
  }
  return result.value as T;
};

const renderStation = (run: PracticeRun): string =>
  renderToStaticMarkup(
    React.createElement(PracticeStation, {
      run,
      onRunChange: () => undefined,
      onSessionProgress: () => undefined,
      onExit: () => undefined,
    })
  );

const assertClean = (markup: string, label: string): void => {
  expect(markup.length, `${label}: tom markup`).toBeGreaterThan(500);
  expect(markup, `${label}: NaN i markup`).not.toContain('NaN');
  expect(markup, `${label}: Infinity i markup`).not.toContain('Infinity');
  expect(markup, `${label}: udefinert attributt`).not.toContain('="undefined"');
  // En SVG-koordinat som mangler gir tomme attributter og usynlig geometri.
  expect(markup, `${label}: tomt koordinatattributt`).not.toMatch(/\s(cx|cy|x1|y1|x2|y2|d)=""/);
};

/** Kjører en hel oppgave og samler markup fra hver tilstand underveis. */
const renderExercise = (template: ExerciseTemplate, seed: number): string[] => {
  const frames: string[] = [];
  let run = unwrap(PracticeRun.start(template, seed));
  frames.push(renderStation(run));

  // Bom på første steg, hent hintet, og løs resten riktig.
  const firstStep = run.session.currentStep!;
  const wrongOption = firstStep.options.find((option) => !option.isCorrect)!;
  run = unwrap(run.withSession(unwrap(run.session.chooseOption(wrongOption.id))));
  frames.push(renderStation(run));

  run = unwrap(run.withSession(unwrap(run.session.useHint())));
  frames.push(renderStation(run));

  while (run.session.stage === 'practice') {
    const step = run.session.currentStep;
    if (!step) break;
    run = unwrap(run.withSession(unwrap(run.session.chooseOption(step.correctOption.id))));
    frames.push(renderStation(run));
  }

  // Oppsummeringen av oppgaven, og deretter neste variant.
  expect(run.session.isComplete).toBe(true);
  run = unwrap(run.nextExercise());
  frames.push(renderStation(run));

  return frames;
};

describe.each(EXERCISE_TEMPLATES.map((template) => [template.id, template] as const))(
  'PracticeStation med %s',
  (_id, template) => {
    it('tegner alle tilstander uten NaN i geometrien', () => {
      for (const seed of SEEDS) {
        const frames = renderExercise(template, seed);

        expect(frames.length).toBeGreaterThanOrEqual(5);
        frames.forEach((frame, index) => {
          assertClean(frame, `${template.id}/frø ${seed}/ramme ${index}`);
        });
      }
    });
  }
);

describe('PracticeStation – innhold', () => {
  const template = EXERCISE_TEMPLATES.find((candidate) => candidate.id === 'T-LIG-01')!;

  it('viser ferdighet, oppgavenummer og rekken', () => {
    const markup = renderStation(unwrap(PracticeRun.start(template, 1)));

    expect(markup).toContain('Lineære ligninger');
    expect(markup).toContain('Oppgave');
    expect(markup).toContain('Rekke');
    expect(markup).toContain('Velg den neste linjen');
  });

  it('viser XP og neste steg når oppgaven er ferdig', () => {
    let run = unwrap(PracticeRun.start(template, 1));
    while (run.session.stage === 'practice') {
      const step = run.session.currentStep!;
      run = unwrap(run.withSession(unwrap(run.session.chooseOption(step.correctOption.id))));
    }

    const markup = renderStation(run);
    expect(markup).toContain('Feilfritt!');
    expect(markup).toContain('XP');
    expect(markup).toContain('Neste oppgave');
    expect(markup).toContain('3 oppgaver på rad');
  });

  it('viser mestringsmerket når rekken er fullført', () => {
    let run = unwrap(PracticeRun.start(template, 1));

    for (let round = 0; round < 3; round += 1) {
      while (run.session.stage === 'practice') {
        const step = run.session.currentStep!;
        run = unwrap(run.withSession(unwrap(run.session.chooseOption(step.correctOption.id))));
      }
      run = unwrap(run.nextExercise());
    }

    expect(run.isMastered).toBe(true);
    const markup = renderStation(run);
    expect(markup).toContain('Mestret');
  });

  it('viser misoppfatningen eleven gikk i', () => {
    let run = unwrap(PracticeRun.start(template, 1));
    const step = run.session.currentStep!;
    const wrongOption = step.options.find(
      (option) => !option.isCorrect && option.misconceptionType
    )!;
    run = unwrap(run.withSession(unwrap(run.session.chooseOption(wrongOption.id))));

    const markup = renderStation(run);
    expect(markup).toContain('Ikke dette steget');
  });
});
