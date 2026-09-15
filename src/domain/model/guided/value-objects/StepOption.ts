import { Result } from '../../../shared/Result.js';
import { createGuidedError, GuidedError } from '../errors/GuidedError.js';
import { MisconceptionType } from '../../task/Misconception.js';

export interface CreateStepOptionProps {
  readonly id: string;
  /** Kandidaten eleven kan velge, som LaTeX eller kort tekst. */
  readonly latex: string;
  readonly isCorrect: boolean;
  /** Forklaringen eleven får umiddelbart etter valget. Aldri tom. */
  readonly feedback: string;
  /** Hvilken kjent misoppfatning et galt valg representerer. */
  readonly misconceptionType?: MisconceptionType;
}

/**
 * Et svaralternativ i et veiledet steg.
 *
 * Alle interaksjoner i Mesterlab er valg, ikke fritekst. Derfor er dette
 * verdiobjektet bærebjelken: hvert galt alternativ er en *reell* elevfeil med
 * sin egen forklaring, ikke en tilfeldig distraktør.
 */
export class StepOption {
  private constructor(
    public readonly id: string,
    public readonly latex: string,
    public readonly isCorrect: boolean,
    public readonly feedback: string,
    public readonly misconceptionType?: MisconceptionType
  ) {}

  public static create(props: CreateStepOptionProps): Result<StepOption, GuidedError> {
    if (!props.id || props.id.trim().length === 0) {
      return Result.fail(createGuidedError('INVALID_STEP_OPTION', 'Et svaralternativ må ha en id.'));
    }

    if (!props.latex || props.latex.trim().length === 0) {
      return Result.fail(
        createGuidedError('INVALID_STEP_OPTION', `Alternativet '${props.id}' kan ikke være tomt.`)
      );
    }

    if (!props.feedback || props.feedback.trim().length === 0) {
      return Result.fail(
        createGuidedError(
          'INVALID_STEP_OPTION',
          `Alternativet '${props.id}' mangler forklaring. Eleven skal alltid få vite hvorfor et valg er riktig eller galt.`
        )
      );
    }

    if (props.isCorrect && props.misconceptionType && props.misconceptionType !== MisconceptionType.NONE) {
      return Result.fail(
        createGuidedError(
          'INVALID_STEP_OPTION',
          `Alternativet '${props.id}' er markert som riktig, men er knyttet til en misoppfatning.`
        )
      );
    }

    const misconceptionType =
      props.misconceptionType === MisconceptionType.NONE ? undefined : props.misconceptionType;

    return Result.ok(
      new StepOption(
        props.id.trim(),
        props.latex.trim(),
        props.isCorrect,
        props.feedback.trim(),
        misconceptionType
      )
    );
  }

  public equals(other?: StepOption): boolean {
    return Boolean(other) && this.id === other!.id;
  }
}
