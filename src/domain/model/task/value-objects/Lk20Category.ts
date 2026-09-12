import { Result } from '../../../shared/Result.js';
import { createTaskError, TaskError } from '../errors/TaskError.js';

export enum Lk20Topic1T {
  TALL_OG_ALGEBRA = 'TALL_OG_ALGEBRA',
  LIGNINGER_OG_ULIKHETER = 'LIGNINGER_OG_ULIKHETER',
  FUNKSJONER = 'FUNKSJONER',
  DERIVASJON_OG_VEKSTFART = 'DERIVASJON_OG_VEKSTFART',
  TRIGONOMETRI = 'TRIGONOMETRI',
  MODELLERING_OG_PROBLEMSLOYSING = 'MODELLERING_OG_PROBLEMSLOYSING',
  SANNSYNLIGHET = 'SANNSYNLIGHET',
}

export const Lk20TopicNames: Record<Lk20Topic1T, string> = {
  [Lk20Topic1T.TALL_OG_ALGEBRA]: 'Algebra & Tallforståelse',
  [Lk20Topic1T.LIGNINGER_OG_ULIKHETER]: 'Ligninger & Ulikheter',
  [Lk20Topic1T.FUNKSJONER]: 'Funksjoner',
  [Lk20Topic1T.DERIVASJON_OG_VEKSTFART]: 'Derivasjon & Vekstfart',
  [Lk20Topic1T.TRIGONOMETRI]: 'Trigonometri',
  [Lk20Topic1T.MODELLERING_OG_PROBLEMSLOYSING]: 'Modellering & Problemløsing',
  [Lk20Topic1T.SANNSYNLIGHET]: 'Sannsynlighet (ekstra)',
};

export class Lk20Category {
  private constructor(
    public readonly mainTopic: Lk20Topic1T,
    public readonly subCompetenceGoal?: string
  ) {}

  public static create(
    mainTopic: string | Lk20Topic1T,
    subCompetenceGoal?: string
  ): Result<Lk20Category, TaskError> {
    const formattedTopic =
      typeof mainTopic === 'string' ? mainTopic.toUpperCase().trim() : mainTopic;

    if (Object.values(Lk20Topic1T).includes(formattedTopic as Lk20Topic1T)) {
      return Result.ok(
        new Lk20Category(formattedTopic as Lk20Topic1T, subCompetenceGoal?.trim())
      );
    }

    return Result.fail(
      createTaskError(
        'INVALID_LK20_CATEGORY',
        `Ugyldig LK20 1T fagplan-kategori. Gyldige hovedtemaer er: ${Object.values(
          Lk20Topic1T
        ).join(', ')}`
      )
    );
  }
}
