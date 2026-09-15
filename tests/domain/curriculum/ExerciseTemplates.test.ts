import { describe, it, expect } from 'vitest';
import {
  EXERCISE_TEMPLATES,
  templateById,
  templatesForTopic,
  totalVariantCount,
} from '../../../src/domain/curriculum/guided/templates/index.js';
import { COMPETENCE_MATRIX } from '../../../src/domain/curriculum/CompetenceMatrix.js';
import { GuidedWalkthrough } from '../../../src/domain/model/guided/GuidedWalkthrough.js';
import { Lk20Topic1T } from '../../../src/domain/model/task/value-objects/Lk20Category.js';
import {
  MisconceptionType,
  MISCONCEPTION_INFO,
} from '../../../src/domain/model/task/Misconception.js';
import { ExerciseTemplate } from '../../../src/domain/model/guided/ExerciseTemplate.js';

/**
 * Egenskapstester over malene.
 *
 * En mal lager hundrevis av varianter, og ingen av dem blir lest av et
 * menneske før en elev møter den. Derfor sjekkes hver variant maskinelt:
 * validerer den, har den nøyaktig ett riktig svar, henger tallene sammen, og
 * er all matematikk skrivbar?
 */

/** Antall frø som testes per mal. Dekker variantrommet godt nok til å fange kantene. */
const SEEDS = Array.from({ length: 40 }, (_, index) => index + 1);

const allGoalIds = COMPETENCE_MATRIX.flatMap((topic) => topic.goals.map((goal) => goal.id));

const goalFor = (goalId: string) =>
  COMPETENCE_MATRIX.flatMap((topic) => topic.goals).find((goal) => goal.id === goalId);

const countMathDelimiters = (text: string): number => (text.match(/(?<!\\)\$/g) ?? []).length;

/** Fanger LaTeX som mistet backslashen til JS-strengescaping. */
const lostCommand = /(?<![\\a-zA-Z])(cdot|frac|sqrt|approx|prime|circ|binom|text|pm)(?![a-zA-Z])/;

/** Alle tekstfelt i en generert oppgave, med en sti som peker på feilen. */
const textFieldsOf = (template: ExerciseTemplate, seed: number) => {
  const definition = template.generate(seed);
  const fields: Array<{ path: string; value: string }> = [
    { path: 'situation', value: definition.situation },
    { path: 'problemLatex', value: definition.problemLatex },
    { path: 'answerLatex', value: definition.answerLatex },
    { path: 'takeaway', value: definition.takeaway },
    { path: 'title', value: definition.title },
  ];

  definition.steps.forEach((step, index) => {
    const stepPath = `steg${index + 1}`;
    fields.push(
      { path: `${stepPath}.prompt`, value: step.prompt },
      { path: `${stepPath}.resultLatex`, value: step.resultLatex },
      { path: `${stepPath}.rationale`, value: step.rationale },
      { path: `${stepPath}.hint`, value: step.hint }
    );
    if (step.visual.kind !== 'none') {
      fields.push({ path: `${stepPath}.visual.caption`, value: step.visual.caption });
    }
    step.options.forEach((option) => {
      fields.push(
        { path: `${stepPath}.${option.id}.latex`, value: option.latex },
        { path: `${stepPath}.${option.id}.feedback`, value: option.feedback }
      );
    });
  });

  return fields;
};

describe('Oppgavemalene – dekning', () => {
  it('har én mal per kompetansemål i matrisen', () => {
    const templateGoals = EXERCISE_TEMPLATES.map((template) => template.goalId).sort();

    expect(templateGoals).toEqual([...allGoalIds].sort());
    expect(EXERCISE_TEMPLATES).toHaveLength(27);
  });

  it('har unike mal-id-er', () => {
    const ids = EXERCISE_TEMPLATES.map((template) => template.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it('knytter hver mal til en ferdighet som finnes i kompetansemålet', () => {
    for (const template of EXERCISE_TEMPLATES) {
      const goal = goalFor(template.goalId);

      expect(goal, `ukjent kompetansemål ${template.goalId}`).toBeDefined();
      expect(
        goal?.taskLabels,
        `ferdigheten '${template.skillLabel}' finnes ikke i ${template.goalId}`
      ).toContain(template.skillLabel);
    }
  });

  it('dekker alle sju temaer med minst tre maler hver', () => {
    for (const topic of Object.values(Lk20Topic1T)) {
      const templates = templatesForTopic(topic);

      expect(templates.length, `for få maler for ${topic}`).toBeGreaterThanOrEqual(3);
    }
  });

  it('finner maler på id', () => {
    expect(templateById('T-ALG-02')?.skillLabel).toBe('Faktorisering');
    expect(templateById('finnes-ikke')).toBeNull();
  });

  it('tilbyr nok varianter til at en elev kan øve lenge', () => {
    // Under dette er det ikke reell øving, bare gjenkjenning.
    expect(totalVariantCount()).toBeGreaterThan(1500);

    for (const template of EXERCISE_TEMPLATES) {
      expect(template.variantCount, `${template.id} har for få varianter`).toBeGreaterThanOrEqual(20);
    }
  });

  it('beskriver hver mal for eleven', () => {
    for (const template of EXERCISE_TEMPLATES) {
      expect(template.title.length, `${template.id} mangler tittel`).toBeGreaterThan(3);
      expect(template.description.length, `${template.id} mangler beskrivelse`).toBeGreaterThan(10);
    }
  });
});

describe.each(EXERCISE_TEMPLATES.map((template) => [template.id, template] as const))(
  'Oppgavemal %s',
  (_id, template) => {
    it('lager gyldige oppgaver for alle frø', () => {
      for (const seed of SEEDS) {
        const definition = template.generate(seed);
        const result = GuidedWalkthrough.fromDefinition(definition);

        if (result.isFailure) {
          throw new Error(
            `${template.id} med frø ${seed} er ugyldig: ${result.error.code} – ${result.error.message}`
          );
        }

        expect(result.value.topic).toBe(template.topic);
        expect(result.value.goalId).toBe(template.goalId);
        expect(result.value.skillLabel).toBe(template.skillLabel);
        expect(result.value.id).toContain(String(seed));
      }
    });

    it('er deterministisk: samme frø gir samme oppgave', () => {
      for (const seed of SEEDS.slice(0, 10)) {
        expect(template.generate(seed)).toEqual(template.generate(seed));
      }
    });

    it('har minst tre steg og avslutter med tolkning eller kontroll', () => {
      for (const seed of SEEDS) {
        const definition = template.generate(seed);

        expect(definition.steps.length, `${template.id}/${seed}`).toBeGreaterThanOrEqual(3);
        expect(
          ['interpret', 'checkResult'],
          `${template.id}/${seed} avslutter med '${definition.steps[definition.steps.length - 1].kind}'`
        ).toContain(definition.steps[definition.steps.length - 1].kind);
      }
    });

    it('har nøyaktig ett riktig alternativ og minst to valg i hvert steg', () => {
      for (const seed of SEEDS) {
        const definition = template.generate(seed);

        definition.steps.forEach((step, index) => {
          const correct = step.options.filter((option) => option.isCorrect);
          const ids = step.options.map((option) => option.id);

          expect(correct, `${template.id}/${seed} steg ${index + 1}`).toHaveLength(1);
          expect(
            step.options.length,
            `${template.id}/${seed} steg ${index + 1} har bare ett valg`
          ).toBeGreaterThanOrEqual(2);
          expect(new Set(ids).size, `${template.id}/${seed} steg ${index + 1} har duplikate id-er`).toBe(
            ids.length
          );
        });
      }
    });

    it('har ingen distraktør som er identisk med fasit', () => {
      for (const seed of SEEDS) {
        const definition = template.generate(seed);

        definition.steps.forEach((step, index) => {
          const correct = step.options.find((option) => option.isCorrect)!;
          const normalise = (latex: string) => latex.replace(/\s+/g, '');

          for (const option of step.options.filter((candidate) => !candidate.isCorrect)) {
            expect(
              normalise(option.latex),
              `${template.id}/${seed} steg ${index + 1}: '${option.id}' er lik fasit`
            ).not.toBe(normalise(correct.latex));
          }
        });
      }
    });

    it('gir hvert steg en visualisering', () => {
      for (const seed of SEEDS) {
        const definition = template.generate(seed);

        definition.steps.forEach((step, index) => {
          expect(step.visual.kind, `${template.id}/${seed} steg ${index + 1}`).not.toBe('none');
        });
      }
    });

    it('knytter minst én distraktør til en kjent misoppfatning', () => {
      for (const seed of SEEDS) {
        const definition = template.generate(seed);
        const types = definition.steps
          .flatMap((step) => step.options)
          .map((option) => option.misconceptionType)
          .filter((type): type is MisconceptionType => Boolean(type));

        expect(types.length, `${template.id}/${seed} har ingen misoppfatninger`).toBeGreaterThan(0);

        for (const type of types) {
          expect(type).not.toBe(MisconceptionType.NONE);
          expect(
            MISCONCEPTION_INFO[type as Exclude<MisconceptionType, MisconceptionType.NONE>],
            `${template.id}/${seed} viser til ukjent misoppfatning ${type}`
          ).toBeDefined();
        }
      }
    });

    it('gir hvert alternativ en forklaring eleven kan lære av', () => {
      for (const seed of SEEDS) {
        const definition = template.generate(seed);

        for (const step of definition.steps) {
          for (const option of step.options) {
            expect(
              option.feedback.length,
              `${template.id}/${seed}: '${option.id}' har for kort forklaring`
            ).toBeGreaterThan(15);
          }
        }
      }
    });

    it('skriver all matematikk med balanserte dollartegn', () => {
      for (const seed of SEEDS) {
        for (const field of textFieldsOf(template, seed)) {
          expect(
            countMathDelimiters(field.value) % 2,
            `${template.id}/${seed}: ubalanserte dollartegn i ${field.path} → «${field.value}»`
          ).toBe(0);
        }
      }
    });

    it('mister ingen LaTeX-kommandoer til strengescaping', () => {
      for (const seed of SEEDS) {
        for (const field of textFieldsOf(template, seed)) {
          expect(
            lostCommand.test(field.value),
            `${template.id}/${seed}: tapt LaTeX-kommando i ${field.path} → «${field.value}»`
          ).toBe(false);
        }
      }
    });

    it('lekker aldri NaN, Infinity eller undefined til eleven', () => {
      for (const seed of SEEDS) {
        for (const field of textFieldsOf(template, seed)) {
          // Merk: «null» er et vanlig norsk ord i disse tekstene
          // («nullpunkt», «sett lik null»), så det kan ikke flagges her.
          expect(field.value, `${template.id}/${seed}: ${field.path}`).not.toMatch(
            /NaN|Infinity|undefined/
          );
          expect(field.value.trim().length, `${template.id}/${seed}: ${field.path} er tom`).toBeGreaterThan(0);
        }
      }
    });

    it('varierer oppgaveteksten mellom frø', () => {
      // Noen maler har et fast uttrykk på oppgavelinjen ($K(x) = ?$) og
      // legger tallene i situasjonen. Variasjonen måles derfor på begge.
      const problems = new Set(
        SEEDS.map((seed) => {
          const definition = template.generate(seed);
          return `${definition.situation}|${definition.problemLatex}`;
        })
      );

      // Uten reell variasjon blir øving til gjenkjenning.
      expect(problems.size, `${template.id} gir for lite variasjon`).toBeGreaterThanOrEqual(8);
    });
  }
);
