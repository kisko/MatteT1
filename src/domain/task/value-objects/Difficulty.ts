import { Result } from '../../shared/Result.js';
import { createTaskError, TaskError } from '../errors/TaskError.js';

export enum DifficultyLevel {
  LETT = 'LETT',
  MIDDELS = 'MIDDELS',
  KREVENDE = 'KREVENDE',
  UTFORDRING = 'UTFORDRING',
}

export class Difficulty {
  private constructor(public readonly level: DifficultyLevel) {}

  public static create(value: string | DifficultyLevel): Result<Difficulty, TaskError> {
    const uppercaseValue = typeof value === 'string' ? value.toUpperCase().trim() : value;

    if (Object.values(DifficultyLevel).includes(uppercaseValue as DifficultyLevel)) {
      return Result.ok(new Difficulty(uppercaseValue as DifficultyLevel));
    }

    return Result.fail(
      createTaskError(
        'INVALID_DIFFICULTY',
        `Ugyldig vanskelighetsgrad. Gyldige verdier er: ${Object.values(DifficultyLevel).join(', ')}`
      )
    );
  }
}
