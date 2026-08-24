import { cloneObj, getValue, nextTick } from '../common';
import { initSystem } from '../common/defaults';
import { ps } from '../common/windows';

export const system = async () => {
  await nextTick();
  const result = cloneObj(initSystem);
  try {
    let stdout = (await ps.exec('Get-CimInstance Win32_ComputerSystemProduct | select Name,Vendor,Version,IdentifyingNumber,UUID | fl')).toString();
    if (stdout) {
      let lines = stdout.split('\r\n');
      result.manufacturer = getValue(lines, 'vendor', ':');
      result.model = getValue(lines, 'name', ':');
      result.version = getValue(lines, 'version', ':');
      result.serial = getValue(lines, 'identifyingnumber', ':');
      result.uuid = getValue(lines, 'uuid', ':').toLowerCase();
      // detect virtual (1)
      const model = result.model.toLowerCase();
      if (model === 'virtualbox' || model === 'kvm' || model === 'virtual machine' || model === 'bochs' || model.startsWith('vmware') || model.startsWith('qemu') || model.startsWith('parallels')) {
        result.virtual = true;
        if (model.startsWith('virtualbox')) {
          result.virtualHost = 'VirtualBox';
        }
        if (model.startsWith('vmware')) {
          result.virtualHost = 'VMware';
        }
        if (model.startsWith('kvm')) {
          result.virtualHost = 'KVM';
        }
        if (model.startsWith('bochs')) {
          result.virtualHost = 'bochs';
        }
        if (model.startsWith('qemu')) {
          result.virtualHost = 'KVM';
        }
        if (model.startsWith('parallels')) {
          result.virtualHost = 'Parallels';
        }
      }
      const manufacturer = result.manufacturer.toLowerCase();
      if (manufacturer.startsWith('vmware') || manufacturer.startsWith('qemu') || manufacturer === 'xen' || manufacturer.startsWith('parallels')) {
        result.virtual = true;
        if (manufacturer.startsWith('vmware')) {
          result.virtualHost = 'VMware';
        }
        if (manufacturer.startsWith('xen')) {
          result.virtualHost = 'Xen';
        }
        if (manufacturer.startsWith('qemu')) {
          result.virtualHost = 'KVM';
        }
        if (manufacturer.startsWith('parallels')) {
          result.virtualHost = 'Parallels';
        }
      }
      stdout = (await ps.exec('Get-CimInstance MS_Systeminformation -Namespace "root/wmi" | select systemsku | fl')).toString();
      if (stdout) {
        lines = stdout.split('\r\n');
        result.sku = getValue(lines, 'systemsku', ':');
      }
      if (!result.virtual) {
        stdout = (await ps.exec('Get-CimInstance Win32_bios | select Version, SerialNumber, SMBIOSBIOSVersion')).toString();
        if (stdout) {
          if (
            stdout.indexOf('VRTUAL') >= 0 ||
            stdout.indexOf('A M I ') >= 0 ||
            stdout.indexOf('VirtualBox') >= 0 ||
            stdout.indexOf('VMWare') >= 0 ||
            stdout.indexOf('Xen') >= 0 ||
            stdout.indexOf('Parallels') >= 0
          ) {
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
            if (stdout.indexOf('Parallels') >= 0 && !result.virtualHost) {
              result.virtualHost = 'Parallels';
            }
          }
        }
      }
    }
  } catch {}
  return result;
};
