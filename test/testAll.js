'use strict';
// ==================================================================================
// testAll.js
// ----------------------------------------------------------------------------------
// Runs every exported function and reports PASS / FAIL / SKIP.
// A function fails if it throws, rejects, hangs (timeout) or triggers an
// uncaughtException / unhandledRejection while running. Exits non-zero on any fail.
//
//   node test/testAll.js            run all
//   node test/testAll.js cpu mem    run only the named functions
// ==================================================================================

const si = require('../lib/index');

const DEFAULT_TIMEOUT = 60000;
const SLOW_TIMEOUT = 150000;

// functions needing specific args (everything else is called with none)
const ARGS = {
  versions: ['*'],
  get: [{ cpu: '*', mem: 'total, free' }],
  services: ['*'],
  processLoad: ['*'],
  inetChecksite: ['https://www.google.com'],
  inetLatency: ['8.8.8.8'],
  dockerContainerStats: ['*'],
  dockerContainerProcesses: ['*']
};

// side-effecting / control functions that must not be called blindly
const SKIP = {
  observe: 'starts an interval (side effect)',
  powerShellStart: 'starts a persistent PowerShell process',
  powerShellRelease: 'stops the PowerShell process'
};

const SLOW = new Set(['getStaticData', 'getDynamicData', 'getAllData', 'inetChecksite', 'inetLatency']);

let currentName = null;
let currentReject = null;

function fail(err) {
  if (currentReject) {
    const r = currentReject;
    currentReject = null;
    r(err);
  }
}
process.on('uncaughtException', (e) => fail(new Error('uncaughtException: ' + (e && e.message))));
process.on('unhandledRejection', (e) => fail(new Error('unhandledRejection: ' + (e && e.message))));

function runOne(name) {
  return new Promise((resolve) => {
    currentName = name;
    const args = ARGS[name] || [];
    const timeoutMs = SLOW.has(name) ? SLOW_TIMEOUT : DEFAULT_TIMEOUT;

    let settled = false;
    const done = (ok, detail) => {
      if (settled) {
        return;
      }
      settled = true;
      currentReject = null;
      clearTimeout(timer);
      resolve({ name, ok, detail });
    };

    const timer = setTimeout(() => done(false, `timeout after ${timeoutMs / 1000}s (hang)`), timeoutMs);
    currentReject = (err) => done(false, err && err.message ? err.message : String(err));

    try {
      const ret = si[name](...args);
      Promise.resolve(ret).then(
        () => done(true, ''),
        (err) => done(false, 'rejected: ' + (err && err.message ? err.message : String(err)))
      );
    } catch (err) {
      done(false, 'throw: ' + (err && err.message ? err.message : String(err)));
    }
  });
}

// regression checks for the fixed bugs (input -> must not crash/hang)
async function regressions() {
  const checks = [];
  const withTimeout = (p, ms) => Promise.race([Promise.resolve(p).then((v) => ({ v })).catch((e) => ({ e })), new Promise((r) => setTimeout(() => r({ hang: true }), ms))]);

  // get() with a non-string value must not crash the process
  checks.push(
    withTimeout(si.get({ cpu: 5 }), 10000).then((r) => ({
      name: "get({cpu:5}) does not crash",
      ok: !r.hang && !r.e,
      detail: r.hang ? 'HANG' : r.e ? r.e.message : ''
    }))
  );
  // get() must ignore control functions (no setInterval leak / crash)
  checks.push(
    withTimeout(si.get({ observe: 'x' }), 10000).then((r) => ({
      name: "get({observe}) is blocked",
      ok: !r.hang && !r.e,
      detail: r.hang ? 'HANG' : r.e ? r.e.message : ''
    }))
  );
  // versions() single-key must resolve, not hang
  checks.push(
    withTimeout(si.versions('kernel'), 10000).then((r) => ({
      name: "versions('kernel') resolves",
      ok: !r.hang && !r.e,
      detail: r.hang ? 'HANG' : r.e ? r.e.message : ''
    }))
  );
  // processLoad() with the pollution sentinel must resolve
  checks.push(
    withTimeout(si.processLoad('------'), 15000).then((r) => ({
      name: "processLoad('------') resolves",
      ok: !r.hang && !r.e,
      detail: r.hang ? 'HANG' : r.e ? r.e.message : ''
    }))
  );
  return Promise.all(checks);
}

(async () => {
  const only = process.argv.slice(2);
  const names = Object.keys(si)
    .filter((k) => typeof si[k] === 'function')
    .filter((k) => (only.length ? only.indexOf(k) >= 0 : true));

  const results = [];
  const skipped = [];

  for (const name of names) {
    if (SKIP[name] && !only.length) {
      skipped.push({ name, reason: SKIP[name] });
      continue;
    }
    process.stdout.write(`. ${name} `.padEnd(34, '.'));
    const res = await runOne(name);
    process.stdout.write(res.ok ? ' PASS\n' : ` FAIL  (${res.detail})\n`);
    results.push(res);
  }

  console.log('\n--- Regression checks (fixed bugs) ---');
  const reg = await regressions();
  reg.forEach((r) => console.log(`  ${r.ok ? 'PASS' : 'FAIL'}  ${r.name}${r.ok ? '' : '  (' + r.detail + ')'}`));

  const failed = results.filter((r) => !r.ok).concat(reg.filter((r) => !r.ok));
  console.log('\n----------------------------------------');
  console.log(`Functions: ${results.length}  PASS: ${results.filter((r) => r.ok).length}  FAIL: ${results.filter((r) => !r.ok).length}  SKIP: ${skipped.length}`);
  console.log(`Regression checks: ${reg.length}  PASS: ${reg.filter((r) => r.ok).length}  FAIL: ${reg.filter((r) => !r.ok).length}`);
  if (skipped.length) {
    console.log('Skipped: ' + skipped.map((s) => `${s.name} (${s.reason})`).join(', '));
  }
  if (failed.length) {
    console.log('\nFAILED:');
    failed.forEach((r) => console.log(`  - ${r.name}: ${r.detail}`));
    process.exit(1);
  }
  console.log('\nAll tests passed.');
  process.exit(0);
})();
