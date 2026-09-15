import { Lk20Topic1T } from '../../../../src/domain/model/task/value-objects/Lk20Category.js';
import { MisconceptionType } from '../../../../src/domain/model/task/Misconception.js';
import {
  GuidedStepDefinition,
  GuidedWalkthrough,
  GuidedWalkthroughDefinition,
} from '../../../../src/domain/model/guided/GuidedWalkthrough.js';
import { ErrorHunt, ErrorHuntDefinition } from '../../../../src/domain/model/guided/ErrorHunt.js';

/**
 * Minimalt gyldig testinnhold. Testene overstyrer bare det de undersøker,
 * slik at en feilende test peker på én invariant og ikke på oppsettet.
 */

export const stepDefinition = (
  overrides: Partial<GuidedStepDefinition> = {}
): GuidedStepDefinition => ({
  kind: 'transform',
  prompt: 'Hva er neste lovlige steg?',
  options: [
    { id: 'riktig', latex: '$2x = 8$', isCorrect: true, feedback: 'Riktig, du trakk fra 3 på begge sider.' },
    {
      id: 'galt',
      latex: '$2x = 14$',
      feedback: 'Leddet skiftet ikke fortegn.',
      misconceptionType: MisconceptionType.SIGN_ERROR,
    },
  ],
  resultLatex: '$2x = 8$',
  rationale: 'Samme operasjon på begge sider bevarer balansen.',
  hint: 'Hva må bort fra venstre side?',
  visual: { kind: 'none' },
  ...overrides,
});

export const walkthroughDefinition = (
  overrides: Partial<GuidedWalkthroughDefinition> = {}
): GuidedWalkthroughDefinition => ({
  id: 'GW-TEST-01',
  topic: Lk20Topic1T.LIGNINGER_OG_ULIKHETER,
  goalId: 'LIG-01',
  skillLabel: 'Lineære ligninger',
  title: 'Testutregning',
  situation: 'En testsituasjon eleven kjenner igjen.',
  problemLatex: '$2x + 3 = 11$',
  steps: [stepDefinition(), stepDefinition({ prompt: 'Og hva blir da $x$?', resultLatex: '$x = 4$' })],
  answerLatex: '$x = 4$',
  takeaway: 'Gjør det samme på begge sider.',
  ...overrides,
});

export const errorHuntDefinition = (
  overrides: Partial<ErrorHuntDefinition> = {}
): ErrorHuntDefinition => ({
  id: 'EH-TEST-01',
  topic: Lk20Topic1T.LIGNINGER_OG_ULIKHETER,
  goalId: 'LIG-03',
  skillLabel: 'Fortegnsskjema',
  title: 'Testfeiljakt',
  claim: 'En annen elev har løst oppgaven og fått et galt svar.',
  lines: [
    { latex: '$-2x > 6$', note: 'Oppgaven, slik den står.' },
    { latex: '$x > -3$', note: 'Her er feilen: tegnet skulle snudd.' },
    { latex: 'Svar: $x > -3$', note: 'Konklusjonen følger av feilen over.' },
  ],
  flawedLineNumber: 2,
  misconceptionType: MisconceptionType.SIGN_ERROR,
  repairOptions: [
    { id: 'snu', latex: '$x < -3$', isCorrect: true, feedback: 'Riktig, tegnet snur.' },
    {
      id: 'behold',
      latex: '$x > 3$',
      feedback: 'Fortegnet forsvant også.',
      misconceptionType: MisconceptionType.SIGN_ERROR,
    },
  ],
  explanation: 'Deler du på et negativt tall, snur ulikhetstegnet.',
  takeaway: 'Test alltid løsningen med ett tall.',
  visual: { kind: 'none' },
  ...overrides,
});

/** Bygger et gyldig walkthrough eller kaster, slik at testene slipper Result-utpakking. */
export const buildWalkthrough = (
  overrides: Partial<GuidedWalkthroughDefinition> = {}
): GuidedWalkthrough => {
  const result = GuidedWalkthrough.fromDefinition(walkthroughDefinition(overrides));
  if (result.isFailure) {
    throw new Error(`Testinnholdet er ugyldig: ${result.error.message}`);
  }
  return result.value;
};

export const buildErrorHunt = (overrides: Partial<ErrorHuntDefinition> = {}): ErrorHunt => {
  const result = ErrorHunt.fromDefinition(errorHuntDefinition(overrides));
  if (result.isFailure) {
    throw new Error(`Testinnholdet er ugyldig: ${result.error.message}`);
  }
  return result.value;
};
