import { getValue, nextTick, toInt } from '../common';
import { wifiDBFromQuality, wifiFrequencyFromChannel } from '../common/network';
import type { WifiConnectionData } from '../common/types';
import { ps } from '../common/windows';

export const wifiConnections = async () => {
  await nextTick();
  const result: WifiConnectionData[] = [];
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
  parts.forEach((part: string) => {
    const lines = part.split('\r\n');
    if (lines.length >= 5) {
      const networkInterface = lines[0].indexOf(':') >= 0 ? lines[0].split(':')[1].trim() : '';
      const model = lines[1].indexOf(':') >= 0 ? lines[1].split(':')[1].trim() : '';
      const id = lines[2].indexOf(':') >= 0 ? lines[2].split(':')[1].trim() : '';
      const ssid = getValue(lines, 'SSID', ':', true);
      const bssid = getValue(lines, 'BSSID', ':', true) || getValue(lines, 'AP BSSID', ':', true);
      const quality = getValue(lines, 'Signal', ':', true);
      const signalLevel = wifiDBFromQuality(quality);
      const type = getValue(lines, 'Radio type', ':', true) || getValue(lines, 'Type de radio', ':', true) || getValue(lines, 'Funktyp', ':', true) || null;
      const security = getValue(lines, 'authentication', ':', true) || getValue(lines, 'Authentification', ':', true) || getValue(lines, 'Authentifizierung', ':', true) || null;
      const channel = toInt(getValue(lines, 'Channel', ':', true) || getValue(lines, 'Canal', ':', true) || getValue(lines, 'Kanal', ':', true)) || null;
      const txRate = getValue(lines, 'Transmit rate (mbps)', ':', true) || getValue(lines, 'Transmission (mbit/s)', ':', true) || getValue(lines, 'Empfangsrate (MBit/s)', ':', true) || null;
      if (model && id && ssid && bssid) {
        result.push({
          id,
          networkInterface,
          model,
          ssid,
          bssid,
          channel: channel,
          frequency: channel ? wifiFrequencyFromChannel(channel) : null,
          type,
          security,
          signalLevel,
          quality: quality ? parseInt(quality, 10) : null,
          txRate: toInt(txRate) || null
        });
      }
    }
  });
  return result;
};
