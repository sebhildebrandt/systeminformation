'use strict';

import * as os from 'os';
import { promises as fs, existsSync } from 'fs';
import { getValue, noop, promiseAll, toInt } from "./common";
import { execCmd, powerShell } from "./common/exec";
import { initBaseboard, initBios, initChassis, initSystem } from "./common/initials";
import { chassisTypes } from "./common/mappings";
import { decodePiCpuinfo } from './common/raspberry';
import { parseDateTime } from './common/datetime';
import { FREEBSD, NETBSD } from './common/const';


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
  } catch (e) {
    noop();
  }
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
    } catch (e) {
      noop();
    }
  }
  if (!result.virtual && (os.release().toLowerCase().indexOf('microsoft') >= 0 || os.release().toLowerCase().endsWith('wsl2'))) {
    const kernelVersion = parseFloat(os.release().toLowerCase());
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
    } catch (e) {
      noop();
    }
  }
  // detect docker
  if (existsSync('/.dockerenv') || existsSync('/.dockerinit')) {
    result.model = 'Docker Container';
  }
  try {
    stdout = (await execCmd('dmesg 2>/dev/null | grep -iE "virtual|hypervisor" | grep -iE "vmware|qemu|kvm|xen" | grep -viE "Nested Virtualization|/virtual/"')).toString();
    // detect virtual machines
    let lines = stdout.split('\n');
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
  } catch (e) {
    noop();
  }

  if (result.manufacturer === '' && result.model === 'Computer' && result.version === '') {
    // Check Raspberry Pi
    stdout = (await fs.readFile('/proc/cpuinfo')).toString();
    if (stdout) {
      let lines = stdout.split('\n');
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

export const darwinSystem = async () => {
  const result = initSystem;
  const stdout = await exec('ioreg -c IOPlatformExpertDevice -d 2');
  if (stdout) {
    let lines = stdout.toString().replace(/[<>"]/g, '').split('\n');
    result.manufacturer = getValue(lines, 'manufacturer', '=', true);
    result.model = getValue(lines, 'model', '=', true);
    result.version = getValue(lines, 'version', '=', true);
    result.serial = getValue(lines, 'ioplatformserialnumber', '=', true);
    result.uuid = getValue(lines, 'ioplatformuuid', '=', true).toLowerCase();
    result.sku = getValue(lines, 'board-id', '=', true);
  }
  return result;
};

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



// ---------------
// BIOS

export const nixBios = async () => {
  const result = initBios;
  let cmd = '';
  if (process.arch === 'arm') {
    cmd = 'cat /proc/cpuinfo | grep Serial';
  } else {
    cmd = 'export LC_ALL=C; dmidecode -t bios 2>/dev/null; unset LC_ALL';
  }
  const stdout = await exec(cmd);
  let lines = stdout.toString().split('\n');
  result.vendor = getValue(lines, 'Vendor');
  result.version = getValue(lines, 'Version');
  let datetime = getValue(lines, 'Release Date');
  result.releaseDate = parseDateTime(datetime).date;
  result.revision = getValue(lines, 'BIOS Revision');
  let language = getValue(lines, 'Currently Installed Language').split('|')[0];
  if (language) {
    result.language = language;
  }
  if (lines.length && stdout.toString().indexOf('Characteristics:') >= 0) {
    const features: string[] = [];
    lines.forEach((line: string) => {
      if (line.indexOf(' is supported') >= 0) {
        const feature = line.split(' is supported')[0].trim();
        features.push(feature);
      }
    });
    result.features = features;
  }
  // Non-Root values
  cmd = `echo -n "bios_date: "; cat /sys/devices/virtual/dmi/id/bios_date 2>/dev/null; echo;
            echo -n "bios_vendor: "; cat /sys/devices/virtual/dmi/id/bios_vendor 2>/dev/null; echo;
            echo -n "bios_version: "; cat /sys/devices/virtual/dmi/id/bios_version 2>/dev/null; echo;`;
  try {
    lines = execSync(cmd).toString().split('\n');
    result.vendor = !result.vendor ? getValue(lines, 'bios_vendor') : result.vendor;
    result.version = !result.version ? getValue(lines, 'bios_version') : result.version;
    datetime = getValue(lines, 'bios_date');
    result.releaseDate = !result.releaseDate ? parseDateTime(datetime).date : result.releaseDate;
  } catch (e) {
    noop();
  }
  return result;
};

export const darwinBios = async () => {
  const result = initBios;
  result.vendor = 'Apple Inc.';
  const stdout = await exec('system_profiler SPHardwareDataType -json');
  try {
    const hardwareData = JSON.parse(stdout.toString());
    if (hardwareData && hardwareData.SPHardwareDataType && hardwareData.SPHardwareDataType.length) {
      let bootRomVersion = hardwareData.SPHardwareDataType[0].boot_rom_version;
      bootRomVersion = bootRomVersion ? bootRomVersion.split('(')[0].trim() : null;
      result.version = bootRomVersion;
    }
  } catch (e) {
    noop();
  }
  return result;
};

export const windowsBios = async () => {
  const result = initBios;
  const stdout = await powerShell('Get-WmiObject Win32_bios | fl *');
  if (stdout) {
    let lines = stdout.toString().split('\r\n');
    const description = getValue(lines, 'description', ':');
    if (description.indexOf(' Version ') !== -1) {
      // ... Phoenix ROM BIOS PLUS Version 1.10 A04
      result.vendor = description.split(' Version ')[0].trim();
      result.version = description.split(' Version ')[1].trim();
    } else if (description.indexOf(' Ver: ') !== -1) {
      // ... BIOS Date: 06/27/16 17:50:16 Ver: 1.4.5
      result.vendor = getValue(lines, 'manufacturer', ':');
      result.version = description.split(' Ver: ')[1].trim();
    } else {
      result.vendor = getValue(lines, 'manufacturer', ':');
      result.version = getValue(lines, 'version', ':');
    }
    result.releaseDate = getValue(lines, 'releasedate', ':');
    if (result.releaseDate.length >= 10) {
      result.releaseDate = result.releaseDate.substr(0, 4) + '-' + result.releaseDate.substr(4, 2) + '-' + result.releaseDate.substr(6, 2);
    }
    result.revision = getValue(lines, 'buildnumber', ':');
  }

  return result;
};


// ----------------
// Baseboard

export const nixBaseboard = async () => {
  const result = initBaseboard;
  let cmd = '';
  if (process.arch === 'arm') {
    cmd = 'cat /proc/cpuinfo | grep Serial';
  } else {
    cmd = 'export LC_ALL=C; dmidecode -t 2 2>/dev/null; unset LC_ALL';
  }
  const workload = [];
  workload.push(execCmd(cmd));
  workload.push(execCmd('export LC_ALL=C; dmidecode -t memory 2>/dev/null'));
  const data = await promiseAll(workload);
  let lines = data.results[0] ? data.results[0].toString().split('\n') : [''];
  result.manufacturer = getValue(lines, 'Manufacturer');
  result.model = getValue(lines, 'Product Name');
  result.version = getValue(lines, 'Version');
  result.serial = getValue(lines, 'Serial Number');
  result.assetTag = getValue(lines, 'Asset Tag');
  // Non-Root values
  cmd = `echo -n "board_asset_tag: "; cat /sys/devices/virtual/dmi/id/board_asset_tag 2>/dev/null; echo;
            echo -n "board_name: "; cat /sys/devices/virtual/dmi/id/board_name 2>/dev/null; echo;
            echo -n "board_serial: "; cat /sys/devices/virtual/dmi/id/board_serial 2>/dev/null; echo;
            echo -n "board_vendor: "; cat /sys/devices/virtual/dmi/id/board_vendor 2>/dev/null; echo;
            echo -n "board_version: "; cat /sys/devices/virtual/dmi/id/board_version 2>/dev/null; echo;`;
  try {
    lines = (await execCmd(cmd)).toString().split('\n');
    result.manufacturer = !result.manufacturer ? getValue(lines, 'board_vendor') : result.manufacturer;
    result.model = !result.model ? getValue(lines, 'board_name') : result.model;
    result.version = !result.version ? getValue(lines, 'board_version') : result.version;
    result.serial = !result.serial ? getValue(lines, 'board_serial') : result.serial;
    result.assetTag = !result.assetTag ? getValue(lines, 'board_asset_tag') : result.assetTag;
  } catch (e) {
    noop();
  }
  if (result.serial.toLowerCase().indexOf('o.e.m.') !== -1) { result.serial = '-'; }
  if (result.assetTag.toLowerCase().indexOf('o.e.m.') !== -1) { result.assetTag = '-'; }

  // mem
  lines = data.results[1] ? data.results[1].toString().split('\n') : [''];
  result.memMax = toInt(getValue(lines, 'Maximum Capacity')) * 1024 * 1024 * 1024 || null;
  result.memSlots = toInt(getValue(lines, 'Number Of Devices')) || null;

  // raspberry
  let linesRpi: string[] = [];
  try {
    linesRpi = (await fs.readFile('/proc/cpuinfo')).toString().split('\n');
  } catch (e) {
    noop();
  }
  const hardware = getValue(linesRpi, 'hardware');
  if (hardware.startsWith('BCM')) {
    const rpi = decodePiCpuinfo(linesRpi);
    result.manufacturer = rpi.manufacturer;
    result.model = 'Raspberry Pi';
    result.serial = rpi.serial;
    result.version = rpi.type + ' - ' + rpi.revision;
    result.memMax = os.totalmem();
    result.memSlots = 0;
  }

  return result;
};

export const darwinBaseboard = async () => {
  const result = initBaseboard;
  const workload = [];
  workload.push(execCmd('ioreg -c IOPlatformExpertDevice -d 2'));
  workload.push(execCmd('system_profiler SPMemoryDataType'));
  const data = await promiseAll(workload);
  let lines = data.results[0] ? data.results[0].toString().replace(/[<>"]/g, '').split('\n') : [''];
  result.manufacturer = getValue(lines, 'manufacturer', '=', true);
  result.model = getValue(lines, 'model', '=', true);
  result.version = getValue(lines, 'version', '=', true);
  result.serial = getValue(lines, 'ioplatformserialnumber', '=', true);
  result.assetTag = getValue(lines, 'board-id', '=', true);

  // mem
  let devices = data.results[1] ? data.results[1].toString().split('        BANK ') : [''];
  if (devices.length === 1) {
    devices = data.results[1] ? data.results[1].toString().split('        DIMM') : [''];
  }
  devices.shift();
  result.memSlots = devices.length;

  if (os.arch() === 'arm64') {
    result.memSlots = 0;
    result.memMax = os.totalmem();
  }

  return result;
};

export const windowsBaseboard = async () => {
  const result = initBaseboard;
  try {
    const workload = [];
    workload.push(powerShell('Get-WmiObject Win32_baseboard | fl *'));
    workload.push(powerShell('Get-WmiObject Win32_physicalmemoryarray | select MaxCapacity, MemoryDevices | fl'));
    const data = await promiseAll(workload);
    let lines = data.results[0] ? data.results[0].toString().split('\r\n') : [''];

    result.manufacturer = getValue(lines, 'manufacturer', ':');
    result.model = getValue(lines, 'model', ':');
    if (!result.model) {
      result.model = getValue(lines, 'product', ':');
    }
    result.version = getValue(lines, 'version', ':');
    result.serial = getValue(lines, 'serialnumber', ':');
    result.assetTag = getValue(lines, 'partnumber', ':');
    if (!result.assetTag) {
      result.assetTag = getValue(lines, 'sku', ':');
    }

    // memphysical
    lines = data.results[1] ? data.results[1].toString().split('\r\n') : [''];
    result.memMax = toInt(getValue(lines, 'MaxCapacity', ':')) || null;
    result.memSlots = toInt(getValue(lines, 'MemoryDevices', ':')) || null;

  } catch (e) {
    noop();
  }
  return result;
};


// ---------------
// chassis

export const nixChassis = async () => {
  const result = initChassis;
  const cmd = `echo -n "chassis_asset_tag: "; cat /sys/devices/virtual/dmi/id/chassis_asset_tag 2>/dev/null; echo;
            echo -n "chassis_serial: "; cat /sys/devices/virtual/dmi/id/chassis_serial 2>/dev/null; echo;
            echo -n "chassis_type: "; cat /sys/devices/virtual/dmi/id/chassis_type 2>/dev/null; echo;
            echo -n "chassis_vendor: "; cat /sys/devices/virtual/dmi/id/chassis_vendor 2>/dev/null; echo;
            echo -n "chassis_version: "; cat /sys/devices/virtual/dmi/id/chassis_version 2>/dev/null; echo;`;
  const stdout = await execCmd(cmd);
  let lines = stdout.toString().split('\n');
  result.manufacturer = getValue(lines, 'chassis_vendor');
  const ctype = parseInt(getValue(lines, 'chassis_type').replace(/\D/g, ''));
  result.type = (ctype && !isNaN(ctype) && ctype < chassisTypes.length) ? chassisTypes[ctype - 1] : '';
  result.version = getValue(lines, 'chassis_version');
  result.serial = getValue(lines, 'chassis_serial');
  result.assetTag = getValue(lines, 'chassis_asset_tag');
  if (result.manufacturer.toLowerCase().indexOf('o.e.m.') !== -1) { result.manufacturer = '-'; }
  if (result.version.toLowerCase().indexOf('o.e.m.') !== -1) { result.version = '-'; }
  if (result.serial.toLowerCase().indexOf('o.e.m.') !== -1) { result.serial = '-'; }
  if (result.assetTag.toLowerCase().indexOf('o.e.m.') !== -1) { result.assetTag = '-'; }

  return result;
};

export const darwinChassis = async () => {
  const result = initChassis;
  const stdout = await execCmd('ioreg -c IOPlatformExpertDevice -d 2');
  if (stdout) {
    let lines = stdout.toString().replace(/[<>"]/g, '').split('\n');
    result.manufacturer = getValue(lines, 'manufacturer', '=', true);
    result.model = getValue(lines, 'model', '=', true);
    result.version = getValue(lines, 'version', '=', true);
    result.serial = getValue(lines, 'ioplatformserialnumber', '=', true);
    result.assetTag = getValue(lines, 'board-id', '=', true);
  }
  return result;
};

export const windowsChassis = async () => {
  const result = initChassis;
  const stdout = await powerShell('Get-WmiObject Win32_SystemEnclosure | fl *');
  if (stdout) {
    let lines = stdout.toString().split('\r\n');

    result.manufacturer = getValue(lines, 'manufacturer', ':');
    result.model = getValue(lines, 'model', ':');
    const ctype = parseInt(getValue(lines, 'ChassisTypes', ':').replace(/\D/g, ''));
    result.type = (ctype && !isNaN(ctype) && ctype < chassisTypes.length) ? chassisTypes[ctype - 1] : '';
    result.version = getValue(lines, 'version', ':');
    result.serial = getValue(lines, 'serialnumber', ':');
    result.assetTag = getValue(lines, 'partnumber', ':');
    result.sku = getValue(lines, 'sku', ':');
    if (result.manufacturer.toLowerCase().indexOf('o.e.m.') !== -1) { result.manufacturer = '-'; }
    if (result.version.toLowerCase().indexOf('o.e.m.') !== -1) { result.version = '-'; }
    if (result.serial.toLowerCase().indexOf('o.e.m.') !== -1) { result.serial = '-'; }
    if (result.assetTag.toLowerCase().indexOf('o.e.m.') !== -1) { result.assetTag = '-'; }
  }
  return result;
};



