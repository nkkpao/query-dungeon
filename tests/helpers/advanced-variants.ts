import {advancedVariants} from '../../src/challenges/registry.js';

export const advancedVariantFixtures = advancedVariants().map((variant) => ({
  id: `${variant.parentChallengeId}/${variant.id}`,
  baselineSqlPath: variant.baselineSqlPath,
  recordedPlanPath: variant.recordedPlanPath,
  requiredMarkers: ['QUERY PLAN', 'actual time', 'Buffers', ...variant.structuralMarkers],
}));
