export type Result<T, E> = Success<T, E> | Failure<T, E>;

export class Success<T, E> {
  readonly isSuccess = true as const;
  readonly isFailure = false as const;

  constructor(public readonly value: T) {}

  map<U>(fn: (value: T) => U): Result<U, E> {
    return Result.ok(fn(this.value));
  }

  flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    return fn(this.value);
  }
}

export class Failure<T, E> {
  readonly isSuccess = false as const;
  readonly isFailure = true as const;

  constructor(public readonly error: E) {}

  map<U>(_fn: (value: T) => U): Result<U, E> {
    return Result.fail(this.error);
  }

  flatMap<U>(_fn: (value: T) => Result<U, E>): Result<U, E> {
    return Result.fail(this.error);
  }
}

export namespace Result {
  export function ok<T, E = never>(value: T): Result<T, E> {
    return new Success<T, E>(value);
  }

  export function fail<E, T = never>(error: E): Result<T, E> {
    return new Failure<T, E>(error);
  }

  export function combine<E>(results: Result<unknown, E>[]): Result<void, E> {
    for (const res of results) {
      if (res.isFailure) {
        return Result.fail(res.error);
      }
    }
    return Result.ok(undefined);
  }
}
