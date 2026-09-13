import { Task } from '../model/task/Task.js';
import { Hint } from '../model/task/Hint.js';

export class HintGeneratorService {
  /**
   * Genererer eller henter tilgjengelige hint for en gitt oppgave basert på løsningsstegene.
   */
  public static getHintsForTask(task: Task): Hint[] {
    const hints: Hint[] = [];

    // Hint 1: Generell overskrift / innfallsvinkel
    hints.push(
      Hint.create(
        1,
        'Innfallsvinkel & Første steg',
        `Start med å lese oppgaven nøyaktig. Første steg er: ${task.solutionSteps[0]?.title ?? 'Identifiser hva som er gitt.'}`
      )
    );

    // Hint 2: Nærmere detalj om første steg
    if (task.solutionSteps.length > 0) {
      const step = task.solutionSteps[0];
      const cleanFormula = step.formulaLatex?.replace(/^\$+|\$+$/g, '').trim();
      hints.push(
        Hint.create(
          2,
          `Steg 1: ${step.title}`,
          `${step.latexExplanation}${cleanFormula ? `\n\n$$${cleanFormula}$$` : ''}`
        )
      );
    }

    // Hint 3: Videre framgangsmåte
    if (task.solutionSteps.length > 1) {
      const step = task.solutionSteps[1];
      const cleanFormula = step.formulaLatex?.replace(/^\$+|\$+$/g, '').trim();
      hints.push(
        Hint.create(
          3,
          `Steg 2: ${step.title}`,
          `${step.latexExplanation}${cleanFormula ? `\n\n$$${cleanFormula}$$` : ''}`
        )
      );
    }

    return hints;
  }
}
