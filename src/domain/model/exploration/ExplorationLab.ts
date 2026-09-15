import { Result } from '../../shared/Result.js';
import { createGuidedError, GuidedError } from '../guided/errors/GuidedError.js';
import { StepVisual, validateVisual } from '../guided/value-objects/StepVisual.js';
import { Lk20Topic1T } from '../task/value-objects/Lk20Category.js';
import {
  DerivedReadout,
  ExplorationClaimDefinition,
  ExplorationLabDefinition,
  ExplorationMissionDefinition,
  ExplorationParameterDefinition,
  ExplorationValues,
} from './ExplorationTypes.js';

export class ExplorationParameter {
  private constructor(
    public readonly id: string,
    public readonly label: string,
    public readonly meaning: string,
    public readonly min: number,
    public readonly max: number,
    public readonly step: number,
    public readonly initial: number
  ) {}

  public static create(
    definition: ExplorationParameterDefinition
  ): Result<ExplorationParameter, GuidedError> {
    const fail = (message: string) =>
      Result.fail<GuidedError, ExplorationParameter>(
        createGuidedError('INVALID_WALKTHROUGH', message, { parameter: definition.id })
      );

    if (!definition.id.trim()) return fail('En parameter må ha en id.');
    if (!definition.label.trim()) return fail(`Parameteren '${definition.id}' må ha en merkelapp.`);
    if (!definition.meaning.trim()) {
      return fail(`Parameteren '${definition.id}' må forklare hva den styrer.`);
    }
    if (definition.min >= definition.max) {
      return fail(`Parameteren '${definition.id}' må ha min mindre enn max.`);
    }
    if (definition.step <= 0) {
      return fail(`Parameteren '${definition.id}' må ha et positivt steg.`);
    }
    if (definition.initial < definition.min || definition.initial > definition.max) {
      return fail(`Startverdien til '${definition.id}' ligger utenfor intervallet.`);
    }

    return Result.ok(
      new ExplorationParameter(
        definition.id.trim(),
        definition.label.trim(),
        definition.meaning.trim(),
        definition.min,
        definition.max,
        definition.step,
        definition.initial
      )
    );
  }

  /** Alle verdier parameteren kan ha. Brukes til å teste at oppdrag er mulige. */
  public get allValues(): readonly number[] {
    const values: number[] = [];
    const count = Math.round((this.max - this.min) / this.step);
    for (let index = 0; index <= count; index += 1) {
      values.push(Number((this.min + index * this.step).toFixed(4)));
    }
    return values;
  }

  /** Klemmer en verdi inn i intervallet og på rutenettet. */
  public clamp(value: number): number {
    const bounded = Math.min(Math.max(value, this.min), this.max);
    const steps = Math.round((bounded - this.min) / this.step);
    return Number((this.min + steps * this.step).toFixed(4));
  }
}

export class ExplorationClaim {
  private constructor(
    public readonly id: string,
    public readonly text: string,
    public readonly isTrue: boolean,
    public readonly explanation: string
  ) {}

  public static create(
    definition: ExplorationClaimDefinition
  ): Result<ExplorationClaim, GuidedError> {
    if (!definition.id.trim() || !definition.text.trim()) {
      return Result.fail(
        createGuidedError('INVALID_STEP_OPTION', 'En påstand må ha id og tekst.', {
          claim: definition.id,
        })
      );
    }

    if (!definition.explanation.trim()) {
      return Result.fail(
        createGuidedError(
          'INVALID_STEP_OPTION',
          `Påstanden '${definition.id}' mangler forklaring. Eleven skal alltid få vite hvorfor.`
        )
      );
    }

    return Result.ok(
      new ExplorationClaim(
        definition.id.trim(),
        definition.text.trim(),
        definition.isTrue,
        definition.explanation.trim()
      )
    );
  }
}

export class ExplorationMission {
  private constructor(
    public readonly id: string,
    public readonly prompt: string,
    public readonly hint: string,
    public readonly successMessage: string,
    private readonly predicate: (values: ExplorationValues) => boolean
  ) {}

  public static create(
    definition: ExplorationMissionDefinition
  ): Result<ExplorationMission, GuidedError> {
    const fail = (message: string) =>
      Result.fail<GuidedError, ExplorationMission>(
        createGuidedError('INVALID_GUIDED_STEP', message, { mission: definition.id })
      );

    if (!definition.id.trim()) return fail('Et oppdrag må ha en id.');
    if (!definition.prompt.trim()) return fail(`Oppdraget '${definition.id}' må ha en oppgavetekst.`);
    if (!definition.hint.trim()) return fail(`Oppdraget '${definition.id}' må ha et hint.`);
    if (!definition.successMessage.trim()) {
      return fail(`Oppdraget '${definition.id}' må ha en melding når det er løst.`);
    }

    return Result.ok(
      new ExplorationMission(
        definition.id.trim(),
        definition.prompt.trim(),
        definition.hint.trim(),
        definition.successMessage.trim(),
        definition.isAccomplished
      )
    );
  }

  public isAccomplished(values: ExplorationValues): boolean {
    try {
      return this.predicate(values);
    } catch {
      // Et oppdrag som kaster skal aldri stoppe utforskningen.
      return false;
    }
  }
}

/**
 * En utforskning: en modell eleven kan dra i, med tall og bilde som oppdateres
 * mens hen drar.
 *
 * Forskjellen fra Mesterlab er retningen. Der går eleven gjennom en ferdig
 * framgangsmåte; her endrer eleven årsaken og ser virkningen. Oppdragene gjør
 * at leken har et mål: «få grafen til å miste nullpunktene» er noe modellen
 * selv kan bekrefte.
 */
export class ExplorationLab {
  private constructor(
    public readonly id: string,
    public readonly topic: Lk20Topic1T,
    public readonly goalId: string,
    public readonly skillLabel: string,
    public readonly title: string,
    public readonly bigQuestion: string,
    public readonly description: string,
    public readonly parameters: ReadonlyArray<ExplorationParameter>,
    public readonly claims: ReadonlyArray<ExplorationClaim>,
    public readonly missions: ReadonlyArray<ExplorationMission>,
    public readonly insight: string,
    public readonly animatedParameterId: string | undefined,
    private readonly visualBuilder: (values: ExplorationValues) => StepVisual,
    private readonly deriver: (values: ExplorationValues) => readonly DerivedReadout[],
    private readonly modelBuilder: (values: ExplorationValues) => string
  ) {}

  public static fromDefinition(
    definition: ExplorationLabDefinition
  ): Result<ExplorationLab, GuidedError> {
    const fail = (message: string) =>
      Result.fail<GuidedError, ExplorationLab>(
        createGuidedError('INVALID_WALKTHROUGH', message, { id: definition.id })
      );

    if (!definition.id.trim()) return fail('En utforskning må ha en id.');
    if (!definition.title.trim()) return fail('En utforskning må ha en tittel.');
    if (!definition.bigQuestion.trim()) return fail('En utforskning må ha et spørsmål å undersøke.');
    if (!definition.description.trim()) return fail('En utforskning må ha en beskrivelse.');
    if (!definition.insight.trim()) return fail('En utforskning må ha en innsikt å ta med videre.');

    if (!Object.values(Lk20Topic1T).includes(definition.topic as Lk20Topic1T)) {
      return fail(`Ugyldig tema '${definition.topic}'.`);
    }

    if (definition.parameters.length === 0) {
      return fail('En utforskning må ha minst én parameter å dra i.');
    }

    const parameters: ExplorationParameter[] = [];
    for (const parameterDefinition of definition.parameters) {
      const parameterResult = ExplorationParameter.create(parameterDefinition);
      if (parameterResult.isFailure) {
        return Result.fail(parameterResult.error);
      }
      parameters.push(parameterResult.value);
    }

    const parameterIds = new Set(parameters.map((parameter) => parameter.id));
    if (parameterIds.size !== parameters.length) {
      return fail('Parameterne må ha unike id-er.');
    }

    if (definition.animatedParameterId && !parameterIds.has(definition.animatedParameterId)) {
      return fail(`Parameteren som skal animeres ('${definition.animatedParameterId}') finnes ikke.`);
    }

    if (definition.claims.length < 3) {
      return fail('En utforskning må ha minst tre påstander å vurdere.');
    }

    const claims: ExplorationClaim[] = [];
    for (const claimDefinition of definition.claims) {
      const claimResult = ExplorationClaim.create(claimDefinition);
      if (claimResult.isFailure) {
        return Result.fail(claimResult.error);
      }
      claims.push(claimResult.value);
    }

    if (!claims.some((claim) => claim.isTrue) || !claims.some((claim) => !claim.isTrue)) {
      return fail('Påstandene må inneholde både noe som er sant og noe som ikke er sant.');
    }

    if (definition.missions.length < 2) {
      return fail('En utforskning må ha minst to oppdrag.');
    }

    const missions: ExplorationMission[] = [];
    for (const missionDefinition of definition.missions) {
      const missionResult = ExplorationMission.create(missionDefinition);
      if (missionResult.isFailure) {
        return Result.fail(missionResult.error);
      }
      missions.push(missionResult.value);
    }

    const missionIds = new Set(missions.map((mission) => mission.id));
    if (missionIds.size !== missions.length) {
      return fail('Oppdragene må ha unike id-er.');
    }

    // Røyktest med startverdiene: bildet må kunne tegnes, og tallene må finnes.
    const initialValues: Record<string, number> = {};
    for (const parameter of parameters) {
      initialValues[parameter.id] = parameter.initial;
    }

    let visual: StepVisual;
    try {
      visual = definition.buildVisual(initialValues);
    } catch (error) {
      return fail(
        `Bildet kunne ikke tegnes for startverdiene: ${
          error instanceof Error ? error.message : 'ukjent feil'
        }`
      );
    }

    const visualResult = validateVisual(visual);
    if (visualResult.isFailure) {
      return Result.fail(visualResult.error);
    }

    if (definition.derive(initialValues).length === 0) {
      return fail('En utforskning må vise minst én utregnet størrelse.');
    }

    if (!definition.modelLatex(initialValues).trim()) {
      return fail('En utforskning må vise uttrykket for modellen.');
    }

    return Result.ok(
      new ExplorationLab(
        definition.id.trim(),
        definition.topic as Lk20Topic1T,
        definition.goalId.trim(),
        definition.skillLabel.trim(),
        definition.title.trim(),
        definition.bigQuestion.trim(),
        definition.description.trim(),
        Object.freeze(parameters),
        Object.freeze(claims),
        Object.freeze(missions),
        definition.insight.trim(),
        definition.animatedParameterId,
        definition.buildVisual,
        definition.derive,
        definition.modelLatex
      )
    );
  }

  public get initialValues(): ExplorationValues {
    const values: Record<string, number> = {};
    for (const parameter of this.parameters) {
      values[parameter.id] = parameter.initial;
    }
    return Object.freeze(values);
  }

  public parameter(id: string): ExplorationParameter | undefined {
    return this.parameters.find((parameter) => parameter.id === id);
  }

  public mission(id: string): ExplorationMission | undefined {
    return this.missions.find((mission) => mission.id === id);
  }

  public claim(id: string): ExplorationClaim | undefined {
    return this.claims.find((claim) => claim.id === id);
  }

  public visualFor(values: ExplorationValues): StepVisual {
    try {
      return this.visualBuilder(values);
    } catch {
      return { kind: 'none' };
    }
  }

  public readoutsFor(values: ExplorationValues): readonly DerivedReadout[] {
    try {
      return this.deriver(values);
    } catch {
      return [];
    }
  }

  public modelFor(values: ExplorationValues): string {
    try {
      return this.modelBuilder(values);
    } catch {
      return '';
    }
  }
}
