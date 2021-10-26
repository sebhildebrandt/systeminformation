import * as os from 'os';
import { execCmd, powerShell } from './common/exec';
import { toInt, getValue } from './common';
import { WifiNetworkData, WifiConnectionData, WifiInterfaceData } from './common/types';
import { wifiFrequencies, wifiVendor } from "./common/mappings";
import { parseHead } from './common/parse';

const wifiDBFromQuality = (quality: string) => {
  return (parseFloat(quality) / 2 - 100);
};

const wifiQualityFromDB = (db: number) => {
  const result = 2 * (db + 100);
  return result <= 100 ? result : 100;
};

const wifiFrequencyFromChannel = (channel: number) => {
  return {}.hasOwnProperty.call(wifiFrequencies, channel) ? wifiFrequencies[channel] : null;
};

const wifiChannelFromFrequencs = (frequency: number) => {
  let channel = 0;
  for (let key in wifiFrequencies) {
    if ({}.hasOwnProperty.call(wifiFrequencies, key)) {
      if (wifiFrequencies[key] === frequency) { channel = toInt(key); }
    }
  }
  return channel;
};

type ifaceList = {
  id: number,
  iface: string,
  mac: string,
  channel: number;
};
const ifaceListLinux = async () => {
  const result: ifaceList[] = [];
  const cmd = 'iw dev';
  try {
    const all = (await execCmd(cmd)).toString().split('\n').map((line: string) => line.trim()).join('\n');
    const parts = all.split('\nInterface ');
    parts.shift();
    parts.forEach((ifaceDetails: string) => {
      const lines = ifaceDetails.split('\n');
      const iface = lines[0];
      const id = toInt(getValue(lines, 'ifindex', ' '));
      const mac = getValue(lines, 'addr', ' ');
      const channel = toInt(getValue(lines, 'channel', ' '));
      result.push({
        id,
        iface,
        mac,
        channel
      });
    });
    return result;
  } catch (e) {
    return [];
  }
};

const nmiDeviceLinux = async (iface: string) => {
  const cmd = `nmcli -t -f general,wifi-properties,capabilities,ip4,ip6 device show ${iface} 2>/dev/null`;
  try {
    const lines = (await execCmd(cmd)).toString().split('\n');
    const ssid = getValue(lines, 'GENERAL.CONNECTION');
    return {
      iface,
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

const wpaConnectionLinux = async (iface: string) => {
  const cmd = `wpa_cli -i ${iface} status 2>&1`;
  try {
    const lines = (await execCmd(cmd)).toString().split('\n');
    const freq = toInt(getValue(lines, 'freq', '='));
    return {
      ssid: getValue(lines, 'ssid', '='),
      uuid: getValue(lines, 'uuid', '='),
      security: getValue(lines, 'key_mgmt', '='),
      freq,
      channel: wifiChannelFromFrequencs(freq),
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
    const stdout = (await execCmd(cmd));
    const parts = stdout.toString().split('ACTIVE:');
    parts.shift();
    parts.forEach((part: string) => {
      part = 'ACTIVE:' + part;
      const lines = part.split(os.EOL);
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

const getWifiNetworkListIw = async (iface: string) => {
  const result: WifiNetworkData[] = [];
  try {
    let iwlistParts = (await execCmd(`export LC_ALL=C; iwlist ${iface} scan 2>&1; unset LC_ALL`)).toString().split('        Cell ');
    if (iwlistParts[0].indexOf('resource busy') >= 0) { return -1; }
    if (iwlistParts.length > 1) {
      iwlistParts.shift();
      for (let i = 0; i < iwlistParts.length; i++) {
        const lines = iwlistParts[i].split('\n');
        const channel = getValue(lines, 'channel', ':', true);
        const address = (lines && lines.length && lines[0].indexOf('Address:') >= 0 ? lines[0].split('Address:')[1].trim().toLowerCase() : '');
        const mode = getValue(lines, 'mode', ':', true);
        const frequency = getValue(lines, 'frequency', ':', true);
        const qualityString = getValue(lines, 'Quality', '=', true);
        const dbParts = qualityString.toLowerCase().split('signal level=');
        const db = dbParts.length > 1 ? toInt(dbParts[1]) : 0;
        const quality = db ? wifiQualityFromDB(db) : 0;
        const ssid = getValue(lines, 'essid', ':', true);

        // security and wpa-flags
        const isWpa = iwlistParts[i].indexOf(' WPA ') >= 0;
        const isWpa2 = iwlistParts[i].indexOf('WPA2 ') >= 0;
        const security = [];
        if (isWpa) { security.push('WPA'); }
        if (isWpa2) { security.push('WPA2'); }
        const wpaFlags = [];
        let wpaFlag = '';
        lines.forEach((line: string) => {
          const l = line.trim().toLowerCase();
          if (l.indexOf('group cipher') >= 0) {
            if (wpaFlag) {
              wpaFlags.push(wpaFlag);
            }
            const parts = l.split(':');
            if (parts.length > 1) {
              wpaFlag = parts[1].trim().toUpperCase();
            }
          }
          if (l.indexOf('pairwise cipher') >= 0) {
            const parts = l.split(':');
            if (parts.length > 1) {
              if (parts[1].indexOf('tkip')) { wpaFlag = (wpaFlag ? 'TKIP/' + wpaFlag : 'TKIP'); }
              else if (parts[1].indexOf('ccmp')) { wpaFlag = (wpaFlag ? 'CCMP/' + wpaFlag : 'CCMP'); }
              else if (parts[1].indexOf('proprietary')) { wpaFlag = (wpaFlag ? 'PROP/' + wpaFlag : 'PROP'); }
            }
          }
          if (l.indexOf('authentication suites') >= 0) {
            const parts = l.split(':');
            if (parts.length > 1) {
              if (parts[1].indexOf('802.1x')) { wpaFlag = (wpaFlag ? '802.1x/' + wpaFlag : '802.1x'); }
              else if (parts[1].indexOf('psk')) { wpaFlag = (wpaFlag ? 'PSK/' + wpaFlag : 'PSK'); }
            }
          }
        });
        if (wpaFlag) {
          wpaFlags.push(wpaFlag);
        }

        result.push({
          ssid,
          bssid: address,
          mode,
          channel: channel ? toInt(channel) : null,
          frequency: frequency ? toInt(frequency.replace('.', '')) : null,
          signalLevel: db,
          quality,
          security,
          wpaFlags,
          rsnFlags: []
        });
      }
    }
    return result;
  } catch (e) {
    return -1;
  }
};

const linuxWifiNetwork = async () => {
  let result: WifiNetworkData[] = await getWifiNetworkListNmi();
  if (result.length === 0) {
    try {
      const iwconfigParts = (await execCmd('export LC_ALL=C; iwconfig 2>/dev/null; unset LC_ALL')).toString().split('\n\n');
      let iface = '';
      for (let i = 0; i < iwconfigParts.length; i++) {
        if (iwconfigParts[i].indexOf('no wireless') === -1 && iwconfigParts[i].trim() !== '') {
          iface = iwconfigParts[i].split(' ')[0];
        }
      }
      if (iface) {
        const res = await getWifiNetworkListIw(iface);
        if (res === -1) {
          // try again after 4 secs
          setTimeout(async (iface: string) => {
            const res = await getWifiNetworkListIw(iface);
            if (res != -1) { result = res; }
            return result;
          }, 4000);
        } else {
          result = res;
          return result;
        }
      } else {
        return result;
      }
    } catch (e) {
      return result;
    }
  } else {
    return result;
  }
};

const darwinWifiNetwork = async () => {
  let result: WifiNetworkData[] = [];
  const stdout = await execCmd('/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport -s');
  const lines = stdout.toString().split(os.EOL);
  if (lines && lines.length > 1) {
    const parsedhead = parseHead(lines[0], 1);
    if (parsedhead.length >= 7) {
      lines.shift();
      lines.forEach((line: string) => {
        if (line.trim()) {
          const channelStr = line.substring(parsedhead[3].from, parsedhead[3].to).trim();
          const channel = channelStr ? parseInt(channelStr, 10) : null;
          const signalLevel = toInt(line.substring(parsedhead[2].from, parsedhead[2].to).trim()) || null;
          const securityAll = line.substring(parsedhead[6].from, 1000).trim().split(' ');
          let security: string[] = [];
          let wpaFlags: string[] = [];
          securityAll.forEach((securitySingle: string) => {
            if (securitySingle.indexOf('(') > 0) {
              const parts = securitySingle.split('(');
              security.push(parts[0]);
              wpaFlags = wpaFlags.concat(parts[1].replace(')', '').split(','));
            }
          });
          wpaFlags = Array.from(new Set(wpaFlags));
          result.push({
            ssid: line.substring(parsedhead[0].from, parsedhead[0].to).trim(),
            bssid: line.substring(parsedhead[1].from, parsedhead[1].to).trim().toLowerCase(),
            mode: '',
            channel,
            frequency: wifiFrequencyFromChannel(channel || 0),
            signalLevel,
            quality: wifiQualityFromDB(signalLevel || 0),
            security,
            wpaFlags,
            rsnFlags: []
          });
        }
      });
    }
  }
  return result;
};

const windowsWifiNetwork = async () => {
  let result: WifiNetworkData[] = [];
  let cmd = 'netsh wlan show networks mode=Bssid';
  const stdout = await powerShell(cmd);
  const ssidParts = stdout.toString().split(os.EOL + os.EOL + 'SSID ');
  ssidParts.shift();

  ssidParts.forEach((ssidPart: string) => {
    const ssidLines = ssidPart.split(os.EOL);
    if (ssidLines && ssidLines.length >= 8 && ssidLines[0].indexOf(':') >= 0) {
      const bssidsParts = ssidPart.split(' BSSID');
      bssidsParts.shift();

      bssidsParts.forEach((bssidPart) => {
        const bssidLines = bssidPart.split(os.EOL);
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

// ----------------



const linuxWifiConnections = async () => {
  let result: WifiConnectionData[] = [];
  const ifaces = await ifaceListLinux();
  const networkList = await getWifiNetworkListNmi();
  ifaces.forEach(async (ifaceDetail) => {
    const nmiDetails = await nmiDeviceLinux(ifaceDetail.iface);
    const wpaDetails = await wpaConnectionLinux(ifaceDetail.iface);
    const ssid = nmiDetails.ssid || wpaDetails.ssid;
    const network = networkList.filter(nw => nw.ssid === ssid);
    const nmiConnection = await nmiConnectionLinux(ssid || '');
    const channel = network && network.length && network[0].channel ? network[0].channel : (wpaDetails.channel ? wpaDetails.channel : null);
    const bssid = network && network.length && network[0].bssid ? network[0].bssid : (wpaDetails.bssid ? wpaDetails.bssid : null);
    if (ssid && bssid) {
      result.push({
        id: '' + ifaceDetail.id,
        iface: ifaceDetail.iface,
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

const darwinWifiConnections = async () => {
  let result: WifiConnectionData[] = [];
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

const windowsWifiConnections = async () => {
  let result: WifiConnectionData[] = [];
  let cmd = 'netsh wlan show interfaces';
  const stdout = powerShell(cmd);
  const allLines = stdout.toString().split('\r\n');
  for (let i = 0; i < allLines.length; i++) {
    allLines[i] = allLines[i].trim();
  }
  const parts = allLines.join('\r\n').split(':\r\n\r\n');
  parts.shift();
  parts.forEach((part: string) => {
    const lines = part.split('\r\n');
    if (lines.length >= 5) {
      const iface = lines[0].indexOf(':') >= 0 ? lines[0].split(':')[1].trim() : '';
      const model = lines[1].indexOf(':') >= 0 ? lines[1].split(':')[1].trim() : '';
      const id = lines[2].indexOf(':') >= 0 ? lines[2].split(':')[1].trim() : '';
      const ssid = getValue(lines, 'SSID', ':', true);
      const bssid = getValue(lines, 'BSSID', ':', true);
      const signalLevel = getValue(lines, 'Signal', ':', true);
      const type = getValue(lines, 'Radio type', ':', true) || getValue(lines, 'Type de radio', ':', true) || getValue(lines, 'Funktyp', ':', true) || null;
      const security = getValue(lines, 'authentication', ':', true) || getValue(lines, 'Authentification', ':', true) || getValue(lines, 'Authentifizierung', ':', true) || null;
      const channel = toInt(getValue(lines, 'Channel', ':', true) || getValue(lines, 'Canal', ':', true) || getValue(lines, 'Kanal', ':', true)) || null;
      const txRate = getValue(lines, 'Transmit rate (mbps)', ':', true) || getValue(lines, 'Transmission (mbit/s)', ':', true) || getValue(lines, 'Empfangsrate (MBit/s)', ':', true) || null;
      if (model && id && ssid && bssid) {
        result.push({
          id,
          iface,
          model,
          ssid,
          bssid,
          channel: channel,
          frequency: channel ? wifiFrequencyFromChannel(channel) : null,
          type,
          security,
          signalLevel: parseFloat(signalLevel) || null,
          txRate: toInt(txRate) || null
        });
      }
    }
  });
  return result;
};


// ----------------

const linuxWifiInterfaces = async () => {
  let result: WifiInterfaceData[] = [];
  const ifaces = await ifaceListLinux();
  ifaces.forEach(async (ifaceDetail) => {
    const nmiDetails = await nmiDeviceLinux(ifaceDetail.iface);
    result.push({
      id: '' + ifaceDetail.id,
      iface: ifaceDetail.iface,
      model: nmiDetails.product ? nmiDetails.product : null,
      vendor: nmiDetails.vendor ? nmiDetails.vendor : null,
      mac: ifaceDetail.mac,
    });
  });
  return result;
};

const darwinWifiInterfaces = async () => {
  let result: WifiInterfaceData[] = [];
  const stdout = await exec('system_profiler SPNetworkDataType');
  const parts1 = stdout.toString().split('\n\n    Wi-Fi:\n\n');
  if (parts1.length > 1) {
    const lines = parts1[1].split('\n\n')[0].split('\n');
    const iface = getValue(lines, 'BSD Device Name', ':', true);
    const mac = getValue(lines, 'MAC Address', ':', true);
    const model = getValue(lines, 'hardware', ':', true);
    result.push({
      id: 'Wi-Fi',
      iface,
      model,
      vendor: '',
      mac
    });
  }
  return result;
};

const windowsWifiInterfaces = async () => {
  let result: WifiInterfaceData[] = [];
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

