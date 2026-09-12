import { ProgressRepositoryPort } from '../../application/ports/ProgressRepositoryPort.js';
import { UserProgress, CategoryMastery } from '../../domain/model/progress/UserProgress.js';
import { Lk20Topic1T } from '../../domain/model/task/value-objects/Lk20Category.js';

export class LocalStorageProgressRepository implements ProgressRepositoryPort {
  private static STORAGE_KEY = 'mattet1_user_progress_v1';
  private memoryFallback: string | null = null;

  public async getProgress(): Promise<UserProgress> {
    try {
      let raw: string | null = null;
      if (typeof localStorage !== 'undefined') {
        raw = localStorage.getItem(LocalStorageProgressRepository.STORAGE_KEY);
      } else {
        raw = this.memoryFallback;
      }

      if (!raw) {
        return UserProgress.createEmpty();
      }

      const parsed = JSON.parse(raw);
      const map = new Map<Lk20Topic1T, CategoryMastery>();

      if (parsed.categoryStats) {
        for (const [topicKey, stat] of Object.entries(parsed.categoryStats)) {
          map.set(topicKey as Lk20Topic1T, stat as CategoryMastery);
        }
      }

      // Sørg for at alle emner fra LK20Topic1T er representert
      for (const topic of Object.values(Lk20Topic1T)) {
        if (!map.has(topic)) {
          map.set(topic, {
            topic,
            tasksAttempted: 0,
            tasksCorrect: 0,
            masteryPercentage: 0,
          });
        }
      }

      return UserProgress.fromData(
        map,
        parsed.totalSolved ?? 0,
        parsed.streakDays ?? 0,
        parsed.lastActiveDate ?? new Date().toISOString().split('T')[0]
      );
    } catch {
      return UserProgress.createEmpty();
    }
  }

  public async saveProgress(progress: UserProgress): Promise<void> {
    try {
      const serializedObj = {
        totalSolved: progress.totalSolved,
        streakDays: progress.streakDays,
        lastActiveDate: progress.lastActiveDate,
        categoryStats: Object.fromEntries(progress.categoryStats),
      };
      const jsonStr = JSON.stringify(serializedObj);
      this.memoryFallback = jsonStr;

      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(LocalStorageProgressRepository.STORAGE_KEY, jsonStr);
      }
    } catch {
      // Ignorer i miljøer uten localStorage
    }
  }
}
