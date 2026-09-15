import { AggregateRoot } from '../../shared/AggregateRoot.js';
import { Result } from '../../shared/Result.js';
import { createGuidedError, GuidedError } from '../guided/errors/GuidedError.js';
import { StepVisual } from '../guided/value-objects/StepVisual.js';
import { Lk20Topic1T } from '../task/value-objects/Lk20Category.js';
import { ExplorationLab } from './ExplorationLab.js';
import { DerivedReadout, ExplorationValues } from './ExplorationTypes.js';
import {
  ExplorationLabCompletedDomainEvent,
  ExplorationMissionCompletedDomainEvent,
} from '../../events/ExplorationEvents.js';

export interface ClaimVerdict {
  readonly claimId: string;
  /** Hva eleven svarte. */
  readonly answeredTrue: boolean;
  readonly isCorrect: boolean;
}

export interface ExplorationFeedback {
  readonly tone: 'correct' | 'incorrect' | 'mission' | 'info';
  readonly title: string;
  readonly message: string;
}

export interface ExplorationProgress {
  readonly completedMissions: number;
  readonly totalMissions: number;
  readonly answeredClaims: number;
  readonly correctClaims: number;
  readonly totalClaims: number;
  readonly percentage: number;
  readonly isComplete: boolean;
}

interface ExplorationSessionState {
  readonly lab: ExplorationLab;
  readonly values: ExplorationValues;
  readonly completedMissionIds: ReadonlyArray<string>;
  readonly verdicts: ReadonlyArray<ClaimVerdict>;
  readonly revealedHintIds: ReadonlyArray<string>;
  readonly feedback: ExplorationFeedback | null;
}

/**
 * En utforskningsøkt.
 *
 * Oppdrag sjekkes automatisk hver gang eleven endrer en parameter. Det er
 * bevisst: eleven skal oppdage at hen har løst oppdraget ved å se på modellen,
 * ikke ved å trykke «sjekk svar». Et løst oppdrag kan ikke bli uløst igjen,
 * selv om eleven drar videre – oppdagelsen er gjort.
 */
export class ExplorationSession extends AggregateRoot<string> {
  private constructor(private readonly state: ExplorationSessionState) {
    super();
  }

  public static start(
    lab: ExplorationLab,
    alreadyCompletedMissionIds: readonly string[] = []
  ): ExplorationSession {
    const known = alreadyCompletedMissionIds.filter((id) => lab.mission(id) !== undefined);

    return new ExplorationSession({
      lab,
      values: lab.initialValues,
      completedMissionIds: [...new Set(known)],
      verdicts: [],
      revealedHintIds: [],
      feedback: null,
    });
  }

  private clone(patch: Partial<ExplorationSessionState>): ExplorationSession {
    return new ExplorationSession({ ...this.state, ...patch });
  }

  // ---------------------------------------------------------------- lesedata

  public get id(): string {
    return this.state.lab.id;
  }

  public get lab(): ExplorationLab {
    return this.state.lab;
  }

  public get topic(): Lk20Topic1T {
    return this.state.lab.topic;
  }

  public get values(): ExplorationValues {
    return this.state.values;
  }

  public get visual(): StepVisual {
    return this.state.lab.visualFor(this.state.values);
  }

  public get readouts(): readonly DerivedReadout[] {
    return this.state.lab.readoutsFor(this.state.values);
  }

  public get modelLatex(): string {
    return this.state.lab.modelFor(this.state.values);
  }

  public get completedMissionIds(): ReadonlyArray<string> {
    return this.state.completedMissionIds;
  }

  public get feedback(): ExplorationFeedback | null {
    return this.state.feedback;
  }

  public isMissionCompleted(missionId: string): boolean {
    return this.state.completedMissionIds.includes(missionId);
  }

  public isHintRevealed(missionId: string): boolean {
    return this.state.revealedHintIds.includes(missionId);
  }

  public verdictFor(claimId: string): ClaimVerdict | undefined {
    return this.state.verdicts.find((verdict) => verdict.claimId === claimId);
  }

  /** Oppdrag som er løst med gjeldende verdier, uavhengig av historikk. */
  public get missionsSatisfiedNow(): ReadonlyArray<string> {
    return this.state.lab.missions
      .filter((mission) => mission.isAccomplished(this.state.values))
      .map((mission) => mission.id);
  }

  public get progress(): ExplorationProgress {
    const totalMissions = this.state.lab.missions.length;
    const totalClaims = this.state.lab.claims.length;
    const completedMissions = this.state.completedMissionIds.length;
    const correctClaims = this.state.verdicts.filter((verdict) => verdict.isCorrect).length;
    const totalSteps = totalMissions + totalClaims;
    const doneSteps = completedMissions + correctClaims;

    return {
      completedMissions,
      totalMissions,
      answeredClaims: this.state.verdicts.length,
      correctClaims,
      totalClaims,
      percentage: totalSteps === 0 ? 0 : Math.round((doneSteps / totalSteps) * 100),
      isComplete: completedMissions === totalMissions && correctClaims === totalClaims,
    };
  }

  // ------------------------------------------------------------ overganger

  /**
   * Setter en parameter og sjekker oppdragene på nytt.
   */
  public setParameter(parameterId: string, value: number): Result<ExplorationSession, GuidedError> {
    const parameter = this.state.lab.parameter(parameterId);
    if (!parameter) {
      return Result.fail(
        createGuidedError('UNKNOWN_OPTION', `Parameteren '${parameterId}' finnes ikke i utforskningen.`)
      );
    }

    if (!Number.isFinite(value)) {
      return Result.fail(
        createGuidedError('ILLEGAL_TRANSITION', `Verdien for '${parameterId}' må være et tall.`)
      );
    }

    const values = { ...this.state.values, [parameterId]: parameter.clamp(value) };
    return Result.ok(this.withValues(values));
  }

  /** Setter alle parametere på én gang, f.eks. ved animasjon. */
  public setValues(values: ExplorationValues): Result<ExplorationSession, GuidedError> {
    const next: Record<string, number> = { ...this.state.values };

    for (const [parameterId, value] of Object.entries(values)) {
      const parameter = this.state.lab.parameter(parameterId);
      if (!parameter) {
        return Result.fail(
          createGuidedError('UNKNOWN_OPTION', `Parameteren '${parameterId}' finnes ikke i utforskningen.`)
        );
      }
      if (!Number.isFinite(value)) {
        return Result.fail(
          createGuidedError('ILLEGAL_TRANSITION', `Verdien for '${parameterId}' må være et tall.`)
        );
      }
      next[parameterId] = parameter.clamp(value);
    }

    return Result.ok(this.withValues(next));
  }

  /**
   * Felles oppdatering: nye verdier, og oppdrag som nettopp ble løst.
   */
  private withValues(values: ExplorationValues): ExplorationSession {
    const newlyCompleted = this.state.lab.missions.filter(
      (mission) =>
        !this.state.completedMissionIds.includes(mission.id) && mission.isAccomplished(values)
    );

    const completedMissionIds = [
      ...this.state.completedMissionIds,
      ...newlyCompleted.map((mission) => mission.id),
    ];

    const feedback: ExplorationFeedback | null =
      newlyCompleted.length > 0
        ? {
            tone: 'mission',
            title: newlyCompleted.length === 1 ? 'Oppdrag løst' : `${newlyCompleted.length} oppdrag løst`,
            message: newlyCompleted.map((mission) => mission.successMessage).join(' '),
          }
        : this.state.feedback;

    const next = this.clone({ values, completedMissionIds, feedback });

    for (const mission of newlyCompleted) {
      next.addDomainEvent(
        new ExplorationMissionCompletedDomainEvent(
          this.state.lab.id,
          mission.id,
          this.state.lab.topic,
          mission.prompt,
          completedMissionIds.length,
          this.state.lab.missions.length
        )
      );
    }

    if (newlyCompleted.length > 0 && next.progress.isComplete) {
      next.addLabCompletedEvent();
    }

    return next;
  }

  /**
   * Eleven vurderer en påstand. Feil svar kan prøves på nytt – men forklaringen
   * blir stående, slik at eleven kan undersøke om den stemmer med modellen.
   */
  public answerClaim(claimId: string, answeredTrue: boolean): Result<ExplorationSession, GuidedError> {
    const claim = this.state.lab.claim(claimId);
    if (!claim) {
      return Result.fail(
        createGuidedError('UNKNOWN_OPTION', `Påstanden '${claimId}' finnes ikke i utforskningen.`)
      );
    }

    const isCorrect = claim.isTrue === answeredTrue;
    const verdicts = [
      ...this.state.verdicts.filter((verdict) => verdict.claimId !== claimId),
      { claimId, answeredTrue, isCorrect },
    ];

    const next = this.clone({
      verdicts,
      feedback: {
        tone: isCorrect ? 'correct' : 'incorrect',
        title: isCorrect ? 'Riktig vurdert' : 'Ikke helt',
        message: claim.explanation,
      },
    });

    if (isCorrect && next.progress.isComplete) {
      next.addLabCompletedEvent();
    }

    return Result.ok(next);
  }

  /** Viser hintet til et oppdrag. */
  public revealHint(missionId: string): Result<ExplorationSession, GuidedError> {
    const mission = this.state.lab.mission(missionId);
    if (!mission) {
      return Result.fail(
        createGuidedError('UNKNOWN_OPTION', `Oppdraget '${missionId}' finnes ikke i utforskningen.`)
      );
    }

    return Result.ok(
      this.clone({
        revealedHintIds: [...new Set([...this.state.revealedHintIds, missionId])],
        feedback: {
          tone: 'info',
          title: 'Hint',
          message: mission.hint,
        },
      })
    );
  }

  /** Setter parameterne tilbake til start, men beholder det eleven har oppdaget. */
  public resetParameters(): ExplorationSession {
    return this.clone({
      values: this.state.lab.initialValues,
      feedback: {
        tone: 'info',
        title: 'Nullstilt',
        message: 'Parameterne er tilbake til utgangspunktet. Oppdragene du har løst står fortsatt.',
      },
    });
  }

  private addLabCompletedEvent(): void {
    const progress = this.progress;
    this.addDomainEvent(
      new ExplorationLabCompletedDomainEvent(
        this.state.lab.id,
        this.state.lab.topic,
        this.state.lab.title,
        progress.totalMissions,
        progress.correctClaims,
        progress.totalClaims
      )
    );
  }
}
