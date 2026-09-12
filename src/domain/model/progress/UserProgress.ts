import { Lk20Topic1T } from '../task/value-objects/Lk20Category.js';

export interface CategoryMastery {
  readonly topic: Lk20Topic1T;
  readonly tasksAttempted: number;
  readonly tasksCorrect: number;
  readonly masteryPercentage: number;
}

export class UserProgress {
  private constructor(
    public readonly categoryStats: Map<Lk20Topic1T, CategoryMastery>,
    public readonly totalSolved: number,
    public readonly streakDays: number,
    public readonly lastActiveDate: string
  ) {}

  public static createEmpty(): UserProgress {
    const map = new Map<Lk20Topic1T, CategoryMastery>();
    for (const topic of Object.values(Lk20Topic1T)) {
      map.set(topic, {
        topic,
        tasksAttempted: 0,
        tasksCorrect: 0,
        masteryPercentage: 0,
      });
    }
    return new UserProgress(map, 0, 0, new Date().toISOString().split('T')[0]);
  }

  public static fromData(
    categoryStats: Map<Lk20Topic1T, CategoryMastery>,
    totalSolved: number,
    streakDays: number,
    lastActiveDate: string
  ): UserProgress {
    return new UserProgress(categoryStats, totalSolved, streakDays, lastActiveDate);
  }

  public recordAttempt(topic: Lk20Topic1T, isCorrect: boolean): UserProgress {
    const today = new Date().toISOString().split('T')[0];
    const current = this.categoryStats.get(topic) || {
      topic,
      tasksAttempted: 0,
      tasksCorrect: 0,
      masteryPercentage: 0,
    };

    const newAttempted = current.tasksAttempted + 1;
    const newCorrect = current.tasksCorrect + (isCorrect ? 1 : 0);
    const newMastery = Math.round((newCorrect / newAttempted) * 100);

    const newMap = new Map(this.categoryStats);
    newMap.set(topic, {
      topic,
      tasksAttempted: newAttempted,
      tasksCorrect: newCorrect,
      masteryPercentage: newMastery,
    });

    let newStreak = this.streakDays;
    if (this.lastActiveDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      if (this.lastActiveDate === yesterday) {
        newStreak += 1;
      } else {
        newStreak = 1;
      }
    }

    return new UserProgress(
      newMap,
      this.totalSolved + (isCorrect ? 1 : 0),
      newStreak,
      today
    );
  }
}
