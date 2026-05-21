import Fastify, {type FastifyInstance} from 'fastify';
import type {ServerConfig} from './config.js';
import {handleError} from './errors.js';
import {registerChallengeRoutes, type ChallengeRouteServices} from './routes/challenges.js';
import {registerHealthRoutes} from './routes/health.js';
import {registerSubmissionRoutes, type SubmissionRouteServices} from './routes/submissions.js';
import {ChallengeCatalog} from './services/challenge-catalog.js';
import {EvaluationService} from './services/evaluation-service.js';
import {LeaderboardService} from './services/leaderboard-service.js';

export interface AppServices {
  submissions: SubmissionRouteServices;
  challenges: ChallengeRouteServices;
  close?: () => Promise<void>;
}

export function defaultServices(config: ServerConfig): AppServices {
  const catalog = new ChallengeCatalog();
  const evaluation = new EvaluationService({
    databaseUrl: config.databaseUrl,
    queryTimeoutMs: config.queryTimeoutMs,
    sqlMaxBytes: config.sqlMaxBytes,
    challengeCatalog: catalog,
  });
  const leaderboard = new LeaderboardService({databaseUrl: config.databaseUrl, challengeCatalog: catalog});
  return {
    submissions: evaluation,
    challenges: {
      list: () => catalog.list(),
      leaderboard: (challengeId, variant) => leaderboard.leaderboard(challengeId, variant),
    },
    close: async () => {
      await evaluation.close();
      await leaderboard.close();
    },
  };
}

export async function buildApp(config: ServerConfig, services: AppServices = defaultServices(config)): Promise<FastifyInstance> {
  const app = Fastify({logger: false});
  app.setErrorHandler(handleError);
  app.addHook('onClose', async () => {
    await services.close?.();
  });
  await registerHealthRoutes(app);
  await registerSubmissionRoutes(app, services.submissions);
  await registerChallengeRoutes(app, services.challenges);
  return app;
}
