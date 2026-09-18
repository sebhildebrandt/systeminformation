// Parser unit checks for displays().powerState (#916)
// run: node test/displays-powerstate.test.mjs (after npm run dev)
import assert from 'node:assert/strict';
import { parseIoregPowerState } from '../dist/darwin/displays.js';
import { dpmsToPowerState, normalizeDrmConnector } from '../dist/linux/displays.js';
import { windowsAvailabilityToPowerState } from '../dist/windows/displays.js';

// --- macOS: intel macs expose IODisplayWrangler with 5 power states ---
const wrangler = (current, max) => `+-o IODisplayWrangler  <class IODisplayWrangler, id 0x100000378, registered, matched, active, busy 0 (0 ms), retain 8>
    {
      "IOPowerManagement" = {"CapabilityFlags"=32832,"MaxPowerState"=${max},"CurrentPowerState"=${current},"DevicePowerState"=2}
      "IOClass" = "IODisplayWrangler"
    }
`;

assert.equal(parseIoregPowerState(wrangler(4, 4)), 'on');
assert.equal(parseIoregPowerState(wrangler(3, 4)), 'standby');
assert.equal(parseIoregPowerState(wrangler(1, 4)), 'suspend');
assert.equal(parseIoregPowerState(wrangler(0, 4)), 'off');

// a node with only two states maps to on/off
assert.equal(parseIoregPowerState(wrangler(1, 1)), 'on');
assert.equal(parseIoregPowerState(wrangler(0, 1)), 'off');

// only the first power managed node counts, a second one must not override it
assert.equal(parseIoregPowerState(wrangler(0, 4) + wrangler(4, 4)), 'off');
assert.equal(parseIoregPowerState(''), '');
assert.equal(parseIoregPowerState('+-o IODisplayWrangler\n    {\n      "IOClass" = "IODisplayWrangler"\n    }\n'), '');

// --- linux: sysfs dpms ---
assert.equal(dpmsToPowerState('On'), 'on');
assert.equal(dpmsToPowerState('Off'), 'off');
assert.equal(dpmsToPowerState('Standby'), 'standby');
assert.equal(dpmsToPowerState('Suspend'), 'suspend');
assert.equal(dpmsToPowerState(''), '');
assert.equal(dpmsToPowerState('whatever'), '');

// xrandr says HDMI-1 where drm says card0-HDMI-A-1 - both must normalise to the same key
assert.equal(normalizeDrmConnector('card0-HDMI-A-1'), 'hdmi-1');
assert.equal(normalizeDrmConnector('HDMI-1'), 'hdmi-1');
assert.equal(normalizeDrmConnector('card1-DP-2'), 'dp-2');
assert.equal(normalizeDrmConnector('card0-eDP-1'), 'edp-1');
assert.equal(normalizeDrmConnector('card0-DVI-I-1'), 'dvi-i-1');

// --- windows: Win32_DesktopMonitor.Availability ---
assert.equal(windowsAvailabilityToPowerState('3'), 'on');
assert.equal(windowsAvailabilityToPowerState('7'), 'off');
assert.equal(windowsAvailabilityToPowerState('8'), 'off');
assert.equal(windowsAvailabilityToPowerState('13'), 'standby');
assert.equal(windowsAvailabilityToPowerState('14'), 'standby');
assert.equal(windowsAvailabilityToPowerState('16'), 'standby');
assert.equal(windowsAvailabilityToPowerState(''), '');
assert.equal(windowsAvailabilityToPowerState('5'), '');

console.log('displays-powerstate: all checks passed');
