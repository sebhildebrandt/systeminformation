import { execSave } from '../common/exec';
import { MAX_BUFFER_SIZE } from '../common/const';
import { getValue, nextTick } from '../common';

export const networkGatewayDefault = async (): Promise<string> => {
  await nextTick();
  let result = '';
  const { stdout, stderr } = await execSave('route -n get default', { maxBuffer: MAX_BUFFER_SIZE });
  if (!stderr) {
    const lines = stdout
      .toString()
      .split('\n')
      .map((line) => line.trim());
    result = getValue(lines, 'gateway');
  }
  if (!result) {
    const { stdout } = await execSave("netstat -rn | awk '/default/ {print $2}'", { maxBuffer: MAX_BUFFER_SIZE });
    const lines = stdout.split('\n').map((line) => line.trim());
    result =
      lines.find((line) =>
        /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(line)
      ) || '';
  }
  return result;
};
