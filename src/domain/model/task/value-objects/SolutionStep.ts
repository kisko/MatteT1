import { Result } from '../../../shared/Result.js';
import { createTaskError, TaskError } from '../errors/TaskError.js';

export class SolutionStep {
  private constructor(
    public readonly stepNumber: number,
    public readonly title: string,
    public readonly latexExplanation: string,
    public readonly formulaLatex?: string
  ) {}

  public static create(
    stepNumber: number,
    title: string,
    latexExplanation: string,
    formulaLatex?: string
  ): Result<SolutionStep, TaskError> {
    if (stepNumber <= 0) {
      return Result.fail(
        createTaskError('INVALID_SOLUTION_STEPS', 'Stegnummer må være et positivt tall.')
      );
    }

    if (!title || title.trim().length === 0) {
      return Result.fail(
        createTaskError('INVALID_SOLUTION_STEPS', 'Tittel på løsningssteg kan ikke være tom.')
      );
    }

    if (!latexExplanation || latexExplanation.trim().length === 0) {
      return Result.fail(
        createTaskError('INVALID_SOLUTION_STEPS', 'Forklaring i løsningssteg kan ikke være tom.')
      );
    }

    return Result.ok(
      new SolutionStep(
        stepNumber,
        title.trim(),
        latexExplanation.trim(),
        formulaLatex?.trim()
      )
    );
  }
}

