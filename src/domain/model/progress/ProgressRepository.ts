import { UserProgress } from './UserProgress.js';

/**
 * Domain Repository Interface for UserProgress Aggregate.
 * Definerer kontrakten for persistering og uthenting av brukerprogresjon i domenelaget.
 */
export interface ProgressRepository {
  getProgress(): Promise<UserProgress>;
  saveProgress(progress: UserProgress): Promise<void>;
}
