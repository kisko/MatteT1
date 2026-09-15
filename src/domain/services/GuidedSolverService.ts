import { MisconceptionType, MISCONCEPTION_INFO } from '../model/task/Misconception.js';
import { StepOption } from '../model/guided/value-objects/StepOption.js';

/**
 * Nivåene eleven kan havne på etter en veiledet økt.
 * Språket er bevisst oppmuntrende: ingen «stryk», men et tydelig neste steg.
 */
export type MasteryLevel = 'på-vei' | 'god' | 'sterk' | 'mester';

export interface StepScoreInput {
  /** Antall valg eleven har gjort på steget, inkludert det riktige. */
  readonly attempts: number;
  readonly hintUsed: boolean;
  readonly revealed: boolean;
}

export interface GuidedAdvice {
  readonly tone: 'nudge' | 'hint' | 'reveal';
  readonly message: string;
}

/**
 * Domenetjeneste for poeng, nivå og veiledning i Mesterlab.
 *
 * All beregning er ren og deterministisk, slik at både UI og tester kan stole
 * på samme svar. Tjenesten kjenner ikke sesjonen; den regner bare på tall.
 */
export class GuidedSolverService {
  /** Et riktig valg på første forsøk. */
  public static readonly FIRST_TRY_SCORE = 1;
  /** Et riktig valg på andre forsøk. Feil skal koste litt, men ikke knuse. */
  public static readonly SECOND_TRY_SCORE = 0.6;
  /** Riktig etter tre eller flere forsøk. */
  public static readonly LATE_TRY_SCORE = 0.35;
  /** Å hente hint før valget dempes poengene, men er alltid bedre enn å gi opp. */
  public static readonly HINT_MULTIPLIER = 0.8;
  /** Antall bomvalg før eleven aktivt tilbys å se løsningen. */
  public static readonly ATTEMPTS_BEFORE_REVEAL_OFFER = 2;

  /**
   * Poengsummen for ett steg, mellom 0 og 1.
   * Et avslørt steg gir 0, men blokkerer ikke fremdriften.
   */
  public static scoreForStep({ attempts, hintUsed, revealed }: StepScoreInput): number {
    if (revealed) {
      return 0;
    }

    if (attempts <= 0) {
      return 0;
    }

    const base =
      attempts === 1
        ? this.FIRST_TRY_SCORE
        : attempts === 2
        ? this.SECOND_TRY_SCORE
        : this.LATE_TRY_SCORE;

    const score = hintUsed ? base * this.HINT_MULTIPLIER : base;
    return Math.round(score * 100) / 100;
  }

  /**
   * Gjennomsnittspoeng for en hel økt, mellom 0 og 1.
   */
  public static averageScore(stepScores: readonly number[]): number {
    if (stepScores.length === 0) {
      return 0;
    }
    const sum = stepScores.reduce((total, score) => total + score, 0);
    return Math.round((sum / stepScores.length) * 100) / 100;
  }

  /**
   * Erfaringspoeng brukt til motivasjon i UI. Alltid et heltall.
   */
  public static experiencePoints(stepScores: readonly number[]): number {
    return Math.round(stepScores.reduce((total, score) => total + score, 0) * 100);
  }

  public static masteryLevel(averageScore: number): MasteryLevel {
    if (averageScore >= 0.95) return 'mester';
    if (averageScore >= 0.75) return 'sterk';
    if (averageScore >= 0.5) return 'god';
    return 'på-vei';
  }

  /**
   * Prosent til progresjonslinjen. Runder til nærmeste heltall.
   */
  public static progressPercentage(solvedSteps: number, totalSteps: number): number {
    if (totalSteps <= 0) {
      return 0;
    }
    return Math.round((Math.min(solvedSteps, totalSteps) / totalSteps) * 100);
  }

  /**
   * Hva eleven bør gjøre nå, basert på hvor mange bom som er gjort.
   * Dette er «hold kontrollen»-mekanikken: eleven står aldri fast uten utvei.
   */
  public static adviceAfterWrongChoice(attempts: number, hintUsed: boolean): GuidedAdvice {
    if (attempts >= this.ATTEMPTS_BEFORE_REVEAL_OFFER + 1) {
      return {
        tone: 'reveal',
        message: 'Se hvordan steget gjøres, og gjør det samme på neste oppgave. Det er lov å bli vist.',
      };
    }

    if (!hintUsed) {
      return {
        tone: 'hint',
        message: 'Hent hintet før du velger på nytt. Da ser du hva du skal se etter.',
      };
    }

    return {
      tone: 'nudge',
      message: 'Les alternativene én gang til. Ett av dem gjør noe ulovlig med uttrykket.',
    };
  }

  /**
   * Tilbakemeldingsteksten for et valg. Teksten fra alternativet er alltid
   * kjernen; tipset fra misoppfatningsregisteret legges på når vi kjenner feilen.
   */
  public static feedbackForOption(option: StepOption): string {
    if (option.isCorrect || !option.misconceptionType) {
      return option.feedback;
    }

    const info = MISCONCEPTION_INFO[option.misconceptionType as Exclude<MisconceptionType, MisconceptionType.NONE>];
    if (!info) {
      return option.feedback;
    }

    return `${option.feedback} ${info.tip}`;
  }

  /**
   * Én oppsummerende setning til slutten av økta.
   */
  public static closingMessage(level: MasteryLevel, revealedSteps: number): string {
    if (level === 'mester') {
      return 'Alle steg på første forsøk. Du kan denne framgangsmåten nå, ikke bare svaret.';
    }

    if (level === 'sterk') {
      return 'Sterk gjennomføring. Ta en runde til på samme type, så sitter rekkefølgen.';
    }

    if (level === 'god') {
      return revealedSteps > 0
        ? 'Du kom igjennom, og du fikk se stegene du manglet. Kjør den samme utregningen en gang til nå.'
        : 'Godt jobbet. Du bommet noen ganger, men du fant veien selv hver gang.';
    }

    return 'Start med «Se det» en gang til og følg stegene før du prøver selv. Det er framgangsmåten som skal sitte, ikke svaret.';
  }
}
