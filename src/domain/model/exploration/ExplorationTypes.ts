import { StepVisual, VisualTone } from '../guided/value-objects/StepVisual.js';

/** Gjeldende verdi for hver parameter i en utforskning, nøkkel = parameter-id. */
export type ExplorationValues = Readonly<Record<string, number>>;

export interface ExplorationParameterDefinition {
  readonly id: string;
  /** Navnet eleven ser ved glidebryteren. */
  readonly label: string;
  /** Hva parameteren styrer, i én kort setning. */
  readonly meaning: string;
  readonly min: number;
  readonly max: number;
  readonly step: number;
  readonly initial: number;
}

/** En utregnet størrelse som oppdateres mens eleven drar i glidebryterne. */
export interface DerivedReadout {
  readonly id: string;
  readonly label: string;
  /** Verdien som LaTeX eller kort tekst. */
  readonly value: string;
  readonly tone?: VisualTone;
}

export interface ExplorationClaimDefinition {
  readonly id: string;
  /** Påstanden eleven skal vurdere. */
  readonly text: string;
  readonly isTrue: boolean;
  /** Hvorfor påstanden holder eller ikke. Vises straks eleven har svart. */
  readonly explanation: string;
}

export interface ExplorationMissionDefinition {
  readonly id: string;
  /** Oppdraget eleven skal få til ved å endre parameterne. */
  readonly prompt: string;
  readonly hint: string;
  /** Vises når oppdraget er løst. */
  readonly successMessage: string;
  /** Sjekkes mot gjeldende parameterverdier hver gang noe endres. */
  readonly isAccomplished: (values: ExplorationValues) => boolean;
}

export interface ExplorationLabDefinition {
  readonly id: string;
  readonly topic: string;
  readonly goalId: string;
  readonly skillLabel: string;
  readonly title: string;
  /** Det store spørsmålet utforskningen handler om. */
  readonly bigQuestion: string;
  readonly description: string;
  readonly parameters: readonly ExplorationParameterDefinition[];
  /** Bildet som tegnes for gjeldende verdier. */
  readonly buildVisual: (values: ExplorationValues) => StepVisual;
  /** Tallene som vises ved siden av bildet. */
  readonly derive: (values: ExplorationValues) => readonly DerivedReadout[];
  /** Uttrykket som beskriver modellen, for gjeldende verdier. */
  readonly modelLatex: (values: ExplorationValues) => string;
  readonly claims: readonly ExplorationClaimDefinition[];
  readonly missions: readonly ExplorationMissionDefinition[];
  /** Innsikten eleven skal ta med seg. */
  readonly insight: string;
  /** Parameteren som kan animeres, om noen. */
  readonly animatedParameterId?: string;
}
