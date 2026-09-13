import { TaskRepository } from '../../domain/model/task/TaskRepository.js';

/**
 * TaskRepositoryPort er applikasjonslagets port for oppgaver,
 * forankret i domenekontrakten TaskRepository.
 */
export interface TaskRepositoryPort extends TaskRepository {}

