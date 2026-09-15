import { Result } from '../../../shared/Result.js';
import { createGuidedError, GuidedError } from '../errors/GuidedError.js';

/**
 * Semantisk fargetone for en visuell markering. Domenet beskriver *betydningen*
 * (dette er svaret, dette er en typisk feil), mens UI-laget bestemmer fargekoden.
 */
export type VisualTone = 'primary' | 'accent' | 'correct' | 'error' | 'muted';

export interface GraphCurve {
  /** 'polynomial' tolker koeffisientene som $c_0 + c_1x + c_2x^2 + \ldots$ */
  readonly kind: 'polynomial' | 'exponential';
  /** polynomial: koeffisienter fra konstantledd og oppover. exponential: $[a, b]$ i $a\cdot b^x$. */
  readonly coefficients: readonly number[];
  readonly tone: VisualTone;
  readonly label?: string;
  /** Tangentlinje i dette x-punktet (brukes i derivasjon). */
  readonly tangentAtX?: number;
}

export interface GraphMarker {
  readonly x: number;
  readonly y: number;
  readonly label: string;
  readonly tone: VisualTone;
}

export interface NumberLinePoint {
  readonly value: number;
  readonly label: string;
  readonly tone: VisualTone;
  /** Åpen sirkel brukes for verdier som *ikke* er med i løsningsmengden. */
  readonly open?: boolean;
}

export interface NumberLineInterval {
  readonly from: number;
  readonly to: number;
  readonly label: string;
  readonly tone: VisualTone;
}

export interface BalancePan {
  readonly terms: readonly string[];
}

export interface AreaModelPart {
  readonly rowLabel: string;
  readonly columnLabel: string;
  readonly productLatex: string;
  readonly tone: VisualTone;
}

export interface BarDatum {
  readonly label: string;
  readonly value: number;
  readonly tone: VisualTone;
}

export type StepVisual =
  | { readonly kind: 'none' }
  | {
      readonly kind: 'graph';
      readonly curves: readonly GraphCurve[];
      readonly markers?: readonly GraphMarker[];
      readonly xRange: readonly [number, number];
      readonly caption: string;
    }
  | {
      readonly kind: 'numberline';
      readonly min: number;
      readonly max: number;
      readonly points?: readonly NumberLinePoint[];
      readonly intervals?: readonly NumberLineInterval[];
      readonly caption: string;
    }
  | {
      readonly kind: 'balance';
      readonly left: BalancePan;
      readonly right: BalancePan;
      readonly caption: string;
    }
  | {
      readonly kind: 'areaModel';
      readonly rowLabels: readonly string[];
      readonly columnLabels: readonly string[];
      readonly parts: readonly AreaModelPart[];
      readonly caption: string;
    }
  | {
      readonly kind: 'triangle';
      readonly angleDegrees: number;
      readonly adjacentLabel: string;
      readonly oppositeLabel: string;
      readonly hypotenuseLabel: string;
      readonly highlight: 'sin' | 'cos' | 'tan' | 'pythagoras';
      readonly caption: string;
    }
  | {
      readonly kind: 'growth';
      readonly startValue: number;
      readonly growthFactor: number;
      readonly periods: number;
      readonly highlightPeriod?: number;
      readonly caption: string;
    }
  | {
      readonly kind: 'bars';
      readonly bars: readonly BarDatum[];
      readonly caption: string;
    };

export const noVisual: StepVisual = { kind: 'none' };

/**
 * Regner ut funksjonsverdien til en kurve i et punkt.
 * Holdes i domenet slik at både grafrendring og tester bruker samme sannhet.
 */
export function evaluateCurve(curve: GraphCurve, x: number): number {
  if (curve.kind === 'exponential') {
    const [factor = 1, base = 1] = curve.coefficients;
    return factor * base ** x;
  }

  return curve.coefficients.reduce(
    (sum, coefficient, exponent) => sum + coefficient * x ** exponent,
    0
  );
}

/**
 * Den deriverte til en kurve i et punkt. Brukes til å tegne tangenter.
 */
export function evaluateCurveSlope(curve: GraphCurve, x: number): number {
  if (curve.kind === 'exponential') {
    const [factor = 1, base = 1] = curve.coefficients;
    return base <= 0 ? 0 : factor * base ** x * Math.log(base);
  }

  return curve.coefficients.reduce(
    (sum, coefficient, exponent) => (exponent === 0 ? sum : sum + exponent * coefficient * x ** (exponent - 1)),
    0
  );
}

/**
 * Validerer at en visuell spesifikasjon er mulig å tegne.
 * Dette hindrer at innholdsbanken får visuals som kollapser i UI.
 */
export function validateVisual(visual: StepVisual): Result<StepVisual, GuidedError> {
  const fail = (message: string) =>
    Result.fail<GuidedError, StepVisual>(createGuidedError('INVALID_VISUAL', message, { kind: visual.kind }));

  switch (visual.kind) {
    case 'none':
      return Result.ok(visual);

    case 'graph': {
      if (visual.curves.length === 0) {
        return fail('En graf må ha minst én kurve.');
      }
      if (visual.curves.some((curve) => curve.coefficients.length === 0)) {
        return fail('En kurve må ha minst én koeffisient.');
      }
      const [xMin, xMax] = visual.xRange;
      if (xMin >= xMax) {
        return fail('x-intervallet må ha en nedre grense som er mindre enn den øvre.');
      }
      return Result.ok(visual);
    }

    case 'numberline': {
      if (visual.min >= visual.max) {
        return fail('Tallinjen må ha en nedre grense som er mindre enn den øvre.');
      }
      if ((visual.points?.length ?? 0) === 0 && (visual.intervals?.length ?? 0) === 0) {
        return fail('Tallinjen må markere minst ett punkt eller ett intervall.');
      }
      const outOfRange = [
        ...(visual.points ?? []).map((point) => point.value),
        ...(visual.intervals ?? []).flatMap((interval) => [interval.from, interval.to]),
      ].some((value) => value < visual.min || value > visual.max);
      if (outOfRange) {
        return fail('Alle markeringer på tallinjen må ligge innenfor min og max.');
      }
      return Result.ok(visual);
    }

    case 'balance': {
      if (visual.left.terms.length === 0 || visual.right.terms.length === 0) {
        return fail('Begge vektskålene må ha minst ett ledd.');
      }
      return Result.ok(visual);
    }

    case 'areaModel': {
      if (visual.rowLabels.length === 0 || visual.columnLabels.length === 0) {
        return fail('Arealmodellen må ha minst én rad og én kolonne.');
      }
      if (visual.parts.length !== visual.rowLabels.length * visual.columnLabels.length) {
        return fail('Arealmodellen må ha én rute per rad-kolonne-kombinasjon.');
      }
      return Result.ok(visual);
    }

    case 'triangle': {
      if (visual.angleDegrees <= 0 || visual.angleDegrees >= 90) {
        return fail('Vinkelen i en rettvinklet trekant må ligge strengt mellom 0 og 90 grader.');
      }
      return Result.ok(visual);
    }

    case 'growth': {
      if (visual.periods < 1) {
        return fail('En vekstmodell må ha minst én periode.');
      }
      if (visual.growthFactor <= 0) {
        return fail('Vekstfaktoren må være positiv.');
      }
      if (visual.highlightPeriod !== undefined && (visual.highlightPeriod < 0 || visual.highlightPeriod > visual.periods)) {
        return fail('Perioden som markeres må ligge innenfor modellens perioder.');
      }
      return Result.ok(visual);
    }

    case 'bars': {
      if (visual.bars.length === 0) {
        return fail('Et stolpediagram må ha minst én stolpe.');
      }
      if (visual.bars.some((bar) => bar.value < 0)) {
        return fail('Stolpeverdier kan ikke være negative.');
      }
      return Result.ok(visual);
    }
  }
}
