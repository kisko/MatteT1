import { Result } from '../../domain/shared/Result.js';
import { PracticeRun } from '../../domain/model/guided/PracticeRun.js';
import { createGuidedError, GuidedError } from '../../domain/model/guided/errors/GuidedError.js';
import { templateById } from '../../domain/curriculum/guided/templates/index.js';

/**
 * Starter en øvingsserie på én ferdighet.
 *
 * Startfrøet velges av kalleren. Det holder serien reproduserbar: samme frø
 * gir samme oppgaverekke, noe som er nødvendig når en elev skal vise læreren
 * hva hen faktisk fikk.
 */
export class StartPracticeRunUseCase {
  public execute(templateId: string, startSeed = 1): Result<PracticeRun, GuidedError> {
    const template = templateById(templateId);

    if (!template) {
      return Result.fail(
        createGuidedError('INVALID_WALKTHROUGH', `Fant ingen oppgavemal med id ${templateId}.`, {
          templateId,
        })
      );
    }

    return PracticeRun.start(template, startSeed);
  }
}
