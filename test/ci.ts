// CI smoke-test directly against the TS source (src/) under bun/deno.
import * as si from '../src/index';
import runner from './ci-run.cjs';

runner.runCi(si);
