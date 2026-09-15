import { ExplorationProgressRepository } from '../../domain/model/exploration/ExplorationProgressRepository.js';

/**
 * Lagrer løste oppdrag i localStorage.
 *
 * Utforskningsframgang er små mengder data og tåler å forsvinne, så dette
 * trenger ikke IndexedDB. Feiler lagringen (privat modus, full disk), går
 * utforskningen videre uten å huske – det skal aldri stoppe eleven.
 */
export class LocalStorageExplorationRepository implements ExplorationProgressRepository {
  private static readonly STORAGE_KEY = 'mattet1_exploration_missions';

  public async getCompletedMissionKeys(): Promise<ReadonlyArray<string>> {
    try {
      if (typeof localStorage === 'undefined') {
        return [];
      }

      const raw = localStorage.getItem(LocalStorageExplorationRepository.STORAGE_KEY);
      if (!raw) {
        return [];
      }

      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed.filter((entry): entry is string => typeof entry === 'string');
    } catch {
      return [];
    }
  }

  public async saveCompletedMissionKeys(keys: readonly string[]): Promise<void> {
    try {
      if (typeof localStorage === 'undefined') {
        return;
      }

      localStorage.setItem(
        LocalStorageExplorationRepository.STORAGE_KEY,
        JSON.stringify([...new Set(keys)])
      );
    } catch {
      // Framgangen går tapt, men utforskningen fortsetter.
    }
  }
}
