import { Result } from '../../shared/Result.js';
import { createGuidedError, GuidedError } from './errors/GuidedError.js';
import { GuidedStep, GuidedStepKind } from './value-objects/GuidedStep.js';
import { StepOption } from './value-objects/StepOption.js';
import { StepVisual } from './value-objects/StepVisual.js';
import { Lk20Topic1T } from '../task/value-objects/Lk20Category.js';
import { MisconceptionType } from '../task/Misconception.js';

/**
 * Flate definisjonstyper som innholdsbanken skriver.
 * Stegnummer utledes av rekkefølgen, slik at innholdet ikke kan komme ut av takt.
 */
export interface StepOptionDefinition {
  readonly id: string;
  readonly latex: string;
  readonly isCorrect?: boolean;
  readonly feedback: string;
  readonly misconceptionType?: MisconceptionType;
}

export interface GuidedStepDefinition {
  readonly kind: GuidedStepKind;
  readonly prompt: string;
  readonly options: readonly StepOptionDefinition[];
  readonly resultLatex: string;
  readonly rationale: string;
  readonly hint: string;
  readonly visual: StepVisual;
}

export interface GuidedWalkthroughDefinition {
  readonly id: string;
  readonly topic: Lk20Topic1T;
  /** Kompetansemål i kompetansematrisen, f.eks. 'ALG-02'. */
  readonly goalId: string;
  /** Oppgavemerkelappen progresjonen registreres på, f.eks. 'Faktorisering'. */
  readonly skillLabel: string;
  readonly title: string;
  /** Den konkrete situasjonen oppgaven kommer fra. */
  readonly situation: string;
  readonly problemLatex: string;
  readonly steps: readonly GuidedStepDefinition[];
  readonly answerLatex: string;
  /** Én setning eleven skal ta med videre. */
  readonly takeaway: string;
}

/**
 * En komplett veiledet utregning: problemet, hvert steg med valg og
 * visualisering, svaret og lærdommen.
 */
export class GuidedWalkthrough {
  private constructor(
    public readonly id: string,
    public readonly topic: Lk20Topic1T,
    public readonly goalId: string,
    public readonly skillLabel: string,
    public readonly title: string,
    public readonly situation: string,
    public readonly problemLatex: string,
    public readonly steps: ReadonlyArray<GuidedStep>,
    public readonly answerLatex: string,
    public readonly takeaway: string
  ) {}

  public static fromDefinition(
    definition: GuidedWalkthroughDefinition
  ): Result<GuidedWalkthrough, GuidedError> {
    const fail = (message: string) =>
      Result.fail<GuidedError, GuidedWalkthrough>(
        createGuidedError('INVALID_WALKTHROUGH', message, { id: definition.id })
      );

    if (!definition.id || definition.id.trim().length === 0) {
      return fail('En veiledet utregning må ha en id.');
    }

    if (!definition.title || definition.title.trim().length === 0) {
      return fail('En veiledet utregning må ha en tittel.');
    }

    if (!definition.problemLatex || definition.problemLatex.trim().length === 0) {
      return fail('En veiledet utregning må ha et problem.');
    }

    if (!definition.situation || definition.situation.trim().length === 0) {
      return fail('En veiledet utregning må ha en situasjon eleven kjenner igjen.');
    }

    if (!definition.answerLatex || definition.answerLatex.trim().length === 0) {
      return fail('En veiledet utregning må ha et svar.');
    }

    if (!definition.takeaway || definition.takeaway.trim().length === 0) {
      return fail('En veiledet utregning må ha en lærdom eleven tar med videre.');
    }

    if (!definition.skillLabel || definition.skillLabel.trim().length === 0) {
      return fail('En veiledet utregning må knyttes til en ferdighet progresjonen kan registreres på.');
    }

    if (definition.steps.length < 2) {
      return fail('En veiledet utregning må ha minst to steg.');
    }

    const steps: GuidedStep[] = [];
    for (const [index, stepDefinition] of definition.steps.entries()) {
      const options: StepOption[] = [];
      for (const optionDefinition of stepDefinition.options) {
        const optionResult = StepOption.create({
          id: optionDefinition.id,
          latex: optionDefinition.latex,
          isCorrect: optionDefinition.isCorrect ?? false,
          feedback: optionDefinition.feedback,
          misconceptionType: optionDefinition.misconceptionType,
        });
        if (optionResult.isFailure) {
          return Result.fail(optionResult.error);
        }
        options.push(optionResult.value);
      }

      const stepResult = GuidedStep.create({
        stepNumber: index + 1,
        kind: stepDefinition.kind,
        prompt: stepDefinition.prompt,
        options,
        resultLatex: stepDefinition.resultLatex,
        rationale: stepDefinition.rationale,
        hint: stepDefinition.hint,
        visual: stepDefinition.visual,
      });
      if (stepResult.isFailure) {
        return Result.fail(stepResult.error);
      }
      steps.push(stepResult.value);
    }

    return Result.ok(
      new GuidedWalkthrough(
        definition.id.trim(),
        definition.topic,
        definition.goalId.trim(),
        definition.skillLabel.trim(),
        definition.title.trim(),
        definition.situation.trim(),
        definition.problemLatex.trim(),
        Object.freeze(steps),
        definition.answerLatex.trim(),
        definition.takeaway.trim()
      )
    );
  }

  public get stepCount(): number {
    return this.steps.length;
  }

  public stepAt(stepNumber: number): GuidedStep | undefined {
    return this.steps.find((step) => step.stepNumber === stepNumber);
  }

  /**
   * Misoppfatningene denne utregningen bevisst utsetter eleven for.
   * Brukes til å vise «feller du unngikk» i oppsummeringen.
   */
  public get watchedMisconceptions(): ReadonlyArray<MisconceptionType> {
    const types = new Set<MisconceptionType>();
    for (const step of this.steps) {
      for (const option of step.options) {
        if (option.misconceptionType) {
          types.add(option.misconceptionType);
        }
      }
    }
    return Object.freeze([...types]);
  }
}
