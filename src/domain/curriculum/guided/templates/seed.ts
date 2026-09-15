import { MisconceptionType } from '../../../model/task/Misconception.js';
import { StepOptionDefinition } from '../../../model/guided/GuidedWalkthrough.js';

/**
 * Deterministiske hjelpere for oppgavemalene.
 *
 * Alt er rene funksjoner av (frø, salt). Ingen Math.random: samme frø må gi
 * samme oppgave hver gang, ellers kan ikke en variant testes, deles eller
 * gjenskapes når en elev spør «hvorfor ble dette feil?».
 */

/** Heltallshash (xorshift-multiplikasjon). Gir god spredning for små frø. */
export const hashSeed = (seed: number, salt: number): number => {
  let value = (Math.trunc(seed) * 2654435761 + Math.trunc(salt) * 40503 + 0x9e3779b9) >>> 0;
  value ^= value >>> 15;
  value = (value * 2246822519) >>> 0;
  value ^= value >>> 13;
  value = (value * 3266489917) >>> 0;
  value ^= value >>> 16;
  return value >>> 0;
};

/** Heltall i [min, max], begge inklusive. */
export const intBetween = (seed: number, salt: number, min: number, max: number): number => {
  if (max <= min) return min;
  return min + (hashSeed(seed, salt) % (max - min + 1));
};

/** Heltall i [min, max] som ikke er 0. Brukes for koeffisienter. */
export const nonZeroIntBetween = (seed: number, salt: number, min: number, max: number): number => {
  const value = intBetween(seed, salt, min, max);
  if (value !== 0) return value;
  return max > 0 ? max : min;
};

export const pickFrom = <T>(seed: number, salt: number, values: readonly T[]): T =>
  values[hashSeed(seed, salt) % values.length];

/** Trekker en verdi som er ulik `avoid`. Hindrer distraktører som er lik fasit. */
export const pickAvoiding = <T>(
  seed: number,
  salt: number,
  values: readonly T[],
  avoid: readonly T[]
): T => {
  const allowed = values.filter((value) => !avoid.includes(value));
  if (allowed.length === 0) return values[0];
  return allowed[hashSeed(seed, salt) % allowed.length];
};

// -------------------------------------------------------------- LaTeX-format

/**
 * Tall uten flytende 0.30000000000000004.
 *
 * Desimalskilletegnet er punktum, slik som i resten av innholdet i appen.
 * Tallet må kunne stå både inne i $...$ og i vanlig tekst, og LaTeX-varianten
 * `0{,}3` ville blitt vist bokstavelig utenfor matematikkmodus.
 */
export const num = (value: number, decimals = 2): string => {
  if (!Number.isFinite(value)) return '0';
  const rounded = Number(value.toFixed(decimals));
  return String(rounded);
};

/** Fortegnet som operator: 4 -> '+ 4', -4 -> '- 4'. */
export const signed = (value: number, decimals = 2): string =>
  `${value < 0 ? '-' : '+'} ${num(Math.abs(value), decimals)}`;

/** Ledd med variabel: (3, 'x') -> '3x', (1, 'x') -> 'x', (-1, 'x') -> '-x'. */
export const term = (coefficient: number, variable: string): string => {
  if (coefficient === 1) return variable;
  if (coefficient === -1) return `-${variable}`;
  return `${num(coefficient)}${variable}`;
};

/**
 * Ledd som følger etter et annet: (3, 'x') -> '+ 3x', (1, 'x') -> '+ x'.
 * Krever en variabel. For rene tall, bruk signedNumber – ellers forsvinner
 * koeffisienten 1 og etterlater «+ » i uttrykket.
 */
export const signedTerm = (coefficient: number, variable: string): string => {
  const sign = coefficient < 0 ? '-' : '+';
  const size = Math.abs(coefficient);
  return `${sign} ${size === 1 ? variable : `${num(size)}${variable}`}`;
};

/** Konstantledd som følger etter et annet: 4 -> '+ 4', -1 -> '- 1'. */
export const signedNumber = (value: number, decimals = 2): string =>
  `${value < 0 ? '-' : '+'} ${num(Math.abs(value), decimals)}`;

export const frac = (numerator: string | number, denominator: string | number): string =>
  `\\frac{${numerator}}{${denominator}}`;

/** Største felles divisor. Brukes til å forkorte brøker i fasit. */
export const gcd = (a: number, b: number): number => {
  let first = Math.abs(a);
  let second = Math.abs(b);
  while (second !== 0) {
    [first, second] = [second, first % second];
  }
  return first || 1;
};

/** Forkortet brøk som LaTeX, eller heltallet om brøken går opp. */
export const reducedFraction = (numerator: number, denominator: number): string => {
  if (denominator === 0) return '0';
  if (numerator % denominator === 0) return num(numerator / denominator);
  const divisor = gcd(numerator, denominator);
  const top = numerator / divisor;
  const bottom = denominator / divisor;
  return bottom < 0 ? frac(-top, -bottom) : frac(top, bottom);
};

export const factorial = (value: number): number => {
  let result = 1;
  for (let index = 2; index <= value; index += 1) {
    result *= index;
  }
  return result;
};

/** Antall måter å velge k av n når rekkefølgen ikke betyr noe. */
export const binomial = (n: number, k: number): number => {
  if (k < 0 || k > n) return 0;
  let result = 1;
  for (let index = 1; index <= k; index += 1) {
    result = (result * (n - k + index)) / index;
  }
  return Math.round(result);
};

/** Antall måter å velge k av n når rekkefølgen betyr noe. */
export const ordered = (n: number, k: number): number => binomial(n, k) * factorial(k);

// ----------------------------------------------------- Alternativ-byggere

export const right = (id: string, latex: string, feedback: string): StepOptionDefinition => ({
  id,
  latex,
  isCorrect: true,
  feedback,
});

export const wrong = (
  id: string,
  latex: string,
  feedback: string,
  misconceptionType?: MisconceptionType
): StepOptionDefinition => ({ id, latex, feedback, misconceptionType });

/**
 * Fjerner distraktører som ved uhell ble identiske med fasit, eller med
 * hverandre. Med genererte tall kan to ulike feil gi samme uttrykk, og da må
 * duplikatet vekk – ellers står eleven med to «riktige» alternativer.
 */
export const distinctOptions = (
  correct: StepOptionDefinition,
  candidates: readonly StepOptionDefinition[],
  fallbacks: readonly StepOptionDefinition[] = []
): StepOptionDefinition[] => {
  const normalise = (latex: string) => latex.replace(/\s+/g, '');
  const seen = new Set<string>([normalise(correct.latex)]);
  const options: StepOptionDefinition[] = [correct];

  for (const candidate of [...candidates, ...fallbacks]) {
    const key = normalise(candidate.latex);
    if (seen.has(key)) continue;
    seen.add(key);
    options.push(candidate);
  }

  return options;
};
