import {describe, expect, it} from 'vitest';
import {EvaluationService} from '../src/server/services/evaluation-service.js';

describe('submission evaluation service', () => {
  it('stores failed unsafe submissions with an id', async () => {
    const service = new EvaluationService({
      databaseUrl: 'postgresql://example',
      queryTimeoutMs: 15000,
      sqlMaxBytes: 65536,
      pool: new FakePool() as any,
      challengeCatalog: fakeCatalog(),
    });
    const result = await service.submit({
      challengeId: '01-user-orders-missing-index',
      participantName: 'Ada',
      sql: 'DROP TABLE users',
    });
    expect(result.status).toBe('failed');
    expect(result.submissionId).toBeTruthy();
    expect(result.errorMessage).toContain('DROP');
  });

  it('marks correct and incorrect submissions using expected-result rows', async () => {
    const service = new EvaluationService({
      databaseUrl: 'postgresql://example',
      queryTimeoutMs: 15000,
      sqlMaxBytes: 65536,
      pool: new FakePool() as any,
      challengeCatalog: fakeCatalog(),
    });
    const correct = await service.submit({challengeId: '01-user-orders-missing-index', participantName: 'Ada', sql: 'SELECT 1 AS id'});
    const incorrect = await service.submit({challengeId: '01-user-orders-missing-index', participantName: 'Ada', sql: 'SELECT 2 AS id'});
    expect(correct).toMatchObject({status: 'completed', correctness: true, rowsReturned: 1});
    expect(incorrect).toMatchObject({status: 'completed', correctness: false});
  });

  it('evaluates inside a read-only transaction and resets pooled session state', async () => {
    const pool = new FakePool();
    const service = new EvaluationService({
      databaseUrl: 'postgresql://example',
      queryTimeoutMs: 15000,
      sqlMaxBytes: 65536,
      pool: pool as any,
      challengeCatalog: fakeCatalog(),
    });
    await service.submit({challengeId: '01-user-orders-missing-index', participantName: 'Ada', sql: 'SELECT 1 AS id'});
    expect(pool.client.queries).toContain('BEGIN READ ONLY');
    expect(pool.client.queries).toContain('RESET ALL');
    expect(pool.client.queries).toContain('SELECT pg_advisory_unlock_all()');
  });
});

function fakeCatalog(): any {
  return {
    resolve: () => ({id: '01-user-orders-missing-index', expectedResultPath: 'expected-result.json'}),
    expectedResult: async () => ({columns: ['id'], rows: [{id: 1}], orderSensitive: true}),
  };
}

class FakePool {
  client = new FakeClient();
  async connect() {
    return this.client;
  }
}

class FakeClient {
  submissions = new Map<string, any>();
  results = new Map<string, any>();
  queries: string[] = [];

  release() {}

  async query(sql: string, params: any[] = []): Promise<any> {
    this.queries.push(sql.replace(/\s+/g, ' ').trim());
    const normalized = sql.replace(/\s+/g, ' ').trim().toLowerCase();
    if (normalized.startsWith('insert into submissions')) {
      const row = {
        id: params[0],
        challenge_id: params[1],
        variant: params[2],
        participant_name: params[3],
        participant_id: params[4],
        sql_text: params[5],
        sql_hash: params[6],
        notes: params[7],
        status: 'pending',
        validation_error: null,
        submitted_at: new Date(),
        started_at: null,
        completed_at: null,
      };
      this.submissions.set(row.id, row);
      return {rows: [row], rowCount: 1};
    }
    if (normalized.startsWith('update submissions')) {
      const row = this.submissions.get(params[0]);
      row.status = params[1];
      row.validation_error = params[2] ?? row.validation_error;
      if (params[1] === 'running') row.started_at = new Date();
      if (params[1] === 'completed' || params[1] === 'failed') row.completed_at = new Date();
      return {rows: [row], rowCount: 1};
    }
    if (normalized.startsWith('insert into evaluation_results')) {
      const row = {
        id: params[0],
        submission_id: params[1],
        correct: params[2],
        row_count: params[3],
        latency_ms: params[4],
        execution_time_ms: params[5],
        planning_time_ms: params[6],
        error_message: params[7],
        diff_summary: params[8],
        created_at: new Date(),
      };
      this.results.set(row.submission_id, row);
      return {rows: [row], rowCount: 1};
    }
    if (normalized.includes('from submissions s left join evaluation_results')) {
      const submission = this.submissions.get(params[0]);
      const result = this.results.get(params[0]);
      return {
        rows: [{
          ...submission,
          result_id: result?.id ?? null,
          correct: result?.correct ?? null,
          row_count: result?.row_count ?? null,
          latency_ms: result?.latency_ms ?? null,
          execution_time_ms: result?.execution_time_ms ?? null,
          planning_time_ms: result?.planning_time_ms ?? null,
          error_message: result?.error_message ?? null,
          diff_summary: result?.diff_summary ?? null,
          result_created_at: result?.created_at ?? null,
        }],
      };
    }
    if (normalized.startsWith('explain')) {
      return {rows: [{'QUERY PLAN': 'Planning Time: 0.100 ms'}, {'QUERY PLAN': 'Execution Time: 1.000 ms'}]};
    }
    if (
      normalized === 'begin read only'
      || normalized === 'rollback'
      || normalized === 'reset all'
      || normalized === 'select pg_advisory_unlock_all()'
      || normalized.startsWith('select set_config')
    ) {
      return {rows: [], rowCount: 0};
    }
    if (normalized.includes('select 1 as id')) return {rows: [{id: 1}], rowCount: 1};
    if (normalized.includes('select 2 as id')) return {rows: [{id: 2}], rowCount: 1};
    return {rows: [], rowCount: 0};
  }
}
