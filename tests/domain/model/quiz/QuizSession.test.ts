import { describe, it, expect } from 'vitest';
import { QuizSession } from '../../../../src/domain/model/quiz/QuizSession.js';
import { Task } from '../../../../src/domain/model/task/Task.js';
import { Title } from '../../../../src/domain/model/task/value-objects/Title.js';
import { LatexDescription } from '../../../../src/domain/model/task/value-objects/LatexDescription.js';
import { Difficulty, DifficultyLevel } from '../../../../src/domain/model/task/value-objects/Difficulty.js';
import { Lk20Category, Lk20Topic1T } from '../../../../src/domain/model/task/value-objects/Lk20Category.js';
import { SolutionStep } from '../../../../src/domain/model/task/value-objects/SolutionStep.js';
import { StudentAnswer } from '../../../../src/domain/model/task/value-objects/StudentAnswer.js';

describe('QuizSession Aggregate', () => {
  const task1 = Task.create({
    title: Title.create('Oppgave 1').value,
    description: LatexDescription.create('$x + 1 = 3$').value,
    difficulty: Difficulty.create(DifficultyLevel.LETT).value,
    category: Lk20Category.create(Lk20Topic1T.LIGNINGER_OG_ULIKHETER).value,
    solutionSteps: [SolutionStep.create(1, 'Trekk fra 1', 'x = 2').value],
    correctAnswer: { type: 'numeric', value: 2 },
  }).value;

  it('skal ikke tillate QuizSession uten oppgaver', () => {
    const res = QuizSession.create([], 'Algebra');
    expect(res.isFailure).toBe(true);
  });

  it('skal håndtere svar og navigere til neste oppgave', () => {
    const session = QuizSession.create([task1], 'Ligninger').value;

    expect(session.currentIndex).toBe(0);
    expect(session.currentTask?.id.value).toBe(task1.id.value);

    const answer = StudentAnswer.create({ type: 'numeric', value: 2 }).value;
    const evalRes = session.submitAnswer(answer);

    expect(evalRes.isSuccess).toBe(true);
    expect(session.answers.size).toBe(1);

    const hasMore = session.nextTask();
    expect(hasMore).toBe(false);
    expect(session.isCompleted).toBe(true);

    const summary = session.calculateTotalScore();
    expect(summary.correctCount).toBe(1);
    expect(summary.answeredCount).toBe(1);
    expect(summary.unansweredCount).toBe(0);
    expect(summary.percentage).toBe(100);
  });

  it('skal registrere begrunnelse i eksamensmodus', () => {
    const session = QuizSession.create([task1], 'EKSAMENSTRENING', {
      mode: 'exam',
      timeLimitSeconds: 2700,
    }).value;
    const answer = StudentAnswer.create({ type: 'numeric', value: 2 }).value;

    session.submitAnswer(answer, 0, 'Jeg isolerer x ved å trekke fra 1 på begge sider.');

    expect(session.mode).toBe('exam');
    expect(session.timeLimitSeconds).toBe(2700);
    expect(session.answeredWithReasoningCount).toBe(1);
    expect(session.answers.get(task1.id.value)?.reasoning).toContain('isolerer x');
  });

  it('skal beregne resultat per modul', () => {
    const secondTask = Task.create({
      title: Title.create('Oppgave 2').value,
      description: LatexDescription.create('$x + 2 = 5$').value,
      difficulty: Difficulty.create(DifficultyLevel.LETT).value,
      category: Lk20Category.create(Lk20Topic1T.TALL_OG_ALGEBRA).value,
      solutionSteps: [SolutionStep.create(1, 'Trekk fra 2', 'x = 3').value],
      correctAnswer: { type: 'numeric', value: 3 },
    }).value;
    const session = QuizSession.create([task1, secondTask], 'Blandet').value;

    session.submitAnswer(StudentAnswer.create({ type: 'numeric', value: 2 }).value);
    const topicScores = session.calculateTopicScores();

    expect(topicScores).toHaveLength(2);
    expect(topicScores.find((score) => score.topic === Lk20Topic1T.LIGNINGER_OG_ULIKHETER)?.percentage).toBe(100);
    expect(topicScores.find((score) => score.topic === Lk20Topic1T.TALL_OG_ALGEBRA)?.percentage).toBe(0);
  });

  it('skal kunne gå videre til neste oppgave og avvise svar etter fullføring', () => {
    const secondTask = Task.create({
      title: Title.create('Oppgave 2').value,
      description: LatexDescription.create('$x + 2 = 5$').value,
      difficulty: Difficulty.create(DifficultyLevel.LETT).value,
      category: Lk20Category.create(Lk20Topic1T.TALL_OG_ALGEBRA).value,
      solutionSteps: [SolutionStep.create(1, 'Trekk fra 2', 'x = 3').value],
      correctAnswer: { type: 'numeric', value: 3 },
    }).value;
    const session = QuizSession.create([task1, secondTask], 'Blandet').value;

    expect(session.nextTask()).toBe(true);
    expect(session.currentIndex).toBe(1);
    expect(session.submitAnswer(StudentAnswer.create({ type: 'numeric', value: 3 }).value).isSuccess).toBe(true);
    expect(session.nextTask()).toBe(false);
    expect(session.completedAt).toBeInstanceOf(Date);
    expect(session.submitAnswer(StudentAnswer.create({ type: 'numeric', value: 3 }).value).isFailure).toBe(true);
  });

  it('skal avvise tomt svar og gjøre complete idempotent', () => {
    const session = QuizSession.create([task1], 'Ligninger').value;

    const result = session.submitAnswer(undefined as never);
    expect(result.isFailure).toBe(true);
    session.complete();
    const completedAt = session.completedAt;
    session.complete();
    expect(session.completedAt).toBe(completedAt);
  });
});
