import { getValue, nextTick } from '../common';
import { exec } from '../common/exec';

export const cpuFlags = async () => {
  await nextTick();
  let stdout = '';
  try {
    ({ stdout } = await exec('sysctl -i machdep.cpu.features'));
  } catch {}
  const lines = stdout.split('\n');
  return getValue(lines, 'machdep.cpu.features').toLowerCase();
};
