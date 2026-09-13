import { describe, it, expect } from 'vitest';
import { Task } from '../../../../src/domain/model/task/Task.js';
import { Title } from '../../../../src/domain/model/task/value-objects/Title.js';
import { LatexDescription } from '../../../../src/domain/model/task/value-objects/LatexDescription.js';
import { Difficulty, DifficultyLevel } from '../../../../src/domain/model/task/value-objects/Difficulty.js';
import { Lk20Category, Lk20Topic1T } from '../../../../src/domain/model/task/value-objects/Lk20Category.js';
import { SolutionStep } from '../../../../src/domain/model/task/value-objects/SolutionStep.js';
import { StudentAnswer } from '../../../../src/domain/model/task/value-objects/StudentAnswer.js';

describe('Task Aggregate Root', () => {
  const title = Title.create('Løs likningen').value;
  const description = LatexDescription.create('$2x = 8$').value;
  const difficulty = Difficulty.create(DifficultyLevel.LETT).value;
  const category = Lk20Category.create(Lk20Topic1T.LIGNINGER_OG_ULIKHETER).value;
  const step = SolutionStep.create(1, 'Dele på 2', 'Dele med 2 på begge sider', 'x = 4').value;

  it('skal opprette en gyldig Task', () => {
    const taskResult = Task.create({
      title,
      description,
      difficulty,
      category,
      solutionSteps: [step],
      correctAnswer: { type: 'numeric', value: 4 },
    });

    expect(taskResult.isSuccess).toBe(true);
    if (taskResult.isSuccess) {
      const task = taskResult.value;
      expect(task.title.value).toBe('Løs likningen');
      expect(task.solutionSteps.length).toBe(1);
    }
  });

  it('skal avvise opprettelse av Task uten løsningssteg', () => {
    const taskResult = Task.create({
      title,
      description,
      difficulty,
      category,
      solutionSteps: [],
      correctAnswer: { type: 'numeric', value: 4 },
    });

    expect(taskResult.isFailure).toBe(true);
    if (taskResult.isFailure) {
      expect(taskResult.error.code).toBe('INVALID_SOLUTION_STEPS');
    }
  });

  it('skal evaluere et riktig numerisk svar', () => {
    const task = Task.create({
      title,
      description,
      difficulty,
      category,
      solutionSteps: [step],
      correctAnswer: { type: 'numeric', value: 4 },
    }).value;

    const answer = StudentAnswer.create({ type: 'numeric', value: 4 }).value;
    const evalResult = task.evaluate(answer);

    expect(evalResult.isSuccess).toBe(true);
    if (evalResult.isSuccess) {
      expect(evalResult.value.isCorrect).toBe(true);
      expect(evalResult.value.score).toBe(1.0);
    }
  });

  it('skal evaluere uttrykk, flervalg og tekstsvar med defaultEvaluator', () => {
    const exprTask = Task.create({
      title,
      description,
      difficulty,
      category,
      solutionSteps: [step],
      correctAnswer: { type: 'expression', latex: 'x + 2' },
    }).value;

    const correctExprAnswer = StudentAnswer.create({ type: 'expression', latex: ' x + 2 ' }).value;
    expect(exprTask.evaluate(correctExprAnswer).value.isCorrect).toBe(true);

    const mcTask = Task.create({
      title,
      description,
      difficulty,
      category,
      solutionSteps: [step],
      correctAnswer: { type: 'multipleChoice', selectedOptionIndex: 1 },
    }).value;

    const correctMcAnswer = StudentAnswer.create({ type: 'multipleChoice', selectedOptionIndex: 1 }).value;
    expect(mcTask.evaluate(correctMcAnswer).value.isCorrect).toBe(true);

    const textTask = Task.create({
      title,
      description,
      difficulty,
      category,
      solutionSteps: [step],
      correctAnswer: { type: 'text', text: 'Toppunkt' },
    }).value;

    const correctTextAnswer = StudentAnswer.create({ type: 'text', text: 'toppunkt' }).value;
    expect(textTask.evaluate(correctTextAnswer).value.isCorrect).toBe(true);
  });

  it('skal gi feil resultat for alle støttede feil svar', () => {
    const numericTask = Task.create({
      title,
      description,
      difficulty,
      category,
      solutionSteps: [step],
      correctAnswer: { type: 'numeric', value: 4 },
    }).value;
    expect(numericTask.evaluate(StudentAnswer.create({ type: 'numeric', value: 5 }).value).value.isCorrect).toBe(false);

    const mcTask = Task.create({
      title,
      description,
      difficulty,
      category,
      solutionSteps: [step],
      correctAnswer: { type: 'multipleChoice', selectedOptionIndex: 1 },
    }).value;
    expect(mcTask.evaluate(StudentAnswer.create({ type: 'multipleChoice', selectedOptionIndex: 0 }).value).value.isCorrect).toBe(false);

    const exprTask = Task.create({
      title,
      description,
      difficulty,
      category,
      solutionSteps: [step],
      correctAnswer: { type: 'expression', latex: 'x + 2' },
    }).value;
    expect(exprTask.evaluate(StudentAnswer.create({ type: 'expression', latex: 'x + 3' }).value).value.isCorrect).toBe(false);

    const textTask = Task.create({
      title,
      description,
      difficulty,
      category,
      solutionSteps: [step],
      correctAnswer: { type: 'text', text: 'Toppunkt' },
    }).value;
    expect(textTask.evaluate(StudentAnswer.create({ type: 'text', text: 'Bunnpunkt' }).value).value.isCorrect).toBe(false);
  });
});
