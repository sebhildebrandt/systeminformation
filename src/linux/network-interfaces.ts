import { readFile, readdir, realpath } from 'node:fs/promises';
import { networkInterfaces as osNetworkInterfaces } from 'node:os';
import { basename, dirname, join } from 'node:path';
import { getValue, grep, nextTick, toInt } from '../common';
import { execOptsLinux } from '../common/const';
import { initNetworkInterface } from '../common/defaults';
import { exec, execFile, execSecure } from '../common/exec';
import { fileExists, readFileLines, readSysfs, readSysfsMany } from '../common/files';
import { cloneObj } from '../common/index';
import { filterDefaultInterface, testVirtualNic } from '../common/network';
import { isSafePathSegment, sanitizeString } from '../common/security';
import type { NetworkInterfacesData, PciData } from '../common/types';
import { networkInterfaceDefault } from './network-interface-default';
import { pci } from './pci';

// execSecure only settles on close - iw runs once per interface, so a wedged call would
// block the whole networkInterfaces() listing
const EXEC_OPTS = { timeout: 5000 };
const EXEC_OPTS_LINUX = { ...execOptsLinux, ...EXEC_OPTS };
// nmcli localizes the device state
const EXEC_OPTS_NMCLI = { ...EXEC_OPTS_LINUX, env: { ...process.env, LC_ALL: 'C.UTF-8' } };
// interfaces scanned in parallel - hosts with many (docker) interfaces took minutes serially (#1044)
const SCAN_CONCURRENCY = 8;

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
// terse format DEVICE:STATE:CONNECTION, ':' inside values is escaped as '\:'
const getLinuxDeviceStatus = async () => {
  const result = new Map<string, { state: string; connection: string }>();
  try {
    const { stdout } = await execFile('nmcli', ['-t', '-f', 'DEVICE,STATE,CONNECTION', 'device', 'status'], EXEC_OPTS_NMCLI);
    for (const line of stdout.split('\n')) {
      const [device, state, connection] = line.split(/(?<!\\):/).map((part) => part.replace(/\\:/g, ':'));
      if (device && state !== undefined) {
        result.set(device, { state, connection: connection && connection !== '--' ? connection : '' });
      }
    }
  } catch {}
  return result;
};

// externally connected devices (docker bridges, veths) have generated NM connections without meaningful settings
const getLinuxIfaceConnectionName = (deviceStatus: Map<string, { state: string; connection: string }>, interfaceName: string) => {
  const device = deviceStatus.get(interfaceName);
  return device && !device.state.includes('externally') ? device.connection : '';
};

// one 'nmcli connection show' per interface, parsed for dhcp, dns suffix and 802.1x; null when unavailable
const getLinuxConnectionDetails = async (connectionName: string) => {
  if (!connectionName) {
    return null;
  }
  try {
    const { stdout } = await execFile('nmcli', ['connection', 'show', 'id', connectionName], EXEC_OPTS_NMCLI);
    return stdout;
  } catch {
    return null;
  }
};

const getNmcliValue = (stdout: string, property: string) => grep(stdout, property).replace(/\s+/g, ' ').trim().split(' ').slice(1).toString();

// liest interfaces-Datei(en) ohne Shell; source-Direktive kann Glob sein (Debian-Default: /etc/network/interfaces.d/*)
const readInterfacesLines = async (file: string): Promise<string[]> => {
  if (file.includes('*') || file.includes('?')) {
    try {
      const rx = new RegExp(`^${basename(file).replace(/\./g, '\\.').replace(/\*/g, '.*').replace(/\?/g, '.')}$`);
      const names = (await readdir(dirname(file))).filter((n) => rx.test(n) && isSafePathSegment(n)).sort();
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
    const { stdout } = await exec('ip a 2> /dev/null', EXEC_OPTS_LINUX);
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

const getLinuxIfaceDHCPstatus = (iface: string, details: string | null, DHCPNics: string[]) => {
  if (details === null) {
    return DHCPNics.indexOf(iface) >= 0;
  }
  return getNmcliValue(details, 'ipv4.method') === 'auto';
};

const getLinuxIfaceDNSsuffix = (details: string | null) => {
  if (details === null) {
    return 'Unknown';
  }
  const dnsSuffix = getNmcliValue(details, 'ipv4.dns-search');
  return dnsSuffix === '--' ? 'Not defined' : dnsSuffix;
};

const getLinuxIfaceIEEE8021xAuth = (details: string | null) => {
  if (details === null) {
    return 'Not defined';
  }
  const authenticationProtocol = getNmcliValue(details, '802-1x.eap');
  return authenticationProtocol === '--' ? '' : authenticationProtocol;
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

// one default route per interface, incl. multipath nexthop lines
const getLinuxGateways = async () => {
  const result: { [iface: string]: string } = {};
  try {
    const { stdout } = await exec('ip -4 route show default 2> /dev/null', EXEC_OPTS_LINUX);
    for (const line of stdout.split('\n')) {
      for (const match of line.matchAll(/(?:via\s+(\S+)\s+)?dev\s+(\S+)/g)) {
        if (!result[match[2]]) {
          result[match[2]] = match[1] || '';
        }
      }
    }
  } catch {}
  return result;
};

// virtio-net hangs one level below its pci device, so the leaf alone is not enough - but searching
// the whole path would hand a USB NIC the slot of its host controller. Hence the last two segments.
const PCI_SLOT = /^[0-9a-f]{4}:[0-9a-f]{2}:[0-9a-f]{2}\.[0-9a-f]$/i;

export const pciSlotFromPath = (path: string) => {
  const segments = path.split('/');
  return segments.slice(-2).reverse().find((segment) => PCI_SLOT.test(segment)) || null;
};

// vendor / model of the underlying PCI or USB device - static, so each device is looked at once.
// Only conclusive results are remembered; a failed lookup is retried on the next call.
const _nicHardware: { [iface: string]: { vendor: string; model: string } } = {};
const _nicHardwareChecked = new Set<string>();

const getLinuxNicHardware = async (devices: string[]) => {
  let pciDevices: PciData[] | null = null;
  for (const device of devices) {
    // aliases like eth0:1 share the hardware of their base device
    const dev = device.split(':')[0];
    if (!isSafePathSegment(dev) || _nicHardwareChecked.has(dev)) {
      continue;
    }
    let target = '';
    try {
      target = await realpath(`/sys/class/net/${dev}/device`);
    } catch {
      // virtual interfaces have none, a physical one may not be up yet
      continue;
    }
    // USB NICs keep manufacturer / product on the parent usb device - check this before the pci slot
    const [vendor, model] = await Promise.all([readSysfs(join(target, '..', 'manufacturer')), readSysfs(join(target, '..', 'product'))]);
    if (vendor || model) {
      _nicHardware[dev] = { vendor, model };
      _nicHardwareChecked.add(dev);
      continue;
    }
    const slot = pciSlotFromPath(target);
    if (!slot) {
      _nicHardwareChecked.add(dev);
      continue;
    }
    pciDevices = pciDevices || (await pci());
    if (!pciDevices.length) {
      // no lspci on this host - not a final answer
      continue;
    }
    const entry = pciDevices.find((item) => item.slot && slot.endsWith(item.slot));
    if (entry) {
      _nicHardware[dev] = { vendor: entry.vendor, model: entry.model };
    }
    _nicHardwareChecked.add(dev);
  }
  return _nicHardware;
};

export const networkInterfaces = async (defaultString = '', rescan = true): Promise<NetworkInterfacesData[]> => {
  await nextTick();
  const interfaces = osNetworkInterfaces();
  if (JSON.stringify(interfaces) === JSON.stringify(_interfaces) && !rescan) {
    return filterDefaultInterface(_networkInterfaces, defaultString);
  }
  _interfaces = cloneObj(interfaces);

  let result: NetworkInterfacesData[] = [];

  try {
    const [_dhcpNics, defaultInterface, deviceStatus, gateways, sysfsDevices, wirelessLines] = await Promise.all([
      getLinuxDHCPNics(),
      networkInterfaceDefault(),
      getLinuxDeviceStatus(),
      getLinuxGateways(),
      readdir('/sys/class/net').catch(() => [] as string[]),
      readFileLines('/proc/net/wireless')
    ]);
    // os.networkInterfaces() only lists interfaces with an assigned address - sysfs knows the others too (#903, #355)
    const devices = Object.keys(interfaces);
    for (const dev of sysfsDevices) {
      if (!devices.some((device) => device.split(':')[0] === dev)) {
        devices.push(dev);
      }
    }
    const hardware = await getLinuxNicHardware(devices);
    const scanInterface = async (dev: string): Promise<NetworkInterfacesData> => {
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
      const ifaceSanitized = sanitizeString(ifaceDevName, true);

      let lines: string[] = [];
      try {
        const safe = isSafePathSegment(ifaceSanitized);
        const connectionName = getLinuxIfaceConnectionName(deviceStatus, ifaceSanitized);
        // iw needs nl80211 - skip the spawn for every non cfg80211 interface
        const [sysfsLines, iwOut, details] = await Promise.all([
          safe ? readSysfsMany(`/sys/class/net/${ifaceSanitized}`, ['address', 'carrier_changes', 'duplex', 'mtu', 'operstate', 'speed', 'type']) : [],
          safe ? fileExists(`/sys/class/net/${ifaceSanitized}/phy80211`).then((wifi) => (wifi ? execSecure('iw', ['dev', ifaceSanitized, 'link'], EXEC_OPTS) : '')) : '',
          getLinuxConnectionDetails(connectionName)
        ]);
        lines = sysfsLines;
        lines.push(`wireless: ${wirelessLines.find((line: string) => line.indexOf(ifaceSanitized) >= 0) || ''}`);
        // keep the raw "tx bitrate: <x> MBit/s" lines - getValue() matches on the line start
        lines.push(...iwOut.split('\n').filter((line: string) => line.indexOf('bitrate') >= 0).map((line: string) => line.trim()));
        dhcp = getLinuxIfaceDHCPstatus(ifaceSanitized, details, _dhcpNics);
        dnsSuffix = getLinuxIfaceDNSsuffix(details);
        ieee8021xAuth = getLinuxIfaceIEEE8021xAuth(details);
        ieee8021xState = getLinuxIfaceIEEE8021xState(ieee8021xAuth);
      } catch {}
      duplex = getValue(lines, 'duplex');
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
      return {
        ...initNetworkInterface,
        iface: ifaceSanitized,
        ifaceName,
        vendor: hardware[ifaceSanitized]?.vendor || '',
        model: hardware[ifaceSanitized]?.model || '',
        default: iface === defaultInterface,
        ip4,
        ip4subnet,
        ip6,
        ip6subnet,
        gateway: gateways[ifaceSanitized] || '',
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
      };
    };
    for (let i = 0; i < devices.length; i += SCAN_CONCURRENCY) {
      result.push(...(await Promise.all(devices.slice(i, i + SCAN_CONCURRENCY).map(scanInterface))));
    }
  } catch {}
  _networkInterfaces = result;
  return filterDefaultInterface(result, defaultString);
};
