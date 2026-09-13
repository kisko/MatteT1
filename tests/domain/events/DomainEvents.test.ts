import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DomainEventPublisher } from '../../../src/domain/events/DomainEventPublisher.js';
import { TaskAnsweredDomainEvent } from '../../../src/domain/events/TaskAnsweredDomainEvent.js';
import { QuizCompletedDomainEvent } from '../../../src/domain/events/QuizCompletedDomainEvent.js';
import { ProgressUpdatedDomainEvent } from '../../../src/domain/events/ProgressUpdatedDomainEvent.js';
import { Lk20Topic1T } from '../../../src/domain/model/task/value-objects/Lk20Category.js';
import { StudentAnswer } from '../../../src/domain/model/task/value-objects/StudentAnswer.js';
import { EvaluationResult } from '../../../src/domain/model/task/value-objects/EvaluationResult.js';
import { QuizSession } from '../../../src/domain/model/quiz/QuizSession.js';
import { Task } from '../../../src/domain/model/task/Task.js';
import { Title } from '../../../src/domain/model/task/value-objects/Title.js';
import { LatexDescription } from '../../../src/domain/model/task/value-objects/LatexDescription.js';
import { Difficulty, DifficultyLevel } from '../../../src/domain/model/task/value-objects/Difficulty.js';
import { Lk20Category } from '../../../src/domain/model/task/value-objects/Lk20Category.js';
import { SolutionStep } from '../../../src/domain/model/task/value-objects/SolutionStep.js';

describe('Domain Events & AggregateRoot (DDD)', () => {
  beforeEach(() => {
    DomainEventPublisher.resetInstance();
  });

  const createDummyTask = () => {
    return Task.create({
      title: Title.create('Test tittel').value,
      description: LatexDescription.create('Løs $2x = 4$').value,
      difficulty: Difficulty.create(DifficultyLevel.LETT).value,
      category: Lk20Category.create(Lk20Topic1T.LIGNINGER_OG_ULIKHETER).value,
      solutionSteps: [
        SolutionStep.create(1, 'Del på 2', 'Del begge sider på 2', 'x = 2').value,
      ],
      correctAnswer: { type: 'numeric', value: 2 },
    }).value;
  };

  it('QuizSession som AggregateRoot registrerer TaskAnsweredDomainEvent ved innsending', () => {
    const task = createDummyTask();
    const session = QuizSession.create([task], 'Ligninger').value;

    expect(session.domainEvents.length).toBe(0);

    const answer = StudentAnswer.create({ type: 'numeric', value: 2 }).value;
    session.submitAnswer(answer, 1, 'Jeg delte på 2');

    expect(session.domainEvents.length).toBe(1);
    const event = session.domainEvents[0] as TaskAnsweredDomainEvent;
    expect(event.eventName).toBe('TaskAnsweredDomainEvent');
    expect(event.sessionId).toBe(session.id.value);
    expect(event.taskId).toBe(task.id.value);
    expect(event.topic).toBe(Lk20Topic1T.LIGNINGER_OG_ULIKHETER);
    expect(event.result.isCorrect).toBe(true);
    expect(event.hintsUsedCount).toBe(1);
    expect(event.reasoning).toBe('Jeg delte på 2');

    session.clearDomainEvents();
    expect(session.domainEvents.length).toBe(0);
  });

  it('QuizSession som AggregateRoot registrerer QuizCompletedDomainEvent når siste oppgave er besvart', () => {
    const task = createDummyTask();
    const session = QuizSession.create([task], 'Ligninger').value;

    const answer = StudentAnswer.create({ type: 'numeric', value: 2 }).value;
    session.submitAnswer(answer);
    session.nextTask(); // Vil fullføre quizet

    expect(session.isCompleted).toBe(true);
    const completedEvents = session.domainEvents.filter(
      (e) => e.eventName === 'QuizCompletedDomainEvent'
    ) as QuizCompletedDomainEvent[];

    expect(completedEvents.length).toBe(1);
    expect(completedEvents[0].topicTitle).toBe('Ligninger');
    expect(completedEvents[0].totalTasks).toBe(1);
    expect(completedEvents[0].correctCount).toBe(1);
    expect(completedEvents[0].scorePercentage).toBe(100);
  });

  it('DomainEventPublisher håndterer abonnementer og publisering', async () => {
    const publisher = DomainEventPublisher.getInstance();
    const handlerMock = vi.fn();

    const unsubscribe = publisher.subscribe('ProgressUpdatedDomainEvent', handlerMock);

    const event = new ProgressUpdatedDomainEvent(
      Lk20Topic1T.TALL_OG_ALGEBRA,
      true,
      85,
      10,
      3,
      'Potensregler'
    );

    await publisher.publish(event);

    expect(handlerMock).toHaveBeenCalledTimes(1);
    expect(handlerMock).toHaveBeenCalledWith(event);

    unsubscribe();
    await publisher.publish(event);
    expect(handlerMock).toHaveBeenCalledTimes(1); // Ikke kalt igjen etter unsubscribe
  });
});
