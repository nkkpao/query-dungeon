import type {FastifyInstance} from 'fastify';
import {errorResponseSchema, challengeListResponseSchema, leaderboardResponseSchema} from './schemas.js';

export interface ChallengeRouteServices {
  list(): unknown;
  leaderboard(challengeId: string, variant?: string): Promise<unknown[]>;
}

export async function registerChallengeRoutes(app: FastifyInstance, services: ChallengeRouteServices): Promise<void> {
  app.get('/api/challenges', {
    schema: {
      response: {
        200: challengeListResponseSchema,
      },
    },
  }, async () => services.list());

  app.get<{Params: {challengeId: string}; Querystring: {variant?: string}}>('/api/challenges/:challengeId/leaderboard', {
    schema: {
      params: {
        type: 'object',
        required: ['challengeId'],
        properties: {challengeId: {type: 'string'}},
      },
      querystring: {
        type: 'object',
        properties: {variant: {type: 'string'}},
      },
      response: {
        200: leaderboardResponseSchema,
        404: errorResponseSchema,
      },
    },
  }, async (request) => ({
    challengeId: request.params.challengeId,
    variant: request.query.variant ?? null,
    entries: await services.leaderboard(request.params.challengeId, request.query.variant),
  }));
}
