import { nextTick } from '../common';
import { parseUsersDarwin } from '../common/darwin';
import { execSave } from '../common/exec';
import type { UserData } from '../common/types';

export const users = async (): Promise<UserData[]> => {
  await nextTick();
  let stdout = '';
  ({ stdout } = await execSave('export LC_ALL=C; who; echo "---"; w -ih; unset LC_ALL'));
  return parseUsersDarwin(stdout);
};
