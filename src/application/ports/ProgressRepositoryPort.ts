import { UserProgress } from '../../domain/model/progress/UserProgress.js';

export interface ProgressRepositoryPort {
  getProgress(): Promise<UserProgress>;
  saveProgress(progress: UserProgress): Promise<void>;
}
