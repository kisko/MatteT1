import { describe, it, expect } from 'vitest';
import { Result } from '../../../src/domain/shared/Result.js';

describe('Result', () => {
  it('skal fungere for Success map og flatMap', () => {
    const okRes = Result.ok(5);
    expect(okRes.isSuccess).toBe(true);
    expect(okRes.isFailure).toBe(false);

    const mapped = okRes.map((x) => x * 2);
    expect(mapped.isSuccess).toBe(true);
    if (mapped.isSuccess) expect(mapped.value).toBe(10);

    const flatMapped = okRes.flatMap((x) => Result.ok(x + 1));
    expect(flatMapped.isSuccess).toBe(true);
    if (flatMapped.isSuccess) expect(flatMapped.value).toBe(6);
  });

  it('skal fungere for Failure map og flatMap', () => {
    const failRes = Result.fail('Feil');
    expect(failRes.isFailure).toBe(true);

    const mapped = failRes.map((x) => x);
    expect(mapped.isFailure).toBe(true);

    const flatMapped = failRes.flatMap(() => Result.ok(10));
    expect(flatMapped.isFailure).toBe(true);
  });

  it('skal kombinere resultater med Result.combine', () => {
    const ok1 = Result.ok(1);
    const ok2 = Result.ok(2);

    const combinedOk = Result.combine([ok1, ok2]);
    expect(combinedOk.isSuccess).toBe(true);

    const fail = Result.fail('Feilmelding');
    const combinedFail = Result.combine([ok1, fail]);
    expect(combinedFail.isFailure).toBe(true);
  });
});
