import type {FastifyInstance} from 'fastify';

export async function registerHealthRoutes(app: FastifyInstance): Promise<void> {
  app.get('/health', {
    schema: {
      response: {
        200: {
          type: 'object',
          required: ['ok'],
          properties: {ok: {type: 'boolean'}},
        },
      },
    },
  }, async () => ({ok: true}));
}
