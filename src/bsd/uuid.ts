import { cloneObj, getValue, nextTick } from '../common';
import { initUUID } from '../common/defaults';
import { execSave } from '../common/exec';
import type { UuidData } from '../common/types';

export const uuid = async () => {
  await nextTick();
  const defaults: UuidData = cloneObj(initUUID);
  try {
    const { stdout } = await execSave('/sbin/sysctl -i kern.hostid kern.hostuuid');
    const lines = stdout.split('\n');
    let hardware = getValue(lines, 'kern.hostid', ':').toLowerCase();
    let os = getValue(lines, 'kern.hostuuid', ':').toLowerCase();
    if (os.indexOf('unknown') >= 0) {
      os = '';
    }
    if (hardware.indexOf('unknown') >= 0) {
      hardware = '';
    }
    return {
      ...defaults,
      os,
      hardware
    };
  } catch {}
  return defaults;
};
