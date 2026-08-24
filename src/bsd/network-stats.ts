import { execSave } from '../common/exec';
import { NetworkStatsData } from '../common/types';
import { nextTick, toInt } from '../common';
import { sanitizeInterfacesString } from '../common/security';
import { initNetworkSpeed } from '../common/defaults';
import { networkInterfaces } from '../darwin';
import { calcNetworkSpeed } from '../common/network';

const _network: any = {};

const networkStatsSingle = async (iface: string): Promise<NetworkStatsData> => {
  const defaults = initNetworkSpeed;
  if (!_network[iface] || (_network[iface] && !_network[iface].ms) || (_network[iface] && _network[iface].ms && Date.now() - _network[iface].ms >= 500)) {
    let operstate = 'unknown';
    let rx_bytes = 0;
    let tx_bytes = 0;
    let rx_dropped = 0;
    let rx_errors = 0;
    let tx_dropped = 0;
    let tx_errors = 0;

    const { stdout } = await execSave(`netstat -ibndI ${iface}`);
    if (stdout) {
      const lines = stdout.split('\n');
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].replace(/ +/g, ' ').split(' ');
        if (line && line[0] && line[7] && line[10]) {
          rx_bytes = rx_bytes + toInt(line[7]);
          if (line[6].trim() !== '-') {
            rx_dropped = rx_dropped + toInt(line[6]);
          }
          if (line[5].trim() !== '-') {
            rx_errors = rx_errors + toInt(line[5]);
          }
          tx_bytes = tx_bytes + toInt(line[10]);
          if (line[12] && line[12].trim() !== '-') {
            tx_dropped = tx_dropped + toInt(line[12]);
          }
          if (line[9].trim() !== '-') {
            tx_errors = tx_errors + toInt(line[9]);
          }
          operstate = 'up';
        }
      }
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

export const networkStats = async (interfaces: string): Promise<NetworkStatsData[]> => {
  await nextTick();
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
