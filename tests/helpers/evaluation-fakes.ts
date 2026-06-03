import {EvaluationService} from '../../src/server/services/evaluation-service.js';
import {SubmissionEvaluator} from '../../src/server/services/submission-evaluator.js';

export interface FakeCatalogOptions {
  expectedRows?: Record<string, unknown>[];
  throwExpected?: boolean;
}

export function fakeCatalog(options: FakeCatalogOptions = {}): any {
  return {
    resolve: (challengeId = '01-user-orders-missing-index', variant?: string | null) => ({
      id: challengeId,
      variant,
      expectedResultPath: 'expected-result.json',
    }),
    expectedResult: async () => {
      if (options.throwExpected) throw new Error('EXPECTED_RESULT_LOAD_FAILED');
      return {columns: ['id'], rows: options.expectedRows ?? [{id: 1}], orderSensitive: true};
    },
  };
}

export function makeEvaluationService(pool = new FakePool(), catalog = fakeCatalog()): EvaluationService {
  return new EvaluationService({
    databaseUrl: 'postgresql://example',
    queryTimeoutMs: 15000,
    sqlMaxBytes: 65536,
    pool: pool as any,
    challengeCatalog: catalog,
  });
}

export function makeSubmissionEvaluator(pool = new FakePool(), catalog = fakeCatalog()): SubmissionEvaluator {
  return new SubmissionEvaluator({
    pool: pool as any,
    queryTimeoutMs: 15000,
    sqlMaxBytes: 65536,
    challengeCatalog: catalog,
  });
}

export class FakePool {
  client = new FakeClient();

  async connect() {
    return this.client;
  }

  async query(sql: string, params: any[] = []) {
    return this.client.query(sql, params);
  }
}

export class FakeClient {
  submissions = new Map<string, any>();
  results = new Map<string, any>();
  queries: string[] = [];
  releaseErrors: Error[] = [];
  failRollback = false;
  nextSubmissionId = 1;

  release(error?: Error) {
    if (error) this.releaseErrors.push(error);
  }

  async query(sql: string, params: any[] = []): Promise<any> {
    const compactSql = sql.replace(/\s+/g, ' ').trim();
    const normalized = compactSql.toLowerCase();
    this.queries.push(compactSql);

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
        submitted_at: new Date(this.nextSubmissionId++),
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
        error_code: params[7],
        error_message: params[8],
        diff_summary: decodeJson(params[9]),
        explain_metrics: decodeJson(params[10]),
        created_at: new Date(),
      };
      this.results.set(row.submission_id, row);
      return {rows: [row], rowCount: 1};
    }

    if (normalized.startsWith('select * from evaluation_results')) {
      const result = this.results.get(params[0]);
      return {rows: result ? [result] : [], rowCount: result ? 1 : 0};
    }

    if (normalized.includes('from submissions s left join evaluation_results')) {
      const submission = this.submissions.get(params[0]);
      if (!submission) return {rows: [], rowCount: 0};
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
          error_code: result?.error_code ?? null,
          error_message: result?.error_message ?? null,
          diff_summary: result?.diff_summary ?? null,
          explain_metrics: result?.explain_metrics ?? null,
          result_created_at: result?.created_at ?? null,
        }],
        rowCount: 1,
      };
    }

    if (normalized.includes('from submissions s join evaluation_results')) {
      const rows = [...this.submissions.values()]
        .map((submission) => ({submission, result: this.results.get(submission.id)}))
        .filter(({submission, result}) => (
          submission.challenge_id === params[0]
          && (submission.variant ?? '') === (params[1] ?? '')
          && submission.status === 'completed'
          && result?.correct === true
        ))
        .sort((a, b) => nullLast(a.result.execution_time_ms, b.result.execution_time_ms)
          || nullLast(a.result.latency_ms, b.result.latency_ms)
          || Number(new Date(a.submission.submitted_at)) - Number(new Date(b.submission.submitted_at)))
        .map(({submission, result}) => ({
          submission_id: submission.id,
          participant_name: submission.participant_name,
          participant_id: submission.participant_id,
          latency_ms: result.latency_ms,
          execution_time_ms: result.execution_time_ms,
          planning_time_ms: result.planning_time_ms,
          row_count: result.row_count ?? 0,
          submitted_at: submission.submitted_at,
          completed_at: submission.completed_at,
        }));
      return {rows, rowCount: rows.length};
    }

    if (normalized.startsWith('explain')) {
      return {
        rows: [
          {'QUERY PLAN': 'Seq Scan on fake (cost=0.00..1.00 rows=1 width=4) (actual time=0.010..0.020 rows=1 loops=1)'},
          {'QUERY PLAN': '  Buffers: shared hit=2 read=1'},
          {'QUERY PLAN': 'Planning Time: 0.100 ms'},
          {'QUERY PLAN': 'Execution Time: 1.000 ms'},
        ],
        rowCount: 4,
      };
    }

    if (normalized === 'rollback' && this.failRollback) throw new Error('rollback connection failure');
    if (
      normalized === 'begin read only'
      || normalized === 'rollback'
      || normalized === 'reset all'
      || normalized === 'select pg_advisory_unlock_all()'
      || normalized.startsWith('set local statement_timeout')
    ) {
      return {rows: [], rowCount: 0};
    }

    if (normalized.startsWith('select from')) throw codedError('syntax error at or near "FROM"', '42601');
    if (normalized.includes('select timeout')) throw codedError('canceling statement due to statement timeout', '57014');
    if (normalized.includes('select runtime_error')) throw codedError('relation "runtime_error" does not exist', '42P01');
    if (normalized.includes('select 1 as id')) return {rows: [{id: 1}], rowCount: 1};
    if (normalized.includes('select 2 as id')) return {rows: [{id: 2}], rowCount: 1};
    if (normalized.includes('select 3 as id')) return {rows: [{id: 3}], rowCount: 1};
    return {rows: [], rowCount: 0};
  }

  countQuery(sql: string): number {
    return this.queries.filter((query) => query.toLowerCase().startsWith(sql.toLowerCase())).length;
  }
}

function decodeJson(value: unknown): unknown {
  return typeof value === 'string' ? JSON.parse(value) : value ?? null;
}

function codedError(message: string, code: string): Error & {code: string} {
  const error = new Error(message) as Error & {code: string};
  error.code = code;
  return error;
}

function nullLast(a: number | null, b: number | null): number {
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  return a - b;
}
