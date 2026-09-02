import { fileExists, readSysfs } from '../common/files';
import { NetworkStatsData } from '../common/types';
import { nextTick, toInt } from '../common';
import { sanitizeInterfacesString } from '../common/security';
import { initNetworkSpeed } from '../common/defaults';
import { networkInterfaceDefault, networkInterfaces } from './index';
import { calcNetworkSpeed } from '../common/network';

const _network: any = {};

const networkStatsSingle = async (iface: string): Promise<NetworkStatsData> => {
  await nextTick();
  // keep the queried interface name in cached and empty results (#779)
  const defaults = { ...initNetworkSpeed, iface };
  if (!_network[iface] || (_network[iface] && !_network[iface].ms) || (_network[iface] && _network[iface].ms && Date.now() - _network[iface].ms >= 500)) {
    const dir = '/sys/class/net/' + iface;
    if (/^[\w.:@-]+$/.test(iface) && (await fileExists(dir))) {
      const [operstate, rx_bytes, tx_bytes, rx_dropped, rx_errors, tx_dropped, tx_errors] = await Promise.all([
        readSysfs(dir + '/operstate'),
        ...['rx_bytes', 'tx_bytes', 'rx_dropped', 'rx_errors', 'tx_dropped', 'tx_errors'].map(async (f) => toInt(await readSysfs(dir + '/statistics/' + f)))
      ]);
      return calcNetworkSpeed(iface, rx_bytes, tx_bytes, rx_dropped, rx_errors, tx_dropped, tx_errors, operstate, _network);
    }
    return defaults;
  } else {
    return {
      ...defaults,
      rx_bytes: _network[iface].rx_bytes,
      tx_bytes: _network[iface].tx_bytes,
      rx_sec: _network[iface].rx_sec,
      tx_sec: _network[iface].tx_sec,
      rx_dropped: _network[iface].rx_dropped,
      tx_dropped: _network[iface].tx_dropped,
      rx_errors: _network[iface].rx_errors,
      tx_errors: _network[iface].tx_errors,
      ms: _network[iface].last_ms,
      operstate: _network[iface].operstate
    };
  }
};

export const networkStats = async (interfaces = ''): Promise<NetworkStatsData[]> => {
  const result: NetworkStatsData[] = [];
  let interfacesArray: string[] = [];
  const interfacesSanitized = sanitizeInterfacesString(interfaces);
  if (interfaces === '') {
    interfacesArray = [await networkInterfaceDefault()];
  } else if (interfacesSanitized === '-') {
    return result;
  } else if (interfacesSanitized === '*') {
    const allIFaces = await networkInterfaces('', false);
    for (const iface of allIFaces || []) {
      interfacesArray.push(iface.iface);
    }
  } else {
    interfacesArray = interfacesSanitized.split('|');
  }
  const workload = [];
  for (const iface of interfacesArray) {
    workload.push(networkStatsSingle(iface.trim()));
  }
  if (workload.length) {
    return await Promise.all(workload);
  } else {
    return result;
  }
};
