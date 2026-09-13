import { Result } from '../../domain/shared/Result.js';
import { QuizSession } from '../../domain/model/quiz/QuizSession.js';
import { StudentAnswer, AnswerValue } from '../../domain/model/task/value-objects/StudentAnswer.js';
import { TaskEvaluatorService, ExtendedEvaluationResult } from '../../domain/services/TaskEvaluatorService.js';
import { ProgressRepositoryPort } from '../ports/ProgressRepositoryPort.js';
import { createTaskError, TaskError } from '../../domain/model/task/errors/TaskError.js';
import { DomainEventPublisher } from '../../domain/events/DomainEventPublisher.js';
import { ProgressUpdatedDomainEvent } from '../../domain/events/ProgressUpdatedDomainEvent.js';

export interface SubmitAnswerDTO {
  session: QuizSession;
  answerValue: AnswerValue;
  hintsUsedCount?: number;
  reasoning?: string;
}

export class SubmitAnswerUseCase {
  constructor(private readonly progressRepository: ProgressRepositoryPort) {}

  public async execute(
    dto: SubmitAnswerDTO
  ): Promise<Result<ExtendedEvaluationResult, TaskError>> {
    const studentAnswerResult = StudentAnswer.create(dto.answerValue);
    if (studentAnswerResult.isFailure) {
      return Result.fail(studentAnswerResult.error);
    }

    const task = dto.session.currentTask;
    if (!task) {
      return Result.fail(
        createTaskError('EVALUATION_ERROR', 'Ingen aktiv oppgave å svare på.')
      );
    }

    // Evaluering via domenetjeneste med misoppfatningsanalyse
    const evalAnalysisResult = TaskEvaluatorService.evaluateWithAnalysis(
      task.correctAnswer,
      studentAnswerResult.value
    );

    if (evalAnalysisResult.isFailure) {
      return evalAnalysisResult;
    }

    // Oppdater sesjon og lagre progresjon
    dto.session.submitAnswer(
      studentAnswerResult.value,
      dto.hintsUsedCount ?? 0,
      dto.reasoning
    );

    const currentProgress = await this.progressRepository.getProgress();
    const updatedProgress = currentProgress.recordAttempt(
      task.category.mainTopic,
      evalAnalysisResult.value.result.isCorrect,
      task.category.subCompetenceGoal,
      evalAnalysisResult.value.misconception?.type
    );
    await this.progressRepository.saveProgress(updatedProgress);

    // Publiser domenehendelser fra sesjon og progresjon
    const publisher = DomainEventPublisher.getInstance();
    await publisher.publishAll(dto.session.domainEvents);
    dto.session.clearDomainEvents();

    const topicStats = updatedProgress.categoryStats.get(task.category.mainTopic);
    await publisher.publish(
      new ProgressUpdatedDomainEvent(
        task.category.mainTopic,
        evalAnalysisResult.value.result.isCorrect,
        topicStats?.masteryPercentage ?? 0,
        updatedProgress.totalSolved,
        updatedProgress.streakDays,
        task.category.subCompetenceGoal
      )
    );

    return evalAnalysisResult;
  }
}
