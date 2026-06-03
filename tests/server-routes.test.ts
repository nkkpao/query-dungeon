import {describe, expect, it} from 'vitest';
import {buildApp} from '../src/server/app.js';
import type {ServerConfig} from '../src/server/config.js';

const config: ServerConfig = {
  databaseUrl: 'postgresql://example',
  queryTimeoutMs: 15000,
  port: 0,
  sqlMaxBytes: 65536,
};

describe('server routes', () => {
  it('responds to health checks', async () => {
    const app = await buildApp(config, fakeServices());
    const response = await app.inject({method: 'GET', url: '/health'});
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ok: true});
    await app.close();
  });

  it('creates submissions and validates malformed requests', async () => {
    const app = await buildApp(config, fakeServices());

    const created = await app.inject({
      method: 'POST',
      url: '/api/submissions',
      payload: {challengeId: '01-user-orders-missing-index', participantName: 'Ada', sql: 'SELECT 1'},
    });
    expect(created.statusCode).toBe(201);
    expect(created.json()).toMatchObject({submissionId: '00000000-0000-4000-8000-000000000001', status: 'completed'});

    const malformed = await app.inject({
      method: 'POST',
      url: '/api/submissions',
      payload: {challengeId: '01-user-orders-missing-index', sql: 'SELECT 1'},
    });
    expect(malformed.statusCode).toBe(400);
    expect(malformed.json()).toEqual({error: {code: 'INVALID_REQUEST', message: 'Request body or parameters do not match the API contract.'}});
    await app.close();
  });

  it('rejects request bodies above the server envelope limit', async () => {
    const app = await buildApp({...config, sqlMaxBytes: 8}, fakeServices());
    const response = await app.inject({
      method: 'POST',
      url: '/api/submissions',
      payload: {challengeId: '01-user-orders-missing-index', participantName: 'Ada', sql: `SELECT '${'x'.repeat(9000)}'`},
    });
    expect(response.statusCode).toBe(413);
    expect(response.json()).toEqual({error: {code: 'REQUEST_TOO_LARGE', message: 'Request body exceeds the server limit.'}});
    await app.close();
  });

  it('fetches failed submissions without hidden solution material', async () => {
    const app = await buildApp(config, fakeServices());
    const response = await app.inject({method: 'GET', url: '/api/submissions/00000000-0000-4000-8000-000000000002'});
    expect(response.statusCode).toBe(200);
    const body = JSON.stringify(response.json());
    expect(body).toContain('failed');
    expect(body).not.toContain('suggested-solution');
    expect(body).not.toContain('official-solution');
    await app.close();
  });

  it('lists challenges without solution paths and ranks only correct leaderboard entries', async () => {
    const app = await buildApp(config, fakeServices());
    const challenges = await app.inject({method: 'GET', url: '/api/challenges'});
    expect(challenges.statusCode).toBe(200);
    const challengeBody = JSON.stringify(challenges.json());
    expect(challengeBody).toContain('01-user-orders-missing-index');
    expect(challengeBody).not.toContain('suggested-solution');

    const leaderboard = await app.inject({method: 'GET', url: '/api/challenges/01-user-orders-missing-index/leaderboard'});
    expect(leaderboard.statusCode).toBe(200);
    expect(leaderboard.json().entries.map((entry: any) => entry.submissionId)).toEqual(['fast', 'slow']);
    expect(JSON.stringify(leaderboard.json())).not.toContain('SELECT');
    await app.close();
  });
});

function fakeServices() {
  return {
    submissions: {
      async submit() {
        return {
          submissionId: '00000000-0000-4000-8000-000000000001',
          status: 'completed',
          correctness: true,
          latencyMs: 1,
          executionTimeMs: 1,
          planningTimeMs: 0.1,
          rowsReturned: 1,
          errorMessage: null,
        };
      },
      async findById(id: string) {
        if (id.endsWith('999')) return null;
        return {
          submissionId: id,
          status: 'failed',
          correctness: false,
          latencyMs: null,
          executionTimeMs: null,
          planningTimeMs: null,
          rowsReturned: null,
          errorMessage: 'SQL_FORBIDDEN_STATEMENT',
        };
      },
    },
    challenges: {
      list() {
        return {challenges: [{id: '01-user-orders-missing-index', title: 'User orders without index', difficulty: 'easy', variants: []}]};
      },
      async leaderboard() {
        return [
          {submissionId: 'fast', participantName: 'Ada', participantId: null, latencyMs: 2, executionTimeMs: 1, planningTimeMs: 0.1, rowsReturned: 1, submittedAt: new Date(0).toISOString(), completedAt: new Date(0).toISOString()},
          {submissionId: 'slow', participantName: 'Grace', participantId: null, latencyMs: 5, executionTimeMs: 4, planningTimeMs: 0.1, rowsReturned: 1, submittedAt: new Date(1).toISOString(), completedAt: new Date(1).toISOString()},
        ];
      },
    },
  };
}
