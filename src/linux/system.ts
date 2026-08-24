import { readFile } from 'node:fs/promises';
import { release } from 'node:os';
import { cloneObj, getValue, nextTick } from '../common';
import { execOptsLinux, FREEBSD, NETBSD, OPENBSD } from '../common/const';
import { initSystem } from '../common/defaults';
import { exec, execSave } from '../common/exec';
import { fileExists } from '../common/files';
import { cleanDefaults } from '../common/parse';
import { decodePiCpuinfo, isRaspberry } from '../common/raspberry';

export const system = async () => {
  await nextTick();
  const result = cloneObj(initSystem);
  let { stdout } = await exec('export LC_ALL=C; dmidecode -t system 2>/dev/null; unset LC_ALL', execOptsLinux);
  let lines = stdout.split('\n');

  result.manufacturer = getValue(lines, 'manufacturer');
  result.model = getValue(lines, 'product name');
  result.version = getValue(lines, 'version');
  result.serial = getValue(lines, 'serial number');
  result.uuid = getValue(lines, 'uuid').toLowerCase();
  result.sku = getValue(lines, 'sku number');

  // Non-Root values
  const cmd = `echo -n "product_name: "; cat /sys/devices/virtual/dmi/id/product_name 2>/dev/null; echo;
            echo -n "product_serial: "; cat /sys/devices/virtual/dmi/id/product_serial 2>/dev/null; echo;
            echo -n "product_uuid: "; cat /sys/devices/virtual/dmi/id/product_uuid 2>/dev/null; echo;
            echo -n "product_version: "; cat /sys/devices/virtual/dmi/id/product_version 2>/dev/null; echo;
            echo -n "sys_vendor: "; cat /sys/devices/virtual/dmi/id/sys_vendor 2>/dev/null; echo;`;
  try {
    ({ stdout } = await execSave(cmd));
    lines = stdout.split('\n');
    result.manufacturer = result.manufacturer === '' ? getValue(lines, 'sys_vendor') : result.manufacturer;
    result.model = result.model === '' ? getValue(lines, 'product_name') : result.model;
    result.version = result.version === '' ? getValue(lines, 'product_version') : result.version;
    result.serial = result.serial === '' ? getValue(lines, 'product_serial') : result.serial;
    result.uuid = result.uuid === '' ? getValue(lines, 'product_uuid').toLowerCase() : result.uuid;
  } catch {}
  result.manufacturer = cleanDefaults(result.manufacturer);
  result.model = cleanDefaults(result.model);
  result.version = cleanDefaults(result.version);
  result.serial = cleanDefaults(result.serial);
  result.uuid = cleanDefaults(result.uuid);
  result.sku = cleanDefaults(result.sku);

  // detect virtual (1)
  if (
    result.model.toLowerCase() === 'virtualbox' ||
    result.model.toLowerCase() === 'kvm' ||
    result.model.toLowerCase() === 'virtual machine' ||
    result.model.toLowerCase() === 'bochs' ||
    result.model.toLowerCase().startsWith('vmware') ||
    result.model.toLowerCase().startsWith('droplet')
  ) {
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
      ({ stdout } = await exec('ls -1 /dev/disk/by-id/ 2>/dev/null; pciconf -lv 2>/dev/null || true', execOptsLinux));
      if (stdout.indexOf('_QEMU_') >= 0 || stdout.indexOf('QEMU ') >= 0) {
        result.virtual = true;
        result.virtualHost = 'QEMU';
      }
      if (stdout.indexOf('_VBOX_') >= 0) {
        result.virtual = true;
        result.virtualHost = 'VirtualBox';
      }
    } catch {}
  }
  if (FREEBSD || NETBSD || OPENBSD) {
    try {
      ({ stdout } = await exec('sysctl -i kern.hostuuid kern.hostid hw.model', execOptsLinux));
      const lines = stdout.toString().split('\n');
      if (!result.uuid) {
        result.uuid = getValue(lines, 'kern.hostuuid', ':').toLowerCase();
      }
      if (!result.serial || result.serial === '-') {
        result.serial = getValue(lines, 'kern.hostid', ':').toLowerCase();
      }
      if (!result.model || result.model === 'Computer') {
        result.model = getValue(lines, 'hw.model', ':').trim();
      }
    } catch {}
  }

  if (!result.virtual && (release().toLowerCase().indexOf('microsoft') >= 0 || release().toLowerCase().endsWith('wsl2'))) {
    const kernelVersion = parseFloat(release().toLowerCase());
    result.virtual = true;
    result.manufacturer = 'Microsoft';
    result.model = 'WSL';
    result.version = kernelVersion < 4.19 ? '1' : '2';
  }
  if ((FREEBSD || NETBSD || OPENBSD) && !result.virtualHost) {
    try {
      ({ stdout } = await exec('dmidecode -t 4', execOptsLinux));
      const procLines = stdout.toString().split('\n');
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
    } catch {}
  }
  // detect docker
  if ((await fileExists('/.dockerenv')) || (await fileExists('/.dockerinit'))) {
    result.model = 'Docker Container';
  }
  try {
    ({ stdout } = await exec('dmesg 2>/dev/null | grep -iE "virtual|hypervisor" | grep -iE "vmware|qemu|kvm|xen" | grep -viE "Nested Virtualization|/virtual/"', execOptsLinux));
    // detect virtual machines
    const lines = stdout.split('\n');
    if (lines.length > 0) {
      if (result.model === 'Computer') {
        result.model = 'Virtual machine';
      }
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
  } catch {}

  if (result.manufacturer === '' && result.model === 'Computer' && result.version === '') {
    // Check Raspberry Pi
    stdout = (await readFile('/proc/cpuinfo')).toString();
    if (stdout) {
      const lines = stdout.split('\n');
      result.model = getValue(lines, 'hardware', ':', true).toUpperCase();
      result.version = getValue(lines, 'revision', ':', true).toLowerCase();
      result.serial = getValue(lines, 'serial', ':', true);
      // reference values: https://elinux.org/RPi_HardwareHistory
      // https://www.raspberrypi.org/documentation/hardware/raspberrypi/revision-codes/README.md
      if (await isRaspberry()) {
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
