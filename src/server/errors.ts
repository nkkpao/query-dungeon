import type {FastifyError, FastifyReply, FastifyRequest} from 'fastify';
import type {ErrorResponse} from './types.js';

export class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode = 400,
  ) {
    super(message);
  }
}

export function errorResponse(code: string, message: string): ErrorResponse {
  return {error: {code, message}};
}

export function notFound(message: string): ApiError {
  return new ApiError('NOT_FOUND', message, 404);
}

export function badRequest(code: string, message: string): ApiError {
  return new ApiError(code, message, 400);
}

export async function handleError(error: FastifyError | Error, _request: FastifyRequest, reply: FastifyReply): Promise<void> {
  if (error instanceof ApiError) {
    await reply.status(error.statusCode).send(errorResponse(error.code, error.message));
    return;
  }
  if ('validation' in error && error.validation) {
    await reply.status(400).send(errorResponse('INVALID_REQUEST', 'Request body or parameters do not match the API contract.'));
    return;
  }
  if ('code' in error && error.code === 'FST_ERR_CTP_BODY_TOO_LARGE') {
    await reply.status(413).send(errorResponse('REQUEST_TOO_LARGE', 'Request body exceeds the server limit.'));
    return;
  }
  if (isDatabaseUnavailable(error)) {
    await reply.status(503).send(errorResponse('DATABASE_UNAVAILABLE', 'Cannot connect to PostgreSQL. Run "docker compose up -d" and "make seed" first.'));
    return;
  }
  if (error instanceof Error && /^UNKNOWN_(CHALLENGE|VARIANT):/.test(error.message)) {
    await reply.status(404).send(errorResponse('NOT_FOUND', error.message));
    return;
  }
  await reply.status(500).send(errorResponse('INTERNAL_ERROR', 'Unexpected server error.'));
}

function isDatabaseUnavailable(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const candidate = error as {code?: unknown; message?: unknown};
  return candidate.code === 'ECONNREFUSED' || candidate.code === 'EPERM' || /connect (ECONNREFUSED|EPERM)/i.test(String(candidate.message ?? ''));
}
