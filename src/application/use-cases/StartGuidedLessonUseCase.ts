import { Result } from '../../domain/shared/Result.js';
import { Lk20Topic1T } from '../../domain/model/task/value-objects/Lk20Category.js';
import { GuidedSession } from '../../domain/model/guided/GuidedSession.js';
import { createGuidedError, GuidedError } from '../../domain/model/guided/errors/GuidedError.js';
import { GuidedContentCatalog } from '../../domain/curriculum/guided/GuidedContentCatalog.js';

/**
 * Starter en veiledet økt for et tema.
 *
 * Innholdet ligger i minnet, så dette er synkront. Feiljakten er valgfri:
 * finnes den for temaet, blir den siste etappe i økta.
 */
export class StartGuidedLessonUseCase {
  public execute(topic: Lk20Topic1T): Result<GuidedSession, GuidedError> {
    const content = GuidedContentCatalog.contentForTopic(topic);

    if (!content.walkthrough) {
      return Result.fail(
        createGuidedError(
          'INVALID_WALKTHROUGH',
          `Det finnes ingen veiledet utregning for temaet ${topic} ennå.`,
          { topic }
        )
      );
    }

    return Result.ok(GuidedSession.start(content.walkthrough, content.errorHunt));
  }

  public executeById(walkthroughId: string): Result<GuidedSession, GuidedError> {
    const walkthrough = GuidedContentCatalog.walkthroughById(walkthroughId);

    if (!walkthrough) {
      return Result.fail(
        createGuidedError('INVALID_WALKTHROUGH', `Fant ingen veiledet utregning med id ${walkthroughId}.`, {
          walkthroughId,
        })
      );
    }

    return Result.ok(
      GuidedSession.start(walkthrough, GuidedContentCatalog.errorHuntForTopic(walkthrough.topic))
    );
  }
}
