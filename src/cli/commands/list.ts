import {Command} from 'commander';
import {challenges} from '../../challenges/registry.js';

export function listCommand(): Command {
  return new Command('list')
    .description('List registered challenges')
    .action(function (this: Command) {
      const options = this.parent?.opts() ?? {};
      if (options.json) {
        console.log(JSON.stringify(challenges.map(({solutionIndexes, ...challenge}) => challenge), null, 2));
        return;
      }
      for (const challenge of challenges) {
        console.log(`${challenge.id} | ${challenge.difficulty} | ${challenge.title}`);
        console.log(`  tags: ${challenge.antiPatternTags.join(', ')}`);
        console.log(`  symptoms: ${challenge.planSymptoms.join(', ')}`);
      }
    });
}
