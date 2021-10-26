import { EOL } from 'os';
import { execCmd, timeout } from '../common/exec';
import { toInt, getValue, nextTick } from '../common';
import { WifiNetworkData } from '../common/types';
import { wifiDBFromQuality, wifiQualityFromDB } from '../common/network';

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

const getWifiNetworkListIw = async (networkInterface: string) => {
  const result: WifiNetworkData[] = [];
  try {
    const iwlistParts = (await execCmd(`export LC_ALL=C; iwlist ${networkInterface} scan 2>&1; unset LC_ALL`)).toString().split('        Cell ');
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

export const linuxWifiNetwork = async () => {
  let result: WifiNetworkData[] = await getWifiNetworkListNmi();
  if (result.length === 0) {
    try {
      const iwconfigParts = (await execCmd('export LC_ALL=C; iwconfig 2>/dev/null; unset LC_ALL')).toString().split('\n\n');
      let networkInterface = '';
      for (let i = 0; i < iwconfigParts.length; i++) {
        if (iwconfigParts[i].indexOf('no wireless') === -1 && iwconfigParts[i].trim() !== '') {
          networkInterface = iwconfigParts[i].split(' ')[0];
        }
      }
      if (networkInterface) {
        const res = await getWifiNetworkListIw(networkInterface);
        if (res === -1) {
          // try again after 4 secs
          await timeout(4000);
          const res = await getWifiNetworkListIw(networkInterface);
          if (res != -1) { result = res; }
          return result;
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

export const wifiNetworks = async () => {
  await nextTick();
  return linuxWifiNetwork();
};

