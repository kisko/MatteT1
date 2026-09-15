import { Lk20Topic1T } from '../../model/task/value-objects/Lk20Category.js';
import { GuidedWalkthrough } from '../../model/guided/GuidedWalkthrough.js';
import { ErrorHunt } from '../../model/guided/ErrorHunt.js';
import { GuidedError } from '../../model/guided/errors/GuidedError.js';
import { GUIDED_WALKTHROUGH_DEFINITIONS } from './walkthroughs.js';
import { ERROR_HUNT_DEFINITIONS } from './errorHunts.js';

export interface GuidedContentLoad {
  readonly walkthroughs: ReadonlyArray<GuidedWalkthrough>;
  readonly errorHunts: ReadonlyArray<ErrorHunt>;
  /** Innhold som ikke passerte domenevalideringen. Skal alltid være tom. */
  readonly rejected: ReadonlyArray<GuidedError>;
}

export interface GuidedTopicContent {
  readonly topic: Lk20Topic1T;
  readonly walkthrough: GuidedWalkthrough | null;
  readonly errorHunt: ErrorHunt | null;
}

let cachedLoad: GuidedContentLoad | null = null;

/**
 * Leser innholdsbanken for Mesterlab og gjør definisjonene om til
 * domeneobjekter. Innhold som bryter en invariant blir avvist i stedet for å
 * kaste, slik at én dårlig oppgave aldri tar ned hele laben.
 */
export class GuidedContentCatalog {
  public static load(): GuidedContentLoad {
    if (cachedLoad) {
      return cachedLoad;
    }

    const walkthroughs: GuidedWalkthrough[] = [];
    const errorHunts: ErrorHunt[] = [];
    const rejected: GuidedError[] = [];

    for (const definition of GUIDED_WALKTHROUGH_DEFINITIONS) {
      const result = GuidedWalkthrough.fromDefinition(definition);
      if (result.isSuccess) {
        walkthroughs.push(result.value);
      } else {
        rejected.push(result.error);
      }
    }

    for (const definition of ERROR_HUNT_DEFINITIONS) {
      const result = ErrorHunt.fromDefinition(definition);
      if (result.isSuccess) {
        errorHunts.push(result.value);
      } else {
        rejected.push(result.error);
      }
    }

    cachedLoad = {
      walkthroughs: Object.freeze(walkthroughs),
      errorHunts: Object.freeze(errorHunts),
      rejected: Object.freeze(rejected),
    };

    return cachedLoad;
  }

  /** Nullstiller mellomlagringen. Brukes av tester. */
  public static resetCache(): void {
    cachedLoad = null;
  }

  public static walkthroughForTopic(topic: Lk20Topic1T): GuidedWalkthrough | null {
    return this.load().walkthroughs.find((walkthrough) => walkthrough.topic === topic) ?? null;
  }

  public static errorHuntForTopic(topic: Lk20Topic1T): ErrorHunt | null {
    return this.load().errorHunts.find((hunt) => hunt.topic === topic) ?? null;
  }

  public static walkthroughById(id: string): GuidedWalkthrough | null {
    return this.load().walkthroughs.find((walkthrough) => walkthrough.id === id) ?? null;
  }

  public static contentForTopic(topic: Lk20Topic1T): GuidedTopicContent {
    return {
      topic,
      walkthrough: this.walkthroughForTopic(topic),
      errorHunt: this.errorHuntForTopic(topic),
    };
  }

  /** Alle temaer som har veiledet innhold, i læreplanens rekkefølge. */
  public static availableTopics(): ReadonlyArray<Lk20Topic1T> {
    const withContent = new Set(this.load().walkthroughs.map((walkthrough) => walkthrough.topic));
    return Object.freeze(Object.values(Lk20Topic1T).filter((topic) => withContent.has(topic)));
  }
}
