import { nextTick, toInt } from '../common';
import { initNetworkSpeed } from '../common/defaults';
import { execSave } from '../common/exec';
import { calcNetworkSpeed } from '../common/network';
import { sanitizeInterfacesString } from '../common/security';
import { NetworkStatsData } from '../common/types';
import { networkInterfaces } from '../darwin';

const _network: any = {};

const networkStatsSingle = async (iface: string): Promise<NetworkStatsData> => {
  await nextTick();
  const defaults = initNetworkSpeed;
  if (!_network[iface] || (_network[iface] && !_network[iface].ms) || (_network[iface] && _network[iface].ms && Date.now() - _network[iface].ms >= 500)) {
    let operstate = 'unknown';
    let rx_bytes = 0;
    let tx_bytes = 0;
    let rx_dropped = 0;
    let rx_errors = 0;
    let tx_dropped = 0;
    let tx_errors = 0;

    let stdout = '';
    ({ stdout } = await execSave(`ifconfig ${iface} | grep "status"`)); // lgtm [js/shell-command-constructed-from-input]
    operstate = (stdout.split(':')[1] || '').trim().toLowerCase();
    operstate = operstate === 'active' ? 'up' : operstate === 'inactive' ? 'down' : 'unknown';
    ({ stdout } = await execSave(`netstat -bdnI ${iface}`)); // lgtm [js/shell-command-constructed-from-input]
    if (stdout) {
      const lines = stdout.toString().split('\n');
      // if there is less than 2 lines, no information for this interface was found
      if (lines.length > 1 && lines[1].trim() !== '') {
        // skip header line
        // use the second line because it is tied to the NIC instead of the ipv4 or ipv6 address
        const stats = lines[1].replace(/ +/g, ' ').split(' ');
        const offset = stats.length > 11 ? 1 : 0;
        rx_bytes = toInt(stats[offset + 5]);
        rx_dropped = toInt(stats[offset + 10]);
        rx_errors = toInt(stats[offset + 4]);
        tx_bytes = toInt(stats[offset + 8]);
        tx_dropped = toInt(stats[offset + 10]);
        tx_errors = toInt(stats[offset + 7]);
        return calcNetworkSpeed(iface, rx_bytes, tx_bytes, rx_dropped, rx_errors, tx_dropped, tx_errors, operstate, _network);
      }
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

export const networkStats = async (interfaces: string): Promise<NetworkStatsData[]> => {
  const result: NetworkStatsData[] = [];
  let interfacesArray: string[] = [];
  const interfacesSanitized = sanitizeInterfacesString(interfaces);
  if (interfacesSanitized === '-') {
    return result;
  }
  if (interfacesSanitized === '*') {
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
