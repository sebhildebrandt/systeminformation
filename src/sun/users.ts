import { nextTick } from '../common';
import { parseUsersDarwin } from '../common/darwin';
import { execSave } from '../common/exec';
import { UserData } from '../common/types';

export const users = async (): Promise<UserData[]> => {
  await nextTick();
  let stdout = '';
  ({ stdout } = await execSave('who; echo "---"; w -h'));
  return parseUsersDarwin(stdout);
};
