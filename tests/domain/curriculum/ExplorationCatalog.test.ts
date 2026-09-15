import { describe, it, expect, beforeEach } from 'vitest';
import { ExplorationCatalog } from '../../../src/domain/curriculum/exploration/ExplorationCatalog.js';
import { COMPETENCE_MATRIX } from '../../../src/domain/curriculum/CompetenceMatrix.js';
import { Lk20Topic1T } from '../../../src/domain/model/task/value-objects/Lk20Category.js';
import { ExplorationLab } from '../../../src/domain/model/exploration/ExplorationLab.js';
import { validateVisual } from '../../../src/domain/model/guided/value-objects/StepVisual.js';
import { ExplorationValues } from '../../../src/domain/model/exploration/ExplorationTypes.js';

/**
 * Utforskningene lever av at oppdragene faktisk er mulige å løse.
 *
 * Et oppdrag som «gjør diskriminanten negativ» er en påstand om at det finnes
 * en kombinasjon av glidebryterverdier som oppfyller det. Den påstanden kan
 * ikke sjekkes ved å lese koden, så testen søker gjennom hele rutenettet av
 * mulige verdier og beviser både at oppdraget kan løses, og at det ikke er
 * trivielt oppfylt hele tiden.
 */

/** Øvre grense for antall kombinasjoner som prøves per utforskning. */
const MAX_COMBINATIONS = 400_000;

const countCombinations = (lab: ExplorationLab): number =>
  lab.parameters.reduce((total, parameter) => total * parameter.allValues.length, 1);

/** Går gjennom hele rutenettet av parameterverdier. */
const forEachCombination = (
  lab: ExplorationLab,
  visit: (values: ExplorationValues) => boolean | void
): void => {
  const parameters = lab.parameters;
  const lengths = parameters.map((parameter) => parameter.allValues.length);
  const indices = new Array(parameters.length).fill(0);
  const total = countCombinations(lab);

  for (let counter = 0; counter < total; counter += 1) {
    const values: Record<string, number> = {};
    parameters.forEach((parameter, position) => {
      values[parameter.id] = parameter.allValues[indices[position]];
    });

    if (visit(values) === false) {
      return;
    }

    for (let position = parameters.length - 1; position >= 0; position -= 1) {
      indices[position] += 1;
      if (indices[position] < lengths[position]) break;
      indices[position] = 0;
    }
  }
};

const goalFor = (goalId: string) =>
  COMPETENCE_MATRIX.flatMap((topic) => topic.goals).find((goal) => goal.id === goalId);

const countMathDelimiters = (text: string): number => (text.match(/(?<!\\)\$/g) ?? []).length;

const labs = ExplorationCatalog.all();

describe('ExplorationCatalog', () => {
  beforeEach(() => {
    ExplorationCatalog.resetCache();
  });

  it('laster alle utforskninger uten å avvise noe', () => {
    const load = ExplorationCatalog.load();

    expect(load.rejected).toEqual([]);
    expect(load.labs.length).toBeGreaterThanOrEqual(8);
  });

  it('mellomlagrer lastingen', () => {
    expect(ExplorationCatalog.load()).toBe(ExplorationCatalog.load());
  });

  it('dekker alle sju LK20-temaer', () => {
    for (const topic of Object.values(Lk20Topic1T)) {
      expect(
        ExplorationCatalog.forTopic(topic).length,
        `mangler utforskning for ${topic}`
      ).toBeGreaterThanOrEqual(1);
    }

    expect(ExplorationCatalog.availableTopics()).toEqual(Object.values(Lk20Topic1T));
  });

  it('har unike id-er og finnes på id', () => {
    const ids = labs.map((lab) => lab.id);

    expect(new Set(ids).size).toBe(ids.length);
    expect(ExplorationCatalog.byId('E-FUN-01')?.title).toBe('Andregradsfunksjonen');
    expect(ExplorationCatalog.byId('finnes-ikke')).toBeNull();
  });

  it('tilbyr nok oppdrag til å gi utforskningen retning', () => {
    expect(ExplorationCatalog.totalMissionCount()).toBeGreaterThanOrEqual(24);
  });

  it('knytter hver utforskning til et kompetansemål i matrisen', () => {
    for (const lab of labs) {
      const goal = goalFor(lab.goalId);

      expect(goal, `${lab.id} viser til ukjent mål ${lab.goalId}`).toBeDefined();
      expect(
        goal?.taskLabels,
        `ferdigheten '${lab.skillLabel}' finnes ikke i ${lab.goalId}`
      ).toContain(lab.skillLabel);
    }
  });
});

describe.each(labs.map((lab) => [lab.id, lab] as const))('Utforskning %s', (_id, lab) => {
  it('har parametere som kan dras i', () => {
    expect(lab.parameters.length).toBeGreaterThanOrEqual(1);

    for (const parameter of lab.parameters) {
      expect(parameter.min).toBeLessThan(parameter.max);
      expect(parameter.step).toBeGreaterThan(0);
      expect(parameter.allValues.length).toBeGreaterThanOrEqual(3);
      expect(parameter.allValues).toContain(parameter.clamp(parameter.initial));
      expect(parameter.meaning.length).toBeGreaterThan(5);
    }
  });

  it('har påstander med både sant og usant, og forklaring på hver', () => {
    expect(lab.claims.length).toBeGreaterThanOrEqual(3);
    expect(lab.claims.some((claim) => claim.isTrue)).toBe(true);
    expect(lab.claims.some((claim) => !claim.isTrue)).toBe(true);

    for (const claim of lab.claims) {
      expect(claim.explanation.length, `påstanden '${claim.id}' har for kort forklaring`).toBeGreaterThan(20);
      expect(claim.text.length).toBeGreaterThan(10);
    }
  });

  it('har oppdrag med hint og bekreftelse', () => {
    expect(lab.missions.length).toBeGreaterThanOrEqual(2);

    for (const mission of lab.missions) {
      expect(mission.prompt.length).toBeGreaterThan(10);
      expect(mission.hint.length, `oppdraget '${mission.id}' har for kort hint`).toBeGreaterThan(10);
      expect(mission.successMessage.length).toBeGreaterThan(10);
    }
  });

  it('holder rutenettet av kombinasjoner innenfor det som kan søkes gjennom', () => {
    expect(countCombinations(lab)).toBeLessThanOrEqual(MAX_COMBINATIONS);
  });

  it('har oppdrag som faktisk er mulige å løse', () => {
    const solvable = new Set<string>();

    forEachCombination(lab, (values) => {
      for (const mission of lab.missions) {
        if (!solvable.has(mission.id) && mission.isAccomplished(values)) {
          solvable.add(mission.id);
        }
      }
      // Stopper så snart alle oppdrag er bevist mulige.
      return solvable.size !== lab.missions.length;
    });

    for (const mission of lab.missions) {
      expect(
        solvable.has(mission.id),
        `oppdraget '${mission.id}' i ${lab.id} kan ikke løses med noen kombinasjon av verdier`
      ).toBe(true);
    }
  });

  it('har oppdrag som ikke er oppfylt hele tiden', () => {
    const refutable = new Set<string>();

    forEachCombination(lab, (values) => {
      for (const mission of lab.missions) {
        if (!refutable.has(mission.id) && !mission.isAccomplished(values)) {
          refutable.add(mission.id);
        }
      }
      return refutable.size !== lab.missions.length;
    });

    for (const mission of lab.missions) {
      expect(
        refutable.has(mission.id),
        `oppdraget '${mission.id}' i ${lab.id} er alltid oppfylt, og gir dermed ingen utfordring`
      ).toBe(true);
    }
  });

  it('starter med minst ett oppdrag uløst', () => {
    const satisfiedAtStart = lab.missions.filter((mission) =>
      mission.isAccomplished(lab.initialValues)
    );

    expect(
      satisfiedAtStart.length,
      `alle oppdrag i ${lab.id} er alt løst ved oppstart`
    ).toBeLessThan(lab.missions.length);
  });

  it('tegner et gyldig bilde og gir tall for hele rutenettet', () => {
    // Et utvalg av kombinasjonene, jevnt fordelt over rutenettet.
    const total = countCombinations(lab);
    const stride = Math.max(1, Math.floor(total / 120));
    let index = 0;
    let checked = 0;

    forEachCombination(lab, (values) => {
      if (index++ % stride !== 0) return;
      checked += 1;

      const visual = lab.visualFor(values);
      const visualResult = validateVisual(visual);
      expect(
        visualResult.isSuccess,
        `${lab.id}: ugyldig bilde for ${JSON.stringify(values)}${
          visualResult.isFailure ? ` – ${visualResult.error.message}` : ''
        }`
      ).toBe(true);

      const readouts = lab.readoutsFor(values);
      expect(readouts.length, `${lab.id}: ingen tall for ${JSON.stringify(values)}`).toBeGreaterThan(0);

      const texts = [
        lab.modelFor(values),
        ...readouts.flatMap((readout) => [readout.label, readout.value]),
      ];

      for (const text of texts) {
        expect(text, `${lab.id}: «${text}» for ${JSON.stringify(values)}`).not.toMatch(
          /NaN|Infinity|undefined/
        );
        expect(
          countMathDelimiters(text) % 2,
          `${lab.id}: ubalanserte dollartegn i «${text}»`
        ).toBe(0);
      }
    });

    expect(checked).toBeGreaterThan(20);
  });

  it('skriver all fast tekst med balanserte dollartegn', () => {
    const texts = [
      lab.title,
      lab.bigQuestion,
      lab.description,
      lab.insight,
      ...lab.claims.flatMap((claim) => [claim.text, claim.explanation]),
      ...lab.missions.flatMap((mission) => [mission.prompt, mission.hint, mission.successMessage]),
    ];

    for (const text of texts) {
      expect(countMathDelimiters(text) % 2, `${lab.id}: ubalanserte dollartegn i «${text}»`).toBe(0);
      expect(text).not.toMatch(/NaN|Infinity|undefined/);
    }
  });
});
