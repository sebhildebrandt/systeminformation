'use strict';

import { nextTick } from '../common';
import { execCmd } from '../common/exec';

export const windowsCpuFlags = async () => {
  let result = '';
  try {
    const stdout = (await execCmd('reg query "HKEY_LOCAL_MACHINE\\HARDWARE\\DESCRIPTION\\System\\CentralProcessor\\0" /v FeatureSet')).toString();
    const flag_hex = (stdout.split('0x').pop() || '').trim();
    const flag_bin_unpadded = parseInt(flag_hex, 16).toString(2);
    const flag_bin = '0'.repeat(32 - flag_bin_unpadded.length) + flag_bin_unpadded;
    // empty flags are the reserved fields in the CPUID feature bit list
    // as found on wikipedia:
    // https://en.wikipedia.org/wiki/CPUID
    const all_flags = [
      'fpu', 'vme', 'de', 'pse', 'tsc', 'msr', 'pae', 'mce', 'cx8', 'apic',
      '', 'sep', 'mtrr', 'pge', 'mca', 'cmov', 'pat', 'pse-36', 'psn', 'clfsh',
      '', 'ds', 'acpi', 'mmx', 'fxsr', 'sse', 'sse2', 'ss', 'htt', 'tm', 'ia64', 'pbe'
    ];
    for (let f = 0; f < all_flags.length; f++) {
      if (flag_bin[f] === '1' && all_flags[f] !== '') {
        result += ' ' + all_flags[f];
      }
    }
    result = result.trim().toLowerCase();
    return result;
  } catch (e) {
    return result;
  }
};

export const cpuFlags = async () => {
  await nextTick();
  return windowsCpuFlags();
};
