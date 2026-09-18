import { toInt } from '../common';
import { execSecure } from '../common/exec';
import type { ProcessFocusedData } from '../common/types';

// lsappinfo prints the requested fields as
// "Safari" ASN:0x0-0xa6025f8: (in front) ... executable path="/..." ... pid = 73140 ...
export const parseLsappinfo = (stdout: string): ProcessFocusedData | null => {
  const pid = toInt((stdout.match(/pid\s*=\s*(\d+)/) || [])[1]);
  if (!pid) {
    return null;
  }
  return {
    pid,
    name: (stdout.match(/^"([^"]+)"/) || [])[1] || '',
    path: (stdout.match(/executable path="([^"]+)"/) || [])[1] || ''
  };
};

export const processFocused = async (): Promise<ProcessFocusedData | null> => {
  const asn = (await execSecure('lsappinfo', ['front'])).trim();
  // guard the value before passing it on - it ends up in an argv slot, not a shell string
  if (!/^ASN:0x[0-9a-f]+-0x[0-9a-f]+:$/i.test(asn)) {
    return null;
  }
  return parseLsappinfo(await execSecure('lsappinfo', ['info', '-only', 'pid,name,executablepath', asn]));
};
