// Runs a single function directly against the TS source (src/) under bun/deno.
import * as si from '../src/index';
import runner from './run.cjs';

if (process.argv.length < 3) {
  console.log('error - a test key is required');
  process.exit(1);
}

runner.run(si, process.argv[2]).then((data: unknown) => {
  console.log(JSON.stringify(data));
});
