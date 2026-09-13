import { describe, it, expect } from 'vitest';
import { InMemoryTaskRepository } from '../../src/infrastructure/persistence/InMemoryTaskRepository.js';
import { LocalStorageProgressRepository } from '../../src/infrastructure/persistence/LocalStorageProgressRepository.js';
import { IndexedDbProgressRepository } from '../../src/infrastructure/persistence/IndexedDbProgressRepository.js';
import { Lk20Topic1T } from '../../src/domain/model/task/value-objects/Lk20Category.js';
import { UserProgress } from '../../src/domain/model/progress/UserProgress.js';
import { StudentAnswer } from '../../src/domain/model/task/value-objects/StudentAnswer.js';
import { MisconceptionType } from '../../src/domain/model/task/Misconception.js';
import { TaskEvaluatorService } from '../../src/domain/services/TaskEvaluatorService.js';

describe('Infrastructure Repositories', () => {
  it('InMemoryTaskRepository skal hente oppgaver etter id, tema og alle', async () => {
    const repo = new InMemoryTaskRepository();
    const allTasks = await repo.getAll();
    expect(allTasks.length).toBeGreaterThan(0);

    const firstTask = allTasks[0];
    const foundById = await repo.getById(firstTask.id.value);
    expect(foundById?.id.value).toBe(firstTask.id.value);

    const algebraTasks = await repo.getByTopic(Lk20Topic1T.TALL_OG_ALGEBRA);
    expect(algebraTasks.length).toBeGreaterThanOrEqual(5);
  });

  it('skal ha en balansert oppgavebank for alle 1T-moduler', async () => {
    const repo = new InMemoryTaskRepository();

    for (const topic of Object.values(Lk20Topic1T)) {
      const tasks = await repo.getByTopic(topic);
      const subtopics = new Set(tasks.map((task) => task.category.subCompetenceGoal));
      const difficultyLevels = new Set(tasks.map((task) => task.difficulty.level));

      expect(tasks.length, `${topic} mangler oppgaver`).toBeGreaterThanOrEqual(5);
      expect(subtopics.size, `${topic} trenger flere deltemaer`).toBeGreaterThanOrEqual(2);
      expect(difficultyLevels.size, `${topic} trenger nivåvariasjon`).toBeGreaterThanOrEqual(2);
      expect(tasks.every((task) => task.solutionSteps.length > 0)).toBe(true);
    }
  });

  it('skal kunne evaluere fasiten til hver oppgave som korrekt med Task og TaskEvaluatorService', async () => {
    const repo = new InMemoryTaskRepository();
    const tasks = await repo.getAll();

    for (const task of tasks) {
      const answer = StudentAnswer.create(task.correctAnswer);
      expect(answer.isSuccess, `${task.id.value} har ugyldig fasit`).toBe(true);

      if (answer.isSuccess) {
        const evaluation = task.evaluate(answer.value);
        expect(evaluation.isSuccess, `${task.id.value} kunne ikke evalueres`).toBe(true);
        if (evaluation.isSuccess) {
          expect(evaluation.value.isCorrect, `${task.id.value} godtar ikke egen fasit`).toBe(true);
        }

        const evalWithAnalysis = TaskEvaluatorService.evaluateWithAnalysis(
          task.correctAnswer,
          answer.value
        );
        expect(evalWithAnalysis.isSuccess, `${task.id.value} feilet i evaluateWithAnalysis`).toBe(true);
        if (evalWithAnalysis.isSuccess) {
          expect(
            evalWithAnalysis.value.result.isCorrect,
            `${task.id.value} ('${task.title.value}') feilet evaluering i TaskEvaluatorService: ${evalWithAnalysis.value.result.feedbackLatex}`
          ).toBe(true);
        }
      }
    }
  });

  it('skal inneholde oppgaver som bruker flere svarformater', async () => {
    const repo = new InMemoryTaskRepository();
    const tasks = await repo.getAll();

    expect(tasks.some((task) => task.correctAnswer.type === 'multipleChoice')).toBe(true);
    expect(tasks.some((task) => task.correctAnswer.type === 'text')).toBe(true);

    const modelChoice = tasks.find((task) => task.id.value === 'task-model-6');
    expect(modelChoice?.correctAnswer).toMatchObject({
      type: 'multipleChoice',
      selectedOptionIndex: 1,
    });
    if (modelChoice?.correctAnswer.type === 'multipleChoice') {
      expect(modelChoice.correctAnswer.options).toHaveLength(4);
    }
  });

  it('LocalStorageProgressRepository skal hente og lagre progresjon', async () => {
    const repo = new LocalStorageProgressRepository();
    const initialProgress = await repo.getProgress();
    expect(initialProgress.totalSolved).toBe(0);

    const updated = initialProgress.recordAttempt(
      Lk20Topic1T.FUNKSJONER,
      true,
      'Rasjonale funksjoner',
      MisconceptionType.SIGN_ERROR
    );
    await repo.saveProgress(updated);

    const reloaded = await repo.getProgress();
    expect(reloaded.totalSolved).toBe(1);
    expect(reloaded.misconceptionStats.get(MisconceptionType.SIGN_ERROR)).toBe(1);
  });

  it('IndexedDbProgressRepository faller trygt tilbake til minne/LocalStorage ved behov', async () => {
    const repo = new IndexedDbProgressRepository();
    const progress = await repo.getProgress();
    expect(progress).toBeDefined();

    const updated = progress.recordAttempt(
      Lk20Topic1T.TALL_OG_ALGEBRA,
      false,
      'Potensregler',
      MisconceptionType.EXPONENT_RULE_ERROR
    );
    await repo.saveProgress(updated);

    const reloaded = await repo.getProgress();
    expect(reloaded.misconceptionStats.get(MisconceptionType.EXPONENT_RULE_ERROR)).toBe(1);
  });
});
