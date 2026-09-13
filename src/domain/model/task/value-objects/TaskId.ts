import { Result } from '../../../shared/Result.js';
import { createTaskError, TaskError } from '../errors/TaskError.js';

export class TaskId {
  private constructor(public readonly value: string) {}

  public static create(id?: string): Result<TaskId, TaskError> {
    const value = id ?? crypto.randomUUID();
    if (!value || value.trim().length === 0) {
      return Result.fail(createTaskError('INVALID_TITLE', 'TaskId kan ikke være tom.'));
    }
    return Result.ok(new TaskId(value));
  }

  public equals(other: TaskId): boolean {
    return this.value === other.value;
  }
}

