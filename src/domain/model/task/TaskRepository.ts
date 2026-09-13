import { Task } from './Task.js';
import { Lk20Topic1T } from './value-objects/Lk20Category.js';
import { DifficultyLevel } from './value-objects/Difficulty.js';

/**
 * Domain Repository Interface for Task Aggregate.
 * Definerer kontrakten for persistering og uthenting av matematikkoppgaver i domenelaget.
 */
export interface TaskRepository {
  getById(id: string): Promise<Task | null>;
  getByTopic(topic: Lk20Topic1T, difficulty?: DifficultyLevel): Promise<Task[]>;
  getByCompetenceGoal(goalLabel: string): Promise<Task[]>;
  getAll(): Promise<Task[]>;
}
