import { Task } from '../../domain/model/task/Task.js';
import { Hint } from '../../domain/model/task/Hint.js';
import { HintGeneratorService } from '../../domain/services/HintGeneratorService.js';

export class GetHintUseCase {
  public execute(task: Task, currentHintLevel: number): Hint | null {
    const hints = HintGeneratorService.getHintsForTask(task);
    if (currentHintLevel < 1 || currentHintLevel > hints.length) {
      return null;
    }
    return hints[currentHintLevel - 1];
  }
}
