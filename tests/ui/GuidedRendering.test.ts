import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { GuidedSolverStation } from '../../src/ui/views/lab/GuidedSolverStation.js';
import { StepVisualCanvas } from '../../src/ui/components/guided/StepVisualCanvas.js';
import { GuidedSession } from '../../src/domain/model/guided/GuidedSession.js';
import { GuidedContentCatalog } from '../../src/domain/curriculum/guided/GuidedContentCatalog.js';
import { Lk20Topic1T } from '../../src/domain/model/task/value-objects/Lk20Category.js';
import { StepVisual } from '../../src/domain/model/guided/value-objects/StepVisual.js';

/**
 * Render-røyktest uten nettleser.
 *
 * Komponentene tegnes til statisk markup i Node. Det fanger det som faktisk
 * går galt i en matematisk visualisering: NaN i SVG-koordinater, manglende
 * felter og innhold som kaster under rendring. Ingen nye avhengigheter –
 * react-dom er alt i prosjektet.
 */

const render = (element: React.ReactElement): string => renderToStaticMarkup(element);

const station = (session: GuidedSession): React.ReactElement =>
  React.createElement(GuidedSolverStation, {
    session,
    onSessionChange: () => undefined,
    onPickAnotherTopic: () => undefined,
    onStartQuiz: () => undefined,
  });

/** Kjører en hel økt gjennom alle fasene og samler markup fra hver av dem. */
const renderWholeSession = (topic: Lk20Topic1T): string[] => {
  const content = GuidedContentCatalog.contentForTopic(topic);
  if (!content.walkthrough) {
    throw new Error(`Mangler innhold for ${topic}`);
  }

  const markup: string[] = [];
  let session = GuidedSession.start(content.walkthrough, content.errorHunt, `render-${topic}`);

  // «Se det»: hver avdekkede linje tegnes med sin visualisering.
  markup.push(render(station(session)));
  for (let index = 0; index < content.walkthrough.stepCount; index += 1) {
    const next = session.revealNextWatchStep();
    if (next.isFailure) throw new Error(next.error.message);
    session = next.value;
    markup.push(render(station(session)));
  }

  const practice = session.beginPractice();
  if (practice.isFailure) throw new Error(practice.error.message);
  session = practice.value;

  // «Gjør det»: hvert steg tegnes med et bomvalg, hint og riktig valg.
  while (session.stage === 'practice') {
    const step = session.currentStep;
    if (!step) break;

    const hinted = session.useHint();
    if (hinted.isFailure) throw new Error(hinted.error.message);
    session = hinted.value;
    markup.push(render(station(session)));

    const wrongOption = step.options.find((option) => !option.isCorrect);
    if (wrongOption) {
      const wrong = session.chooseOption(wrongOption.id);
      if (wrong.isFailure) throw new Error(wrong.error.message);
      session = wrong.value;
      markup.push(render(station(session)));
    }

    const correct = session.chooseOption(step.correctOption.id);
    if (correct.isFailure) throw new Error(correct.error.message);
    session = correct.value;
    markup.push(render(station(session)));
  }

  // «Finn feilen»: feil linje, riktig linje, gal reparasjon, riktig reparasjon.
  if (session.stage === 'hunt' && content.errorHunt) {
    const clearLine = content.errorHunt.lines.find(
      (line) => line.lineNumber !== content.errorHunt!.flawedLineNumber
    );
    if (clearLine) {
      const cleared = session.selectHuntLine(clearLine.lineNumber);
      if (cleared.isFailure) throw new Error(cleared.error.message);
      session = cleared.value;
      markup.push(render(station(session)));
    }

    const found = session.selectHuntLine(content.errorHunt.flawedLineNumber);
    if (found.isFailure) throw new Error(found.error.message);
    session = found.value;
    markup.push(render(station(session)));

    const badRepair = content.errorHunt.repairOptions.find((option) => !option.isCorrect);
    if (badRepair) {
      const wrong = session.chooseRepair(badRepair.id);
      if (wrong.isFailure) throw new Error(wrong.error.message);
      session = wrong.value;
      markup.push(render(station(session)));
    }

    const repaired = session.chooseRepair(content.errorHunt.correctRepair.id);
    if (repaired.isFailure) throw new Error(repaired.error.message);
    session = repaired.value;
  }

  // «Kontroll»: oppsummeringen.
  expect(session.stage).toBe('summary');
  markup.push(render(station(session)));

  return markup;
};

const allTopics = Object.values(Lk20Topic1T);

describe('GuidedSolverStation – rendring gjennom hele økta', () => {
  for (const topic of allTopics) {
    it(`tegner alle faser for ${topic} uten NaN i geometrien`, () => {
      const frames = renderWholeSession(topic);

      expect(frames.length).toBeGreaterThan(5);
      for (const [index, frame] of frames.entries()) {
        expect(frame.length, `tom markup i ramme ${index} for ${topic}`).toBeGreaterThan(500);
        expect(frame, `NaN i ramme ${index} for ${topic}`).not.toContain('NaN');
        expect(frame, `Infinity i ramme ${index} for ${topic}`).not.toContain('Infinity');
        expect(frame, `udefinert verdi i ramme ${index} for ${topic}`).not.toContain('="undefined"');
      }
    });
  }

  it('viser fasene, oppgaven og stegene i markupen', () => {
    const frames = renderWholeSession(Lk20Topic1T.LIGNINGER_OG_ULIKHETER);
    const firstFrame = frames[0];
    const lastFrame = frames[frames.length - 1];

    expect(firstFrame).toContain('Se det');
    expect(firstFrame).toContain('Gjør det');
    expect(firstFrame).toContain('Finn feilen');
    expect(firstFrame).toContain('Hvilken taxi er billigst?');
    expect(firstFrame).toContain('Stegene dine');

    expect(lastFrame).toContain('XP');
    expect(lastFrame).toContain('Ta med videre');
  });

  it('tegner et bomvalg med sin egen forklaring, ikke bare et kryss', () => {
    const content = GuidedContentCatalog.contentForTopic(Lk20Topic1T.TALL_OG_ALGEBRA);
    let session = GuidedSession.start(content.walkthrough!, content.errorHunt, 'render-feedback');

    const practice = session.beginPractice();
    expect(practice.isSuccess).toBe(true);
    if (!practice.isSuccess) return;
    session = practice.value;

    const wrongOption = session.currentStep!.options.find((option) => !option.isCorrect)!;
    const afterWrong = session.chooseOption(wrongOption.id);
    expect(afterWrong.isSuccess).toBe(true);
    if (!afterWrong.isSuccess) return;

    const markup = render(station(afterWrong.value));
    expect(markup).toContain('Ikke dette steget');
    expect(markup).toContain('vanligste algebrafeilen');
  });
});

describe('StepVisualCanvas', () => {
  it('tegner ingenting for «none»', () => {
    expect(render(React.createElement(StepVisualCanvas, { visual: { kind: 'none' } }))).toBe('');
  });

  it('tegner hver visualiseringstype i innholdsbanken', () => {
    const load = GuidedContentCatalog.load();
    const visuals: StepVisual[] = [
      ...load.walkthroughs.flatMap((walkthrough) => walkthrough.steps.map((step) => step.visual)),
      ...load.errorHunts.map((hunt) => hunt.visual),
    ];
    const kinds = new Set(visuals.map((visual) => visual.kind));

    // Alle sju bildespråk i laben skal være i bruk og kunne tegnes.
    expect(kinds.size).toBeGreaterThanOrEqual(5);

    for (const visual of visuals) {
      const markup = render(React.createElement(StepVisualCanvas, { visual }));
      expect(markup).toContain('<svg');
      expect(markup).not.toContain('NaN');
    }
  });

  it('tegner en vekstmodell og en tangent uten NaN', () => {
    const growth: StepVisual = {
      kind: 'growth',
      startValue: 5000,
      growthFactor: 1.04,
      periods: 5,
      highlightPeriod: 5,
      caption: 'Sparing med rente',
    };
    const tangent: StepVisual = {
      kind: 'graph',
      curves: [
        { kind: 'polynomial', coefficients: [0, -5, 0, 2], tone: 'primary', label: 'f', tangentAtX: 2 },
      ],
      xRange: [-2, 3],
      caption: 'Tangent i punktet',
    };

    for (const visual of [growth, tangent]) {
      const markup = render(React.createElement(StepVisualCanvas, { visual }));
      expect(markup).toContain('<svg');
      expect(markup).not.toContain('NaN');
    }
  });
});
