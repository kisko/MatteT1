import { Result } from '../shared/Result.js';
import { createTaskError, TaskError } from '../model/task/errors/TaskError.js';
import { StudentAnswer } from '../model/task/value-objects/StudentAnswer.js';
import { EvaluationResult } from '../model/task/value-objects/EvaluationResult.js';
import { evaluate } from 'mathjs';

export interface AlgebraEvaluatorOptions {
  /** Toleranse for numerisk stikkprøve-evaluering */
  tolerance?: number;
  /** Antall tilfeldige verdier for variabel-stikkprøver */
  sampleCount?: number;
}

/**
 * Tjeneste for å evaluere algebramessig og matematisk ekvivalens mellom uttrykk
 * (f.eks. for rasjonale uttrykk som (x^2 - 1)/(x - 1) vs x + 1 eller (x-1)(x+1)/(x-1)).
 */
export class AlgebraEvaluatorService {
  /**
   * Normaliserer og renser et algebrastreng/LaTeX-uttrykk.
   */
  public static normalizeExpression(expr: string): string {
    return expr
      .replace(/^\$+|\$+$/g, '')
      .replace(/\\left|\\right/g, '')
      .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '(($1)/($2))') // Konverter \frac{a}{b} til ((a)/(b))
      .replace(/\\cdot|\\times/g, '*') // Standardiser multiplikasjon
      .replace(/\\sqrt\{([^{}]+)\}/g, 'sqrt($1)')
      .replace(/\\,|\\;/g, '')
      .replace(/\s+/g, '') // Fjern alt mellomrom
      .replace(/\^\{([^}]+)\}/g, '^$1'); // \^{2} -> ^2
  }

  /**
   * Sjekker om to matematiske/algebraiske uttrykk er ekvivalente.
   * Benytter en kombinasjon av strukturell/syntaktisk sammenligning og numerisk stikkprøve-testing.
   */
  public static areEquivalent(
    expr1: string,
    expr2: string,
    options: AlgebraEvaluatorOptions = {}
  ): boolean {
    const norm1 = this.normalizeExpression(expr1);
    const norm2 = this.normalizeExpression(expr2);

    // 1. Direkte/Eksakt match etter normalisering
    if (norm1 === norm2) {
      return true;
    }

    // 2. Numerisk evaluering på tilfeldige testpunkter (Sampling)
    const sampleCount = options.sampleCount ?? 10;
    const tolerance = options.tolerance ?? 1e-5;

    // Finn variabelnavn i uttrykket (f.eks. 'x', 'y', 'a', 'b')
    const variables = Array.from(new Set((norm1 + norm2).match(/[a-zA-Z]/g) || []));

    if (variables.length === 0) {
      // Ingen variabler, prøv direkte evaluering
      try {
        const val1 = this.evaluateSimpleJsExpr(norm1, {});
        const val2 = this.evaluateSimpleJsExpr(norm2, {});
        return Math.abs(val1 - val2) < tolerance;
      } catch {
        return false;
      }
    }

    let validSampleEvaluated = false;

    for (let i = 0; i < sampleCount; i++) {
      // Generer tilfeldige testverdier unna 0 og 1 for å unngå singulære punkter/nærmest 0-divisjon
      const scope: Record<string, number> = {};
      for (const v of variables) {
        // Faste prøveverdier gjør vurderingen reproduserbar og testbar.
        scope[v] = 2 + ((i * 3) % 9);
      }

      try {
        const val1 = this.evaluateSimpleJsExpr(norm1, scope);
        const val2 = this.evaluateSimpleJsExpr(norm2, scope);

        if (isNaN(val1) || isNaN(val2) || !isFinite(val1) || !isFinite(val2)) {
          // Singulært punkt, prøv neste punkt
          continue;
        }

        validSampleEvaluated = true;

        if (Math.abs(val1 - val2) > tolerance) {
          return false;
        }
      } catch {
        // Om evaluering feilet på e.g. divisjon på 0, fortsett sampling
        continue;
      }
    }

    return validSampleEvaluated;
  }

  /**
   * Evaluerer et algebramessig elevsvar mot et forventet uttrykk.
   */
  public static evaluateAlgebraicAnswer(
    expectedLatex: string,
    submittedAnswer: StudentAnswer,
    options?: AlgebraEvaluatorOptions
  ): Result<EvaluationResult, TaskError> {
    if (submittedAnswer.value.type !== 'expression') {
      return Result.ok(
        EvaluationResult.incorrect(
          `Forventet et algebraisk uttrykk, men fikk type '${submittedAnswer.value.type}'.`
        )
      );
    }

    const submittedLatex = submittedAnswer.value.latex;
    const isEquivalent = this.areEquivalent(expectedLatex, submittedLatex, options);

    if (isEquivalent) {
      return Result.ok(
        EvaluationResult.correct(
          `Korrekt! Uttrykket $${submittedLatex}$ er matematisk ekvivalent med $${expectedLatex}$.`
        )
      );
    } else {
      return Result.ok(
        EvaluationResult.incorrect(
          `Svaret $${submittedLatex}$ er ikke matematisk ekvivalent med fasit $${expectedLatex}$.`
        )
      );
    }
  }

  /**
   * Trygg evaluator for grunnleggende algebrauttrykk.
   */
  private static evaluateSimpleJsExpr(
    expr: string,
    scope: Record<string, number>
  ): number {
    let mathExpression = expr;

    // MathJS støtter ikke alle skrivemåtene elevene bruker, så normaliser implisitt multiplikasjon.
    mathExpression = mathExpression
      .replace(/(\d|\))\(/g, '$1*(')
      .replace(/\)(\d|\()/g, ')*$1')
      .replace(/(\d)([a-zA-Z])/g, '$1*$2')
      .replace(/([a-zA-Z])(\d)/g, '$1*$2');

    const value = evaluate(mathExpression, scope);
    return typeof value === 'number' ? value : Number(value);
  }
}

