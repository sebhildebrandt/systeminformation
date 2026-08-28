import { networkInterfaces as osNetworkInterfaces } from 'node:os';
import { getValue, nextTick, toInt } from '../common';
import { MAX_BUFFER_SIZE } from '../common/const';
import { exec } from '../common/exec';
import { cloneObj } from '../common/index';
import { testVirtualNic } from '../common/network';
import { isPrototypePolluted, mathMin, sanitizeShellString } from '../common/security';
import type { NetworkInterfacesData } from '../common/types';
import { networkInterfaceDefault } from './network-interface-default';

let _interfaces: any = {}; // nodejs structure
let _networkInterfaces: NetworkInterfacesData[] = []; // si structure

const splitSectionsNics = (lines: string[]) => {
  const result = [];
  let section: any[] = [];
  lines.forEach((line) => {
    if (!line.startsWith('\t') && !line.startsWith(' ')) {
      if (section.length) {
        result.push(section);
        section = [];
      }
    }
    section.push(line);
  });
  if (section.length) {
    result.push(section);
  }
  return result;
};

const parseLinesDarwinNics = (sections: any[]) => {
  const nics: any[] = [];
  sections.forEach((section) => {
    const nic: any = {
      iface: '',
      mtu: null,
      mac: '',
      ip6: '',
      ip4: '',
      speed: null,
      type: '',
      operstate: '',
      duplex: '',
      internal: false
    };
    const first = section[0];
    nic.iface = first.split(':')[0].trim();
    const parts = first.split('> mtu');
    nic.mtu = parts.length > 1 ? toInt(parts[1]) : null;
    if (isNaN(nic.mtu)) {
      nic.mtu = null;
    }
    nic.internal = parts[0].toLowerCase().indexOf('loopback') > -1;
    section.forEach((line: string) => {
      if (line.trim().startsWith('ether ')) {
        nic.mac = line.split('ether ')[1].toLowerCase().trim();
      }
      if (line.trim().startsWith('inet6 ') && !nic.ip6) {
        nic.ip6 = line.split('inet6 ')[1].toLowerCase().split('%')[0].split(' ')[0];
      }
      if (line.trim().startsWith('inet ') && !nic.ip4) {
        nic.ip4 = line.split('inet ')[1].toLowerCase().split(' ')[0];
      }
    });
    let speed = getValue(section, 'link rate');
    nic.speed = speed ? parseFloat(speed) : null;
    if (nic.speed === null) {
      speed = getValue(section, 'uplink rate');
      nic.speed = speed ? parseFloat(speed) : null;
      if (nic.speed !== null && speed.toLowerCase().indexOf('gbps') >= 0) {
        nic.speed = nic.speed * 1000;
      }
    } else {
      if (speed.toLowerCase().indexOf('gbps') >= 0) {
        nic.speed = nic.speed * 1000;
      }
    }
    nic.type = getValue(section, 'type').toLowerCase().indexOf('wi-fi') > -1 ? 'wireless' : 'wired';
    const operstate = getValue(section, 'status').toLowerCase();
    nic.operstate = operstate === 'active' ? 'up' : operstate === 'inactive' ? 'down' : 'unknown';
    nic.duplex = getValue(section, 'media').toLowerCase().indexOf('half-duplex') > -1 ? 'half' : 'full';
    if (nic.ip6 || nic.ip4 || nic.mac) {
      nics.push(nic);
    }
  });
  return nics;
};

const getBsdNics = async () => {
  try {
    const { stdout } = await exec('/sbin/ifconfig -v', { maxBuffer: MAX_BUFFER_SIZE });
    const lines = stdout.split('\n');
    const nsections = splitSectionsNics(lines);
    return parseLinesDarwinNics(nsections);
  } catch (e) {
    return [];
  }
};

const getBsdIfaceDHCPstatus = async (iface: string) => {
  let result = false;
  try {
    const { stdout } = await exec(`ipconfig getpacket "${iface}" 2>/dev/null | grep lease_time;`);
    const lines = stdout.split('\n');
    if (lines.length && lines[0].startsWith('lease_time')) {
      result = true;
    }
  } catch {}
  return result;
};

export const networkInterfaces = async (defaultString = '', rescan = true): Promise<NetworkInterfacesData[]> => {
  await nextTick();
  const interfaces = osNetworkInterfaces();
  if (JSON.stringify(interfaces) === JSON.stringify(_interfaces) && !rescan) {
    return _networkInterfaces;
  }
  _interfaces = cloneObj(interfaces);
  let result: NetworkInterfacesData[] = [];

  try {
    const nics = await getBsdNics();
    const defaultInterface = await networkInterfaceDefault();
    for (const nic of nics) {
      let ip4link = '';
      let ip4linksubnet = '';
      let ip6link = '';
      let ip6linksubnet = '';
      nic.ip4 = '';
      nic.ip6 = '';

      (interfaces[nic.iface] || []).forEach((details: any) => {
        if (details.family === 'IPv4' || details.family === 4) {
          if (!nic.ip4 && !nic.ip4.match(/^169.254/i)) {
            nic.ip4 = details.address;
            nic.ip4subnet = details.netmask;
          }
          if (nic.ip4.match(/^169.254/i)) {
            ip4link = details.address;
            ip4linksubnet = details.netmask;
          }
        }
        if (details.family === 'IPv6' || details.family === 6) {
          if (!nic.ip6 && !nic.ip6.match(/^fe80::/i)) {
            nic.ip6 = details.address;
            nic.ip6subnet = details.netmask;
          }
          if (nic.ip6.match(/^fe80::/i)) {
            ip6link = details.address;
            ip6linksubnet = details.netmask;
          }
        }
      });
      if (!nic.ip4 && ip4link) {
        nic.ip4 = ip4link;
        nic.ip4subnet = ip4linksubnet;
      }
      if (!nic.ip6 && ip6link) {
        nic.ip6 = ip6link;
        nic.ip6subnet = ip6linksubnet;
      }

      let ifaceSanitized = '';
      const s = isPrototypePolluted() ? '---' : sanitizeShellString(nic.iface);
      const l = mathMin(s.length, 2000);
      for (let i = 0; i <= l; i++) {
        if (s[i] !== undefined) {
          ifaceSanitized = ifaceSanitized + s[i];
        }
      }

      result.push({
        iface: nic.iface,
        ifaceName: nic.iface,
        default: nic.iface === defaultInterface,
        ip4: nic.ip4,
        ip4subnet: nic.ip4subnet || '',
        ip6: nic.ip6,
        ip6subnet: nic.ip6subnet || '',
        mac: nic.mac,
        internal: nic.internal,
        virtual: nic.internal ? false : testVirtualNic(nic.iface, nic.iface, nic.mac),
        operstate: nic.operstate,
        type: nic.type,
        duplex: nic.duplex,
        mtu: nic.mtu,
        speed: nic.speed,
        dhcp: await getBsdIfaceDHCPstatus(ifaceSanitized),
        dnsSuffix: '',
        ieee8021xAuth: '',
        ieee8021xState: '',
        carrierChanges: 0
      });
    }
    _networkInterfaces = result;
    // filtering has to happen after all interfaces are collected - otherwise the result depends on the position of the default interface
    if (defaultString.toLowerCase().indexOf('default') >= 0) {
      result = result.filter((item) => item.default);
      return result.length ? [result[0]] : [];
    }
  } catch {}
  return result;
};
