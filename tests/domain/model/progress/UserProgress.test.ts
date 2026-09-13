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

  it('skal beholde progresjon ved feil svar uten kompetansemål', () => {
    const progress = UserProgress.createEmpty();
    const updated = progress.recordAttempt(Lk20Topic1T.FUNKSJONER, false);

    expect(updated.totalSolved).toBe(0);
    expect(updated.categoryStats.get(Lk20Topic1T.FUNKSJONER)?.masteryPercentage).toBe(0);
    expect(updated.goalStats.size).toBe(0);
  });

  it('skal øke streak for aktivitet påfølgende dag', () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const progress = UserProgress.fromData(new Map(), 2, 3, yesterday);

    const updated = progress.recordAttempt(Lk20Topic1T.TALL_OG_ALGEBRA, true);

    expect(updated.streakDays).toBe(4);
  });

  it('skal starte streak på nytt etter et opphold', () => {
    const progress = UserProgress.fromData(new Map(), 2, 3, '2020-01-01');

    const updated = progress.recordAttempt(Lk20Topic1T.TALL_OG_ALGEBRA, true);

    expect(updated.streakDays).toBe(1);
  });
});
