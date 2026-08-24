import { initNetworkSpeed } from './defaults';
import { cloneObj, toInt } from './index';
import { wifiFrequencies } from './mappings';
import type { NetworkStatsData } from './types';

export const wifiDBFromQuality = (quality: string) => {
  const qual = parseFloat(quality);
  if (Number.isNaN(qual)) {
    return null;
  }
  if (qual < 0) {
    return 0;
  }
  if (qual >= 100) {
    return -50;
  }
  return qual / 2 - 100;
};

export const wifiQualityFromDB = (db: number | string) => {
  const dbValue = typeof db === 'number' ? db : parseFloat(db);
  if (Number.isNaN(dbValue)) {
    return null;
  }
  const result = 2 * (dbValue + 100);
  return result <= 100 ? result : 100;
};

export const wifiFrequencyFromChannel = (channel: number) => {
  return Object.keys(wifiFrequencies).includes(String(channel)) ? wifiFrequencies[channel] : null;
};

export const wifiChannelFromFrequencies = (frequency: number) => {
  let channel = 0;
  for (const key in wifiFrequencies) {
    if (Object.keys(wifiFrequencies).includes(key)) {
      if (wifiFrequencies[key] === frequency) {
        channel = toInt(key);
      }
    }
  }
  return channel;
};

export const getFirstExternalNetworkInterface = (interfaces: any) => {
  let ifacename = '';
  let ifacenameFirst = '';

  let scopeid = 9999;

  // fallback - "first" external interface (sorted by scopeid)
  for (const dev in interfaces) {
    (interfaces[dev] || []).forEach((details: any) => {
      if (details && details.internal === false) {
        ifacenameFirst = ifacenameFirst || dev; // fallback if no scopeid
        if (details.scopeid && details.scopeid < scopeid) {
          ifacename = dev;
          scopeid = details.scopeid;
        }
      }
    });
  }
  return ifacename || ifacenameFirst || '';
};

export const testVirtualNic = (iface: string, ifaceName: string, mac: string) => {
  const virtualMacs = [
    '00:00:00:00:00:00',
    '00:03:FF',
    '00:05:69',
    '00:0C:29',
    '00:0F:4B',
    '00:13:07',
    '00:13:BE',
    '00:15:5d',
    '00:16:3E',
    '00:1C:42',
    '00:21:F6',
    '00:24:0B',
    '00:50:56',
    '00:A0:B1',
    '00:E0:C8',
    '08:00:27',
    '0A:00:27',
    '18:92:2C',
    '16:DF:49',
    '3C:F3:92',
    '54:52:00',
    'FC:15:97'
  ];
  if (mac) {
    return (
      virtualMacs.filter((item) => {
        return mac.toUpperCase().startsWith(item.substring(0, mac.length));
      }).length > 0 ||
      iface.toLowerCase().indexOf(' virtual ') > -1 ||
      ifaceName.toLowerCase().indexOf(' virtual ') > -1 ||
      iface.toLowerCase().indexOf('vethernet ') > -1 ||
      ifaceName.toLowerCase().indexOf('vethernet ') > -1 ||
      iface.toLowerCase().startsWith('veth') ||
      ifaceName.toLowerCase().startsWith('veth') ||
      iface.toLowerCase().startsWith('vboxnet') ||
      ifaceName.toLowerCase().startsWith('vboxnet')
    );
  } else {
    return false;
  }
};

export const calcNetworkSpeed = (
  iface: string,
  rx_bytes: number,
  tx_bytes: number,
  rx_dropped: number,
  rx_errors: number,
  tx_dropped: number,
  tx_errors: number,
  operstate: string,
  _network: any
): NetworkStatsData => {
  const result = cloneObj(initNetworkSpeed);

  let rx_sec: number | null = null;
  let tx_sec: number | null = null;
  let rx_bytes_intervall = 0;
  let tx_bytes_intervall = 0;
  let ms = 0;
  if (_network[iface]?.ms) {
    ms = Date.now() - _network[iface].ms;
    rx_bytes_intervall = rx_bytes - _network[iface].rx_bytes;
    tx_bytes_intervall = tx_bytes - _network[iface].tx_bytes;
    rx_sec = rx_bytes_intervall >= 0 ? rx_bytes_intervall / (ms / 1000) : 0;
    tx_sec = tx_bytes_intervall >= 0 ? tx_bytes_intervall / (ms / 1000) : 0;
    _network[iface].rx_bytes = rx_bytes;
    _network[iface].tx_bytes = tx_bytes;
    _network[iface].rx_sec = rx_sec;
    _network[iface].tx_sec = tx_sec;
    _network[iface].rx_dropped = rx_dropped;
    _network[iface].rx_errors = rx_errors;
    _network[iface].tx_dropped = tx_dropped;
    _network[iface].tx_errors = tx_errors;
    _network[iface].ms = Date.now();
    _network[iface].last_ms = result.ms;
    _network[iface].operstate = operstate;
  } else {
    if (!_network[iface]) {
      _network[iface] = {};
    }
    _network[iface].rx_bytes = rx_bytes;
    _network[iface].tx_bytes = tx_bytes;
    _network[iface].rx_sec = null;
    _network[iface].tx_sec = null;
    _network[iface].rx_dropped = result.rx_dropped;
    _network[iface].rx_errors = result.rx_errors;
    _network[iface].tx_dropped = result.tx_dropped;
    _network[iface].tx_errors = result.tx_errors;
    _network[iface].ms = Date.now();
    _network[iface].last_ms = 0;
    _network[iface].operstate = operstate;
  }
  return {
    iface,
    operstate,
    rx_bytes,
    rx_dropped,
    rx_errors,
    tx_bytes,
    tx_dropped,
    tx_errors,
    rx_sec,
    tx_sec,
    ms
  };
};
