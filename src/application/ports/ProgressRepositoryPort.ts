import { ProgressRepository } from '../../domain/model/progress/ProgressRepository.js';

/**
 * ProgressRepositoryPort er applikasjonslagets port for progresjon,
 * forankret i domenekontrakten ProgressRepository.
 */
export interface ProgressRepositoryPort extends ProgressRepository {}

