import { release } from 'os';
import { promises as fs, existsSync } from 'fs';
import { getValue, nextTick } from '../common';
import { execCmd } from '../common/exec';
import { initSystem } from '../common/defaults';
import { decodePiCpuinfo } from '../common/raspberry';
import { FREEBSD, NETBSD } from '../common/const';

export const nixSystem = async () => {
  const result = initSystem;
  let stdout = (await execCmd('export LC_ALL=C; dmidecode -t system 2>/dev/null; unset LC_ALL')).toString();
  // if (!error) {
  let lines = stdout.split('\n');
  result.manufacturer = getValue(lines, 'manufacturer');
  result.model = getValue(lines, 'product name');
  result.version = getValue(lines, 'version');
  result.serial = getValue(lines, 'serial number');
  result.uuid = getValue(lines, 'uuid').toLowerCase();
  result.sku = getValue(lines, 'sku number');
  // }
  // Non-Root values
  const cmd = `echo -n "product_name: "; cat /sys/devices/virtual/dmi/id/product_name 2>/dev/null; echo;
            echo -n "product_serial: "; cat /sys/devices/virtual/dmi/id/product_serial 2>/dev/null; echo;
            echo -n "product_uuid: "; cat /sys/devices/virtual/dmi/id/product_uuid 2>/dev/null; echo;
            echo -n "product_version: "; cat /sys/devices/virtual/dmi/id/product_version 2>/dev/null; echo;
            echo -n "sys_vendor: "; cat /sys/devices/virtual/dmi/id/sys_vendor 2>/dev/null; echo;`;
  try {
    lines = (await execCmd(cmd)).toString().split('\n');
    result.manufacturer = result.manufacturer === '' ? getValue(lines, 'sys_vendor') : result.manufacturer;
    result.model = result.model === '' ? getValue(lines, 'product_name') : result.model;
    result.version = result.version === '' ? getValue(lines, 'product_version') : result.version;
    result.serial = result.serial === '' ? getValue(lines, 'product_serial') : result.serial;
    result.uuid = result.uuid === '' ? getValue(lines, 'product_uuid').toLowerCase() : result.uuid;
  } catch { }
  if (!result.serial || result.serial.toLowerCase().indexOf('o.e.m.') !== -1) { result.serial = '-'; }
  if (!result.manufacturer || result.manufacturer.toLowerCase().indexOf('o.e.m.') !== -1) { result.manufacturer = ''; }
  if (!result.model || result.model.toLowerCase().indexOf('o.e.m.') !== -1) { result.model = 'Computer'; }
  if (!result.version || result.version.toLowerCase().indexOf('o.e.m.') !== -1) { result.version = ''; }
  if (!result.sku || result.sku.toLowerCase().indexOf('o.e.m.') !== -1) { result.sku = '-'; }

  // detect virtual (1)
  if (result.model.toLowerCase() === 'virtualbox' || result.model.toLowerCase() === 'kvm' || result.model.toLowerCase() === 'virtual machine' || result.model.toLowerCase() === 'bochs' || result.model.toLowerCase().startsWith('vmware') || result.model.toLowerCase().startsWith('droplet')) {
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
  if (!result.virtual) {
    try {
      const disksById = (await execCmd('ls -1 /dev/disk/by-id/ 2>/dev/null')).toString();
      if (disksById.indexOf('_QEMU_') >= 0) {
        result.virtual = true;
        result.virtualHost = 'QEMU';
      }
      if (disksById.indexOf('_VBOX_') >= 0) {
        result.virtual = true;
        result.virtualHost = 'VirtualBox';
      }
    } catch { }
  }
  if (!result.virtual && (release().toLowerCase().indexOf('microsoft') >= 0 || release().toLowerCase().endsWith('wsl2'))) {
    const kernelVersion = parseFloat(release().toLowerCase());
    result.virtual = true;
    result.manufacturer = 'Microsoft';
    result.model = 'WSL';
    result.version = kernelVersion < 4.19 ? '1' : '2';
  }
  if ((FREEBSD || NETBSD) && !result.virtualHost) {
    try {
      const procInfo = await execCmd('dmidecode -t 4');
      const procLines = procInfo.toString().split('\n');
      const procManufacturer = getValue(procLines, 'manufacturer', ':', true);
      switch (procManufacturer.toLowerCase()) {
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
    } catch { }
  }
  // detect docker
  if (existsSync('/.dockerenv') || existsSync('/.dockerinit')) {
    result.model = 'Docker Container';
  }
  try {
    stdout = (await execCmd('dmesg 2>/dev/null | grep -iE "virtual|hypervisor" | grep -iE "vmware|qemu|kvm|xen" | grep -viE "Nested Virtualization|/virtual/"')).toString();
    // detect virtual machines
    const lines = stdout.split('\n');
    if (lines.length > 0) {
      if (result.model === 'Computer') { result.model = 'Virtual machine'; }
      result.virtual = true;
      if (stdout.toString().toLowerCase().indexOf('vmware') >= 0 && !result.virtualHost) {
        result.virtualHost = 'VMware';
      }
      if (stdout.toString().toLowerCase().indexOf('qemu') >= 0 && !result.virtualHost) {
        result.virtualHost = 'QEMU';
      }
      if (stdout.toString().toLowerCase().indexOf('xen') >= 0 && !result.virtualHost) {
        result.virtualHost = 'Xen';
      }
      if (stdout.toString().toLowerCase().indexOf('kvm') >= 0 && !result.virtualHost) {
        result.virtualHost = 'KVM';
      }
    }
  } catch { }

  if (result.manufacturer === '' && result.model === 'Computer' && result.version === '') {
    // Check Raspberry Pi
    stdout = (await fs.readFile('/proc/cpuinfo')).toString();
    if (stdout) {
      const lines = stdout.split('\n');
      result.model = getValue(lines, 'hardware', ':', true).toUpperCase();
      result.version = getValue(lines, 'revision', ':', true).toLowerCase();
      result.serial = getValue(lines, 'serial', ':', true);
      const model = getValue(lines, 'model:', ':', true);
      // reference values: https://elinux.org/RPi_HardwareHistory
      // https://www.raspberrypi.org/documentation/hardware/raspberrypi/revision-codes/README.md
      if ((result.model === 'BCM2835' || result.model === 'BCM2708' || result.model === 'BCM2709' || result.model === 'BCM2710' || result.model === 'BCM2711' || result.model === 'BCM2836' || result.model === 'BCM2837') && model.toLowerCase().indexOf('raspberry') >= 0) {
        const rPIRevision = decodePiCpuinfo(lines);
        result.model = rPIRevision.model;
        result.version = rPIRevision.revisionCode;
        result.manufacturer = 'Raspberry Pi Foundation';
        result.raspberry = {
          manufacturer: rPIRevision.manufacturer,
          processor: rPIRevision.processor,
          type: rPIRevision.type,
          revision: rPIRevision.revision
        };
      }
    }
  }
  return result;
};

export const system = async () => {
  await nextTick();
  return nixSystem();
};

