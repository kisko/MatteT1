export enum MisconceptionType {
  SIGN_ERROR = 'SIGN_ERROR',                     // Fortegnsfeil
  BRACKET_EXPANSION_ERROR = 'BRACKET_EXPANSION', // Feil ved utvidelse av parentes (a+b)^2 = a^2+b^2
  FORGOT_NEGATIVE_ROOT = 'FORGOT_NEGATIVE_ROOT', // Glemte pluss/minus ved kvadratrot
  FRACTION_ADDITION = 'FRACTION_ADDITION',       // La sammen tellere og nevnere direkte
  EXPONENT_RULE_ERROR = 'EXPONENT_RULE',         // Feil potensregel (x^a * x^b = x^(a*b))
  DERIVATIVE_POWER_RULE = 'DERIVATIVE_POWER_RULE',// Feil ved derivasjon av x^n
  LOGARITHM_RULE_ERROR = 'LOGARITHM_RULE_ERROR', // Feil ved logaritmeregler lg(a*b) / lg(a+b)
  TRIG_RATIO_MIXUP = 'TRIG_RATIO_MIXUP',         // Byttet om sinus, cosinus og tangens
  UNIT_INTERPRETATION_ERROR = 'UNIT_INTERPRETATION',// Regnet riktig, men tolket svaret feil i situasjonen
  PROBABILITY_COMBINATION_ERROR = 'PROBABILITY_COMBINATION', // La sammen sannsynligheter som skulle ganges
  COMBINATORICS_ORDER_ERROR = 'COMBINATORICS_ORDER',         // Tok med rekkefølgen når den ikke betyr noe (eller omvendt)
  NONE = 'NONE',
}

export interface Misconception {
  readonly type: MisconceptionType;
  readonly title: string;
  readonly descriptionLatex: string;
  readonly tipLatex: string;
}

export const MISCONCEPTION_INFO: Record<
  Exclude<MisconceptionType, MisconceptionType.NONE>,
  { title: string; tip: string; defaultTopic: string }
> = {
  [MisconceptionType.SIGN_ERROR]: {
    title: 'Fortegnsfeil',
    tip: 'Pass ekstra på fortegnsregler når ledd flyttes over likhetstegnet eller ved minus foran parentes.',
    defaultTopic: 'TALL_OG_ALGEBRA',
  },
  [MisconceptionType.BRACKET_EXPANSION_ERROR]: {
    title: 'Kvadratsetningsfeil',
    tip: 'Husk det doble produktet $2ab$ når du regner ut $(a+b)^2 = a^2 + 2ab + b^2$.',
    defaultTopic: 'TALL_OG_ALGEBRA',
  },
  [MisconceptionType.FORGOT_NEGATIVE_ROOT]: {
    title: 'Glemt negativ rot',
    tip: 'Husk at $x^2 = c$ har to reelle løsninger: $x = \\pm \\sqrt{c}$ når $c > 0$.',
    defaultTopic: 'LIGNINGER_OG_ULIKHETER',
  },
  [MisconceptionType.FRACTION_ADDITION]: {
    title: 'Brøkregningsfeil',
    tip: 'Finn fellesnevner før du legger sammen eller trekker fra brøker.',
    defaultTopic: 'TALL_OG_ALGEBRA',
  },
  [MisconceptionType.EXPONENT_RULE_ERROR]: {
    title: 'Feil potensregel',
    tip: 'Ved multiplikasjon av potenser med samme grunntall skal eksponentene adderes: $a^m \\cdot a^n = a^{m+n}$.',
    defaultTopic: 'TALL_OG_ALGEBRA',
  },
  [MisconceptionType.DERIVATIVE_POWER_RULE]: {
    title: 'Potensregel ved derivasjon',
    tip: 'Multipliser med eksponenten og trekk 1 fra eksponenten: $(x^n)\\prime = n \\cdot x^{n-1}$.',
    defaultTopic: 'DERIVASJON_OG_VEKSTFART',
  },
  [MisconceptionType.LOGARITHM_RULE_ERROR]: {
    title: 'Feil logaritmeregel',
    tip: 'Logaritmen til et produkt er summen av logaritmene: $\\lg(a \\cdot b) = \\lg(a) + \\lg(b)$.',
    defaultTopic: 'TALL_OG_ALGEBRA',
  },
  [MisconceptionType.TRIG_RATIO_MIXUP]: {
    title: 'Byttet om trigonometrisk forhold',
    tip: 'Finn ut hvilke to sider du kjenner først, og velg forholdet etterpå: SOH-CAH-TOA.',
    defaultTopic: 'TRIGONOMETRI',
  },
  [MisconceptionType.UNIT_INTERPRETATION_ERROR]: {
    title: 'Svaret ble ikke tolket i situasjonen',
    tip: 'Skriv alltid svaret med enhet, og sjekk om tallet kan gi mening i den virkelige situasjonen.',
    defaultTopic: 'MODELLERING_OG_PROBLEMSLOYSING',
  },
  [MisconceptionType.PROBABILITY_COMBINATION_ERROR]: {
    title: 'La sammen i stedet for å gange',
    tip: 'Spør: skjer hendelsene *samtidig* (gang) eller er de *alternativer* (legg sammen)?',
    defaultTopic: 'SANNSYNLIGHET',
  },
  [MisconceptionType.COMBINATORICS_ORDER_ERROR]: {
    title: 'Rekkefølgen ble tatt med feil',
    tip: 'Spør alltid først: betyr rekkefølgen noe? Teller du utvalg, må du dele bort rekkefølgene.',
    defaultTopic: 'SANNSYNLIGHET',
  },
};

export function createMisconception(
  type: MisconceptionType,
  title: string,
  descriptionLatex: string,
  tipLatex: string
): Misconception {
  return { type, title, descriptionLatex, tipLatex };
}
