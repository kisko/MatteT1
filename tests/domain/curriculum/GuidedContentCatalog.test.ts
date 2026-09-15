import { describe, it, expect, beforeEach } from 'vitest';
import { GuidedContentCatalog } from '../../../src/domain/curriculum/guided/GuidedContentCatalog.js';
import { COMPETENCE_MATRIX } from '../../../src/domain/curriculum/CompetenceMatrix.js';
import { Lk20Topic1T } from '../../../src/domain/model/task/value-objects/Lk20Category.js';
import {
  MisconceptionType,
  MISCONCEPTION_INFO,
} from '../../../src/domain/model/task/Misconception.js';
import { StepVisual } from '../../../src/domain/model/guided/value-objects/StepVisual.js';

const allTopics = Object.values(Lk20Topic1T);

/** Teller dollartegn som faktisk avgrenser matematikk (ikke \$ for kroner). */
const countMathDelimiters = (text: string): number =>
  (text.match(/(?<!\\)\$/g) ?? []).length;

const goalExists = (goalId: string): boolean =>
  COMPETENCE_MATRIX.some((topic) => topic.goals.some((goal) => goal.id === goalId));

const goalFor = (goalId: string) =>
  COMPETENCE_MATRIX.flatMap((topic) => topic.goals).find((goal) => goal.id === goalId);

describe('GuidedContentCatalog', () => {
  beforeEach(() => {
    GuidedContentCatalog.resetCache();
  });

  it('laster alt innhold uten å avvise noe', () => {
    const load = GuidedContentCatalog.load();

    expect(load.rejected).toEqual([]);
    expect(load.walkthroughs).toHaveLength(allTopics.length);
    expect(load.errorHunts).toHaveLength(allTopics.length);
  });

  it('mellomlagrer lastingen', () => {
    expect(GuidedContentCatalog.load()).toBe(GuidedContentCatalog.load());
  });

  it('har både veiledet utregning og feiljakt for hvert LK20-tema', () => {
    for (const topic of allTopics) {
      const content = GuidedContentCatalog.contentForTopic(topic);

      expect(content.walkthrough, `mangler utregning for ${topic}`).not.toBeNull();
      expect(content.errorHunt, `mangler feiljakt for ${topic}`).not.toBeNull();
      expect(content.walkthrough?.topic).toBe(topic);
      expect(content.errorHunt?.topic).toBe(topic);
    }

    expect(GuidedContentCatalog.availableTopics()).toEqual(allTopics);
  });

  it('finner en utregning på id og svarer null på ukjent id', () => {
    expect(GuidedContentCatalog.walkthroughById('GW-ALG-01')?.topic).toBe(
      Lk20Topic1T.TALL_OG_ALGEBRA
    );
    expect(GuidedContentCatalog.walkthroughById('finnes-ikke')).toBeNull();
  });

  it('har unike id-er', () => {
    const load = GuidedContentCatalog.load();
    const walkthroughIds = load.walkthroughs.map((walkthrough) => walkthrough.id);
    const huntIds = load.errorHunts.map((hunt) => hunt.id);

    expect(new Set(walkthroughIds).size).toBe(walkthroughIds.length);
    expect(new Set(huntIds).size).toBe(huntIds.length);
  });

  it('knytter alt innhold til et kompetansemål som finnes i matrisen', () => {
    const load = GuidedContentCatalog.load();

    for (const item of [...load.walkthroughs, ...load.errorHunts]) {
      expect(goalExists(item.goalId), `ukjent kompetansemål ${item.goalId} i ${item.id}`).toBe(true);
      expect(
        goalFor(item.goalId)?.taskLabels,
        `ferdigheten '${item.skillLabel}' i ${item.id} finnes ikke i ${item.goalId}`
      ).toContain(item.skillLabel);
    }
  });

  it('gir hvert steg en visualisering, slik at algebra og bilde henger sammen', () => {
    for (const walkthrough of GuidedContentCatalog.load().walkthroughs) {
      for (const step of walkthrough.steps) {
        expect(
          step.visual.kind,
          `steg ${step.stepNumber} i ${walkthrough.id} mangler visualisering`
        ).not.toBe('none');
      }
    }
  });

  it('gir hver feiljakt en visualisering av feilen', () => {
    for (const hunt of GuidedContentCatalog.load().errorHunts) {
      expect((hunt.visual as StepVisual).kind, `${hunt.id} mangler visualisering`).not.toBe('none');
    }
  });

  it('har minst tre steg i hver utregning, med ett riktig alternativ per steg', () => {
    for (const walkthrough of GuidedContentCatalog.load().walkthroughs) {
      expect(walkthrough.stepCount, `${walkthrough.id} har for få steg`).toBeGreaterThanOrEqual(3);

      for (const step of walkthrough.steps) {
        const correct = step.options.filter((option) => option.isCorrect);
        expect(correct, `steg ${step.stepNumber} i ${walkthrough.id}`).toHaveLength(1);
        expect(step.options.length).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it('avslutter hver utregning med et tolkningssteg eller en kontroll', () => {
    for (const walkthrough of GuidedContentCatalog.load().walkthroughs) {
      const lastStep = walkthrough.steps[walkthrough.stepCount - 1];

      expect(
        ['interpret', 'checkResult'],
        `${walkthrough.id} slutter på '${lastStep.kind}' i stedet for tolkning eller kontroll`
      ).toContain(lastStep.kind);
    }
  });

  it('knytter minst én typisk feil til hver utregning', () => {
    for (const walkthrough of GuidedContentCatalog.load().walkthroughs) {
      expect(
        walkthrough.watchedMisconceptions.length,
        `${walkthrough.id} har ingen misoppfatninger blant distraktørene`
      ).toBeGreaterThan(0);
    }
  });

  it('bruker bare misoppfatninger som finnes i registeret', () => {
    const load = GuidedContentCatalog.load();
    const referenced = new Set<MisconceptionType>();

    for (const walkthrough of load.walkthroughs) {
      walkthrough.watchedMisconceptions.forEach((type) => referenced.add(type));
    }
    for (const hunt of load.errorHunts) {
      referenced.add(hunt.misconceptionType);
      hunt.repairOptions.forEach((option) => {
        if (option.misconceptionType) {
          referenced.add(option.misconceptionType);
        }
      });
    }

    for (const type of referenced) {
      expect(type).not.toBe(MisconceptionType.NONE);
      expect(
        MISCONCEPTION_INFO[type as Exclude<MisconceptionType, MisconceptionType.NONE>],
        `misoppfatningen ${type} mangler i registeret`
      ).toBeDefined();
    }

    expect(referenced.size).toBeGreaterThanOrEqual(7);
  });

  it('peker hver feiljakt på en linje etter oppgaveteksten, med merknad om feilen', () => {
    for (const hunt of GuidedContentCatalog.load().errorHunts) {
      expect(hunt.flawedLineNumber).toBeGreaterThan(1);
      expect(hunt.flawedLineNumber).toBeLessThanOrEqual(hunt.lines.length);
      expect(
        hunt.lineAt(hunt.flawedLineNumber)?.note,
        `${hunt.id} forklarer ikke feilen på linje ${hunt.flawedLineNumber}`
      ).toContain('Her er feilen');
    }
  });

  it('gir hvert galt alternativ en forklaring eleven kan lære av', () => {
    const load = GuidedContentCatalog.load();
    const allOptions = [
      ...load.walkthroughs.flatMap((walkthrough) => walkthrough.steps.flatMap((step) => [...step.options])),
      ...load.errorHunts.flatMap((hunt) => [...hunt.repairOptions]),
    ];

    expect(allOptions.length).toBeGreaterThan(50);
    for (const option of allOptions) {
      expect(option.feedback.length, `alternativet ${option.id} har for kort forklaring`).toBeGreaterThan(
        15
      );
    }
  });

  it('har balanserte dollartegn i all matematikk', () => {
    const load = GuidedContentCatalog.load();
    const texts: Array<{ label: string; value: string }> = [];

    for (const walkthrough of load.walkthroughs) {
      texts.push(
        { label: `${walkthrough.id}.problem`, value: walkthrough.problemLatex },
        { label: `${walkthrough.id}.situation`, value: walkthrough.situation },
        { label: `${walkthrough.id}.answer`, value: walkthrough.answerLatex },
        { label: `${walkthrough.id}.takeaway`, value: walkthrough.takeaway }
      );

      for (const step of walkthrough.steps) {
        texts.push(
          { label: `${walkthrough.id}.steg${step.stepNumber}.prompt`, value: step.prompt },
          { label: `${walkthrough.id}.steg${step.stepNumber}.result`, value: step.resultLatex },
          { label: `${walkthrough.id}.steg${step.stepNumber}.rationale`, value: step.rationale },
          { label: `${walkthrough.id}.steg${step.stepNumber}.hint`, value: step.hint }
        );
        for (const option of step.options) {
          texts.push(
            { label: `${walkthrough.id}.steg${step.stepNumber}.${option.id}.latex`, value: option.latex },
            {
              label: `${walkthrough.id}.steg${step.stepNumber}.${option.id}.feedback`,
              value: option.feedback,
            }
          );
        }
      }
    }

    for (const hunt of load.errorHunts) {
      texts.push(
        { label: `${hunt.id}.claim`, value: hunt.claim },
        { label: `${hunt.id}.explanation`, value: hunt.explanation },
        { label: `${hunt.id}.takeaway`, value: hunt.takeaway }
      );
      for (const line of hunt.lines) {
        texts.push(
          { label: `${hunt.id}.linje${line.lineNumber}.latex`, value: line.latex },
          { label: `${hunt.id}.linje${line.lineNumber}.note`, value: line.note }
        );
      }
      for (const option of hunt.repairOptions) {
        texts.push(
          { label: `${hunt.id}.${option.id}.latex`, value: option.latex },
          { label: `${hunt.id}.${option.id}.feedback`, value: option.feedback }
        );
      }
    }

    for (const text of texts) {
      expect(countMathDelimiters(text.value) % 2, `ubalanserte dollartegn i ${text.label}`).toBe(0);
    }
  });

  it('bruker ikke tapte LaTeX-kommandoer i vanlige tekststrenger', () => {
    const load = GuidedContentCatalog.load();
    // Et JS-strengliteral spiser \c i '\cdot' og etterlater 'cdot' som ren tekst.
    // Dette fanger slike tapte kommandoer før de havner foran en elev.
    const suspicious = /(?<![\\a-zA-Z])(cdot|frac|sqrt|approx|prime|circ|text|pm)(?![a-zA-Z])/;
    const offenders: string[] = [];

    for (const walkthrough of load.walkthroughs) {
      for (const step of walkthrough.steps) {
        for (const option of step.options) {
          if (suspicious.test(option.feedback)) {
            offenders.push(`${walkthrough.id}.steg${step.stepNumber}.${option.id}`);
          }
        }
        if (suspicious.test(step.rationale)) {
          offenders.push(`${walkthrough.id}.steg${step.stepNumber}.rationale`);
        }
      }
    }

    for (const hunt of load.errorHunts) {
      if (suspicious.test(hunt.explanation)) {
        offenders.push(`${hunt.id}.explanation`);
      }
      for (const option of hunt.repairOptions) {
        if (suspicious.test(option.feedback)) {
          offenders.push(`${hunt.id}.${option.id}`);
        }
      }
    }

    expect(offenders).toEqual([]);
  });
});
