import { EOL } from 'os';
import { execCmd } from '../common/exec';
import { toInt, getValue, nextTick } from '../common';
import { WifiNetworkData, WifiConnectionData } from '../common/types';
import { wifiDBFromQuality, wifiChannelFromFrequencies, wifiFrequencyFromChannel } from '../common/network';

type interfaceList = {
  id: number,
  networkInterface: string,
  mac: string,
  channel: number;
};

const interfaceListLinux = async () => {
  const result: interfaceList[] = [];
  const cmd = 'iw dev';
  try {
    const all = (await execCmd(cmd)).toString().split('\n').map((line: string) => line.trim()).join('\n');
    const parts = all.split('\nInterface ');
    parts.shift();
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
  } catch (e) {
    return [];
  }
};

const nmiDeviceLinux = async (networkInterface: string) => {
  const cmd = `nmcli -t -f general,wifi-properties,capabilities,ip4,ip6 device show ${networkInterface} 2>/dev/null`;
  try {
    const lines = (await execCmd(cmd)).toString().split('\n');
    const ssid = getValue(lines, 'GENERAL.CONNECTION');
    return {
      networkInterface,
      type: getValue(lines, 'GENERAL.TYPE'),
      vendor: getValue(lines, 'GENERAL.VENDOR'),
      product: getValue(lines, 'GENERAL.PRODUCT'),
      mac: getValue(lines, 'GENERAL.HWADDR').toLowerCase(),
      ssid: ssid !== '--' ? ssid : null
    };
  } catch (e) {
    return {};
  }
};

const nmiConnectionLinux = async (ssid: string) => {
  const cmd = `nmcli -t --show-secrets connection show ${ssid} 2>/dev/null`;
  try {
    const lines = (await execCmd(cmd)).toString().split('\n');
    const bssid = getValue(lines, '802-11-wireless.seen-bssids').toLowerCase();
    return {
      ssid: ssid !== '--' ? ssid : null,
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
  const cmd = `wpa_cli -i ${networkInterface} status 2>&1`;
  try {
    const lines = (await execCmd(cmd)).toString().split('\n');
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
  const cmd = 'nmcli -t -m multiline --fields active,ssid,bssid,mode,chan,freq,signal,security,wpa-flags,rsn-flags device wifi list 2>/dev/null';
  try {
    const stdout = await execCmd(cmd);
    const parts = stdout.toString().split('ACTIVE:');
    parts.shift();
    parts.forEach((part: string) => {
      part = 'ACTIVE:' + part;
      const lines = part.split(EOL);
      const channel = getValue(lines, 'CHAN');
      const frequency = getValue(lines, 'FREQ').toLowerCase().replace('mhz', '').trim();
      const security = getValue(lines, 'SECURITY').replace('(', '').replace(')', '');
      const wpaFlags = getValue(lines, 'WPA-FLAGS').replace('(', '').replace(')', '');
      const rsnFlags = getValue(lines, 'RSN-FLAGS').replace('(', '').replace(')', '');
      result.push({
        ssid: getValue(lines, 'SSID'),
        bssid: getValue(lines, 'BSSID').toLowerCase(),
        mode: getValue(lines, 'MODE'),
        channel: channel ? parseInt(channel, 10) : null,
        frequency: frequency ? parseInt(frequency, 10) : null,
        signalLevel: wifiDBFromQuality(getValue(lines, 'SIGNAL')),
        quality: parseFloat(getValue(lines, 'SIGNAL')),
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

export const linuxWifiConnections = async () => {
  const result: WifiConnectionData[] = [];
  const interfaces = await interfaceListLinux();
  const networkList = await getWifiNetworkListNmi();
  interfaces.forEach(async (interfaceDetail) => {
    const nmiDetails = await nmiDeviceLinux(interfaceDetail.networkInterface);
    const wpaDetails = await wpaConnectionLinux(interfaceDetail.networkInterface);
    const ssid = nmiDetails.ssid || wpaDetails.ssid;
    const network = networkList.filter(nw => nw.ssid === ssid);
    const nmiConnection = await nmiConnectionLinux(ssid || '');
    const channel = network && network.length && network[0].channel ? network[0].channel : (wpaDetails.channel ? wpaDetails.channel : null);
    const bssid = network && network.length && network[0].bssid ? network[0].bssid : (wpaDetails.bssid ? wpaDetails.bssid : null);
    if (ssid && bssid) {
      result.push({
        id: '' + interfaceDetail.id,
        networkInterface: interfaceDetail.networkInterface,
        model: nmiDetails.product || null,
        ssid,
        bssid: network && network.length && network[0].bssid ? network[0].bssid : (wpaDetails.bssid ? wpaDetails.bssid : null),
        channel,
        frequency: channel ? wifiFrequencyFromChannel(channel) : null,
        type: nmiConnection.type ? nmiConnection.type : '802.11',
        security: nmiConnection.security ? nmiConnection.security : (wpaDetails.security ? wpaDetails.security : null),
        signalLevel: network && network.length && network[0].signalLevel ? network[0].signalLevel : null,
        txRate: null
      });
    }
  });
  return result;
};

export const wifiConnections = async () => {
  await nextTick();
  return linuxWifiConnections();
};
