import { Result } from '../../../shared/Result.js';
import { createTaskError, TaskError } from '../errors/TaskError.js';

export type AnswerValue =
  | { type: 'numeric'; value: number; tolerance?: number; precision?: number }
  | { type: 'expression'; latex: string }
  | { type: 'multipleChoice'; selectedOptionIndex: number; options?: string[] }
  | { type: 'text'; text: string };

export class StudentAnswer {
  private constructor(public readonly value: AnswerValue) {}

  public static create(value: AnswerValue): Result<StudentAnswer, TaskError> {
    if (!value) {
      return Result.fail(createTaskError('EMPTY_ANSWER', 'Svarobjektet må spesifiseres.'));
    }

    if (value.type === 'numeric' && (isNaN(value.value) || !isFinite(value.value))) {
      return Result.fail(createTaskError('EMPTY_ANSWER', 'Ugyldig numerisk svar.'));
    }

    if (value.type === 'expression' && (!value.latex || value.latex.trim().length === 0)) {
      return Result.fail(
        createTaskError('EMPTY_ANSWER', 'Uttrykket i svaret kan ikke være tomt.')
      );
    }

    if (value.type === 'text' && (!value.text || value.text.trim().length === 0)) {
      return Result.fail(createTaskError('EMPTY_ANSWER', 'Tekstsvaret kan ikke være tomt.'));
    }

    return Result.ok(new StudentAnswer(value));
  }
}

