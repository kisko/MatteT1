import { Result } from '../shared/Result.js';
import { Task } from '../model/task/Task.js';
import { StudentAnswer, AnswerValue } from '../model/task/value-objects/StudentAnswer.js';
import { EvaluationResult } from '../model/task/value-objects/EvaluationResult.js';
import { TaskError } from '../model/task/errors/TaskError.js';
import { Misconception, MisconceptionType, createMisconception } from '../model/task/Misconception.js';
import { AlgebraEvaluatorService } from './AlgebraEvaluatorService.js';

export interface ExtendedEvaluationResult {
  readonly result: EvaluationResult;
  readonly misconception?: Misconception;
}

export class TaskEvaluatorService {
  /**
   * Evaluerer et elevsvar og utfører misoppfatningsanalyse dersom svaret er feil.
   */
  public static evaluateWithAnalysis(
    expected: AnswerValue,
    submittedAnswer: StudentAnswer
  ): Result<ExtendedEvaluationResult, TaskError> {
    const actual = submittedAnswer.value;

    if (expected.type !== actual.type) {
      return Result.ok({
        result: EvaluationResult.incorrect(
          `Svartype (${actual.type}) stemmer ikke overens med forventet type (${expected.type}).`
        ),
      });
    }

    if (expected.type === 'expression') {
      if (actual.type !== 'expression') {
        return Result.ok({
          result: EvaluationResult.incorrect(
            `Forventet et uttrykk, men fikk type '${actual.type}'.`
          ),
        });
      }

      const expectedLatex = expected.latex;
      const submittedLatex = actual.latex;

      const isEquiv = AlgebraEvaluatorService.areEquivalent(expectedLatex, submittedLatex);

      if (isEquiv) {
        return Result.ok({
          result: EvaluationResult.correct('Korrekt matematisk svar! Flott jobbet.'),
        });
      }

      // Sjekk etter vanlige misoppfatninger (Misconception Analysis)
      const misconception = this.detectMisconception(expectedLatex, submittedLatex);

      let feedback = `Svaret $${submittedLatex}$ er ikke korrekt ennå. Sjekk uttrykket steg for steg og prøv igjen.`;
      if (misconception) {
        feedback += ` **Pedagogisk hint:** ${misconception.title} - ${misconception.tipLatex}`;
      }

      return Result.ok({
        result: EvaluationResult.incorrect(feedback),
        misconception,
      });
    }

    if (expected.type === 'numeric') {
      if (actual.type !== 'numeric') {
        return Result.ok({
          result: EvaluationResult.incorrect(
            `Forventet et talssvar, men fikk type '${actual.type}'.`
          ),
        });
      }

      const submittedNum = actual.value;
      const tolerance = expected.tolerance ?? 0.001;
      const diff = Math.abs(expected.value - submittedNum);

      if (diff <= tolerance) {
        return Result.ok({
          result: EvaluationResult.correct('Riktig svar!'),
        });
      }

      // Sjekk om eleven glemte negativ rot eller gjorde fortegnsfeil
      let misconception: Misconception | undefined;
      if (Math.abs(submittedNum + expected.value) <= tolerance) {
        misconception = createMisconception(
          MisconceptionType.SIGN_ERROR,
          'Fortegnsfeil registrert',
          'Svaret ditt har feil fortegn (motsatt verdi av fasit).',
          'Sjekk om du har glemt å skifte fortegn når du flyttet ledd over likhetstegnet!'
        );
      }

      return Result.ok({
        result: EvaluationResult.incorrect(
          misconception
            ? `Nesten! Du fikk ${submittedNum}, men fasit er ${expected.value}. ${misconception.tipLatex}`
            : `Feil svar. Kontroller regneoperasjonene, fortegnene og om du har svart på det oppgaven faktisk spør etter. Prøv igjen.`
        ),
        misconception,
      });
    }

    // Default fallback
    const fallbackEval = Task.defaultEvaluator(expected, submittedAnswer);
    if (fallbackEval.isSuccess) {
      return Result.ok({
        result: fallbackEval.value,
      });
    }
    return Result.fail(fallbackEval.error);
  }

  private static detectMisconception(
    expectedLatex: string,
    submittedLatex: string
  ): Misconception | undefined {
    const normSub = submittedLatex.replace(/\s+/g, '');
    const normExp = expectedLatex.replace(/\s+/g, '');

    // Sjekk for (a+b)^2 = a^2 + b^2 feil
    if (normSub.includes('a^2+b^2') || normSub.includes('x^2+y^2') || normSub.includes('x^2+9')) {
      if (normExp.includes('2xy') || normExp.includes('6x') || normExp.includes('2ab')) {
        return createMisconception(
          MisconceptionType.BRACKET_EXPANSION_ERROR,
          'Kvadratsetningsfeil',
          'Husk at $(a+b)^2 = a^2 + 2ab + b^2$, ikke $a^2 + b^2$.',
          'Du må huske det doble produktet $2ab$ når du kvadrerer en parentes!'
        );
      }
    }

    // Sjekk om eleven svarte kun x = c på x^2 = c (mangler \pm eller negativ rot)
    if (
      (normExp.includes('\\pm') || normExp.includes('x=\\pm') || normExp.includes('x=\\pm\\sqrt')) &&
      !normSub.includes('\\pm') &&
      !normSub.includes('-')
    ) {
      return createMisconception(
        MisconceptionType.FORGOT_NEGATIVE_ROOT,
        'Glemt negativ rot',
        'Når du tar kvadratroten på begge sider av en likning som $x^2 = c$, får du både en positiv og en negativ løsning.',
        'Husk at $x = \\pm \\sqrt{c}$, altså har likningen to løsninger!'
      );
    }

    // Sjekk for potensregelfeil (x^a * x^b = x^(a*b))
    if (
      (normSub.includes('x^6') && normExp.includes('x^5')) ||
      (normSub.includes('a^6') && normExp.includes('a^5')) ||
      (normSub.includes('x^8') && normExp.includes('x^6'))
    ) {
      return createMisconception(
        MisconceptionType.EXPONENT_RULE_ERROR,
        'Feil potensregel',
        'Når du multipliserer potenser med samme grunntall skal du addere eksponentene: $a^m \\cdot a^n = a^{m+n}$.',
        'Ikke multipliser eksponentene når grunntallene ganges sammen! Eksponentene skal legges sammen.'
      );
    }

    // Sjekk for derivasjon av potens (glemte koeffisient n eller trakk ikke fra 1)
    if (
      (normExp.includes('3x^2') && normSub.includes('x^2')) ||
      (normExp.includes('2x') && normSub.includes('x')) ||
      (normExp.includes('4x^3') && normSub.includes('x^3'))
    ) {
      return createMisconception(
        MisconceptionType.DERIVATIVE_POWER_RULE,
        'Potensregel for derivasjon',
        'Husk potensregelen ved derivasjon: $(x^n)\\prime = n \\cdot x^{n-1}$.',
        'Du må multiplisere med den opprinnelige eksponenten foran x-leddet!'
      );
    }

    // Sjekk for logaritmeregel-feil
    if (
      (normSub.includes('\\lg(a)\\cdot\\lg(b)') || normSub.includes('\\lg(a)\\lg(b)')) &&
      normExp.includes('\\lg(a)+\\lg(b)')
    ) {
      return createMisconception(
        MisconceptionType.LOGARITHM_RULE_ERROR,
        'Logaritme for produkt',
        'Logaritmen til et produkt er summen av logaritmene: $\\lg(a \\cdot b) = \\lg(a) + \\lg(b)$.',
        'Ikke gang logaritmene sammen; legg dem sammen!'
      );
    }

    return undefined;
  }
}

