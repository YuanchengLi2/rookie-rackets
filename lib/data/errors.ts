export type DomainErrorCode =
  | 'AUTH_REQUIRED'
  | 'FORBIDDEN'
  | 'INVALID_INPUT'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'SERVICE_UNAVAILABLE'
  | 'UNKNOWN';

const defaultMessages: Record<DomainErrorCode, string> = {
  AUTH_REQUIRED: 'Your staff session has expired. Sign in again to continue.',
  FORBIDDEN: 'You do not have permission to complete this action.',
  INVALID_INPUT: 'Check the highlighted information and try again.',
  NOT_FOUND: 'That record could not be found.',
  CONFLICT: 'This record changed before your update was saved. Refresh and try again.',
  RATE_LIMITED: 'Too many attempts were made. Wait a moment and try again.',
  SERVICE_UNAVAILABLE: 'Rookie Rackets data is temporarily unavailable. Your changes were not lost.',
  UNKNOWN: 'Something went wrong while saving. Try again.',
};

export class DomainError extends Error {
  readonly code: DomainErrorCode;
  readonly fieldErrors?: Record<string, string>;

  constructor(code: DomainErrorCode, message = defaultMessages[code], fieldErrors?: Record<string, string>) {
    super(message);
    this.name = 'DomainError';
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

export function toDomainError(error: unknown): DomainError {
  if (error instanceof DomainError) return error;
  if (error && typeof error === 'object') {
    const candidate = error as { code?: string; message?: string; status?: number };
    if (candidate.status === 401) return new DomainError('AUTH_REQUIRED');
    if (candidate.status === 403 || candidate.code === '42501') return new DomainError('FORBIDDEN');
    if (candidate.status === 404 || candidate.code === 'PGRST116') return new DomainError('NOT_FOUND');
    if (candidate.status === 409 || candidate.code === '23505') return new DomainError('CONFLICT');
    if (candidate.status === 429) return new DomainError('RATE_LIMITED');
    if (candidate.status && candidate.status >= 500) return new DomainError('SERVICE_UNAVAILABLE');
  }
  return new DomainError('UNKNOWN');
}
