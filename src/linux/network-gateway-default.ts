import { execSave } from '../common/exec';
import { MAX_BUFFER_SIZE } from '../common/const';
import { nextTick } from '../common';

export const networkGatewayDefault = async (): Promise<string> => {
  await nextTick();
  let result = '';
  const { stdout, stderr } = await execSave('ip route get 1', { maxBuffer: MAX_BUFFER_SIZE });
  if (!stderr) {
    const lineParts = stdout.split('\n');
    const line = lineParts?.length ? lineParts[0] : '';
    let parts = line.split(' via ');
    if (parts && parts[1]) {
      parts = parts[1].split(' ');
      result = parts[0];
    }
  }
  return result;
};
