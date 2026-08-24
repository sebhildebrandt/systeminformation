import { nextTick } from '../common';
import { wifiVendor } from '../common/mappings';
import type { WifiInterfaceData } from '../common/types';
import { ps } from '../common/windows';

export const wifiInterfaces = async () => {
  await nextTick();
  const result: WifiInterfaceData[] = [];
  let stdout = '';
  try {
    stdout = String((await ps.exec('netsh wlan show interfaces')) || '');
  } catch {
    return result;
  }
  const allLines = stdout.split('\r\n');
  for (let i = 0; i < allLines.length; i++) {
    allLines[i] = allLines[i].trim();
  }
  const parts = allLines.join('\r\n').split(':\r\n\r\n').splice(1);
  parts.forEach((part) => {
    const lines = part.split('\r\n');
    if (lines.length >= 5) {
      const networkInterface = lines[0].indexOf(':') >= 0 ? lines[0].split(':')[1].trim() : '';
      const model = lines[1].indexOf(':') >= 0 ? lines[1].split(':')[1].trim() : '';
      const id = lines[2].indexOf(':') >= 0 ? lines[2].split(':')[1].trim() : '';
      let macParts = lines[3].indexOf(':') >= 0 ? lines[3].split(':') : [];
      macParts = macParts.splice(1);
      const mac = macParts.join(':').trim();
      const vendor = wifiVendor(model);
      if (networkInterface && model && id && mac) {
        result.push({
          id,
          networkInterface,
          model,
          vendor,
          mac
        });
      }
    }
  });
  return result;
};
