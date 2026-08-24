import { nextTick } from '../common';
import { plistParser } from '../common/darwin';
import { exec } from '../common/exec';
import { wifiFrequencyFromChannel, wifiQualityFromDB } from '../common/network';
import type { WifiNetworkData } from '../common/types';

const parseWifiNetworks = (wifiObj: any) => {
  const result: WifiNetworkData[] = [];
  try {
    wifiObj = wifiObj[0].spairport_airport_interfaces[0].spairport_airport_other_local_wireless_networks;
    wifiObj.forEach((wifiItem: any) => {
      const security: string[] = [];
      const sm = wifiItem.spairport_security_mode || '';
      if (sm === 'spairport_security_mode_wep') {
        security.push('WEP');
      } else if (sm === 'spairport_security_mode_wpa2_personal') {
        security.push('WPA2');
      } else if (sm.startsWith('spairport_security_mode_wpa2_enterprise')) {
        security.push('WPA2 EAP');
      } else if (sm.startsWith('pairport_security_mode_wpa3_transition')) {
        security.push('WPA2/WPA3');
      } else if (sm.startsWith('pairport_security_mode_wpa3')) {
        security.push('WPA3');
      }
      const channel = Number.parseInt(`${wifiItem.spairport_network_channel}`.split(' ')[0], 10) || 0;
      const signalLevel = wifiItem.spairport_signal_noise || null;

      result.push({
        ssid: wifiItem._name || '',
        bssid: wifiItem.spairport_network_bssid || null,
        mode: wifiItem.spairport_network_phymode,
        channel,
        frequency: wifiFrequencyFromChannel(channel),
        signalLevel: signalLevel ? Number.parseInt(signalLevel, 10) : null,
        quality: wifiQualityFromDB(signalLevel),
        security,
        wpaFlags: [],
        rsnFlags: []
      });
    });
    return result;
  } catch {
    return result;
  }
};

export const wifiNetworks = async () => {
  await nextTick();
  const result: WifiNetworkData[] = [];
  try {
    const { stdout } = await exec('system_profiler SPAirPortDataType -xml');
    return parseWifiNetworks(plistParser(stdout));
  } catch {}
  return result;
};
