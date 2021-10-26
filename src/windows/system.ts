'use strict';

import { getValue, noop } from '../common';
import { powerShell } from '../common/exec';
import { initSystem } from '../common/initials';
import { SystemData } from './../common/types';

export const windowsSystem = async () => {
  const result = initSystem;
  try {
    let stdout = (await powerShell('Get-WmiObject Win32_ComputerSystemProduct | fl *')).toString();
    if (stdout) {
      let lines = stdout.split('\r\n');
      result.manufacturer = getValue(lines, 'vendor', ':');
      result.model = getValue(lines, 'name', ':');
      result.version = getValue(lines, 'version', ':');
      result.serial = getValue(lines, 'identifyingnumber', ':');
      result.uuid = getValue(lines, 'uuid', ':').toLowerCase();
      // detect virtual (1)
      if (result.model.toLowerCase() === 'virtualbox' || result.model.toLowerCase() === 'kvm' || result.model.toLowerCase() === 'virtual machine' || result.model.toLowerCase() === 'bochs' || result.model.toLowerCase().startsWith('vmware')) {
        result.virtual = true;
        switch (result.model.toLowerCase()) {
          case 'virtualbox':
            result.virtualHost = 'VirtualBox';
            break;
          case 'vmware':
            result.virtualHost = 'VMware';
            break;
          case 'kvm':
            result.virtualHost = 'KVM';
            break;
          case 'bochs':
            result.virtualHost = 'bochs';
            break;
        }
      }
      if (result.manufacturer.toLowerCase().startsWith('vmware') || result.manufacturer.toLowerCase() === 'xen') {
        result.virtual = true;
        switch (result.manufacturer.toLowerCase()) {
          case 'vmware':
            result.virtualHost = 'VMware';
            break;
          case 'xen':
            result.virtualHost = 'Xen';
            break;
        }
      }
      stdout = (await powerShell('Get-WmiObject MS_Systeminformation -Namespace "root/wmi" | fl *')).toString();
      if (stdout) {
        lines = stdout.split('\r\n');
        result.sku = getValue(lines, 'systemsku', ':');
      }
      if (!result.virtual) {
        stdout = (await powerShell('Get-WmiObject Win32_bios | select Version, SerialNumber, SMBIOSBIOSVersion')).toString();
        if (stdout) {
          if (stdout.indexOf('VRTUAL') >= 0 || stdout.indexOf('A M I ') >= 0 || stdout.indexOf('VirtualBox') >= 0 || stdout.indexOf('VMWare') >= 0 || stdout.indexOf('Xen') >= 0) {
            result.virtual = true;
            if (stdout.indexOf('VirtualBox') >= 0 && !result.virtualHost) {
              result.virtualHost = 'VirtualBox';
            }
            if (stdout.indexOf('VMware') >= 0 && !result.virtualHost) {
              result.virtualHost = 'VMware';
            }
            if (stdout.indexOf('Xen') >= 0 && !result.virtualHost) {
              result.virtualHost = 'Xen';
            }
            if (stdout.indexOf('VRTUAL') >= 0 && !result.virtualHost) {
              result.virtualHost = 'Hyper-V';
            }
            if (stdout.indexOf('A M I') >= 0 && !result.virtualHost) {
              result.virtualHost = 'Virtual PC';
            }
          }
        }
      }
    }
  } catch (e) {
    noop();
  }
  return result;
};

export const system = () => {
  return new Promise<SystemData>(resolve => {
    process.nextTick(() => {
      return resolve(windowsSystem());
    });
  });
};

