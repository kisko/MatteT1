import { Result } from '../../shared/Result.js';
import { createTaskError, TaskError } from './errors/TaskError.js';
import { TaskId } from './value-objects/TaskId.js';
import { Title } from './value-objects/Title.js';
import { LatexDescription } from './value-objects/LatexDescription.js';
import { Difficulty } from './value-objects/Difficulty.js';
import { Lk20Category } from './value-objects/Lk20Category.js';
import { SolutionStep } from './value-objects/SolutionStep.js';
import { AnswerValue, StudentAnswer } from './value-objects/StudentAnswer.js';
import { EvaluationResult } from './value-objects/EvaluationResult.js';

export type EvaluatorFunction = (
  expected: AnswerValue,
  submitted: StudentAnswer
) => Result<EvaluationResult, TaskError>;

export interface CreateTaskProps {
  id?: TaskId;
  title: Title;
  description: LatexDescription;
  difficulty: Difficulty;
  category: Lk20Category;
  solutionSteps: SolutionStep[];
  correctAnswer: AnswerValue;
  customEvaluator?: EvaluatorFunction;
}

/**
 * Task (Oppgave) Aggregate Root i DDD.
 * Håndterer alle domeneregler for en matematikkoppgave i LK20 1T.
 */
export class Task {
  private readonly _id: TaskId;
  private readonly _title: Title;
  private readonly _description: LatexDescription;
  private readonly _difficulty: Difficulty;
  private readonly _category: Lk20Category;
  private readonly _solutionSteps: ReadonlyArray<SolutionStep>;
  private readonly _correctAnswer: AnswerValue;
  private readonly _evaluator: EvaluatorFunction;

  private constructor(props: CreateTaskProps, id: TaskId) {
    this._id = id;
    this._title = props.title;
    this._description = props.description;
    this._difficulty = props.difficulty;
    this._category = props.category;
    this._solutionSteps = Object.freeze([...props.solutionSteps]);
    this._correctAnswer = props.correctAnswer;
    this._evaluator = props.customEvaluator ?? Task.defaultEvaluator;
  }

  /**
   * Fabrikkmetode for opprettelse av Task som validerer domene-invarianter.
   * Returnerer Result<Task, TaskError> i stedet for å kaste unntak.
   */
  public static create(props: CreateTaskProps): Result<Task, TaskError> {
    if (!props.solutionSteps || props.solutionSteps.length === 0) {
      return Result.fail(
        createTaskError(
          'INVALID_SOLUTION_STEPS',
          'En oppgave må ha minst én løsningssteg.'
        )
      );
    }

    const taskIdResult = props.id ? Result.ok(props.id) : TaskId.create();
    if (taskIdResult.isFailure) {
      return Result.fail(taskIdResult.error);
    }

    return Result.ok(new Task(props, taskIdResult.value));
  }

  // Gettere for domeneegenskaper
  public get id(): TaskId {
    return this._id;
  }

  public equals(other?: Task): boolean {
    if (!other) {
      return false;
    }
    return this._id.equals(other._id);
  }

  public get title(): Title {
    return this._title;
  }

  public get description(): LatexDescription {
    return this._description;
  }

  public get difficulty(): Difficulty {
    return this._difficulty;
  }

  public get category(): Lk20Category {
    return this._category;
  }

  public get solutionSteps(): ReadonlyArray<SolutionStep> {
    return this._solutionSteps;
  }

  public get correctAnswer(): AnswerValue {
    return this._correctAnswer;
  }

  /**
   * Evaluerer elevens svar mot oppgavens fasit.
   * Returnerer Result<EvaluationResult, TaskError> for type-sikker feilhåndtering uten exceptions.
   */
  public evaluate(submittedAnswer: StudentAnswer): Result<EvaluationResult, TaskError> {
    if (!submittedAnswer) {
      return Result.fail(createTaskError('EMPTY_ANSWER', 'Mangler elevsvar for evaluering.'));
    }

    try {
      return this._evaluator(this._correctAnswer, submittedAnswer);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Ukjent evalueringsfeil';
      return Result.fail(
        createTaskError('EVALUATION_ERROR', `Uventet feil under evaluering: ${message}`)
      );
    }
  }

  /**
   * Standard evalueringsfunksjon som sammenligner svar basert på type.
   */
  public static defaultEvaluator(
    expected: AnswerValue,
    submitted: StudentAnswer
  ): Result<EvaluationResult, TaskError> {
    const actual = submitted.value;

    if (expected.type !== actual.type) {
      return Result.ok(
        EvaluationResult.incorrect(
          `Svartypen (${actual.type}) samsvarer ikke med forventet type (${expected.type}).`
        )
      );
    }

    switch (expected.type) {
      case 'numeric': {
        const submittedNum = (actual as Extract<AnswerValue, { type: 'numeric' }>).value;
        const tolerance = expected.tolerance ?? 0.001;
        const diff = Math.abs(expected.value - submittedNum);

        if (diff <= tolerance) {
          return Result.ok(EvaluationResult.correct('Riktig numerisk svar!'));
        } else {
          return Result.ok(
            EvaluationResult.incorrect(
              `Feil svar. Forventet $${expected.value}$, men fikk $${submittedNum}$.`
            )
          );
        }
      }

      case 'multipleChoice': {
        const submittedIndex = (
          actual as Extract<AnswerValue, { type: 'multipleChoice' }>
        ).selectedOptionIndex;
        if (expected.selectedOptionIndex === submittedIndex) {
          return Result.ok(EvaluationResult.correct('Riktig alternativ valgt!'));
        } else {
          return Result.ok(EvaluationResult.incorrect('Feil alternativ valgt.'));
        }
      }

      case 'expression': {
        const submittedLatex = (
          actual as Extract<AnswerValue, { type: 'expression' }>
        ).latex.trim();
        const expectedLatex = expected.latex.trim();

        // Enkel strengsammenligning av sammentrykt LaTeX
        const cleanExpected = expectedLatex.replace(/\s+/g, '');
        const cleanSubmitted = submittedLatex.replace(/\s+/g, '');

        if (cleanExpected === cleanSubmitted) {
          return Result.ok(EvaluationResult.correct('Riktig uttrykk!'));
        } else {
          return Result.ok(
            EvaluationResult.incorrect(
              `Uttrykket $${submittedLatex}$ er ikke likt fasit $${expectedLatex}$.`
            )
          );
        }
      }

      case 'text': {
        const submittedText = (actual as Extract<AnswerValue, { type: 'text' }>).text
          .trim()
          .toLowerCase();
        const expectedText = expected.text.trim().toLowerCase();

        const isMatch =
          submittedText === expectedText ||
          submittedText.includes(expectedText) ||
          expectedText.includes(submittedText);

        if (isMatch) {
          return Result.ok(EvaluationResult.correct('Riktig tekstsvar!'));
        } else {
          return Result.ok(EvaluationResult.incorrect('Svaret var dessverre ikke korrekt.'));
        }
      }

      default:
        return Result.fail(
          createTaskError(
            'EVALUATION_ERROR',
            `Utsjekk for svar-type støttes ikke ennå.`
          )
        );
    }
  }
}

