import { Result } from '../../shared/Result.js';
import { createGuidedError, GuidedError } from './errors/GuidedError.js';
import { ExerciseTemplate } from './ExerciseTemplate.js';
import { GuidedSession } from './GuidedSession.js';
import { GuidedWalkthrough } from './GuidedWalkthrough.js';
import { MisconceptionType } from '../task/Misconception.js';
import { Lk20Topic1T } from '../task/value-objects/Lk20Category.js';
import { GuidedSolverService, MasteryLevel } from '../../services/GuidedSolverService.js';

export interface PracticeResult {
  readonly exerciseNumber: number;
  readonly walkthroughId: string;
  readonly averageScore: number;
  readonly experiencePoints: number;
  /** Løst uten å få noe vist, og hvert steg på første forsøk. */
  readonly clean: boolean;
  readonly revealedSteps: number;
  readonly misconceptionsHit: ReadonlyArray<MisconceptionType>;
}

export interface PracticeSummary {
  readonly exercisesCompleted: number;
  readonly cleanStreak: number;
  readonly bestStreak: number;
  readonly requiredStreak: number;
  readonly isMastered: boolean;
  readonly totalExperiencePoints: number;
  readonly averageScore: number;
  readonly level: MasteryLevel;
  readonly misconceptionsHit: ReadonlyArray<MisconceptionType>;
  /** Hva eleven bør gjøre nå. */
  readonly nextStepMessage: string;
}

interface PracticeRunState {
  readonly template: ExerciseTemplate;
  readonly seed: number;
  readonly session: GuidedSession;
  readonly results: ReadonlyArray<PracticeResult>;
  readonly cleanStreak: number;
  readonly bestStreak: number;
  readonly masteredAt: number | null;
}

/**
 * En øvingsserie på én ferdighet.
 *
 * Serien tar aldri slutt. Eleven får en ny variant av samme oppgavetype så
 * lenge hen vil, og ferdigheten regnes som mestret når tre oppgaver på rad er
 * løst uten hjelp. Etter det kan eleven fortsette – repetisjon er hele poenget,
 * og terskelen er et signal, ikke en sluttstrek.
 */
export class PracticeRun {
  /** Antall feilfrie oppgaver på rad som kreves for mestring. */
  public static readonly REQUIRED_CLEAN_STREAK = 3;

  private constructor(private readonly state: PracticeRunState) {}

  /**
   * Starter en serie. Frøet bestemmer den første varianten, og hver ny
   * oppgave øker det, slik at eleven ikke møter samme tall to ganger på rad.
   */
  public static start(
    template: ExerciseTemplate,
    startSeed = 1
  ): Result<PracticeRun, GuidedError> {
    const sessionResult = PracticeRun.buildSession(template, startSeed);
    if (sessionResult.isFailure) {
      return Result.fail(sessionResult.error);
    }

    return Result.ok(
      new PracticeRun({
        template,
        seed: startSeed,
        session: sessionResult.value,
        results: [],
        cleanStreak: 0,
        bestStreak: 0,
        masteredAt: null,
      })
    );
  }

  private static buildSession(
    template: ExerciseTemplate,
    seed: number
  ): Result<GuidedSession, GuidedError> {
    const definition = template.generate(seed);
    const walkthroughResult = GuidedWalkthrough.fromDefinition(definition);
    if (walkthroughResult.isFailure) {
      return Result.fail(walkthroughResult.error);
    }

    // Øvingsoppgaver går rett på «Gjør det». Den som øver har alt sett
    // framgangsmåten, og skal bruke tiden på repetisjon.
    const session = GuidedSession.start(walkthroughResult.value, null);
    return session.beginPractice();
  }

  private clone(patch: Partial<PracticeRunState>): PracticeRun {
    return new PracticeRun({ ...this.state, ...patch });
  }

  // ---------------------------------------------------------------- lesedata

  public get template(): ExerciseTemplate {
    return this.state.template;
  }

  public get session(): GuidedSession {
    return this.state.session;
  }

  public get topic(): Lk20Topic1T {
    return this.state.template.topic;
  }

  public get skillLabel(): string {
    return this.state.template.skillLabel;
  }

  public get seed(): number {
    return this.state.seed;
  }

  public get results(): ReadonlyArray<PracticeResult> {
    return this.state.results;
  }

  public get exerciseNumber(): number {
    return this.state.results.length + 1;
  }

  public get cleanStreak(): number {
    return this.state.cleanStreak;
  }

  public get isMastered(): boolean {
    return this.state.masteredAt !== null;
  }

  /** Oppgavenummeret der mestringen ble nådd, om den er nådd. */
  public get masteredAt(): number | null {
    return this.state.masteredAt;
  }

  /** Om den aktive oppgaven er ferdig og klar til å byttes ut. */
  public get isCurrentExerciseComplete(): boolean {
    return this.state.session.isComplete;
  }

  public get summary(): PracticeSummary {
    const results = this.state.results;
    const scores = results.map((result) => result.averageScore);
    const averageScore = GuidedSolverService.averageScore(scores);
    const misconceptions = new Set<MisconceptionType>();
    for (const result of results) {
      for (const type of result.misconceptionsHit) {
        misconceptions.add(type);
      }
    }

    return {
      exercisesCompleted: results.length,
      cleanStreak: this.state.cleanStreak,
      bestStreak: this.state.bestStreak,
      requiredStreak: PracticeRun.REQUIRED_CLEAN_STREAK,
      isMastered: this.isMastered,
      totalExperiencePoints: results.reduce((total, result) => total + result.experiencePoints, 0),
      averageScore,
      level: GuidedSolverService.masteryLevel(averageScore),
      misconceptionsHit: Object.freeze([...misconceptions]),
      nextStepMessage: this.buildNextStepMessage(),
    };
  }

  private buildNextStepMessage(): string {
    if (this.state.results.length === 0) {
      return `Løs ${PracticeRun.REQUIRED_CLEAN_STREAK} oppgaver på rad uten hjelp, så er ferdigheten mestret.`;
    }

    if (this.isMastered) {
      return 'Ferdigheten er mestret. Fortsett hvis du vil holde den varm, eller velg en ny ferdighet.';
    }

    const remaining = PracticeRun.REQUIRED_CLEAN_STREAK - this.state.cleanStreak;
    if (this.state.cleanStreak === 0) {
      return `Neste oppgave starter rekken på nytt. Du trenger ${remaining} på rad uten hjelp.`;
    }

    return `${this.state.cleanStreak} på rad. ${remaining} igjen til ferdigheten er mestret.`;
  }

  // ------------------------------------------------------------ overganger

  /**
   * Bytter ut den aktive sesjonen med en ny tilstand fra samme oppgave.
   * Brukes for hvert valg eleven gjør.
   */
  public withSession(session: GuidedSession): Result<PracticeRun, GuidedError> {
    if (session.walkthrough.id !== this.state.session.walkthrough.id) {
      return Result.fail(
        createGuidedError(
          'ILLEGAL_TRANSITION',
          'Sesjonen tilhører en annen oppgave enn den som er aktiv i øvingsserien.'
        )
      );
    }

    return Result.ok(this.clone({ session }));
  }

  /**
   * Registrerer resultatet av den aktive oppgaven og deler ut en ny variant.
   */
  public nextExercise(): Result<PracticeRun, GuidedError> {
    if (!this.state.session.isComplete) {
      return Result.fail(
        createGuidedError(
          'ILLEGAL_TRANSITION',
          'Oppgaven er ikke ferdig ennå, så det er for tidlig å hente en ny.'
        )
      );
    }

    const summary = this.state.session.summary;
    const clean = summary.revealedSteps === 0 && summary.firstTrySteps === summary.totalSteps;
    const exerciseNumber = this.exerciseNumber;

    const result: PracticeResult = {
      exerciseNumber,
      walkthroughId: this.state.session.walkthrough.id,
      averageScore: summary.averageScore,
      experiencePoints: summary.experiencePoints,
      clean,
      revealedSteps: summary.revealedSteps,
      misconceptionsHit: summary.misconceptionsHit,
    };

    const cleanStreak = clean ? this.state.cleanStreak + 1 : 0;
    const bestStreak = Math.max(this.state.bestStreak, cleanStreak);
    const masteredAt =
      this.state.masteredAt ??
      (cleanStreak >= PracticeRun.REQUIRED_CLEAN_STREAK ? exerciseNumber : null);

    const nextSeed = this.state.seed + 1;
    const sessionResult = PracticeRun.buildSession(this.state.template, nextSeed);
    if (sessionResult.isFailure) {
      return Result.fail(sessionResult.error);
    }

    return Result.ok(
      this.clone({
        seed: nextSeed,
        session: sessionResult.value,
        results: [...this.state.results, result],
        cleanStreak,
        bestStreak,
        masteredAt,
      })
    );
  }

  /**
   * Starter den aktive oppgaven på nytt med samme tall.
   * Brukes når eleven vil prøve den samme oppgaven en gang til.
   */
  public retryCurrentExercise(): Result<PracticeRun, GuidedError> {
    const sessionResult = PracticeRun.buildSession(this.state.template, this.state.seed);
    if (sessionResult.isFailure) {
      return Result.fail(sessionResult.error);
    }

    return Result.ok(this.clone({ session: sessionResult.value }));
  }
}
