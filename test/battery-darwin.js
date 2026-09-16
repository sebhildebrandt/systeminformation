'use strict';

// Run with: node test/battery-darwin.js
// Exercise the public battery function with recorded/synthetic ioreg output.
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const util = require('../lib/util');

const source = fs.readFileSync(path.join(__dirname, '../lib/battery.js'), 'utf8');
const nested = '"BatteryData" = {"FullChargeCapacity"=5793,"NominalChargeCapacity"=5937,"DesignCapacity"=5760,"RemainingCapacity"=2994,"MaxCapacity"=100,"CurrentCapacity"=54}';
const pmset = ' -InternalBattery-0 (id=123)\t54%; discharging; 2:00 remaining present: true';

async function battery(lines, error) {
  const sandbox = {
    module: { exports: {} },
    process: { platform: 'darwin', nextTick: process.nextTick },
    require: (name) => {
      if (name === 'child_process') {
        return {
          exec: (command, callback) => {
            // Apply the actual command's filter so omitted fallback keys fail tests.
            const pattern = command.match(/egrep "([^"]+)"/)[1];
            const output = lines.filter((line) => new RegExp(pattern).test(line) || line.includes('%')).join('\n');
            callback(error || null, output);
          }
        };
      }
      return name === './util' ? util : require(name);
    }
  };
  vm.runInNewContext(source, sandbox, { filename: 'battery.js' });
  let callbackResult;
  const result = await sandbox.module.exports((value) => { callbackResult = value; });
  assert.strictEqual(callbackResult, result, 'callback and promise must agree');
  return result;
}

const cases = [
  ['macOS 27 nested capacities', [nested, pmset], { hasBattery: true, maxCapacity: 5793, currentCapacity: 2994, designedCapacity: 5760, percent: 54, capacityUnit: 'mAh' }],
  ['ioreg tree prefixes and voltage conversion', ['  |   ' + nested, '  |   "Voltage" = 12000', pmset], { hasBattery: true, maxCapacity: 69516, currentCapacity: 35928, designedCapacity: 69120, voltage: 12, capacityUnit: 'mWh' }],
  ['legacy raw values take precedence', [nested, '"AppleRawMaxCapacity" = 5000', '"AppleRawCurrentCapacity" = 2500', '"DesignCapacity" = 6000'], { maxCapacity: 5000, currentCapacity: 2500, designedCapacity: 6000, percent: 50 }],
  ['legacy output without BatteryData', ['"AppleRawMaxCapacity" = 5000', '"AppleRawCurrentCapacity" = 2500', '"DesignCapacity" = 6000', '"Voltage" = 12000'], { hasBattery: true, maxCapacity: 60000, currentCapacity: 30000, designedCapacity: 72000 }],
  ['top-level nominal fallback', [nested, '"NominalChargeCapacity" = 5500'], { maxCapacity: 5500 }],
  ['nominal fallback survives command filter', ['"NominalChargeCapacity" = 5500', '"AppleRawCurrentCapacity" = 2500'], { hasBattery: true, maxCapacity: 5500 }],
  ['nested nominal fallback', ['"BatteryData" = {"NominalChargeCapacity"=5937,"RemainingCapacity"=2994}'], { hasBattery: true, maxCapacity: 5937, currentCapacity: 2994 }],
  ['dictionary with arrays and reordered fields', ['"BatteryData" = {"Qmax"=(1,2,3),"RemainingCapacity"=2994,"DesignCapacity"=5760,"FullChargeCapacity"=5793}'], { hasBattery: true, maxCapacity: 5793, currentCapacity: 2994, designedCapacity: 5760 }],
  ['missing current capacity is not an empty battery', ['"BatteryData" = {"FullChargeCapacity"=5793}'], { hasBattery: false, maxCapacity: 5793, currentCapacity: 0 }],
  ['percentages are never capacities', ['"MaxCapacity" = 100', '"CurrentCapacity" = 54', '"BatteryData" = {"MaxCapacity"=100,"CurrentCapacity"=54}'], { hasBattery: false, maxCapacity: 0, currentCapacity: 0 }],
  ['empty battery remains present', ['"BatteryData" = {"FullChargeCapacity"=5793,"RemainingCapacity"=0}'], { hasBattery: true, currentCapacity: 0, percent: 0 }],
  ['raw zero current takes precedence', [nested, '"AppleRawCurrentCapacity" = 0'], { hasBattery: true, currentCapacity: 0, percent: 0 }],
  ['charging and time remaining', [nested, '"IsCharging" = Yes', '"TimeRemaining" = 120'], { isCharging: true, acConnected: true, timeRemaining: null }],
  ['pmset and battery metadata', [nested, pmset, '"CycleCount" = 42', '"TimeRemaining" = 120', '"DeviceName" = TestBattery', '"BatterySerialNumber" = TEST'], { cycleCount: 42, timeRemaining: 120, model: 'TestBattery', serial: 'TEST', isCharging: false, acConnected: false }],
  ['no battery', [], { hasBattery: false, maxCapacity: 0, currentCapacity: 0 }],
  ['command failure without output', [], { hasBattery: false, maxCapacity: 0 }, new Error('ioreg failed')]
];

(async () => {
  let failed = 0;
  for (const [name, lines, expected, error] of cases) {
    try {
      const actual = await battery(lines, error);
      for (const key of Object.keys(expected)) {
        assert.strictEqual(actual[key], expected[key], name + ': ' + key);
      }
      console.log('PASS ' + name);
    } catch (error) {
      failed++;
      console.error('FAIL ' + name + ': ' + error.message);
    }
  }
  console.log((cases.length - failed) + '/' + cases.length + ' passed');
  process.exitCode = failed ? 1 : 0;
})();
