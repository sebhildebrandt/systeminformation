// Parser unit checks for linking a display to the GPU driving it (#974)
// run: node test/displays-gpu-link.test.mjs (after npm run dev)
import assert from 'node:assert/strict';
import { parseDrmDevicePath } from '../dist/linux/displays.js';
import { parseEnumDisplayDevices } from '../dist/windows/displays.js';
import { displays } from '../dist/index.js';

// --- linux: /sys/class/drm/cardN/device is a symlink ending in the PCI address ---
assert.equal(parseDrmDevicePath('../../../0000:00:02.0'), '00:02.0');
assert.equal(parseDrmDevicePath('/sys/devices/pci0000:00/0000:00:01.0/0000:01:00.0'), '01:00.0');
assert.equal(parseDrmDevicePath('../../../platform/soc/soc:gpu'), '');
assert.equal(parseDrmDevicePath(''), '');

// --- windows: EnumDisplayDevices adapter rows, one line per adapter ---
const ENUM = `\\\\.\\DISPLAY1|NVIDIA GeForce RTX 4090|PCI\\VEN_10DE&DEV_2684&SUBSYS_167F10DE&REV_A1
\\\\.\\DISPLAY2|Intel(R) UHD Graphics 770|PCI\\VEN_8086&DEV_4680&SUBSYS_00000000&REV_0C
garbage line without pipes
`;
const adapters = parseEnumDisplayDevices(ENUM);
assert.equal(adapters.get('\\\\.\\display1'), 'NVIDIA GeForce RTX 4090');
assert.equal(adapters.get('\\\\.\\display2'), 'Intel(R) UHD Graphics 770');
assert.equal(adapters.size, 2);
assert.equal(parseEnumDisplayDevices('').size, 0);

// --- live: every display carries both fields, and on macOS the gpu name is filled ---
const list = await displays();
for (const display of list) {
  assert.equal(typeof display.gpu, 'string', 'gpu must always be a string');
  assert.equal(typeof display.gpuBusAddress, 'string', 'gpuBusAddress must always be a string');
}
if (process.platform === 'darwin' && list.length) {
  assert.ok(list[0].gpu.length > 0, `macOS must report the gpu name, got ${JSON.stringify(list[0].gpu)}`);
}

console.log('displays-gpu-link: all checks passed', JSON.stringify(list.map((d) => ({ gpu: d.gpu, gpuBusAddress: d.gpuBusAddress }))));
