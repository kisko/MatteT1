export type GuidedErrorCode =
  | 'INVALID_STEP_OPTION'
  | 'INVALID_GUIDED_STEP'
  | 'INVALID_WALKTHROUGH'
  | 'INVALID_ERROR_HUNT'
  | 'INVALID_VISUAL'
  | 'ILLEGAL_TRANSITION'
  | 'UNKNOWN_OPTION'
  | 'UNKNOWN_LINE';

export interface GuidedError {
  readonly code: GuidedErrorCode;
  readonly message: string;
  readonly details?: Record<string, unknown>;
}

export function createGuidedError(
  code: GuidedErrorCode,
  message: string,
  details?: Record<string, unknown>
): GuidedError {
  return { code, message, details };
}
