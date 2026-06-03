import {describe, expect, it} from 'vitest';
import {buildApp} from '../src/server/app.js';
import type {ServerConfig} from '../src/server/config.js';

const config: ServerConfig = {databaseUrl: 'postgresql://example', queryTimeoutMs: 15000, port: 0, sqlMaxBytes: 65536};

describe('server API contract', () => {
  it('returns SubmissionResponse for unsafe well-formed SQL', async () => {
    const app = await buildApp(config, {
      submissions: {
        async submit() {
          return {
            submissionId: '00000000-0000-4000-8000-000000000010',
            status: 'failed',
            correctness: false,
            latencyMs: null,
            executionTimeMs: null,
            planningTimeMs: null,
            rowsReturned: null,
            errorMessage: 'SQL_FORBIDDEN_STATEMENT',
          };
        },
        async findById() {
          return null;
        },
      },
      challenges: {list: () => ({challenges: []}), leaderboard: async () => []},
    });
    const response = await app.inject({
      method: 'POST',
      url: '/api/submissions',
      payload: {challengeId: '01-user-orders-missing-index', participantId: 'p1', sql: 'DROP TABLE users'},
    });
    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({status: 'failed', submissionId: '00000000-0000-4000-8000-000000000010'});
    await app.close();
  });

  it('returns consistent not-found shape for unknown submissions', async () => {
    const app = await buildApp(config, {
      submissions: {submit: async () => ({}), findById: async () => null},
      challenges: {list: () => ({challenges: []}), leaderboard: async () => []},
    });
    const response = await app.inject({method: 'GET', url: '/api/submissions/00000000-0000-4000-8000-000000000999'});
    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({error: {code: 'NOT_FOUND', message: 'Submission not found.'}});
    await app.close();
  });
});
