import type {FastifyInstance} from 'fastify';
import {badRequest, notFound} from '../errors.js';
import type {SubmissionCreateRequest} from '../types.js';
import {createSubmissionBodySchema, errorResponseSchema, submissionResponseSchema} from './schemas.js';

export interface SubmissionRouteServices {
  submit(request: SubmissionCreateRequest): Promise<unknown>;
  findById(id: string): Promise<unknown | null>;
}

export async function registerSubmissionRoutes(app: FastifyInstance, services: SubmissionRouteServices): Promise<void> {
  app.post<{Body: SubmissionCreateRequest}>('/api/submissions', {
    schema: {
      body: createSubmissionBodySchema,
      response: {
        201: submissionResponseSchema,
        400: errorResponseSchema,
        404: errorResponseSchema,
      },
    },
  }, async (request, reply) => {
    const response = await services.submit(request.body);
    await reply.status(201).send(response);
  });

  app.get<{Params: {id: string}}>('/api/submissions/:id', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {id: {type: 'string'}},
      },
      response: {
        200: submissionResponseSchema,
        400: errorResponseSchema,
        404: errorResponseSchema,
      },
    },
  }, async (request) => {
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(request.params.id)) {
      throw badRequest('INVALID_SUBMISSION_ID', 'Submission ID must be a UUID.');
    }
    const found = await services.findById(request.params.id);
    if (!found) throw notFound('Submission not found.');
    return found;
  });
}
