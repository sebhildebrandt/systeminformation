import { readFile, readdir } from 'node:fs/promises';
import { networkInterfaces as osNetworkInterfaces } from 'node:os';
import { basename, dirname, join } from 'node:path';
import { getValue, grep, nextTick, toInt } from '../common';
import { execOptsLinux } from '../common/const';
import { initNetworkInterface } from '../common/defaults';
import { exec, execFile } from '../common/exec';
import { cloneObj } from '../common/index';
import { testVirtualNic } from '../common/network';
import { sanitizeString } from '../common/security';
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

// 'nmcli device status' lists every device - query it once per run instead of once per interface
const getLinuxDeviceStatus = async () => {
  try {
    const { stdout } = await execFile('nmcli', ['device', 'status'], execOptsLinux);
    return stdout;
  } catch {
    return '';
  }
};

const getLinuxIfaceConnectionName = (deviceStatus: string, interfaceName: string) => {
  const result = grep(deviceStatus, interfaceName);
  const resultFormat = result.replace(/\s+/g, ' ').trim();
  const connectionNameLines = resultFormat.split(' ').slice(3);
  const connectionName = connectionNameLines.join(' ');
  return connectionName !== '--' ? connectionName : '';
};

// liest interfaces-Datei(en) ohne Shell; source-Direktive kann Glob sein (Debian-Default: /etc/network/interfaces.d/*)
const readInterfacesLines = async (file: string): Promise<string[]> => {
  if (file.includes('*') || file.includes('?')) {
    try {
      const rx = new RegExp(`^${basename(file).replace(/\./g, '\\.').replace(/\*/g, '.*').replace(/\?/g, '.')}$`);
      const names = (await readdir(dirname(file))).filter((n) => rx.test(n)).sort();
      const out: string[] = [];
      for (const n of names) {
        out.push(...(await readInterfacesLines(join(dirname(file), n))));
      }
      return out;
    } catch {
      return [];
    }
  }
  try {
    return (await readFile(file, 'utf8')).split('\n').filter((l) => /iface|source/i.test(l));
  } catch {
    return [];
  }
};

export const checkLinuxDCHPInterfaces = async (file: string, depth = 0): Promise<any[]> => {
  let result: any[] = [];
  if (depth > 10) {
    return result;
  }
  const lines = await readInterfacesLines(file);
  for (const line of lines) {
    const lower = line.toLowerCase();
    const parts = line.replace(/\s+/g, ' ').trim().split(' ');
    if (parts.length >= 4 && lower.indexOf(' inet ') >= 0 && lower.indexOf('dhcp') >= 0) {
      result.push(parts[1]);
    }
    if (lower.includes('source')) {
      result = result.concat(await checkLinuxDCHPInterfaces(line.split(' ')[1], depth + 1));
    }
  }
  return result;
};

const getLinuxDHCPNics = async () => {
  // alternate methods getting interfaces using DHCP
  let result: any[] = [];
  try {
    const { stdout } = await exec('ip a 2> /dev/null', execOptsLinux);
    const lines = stdout.split('\n');
    const nsections = splitSectionsNics(lines);
    result = parseLinuxDHCPNics(nsections);
  } catch {
    result = await checkLinuxDCHPInterfaces('/etc/network/interfaces');
  }
  return result;
};

const parseLinuxDHCPNics = (sections: any[]) => {
  const result: any[] = [];
  if (sections?.length) {
    sections.forEach((lines) => {
      if (lines?.length) {
        const parts = lines[0].split(':');
        if (parts.length > 2) {
          for (const line of lines) {
            if (line.indexOf(' inet ') >= 0 && line.indexOf(' dynamic ') >= 0) {
              const parts2 = line.split(' ');
              const nic = parts2[parts2.length - 1].trim();
              result.push(nic);
              break;
            }
          }
        }
      }
    });
  }
  return result;
};

const getLinuxIfaceDHCPstatus = async (iface: string, connectionName: string, DHCPNics: string[]) => {
  let result = false;
  if (connectionName) {
    try {
      const { stdout } = await execFile('nmcli', ['connection', 'show', connectionName], execOptsLinux);
      const res = grep(stdout, 'ipv4.method');
      const resultFormat = res.replace(/\s+/g, ' ').trim();

      const dhcStatus = resultFormat.split(' ').slice(1).toString();
      switch (dhcStatus) {
        case 'auto':
          result = true;
          break;

        default:
          result = false;
          break;
      }
      return result;
    } catch {
      return DHCPNics.indexOf(iface) >= 0;
    }
  } else {
    return DHCPNics.indexOf(iface) >= 0;
  }
};

const getLinuxIfaceDNSsuffix = async (connectionName: string) => {
  if (connectionName) {
    try {
      const { stdout } = await execFile('nmcli', ['connection', 'show', connectionName], execOptsLinux);
      const res = grep(stdout, 'ipv4.dns-search');
      const resultFormat = res.replace(/\s+/g, ' ').trim();
      const dnsSuffix = resultFormat.split(' ').slice(1).toString();
      return dnsSuffix === '--' ? 'Not defined' : dnsSuffix;
    } catch {
      return 'Unknown';
    }
  } else {
    return 'Unknown';
  }
};

const getLinuxIfaceIEEE8021xAuth = async (connectionName: string) => {
  if (connectionName) {
    try {
      const { stdout } = await execFile('nmcli', ['connection', 'show', connectionName], execOptsLinux);
      const res = grep(stdout, '802-1x.eap');
      const resultFormat = res.replace(/\s+/g, ' ').trim();
      const authenticationProtocol = resultFormat.split(' ').slice(1).toString();
      return authenticationProtocol === '--' ? '' : authenticationProtocol;
    } catch {
      return 'Not defined';
    }
  } else {
    return 'Not defined';
  }
};

const getLinuxIfaceIEEE8021xState = (authenticationProtocol: string) => {
  if (authenticationProtocol) {
    if (authenticationProtocol === 'Not defined') {
      return 'Disabled';
    }
    return 'Enabled';
  } else {
    return 'Unknown';
  }
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
    const _dhcpNics = await getLinuxDHCPNics();
    const defaultInterface = await networkInterfaceDefault();
    const deviceStatus = await getLinuxDeviceStatus();
    // os.networkInterfaces() only lists interfaces with an assigned address - sysfs knows the others too (#903, #355)
    const devices = Object.keys(interfaces);
    try {
      for (const dev of await readdir('/sys/class/net')) {
        if (!devices.some((device) => device.split(':')[0] === dev)) {
          devices.push(dev);
        }
      }
    } catch {}
    for (const dev of devices) {
      const iface = dev;
      let ip4 = '';
      let ip4subnet = '';
      let ip6 = '';
      let ip6subnet = '';
      let mac = '';
      let duplex = '';
      let mtu = 0;
      let speed: number | null = 0;
      let carrierChanges = 0;
      let dhcp = false;
      let dnsSuffix = '';
      let ieee8021xAuth = '';
      let ieee8021xState = '';
      let type = '';

      let ip4link = '';
      let ip4linksubnet = '';
      let ip6link = '';
      let ip6linksubnet = '';

      const ifaceName = dev;
      for (const details of interfaces[dev] || ([] as any)) {
        if (details.family === 'IPv4' || details.family === 4) {
          if (!ip4 && !ip4.match(/^169.254/i)) {
            ip4 = details.address;
            ip4subnet = details.netmask;
          }
          if (ip4.match(/^169.254/i)) {
            ip4link = details.address;
            ip4linksubnet = details.netmask;
          }
        }
        if (details.family === 'IPv6' || details.family === 6) {
          if (!ip6 && !ip6.match(/^fe80::/i)) {
            ip6 = details.address;
            ip6subnet = details.netmask;
          }
          if (ip6.match(/^fe80::/i)) {
            ip6link = details.address;
            ip6linksubnet = details.netmask;
          }
        }
        mac = details.mac;
      }
      if (!ip4 && ip4link) {
        ip4 = ip4link;
        ip4subnet = ip4linksubnet;
      }
      if (!ip6 && ip6link) {
        ip6 = ip6link;
        ip6subnet = ip6linksubnet;
      }

      const ifaceDevName = dev.split(':')[0].trim();
      const ifaceSanitized = sanitizeString(ifaceDevName);

      const cmd = `echo -n "addr_assign_type: "; cat /sys/class/net/${ifaceSanitized}/addr_assign_type 2>/dev/null; echo;
            echo -n "address: "; cat /sys/class/net/${ifaceSanitized}/address 2>/dev/null; echo;
            echo -n "addr_len: "; cat /sys/class/net/${ifaceSanitized}/addr_len 2>/dev/null; echo;
            echo -n "broadcast: "; cat /sys/class/net/${ifaceSanitized}/broadcast 2>/dev/null; echo;
            echo -n "carrier: "; cat /sys/class/net/${ifaceSanitized}/carrier 2>/dev/null; echo;
            echo -n "carrier_changes: "; cat /sys/class/net/${ifaceSanitized}/carrier_changes 2>/dev/null; echo;
            echo -n "dev_id: "; cat /sys/class/net/${ifaceSanitized}/dev_id 2>/dev/null; echo;
            echo -n "dev_port: "; cat /sys/class/net/${ifaceSanitized}/dev_port 2>/dev/null; echo;
            echo -n "dormant: "; cat /sys/class/net/${ifaceSanitized}/dormant 2>/dev/null; echo;
            echo -n "duplex: "; cat /sys/class/net/${ifaceSanitized}/duplex 2>/dev/null; echo;
            echo -n "flags: "; cat /sys/class/net/${ifaceSanitized}/flags 2>/dev/null; echo;
            echo -n "gro_flush_timeout: "; cat /sys/class/net/${ifaceSanitized}/gro_flush_timeout 2>/dev/null; echo;
            echo -n "ifalias: "; cat /sys/class/net/${ifaceSanitized}/ifalias 2>/dev/null; echo;
            echo -n "ifindex: "; cat /sys/class/net/${ifaceSanitized}/ifindex 2>/dev/null; echo;
            echo -n "iflink: "; cat /sys/class/net/${ifaceSanitized}/iflink 2>/dev/null; echo;
            echo -n "link_mode: "; cat /sys/class/net/${ifaceSanitized}/link_mode 2>/dev/null; echo;
            echo -n "mtu: "; cat /sys/class/net/${ifaceSanitized}/mtu 2>/dev/null; echo;
            echo -n "netdev_group: "; cat /sys/class/net/${ifaceSanitized}/netdev_group 2>/dev/null; echo;
            echo -n "operstate: "; cat /sys/class/net/${ifaceSanitized}/operstate 2>/dev/null; echo;
            echo -n "proto_down: "; cat /sys/class/net/${ifaceSanitized}/proto_down 2>/dev/null; echo;
            echo -n "speed: "; cat /sys/class/net/${ifaceSanitized}/speed 2>/dev/null; echo;
            echo -n "tx_queue_len: "; cat /sys/class/net/${ifaceSanitized}/tx_queue_len 2>/dev/null; echo;
            echo -n "type: "; cat /sys/class/net/${ifaceSanitized}/type 2>/dev/null; echo;
            echo -n "wireless: "; cat /proc/net/wireless 2>/dev/null | grep ${ifaceSanitized}; echo;
            echo -n "wirelessspeed: "; iw dev ${ifaceSanitized} link 2>&1 | grep bitrate; echo;`;

      let lines: string[] = [];
      try {
        const { stdout } = await exec(cmd, execOptsLinux);
        lines = stdout.split('\n');
        const connectionName = getLinuxIfaceConnectionName(deviceStatus, ifaceSanitized);
        dhcp = await getLinuxIfaceDHCPstatus(ifaceSanitized, connectionName, _dhcpNics);
        dnsSuffix = await getLinuxIfaceDNSsuffix(connectionName);
        ieee8021xAuth = await getLinuxIfaceIEEE8021xAuth(connectionName);
        ieee8021xState = getLinuxIfaceIEEE8021xState(ieee8021xAuth);
      } catch {}
      duplex = getValue(lines, 'duplex');
      duplex = duplex.startsWith('cat') ? '' : duplex;
      mtu = toInt(getValue(lines, 'mtu'));
      let myspeed = toInt(getValue(lines, 'speed'));
      speed = Number.isNaN(myspeed) ? null : myspeed;

      const wirelessspeed = getValue(lines, 'tx bitrate');
      if (speed === null && wirelessspeed) {
        myspeed = Number.parseFloat(wirelessspeed);
        speed = Number.isNaN(myspeed) ? null : myspeed;
      }
      if (!mac) {
        // interfaces without an address are not part of os.networkInterfaces()
        mac = getValue(lines, 'address');
      }
      carrierChanges = toInt(getValue(lines, 'carrier_changes'));
      const operstate = getValue(lines, 'operstate');
      // sysfs ARPHRD type (1 = ethernet) works while the link is down too - windows and macOS report the type regardless of the state (#632)
      type = getValue(lines, 'wireless').trim() ? 'wireless' : toInt(getValue(lines, 'type')) === 1 ? 'wired' : 'unknown';
      if (ifaceSanitized === 'lo' || ifaceSanitized.startsWith('bond')) {
        type = 'virtual';
      }

      let internal = interfaces[dev] && (interfaces[dev] || [])[0] ? (interfaces[dev] || [])[0].internal : false;
      if (dev.toLowerCase().indexOf('loopback') > -1 || ifaceName.toLowerCase().indexOf('loopback') > -1) {
        internal = true;
      }
      const virtual = internal ? false : testVirtualNic(dev, ifaceName, mac);
      result.push({
        ...initNetworkInterface,
        iface: ifaceSanitized,
        ifaceName,
        default: iface === defaultInterface,
        ip4,
        ip4subnet,
        ip6,
        ip6subnet,
        mac,
        internal,
        virtual,
        operstate,
        type,
        duplex,
        mtu,
        speed,
        dhcp,
        dnsSuffix,
        ieee8021xAuth,
        ieee8021xState,
        carrierChanges
      });
    }
  } catch {}
  _networkInterfaces = result;
  if (defaultString.toLowerCase().indexOf('default') >= 0) {
    result = result.filter((item) => item.default);
    if (result.length > 0) {
      return [result[0]];
    } else {
      result = [];
    }
  }
  return result;
};
