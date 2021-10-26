import { promises as fs } from "fs";
import { getValue, toInt } from './common';
import { initMemData } from './common/initials';
import { MemData, MemLayoutData } from './common/types';
import { execCmd, powerShell } from './common/exec';
import { getManufacturerDarwin, getManufacturerLinux, raspberryClockSpeed } from './common/mappings';

export const linuxMem = async () => {
  let result = initMemData;
  try {
    const stdout = await fs.readFile('/proc/meminfo');
    const lines = stdout.toString().split('\n');
    result.total = parseInt(getValue(lines, 'memtotal'), 10);
    result.total = result.total ? result.total * 1024 : os.totalmem();
    result.free = parseInt(getValue(lines, 'memfree'), 10);
    result.free = result.free ? result.free * 1024 : os.freemem();
    result.used = result.total - result.free;

    result.buffers = parseInt(getValue(lines, 'buffers'), 10);
    result.buffers = result.buffers ? result.buffers * 1024 : 0;
    result.cached = parseInt(getValue(lines, 'cached'), 10);
    result.cached = result.cached ? result.cached * 1024 : 0;
    result.slab = parseInt(getValue(lines, 'slab'), 10);
    result.slab = result.slab ? result.slab * 1024 : 0;
    result.buffcache = result.buffers + result.cached + result.slab;

    let available = parseInt(getValue(lines, 'memavailable'), 10);
    result.available = available ? available * 1024 : result.free + result.buffcache;
    result.active = result.total - result.available;

    result.swaptotal = parseInt(getValue(lines, 'swaptotal'), 10);
    result.swaptotal = result.swaptotal ? result.swaptotal * 1024 : 0;
    result.swapfree = parseInt(getValue(lines, 'swapfree'), 10);
    result.swapfree = result.swapfree ? result.swapfree * 1024 : 0;
    result.swapused = result.swaptotal - result.swapfree;
  } catch (e) {
    noop();
  }
  return result;
};

export const bsdMem = async () => {
  let result = initMemData;
  try {
    const stdout = execCmd('/sbin/sysctl -a 2>/dev/null | grep -E "hw.realmem|hw.physmem|vm.stats.vm.v_page_count|vm.stats.vm.v_wire_count|vm.stats.vm.v_active_count|vm.stats.vm.v_inactive_count|vm.stats.vm.v_cache_count|vm.stats.vm.v_free_count|vm.stats.vm.v_page_size"');
    let lines = stdout.toString().split('\n');
    const pagesize = parseInt(getValue(lines, 'vm.stats.vm.v_page_size'), 10);
    const inactive = parseInt(getValue(lines, 'vm.stats.vm.v_inactive_count'), 10) * pagesize;
    const cache = parseInt(getValue(lines, 'vm.stats.vm.v_cache_count'), 10) * pagesize;

    result.total = parseInt(getValue(lines, 'hw.realmem'), 10);
    if (isNaN(result.total)) { result.total = parseInt(getValue(lines, 'hw.physmem'), 10); }
    result.free = parseInt(getValue(lines, 'vm.stats.vm.v_free_count'), 10) * pagesize;
    result.buffcache = inactive + cache;
    result.available = result.buffcache + result.free;
    result.active = result.total - result.free - result.buffcache;

    result.swaptotal = 0;
    result.swapfree = 0;
    result.swapused = 0;
  } catch (e) {
    noop();
  }
  return result;
};

export const darwinMem = async () => {
  let result = initMemData;
  try {
    let stdout = (await execCmd('vm_stat 2>/dev/null | grep "Pages active"')).toString();
    let lines = stdout.split('\n');

    result.active = parseInt(lines[0].split(':')[1], 10) * 4096;
    result.buffcache = result.used - result.active;
    result.available = result.free + result.buffcache;
    stdout = (await execCmd('sysctl -n vm.swapusage 2>/dev/null')).toString();
    lines = stdout.split('\n');
    if (lines.length > 0) {
      let line = lines[0].replace(/,/g, '.').replace(/M/g, '');
      const lineParts = line.trim().split('  ');
      for (let i = 0; i < lineParts.length; i++) {
        if (lineParts[i].toLowerCase().indexOf('total') !== -1) { result.swaptotal = parseFloat(lineParts[i].split('=')[1].trim()) * 1024 * 1024; }
        if (lineParts[i].toLowerCase().indexOf('used') !== -1) { result.swapused = parseFloat(lineParts[i].split('=')[1].trim()) * 1024 * 1024; }
        if (lineParts[i].toLowerCase().indexOf('free') !== -1) { result.swapfree = parseFloat(lineParts[i].split('=')[1].trim()) * 1024 * 1024; }
      }
    }
  } catch (e) {
    noop();
  }
  return result;
};

export const windowsMem = async () => {
  let result = initMemData;
  try {
    let swaptotal = 0;
    let swapused = 0;
    const stdout = await powerShell('Get-CimInstance Win32_PageFileUsage | Select AllocatedBaseSize, CurrentUsage');
    let lines = stdout.split('\r\n').filter(line => line.trim() !== '').filter((line, idx) => idx > 0);
    lines.forEach(function (line) {
      if (line !== '') {
        const lineParts = line.trim().split(/\s\s+/);
        swaptotal = swaptotal + (parseInt(lineParts[0], 10) || 0);
        swapused = swapused + (parseInt(lineParts[1], 10) || 0);
      }
    });
    result.swaptotal = swaptotal * 1024 * 1024;
    result.swapused = swapused * 1024 * 1024;
    result.swapfree = result.swaptotal - result.swapused;
  } catch (e) {
    noop();
  }
  return result;
};

// ----------------
// MemLayout


export const nixMemLayout = async () => {
  let result: MemLayoutData[] = [];
  try {

    let stdout = (await execCmd('export LC_ALL=C; dmidecode -t memory 2>/dev/null | grep -iE "Size:|Type|Speed|Manufacturer|Form Factor|Locator|Memory Device|Serial Number|Voltage|Part Number"; unset LC_ALL')).toString();
    let devices = stdout.toString().split('Memory Device');
    devices.shift();
    devices.forEach(function (device) {
      let lines = device.split('\n');
      const sizeString = getValue(lines, 'Size');
      const size = sizeString.indexOf('GB') >= 0 ? parseInt(sizeString, 10) * 1024 * 1024 * 1024 : parseInt(sizeString, 10) * 1024 * 1024;
      if (parseInt(getValue(lines, 'Size'), 10) > 0) {
        const totalWidth = toInt(getValue(lines, 'Total Width'));
        const dataWidth = toInt(getValue(lines, 'Data Width'));
        result.push({
          size,
          bank: getValue(lines, 'Bank Locator'),
          type: getValue(lines, 'Type:'),
          ecc: dataWidth && totalWidth ? totalWidth > dataWidth : false,
          clockSpeed: (getValue(lines, 'Configured Clock Speed:') ? parseInt(getValue(lines, 'Configured Clock Speed:'), 10) : (getValue(lines, 'Speed:') ? parseInt(getValue(lines, 'Speed:'), 10) : null)),
          formFactor: getValue(lines, 'Form Factor:'),
          manufacturer: getManufacturerLinux(getValue(lines, 'Manufacturer:')),
          partNum: getValue(lines, 'Part Number:'),
          serialNum: getValue(lines, 'Serial Number:'),
          voltageConfigured: parseFloat(getValue(lines, 'Configured Voltage:')) || null,
          voltageMin: parseFloat(getValue(lines, 'Minimum Voltage:')) || null,
          voltageMax: parseFloat(getValue(lines, 'Maximum Voltage:')) || null,
        });
      } else {
        result.push({
          size: 0,
          bank: getValue(lines, 'Bank Locator'),
          type: 'Empty',
          ecc: null,
          clockSpeed: 0,
          formFactor: getValue(lines, 'Form Factor:'),
          partNum: '',
          serialNum: '',
          voltageConfigured: null,
          voltageMin: null,
          voltageMax: null,
        });
      }
    });
    if (!result.length) {
      result.push({
        size: os.totalmem(),
        bank: '',
        type: '',
        ecc: null,
        clockSpeed: 0,
        formFactor: '',
        partNum: '',
        serialNum: '',
        voltageConfigured: null,
        voltageMin: null,
        voltageMax: null,
      });

      // Try Raspberry PI
      stdout = (await execCmd('cat /proc/cpuinfo 2>/dev/null')).toString();
      let lines = stdout.split('\n');
      let model = getValue(lines, 'hardware', ':', true).toUpperCase();
      let version = getValue(lines, 'revision', ':', true).toLowerCase();

      if (model === 'BCM2835' || model === 'BCM2708' || model === 'BCM2709' || model === 'BCM2835' || model === 'BCM2837') {

        result[0].type = 'LPDDR2';
        result[0].type = version && version[2] && version[2] === '3' ? 'LPDDR4' : result[0].type;
        result[0].ecc = false;
        result[0].clockSpeed = version && version[2] && raspberryClockSpeed[version[2]] || 400;
        result[0].clockSpeed = version && version[4] && version[4] === 'd' ? 500 : result[0].clockSpeed;
        result[0].formFactor = 'SoC';

        stdout = (await execCmd('vcgencmd get_config sdram_freq 2>/dev/null')).toString();
        lines = stdout.split('\n');
        let freq = parseInt(getValue(lines, 'sdram_freq', '=', true), 10) || 0;
        if (freq) {
          result[0].clockSpeed = freq;
        }

        stdout = (await execCmd('vcgencmd measure_volts sdram_p 2>/dev/null')).toString();
        lines = stdout.split('\n');
        let voltage = parseFloat(getValue(lines, 'volt', '=', true)) || 0;
        if (voltage) {
          result[0].voltageConfigured = voltage;
          result[0].voltageMin = voltage;
          result[0].voltageMax = voltage;
        }
      }
    }
  } catch (e) {
    noop();
  }
  return result;
};

export const darwinMemLayout = async () => {
  let result: MemLayoutData[] = [];
  try {
    const stdout = await exec('system_profiler SPMemoryDataType');
    const allLines = stdout.toString().split('\n');
    const eccStatus = getValue(allLines, 'ecc', ':', true).toLowerCase();
    let devices = stdout.toString().split('        BANK ');
    let hasBank = true;
    if (devices.length === 1) {
      devices = stdout.toString().split('        DIMM');
      hasBank = false;
    }
    devices.shift();
    devices.forEach((device: string) => {
      let lines = device.split('\n');
      const bank = (hasBank ? 'BANK ' : 'DIMM') + lines[0].trim().split('/')[0];
      const size = parseInt(getValue(lines, '          Size'));
      if (size) {
        result.push({
          size: size * 1024 * 1024 * 1024,
          bank: bank,
          type: getValue(lines, '          Type:'),
          ecc: eccStatus ? eccStatus === 'enabled' : null,
          clockSpeed: parseInt(getValue(lines, '          Speed:'), 10),
          formFactor: '',
          manufacturer: getManufacturerDarwin(getValue(lines, '          Manufacturer:')),
          partNum: getValue(lines, '          Part Number:'),
          serialNum: getValue(lines, '          Serial Number:'),
          voltageConfigured: null,
          voltageMin: null,
          voltageMax: null,
        });
      } else {
        result.push({
          size: 0,
          bank: bank,
          type: 'Empty',
          ecc: null,
          clockSpeed: 0,
          formFactor: '',
          manufacturer: '',
          partNum: '',
          serialNum: '',
          voltageConfigured: null,
          voltageMin: null,
          voltageMax: null,
        });
      }
    });
    if (!result.length) {
      const lines = stdout.toString().split('\n');
      const size = parseInt(getValue(lines, '      Memory:'));
      const type = getValue(lines, '      Type:');
      if (size && type) {
        result.push({
          size: size * 1024 * 1024 * 1024,
          bank: '0',
          type,
          ecc: false,
          clockSpeed: 0,
          formFactor: '',
          manufacturer: 'Apple',
          partNum: '',
          serialNum: '',
          voltageConfigured: null,
          voltageMin: null,
          voltageMax: null,
        });
      }
    }

  } catch (e) {
    noop();
  }
  return result;
};

export const windowsMemLayout = async () => {
  let result: MemLayoutData[] = [];
  try {
    const memoryTypes = 'Unknown|Other|DRAM|Synchronous DRAM|Cache DRAM|EDO|EDRAM|VRAM|SRAM|RAM|ROM|FLASH|EEPROM|FEPROM|EPROM|CDRAM|3DRAM|SDRAM|SGRAM|RDRAM|DDR|DDR2|DDR2 FB-DIMM|Reserved|DDR3|FBD2|DDR4|LPDDR|LPDDR2|LPDDR3|LPDDR4'.split('|');
    const FormFactors = 'Unknown|Other|SIP|DIP|ZIP|SOJ|Proprietary|SIMM|DIMM|TSOP|PGA|RIMM|SODIMM|SRIMM|SMD|SSMP|QFP|TQFP|SOIC|LCC|PLCC|BGA|FPBGA|LGA'.split('|');

    const stdout = await powerShell('Get-WmiObject Win32_PhysicalMemory | fl *');
    let devices = stdout.toString().split(/\n\s*\n/);
    devices.shift();
    devices.forEach(function (device) {
      let lines = device.split('\r\n');
      const dataWidth = toInt(getValue(lines, 'DataWidth', ':'));
      const totalWidth = toInt(getValue(lines, 'TotalWidth', ':'));
      const size = parseInt(getValue(lines, 'Capacity', ':'), 10) || 0;
      if (size) {
        result.push({
          size,
          bank: getValue(lines, 'BankLabel', ':'), // BankLabel
          type: memoryTypes[parseInt(getValue(lines, 'MemoryType', ':'), 10) || parseInt(getValue(lines, 'SMBIOSMemoryType', ':'), 10)],
          ecc: dataWidth && totalWidth ? totalWidth > dataWidth : false,
          clockSpeed: parseInt(getValue(lines, 'ConfiguredClockSpeed', ':'), 10) || parseInt(getValue(lines, 'Speed', ':'), 10) || 0,
          formFactor: FormFactors[parseInt(getValue(lines, 'FormFactor', ':'), 10) || 0],
          manufacturer: getValue(lines, 'Manufacturer', ':'),
          partNum: getValue(lines, 'PartNumber', ':'),
          serialNum: getValue(lines, 'SerialNumber', ':'),
          voltageConfigured: (parseInt(getValue(lines, 'ConfiguredVoltage', ':'), 10) || 0) / 1000.0,
          voltageMin: (parseInt(getValue(lines, 'MinVoltage', ':'), 10) || 0) / 1000.0,
          voltageMax: (parseInt(getValue(lines, 'MaxVoltage', ':'), 10) || 0) / 1000.0,
        });
      }
    });
  } catch (e) {
    noop();
  }
  return result;
};

export const mem = () => {
  return new Promise<MemData>(resolve => {
    process.nextTick(() => {
      return resolve(windowsMem());
    });
  });
};
export const memLayout = () => {
  return new Promise<MemLayoutData[]>(resolve => {
    process.nextTick(() => {
      return resolve(windowsMemLayout());
    });
  });
};
