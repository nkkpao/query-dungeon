import {readFileSync} from 'node:fs';
import {describe, expect, it} from 'vitest';

describe('baseline index policy', () => {
  it('does not include lesson solution indexes', () => {
    const sql = readFileSync('sql/schema/002_baseline_indexes.sql', 'utf8').toLowerCase();
    const solutionIndexes = [
      'idx_solution_orders_user_created',
      'idx_solution_orders_status_id',
      'idx_solution_payments_order_created',
      'idx_solution_orders_created_id',
      'idx_solution_users_lower_email',
      'idx_solution_products_attributes_gin',
      'idx_solution_orders_status_user',
      'idx_solution_user_events_user_created',
      'idx_solution_orders_unpaid_created',
      'idx_solution_orders_user_total',
      'idx_solution_inventory_product_delta',
      'idx_solution_dashboard_orders',
      'idx_solution_dashboard_events_gin',
    ];
    for (const indexName of solutionIndexes) {
      expect(sql).not.toContain(indexName.toLowerCase());
    }
    expect(sql).not.toMatch(/orders\s*\(\s*user_id/);
    expect(sql).not.toMatch(/orders\s*\(\s*status\s*,\s*user_id/);
    expect(sql).not.toContain('lower(email)');
    expect(sql).not.toMatch(/using\s+gin\s*\(\s*(attributes|metadata)/);
    expect(sql).not.toMatch(/where\s+status\s*=\s*'unpaid'/);
  });
});
