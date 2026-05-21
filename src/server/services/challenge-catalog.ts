import {loadExpectedResult} from '../../challenges/expected-result.js';
import {challenges, getChallengeForVariant} from '../../challenges/registry.js';
import type {Challenge} from '../../challenges/types.js';
import type {ChallengeListResponse} from '../types.js';

export class ChallengeCatalog {
  list(): ChallengeListResponse {
    return {
      challenges: challenges.map((challenge) => ({
        id: challenge.id,
        title: challenge.title,
        difficulty: challenge.difficulty,
        variants: Object.values(challenge.variants ?? {}).map((variant) => ({
          id: variant.id,
          title: variant.title,
          difficulty: variant.difficulty,
        })),
      })),
    };
  }

  resolve(challengeId: string, variant?: string): Challenge {
    return getChallengeForVariant(challengeId, variant);
  }

  async expectedResult(challenge: Challenge) {
    return loadExpectedResult(challenge.expectedResultPath);
  }
}
