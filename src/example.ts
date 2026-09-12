import { Result } from './domain/shared/Result.js';
import { Title } from './domain/task/value-objects/Title.js';
import { LatexDescription } from './domain/task/value-objects/LatexDescription.js';
import { Difficulty, DifficultyLevel } from './domain/task/value-objects/Difficulty.js';
import { Lk20Category, Lk20Topic1T } from './domain/task/value-objects/Lk20Category.js';
import { SolutionStep } from './domain/task/value-objects/SolutionStep.js';
import { StudentAnswer } from './domain/task/value-objects/StudentAnswer.js';
import { Task } from './domain/task/Task.js';

// 1. Opprett Value Objects med validering
const titleResult = Title.create('Løs andregradslikningen');
const latexDescResult = LatexDescription.create(
  'Løs likningen $x^2 - 5x + 6 = 0$ for $x \\in \\mathbb{R}$.'
);
const difficultyResult = Difficulty.create(DifficultyLevel.MIDDELS);
const categoryResult = Lk20Category.create(
  Lk20Topic1T.TALL_OG_ALGEBRA,
  'Løse andregradslikninger med abc-formelen'
);

const step1Result = SolutionStep.create(
  1,
  'Identifiser koeffisienter',
  'Sett opp koeffisientene $a = 1$, $b = -5$, $c = 6$.',
  'a=1, \\, b=-5, \\, c=6'
);

const step2Result = SolutionStep.create(
  2,
  'Bruk abc-formelen',
  'Sett inn i $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$ og regn ut.',
  'x = \\frac{5 \\pm \\sqrt{25 - 24}}{2} = \\frac{5 \\pm 1}{2}'
);

// Sjekk om opprettelse av verdi-objekter var vellykket
if (
  titleResult.isFailure ||
  latexDescResult.isFailure ||
  difficultyResult.isFailure ||
  categoryResult.isFailure ||
  step1Result.isFailure ||
  step2Result.isFailure
) {
  console.error('Kunne ikke opprette verdi-objekter');
} else {
  // 2. Opprett Task domeneobjekt (Aggregate Root)
  const taskResult = Task.create({
    title: titleResult.value,
    description: latexDescResult.value,
    difficulty: difficultyResult.value,
    category: categoryResult.value,
    solutionSteps: [step1Result.value, step2Result.value],
    correctAnswer: { type: 'numeric', value: 3, tolerance: 0.01 },
  });

  if (taskResult.isFailure) {
    console.error('Feil ved opprettelse av Task:', taskResult.error);
  } else {
    const task = taskResult.value;
    console.log(`Oppgave opprettet: [${task.id.value}] - ${task.title.value}`);

    // 3. Simuler elevsvar (Korrekt)
    const studentAnswerResult = StudentAnswer.create({ type: 'numeric', value: 3 });
    if (studentAnswerResult.isSuccess) {
      const evalResult = task.evaluate(studentAnswerResult.value);

      if (evalResult.isSuccess) {
        console.log('Evaluering resultat:', evalResult.value);
      } else {
        console.error('Feil under evaluering:', evalResult.error);
      }
    }

    // 4. Simuler elevsvar (Feil type / ugyldig uten kasting av unntak)
    const invalidAnswerResult = StudentAnswer.create({ type: 'numeric', value: NaN });
    if (invalidAnswerResult.isFailure) {
      console.log('Type-sikker feil fanges opp før UI:', invalidAnswerResult.error);
    }
  }
}
