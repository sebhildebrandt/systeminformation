// Parser unit checks for processFocused() - run: node test/process-focused.test.mjs (after npm run dev)
import assert from 'node:assert/strict';
import { parseLsappinfo } from '../dist/darwin/process-focused.js';
import { parseXpropPid, parseXpropWindowId } from '../dist/linux/process-focused.js';
import { parseWindowsFocused } from '../dist/windows/process-focused.js';
import { processFocused } from '../dist/index.js';

const LSAPPINFO_SAFARI = `"Safari" ASN:0x0-0xa6025f8: (in front) 
    bundleID=[ NULL ] 
    bundle path=[ NULL ] 
    executable path="/System/Applications/Safari.app/Contents/MacOS/Safari"
    pid = 73140 !cgsConnection !signalled type=[ NULL ]  flavor=[ NULL ]  Version=[ NULL ]  Arch=!!none 
`;

const LSAPPINFO_EMPTY = `[ NULL ]  [ NULL ]  
    bundleID=[ NULL ] 
    bundle path=[ NULL ] 
    executable path=[ NULL ] 
    pid = 0 !cgsConnection 
`;

assert.deepEqual(parseLsappinfo(LSAPPINFO_SAFARI), {
  pid: 73140,
  name: 'Safari',
  path: '/System/Applications/Safari.app/Contents/MacOS/Safari'
});
assert.equal(parseLsappinfo(LSAPPINFO_EMPTY), null);
assert.equal(parseLsappinfo(''), null);

assert.equal(parseXpropWindowId('_NET_ACTIVE_WINDOW(WINDOW): window id # 0x3400007'), '0x3400007');
assert.equal(parseXpropWindowId('_NET_ACTIVE_WINDOW(WINDOW): window id # 0x0'), '');
assert.equal(parseXpropWindowId('_NET_ACTIVE_WINDOW:  not found.'), '');

assert.equal(parseXpropPid('_NET_WM_PID(CARDINAL) = 1234'), 0 + 1234);
assert.equal(parseXpropPid('_NET_WM_PID:  not found.'), 0);

assert.deepEqual(parseWindowsFocused('{"pid":4711,"name":"notepad","path":"C:\\\\Windows\\\\notepad.exe"}'), {
  pid: 4711,
  name: 'notepad',
  path: 'C:\\Windows\\notepad.exe'
});
assert.equal(parseWindowsFocused('{"pid":0,"name":null,"path":null}'), null);
assert.equal(parseWindowsFocused(''), null);

// live check on the current host: either null or a plausible process
const live = await processFocused();
assert.ok(live === null || (typeof live.pid === 'number' && live.pid > 0 && typeof live.name === 'string'), `unexpected result: ${JSON.stringify(live)}`);

console.log('process-focused: all checks passed', JSON.stringify(live));
