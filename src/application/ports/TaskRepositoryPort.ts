import { Task } from '../../domain/model/task/Task.js';
import { Lk20Topic1T } from '../../domain/model/task/value-objects/Lk20Category.js';
import { DifficultyLevel } from '../../domain/model/task/value-objects/Difficulty.js';

export interface TaskRepositoryPort {
  getById(id: string): Promise<Task | null>;
  getByTopic(topic: Lk20Topic1T, difficulty?: DifficultyLevel): Promise<Task[]>;
  getByCompetenceGoal(goalLabel: string): Promise<Task[]>;
  getAll(): Promise<Task[]>;
}
