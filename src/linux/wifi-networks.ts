import { EOL } from 'node:os';
import { getValue, nextTick, toInt } from '../common';
import { execOptsLinux } from '../common/const';
import { exec, timeout } from '../common/exec';
import { wifiDBFromQuality, wifiQualityFromDB } from '../common/network';
import { sanitizeShellString } from '../common/security';
import type { WifiNetworkData } from '../common/types';

const getWifiNetworkListNmi = async () => {
  const result: WifiNetworkData[] = [];
  try {
    const { stdout } = await exec('nmcli -t -m multiline --fields active,ssid,bssid,mode,chan,freq,signal,security,wpa-flags,rsn-flags device wifi list 2>/dev/null', execOptsLinux);
    const parts = stdout.toString().split('ACTIVE:').splice(1);
    parts.forEach((part: string) => {
      part = `ACTIVE:${part}`;
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
        channel: channel ? Number.parseInt(channel, 10) : null,
        frequency: frequency ? Number.parseInt(frequency, 10) : null,
        signalLevel: wifiDBFromQuality(quality),
        quality: quality ? Number.parseInt(quality, 10) : null,
        security: security && security !== 'none' ? security.split(' ') : [],
        wpaFlags: wpaFlags && wpaFlags !== 'none' ? wpaFlags.split(' ') : [],
        rsnFlags: rsnFlags && rsnFlags !== 'none' ? rsnFlags.split(' ') : []
      });
    });
    return result;
  } catch {
    return [];
  }
};

const getWifiNetworkListIw = async (networkInterface: string) => {
  const result: WifiNetworkData[] = [];
  try {
    const { stdout } = await exec(`export LC_ALL=C; iwlist ${networkInterface} scan 2>&1; unset LC_ALL`, execOptsLinux);
    let iwlistParts = stdout.split('        Cell ');
    if (iwlistParts[0].indexOf('resource busy') >= 0) {
      return -1;
    }
    if (iwlistParts.length > 1) {
      iwlistParts = iwlistParts.splice(1);
      iwlistParts.forEach((element) => {
        const lines = element.split('\n');
        const channel = getValue(lines, 'channel', ':', true);
        const address = lines && lines.length && lines[0].indexOf('Address:') >= 0 ? lines[0].split('Address:')[1].trim().toLowerCase() : '';
        const mode = getValue(lines, 'mode', ':', true);
        const frequency = getValue(lines, 'frequency', ':', true);
        const qualityString = getValue(lines, 'Quality', '=', true);
        const dbParts = qualityString.toLowerCase().split('signal level=');
        const db = dbParts.length > 1 ? toInt(dbParts[1]) : 0;
        const quality = db ? wifiQualityFromDB(db) : 0;
        const ssid = getValue(lines, 'essid', ':', true);

        // security and wpa-flags
        const isWpa = element.indexOf(' WPA ') >= 0;
        const isWpa2 = element.indexOf('WPA2 ') >= 0;
        const security = [];
        if (isWpa) {
          security.push('WPA');
        }
        if (isWpa2) {
          security.push('WPA2');
        }
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
              if (parts[1].indexOf('tkip') >= 0) {
                wpaFlag = wpaFlag ? 'TKIP/' + wpaFlag : 'TKIP';
              } else if (parts[1].indexOf('ccmp') >= 0) {
                wpaFlag = wpaFlag ? 'CCMP/' + wpaFlag : 'CCMP';
              } else if (parts[1].indexOf('proprietary') >= 0) {
                wpaFlag = wpaFlag ? 'PROP/' + wpaFlag : 'PROP';
              }
            }
          }
          if (l.indexOf('authentication suites') >= 0) {
            const parts = l.split(':');
            if (parts.length > 1) {
              if (parts[1].indexOf('802.1x') >= 0) {
                wpaFlag = wpaFlag ? '802.1x/' + wpaFlag : '802.1x';
              } else if (parts[1].indexOf('psk') >= 0) {
                wpaFlag = wpaFlag ? 'PSK/' + wpaFlag : 'PSK';
              }
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
      });
    }
    return result;
  } catch {
    return -1;
  }
};

export const wifiNetworks = async () => {
  await nextTick();
  let result: WifiNetworkData[] = await getWifiNetworkListNmi();
  if (result.length === 0) {
    try {
      const { stdout } = await exec('export LC_ALL=C; iwconfig 2>/dev/null; unset LC_ALL', execOptsLinux);
      const iwconfigParts = stdout.split('\n\n');
      let networkInterface = '';
      iwconfigParts.forEach((element) => {
        if (element.indexOf('no wireless') === -1 && element.trim() !== '') {
          networkInterface = element.split(' ')[0];
        }
      });
      if (networkInterface) {
        const networkInterfaceSanitized = sanitizeShellString(networkInterface, true);
        const res = await getWifiNetworkListIw(networkInterfaceSanitized);
        if (res === -1) {
          // try again after 4 secs
          await timeout(4000);
          const res = await getWifiNetworkListIw(networkInterfaceSanitized);
          if (res !== -1) {
            result = res;
          }
          return result;
        } else {
          result = res;
          return result;
        }
      } else {
        return result;
      }
    } catch {
      return result;
    }
  } else {
    return result;
  }
};
