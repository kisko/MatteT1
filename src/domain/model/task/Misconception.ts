export enum MisconceptionType {
  SIGN_ERROR = 'SIGN_ERROR',                     // Fortegnsfeil
  BRACKET_EXPANSION_ERROR = 'BRACKET_EXPANSION', // Feil ved utvidelse av parentes (a+b)^2 = a^2+b^2
  FORGOT_NEGATIVE_ROOT = 'FORGOT_NEGATIVE_ROOT', // Glemte pluss/minus ved kvadratrot
  FRACTION_ADDITION = 'FRACTION_ADDITION',       // La sammen tellere og nevnere direkte
  EXPONENT_RULE_ERROR = 'EXPONENT_RULE',         // Feil potensregel (x^a * x^b = x^(a*b))
  DERIVATIVE_POWER_RULE = 'DERIVATIVE_POWER_RULE',// Feil ved derivasjon av x^n
  LOGARITHM_RULE_ERROR = 'LOGARITHM_RULE_ERROR', // Feil ved logaritmeregler lg(a*b) / lg(a+b)
  NONE = 'NONE',
}

export interface Misconception {
  readonly type: MisconceptionType;
  readonly title: string;
  readonly descriptionLatex: string;
  readonly tipLatex: string;
}

export function createMisconception(
  type: MisconceptionType,
  title: string,
  descriptionLatex: string,
  tipLatex: string
): Misconception {
  return { type, title, descriptionLatex, tipLatex };
}
