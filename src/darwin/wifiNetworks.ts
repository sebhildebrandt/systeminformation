'use strict';

import * as os from 'os';
import { execCmd } from '../common/exec';
import { toInt } from '../common';
import { WifiNetworkData } from '../common/types';
import { parseHead } from '../common/parse';
import { wifiQualityFromDB, wifiFrequencyFromChannel } from '../common/network';

export const darwinWifiNetwork = async () => {
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

export const wifiNetworks = () => {
  return new Promise<WifiNetworkData[] | null | undefined>(resolve => {
    process.nextTick(() => {
      return resolve(darwinWifiNetwork());
    });
  });
};
