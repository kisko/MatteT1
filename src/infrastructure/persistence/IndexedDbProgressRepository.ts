import { ProgressRepositoryPort } from '../../application/ports/ProgressRepositoryPort.js';
import { UserProgress, CategoryMastery, GoalMastery } from '../../domain/model/progress/UserProgress.js';
import { Lk20Topic1T } from '../../domain/model/task/value-objects/Lk20Category.js';
import { LocalStorageProgressRepository } from './LocalStorageProgressRepository.js';

export class IndexedDbProgressRepository implements ProgressRepositoryPort {
  private static readonly DB_NAME = 'MatteT1_DB';
  private static readonly DB_VERSION = 1;
  private static readonly STORE_NAME = 'user_progress';
  private static readonly RECORD_KEY = 'current_profile';

  private readonly fallbackRepo: LocalStorageProgressRepository;
  private dbPromise: Promise<IDBDatabase | null> | null = null;

  constructor() {
    this.fallbackRepo = new LocalStorageProgressRepository();
  }

  private async getDb(): Promise<IDBDatabase | null> {
    if (typeof indexedDB === 'undefined') {
      return null;
    }

    if (!this.dbPromise) {
      this.dbPromise = new Promise((resolve) => {
        try {
          const request = indexedDB.open(
            IndexedDbProgressRepository.DB_NAME,
            IndexedDbProgressRepository.DB_VERSION
          );

          request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(IndexedDbProgressRepository.STORE_NAME)) {
              db.createObjectStore(IndexedDbProgressRepository.STORE_NAME);
            }
          };

          request.onsuccess = () => resolve(request.result);
          request.onerror = () => resolve(null);
        } catch {
          resolve(null);
        }
      });
    }

    return this.dbPromise;
  }

  public async getProgress(): Promise<UserProgress> {
    const db = await this.getDb();
    if (!db) {
      return this.fallbackRepo.getProgress();
    }

    return new Promise<UserProgress>((resolve) => {
      try {
        const tx = db.transaction(IndexedDbProgressRepository.STORE_NAME, 'readonly');
        const store = tx.objectStore(IndexedDbProgressRepository.STORE_NAME);
        const request = store.get(IndexedDbProgressRepository.RECORD_KEY);

        request.onsuccess = () => {
          const record = request.result;
          if (!record) {
            // Hvis IndexedDB er tom, sjekk om det finnes data i fallback/LocalStorage
            this.fallbackRepo.getProgress().then(resolve);
            return;
          }

          const map = new Map<Lk20Topic1T, CategoryMastery>();
          const goalMap = new Map<string, GoalMastery>();
          const misconceptionMap = new Map();

          if (record.categoryStats) {
            for (const [topicKey, stat] of Object.entries(record.categoryStats)) {
              map.set(topicKey as Lk20Topic1T, stat as CategoryMastery);
            }
          }

          if (record.goalStats) {
            for (const [goalLabel, stat] of Object.entries(record.goalStats)) {
              goalMap.set(goalLabel, stat as GoalMastery);
            }
          }

          if (record.misconceptionStats) {
            for (const [miscType, count] of Object.entries(record.misconceptionStats)) {
              misconceptionMap.set(miscType, Number(count));
            }
          }

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

          resolve(
            UserProgress.fromData(
              map,
              record.totalSolved ?? 0,
              record.streakDays ?? 0,
              record.lastActiveDate ?? new Date().toISOString().split('T')[0],
              goalMap,
              misconceptionMap
            )
          );
        };

        request.onerror = () => {
          this.fallbackRepo.getProgress().then(resolve);
        };
      } catch {
        this.fallbackRepo.getProgress().then(resolve);
      }
    });
  }

  public async saveProgress(progress: UserProgress): Promise<void> {
    // Lagre også i fallback slik at LocalStorage holdes synkronisert
    await this.fallbackRepo.saveProgress(progress);

    const db = await this.getDb();
    if (!db) {
      return;
    }

    return new Promise<void>((resolve) => {
      try {
        const tx = db.transaction(IndexedDbProgressRepository.STORE_NAME, 'readwrite');
        const store = tx.objectStore(IndexedDbProgressRepository.STORE_NAME);
        const record = {
          totalSolved: progress.totalSolved,
          streakDays: progress.streakDays,
          lastActiveDate: progress.lastActiveDate,
          categoryStats: Object.fromEntries(progress.categoryStats),
          goalStats: Object.fromEntries(progress.goalStats),
          misconceptionStats: Object.fromEntries(progress.misconceptionStats),
          updatedAt: new Date().toISOString(),
        };

        store.put(record, IndexedDbProgressRepository.RECORD_KEY);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  }
}
