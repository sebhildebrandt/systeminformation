import { nextTick } from './common';
import { WINDOWS } from './common/const';
import { execCmd } from './common/exec';

export const shell = async () => {
  await nextTick();
  if (WINDOWS) { return 'cmd'; }
  const stdout = await execCmd('echo $SHELL').catch(() => '');
  return stdout.split('\n')[0];
};
