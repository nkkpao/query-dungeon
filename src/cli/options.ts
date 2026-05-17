export interface GlobalOptions {
  databaseUrl?: string;
  scale?: string;
  timeoutMs?: string | number;
  json?: boolean;
}

export function timeoutMs(options: GlobalOptions): number {
  return Number(options.timeoutMs ?? process.env.QUERY_TIMEOUT_MS ?? 15000);
}

export function seedScale(options: GlobalOptions): string {
  return options.scale ?? process.env.SEED_SCALE ?? 'small';
}

export function validateSeedScale(scale: string): void {
  if (!['small', 'medium', 'large'].includes(scale)) {
    throw new Error(`INVALID_SEED_SCALE: Expected small, medium, or large, got "${scale}".`);
  }
}
