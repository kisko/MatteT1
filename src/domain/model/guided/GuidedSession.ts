import { AggregateRoot } from '../../shared/AggregateRoot.js';
import { Result } from '../../shared/Result.js';
import { createGuidedError, GuidedError } from './errors/GuidedError.js';
import { GuidedWalkthrough } from './GuidedWalkthrough.js';
import { ErrorHunt } from './ErrorHunt.js';
import { GuidedStep } from './value-objects/GuidedStep.js';
import { MisconceptionType } from '../task/Misconception.js';
import { Lk20Topic1T } from '../task/value-objects/Lk20Category.js';
import { GuidedAdvice, GuidedSolverService, MasteryLevel } from '../../services/GuidedSolverService.js';
import { GuidedStepCompletedDomainEvent } from '../../events/GuidedStepCompletedDomainEvent.js';
import { GuidedLessonCompletedDomainEvent } from '../../events/GuidedLessonCompletedDomainEvent.js';

/**
 * Læringsløpet i Mesterlab:
 * - watch:    «Se det» – eleven blar gjennom en ferdig utregning med visualisering
 * - practice: «Gjør det» – eleven velger neste steg selv, med avtagende støtte
 * - hunt:     «Finn feilen» – eleven peker på den typiske feilen og reparerer den
 * - summary:  «Kontroll» – poeng, nivå og hva som sitter
 */
export type GuidedStage = 'watch' | 'practice' | 'hunt' | 'summary';

export type HuntPhase = 'find' | 'repair' | 'done';

export type FeedbackTone = 'correct' | 'incorrect' | 'revealed' | 'hint' | 'info';

export interface GuidedFeedback {
  readonly tone: FeedbackTone;
  readonly title: string;
  readonly message: string;
  readonly misconceptionType?: MisconceptionType;
  readonly advice?: GuidedAdvice;
}

export interface StepRecord {
  readonly stepNumber: number;
  readonly attempts: number;
  readonly hintUsed: boolean;
  readonly revealed: boolean;
  readonly solved: boolean;
  readonly score: number;
  readonly wrongOptionIds: ReadonlyArray<string>;
  readonly misconceptionsHit: ReadonlyArray<MisconceptionType>;
}

export interface HuntState {
  readonly phase: HuntPhase;
  readonly lineAttempts: number;
  readonly selectedLineNumber?: number;
  readonly repairAttempts: number;
  readonly solved: boolean;
  readonly skipped: boolean;
  /** Linjer eleven har pekt på som viste seg å være i orden. */
  readonly clearedLineNumbers: ReadonlyArray<number>;
  /** Reparasjoner eleven har prøvd og bommet på. */
  readonly wrongRepairIds: ReadonlyArray<string>;
}

export interface GuidedSessionSummary {
  readonly averageScore: number;
  readonly experiencePoints: number;
  readonly level: MasteryLevel;
  readonly solvedSteps: number;
  readonly totalSteps: number;
  readonly revealedSteps: number;
  readonly firstTrySteps: number;
  readonly hintedSteps: number;
  readonly errorHuntSolved: boolean;
  readonly misconceptionsHit: ReadonlyArray<MisconceptionType>;
  readonly closingMessage: string;
}

interface GuidedSessionState {
  readonly id: string;
  readonly walkthrough: GuidedWalkthrough;
  readonly errorHunt: ErrorHunt | null;
  readonly stage: GuidedStage;
  readonly revealedWatchSteps: number;
  readonly currentStepNumber: number;
  readonly records: ReadonlyMap<number, StepRecord>;
  readonly hunt: HuntState;
  readonly feedback: GuidedFeedback | null;
}

const emptyHuntState: HuntState = {
  phase: 'find',
  lineAttempts: 0,
  repairAttempts: 0,
  solved: false,
  skipped: false,
  clearedLineNumbers: [],
  wrongRepairIds: [],
};

const createRecords = (walkthrough: GuidedWalkthrough): ReadonlyMap<number, StepRecord> => {
  const records = new Map<number, StepRecord>();
  for (const step of walkthrough.steps) {
    records.set(step.stepNumber, {
      stepNumber: step.stepNumber,
      attempts: 0,
      hintUsed: false,
      revealed: false,
      solved: false,
      score: 0,
      wrongOptionIds: [],
      misconceptionsHit: [],
    });
  }
  return records;
};

/**
 * Aggregatrot for én veiledet økt.
 *
 * Sesjonen er uforanderlig: hver handling returnerer en ny sesjon med de
 * domenehendelsene handlingen utløste. Det gjør tilstanden trygg å bruke rett
 * i React-state, og gjør hver overgang enkel å teste isolert.
 */
export class GuidedSession extends AggregateRoot<string> {
  private constructor(private readonly state: GuidedSessionState) {
    super();
  }

  public static start(
    walkthrough: GuidedWalkthrough,
    errorHunt: ErrorHunt | null = null,
    sessionId?: string
  ): GuidedSession {
    return new GuidedSession({
      id: sessionId ?? crypto.randomUUID(),
      walkthrough,
      errorHunt,
      stage: 'watch',
      revealedWatchSteps: 0,
      currentStepNumber: 1,
      records: createRecords(walkthrough),
      hunt: emptyHuntState,
      feedback: null,
    });
  }

  private clone(patch: Partial<GuidedSessionState>): GuidedSession {
    return new GuidedSession({ ...this.state, ...patch });
  }

  private illegal(message: string): Result<GuidedSession, GuidedError> {
    return Result.fail(
      createGuidedError('ILLEGAL_TRANSITION', message, { stage: this.state.stage })
    );
  }

  // ---------------------------------------------------------------- lesedata

  public get id(): string {
    return this.state.id;
  }

  public get walkthrough(): GuidedWalkthrough {
    return this.state.walkthrough;
  }

  public get errorHunt(): ErrorHunt | null {
    return this.state.errorHunt;
  }

  public get topic(): Lk20Topic1T {
    return this.state.walkthrough.topic;
  }

  public get stage(): GuidedStage {
    return this.state.stage;
  }

  public get revealedWatchSteps(): number {
    return this.state.revealedWatchSteps;
  }

  public get currentStepNumber(): number {
    return this.state.currentStepNumber;
  }

  public get currentStep(): GuidedStep | undefined {
    return this.state.walkthrough.stepAt(this.state.currentStepNumber);
  }

  public get hunt(): HuntState {
    return this.state.hunt;
  }

  public get feedback(): GuidedFeedback | null {
    return this.state.feedback;
  }

  public get stepRecords(): ReadonlyArray<StepRecord> {
    return Object.freeze([...this.state.records.values()].sort((a, b) => a.stepNumber - b.stepNumber));
  }

  public recordFor(stepNumber: number): StepRecord | undefined {
    return this.state.records.get(stepNumber);
  }

  public get currentRecord(): StepRecord | undefined {
    return this.state.records.get(this.state.currentStepNumber);
  }

  public get solvedStepCount(): number {
    return this.stepRecords.filter((record) => record.solved).length;
  }

  public get progressPercentage(): number {
    return GuidedSolverService.progressPercentage(
      this.solvedStepCount,
      this.state.walkthrough.stepCount
    );
  }

  public get isComplete(): boolean {
    return this.state.stage === 'summary';
  }

  /** Alle misoppfatninger eleven faktisk gikk i, uten duplikater. */
  public get misconceptionsHit(): ReadonlyArray<MisconceptionType> {
    const hits = new Set<MisconceptionType>();
    for (const record of this.stepRecords) {
      for (const type of record.misconceptionsHit) {
        hits.add(type);
      }
    }
    if (this.state.hunt.repairAttempts > 1 && this.state.errorHunt) {
      hits.add(this.state.errorHunt.misconceptionType);
    }
    return Object.freeze([...hits]);
  }

  public get summary(): GuidedSessionSummary {
    const records = this.stepRecords;
    const scores = records.map((record) => record.score);
    const averageScore = GuidedSolverService.averageScore(scores);
    const level = GuidedSolverService.masteryLevel(averageScore);
    const revealedSteps = records.filter((record) => record.revealed).length;

    return {
      averageScore,
      experiencePoints: GuidedSolverService.experiencePoints(scores),
      level,
      solvedSteps: records.filter((record) => record.solved).length,
      totalSteps: records.length,
      revealedSteps,
      firstTrySteps: records.filter((record) => record.solved && !record.revealed && record.attempts === 1).length,
      hintedSteps: records.filter((record) => record.hintUsed).length,
      errorHuntSolved: this.state.hunt.solved,
      misconceptionsHit: this.misconceptionsHit,
      closingMessage: GuidedSolverService.closingMessage(level, revealedSteps),
    };
  }

  // ------------------------------------------------------------ «Se det»

  /**
   * Blar fram neste linje i den ferdige utregningen.
   */
  public revealNextWatchStep(): Result<GuidedSession, GuidedError> {
    if (this.state.stage !== 'watch') {
      return this.illegal('Den ferdige utregningen kan bare blas gjennom i «Se det».');
    }

    if (this.state.revealedWatchSteps >= this.state.walkthrough.stepCount) {
      return this.illegal('Hele utregningen er allerede vist.');
    }

    const revealedWatchSteps = this.state.revealedWatchSteps + 1;
    const isLast = revealedWatchSteps === this.state.walkthrough.stepCount;

    return Result.ok(
      this.clone({
        revealedWatchSteps,
        feedback: {
          tone: 'info',
          title: isLast ? 'Hele utregningen er vist' : `Steg ${revealedWatchSteps} vist`,
          message: isLast
            ? 'Nå gjør du den samme utregningen selv. Du velger ett steg om gangen.'
            : this.state.walkthrough.stepAt(revealedWatchSteps)?.rationale ?? '',
        },
      })
    );
  }

  /** Viser hele utregningen på én gang. */
  public revealAllWatchSteps(): Result<GuidedSession, GuidedError> {
    if (this.state.stage !== 'watch') {
      return this.illegal('Den ferdige utregningen kan bare blas gjennom i «Se det».');
    }

    return Result.ok(
      this.clone({
        revealedWatchSteps: this.state.walkthrough.stepCount,
        feedback: {
          tone: 'info',
          title: 'Hele utregningen er vist',
          message: 'Se etter rekkefølgen, ikke bare svaret. Den samme rekkefølgen bruker du nå selv.',
        },
      })
    );
  }

  /**
   * Går videre til «Gjør det». Tillatt når som helst – eleven skal aldri
   * tvinges gjennom noe hen allerede kan.
   */
  public beginPractice(): Result<GuidedSession, GuidedError> {
    if (this.state.stage !== 'watch') {
      return this.illegal('Øvingen er allerede startet.');
    }

    return Result.ok(
      this.clone({
        stage: 'practice',
        currentStepNumber: 1,
        feedback: {
          tone: 'info',
          title: 'Nå er det din tur',
          message: 'Velg det neste lovlige steget. Du kan hente hint, og du kan alltid få steget vist.',
        },
      })
    );
  }

  // ------------------------------------------------------------ «Gjør det»

  /**
   * Henter hintet for gjeldende steg. Koster litt poeng, men holder eleven i gang.
   */
  public useHint(): Result<GuidedSession, GuidedError> {
    if (this.state.stage !== 'practice') {
      return this.illegal('Hint er bare tilgjengelig mens du øver på stegene.');
    }

    const step = this.currentStep;
    const record = this.currentRecord;
    if (!step || !record) {
      return this.illegal('Fant ingen aktivt steg å hente hint for.');
    }

    if (record.solved) {
      return this.illegal('Steget er allerede løst.');
    }

    const records = new Map(this.state.records);
    records.set(record.stepNumber, { ...record, hintUsed: true });

    return Result.ok(
      this.clone({
        records,
        feedback: {
          tone: 'hint',
          title: `Hint til steg ${step.stepNumber}`,
          message: step.hint,
        },
      })
    );
  }

  /**
   * Eleven velger et alternativ. Riktig valg låser steget og flytter løpet videre;
   * galt valg forklarer feilen og lar eleven prøve igjen.
   */
  public chooseOption(optionId: string): Result<GuidedSession, GuidedError> {
    if (this.state.stage !== 'practice') {
      return this.illegal('Du kan bare velge steg mens du øver.');
    }

    const step = this.currentStep;
    const record = this.currentRecord;
    if (!step || !record) {
      return this.illegal('Fant ingen aktivt steg å svare på.');
    }

    if (record.solved) {
      return this.illegal('Steget er allerede løst. Gå videre til neste steg.');
    }

    const option = step.findOption(optionId);
    if (!option) {
      return Result.fail(
        createGuidedError('UNKNOWN_OPTION', `Alternativet '${optionId}' finnes ikke i steg ${step.stepNumber}.`)
      );
    }

    const attempts = record.attempts + 1;
    const records = new Map(this.state.records);

    if (!option.isCorrect) {
      const misconceptionsHit = option.misconceptionType
        ? [...new Set([...record.misconceptionsHit, option.misconceptionType])]
        : [...record.misconceptionsHit];

      records.set(record.stepNumber, {
        ...record,
        attempts,
        wrongOptionIds: [...new Set([...record.wrongOptionIds, option.id])],
        misconceptionsHit,
      });

      return Result.ok(
        this.clone({
          records,
          feedback: {
            tone: 'incorrect',
            title: 'Ikke dette steget',
            message: GuidedSolverService.feedbackForOption(option),
            misconceptionType: option.misconceptionType,
            advice: GuidedSolverService.adviceAfterWrongChoice(attempts, record.hintUsed),
          },
        })
      );
    }

    const score = GuidedSolverService.scoreForStep({
      attempts,
      hintUsed: record.hintUsed,
      revealed: false,
    });

    records.set(record.stepNumber, {
      ...record,
      attempts,
      solved: true,
      score,
    });

    return this.completeStep(step, records, {
      tone: 'correct',
      title: attempts === 1 ? 'Riktig, første forsøk' : 'Riktig',
      message: GuidedSolverService.feedbackForOption(option),
    });
  }

  /**
   * Viser steget. Gir 0 poeng på steget, men eleven kommer videre med
   * framgangsmåten intakt – bedre enn å stoppe helt.
   */
  public revealCurrentStep(): Result<GuidedSession, GuidedError> {
    if (this.state.stage !== 'practice') {
      return this.illegal('Steg kan bare vises mens du øver.');
    }

    const step = this.currentStep;
    const record = this.currentRecord;
    if (!step || !record) {
      return this.illegal('Fant ingen aktivt steg å vise.');
    }

    if (record.solved) {
      return this.illegal('Steget er allerede løst.');
    }

    const records = new Map(this.state.records);
    records.set(record.stepNumber, {
      ...record,
      revealed: true,
      solved: true,
      score: 0,
    });

    return this.completeStep(step, records, {
      tone: 'revealed',
      title: `Steg ${step.stepNumber} vist`,
      message: `${step.correctOption.feedback} ${step.rationale}`,
    });
  }

  /**
   * Felles avslutning av et steg: flytt løpet videre og publiser hendelsen.
   */
  private completeStep(
    step: GuidedStep,
    records: Map<number, StepRecord>,
    feedback: GuidedFeedback
  ): Result<GuidedSession, GuidedError> {
    const completedRecord = records.get(step.stepNumber)!;
    const isLastStep = step.stepNumber >= this.state.walkthrough.stepCount;
    const goesToHunt = isLastStep && this.state.errorHunt !== null;
    const goesToSummary = isLastStep && this.state.errorHunt === null;

    const next = this.clone({
      records,
      currentStepNumber: isLastStep ? step.stepNumber : step.stepNumber + 1,
      stage: goesToHunt ? 'hunt' : goesToSummary ? 'summary' : 'practice',
      feedback,
    });

    next.addDomainEvent(
      new GuidedStepCompletedDomainEvent(
        next.id,
        next.walkthrough.id,
        next.topic,
        completedRecord.stepNumber,
        completedRecord.attempts,
        completedRecord.hintUsed,
        completedRecord.revealed,
        completedRecord.score,
        completedRecord.misconceptionsHit
      )
    );

    if (goesToSummary) {
      next.addLessonCompletedEvent();
    }

    return Result.ok(next);
  }

  // --------------------------------------------------------- «Finn feilen»

  /**
   * Eleven peker på linjen der utregningen sporer av.
   */
  public selectHuntLine(lineNumber: number): Result<GuidedSession, GuidedError> {
    if (this.state.stage !== 'hunt') {
      return this.illegal('Feiljakten er ikke aktiv.');
    }

    const hunt = this.state.errorHunt;
    if (!hunt) {
      return this.illegal('Denne økta har ingen feiljakt.');
    }

    if (this.state.hunt.phase !== 'find') {
      return this.illegal('Feilen er allerede funnet.');
    }

    const line = hunt.lineAt(lineNumber);
    if (!line) {
      return Result.fail(createGuidedError('UNKNOWN_LINE', `Linje ${lineNumber} finnes ikke.`));
    }

    const lineAttempts = this.state.hunt.lineAttempts + 1;

    if (lineNumber !== hunt.flawedLineNumber) {
      return Result.ok(
        this.clone({
          hunt: {
            ...this.state.hunt,
            lineAttempts,
            clearedLineNumbers: [...new Set([...this.state.hunt.clearedLineNumbers, lineNumber])],
          },
          feedback: {
            tone: 'incorrect',
            title: `Linje ${lineNumber} er i orden`,
            message: `${line.note} Se etter linjen der noe endrer seg som ikke har lov til å endre seg.`,
          },
        })
      );
    }

    return Result.ok(
      this.clone({
        hunt: { ...this.state.hunt, lineAttempts, selectedLineNumber: lineNumber, phase: 'repair' },
        feedback: {
          tone: 'correct',
          title: `Der er feilen – linje ${lineNumber}`,
          message: `${line.note} ${hunt.explanation}`,
          misconceptionType: hunt.misconceptionType,
        },
      })
    );
  }

  /**
   * Eleven velger hvordan feilen skal rettes.
   */
  public chooseRepair(optionId: string): Result<GuidedSession, GuidedError> {
    if (this.state.stage !== 'hunt') {
      return this.illegal('Feiljakten er ikke aktiv.');
    }

    const hunt = this.state.errorHunt;
    if (!hunt) {
      return this.illegal('Denne økta har ingen feiljakt.');
    }

    if (this.state.hunt.phase !== 'repair') {
      return this.illegal('Finn linjen med feilen før du retter den.');
    }

    const option = hunt.findRepair(optionId);
    if (!option) {
      return Result.fail(
        createGuidedError('UNKNOWN_OPTION', `Reparasjonen '${optionId}' finnes ikke i denne feiljakten.`)
      );
    }

    const repairAttempts = this.state.hunt.repairAttempts + 1;

    if (!option.isCorrect) {
      return Result.ok(
        this.clone({
          hunt: {
            ...this.state.hunt,
            repairAttempts,
            wrongRepairIds: [...new Set([...this.state.hunt.wrongRepairIds, option.id])],
          },
          feedback: {
            tone: 'incorrect',
            title: 'Det retter ikke feilen',
            message: GuidedSolverService.feedbackForOption(option),
            misconceptionType: option.misconceptionType,
          },
        })
      );
    }

    const next = this.clone({
      stage: 'summary',
      hunt: { ...this.state.hunt, repairAttempts, phase: 'done', solved: true },
      feedback: {
        tone: 'correct',
        title: 'Feilen er rettet',
        message: `${option.feedback} ${hunt.takeaway}`,
      },
    });

    next.addLessonCompletedEvent();
    return Result.ok(next);
  }

  /**
   * Hopper over feiljakten. Økta avsluttes, men uten treff på feiljakten.
   */
  public skipHunt(): Result<GuidedSession, GuidedError> {
    if (this.state.stage !== 'hunt') {
      return this.illegal('Feiljakten er ikke aktiv.');
    }

    const next = this.clone({
      stage: 'summary',
      hunt: { ...this.state.hunt, phase: 'done', skipped: true },
      feedback: {
        tone: 'info',
        title: 'Feiljakten er hoppet over',
        message: 'Kom tilbake til feiljakten senere. Det er der de vanligste tabbene sitter.',
      },
    });

    next.addLessonCompletedEvent();
    return Result.ok(next);
  }

  // ------------------------------------------------------------- avslutning

  private addLessonCompletedEvent(): void {
    const summary = this.summary;
    this.addDomainEvent(
      new GuidedLessonCompletedDomainEvent(
        this.id,
        this.walkthrough.id,
        this.topic,
        this.walkthrough.goalId,
        this.walkthrough.skillLabel,
        summary.averageScore,
        summary.experiencePoints,
        summary.level,
        summary.revealedSteps,
        summary.errorHuntSolved,
        summary.misconceptionsHit
      )
    );
  }

  /**
   * Starter samme økt på nytt, med nullstilt poeng.
   * Repetisjon er selve poenget: framgangsmåten skal kunne gjentas.
   */
  public restart(): GuidedSession {
    return GuidedSession.start(this.state.walkthrough, this.state.errorHunt, this.state.id);
  }

  /**
   * Går rett til øvingen på nytt, uten å se gjennomgangen igjen.
   */
  public retryPractice(): GuidedSession {
    return new GuidedSession({
      ...this.state,
      stage: 'practice',
      currentStepNumber: 1,
      records: createRecords(this.state.walkthrough),
      hunt: emptyHuntState,
      feedback: {
        tone: 'info',
        title: 'Ny runde',
        message: 'Samme utregning, uten støtte. Nå viser du at framgangsmåten sitter.',
      },
    });
  }
}
