import { Result } from '../../../shared/Result.js';
import { createTaskError, TaskError } from '../errors/TaskError.js';

export class LatexDescription {
  private constructor(public readonly rawLatex: string) {}

  public static create(latex: string): Result<LatexDescription, TaskError> {
    const trimmed = latex?.trim();
    if (!trimmed) {
      return Result.fail(
        createTaskError('INVALID_LATEX', 'LaTeX-beskrivelse kan ikke være tom.')
      );
    }

    // Enkel sjekk på balanserte math-delimitere ($)
    const dollarCount = (trimmed.match(/\$/g) || []).length;
    if (dollarCount % 2 !== 0) {
      return Result.fail(
        createTaskError(
          'INVALID_LATEX',
          'Ubalanserte math-delimitere ($) i LaTeX-beskrivelsen.'
        )
      );
    }

    return Result.ok(new LatexDescription(trimmed));
  }
}

