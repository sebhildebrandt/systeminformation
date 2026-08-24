import { EOL } from 'node:os';
import { getValue, nextTick, toInt } from '../common';
import { execOptsLinux } from '../common/const';
import { exec, execSave } from '../common/exec';
import { wifiChannelFromFrequencies, wifiDBFromQuality, wifiFrequencyFromChannel, wifiQualityFromDB } from '../common/network';
import { sanitizeShellString } from '../common/security';
import type { WifiConnectionData, WifiNetworkData } from '../common/types';

type interfaceList = {
  id: number;
  networkInterface: string;
  mac: string;
  channel: number;
};

const interfaceListLinux = async () => {
  const result: interfaceList[] = [];
  let stdout = '';
  try {
    ({ stdout } = await exec('iw dev', execOptsLinux));
    const all = stdout
      .split('\n')
      .map((line: string) => line.trim())
      .join('\n');
    const parts = all.split('\nInterface ').splice(1);
    parts.forEach((interfaceDetails: string) => {
      const lines = interfaceDetails.split('\n');
      const networkInterface = lines[0];
      const id = toInt(getValue(lines, 'ifindex', ' '));
      const mac = getValue(lines, 'addr', ' ');
      const channel = toInt(getValue(lines, 'channel', ' '));
      result.push({
        id,
        networkInterface,
        mac,
        channel
      });
    });
    return result;
  } catch {
    try {
      ({ stdout } = await execSave('nmcli -t -f general,wifi-properties,wired-properties,interface-flags,capabilities,nsp device show 2>/dev/null'));
      const parts = stdout.split('\n\n');
      let i = 1;
      parts.forEach((ifaceDetails) => {
        const lines = ifaceDetails.split('\n');
        const networkInterface = getValue(lines, 'GENERAL.DEVICE');
        const type = getValue(lines, 'GENERAL.TYPE');
        const id = i++;
        const mac = getValue(lines, 'GENERAL.HWADDR');
        const channel = 0;
        if (type.toLowerCase() === 'wifi') {
          result.push({
            id,
            networkInterface,
            mac,
            channel
          });
        }
      });
      return result;
    } catch {
      return [];
    }
  }
};

const nmiDeviceLinux = async (networkInterface: string) => {
  const cmd = `nmcli -t -f general,wifi-properties,capabilities,ip4,ip6 device show ${networkInterface} 2>/dev/null`;
  try {
    const { stdout } = await exec(cmd, execOptsLinux);
    const lines = stdout.split('\n');
    const uuid = getValue(lines, 'GENERAL.CON-UUID');
    // connection name; often equals the SSID - only a fallback if the profile lookup fails
    const ssid = getValue(lines, 'GENERAL.CONNECTION');
    return {
      networkInterface,
      type: getValue(lines, 'GENERAL.TYPE'),
      vendor: getValue(lines, 'GENERAL.VENDOR'),
      product: getValue(lines, 'GENERAL.PRODUCT'),
      mac: getValue(lines, 'GENERAL.HWADDR').toLowerCase(),
      uuid: uuid !== '--' ? uuid : null,
      ssid: ssid !== '--' ? ssid : null
    };
  } catch (e) {
    return {};
  }
};

// query by connection UUID instead of connection name: names may contain spaces
// or differ from the SSID ("MySSID 1"); the real SSID comes from the profile
const nmiConnectionLinux = async (uuid: string) => {
  if (!/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(uuid)) {
    return {};
  }
  const cmd = `nmcli -t connection show ${uuid} 2>/dev/null`;
  try {
    const { stdout } = await exec(cmd, execOptsLinux);
    const lines = stdout.split('\n');

    const ssid = getValue(lines, '802-11-wireless.ssid');
    const bssid = getValue(lines, '802-11-wireless.seen-bssids').toLowerCase();
    return {
      ssid: ssid && ssid !== '--' ? ssid : null,
      uuid: getValue(lines, 'connection.uuid'),
      type: getValue(lines, 'connection.type'),
      autoconnect: getValue(lines, 'connection.autoconnect') === 'yes',
      security: getValue(lines, '802-11-wireless-security.key-mgmt'),
      bssid: bssid !== '--' ? bssid : null
    };
  } catch (e) {
    return {};
  }
};

const wpaConnectionLinux = async (networkInterface: string) => {
  if (!networkInterface) {
    return {};
  }
  const cmd = `wpa_cli -i ${networkInterface} status 2>&1`;
  try {
    const { stdout } = await exec(cmd, execOptsLinux);
    const lines = stdout.split('\n');

    const freq = toInt(getValue(lines, 'freq', '='));
    return {
      ssid: getValue(lines, 'ssid', '='),
      uuid: getValue(lines, 'uuid', '='),
      security: getValue(lines, 'key_mgmt', '='),
      freq,
      channel: wifiChannelFromFrequencies(freq),
      bssid: getValue(lines, 'bssid', '=').toLowerCase()
    };
  } catch (e) {
    return {};
  }
};

const getWifiNetworkListNmi = async () => {
  const result: WifiNetworkData[] = [];
  try {
    const { stdout } = await exec('nmcli -t -m multiline --fields active,ssid,bssid,mode,chan,freq,signal,security,wpa-flags,rsn-flags device wifi list 2>/dev/null', execOptsLinux);
    const parts = stdout.toString().split('ACTIVE:').splice(1);
    parts.forEach((part: string) => {
      part = 'ACTIVE:' + part;
      const lines = part.split(EOL);
      const channel = getValue(lines, 'CHAN');
      const frequency = getValue(lines, 'FREQ').toLowerCase().replace('mhz', '').trim();
      const security = getValue(lines, 'SECURITY').replace('(', '').replace(')', '');
      const wpaFlags = getValue(lines, 'WPA-FLAGS').replace('(', '').replace(')', '');
      const rsnFlags = getValue(lines, 'RSN-FLAGS').replace('(', '').replace(')', '');
      const quality = getValue(lines, 'SIGNAL');
      result.push({
        ssid: getValue(lines, 'SSID'),
        bssid: getValue(lines, 'BSSID').toLowerCase(),
        mode: getValue(lines, 'MODE'),
        channel: channel ? parseInt(channel, 10) : null,
        frequency: frequency ? parseInt(frequency, 10) : null,
        signalLevel: wifiDBFromQuality(quality),
        quality: quality ? parseInt(quality, 10) : null,
        security: security && security !== 'none' ? security.split(' ') : [],
        wpaFlags: wpaFlags && wpaFlags !== 'none' ? wpaFlags.split(' ') : [],
        rsnFlags: rsnFlags && rsnFlags !== 'none' ? rsnFlags.split(' ') : []
      });
    });
    return result;
  } catch (e) {
    return [];
  }
};

export const wifiConnections = async () => {
  await nextTick();
  const result: WifiConnectionData[] = [];
  const interfaces = await interfaceListLinux();
  const networkList = await getWifiNetworkListNmi();
  for (const interfaceDetail of interfaces) {
    const networkInterface = sanitizeShellString(interfaceDetail.networkInterface, true);
    const nmiDetails = await nmiDeviceLinux(networkInterface);
    const wpaDetails = await wpaConnectionLinux(networkInterface);
    const nmiConnection = await nmiConnectionLinux(nmiDetails.uuid || '');
    const ssid = nmiConnection.ssid || nmiDetails.ssid || wpaDetails.ssid;
    const network = networkList.filter((nw) => nw.ssid === ssid);
    const channel = network?.length && network[0].channel ? network[0].channel : wpaDetails.channel || null;
    const bssid = network?.length && network[0].bssid ? network[0].bssid : wpaDetails.bssid || null;
    const signalLevel = network && network.length && network[0].signalLevel ? network[0].signalLevel : 0;
    if (ssid && bssid) {
      result.push({
        id: '' + interfaceDetail.id,
        networkInterface: interfaceDetail.networkInterface,
        model: nmiDetails.product || null,
        ssid,
        bssid: network?.length && network[0].bssid ? network[0].bssid : wpaDetails.bssid || null,
        channel,
        frequency: channel ? wifiFrequencyFromChannel(channel) : null,
        type: nmiConnection.type ? nmiConnection.type : '802.11',
        security: nmiConnection.security ? nmiConnection.security : wpaDetails.security || null,
        signalLevel,
        quality: wifiQualityFromDB(signalLevel),
        txRate: null
      });
    }
  }
  return result;
};
