import { EOL } from 'node:os';
import { nextTick, toInt } from '../common';
import { wifiDBFromQuality, wifiFrequencyFromChannel } from '../common/network';
import type { WifiNetworkData } from '../common/types';
import { ps } from '../common/windows';

export const wifiNetworks = async () => {
  await nextTick();
  const result: WifiNetworkData[] = [];
  let stdout = '';
  try {
    stdout = String((await ps.exec('netsh wlan show networks mode=Bssid')) || '');
  } catch {
    return result;
  }
  const ssidParts = stdout.split(`${EOL + EOL}SSID `).splice(1);

  ssidParts.forEach((ssidPart: string) => {
    const ssidLines = ssidPart.split(EOL);
    if (ssidLines && ssidLines.length >= 8 && ssidLines[0].indexOf(':') >= 0) {
      const bssidsParts = ssidPart.split(' BSSID').splice(1);

      bssidsParts.forEach((bssidPart) => {
        const bssidLines = bssidPart.split(EOL);
        const bssidLine = bssidLines[0].split(':').splice(1);
        const bssid = bssidLine.join(':').trim().toLowerCase();
        if (bssid && bssidLines && bssidLines.length > 3) {
          const channel = toInt((bssidLines[3].split(':').pop() || '').trim());
          const quality = (bssidLines[1].split(':').pop() || '').trim();
          const securityStr = (ssidLines[2].split(':').pop() || '').trim();
          const wpaStr = (ssidLines[3].split(':').pop() || '').trim();

          result.push({
            ssid: (ssidLines[0].split(':').pop() || '').trim(),
            bssid,
            mode: '',
            channel: channel || null,
            frequency: wifiFrequencyFromChannel(channel),
            signalLevel: wifiDBFromQuality(quality),
            quality: quality ? parseInt(quality, 10) : null,
            security: securityStr ? [securityStr] : [],
            wpaFlags: wpaStr ? [wpaStr] : [],
            rsnFlags: []
          });
        }
      });
    }
  });

  return result;
};
