import { Result } from '../../../shared/Result.js';
import { createGuidedError, GuidedError } from '../errors/GuidedError.js';
import { StepOption } from './StepOption.js';
import { StepVisual, validateVisual } from './StepVisual.js';

/**
 * Hva eleven faktisk gjør i steget.
 * - transform: velg neste lovlige omskriving
 * - chooseRule: velg regelen eller formelen som gjelder
 * - interpret: velg hva resultatet betyr i situasjonen
 * - checkResult: velg kontrollen som viser at svaret stemmer
 */
export type GuidedStepKind = 'transform' | 'chooseRule' | 'interpret' | 'checkResult';

export interface CreateGuidedStepProps {
  readonly stepNumber: number;
  readonly kind: GuidedStepKind;
  /** Spørsmålet eleven ser over alternativene. */
  readonly prompt: string;
  readonly options: readonly StepOption[];
  /** Linjen som står igjen i utregningen etter et riktig valg. */
  readonly resultLatex: string;
  /** Hvorfor dette steget er matematisk lovlig. Vises i «Se det»-modus. */
  readonly rationale: string;
  /** Ett hint eleven kan hente før valget. Koster litt av stegscoren. */
  readonly hint: string;
  readonly visual: StepVisual;
}

/**
 * Ett steg i en veiledet utregning.
 *
 * Invarianten «nøyaktig ett riktig alternativ» er det som gjør at UI-et kan
 * være dumt: det trenger bare vise alternativene og la domenet dømme.
 */
export class GuidedStep {
  private constructor(
    public readonly stepNumber: number,
    public readonly kind: GuidedStepKind,
    public readonly prompt: string,
    public readonly options: ReadonlyArray<StepOption>,
    public readonly resultLatex: string,
    public readonly rationale: string,
    public readonly hint: string,
    public readonly visual: StepVisual
  ) {}

  public static create(props: CreateGuidedStepProps): Result<GuidedStep, GuidedError> {
    const fail = (message: string) =>
      Result.fail<GuidedError, GuidedStep>(
        createGuidedError('INVALID_GUIDED_STEP', message, { stepNumber: props.stepNumber })
      );

    if (!Number.isInteger(props.stepNumber) || props.stepNumber <= 0) {
      return fail('Stegnummer må være et positivt heltall.');
    }

    if (!props.prompt || props.prompt.trim().length === 0) {
      return fail('Et steg må ha et spørsmål eleven kan svare på.');
    }

    if (props.options.length < 2) {
      return fail('Et steg må ha minst to alternativer, ellers er det ikke et valg.');
    }

    const correctOptions = props.options.filter((option) => option.isCorrect);
    if (correctOptions.length !== 1) {
      return fail(
        `Et steg må ha nøyaktig ett riktig alternativ, men hadde ${correctOptions.length}.`
      );
    }

    const uniqueIds = new Set(props.options.map((option) => option.id));
    if (uniqueIds.size !== props.options.length) {
      return fail('Alternativene i et steg må ha unike id-er.');
    }

    if (!props.resultLatex || props.resultLatex.trim().length === 0) {
      return fail('Et steg må vise hvilken linje som står igjen etter et riktig valg.');
    }

    if (!props.rationale || props.rationale.trim().length === 0) {
      return fail('Et steg må forklare hvorfor omskrivingen er lovlig.');
    }

    if (!props.hint || props.hint.trim().length === 0) {
      return fail('Et steg må ha et hint eleven kan hente før valget.');
    }

    const visualResult = validateVisual(props.visual);
    if (visualResult.isFailure) {
      return Result.fail(visualResult.error);
    }

    return Result.ok(
      new GuidedStep(
        props.stepNumber,
        props.kind,
        props.prompt.trim(),
        Object.freeze([...props.options]),
        props.resultLatex.trim(),
        props.rationale.trim(),
        props.hint.trim(),
        visualResult.value
      )
    );
  }

  public get correctOption(): StepOption {
    return this.options.find((option) => option.isCorrect)!;
  }

  public findOption(optionId: string): StepOption | undefined {
    return this.options.find((option) => option.id === optionId);
  }
}
