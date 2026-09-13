import { Result } from '../../../shared/Result.js';
import { createTaskError, TaskError } from '../errors/TaskError.js';

export class Title {
  private constructor(public readonly value: string) {}

  public static create(value: string): Result<Title, TaskError> {
    const trimmed = value?.trim();
    if (!trimmed || trimmed.length < 3) {
      return Result.fail(
        createTaskError('INVALID_TITLE', 'Oppgavetittel må være minst 3 tegn lang.')
      );
    }
    if (trimmed.length > 150) {
      return Result.fail(
        createTaskError('INVALID_TITLE', 'Oppgavetittel kan ikke overstige 150 tegn.')
      );
    }
    return Result.ok(new Title(trimmed));
  }
}

