import { describe, it, expect } from 'vitest';
import { UserProgress } from '../../../../src/domain/model/progress/UserProgress.js';
import { Lk20Topic1T } from '../../../../src/domain/model/task/value-objects/Lk20Category.js';

describe('UserProgress', () => {
  it('skal opprette tom progression og registrere forsøk', () => {
    const progress = UserProgress.createEmpty();
    expect(progress.totalSolved).toBe(0);

    const updated = progress.recordAttempt(Lk20Topic1T.FUNKSJONER, true, 'Nullpunkter');
    expect(updated.totalSolved).toBe(1);

    const stat = updated.categoryStats.get(Lk20Topic1T.FUNKSJONER);
    expect(stat?.tasksAttempted).toBe(1);
    expect(stat?.tasksCorrect).toBe(1);
    expect(stat?.masteryPercentage).toBe(100);
    expect(updated.goalStats.get('Nullpunkter')?.masteryPercentage).toBe(100);
  });
});
