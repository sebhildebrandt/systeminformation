import { EOL } from 'os';
import { powerShell } from '../common/exec';
import { nextTick, toInt } from '../common';
import { WifiNetworkData } from '../common/types';
import { wifiDBFromQuality, wifiFrequencyFromChannel } from '../common/network';

export const windowsWifiNetwork = async () => {
  const result: WifiNetworkData[] = [];
  const stdout = await powerShell('netsh wlan show networks mode=Bssid');
  const ssidParts = stdout.toString().split(EOL + EOL + 'SSID ');
  ssidParts.shift();

  ssidParts.forEach((ssidPart: string) => {
    const ssidLines = ssidPart.split(EOL);
    if (ssidLines && ssidLines.length >= 8 && ssidLines[0].indexOf(':') >= 0) {
      const bssidsParts = ssidPart.split(' BSSID');
      bssidsParts.shift();

      bssidsParts.forEach((bssidPart) => {
        const bssidLines = bssidPart.split(EOL);
        const bssidLine = bssidLines[0].split(':');
        bssidLine.shift();
        const bssid = bssidLine.join(':').trim().toLowerCase();
        if (bssidLines && bssidLines.length > 3) {
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

export const wifiNetworks = async () => {
  await nextTick();
  return windowsWifiNetwork();
};
