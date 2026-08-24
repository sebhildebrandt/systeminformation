import { networkInterfaces as osNetworkInterfaces } from 'node:os';
import { getValue, nextTick, toInt } from '../common';
import { execOptsWin } from '../common/const';
import { initNetworkInterface } from '../common/defaults';
import { exec } from '../common/exec';
import { cloneObj } from '../common/index';
import { testVirtualNic } from '../common/network';
import { sanitizeString } from '../common/security';
import type { NetworkInterfacesData } from '../common/types';
import { ps } from '../common/windows';
import { networkInterfaceDefault } from './network-interface-default';

let _interfaces: any = {}; // nodejs structure
let _networkInterfaces: NetworkInterfacesData[] = []; // si structure

const parseLinesWindowsNics = (sections: any[], nconfigsections: any[]) => {
  const nics = [];
  for (let i = 0; i < sections.length; i++) {
    try {
      if (Object.prototype.hasOwnProperty.call(sections, i)) {
        if (sections[i].trim() !== '') {
          const lines = sections[i].trim().split('\r\n');
          let linesNicConfig = null;
          try {
            linesNicConfig = nconfigsections?.[i] ? nconfigsections[i].trim().split('\r\n') : [];
          } catch {}

          const netEnabled = getValue(lines, 'NetEnabled', ':');
          let adapterType = getValue(lines, 'AdapterTypeID', ':') === '9' ? 'wireless' : 'wired';
          const ifacename = getValue(lines, 'Name', ':').replace(/\]/g, ')').replace(/\[/g, '(');
          const iface = getValue(lines, 'NetConnectionID', ':').replace(/\]/g, ')').replace(/\[/g, '(');
          if (ifacename.toLowerCase().indexOf('wi-fi') >= 0 || ifacename.toLowerCase().indexOf('wireless') >= 0) {
            adapterType = 'wireless';
          }
          if (netEnabled !== '') {
            const speed = toInt(getValue(lines, 'speed', ':').trim()) / 1000000;
            nics.push({
              mac: getValue(lines, 'MACAddress', ':').toLowerCase(),
              dhcp: getValue(linesNicConfig, 'dhcpEnabled', ':').toLowerCase() === 'true',
              name: ifacename,
              iface,
              netEnabled: netEnabled === 'TRUE',
              speed: Number.isNaN(speed) ? null : speed,
              operstate: getValue(lines, 'NetConnectionStatus', ':') === '2' ? 'up' : 'down',
              type: adapterType
            });
          }
        }
      }
    } catch {}
  }
  return nics;
};

const getWindowsNics = async () => {
  let cmd = 'Get-CimInstance Win32_NetworkAdapter | fl *' + "; echo '#-#-#-#';";
  cmd += 'Get-CimInstance Win32_NetworkAdapterConfiguration | fl DHCPEnabled' + '';
  try {
    const stdout = String((await ps.exec(cmd)) || '');
    const data = stdout.split('#-#-#-#');
    const nsections = (data[0] || '').split(/\n\s*\n/);
    const nconfigsections = (data[1] || '').split(/\n\s*\n/);

    return parseLinesWindowsNics(nsections, nconfigsections);
  } catch {
    return [];
  }
};

const getWindowsDNSsuffixes = async () => {
  let iface: any = {};

  const dnsSuffixes = {
    primaryDNS: '',
    exitCode: 0,
    interfaces: <any[]>[]
  };

  try {
    const { stdout } = await exec('ipconfig /all', execOptsWin);
    const ipconfigArray = stdout.split('\r\n\r\n');

    ipconfigArray.forEach((element: any, index: number) => {
      if (index === 1) {
        const longPrimaryDNS = element.split('\r\n').filter((element: any) => {
          return element.toUpperCase().includes('DNS');
        });
        const primaryDNS = longPrimaryDNS[0].substring(longPrimaryDNS[0].lastIndexOf(':') + 1);
        dnsSuffixes.primaryDNS = primaryDNS.trim();
        if (!dnsSuffixes.primaryDNS) {
          dnsSuffixes.primaryDNS = 'Not defined';
        }
      }
      if (index > 1) {
        if (index % 2 === 0) {
          const name = element.substring(element.lastIndexOf(' ') + 1).replace(':', '');
          iface.name = name;
        } else {
          const connectionSpecificDNS = element.split('\r\n').filter((element: any) => {
            return element.toUpperCase().includes('DNS');
          });
          const dnsSuffix = connectionSpecificDNS[0].substring(connectionSpecificDNS[0].lastIndexOf(':') + 1);
          iface.dnsSuffix = dnsSuffix.trim();
          dnsSuffixes.interfaces.push(iface);
          iface = {};
        }
      }
    });

    return dnsSuffixes;
  } catch {
    return {
      primaryDNS: '',
      exitCode: 0,
      interfaces: []
    };
  }
};

const getWindowsIfaceDNSsuffix = (interfaces: any[], ifacename: string) => {
  let dnsSuffix = '';
  // Adding (.) to ensure ifacename compatibility when duplicated iface-names
  const interfaceName = `${ifacename}.`;
  try {
    const connectionDnsSuffix = interfaces
      .filter((iface) => {
        return interfaceName.includes(`${iface.name}.`);
      })
      .map((iface) => iface.dnsSuffix);
    if (connectionDnsSuffix[0]) {
      dnsSuffix = connectionDnsSuffix[0];
    }
    if (!dnsSuffix) {
      dnsSuffix = '';
    }
    return dnsSuffix;
  } catch {
    return 'Unknown';
  }
};

const getWindowsWiredProfilesInformation = async () => {
  try {
    const { stdout } = await exec('netsh lan show profiles', execOptsWin);
    const profileList = stdout.split('\r\nProfile on interface');
    return profileList;
  } catch (error: any) {
    if (error.code === 1 && (error.stdout || '').includes('AutoConfig')) {
      return 'Disabled';
    }
    return [];
  }
};

const getWindowsWirelessIfaceSSID = async (interfaceName: string) => {
  try {
    const { stdout } = await exec(`netsh wlan show interface name="${interfaceName}" | findstr "SSID"`, execOptsWin);
    const SSID = stdout.split('\r\n')[0];
    const parseSSID = (SSID.split(':').pop() || '').trim();
    return parseSSID;
  } catch {
    return 'Unknown';
  }
};

const getWindowsIEEE8021x = async (connectionType: string, iface: string, interfaces: any) => {
  const i8021x = {
    state: 'Unknown',
    protocol: 'Unknown'
  };

  if (interfaces === 'Disabled') {
    i8021x.state = 'Disabled';
    i8021x.protocol = 'Not defined';
    return i8021x;
  }

  if (connectionType === 'wired' && interfaces.length > 0) {
    try {
      // Get 802.1x information by interface name
      const iface8021xInfo = interfaces.find((element: string) => {
        return element.includes(`${iface}\r\n`);
      });
      const arrayIface8021xInfo = iface8021xInfo.split('\r\n');
      const state8021x = arrayIface8021xInfo.find((element: string) => {
        return element.includes('802.1x');
      });

      if (state8021x.includes('Disabled')) {
        i8021x.state = 'Disabled';
        i8021x.protocol = 'Not defined';
      } else if (state8021x.includes('Enabled')) {
        const protocol8021x = arrayIface8021xInfo.find((element: string) => {
          return element.includes('EAP');
        });
        i8021x.protocol = protocol8021x.split(':').pop();
        i8021x.state = 'Enabled';
      }
    } catch {
      return i8021x;
    }
  } else if (connectionType === 'wireless') {
    let i8021xState = '';
    let i8021xProtocol = '';
    try {
      const SSID = await getWindowsWirelessIfaceSSID(sanitizeString(iface));
      if (SSID !== 'Unknown') {
        const ifaceSanitized = sanitizeString(SSID);
        const { stdout } = await exec(`netsh wlan show profiles "${ifaceSanitized}"`, execOptsWin);
        const profiles = stdout.split('\r\n');
        i8021xState = (profiles.find((l: string) => l.indexOf('802.1X') >= 0) || '').trim();
        i8021xProtocol = (profiles.find((l: string) => l.indexOf('EAP') >= 0) || '').trim();
      }

      if (i8021xState.includes(':') && i8021xProtocol.includes(':')) {
        let parts = i8021xState.split(':');
        i8021x.state = parts[parts.length - 1];
        parts = i8021xProtocol.split(':');
        i8021x.protocol = parts[parts.length - 1];
      }
    } catch (error: any) {
      // console.log('Error getting wireless information:', error);
      if (error.code === 1 && (error.stdout || '').includes('AutoConfig')) {
        i8021x.state = 'Disabled';
        i8021x.protocol = 'Not defined';
      }
      return i8021x;
    }
  }

  return i8021x;
};

export const networkInterfaces = async (defaultString = '', rescan = true): Promise<NetworkInterfacesData[]> => {
  await nextTick();
  const interfaces: any = osNetworkInterfaces();
  if (JSON.stringify(interfaces) === JSON.stringify(_interfaces) && !rescan) {
    return _networkInterfaces;
  }
  _interfaces = cloneObj(interfaces);

  let result: NetworkInterfacesData[] = [];

  try {
    const defaultInterface = await networkInterfaceDefault();
    const nics: any = await getWindowsNics();
    nics.forEach((nic: any) => {
      let found = false;
      Object.keys(interfaces).forEach((key) => {
        if (!found) {
          (interfaces[key] || []).forEach((value: any) => {
            if (Object.keys(value).indexOf('mac') >= 0) {
              found = value['mac'] === nic.mac;
            }
          });
        }
      });

      if (!found) {
        interfaces[nic.name] = [{ mac: nic.mac }];
      }
    });

    const nics8021xInfo = await getWindowsWiredProfilesInformation();
    const dnsSuffixes = await getWindowsDNSsuffixes();

    for (const dev in interfaces) {
      const ifaceSanitized = sanitizeString(dev);

      let iface = dev;
      let ip4 = '';
      let ip4subnet = '';
      let ip6 = '';
      let ip6subnet = '';
      let mac = '';
      let speed = 0;
      let operstate = 'down';
      let dhcp = false;
      let dnsSuffix = '';
      let ieee8021xAuth = '';
      let ieee8021xState = '';
      let type = '';

      let ifaceName = dev;
      (interfaces[dev] || []).forEach((details: any) => {
        if (details.family === 'IPv4' || details.family === 4) {
          ip4 = details.address;
          ip4subnet = details.netmask;
        }
        if (details.family === 'IPv6' || details.family === 6) {
          if (!ip6 || ip6.match(/^fe80::/i)) {
            ip6 = details.address;
            ip6subnet = details.netmask;
          }
        }
        mac = details.mac;
      });

      dnsSuffix = getWindowsIfaceDNSsuffix(dnsSuffixes.interfaces, ifaceSanitized);
      let foundFirst = false;
      nics.forEach((detail: any) => {
        if (detail.mac === mac && !foundFirst) {
          iface = detail.iface || iface;
          ifaceName = detail.name;
          dhcp = detail.dhcp;
          operstate = detail.operstate;
          speed = operstate === 'up' ? detail.speed : 0;
          type = detail.type;
          foundFirst = true;
        }
      });

      if (
        dev.toLowerCase().indexOf('wlan') >= 0 ||
        ifaceName.toLowerCase().indexOf('wlan') >= 0 ||
        ifaceName.toLowerCase().indexOf('802.11n') >= 0 ||
        ifaceName.toLowerCase().indexOf('wireless') >= 0 ||
        ifaceName.toLowerCase().indexOf('wi-fi') >= 0 ||
        ifaceName.toLowerCase().indexOf('wifi') >= 0
      ) {
        type = 'wireless';
      }

      const IEEE8021x = await getWindowsIEEE8021x(type, ifaceSanitized, nics8021xInfo);
      ieee8021xAuth = IEEE8021x.protocol;
      ieee8021xState = IEEE8021x.state;
      let internal = interfaces[dev] && (interfaces[dev] || [])[0] ? (interfaces[dev] || [])[0].internal : false;
      if (dev.toLowerCase().indexOf('loopback') > -1 || ifaceName.toLowerCase().indexOf('loopback') > -1) {
        internal = true;
      }
      const virtual = internal ? false : testVirtualNic(dev, ifaceName, mac);
      result.push({
        ...initNetworkInterface,
        iface,
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
        speed,
        dhcp,
        dnsSuffix,
        ieee8021xAuth,
        ieee8021xState
      });
    }
  } catch {}
  _networkInterfaces = result;
  if (defaultString.toLowerCase().indexOf('default') >= 0) {
    result = result.filter((item) => item.default);
    if (result.length > 0) {
      return [result[0]];
    } else {
      return [];
    }
  }

  return result;
};
