'use strict';

import { nextTick } from '../common';
import { powerShell } from '../common/exec';
import { WifiInterfaceData } from '../common/types';
import { wifiVendor } from '../common/mappings';

export const windowsWifiInterfaces = async () => {
  const result: WifiInterfaceData[] = [];
  const stdout = await powerShell('netsh wlan show interfaces');
  const allLines = stdout.toString().split('\r\n');
  for (let i = 0; i < allLines.length; i++) {
    allLines[i] = allLines[i].trim();
  }
  const parts = allLines.join('\r\n').split(':\r\n\r\n');
  parts.shift();
  parts.forEach(part => {
    const lines = part.split('\r\n');
    if (lines.length >= 5) {
      const iface = lines[0].indexOf(':') >= 0 ? lines[0].split(':')[1].trim() : '';
      const model = lines[1].indexOf(':') >= 0 ? lines[1].split(':')[1].trim() : '';
      const id = lines[2].indexOf(':') >= 0 ? lines[2].split(':')[1].trim() : '';
      const macParts = lines[3].indexOf(':') >= 0 ? lines[3].split(':') : [];
      macParts.shift();
      const mac = macParts.join(':').trim();
      const vendor = wifiVendor(model);
      if (iface && model && id && mac) {
        result.push({
          id,
          iface,
          model,
          vendor,
          mac,
        });
      }
    }
  });
  return result;
};

export const wifiInterfaces = async () => {
  await nextTick();
  return windowsWifiInterfaces();
};
