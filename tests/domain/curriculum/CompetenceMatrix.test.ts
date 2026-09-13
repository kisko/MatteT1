import { describe, it, expect } from 'vitest';
import { COMPETENCE_MATRIX, getCurriculumTopic } from '../../../src/domain/curriculum/CompetenceMatrix.js';
import { Lk20Topic1T } from '../../../src/domain/model/task/value-objects/Lk20Category.js';

describe('CompetenceMatrix', () => {
  it('defines all LK20 1T topics', () => {
    const topics = Object.values(Lk20Topic1T);
    expect(COMPETENCE_MATRIX.length).toBe(topics.length);

    for (const topic of topics) {
      const def = getCurriculumTopic(topic);
      expect(def).toBeDefined();
      expect(def.goals.length).toBeGreaterThan(0);
    }
  });

  it('includes video resources for core competence goals', () => {
    const coreTopics = COMPETENCE_MATRIX.filter((t) => t.core);
    expect(coreTopics.length).toBeGreaterThan(0);

    for (const topicDef of coreTopics) {
      for (const goal of topicDef.goals) {
        expect(goal.videoResources).toBeDefined();
        expect(goal.videoResources!.length).toBeGreaterThan(0);
        for (const video of goal.videoResources!) {
          expect(video.title).toBeTruthy();
          expect(video.channel).toBeTruthy();
          expect(video.url).toContain('https://www.youtube.com');
        }
      }
    }
  });
});
