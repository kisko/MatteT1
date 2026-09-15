import { Lk20Topic1T } from '../task/value-objects/Lk20Category.js';
import { GuidedWalkthroughDefinition } from './GuidedWalkthrough.js';

/**
 * En oppgavemal lager konkrete varianter av samme oppgavetype.
 *
 * Poenget er mengde: en elev som vil øve skal aldri gå tom, og skal ikke kunne
 * lære seg svaret utenat. Malen tar et frø (seed) og gir en ferdig veiledet
 * utregning med tall som henger sammen.
 *
 * Distraktørene skal *regnes ut* fra misoppfatningen, ikke gjettes. Er feilen
 * «glemte å snu ulikhetstegnet», skal det gale alternativet være akkurat det
 * svaret en elev får når hen glemmer å snu. Da er hvert bomvalg gjenkjennelig.
 */
export interface ExerciseTemplate {
  /** Stabil id, f.eks. 'T-ALG-02'. */
  readonly id: string;
  readonly topic: Lk20Topic1T;
  /** Kompetansemålet i matrisen, f.eks. 'ALG-02'. */
  readonly goalId: string;
  /** Ferdigheten progresjonen registreres på. Må finnes i målets taskLabels. */
  readonly skillLabel: string;
  /** Kort navn eleven ser i ferdighetslisten. */
  readonly title: string;
  /** Én setning om hva eleven øver på. */
  readonly description: string;
  /** Hvor mange distinkte varianter malen kan lage. */
  readonly variantCount: number;
  /** Lager variant nummer `seed`. Samme frø gir alltid samme oppgave. */
  generate(seed: number): GuidedWalkthroughDefinition;
}
