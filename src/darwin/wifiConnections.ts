'use strict';

import { execCmd } from '../common/exec';
import { toInt, getValue, nextTick } from '../common';
import { WifiConnectionData } from '../common/types';
import { wifiFrequencyFromChannel } from '../common/network';

export const darwinWifiConnections = async () => {
  const result: WifiConnectionData[] = [];
  let stdout = await execCmd('system_profiler SPNetworkDataType');
  const parts1 = stdout.toString().split('\n\n    Wi-Fi:\n\n');
  if (parts1.length > 1) {
    const lines = parts1[1].split('\n\n')[0].split('\n');
    const iface = getValue(lines, 'BSD Device Name', ':', true);
    const model = getValue(lines, 'hardware', ':', true);
    stdout = await execCmd('/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport -I');
    const lines2 = stdout.toString().split('\n');
    if (lines.length > 10) {
      const ssid = getValue(lines2, 'ssid', ':', true);
      const bssid = getValue(lines2, 'bssid', ':', true);
      const security = getValue(lines2, 'link auth', ':', true);
      const txRate = getValue(lines2, 'lastTxRate', ':', true);
      const channel = toInt(getValue(lines2, 'channel', ':', true).split(',')[0]);
      const type = '802.11';
      const rssi = toInt(getValue(lines2, 'agrCtlRSSI', ':', true));
      const noise = toInt(getValue(lines2, 'agrCtlNoise', ':', true));
      const signalLevel = rssi - noise;
      // const signal = wifiQualityFromDB(signalLevel);
      if (ssid && bssid) {
        result.push({
          id: 'Wi-Fi',
          iface,
          model,
          ssid,
          bssid,
          channel,
          frequency: channel ? wifiFrequencyFromChannel(channel) : null,
          type,
          security,
          signalLevel,
          txRate: parseFloat(txRate) || null
        });
      }
    }
    return result;
  }
};

export const wifiConnections = async () => {
  await nextTick();
  return darwinWifiConnections();
};
