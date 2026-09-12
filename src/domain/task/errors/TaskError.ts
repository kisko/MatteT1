export type TaskErrorCode =
  | 'INVALID_TITLE'
  | 'INVALID_LATEX'
  | 'INVALID_DIFFICULTY'
  | 'INVALID_LK20_CATEGORY'
  | 'INVALID_SOLUTION_STEPS'
  | 'EMPTY_ANSWER'
  | 'EVALUATION_ERROR';

export interface TaskError {
  readonly code: TaskErrorCode;
  readonly message: string;
  readonly details?: Record<string, unknown>;
}

export function createTaskError(
  code: TaskErrorCode,
  message: string,
  details?: Record<string, unknown>
): TaskError {
  return { code, message, details };
}
