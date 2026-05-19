import {readFile} from 'node:fs/promises';
import type {ChallengeVariant} from './types.js';

export interface RecordedPlanValidationResult {
  variant: string;
  path: string;
  ok: boolean;
  missingMarkers: string[];
}

const requiredMarkers = ['QUERY PLAN', 'actual time', 'Buffers'];
const forbiddenMarkers = ['TODO', 'PLACEHOLDER'];

export async function validateRecordedPlan(variant: ChallengeVariant): Promise<RecordedPlanValidationResult> {
  const text = await readFile(variant.recordedPlanPath, 'utf8');
  const expectedMarkers = [...requiredMarkers, ...variant.structuralMarkers];
  const missingMarkers = expectedMarkers.filter((marker) => !text.includes(marker));
  const forbidden = forbiddenMarkers.filter((marker) => text.toUpperCase().includes(marker));
  return {
    variant: `${variant.parentChallengeId}:${variant.id}`,
    path: variant.recordedPlanPath,
    ok: missingMarkers.length === 0 && forbidden.length === 0,
    missingMarkers: [...missingMarkers, ...forbidden.map((marker) => `forbidden:${marker}`)],
  };
}

export async function validateRecordedPlans(variants: ChallengeVariant[]): Promise<RecordedPlanValidationResult[]> {
  const results = [];
  for (const variant of variants) {
    results.push(await validateRecordedPlan(variant));
  }
  return results;
}
