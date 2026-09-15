import { describe, it, expect } from 'vitest';
import { GuidedSession } from '../../../../src/domain/model/guided/GuidedSession.js';
import { GuidedStepCompletedDomainEvent } from '../../../../src/domain/events/GuidedStepCompletedDomainEvent.js';
import { GuidedLessonCompletedDomainEvent } from '../../../../src/domain/events/GuidedLessonCompletedDomainEvent.js';
import { MisconceptionType } from '../../../../src/domain/model/task/Misconception.js';
import { Lk20Topic1T } from '../../../../src/domain/model/task/value-objects/Lk20Category.js';
import { buildErrorHunt, buildWalkthrough } from './fixtures.js';

/** Hjelper som pakker ut en vellykket overgang, eller feiler testen tydelig. */
const advance = (
  result: ReturnType<GuidedSession['chooseOption']>,
  label = 'overgang'
): GuidedSession => {
  if (result.isFailure) {
    throw new Error(`Forventet vellykket ${label}, men fikk: ${result.error.message}`);
  }
  return result.value;
};

const startPractice = (withHunt = true): GuidedSession => {
  const session = GuidedSession.start(
    buildWalkthrough(),
    withHunt ? buildErrorHunt() : null,
    'test-session'
  );
  return advance(session.beginPractice(), 'beginPractice');
};

describe('GuidedSession – oppstart og «Se det»', () => {
  it('starter i «Se det» uten noe avslørt', () => {
    const session = GuidedSession.start(buildWalkthrough(), buildErrorHunt(), 'test-session');

    expect(session.id).toBe('test-session');
    expect(session.stage).toBe('watch');
    expect(session.revealedWatchSteps).toBe(0);
    expect(session.topic).toBe(Lk20Topic1T.LIGNINGER_OG_ULIKHETER);
    expect(session.solvedStepCount).toBe(0);
    expect(session.progressPercentage).toBe(0);
    expect(session.isComplete).toBe(false);
    expect(session.feedback).toBeNull();
  });

  it('blar fram ett steg om gangen og stopper ved siste', () => {
    let session = GuidedSession.start(buildWalkthrough(), null);

    session = advance(session.revealNextWatchStep(), 'revealNextWatchStep');
    expect(session.revealedWatchSteps).toBe(1);

    session = advance(session.revealNextWatchStep(), 'revealNextWatchStep');
    expect(session.revealedWatchSteps).toBe(2);
    expect(session.feedback?.title).toBe('Hele utregningen er vist');

    expect(session.revealNextWatchStep().isFailure).toBe(true);
  });

  it('kan vise hele utregningen på én gang', () => {
    const session = advance(
      GuidedSession.start(buildWalkthrough(), null).revealAllWatchSteps(),
      'revealAllWatchSteps'
    );

    expect(session.revealedWatchSteps).toBe(2);
  });

  it('lar eleven hoppe rett til øvingen uten å se hele gjennomgangen', () => {
    const session = startPractice();

    expect(session.stage).toBe('practice');
    expect(session.currentStepNumber).toBe(1);
  });

  it('nekter å starte øvingen to ganger og å bla i utregningen etterpå', () => {
    const session = startPractice();

    expect(session.beginPractice().isFailure).toBe(true);
    expect(session.revealNextWatchStep().isFailure).toBe(true);
    expect(session.revealAllWatchSteps().isFailure).toBe(true);
  });

  it('holder den opprinnelige sesjonen uendret etter en overgang', () => {
    const session = GuidedSession.start(buildWalkthrough(), null);
    const next = advance(session.revealNextWatchStep(), 'revealNextWatchStep');

    expect(session.revealedWatchSteps).toBe(0);
    expect(next.revealedWatchSteps).toBe(1);
  });
});

describe('GuidedSession – «Gjør det»', () => {
  it('gir full score for riktig valg på første forsøk og flytter til neste steg', () => {
    const session = advance(startPractice().chooseOption('riktig'));

    expect(session.recordFor(1)?.solved).toBe(true);
    expect(session.recordFor(1)?.score).toBe(1);
    expect(session.currentStepNumber).toBe(2);
    expect(session.progressPercentage).toBe(50);
    expect(session.feedback?.tone).toBe('correct');
    expect(session.feedback?.title).toBe('Riktig, første forsøk');
  });

  it('forklarer galt valg, registrerer misoppfatningen og holder steget åpent', () => {
    const session = advance(startPractice().chooseOption('galt'));
    const record = session.recordFor(1);

    expect(record?.solved).toBe(false);
    expect(record?.attempts).toBe(1);
    expect(record?.wrongOptionIds).toEqual(['galt']);
    expect(record?.misconceptionsHit).toEqual([MisconceptionType.SIGN_ERROR]);
    expect(session.currentStepNumber).toBe(1);
    expect(session.feedback?.tone).toBe('incorrect');
    expect(session.feedback?.misconceptionType).toBe(MisconceptionType.SIGN_ERROR);
  });

  it('legger tipset fra misoppfatningsregisteret på tilbakemeldingen', () => {
    const session = advance(startPractice().chooseOption('galt'));

    expect(session.feedback?.message).toContain('Leddet skiftet ikke fortegn.');
    expect(session.feedback?.message).toContain('Pass ekstra på fortegnsregler');
  });

  it('teller ikke samme bomvalg to ganger i wrongOptionIds', () => {
    let session = advance(startPractice().chooseOption('galt'));
    session = advance(session.chooseOption('galt'));

    expect(session.recordFor(1)?.attempts).toBe(2);
    expect(session.recordFor(1)?.wrongOptionIds).toEqual(['galt']);
    expect(session.recordFor(1)?.misconceptionsHit).toEqual([MisconceptionType.SIGN_ERROR]);
  });

  it('gir redusert score når riktig svar kommer på andre forsøk', () => {
    let session = advance(startPractice().chooseOption('galt'));
    session = advance(session.chooseOption('riktig'));

    expect(session.recordFor(1)?.score).toBe(0.6);
    expect(session.feedback?.title).toBe('Riktig');
  });

  it('peker på hintet så lenge det ikke er brukt, og tilbyr til slutt å vise steget', () => {
    let session = advance(startPractice().chooseOption('galt'));
    expect(session.feedback?.advice?.tone).toBe('hint');

    session = advance(session.chooseOption('galt'));
    expect(session.feedback?.advice?.tone).toBe('hint');

    session = advance(session.chooseOption('galt'));
    expect(session.feedback?.advice?.tone).toBe('reveal');
  });

  it('dytter eleven videre i stedet for å gjenta hintet når hintet alt er brukt', () => {
    let session = advance(startPractice().useHint(), 'useHint');
    session = advance(session.chooseOption('galt'));

    expect(session.feedback?.advice?.tone).toBe('nudge');
  });

  it('demper scoren når hintet er brukt', () => {
    let session = advance(startPractice().useHint(), 'useHint');
    expect(session.feedback?.tone).toBe('hint');
    expect(session.feedback?.message).toBe('Hva må bort fra venstre side?');

    session = advance(session.chooseOption('riktig'));
    expect(session.recordFor(1)?.hintUsed).toBe(true);
    expect(session.recordFor(1)?.score).toBe(0.8);
  });

  it('gir null poeng for et avslørt steg, men flytter løpet videre', () => {
    const session = advance(startPractice().revealCurrentStep(), 'revealCurrentStep');

    expect(session.recordFor(1)?.revealed).toBe(true);
    expect(session.recordFor(1)?.solved).toBe(true);
    expect(session.recordFor(1)?.score).toBe(0);
    expect(session.currentStepNumber).toBe(2);
    expect(session.feedback?.tone).toBe('revealed');
  });

  it('avviser ukjent alternativ', () => {
    const result = startPractice().chooseOption('finnes-ikke');

    expect(result.isFailure).toBe(true);
    if (result.isFailure) {
      expect(result.error.code).toBe('UNKNOWN_OPTION');
    }
  });

  it('låser stegvalg, hint og avsløring når alle steg er gjort', () => {
    let session = advance(startPractice().chooseOption('riktig'));
    session = advance(session.chooseOption('riktig'));

    // Alle steg er løst, så øvingen er over og handlingene er ikke lenger lovlige.
    expect(session.stage).not.toBe('practice');
    expect(session.chooseOption('riktig').isFailure).toBe(true);
    expect(session.useHint().isFailure).toBe(true);
    expect(session.revealCurrentStep().isFailure).toBe(true);
  });

  it('publiserer én steghendelse per fullført steg', () => {
    const session = advance(startPractice().chooseOption('riktig'));
    const events = session.domainEvents;

    expect(events).toHaveLength(1);
    const event = events[0] as GuidedStepCompletedDomainEvent;
    expect(event.eventName).toBe('GuidedStepCompletedDomainEvent');
    expect(event.stepNumber).toBe(1);
    expect(event.attempts).toBe(1);
    expect(event.revealed).toBe(false);
    expect(event.score).toBe(1);
    expect(event.wasFirstTry).toBe(true);
  });

  it('markerer et avslørt steg som ikke løst på første forsøk i hendelsen', () => {
    const session = advance(startPractice().revealCurrentStep(), 'revealCurrentStep');
    const event = session.domainEvents[0] as GuidedStepCompletedDomainEvent;

    expect(event.revealed).toBe(true);
    expect(event.wasFirstTry).toBe(false);
  });
});

describe('GuidedSession – «Finn feilen»', () => {
  const reachHunt = (): GuidedSession => {
    let session = startPractice();
    session = advance(session.chooseOption('riktig'));
    session = advance(session.chooseOption('riktig'));
    return session;
  };

  it('går til feiljakten etter siste steg når økta har en', () => {
    const session = reachHunt();

    expect(session.stage).toBe('hunt');
    expect(session.hunt.phase).toBe('find');
    expect(session.solvedStepCount).toBe(2);
    expect(session.progressPercentage).toBe(100);
  });

  it('går rett til oppsummering når økta ikke har feiljakt', () => {
    let session = startPractice(false);
    session = advance(session.chooseOption('riktig'));
    session = advance(session.chooseOption('riktig'));

    expect(session.stage).toBe('summary');
    expect(session.isComplete).toBe(true);
    expect(
      session.domainEvents.some((event) => event.eventName === 'GuidedLessonCompletedDomainEvent')
    ).toBe(true);
  });

  it('forklarer at en riktig linje er i orden, uten å avsløre hvor feilen er', () => {
    const session = advance(reachHunt().selectHuntLine(3), 'selectHuntLine');

    expect(session.hunt.phase).toBe('find');
    expect(session.hunt.lineAttempts).toBe(1);
    expect(session.hunt.clearedLineNumbers).toEqual([3]);
    expect(session.feedback?.tone).toBe('incorrect');
    expect(session.feedback?.title).toBe('Linje 3 er i orden');
  });

  it('husker hvilke linjer som er avklart, uten duplikater', () => {
    let session = advance(reachHunt().selectHuntLine(3), 'selectHuntLine');
    session = advance(session.selectHuntLine(3), 'selectHuntLine');

    expect(session.hunt.clearedLineNumbers).toEqual([3]);
    expect(session.hunt.lineAttempts).toBe(2);
  });

  it('åpner reparasjonen når riktig linje er funnet', () => {
    const session = advance(reachHunt().selectHuntLine(2), 'selectHuntLine');

    expect(session.hunt.phase).toBe('repair');
    expect(session.hunt.selectedLineNumber).toBe(2);
    expect(session.feedback?.tone).toBe('correct');
    expect(session.feedback?.misconceptionType).toBe(MisconceptionType.SIGN_ERROR);
  });

  it('krever at linjen er funnet før reparasjonen velges', () => {
    const result = reachHunt().chooseRepair('snu');

    expect(result.isFailure).toBe(true);
    if (result.isFailure) {
      expect(result.error.code).toBe('ILLEGAL_TRANSITION');
    }
  });

  it('avviser ukjent linje og ukjent reparasjon', () => {
    const session = reachHunt();
    expect(session.selectHuntLine(99).isFailure).toBe(true);

    const found = advance(session.selectHuntLine(2), 'selectHuntLine');
    expect(found.chooseRepair('finnes-ikke').isFailure).toBe(true);
  });

  it('avslutter økta når feilen er rettet', () => {
    let session = advance(reachHunt().selectHuntLine(2), 'selectHuntLine');
    session = advance(session.chooseRepair('snu'), 'chooseRepair');

    expect(session.stage).toBe('summary');
    expect(session.hunt.solved).toBe(true);
    expect(session.hunt.phase).toBe('done');
    expect(session.summary.errorHuntSolved).toBe(true);
  });

  it('lar eleven prøve reparasjonen igjen etter et galt valg', () => {
    let session = advance(reachHunt().selectHuntLine(2), 'selectHuntLine');
    session = advance(session.chooseRepair('behold'), 'chooseRepair');

    expect(session.stage).toBe('hunt');
    expect(session.hunt.solved).toBe(false);
    expect(session.hunt.repairAttempts).toBe(1);
    expect(session.hunt.wrongRepairIds).toEqual(['behold']);
    expect(session.feedback?.title).toBe('Det retter ikke feilen');

    session = advance(session.chooseRepair('snu'), 'chooseRepair');
    expect(session.hunt.solved).toBe(true);
    expect(session.misconceptionsHit).toContain(MisconceptionType.SIGN_ERROR);
  });

  it('kan hoppe over feiljakten og avslutte økta', () => {
    const session = advance(reachHunt().skipHunt(), 'skipHunt');

    expect(session.stage).toBe('summary');
    expect(session.hunt.skipped).toBe(true);
    expect(session.summary.errorHuntSolved).toBe(false);
  });

  it('nekter feiljakt-handlinger utenfor feiljakten', () => {
    const session = startPractice();

    expect(session.selectHuntLine(2).isFailure).toBe(true);
    expect(session.chooseRepair('snu').isFailure).toBe(true);
    expect(session.skipHunt().isFailure).toBe(true);
  });

  it('nekter å velge linje på nytt etter at feilen er funnet', () => {
    const session = advance(reachHunt().selectHuntLine(2), 'selectHuntLine');

    expect(session.selectHuntLine(3).isFailure).toBe(true);
  });
});

describe('GuidedSession – oppsummering og repetisjon', () => {
  const completeFlawless = (): GuidedSession => {
    let session = startPractice();
    session = advance(session.chooseOption('riktig'));
    session = advance(session.chooseOption('riktig'));
    session = advance(session.selectHuntLine(2), 'selectHuntLine');
    return advance(session.chooseRepair('snu'), 'chooseRepair');
  };

  it('gir mesternivå for en feilfri gjennomføring', () => {
    const summary = completeFlawless().summary;

    expect(summary.averageScore).toBe(1);
    expect(summary.experiencePoints).toBe(200);
    expect(summary.level).toBe('mester');
    expect(summary.firstTrySteps).toBe(2);
    expect(summary.revealedSteps).toBe(0);
    expect(summary.hintedSteps).toBe(0);
    expect(summary.misconceptionsHit).toEqual([]);
    expect(summary.closingMessage).toContain('første forsøk');
  });

  it('gir lavere nivå og en annen melding når steg måtte vises', () => {
    let session = startPractice(false);
    session = advance(session.revealCurrentStep(), 'revealCurrentStep');
    session = advance(session.chooseOption('riktig'));

    const summary = session.summary;
    expect(summary.revealedSteps).toBe(1);
    expect(summary.averageScore).toBe(0.5);
    expect(summary.level).toBe('god');
    expect(summary.solvedSteps).toBe(2);
    expect(summary.closingMessage).toContain('fikk se stegene');
  });

  it('publiserer én øktfullført-hendelse med oppsummeringen', () => {
    const session = completeFlawless();
    const lessonEvents = session.domainEvents.filter(
      (event) => event.eventName === 'GuidedLessonCompletedDomainEvent'
    ) as GuidedLessonCompletedDomainEvent[];

    expect(lessonEvents).toHaveLength(1);
    expect(lessonEvents[0].averageScore).toBe(1);
    expect(lessonEvents[0].level).toBe('mester');
    expect(lessonEvents[0].errorHuntSolved).toBe(true);
    expect(lessonEvents[0].skillLabel).toBe('Lineære ligninger');
    expect(lessonEvents[0].goalId).toBe('LIG-01');
    expect(lessonEvents[0].isFlawless).toBe(true);
  });

  it('markerer økta som ikke feilfri når et steg ble vist', () => {
    let session = startPractice(false);
    session = advance(session.revealCurrentStep(), 'revealCurrentStep');
    session = advance(session.chooseOption('riktig'));

    const lessonEvent = session.domainEvents.find(
      (event) => event.eventName === 'GuidedLessonCompletedDomainEvent'
    ) as GuidedLessonCompletedDomainEvent;

    expect(lessonEvent.isFlawless).toBe(false);
  });

  it('samler alle misoppfatninger eleven gikk i, på tvers av steg', () => {
    let session = startPractice();
    session = advance(session.chooseOption('galt'));
    session = advance(session.chooseOption('riktig'));
    session = advance(session.chooseOption('galt'));
    session = advance(session.chooseOption('riktig'));

    expect(session.misconceptionsHit).toEqual([MisconceptionType.SIGN_ERROR]);
    expect(session.stepRecords.map((record) => record.stepNumber)).toEqual([1, 2]);
  });

  it('nullstiller alt ved restart, men beholder økt-id og innhold', () => {
    const session = completeFlawless().restart();

    expect(session.id).toBe('test-session');
    expect(session.stage).toBe('watch');
    expect(session.revealedWatchSteps).toBe(0);
    expect(session.solvedStepCount).toBe(0);
    expect(session.summary.averageScore).toBe(0);
    expect(session.walkthrough.id).toBe('GW-TEST-01');
  });

  it('går rett til en ny øvingsrunde uten å vise gjennomgangen igjen', () => {
    const session = completeFlawless().retryPractice();

    expect(session.stage).toBe('practice');
    expect(session.currentStepNumber).toBe(1);
    expect(session.solvedStepCount).toBe(0);
    expect(session.hunt.solved).toBe(false);
    expect(session.feedback?.title).toBe('Ny runde');
  });

  it('gir tom oppsummering uten poeng før noe er gjort', () => {
    const session = GuidedSession.start(buildWalkthrough(), buildErrorHunt());

    expect(session.summary.averageScore).toBe(0);
    expect(session.summary.level).toBe('på-vei');
    expect(session.summary.experiencePoints).toBe(0);
    expect(session.currentStep?.stepNumber).toBe(1);
    expect(session.currentRecord?.attempts).toBe(0);
  });

  it('kan tømme domenehendelsene etter publisering', () => {
    const session = advance(startPractice().chooseOption('riktig'));

    expect(session.domainEvents).toHaveLength(1);
    session.clearDomainEvents();
    expect(session.domainEvents).toHaveLength(0);
  });
});
