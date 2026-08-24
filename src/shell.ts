import { nextTick } from './common';
import { WINDOWS } from './common/const';
import { exec } from './common/exec';

export const shell = async () => {
  await nextTick();
  if (WINDOWS) {
    // dynamischer Import hält windows/shell aus Nicht-Windows-Bundles (systeminformation/linux etc.)
    const { shell: windowsShell } = await import('./windows/shell.js');
    return windowsShell();
  }
  const { stdout } = await exec('echo $SHELL');
  return stdout.split('\n')[0];
};
