import { Lk20Topic1T } from '../../model/task/value-objects/Lk20Category.js';
import { ExplorationLab } from '../../model/exploration/ExplorationLab.js';
import { GuidedError } from '../../model/guided/errors/GuidedError.js';
import { EXPLORATION_LAB_DEFINITIONS } from './explorationLabs.js';

export interface ExplorationCatalogLoad {
  readonly labs: ReadonlyArray<ExplorationLab>;
  /** Utforskninger som ikke passerte valideringen. Skal alltid være tom. */
  readonly rejected: ReadonlyArray<GuidedError>;
}

let cachedLoad: ExplorationCatalogLoad | null = null;

/**
 * Leser utforskningene og gjør dem om til domeneobjekter.
 * Én ødelagt utforskning skal aldri ta ned hele laben.
 */
export class ExplorationCatalog {
  public static load(): ExplorationCatalogLoad {
    if (cachedLoad) {
      return cachedLoad;
    }

    const labs: ExplorationLab[] = [];
    const rejected: GuidedError[] = [];

    for (const definition of EXPLORATION_LAB_DEFINITIONS) {
      const result = ExplorationLab.fromDefinition(definition);
      if (result.isSuccess) {
        labs.push(result.value);
      } else {
        rejected.push(result.error);
      }
    }

    cachedLoad = { labs: Object.freeze(labs), rejected: Object.freeze(rejected) };
    return cachedLoad;
  }

  public static resetCache(): void {
    cachedLoad = null;
  }

  public static all(): ReadonlyArray<ExplorationLab> {
    return this.load().labs;
  }

  public static byId(id: string): ExplorationLab | null {
    return this.load().labs.find((lab) => lab.id === id) ?? null;
  }

  public static forTopic(topic: Lk20Topic1T): ReadonlyArray<ExplorationLab> {
    return this.load().labs.filter((lab) => lab.topic === topic);
  }

  /** Temaer som har minst én utforskning, i læreplanens rekkefølge. */
  public static availableTopics(): ReadonlyArray<Lk20Topic1T> {
    const withLabs = new Set(this.load().labs.map((lab) => lab.topic));
    return Object.freeze(Object.values(Lk20Topic1T).filter((topic) => withLabs.has(topic)));
  }

  public static totalMissionCount(): number {
    return this.load().labs.reduce((total, lab) => total + lab.missions.length, 0);
  }
}
