import { networkInterfaces } from './index';
import { getValue, nextTick, toInt } from '../common';
import { initNetworkSpeed } from '../common/defaults';
import { calcNetworkSpeed } from '../common/network';
import { sanitizeInterfacesString } from '../common/security';
import type { NetworkStatsData } from '../common/types';
import { ps } from '../common/windows';

const _network: any = {};

const parseLinesWindowsPerfData = (sections: string[]) => {
  const perfData = [];
  for (const i in sections) {
    if (sections[i].trim() !== '') {
      const lines = sections[i].trim().split('\r\n');
      perfData.push({
        name: getValue(lines, 'Name', ':').toLowerCase(),
        desc: getValue(lines, 'InterfaceDescription', ':')
          .replace(/[()[\] ]+/g, '')
          .replace(/#|\//g, '_')
          .toLowerCase(),
        rx_bytes: toInt(getValue(lines, 'ReceivedBytes', ':')),
        // Get-NetAdapterStatistics has no aggregated packet counter, only the three classes
        rx_packets: toInt(getValue(lines, 'ReceivedUnicastPackets', ':')) + toInt(getValue(lines, 'ReceivedMulticastPackets', ':')) + toInt(getValue(lines, 'ReceivedBroadcastPackets', ':')),
        rx_errors: toInt(getValue(lines, 'ReceivedPacketErrors', ':')),
        rx_dropped: toInt(getValue(lines, 'ReceivedDiscardedPackets', ':')),
        tx_bytes: toInt(getValue(lines, 'SentBytes', ':')),
        tx_packets: toInt(getValue(lines, 'SentUnicastPackets', ':')) + toInt(getValue(lines, 'SentMulticastPackets', ':')) + toInt(getValue(lines, 'SentBroadcastPackets', ':')),
        tx_errors: toInt(getValue(lines, 'OutboundPacketErrors', ':')),
        tx_dropped: toInt(getValue(lines, 'OutboundDiscardedPackets', ':'))
      });
    }
  }
  return perfData;
};

const networkStatsSingle = async (iface: string): Promise<NetworkStatsData> => {
  await nextTick();
  // keep the queried interface name in cached and empty results (#779)
  const defaults = { ...initNetworkSpeed, iface };
  if (!_network[iface] || (_network[iface] && !_network[iface].ms) || (_network[iface] && _network[iface].ms && Date.now() - _network[iface].ms >= 500)) {
    let operstate = 'unknown';
    let rx_bytes = 0;
    let tx_bytes = 0;
    let rx_packets = 0;
    let tx_packets = 0;
    let rx_dropped = 0;
    let rx_errors = 0;
    let tx_dropped = 0;
    let tx_errors = 0;

    let perfData: any[] = [];
    let ifaceName = iface;
    let found = false;

    // Performance Data
    try {
      const stdout = String(
        (await ps.exec(
          'Get-NetAdapterStatistics | select Name,InterfaceDescription,ReceivedBytes,ReceivedUnicastPackets,ReceivedMulticastPackets,ReceivedBroadcastPackets,ReceivedPacketErrors,ReceivedDiscardedPackets,SentBytes,SentUnicastPackets,SentMulticastPackets,SentBroadcastPackets,OutboundPacketErrors,OutboundDiscardedPackets | fl'
        )) || ''
      );
      if (stdout) {
        const psections = stdout.split(/\n\s*\n/);
        perfData = parseLinesWindowsPerfData(psections);
      }
    } catch {}

    // Network Interfaces
    const interfaces = await networkInterfaces('', false);
    // get bytes sent, received from perfData by name
    rx_bytes = 0;
    tx_bytes = 0;
    perfData.forEach((detail) => {
      (interfaces || []).forEach((det) => {
        if (
          (det.iface.toLowerCase() === iface.toLowerCase() ||
            det.mac.toLowerCase() === iface.toLowerCase() ||
            det.ip4.toLowerCase() === iface.toLowerCase() ||
            det.ip6.toLowerCase() === iface.toLowerCase() ||
            det.ifaceName
              .replace(/[()[\] ]+/g, '')
              .replace(/#|\//g, '_')
              .toLowerCase() ===
              iface
                .replace(/[()[\] ]+/g, '')
                .replace('#', '_')
                .toLowerCase()) &&
          (det.iface.toLowerCase() === detail.name ||
            det.ifaceName
              .replace(/[()[\] ]+/g, '')
              .replace(/#|\//g, '_')
              .toLowerCase() === detail.desc)
        ) {
          found = true;
          ifaceName = det.iface;
          rx_bytes = detail.rx_bytes;
          rx_packets = detail.rx_packets;
          rx_dropped = detail.rx_dropped;
          rx_errors = detail.rx_errors;
          tx_bytes = detail.tx_bytes;
          tx_packets = detail.tx_packets;
          tx_dropped = detail.tx_dropped;
          tx_errors = detail.tx_errors;
          operstate = det.operstate;
        }
      });
    });
    // an interface without traffic yet still has valid stats - all zero (#779)
    if (found) {
      const stats = calcNetworkSpeed({ iface: ifaceName, rx_bytes, tx_bytes, rx_packets, tx_packets, rx_dropped, rx_errors, tx_dropped, tx_errors, operstate }, _network);
      // the cache is keyed on the resolved adapter name, the 500 ms check above looks up what the
      // caller passed - without this alias a query by MAC, IP or friendly name never hit the cache.
      // Both keys share one object, so the next measurement keeps them in sync
      if (ifaceName !== iface) {
        _network[iface] = _network[ifaceName];
      }
      return stats;
    }
    return defaults;
  } else {
    return {
      ...defaults,
      rx_bytes: _network[iface].rx_bytes,
      tx_bytes: _network[iface].tx_bytes,
      rx_packets: _network[iface].rx_packets,
      tx_packets: _network[iface].tx_packets,
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
