import { Result } from '../shared/Result.js';
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

    // Sjekk om kunden svarte kun x = 2 på x^2 = 4 (mangler -2)
    if (
      (normExp.includes('\\pm') || normExp.includes('x=\\pm') || normExp.includes('2')) &&
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

    return undefined;
  }
}

// Importer Task for å bruke defaultEvaluator som fallback
import { Task } from '../model/task/Task.js';
