import { EOL } from 'node:os';
import { getValue, nextTick } from '../common';
import { execOptsWin } from '../common/const';
import { execSave } from '../common/exec';
import { ps } from '../common/windows';

export const networkGatewayDefault = async (): Promise<string> => {
  await nextTick();
  let result = '';
  let stdout = '';
  ({ stdout } = await execSave('netstat -r', execOptsWin));
  const lines = stdout.split(EOL);
  lines.forEach((line) => {
    line = line.replace(/\s+/g, ' ').trim();
    if (line.indexOf('0.0.0.0 0.0.0.0') > -1 && !/[a-zA-Z]/.test(line)) {
      const parts = line.split(' ');
      if (parts.length >= 5 && parts[parts.length - 3].indexOf('.') > -1) {
        result = parts[parts.length - 3];
      }
    }
  });
  if (!result) {
    try {
      const data = await ps.exec("Get-CimInstance -ClassName Win32_IP4RouteTable | Where-Object { $_.Destination -eq '0.0.0.0' -and $_.Mask -eq '0.0.0.0' }");
      const lineParts = String(data || '').split('\r\n');
      if (lineParts.length > 1) {
        result = getValue(lineParts, 'NextHop');
      }
    } catch {}
  }
  return result;
};
