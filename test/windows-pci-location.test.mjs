// Parser unit checks for the windows PCI bus address lookup (#974)
// run: node test/windows-pci-location.test.mjs (after npm run dev)
import assert from 'node:assert/strict';
import { matchPnpLocation, parseWindowsLocationInfo, parseWindowsPnpLocations } from '../dist/common/windows.js';

// DEVPKEY_Device_LocationInfo, decimal numbers - PCI addresses are written in hex
assert.equal(parseWindowsLocationInfo('PCI bus 1, device 0, function 0'), '01:00.0');
assert.equal(parseWindowsLocationInfo('PCI bus 0, device 2, function 0'), '00:02.0');
assert.equal(parseWindowsLocationInfo('PCI bus 10, device 31, function 3'), '0a:1f.3');

// the string is localised, so the numbers are what counts - not the words around them
assert.equal(parseWindowsLocationInfo('PCI-Bus 1, Gerät 0, Funktion 0'), '01:00.0');
assert.equal(parseWindowsLocationInfo('Bus PCI 1, périphérique 0, fonction 0'), '01:00.0');

// anything that is not a three number pci location yields nothing
assert.equal(parseWindowsLocationInfo('@ System board'), '');
assert.equal(parseWindowsLocationInfo('Internal'), '');
assert.equal(parseWindowsLocationInfo('PCI bus 1, device 0'), '');
assert.equal(parseWindowsLocationInfo(''), '');

// --- instanceId|locationInfo rows from Get-PnpDevice ---
const ROWS = `PCI\\VEN_10DE&DEV_2684&SUBSYS_167F10DE&REV_A1\\4&2f4d1e33&0&0008|PCI bus 1, device 0, function 0
PCI\\VEN_8086&DEV_4680&SUBSYS_00000000&REV_0C\\3&11583659&0&10|PCI bus 0, device 2, function 0
ROOT\\BasicDisplay\\0000|
broken row
`;
const map = parseWindowsPnpLocations(ROWS);
assert.equal(map.get('pci\\ven_10de&dev_2684&subsys_167f10de&rev_a1\\4&2f4d1e33&0&0008'), '01:00.0');
assert.equal(map.get('pci\\ven_8086&dev_4680&subsys_00000000&rev_0c\\3&11583659&0&10'), '00:02.0');
assert.equal(map.has('root\\basicdisplay\\0000'), false, 'rows without a pci location must be skipped');
assert.equal(map.size, 2);
assert.equal(parseWindowsPnpLocations('').size, 0);

// --- matching an EnumDisplayDevices DeviceID against the pnp locations ---
const FULL_NVIDIA = 'PCI\\VEN_10DE&DEV_2684&SUBSYS_167F10DE&REV_A1\\4&2f4d1e33&0&0008';
assert.equal(matchPnpLocation(FULL_NVIDIA, map), '01:00.0', 'exact instance id must match');
assert.equal(matchPnpLocation(FULL_NVIDIA.toUpperCase(), map), '01:00.0', 'matching is case insensitive');

// older windows returns only the prefix - unambiguous here, so it still resolves
assert.equal(matchPnpLocation('PCI\\VEN_10DE&DEV_2684&SUBSYS_167F10DE&REV_A1', map), '01:00.0');

// two identical cards share that prefix - guessing one of them would be worse than saying nothing
const twins = parseWindowsPnpLocations(`PCI\\VEN_10DE&DEV_2684&SUBSYS_167F10DE&REV_A1\\4&aaa&0&0008|PCI bus 1, device 0, function 0
PCI\\VEN_10DE&DEV_2684&SUBSYS_167F10DE&REV_A1\\4&bbb&0&0010|PCI bus 2, device 0, function 0`);
assert.equal(twins.size, 2);
assert.equal(matchPnpLocation('PCI\\VEN_10DE&DEV_2684&SUBSYS_167F10DE&REV_A1', twins), '', 'ambiguous prefix must not guess');
assert.equal(matchPnpLocation('PCI\\VEN_10DE&DEV_2684&SUBSYS_167F10DE&REV_A1\\4&bbb&0&0010', twins), '02:00.0', 'full id stays unambiguous');

assert.equal(matchPnpLocation('', map), '');
assert.equal(matchPnpLocation('ROOT\\BasicDisplay\\0000', map), '');

console.log('windows-pci-location: all checks passed');
