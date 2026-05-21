import pg from 'pg';
import {SubmissionRepository} from '../repositories/submission-repository.js';
import type {LeaderboardEntryResponse} from '../types.js';
import {ChallengeCatalog} from './challenge-catalog.js';

export interface LeaderboardServiceOptions {
  databaseUrl: string;
  pool?: pg.Pool;
  challengeCatalog?: ChallengeCatalog;
}

export class LeaderboardService {
  private readonly pool: pg.Pool;
  private readonly ownsPool: boolean;
  private readonly challengeCatalog: ChallengeCatalog;

  constructor(options: LeaderboardServiceOptions) {
    this.pool = options.pool ?? new pg.Pool({connectionString: options.databaseUrl});
    this.ownsPool = !options.pool;
    this.challengeCatalog = options.challengeCatalog ?? new ChallengeCatalog();
  }

  async close(): Promise<void> {
    if (this.ownsPool) await this.pool.end();
  }

  async leaderboard(challengeId: string, variant?: string): Promise<LeaderboardEntryResponse[]> {
    this.challengeCatalog.resolve(challengeId, variant);
    const client = await this.pool.connect();
    try {
      return await new SubmissionRepository(client).leaderboard(challengeId, variant ?? null);
    } finally {
      client.release();
    }
  }
}
