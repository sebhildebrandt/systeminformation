'use strict';

import * as os from 'os';
import { wifiFrequencies } from "./mappings";
import { noop, toInt } from "./index";
import { execCmd } from "./exec";
import { AIX, ANDROID, DARWIN, FREEBSD, LINUX, NETBSD, SUNOS, WINDOWS } from './const';

export const wifiDBFromQuality = (quality: string) => {
  return (parseFloat(quality) / 2 - 100);
};

export const wifiQualityFromDB = (db: number) => {
  const result = 2 * (db + 100);
  return result <= 100 ? result : 100;
};

export const wifiFrequencyFromChannel = (channel: number) => {
  return {}.hasOwnProperty.call(wifiFrequencies, channel) ? wifiFrequencies[channel] : null;
};

export const wifiChannelFromFrequencs = (frequency: number) => {
  let channel = 0;
  for (let key in wifiFrequencies) {
    if ({}.hasOwnProperty.call(wifiFrequencies, key)) {
      if (wifiFrequencies[key] === frequency) { channel = toInt(key); }
    }
  }
  return channel;
};

export const getFQDN = async () => {
  try {
    let stdout = '';
    switch (true) {
      case (LINUX || DARWIN || FREEBSD || NETBSD):
        stdout = (await execCmd('hostname -f')).toString();
        return stdout.split(os.EOL)[0];
      case (WINDOWS):
        stdout = (await execCmd('echo %COMPUTERNAME%.%USERDNSDOMAIN%')).toString();
        return stdout.toString().replace('.%USERDNSDOMAIN%', '').split(os.EOL)[0];
      default: return os.hostname();
    }
  } catch (e) {
    noop();
  }
  return os.hostname();
};

export const getUniqueMacAdresses = () => {
  const ifaces = os.networkInterfaces();
  let macs: string[] = [];
  for (let dev in ifaces) {
    if ({}.hasOwnProperty.call(ifaces, dev)) {
      ifaces[dev]?.forEach((details: any) => {
        if (details && details.mac && details.mac !== '00:00:00:00:00:00') {
          const mac = details.mac.toLowerCase();
          if (macs.indexOf(mac) === -1) {
            macs.push(mac);
          }
        }
      });
    }
  }
  macs = macs.sort((a, b) => {
    if (a < b) { return -1; }
    if (a > b) { return 1; }
    return 0;
  });
  return macs;
};
