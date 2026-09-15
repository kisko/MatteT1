import { Result } from '../../shared/Result.js';
import { createGuidedError, GuidedError } from './errors/GuidedError.js';
import { StepOption } from './value-objects/StepOption.js';
import { StepOptionDefinition } from './GuidedWalkthrough.js';
import { StepVisual, validateVisual } from './value-objects/StepVisual.js';
import { Lk20Topic1T } from '../task/value-objects/Lk20Category.js';
import { MisconceptionType } from '../task/Misconception.js';

export interface ErrorHuntLineDefinition {
  readonly latex: string;
  /** Kort merknad som vises etter at feilen er funnet. */
  readonly note: string;
}

export interface ErrorHuntDefinition {
  readonly id: string;
  readonly topic: Lk20Topic1T;
  readonly goalId: string;
  readonly skillLabel: string;
  readonly title: string;
  /** Hva «en annen elev» har levert. */
  readonly claim: string;
  readonly lines: readonly ErrorHuntLineDefinition[];
  /** 1-indeksert linjenummer der utregningen sporer av. */
  readonly flawedLineNumber: number;
  readonly misconceptionType: MisconceptionType;
  readonly repairOptions: readonly StepOptionDefinition[];
  readonly explanation: string;
  readonly takeaway: string;
  readonly visual: StepVisual;
}

export class ErrorHuntLine {
  public constructor(
    public readonly lineNumber: number,
    public readonly latex: string,
    public readonly note: string
  ) {}
}

/**
 * «Finn feilen»: en ferdig utregning som ser riktig ut, men som inneholder én
 * typisk elevfeil. Eleven peker på linjen som sporer av og velger reparasjonen.
 *
 * Feilen er alltid knyttet til en MisconceptionType, slik at treffet kan
 * registreres i den samme misoppfatningsstatistikken som quizen bruker.
 */
export class ErrorHunt {
  private constructor(
    public readonly id: string,
    public readonly topic: Lk20Topic1T,
    public readonly goalId: string,
    public readonly skillLabel: string,
    public readonly title: string,
    public readonly claim: string,
    public readonly lines: ReadonlyArray<ErrorHuntLine>,
    public readonly flawedLineNumber: number,
    public readonly misconceptionType: MisconceptionType,
    public readonly repairOptions: ReadonlyArray<StepOption>,
    public readonly explanation: string,
    public readonly takeaway: string,
    public readonly visual: StepVisual
  ) {}

  public static fromDefinition(definition: ErrorHuntDefinition): Result<ErrorHunt, GuidedError> {
    const fail = (message: string) =>
      Result.fail<GuidedError, ErrorHunt>(
        createGuidedError('INVALID_ERROR_HUNT', message, { id: definition.id })
      );

    if (!definition.id || definition.id.trim().length === 0) {
      return fail('En feiljakt må ha en id.');
    }

    if (!definition.title || definition.title.trim().length === 0) {
      return fail('En feiljakt må ha en tittel.');
    }

    if (!definition.claim || definition.claim.trim().length === 0) {
      return fail('En feiljakt må vise hva som er påstått løst.');
    }

    if (definition.lines.length < 3) {
      return fail('En feiljakt må ha minst tre linjer, ellers er det ingenting å lete i.');
    }

    if (definition.lines.some((line) => !line.latex || line.latex.trim().length === 0)) {
      return fail('Alle linjer i en feiljakt må ha innhold.');
    }

    if (definition.lines.some((line) => !line.note || line.note.trim().length === 0)) {
      return fail('Alle linjer i en feiljakt må ha en merknad som forklarer om linjen er i orden.');
    }

    if (
      !Number.isInteger(definition.flawedLineNumber) ||
      definition.flawedLineNumber < 1 ||
      definition.flawedLineNumber > definition.lines.length
    ) {
      return fail('Linjenummeret for feilen må peke på en linje som finnes.');
    }

    if (definition.flawedLineNumber === 1) {
      return fail('Den første linjen er oppgaveteksten og kan ikke være feilen.');
    }

    if (definition.misconceptionType === MisconceptionType.NONE) {
      return fail('En feiljakt må peke på en konkret misoppfatning.');
    }

    if (!definition.explanation || definition.explanation.trim().length === 0) {
      return fail('En feiljakt må forklare hva som gikk galt.');
    }

    if (!definition.takeaway || definition.takeaway.trim().length === 0) {
      return fail('En feiljakt må ha en lærdom eleven tar med videre.');
    }

    if (definition.repairOptions.length < 2) {
      return fail('En feiljakt må ha minst to reparasjonsalternativer.');
    }

    const repairOptions: StepOption[] = [];
    for (const optionDefinition of definition.repairOptions) {
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
      repairOptions.push(optionResult.value);
    }

    const correctRepairs = repairOptions.filter((option) => option.isCorrect);
    if (correctRepairs.length !== 1) {
      return fail(
        `En feiljakt må ha nøyaktig én riktig reparasjon, men hadde ${correctRepairs.length}.`
      );
    }

    const uniqueIds = new Set(repairOptions.map((option) => option.id));
    if (uniqueIds.size !== repairOptions.length) {
      return fail('Reparasjonsalternativene må ha unike id-er.');
    }

    const visualResult = validateVisual(definition.visual);
    if (visualResult.isFailure) {
      return Result.fail(visualResult.error);
    }

    const lines = definition.lines.map(
      (line, index) => new ErrorHuntLine(index + 1, line.latex.trim(), line.note.trim())
    );

    return Result.ok(
      new ErrorHunt(
        definition.id.trim(),
        definition.topic,
        definition.goalId.trim(),
        definition.skillLabel.trim(),
        definition.title.trim(),
        definition.claim.trim(),
        Object.freeze(lines),
        definition.flawedLineNumber,
        definition.misconceptionType,
        Object.freeze(repairOptions),
        definition.explanation.trim(),
        definition.takeaway.trim(),
        visualResult.value
      )
    );
  }

  public get correctRepair(): StepOption {
    return this.repairOptions.find((option) => option.isCorrect)!;
  }

  public findRepair(optionId: string): StepOption | undefined {
    return this.repairOptions.find((option) => option.id === optionId);
  }

  public lineAt(lineNumber: number): ErrorHuntLine | undefined {
    return this.lines.find((line) => line.lineNumber === lineNumber);
  }
}
