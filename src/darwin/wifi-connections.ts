import { nextTick } from '../common';
import { plistParser } from '../common/darwin';
import { exec } from '../common/exec';
import { wifiFrequencyFromChannel, wifiQualityFromDB } from '../common/network';
import type { WifiConnectionData } from '../common/types';

export const wifiConnections = async () => {
  await nextTick();

  const result: WifiConnectionData[] = [];
  const { stdout } = await exec('system_profiler SPNetworkDataType SPAirPortDataType -xml 2>/dev/null; echo "######" ; ioreg -n AppleBCMWLANSkywalkInterface -r 2>/dev/null');

  try {
    const parts = stdout.toString().split('######');
    const profilerObj = plistParser(parts[0], false);
    const networkObj = profilerObj[0]._SPCommandLineArguments.includes('SPNetworkDataType') ? profilerObj[0]._items : profilerObj[1]._items;
    const airportObj = profilerObj[0]._SPCommandLineArguments.includes('SPAirPortDataType')
      ? profilerObj[0]._items[0].spairport_airport_interfaces
      : profilerObj[1]._items[0].spairport_airport_interfaces;

    const networkWifiObj = networkObj.find((item: any) => {
      return item._name === 'Wi-Fi';
    });
    const airportWifiObj = airportObj[0].spairport_current_network_information;

    const channel = Number.parseInt(`${airportWifiObj.spairport_network_channel}`.split(' ')[0], 10) || 0;
    const signalLevel = airportWifiObj.spairport_signal_noise || null;

    let security = '';
    const sm = airportWifiObj.spairport_security_mode || '';
    if (sm === 'spairport_security_mode_wep') {
      security = 'WEP';
    } else if (sm === 'spairport_security_mode_wpa2_personal') {
      security = 'WPA2';
    } else if (sm.startsWith('spairport_security_mode_wpa2_enterprise')) {
      security = 'WPA2 EAP';
    } else if (sm.startsWith('pairport_security_mode_wpa3_transition')) {
      security = 'WPA2/WPA3';
    } else if (sm.startsWith('pairport_security_mode_wpa3')) {
      security = 'WPA3';
    }

    result.push({
      id: networkWifiObj._name || 'Wi-Fi',
      networkInterface: networkWifiObj.interface || '',
      model: networkWifiObj.hardware || '',
      ssid: (airportWifiObj._name || '').replace('&lt;', '<').replace('&gt;', '>'),
      bssid: airportWifiObj.spairport_network_bssid || '',
      channel,
      frequency: channel ? wifiFrequencyFromChannel(channel) : null,
      type: airportWifiObj.spairport_network_phymode || '802.11',
      security,
      signalLevel: signalLevel ? Number.parseInt(signalLevel, 10) : null,
      quality: wifiQualityFromDB(signalLevel),
      txRate: airportWifiObj.spairport_network_rate || null
    });
  } catch {}
  return result;
};
