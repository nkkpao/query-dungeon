import {Command} from 'commander';
import {advancedVariants} from '../../challenges/registry.js';
import {validateRecordedPlans} from '../../challenges/recorded-plan-validation.js';

export function validateRecordedPlansCommand(): Command {
  return new Command('validate-recorded-plans')
    .description('Validate committed recorded plan text artifacts without running PostgreSQL')
    .action(async function (this: Command) {
      const options = this.parent?.opts() ?? {};
      const results = await validateRecordedPlans(advancedVariants());
      const failures = results.filter((result) => !result.ok);
      if (options.json) {
        console.log(JSON.stringify(results, null, 2));
      } else {
        for (const result of results) {
          console.log(`${result.ok ? 'OK' : 'FAIL'} ${result.variant} ${result.path}`);
          if (!result.ok) {
            console.log(`  missing: ${result.missingMarkers.join(', ')}`);
          }
        }
      }
      if (failures.length > 0) {
        throw new Error(`RECORDED_PLAN_VALIDATION_FAILED: ${failures.length} recorded plan file(s) failed structural validation.`);
      }
    });
}
