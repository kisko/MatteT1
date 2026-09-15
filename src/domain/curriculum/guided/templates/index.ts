import { Lk20Topic1T } from '../../../model/task/value-objects/Lk20Category.js';
import { ExerciseTemplate } from '../../../model/guided/ExerciseTemplate.js';
import { ALGEBRA_TEMPLATES } from './algebraTemplates.js';
import { EQUATION_TEMPLATES } from './equationTemplates.js';
import { FUNCTION_TEMPLATES } from './functionTemplates.js';
import { DERIVATIVE_TEMPLATES } from './derivativeTemplates.js';
import { TRIGONOMETRY_TEMPLATES } from './trigonometryTemplates.js';
import { MODELLING_TEMPLATES } from './modellingTemplates.js';
import { PROBABILITY_TEMPLATES } from './probabilityTemplates.js';

/** Alle oppgavemaler, én per kompetansemål i LK20 1T. */
export const EXERCISE_TEMPLATES: readonly ExerciseTemplate[] = [
  ...ALGEBRA_TEMPLATES,
  ...EQUATION_TEMPLATES,
  ...FUNCTION_TEMPLATES,
  ...DERIVATIVE_TEMPLATES,
  ...TRIGONOMETRY_TEMPLATES,
  ...MODELLING_TEMPLATES,
  ...PROBABILITY_TEMPLATES,
];

export const templatesForTopic = (topic: Lk20Topic1T): readonly ExerciseTemplate[] =>
  EXERCISE_TEMPLATES.filter((template) => template.topic === topic);

export const templateById = (id: string): ExerciseTemplate | null =>
  EXERCISE_TEMPLATES.find((template) => template.id === id) ?? null;

/** Samlet antall varianter på tvers av alle maler. */
export const totalVariantCount = (): number =>
  EXERCISE_TEMPLATES.reduce((total, template) => total + template.variantCount, 0);
