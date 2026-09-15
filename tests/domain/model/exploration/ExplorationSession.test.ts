import { describe, it, expect } from 'vitest';
import { ExplorationSession } from '../../../../src/domain/model/exploration/ExplorationSession.js';
import { ExplorationLab } from '../../../../src/domain/model/exploration/ExplorationLab.js';
import { ExplorationCatalog } from '../../../../src/domain/curriculum/exploration/ExplorationCatalog.js';
import { ExplorationLabDefinition } from '../../../../src/domain/model/exploration/ExplorationTypes.js';
import { Lk20Topic1T } from '../../../../src/domain/model/task/value-objects/Lk20Category.js';
import { ExplorationMissionCompletedDomainEvent } from '../../../../src/domain/events/ExplorationEvents.js';

/** Liten testutforskning med forutsigbare oppdrag. */
const labDefinition = (
  overrides: Partial<ExplorationLabDefinition> = {}
): ExplorationLabDefinition => ({
  id: 'E-TEST-01',
  topic: Lk20Topic1T.FUNKSJONER,
  goalId: 'FUN-01',
  skillLabel: 'Tabeller og vekst',
  title: 'Testutforskning',
  bigQuestion: 'Hva skjer når du drar i a?',
  description: 'En testmodell med to parametere.',
  parameters: [
    { id: 'a', label: 'a', meaning: 'Stigningstallet i modellen.', min: -4, max: 4, step: 1, initial: 1 },
    { id: 'b', label: 'b', meaning: 'Konstantleddet i modellen.', min: -4, max: 4, step: 1, initial: 0 },
  ],
  modelLatex: ({ a, b }) => `$f(x) = ${a}x + ${b}$`,
  buildVisual: ({ a, b }) => ({
    kind: 'graph',
    curves: [{ kind: 'polynomial', coefficients: [b, a], tone: 'primary', label: 'f' }],
    xRange: [-5, 5],
    caption: 'Testgraf.',
  }),
  derive: ({ a, b }) => [{ id: 'sum', label: 'Sum', value: `$${a + b}$`, tone: 'primary' }],
  claims: [
    { id: 'sant', text: 'Dette er en sann påstand om modellen.', isTrue: true, explanation: 'Fordi det er slik modellen er bygget opp.' },
    { id: 'usant', text: 'Dette er en usann påstand om modellen.', isTrue: false, explanation: 'Fordi modellen oppfører seg motsatt av dette.' },
    { id: 'sant-to', text: 'Dette er også en sann påstand om modellen.', isTrue: true, explanation: 'Fordi den følger av definisjonen av modellen.' },
  ],
  missions: [
    {
      id: 'negativ-a',
      prompt: 'Gjør stigningstallet negativt.',
      hint: 'Dra a under null.',
      successMessage: 'Nå synker grafen.',
      isAccomplished: ({ a }) => a < 0,
    },
    {
      id: 'b-er-tre',
      prompt: 'Sett konstantleddet til 3.',
      hint: 'Dra b helt til 3.',
      successMessage: 'Nå krysser grafen y-aksen i 3.',
      isAccomplished: ({ b }) => b === 3,
    },
  ],
  insight: 'Stigningstall og konstantledd virker uavhengig av hverandre.',
  ...overrides,
});

const buildLab = (overrides: Partial<ExplorationLabDefinition> = {}): ExplorationLab => {
  const result = ExplorationLab.fromDefinition(labDefinition(overrides));
  if (result.isFailure) {
    throw new Error(`Testutforskningen er ugyldig: ${result.error.message}`);
  }
  return result.value;
};

const unwrap = <T,>(result: { isSuccess: boolean; value?: T; error?: { message: string } }): T => {
  if (!result.isSuccess) {
    throw new Error(`Forventet suksess, men fikk: ${result.error?.message}`);
  }
  return result.value as T;
};

describe('ExplorationLab – validering', () => {
  it('bygger en gyldig utforskning', () => {
    const lab = buildLab();

    expect(lab.parameters).toHaveLength(2);
    expect(lab.missions).toHaveLength(2);
    expect(lab.initialValues).toEqual({ a: 1, b: 0 });
    expect(lab.parameter('a')?.label).toBe('a');
    expect(lab.parameter('finnes-ikke')).toBeUndefined();
    expect(lab.mission('b-er-tre')?.prompt).toContain('konstantleddet');
    expect(lab.claim('sant')?.isTrue).toBe(true);
  });

  it('krever parametere, påstander og oppdrag', () => {
    expect(ExplorationLab.fromDefinition(labDefinition({ parameters: [] })).isFailure).toBe(true);
    expect(ExplorationLab.fromDefinition(labDefinition({ claims: [] })).isFailure).toBe(true);
    expect(
      ExplorationLab.fromDefinition(labDefinition({ missions: [labDefinition().missions[0]] })).isFailure
    ).toBe(true);
  });

  it('krever at påstandene inneholder både sant og usant', () => {
    const onlyTrue = labDefinition().claims.map((claim) => ({ ...claim, isTrue: true }));

    expect(ExplorationLab.fromDefinition(labDefinition({ claims: onlyTrue })).isFailure).toBe(true);
  });

  it('avviser ugyldige parametere', () => {
    const base = labDefinition().parameters[0];

    expect(
      ExplorationLab.fromDefinition(
        labDefinition({ parameters: [{ ...base, min: 5, max: 1 }, labDefinition().parameters[1]] })
      ).isFailure
    ).toBe(true);
    expect(
      ExplorationLab.fromDefinition(
        labDefinition({ parameters: [{ ...base, step: 0 }, labDefinition().parameters[1]] })
      ).isFailure
    ).toBe(true);
    expect(
      ExplorationLab.fromDefinition(
        labDefinition({ parameters: [{ ...base, initial: 99 }, labDefinition().parameters[1]] })
      ).isFailure
    ).toBe(true);
  });

  it('avviser duplikate parameter-id-er og ukjent animasjonsparameter', () => {
    const duplicated = [labDefinition().parameters[0], labDefinition().parameters[0]];

    expect(ExplorationLab.fromDefinition(labDefinition({ parameters: duplicated })).isFailure).toBe(true);
    expect(
      ExplorationLab.fromDefinition(labDefinition({ animatedParameterId: 'finnes-ikke' })).isFailure
    ).toBe(true);
  });

  it('avviser en utforskning der bildet ikke kan tegnes', () => {
    const result = ExplorationLab.fromDefinition(
      labDefinition({
        buildVisual: () => ({ kind: 'bars', bars: [], caption: 'tom' }),
      })
    );

    expect(result.isFailure).toBe(true);
    if (result.isFailure) {
      expect(result.error.code).toBe('INVALID_VISUAL');
    }
  });

  it('avviser en utforskning der bildet kaster', () => {
    const result = ExplorationLab.fromDefinition(
      labDefinition({
        buildVisual: () => {
          throw new Error('noe gikk galt');
        },
      })
    );

    expect(result.isFailure).toBe(true);
    if (result.isFailure) {
      expect(result.error.message).toContain('noe gikk galt');
    }
  });

  it('klemmer verdier inn på rutenettet', () => {
    const parameter = buildLab().parameter('a')!;

    expect(parameter.clamp(99)).toBe(4);
    expect(parameter.clamp(-99)).toBe(-4);
    expect(parameter.clamp(1.4)).toBe(1);
    expect(parameter.allValues).toEqual([-4, -3, -2, -1, 0, 1, 2, 3, 4]);
  });
});

describe('ExplorationSession – parametere og oppdrag', () => {
  it('starter på startverdiene, uten løste oppdrag', () => {
    const session = ExplorationSession.start(buildLab());

    expect(session.values).toEqual({ a: 1, b: 0 });
    expect(session.completedMissionIds).toEqual([]);
    expect(session.progress.completedMissions).toBe(0);
    expect(session.progress.isComplete).toBe(false);
    expect(session.feedback).toBeNull();
    expect(session.modelLatex).toBe('$f(x) = 1x + 0$');
    expect(session.readouts).toHaveLength(1);
    expect(session.visual.kind).toBe('graph');
  });

  it('gjenoppretter oppdrag eleven alt har løst', () => {
    const session = ExplorationSession.start(buildLab(), ['negativ-a', 'finnes-ikke']);

    expect(session.completedMissionIds).toEqual(['negativ-a']);
    expect(session.isMissionCompleted('negativ-a')).toBe(true);
    expect(session.progress.completedMissions).toBe(1);
  });

  it('endrer en parameter og klemmer verdien', () => {
    const session = unwrap(ExplorationSession.start(buildLab()).setParameter('a', 99));

    expect(session.values.a).toBe(4);
  });

  it('avviser ukjent parameter og verdier som ikke er tall', () => {
    const session = ExplorationSession.start(buildLab());

    expect(session.setParameter('finnes-ikke', 1).isFailure).toBe(true);
    expect(session.setParameter('a', Number.NaN).isFailure).toBe(true);
    expect(session.setValues({ finnes: 1 }).isFailure).toBe(true);
    expect(session.setValues({ a: Number.POSITIVE_INFINITY }).isFailure).toBe(true);
  });

  it('kan sette flere parametere samtidig', () => {
    const session = unwrap(ExplorationSession.start(buildLab()).setValues({ a: -2, b: 3 }));

    expect(session.values).toEqual({ a: -2, b: 3 });
    expect(session.completedMissionIds).toHaveLength(2);
  });

  it('løser et oppdrag automatisk når modellen oppfyller det', () => {
    const session = unwrap(ExplorationSession.start(buildLab()).setParameter('a', -2));

    expect(session.isMissionCompleted('negativ-a')).toBe(true);
    expect(session.isMissionCompleted('b-er-tre')).toBe(false);
    expect(session.feedback?.tone).toBe('mission');
    expect(session.feedback?.message).toContain('Nå synker grafen');
  });

  it('publiserer en hendelse per løst oppdrag', () => {
    const session = unwrap(ExplorationSession.start(buildLab()).setParameter('a', -1));
    const events = session.domainEvents;

    expect(events).toHaveLength(1);
    const event = events[0] as ExplorationMissionCompletedDomainEvent;
    expect(event.eventName).toBe('ExplorationMissionCompletedDomainEvent');
    expect(event.missionId).toBe('negativ-a');
    expect(event.completedCount).toBe(1);
    expect(event.totalCount).toBe(2);
  });

  it('beholder et løst oppdrag selv om eleven drar videre', () => {
    let session = unwrap(ExplorationSession.start(buildLab()).setParameter('a', -2));
    expect(session.isMissionCompleted('negativ-a')).toBe(true);

    session = unwrap(session.setParameter('a', 3));

    expect(session.values.a).toBe(3);
    expect(session.isMissionCompleted('negativ-a')).toBe(true);
    expect(session.missionsSatisfiedNow).not.toContain('negativ-a');
  });

  it('publiserer ikke samme oppdrag to ganger', () => {
    let session = unwrap(ExplorationSession.start(buildLab()).setParameter('a', -2));
    session.clearDomainEvents();

    session = unwrap(session.setParameter('a', -3));

    expect(session.domainEvents).toHaveLength(0);
  });

  it('lar den opprinnelige økta stå uendret', () => {
    const session = ExplorationSession.start(buildLab());
    const next = unwrap(session.setParameter('a', -2));

    expect(session.values.a).toBe(1);
    expect(session.completedMissionIds).toEqual([]);
    expect(next.values.a).toBe(-2);
  });

  it('nullstiller parameterne, men beholder det eleven har oppdaget', () => {
    const session = unwrap(ExplorationSession.start(buildLab()).setParameter('a', -2)).resetParameters();

    expect(session.values).toEqual({ a: 1, b: 0 });
    expect(session.isMissionCompleted('negativ-a')).toBe(true);
    expect(session.feedback?.title).toBe('Nullstilt');
  });

  it('viser hintet til et oppdrag', () => {
    const session = unwrap(ExplorationSession.start(buildLab()).revealHint('b-er-tre'));

    expect(session.isHintRevealed('b-er-tre')).toBe(true);
    expect(session.feedback?.message).toBe('Dra b helt til 3.');
    expect(ExplorationSession.start(buildLab()).revealHint('finnes-ikke').isFailure).toBe(true);
  });
});

describe('ExplorationSession – påstander og framgang', () => {
  it('godtar en riktig vurdering', () => {
    const session = unwrap(ExplorationSession.start(buildLab()).answerClaim('sant', true));

    expect(session.verdictFor('sant')?.isCorrect).toBe(true);
    expect(session.feedback?.tone).toBe('correct');
    expect(session.progress.correctClaims).toBe(1);
  });

  it('forklarer en feil vurdering, og lar eleven prøve igjen', () => {
    let session = unwrap(ExplorationSession.start(buildLab()).answerClaim('usant', true));

    expect(session.verdictFor('usant')?.isCorrect).toBe(false);
    expect(session.feedback?.tone).toBe('incorrect');
    expect(session.feedback?.message).toContain('motsatt');

    session = unwrap(session.answerClaim('usant', false));

    expect(session.verdictFor('usant')?.isCorrect).toBe(true);
    expect(session.progress.answeredClaims).toBe(1);
  });

  it('avviser ukjent påstand', () => {
    expect(ExplorationSession.start(buildLab()).answerClaim('finnes-ikke', true).isFailure).toBe(true);
  });

  it('regner framgang av både oppdrag og påstander', () => {
    let session = ExplorationSession.start(buildLab());
    expect(session.progress.percentage).toBe(0);

    session = unwrap(session.setParameter('a', -1));
    session = unwrap(session.answerClaim('sant', true));

    // Ett av to oppdrag og én av tre påstander = 2 av 5.
    expect(session.progress.percentage).toBe(40);
    expect(session.progress.isComplete).toBe(false);
  });

  it('publiserer at utforskningen er fullført når alt er gjort', () => {
    let session = ExplorationSession.start(buildLab());
    session = unwrap(session.answerClaim('sant', true));
    session = unwrap(session.answerClaim('usant', false));
    session = unwrap(session.answerClaim('sant-to', true));
    session = unwrap(session.setParameter('b', 3));
    session.clearDomainEvents();

    session = unwrap(session.setParameter('a', -1));

    expect(session.progress.isComplete).toBe(true);
    expect(
      session.domainEvents.some((event) => event.eventName === 'ExplorationLabCompletedDomainEvent')
    ).toBe(true);
  });

  it('publiserer fullført også når den siste handlingen er en påstand', () => {
    let session = ExplorationSession.start(buildLab());
    session = unwrap(session.setValues({ a: -1, b: 3 }));
    session = unwrap(session.answerClaim('sant', true));
    session = unwrap(session.answerClaim('usant', false));
    session.clearDomainEvents();

    session = unwrap(session.answerClaim('sant-to', true));

    expect(session.progress.isComplete).toBe(true);
    expect(
      session.domainEvents.some((event) => event.eventName === 'ExplorationLabCompletedDomainEvent')
    ).toBe(true);
  });

  it('tåler et oppdrag som kaster, uten å stoppe utforskningen', () => {
    const lab = buildLab({
      missions: [
        {
          id: 'kaster',
          prompt: 'Et oppdrag som kaster en feil.',
          hint: 'Dette hintet er bare for testen.',
          successMessage: 'Dette skal aldri vises.',
          isAccomplished: () => {
            throw new Error('uventet');
          },
        },
        labDefinition().missions[0],
      ],
    });

    const session = unwrap(ExplorationSession.start(lab).setParameter('a', -1));

    expect(session.isMissionCompleted('kaster')).toBe(false);
    expect(session.isMissionCompleted('negativ-a')).toBe(true);
  });
});

describe('ExplorationSession – med virkelig innhold', () => {
  it('løser oppdraget «fjern nullpunktene» i parabelutforskningen', () => {
    const lab = ExplorationCatalog.byId('E-FUN-01')!;
    let session = ExplorationSession.start(lab);

    expect(session.isMissionCompleted('no-roots')).toBe(false);

    // a = 1, b = 0, c = 1 gir D = -4.
    session = unwrap(session.setValues({ a: 1, b: 0, c: 1 }));

    expect(session.isMissionCompleted('no-roots')).toBe(true);
    expect(session.readouts.find((readout) => readout.id === 'roots')?.value).toBe('0');
  });

  it('gjør parabelen lineær når a settes til null', () => {
    const lab = ExplorationCatalog.byId('E-FUN-01')!;
    const session = unwrap(ExplorationSession.start(lab).setParameter('a', 0));

    expect(session.isMissionCompleted('make-linear')).toBe(true);
    expect(session.modelLatex).toContain('lineær');
  });
});
