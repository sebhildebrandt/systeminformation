'use strict';
// @ts-check
// ==================================================================================
// memory.js
// ----------------------------------------------------------------------------------
// Description:   System Information - library
//                for Node.js
// Copyright:     (c) 2014 - 2020
// Author:        Sebastian Hildebrandt
// ----------------------------------------------------------------------------------
// License:       MIT
// ==================================================================================
// 5. Memory
// ----------------------------------------------------------------------------------

const os = require('os');
const exec = require('child_process').exec;
const util = require('./util');

let _platform = process.platform;

const _linux = (_platform === 'linux');
const _darwin = (_platform === 'darwin');
const _windows = (_platform === 'win32');
const _freebsd = (_platform === 'freebsd');
const _openbsd = (_platform === 'openbsd');
const _netbsd = (_platform === 'netbsd');
const _sunos = (_platform === 'sunos');

const OSX_RAM_manufacturers = {
  '0x014F': 'Transcend Information',
  '0x2C00': 'Micron Technology Inc.',
  '0x802C': 'Micron Technology Inc.',
  '0x80AD': 'Hynix Semiconductor Inc.',
  '0x80CE': 'Samsung Electronics Inc.',
  '0xAD00': 'Hynix Semiconductor Inc.',
  '0xCE00': 'Samsung Electronics Inc.',
  '0x02FE': 'Elpida',
  '0x5105': 'Qimonda AG i. In.',
  '0x8551': 'Qimonda AG i. In.',
  '0x859B': 'Crucial',
  '0x04CD': 'G-Skill'
};

// _______________________________________________________________________________________
// |                         R A M                              |          H D           |
// |______________________|_________________________|           |                        |
// |        active             buffers/cache        |           |                        |
// |________________________________________________|___________|_________|______________|
// |                     used                            free   |   used       free      |
// |____________________________________________________________|________________________|
// |                        total                               |          swap          |
// |____________________________________________________________|________________________|

// free (older versions)
// ----------------------------------
// # free
//              total       used        free     shared    buffers     cached
// Mem:         16038 (1)   15653 (2)   384 (3)  0 (4)     236 (5)     14788 (6)
// -/+ buffers/cache:       628 (7)     15409 (8)
// Swap:        16371         83      16288
//
// |------------------------------------------------------------|
// |                           R A M                            |
// |______________________|_____________________________________|
// | active (2-(5+6) = 7) |  available (3+5+6 = 8)              |
// |______________________|_________________________|___________|
// |        active        |  buffers/cache (5+6)    |           |
// |________________________________________________|___________|
// |                   used (2)                     | free (3)  |
// |____________________________________________________________|
// |                          total (1)                         |
// |____________________________________________________________|

//
// free (since free von procps-ng 3.3.10)
// ----------------------------------
// # free
//              total       used        free     shared    buffers/cache   available
// Mem:         16038 (1)   628 (2)     386 (3)  0 (4)     15024 (5)     14788 (6)
// Swap:        16371         83      16288
//
// |------------------------------------------------------------|
// |                           R A M                            |
// |______________________|_____________________________________|
// |                      |      available (6) estimated        |
// |______________________|_________________________|___________|
// |     active (2)       |   buffers/cache (5)     | free (3)  |
// |________________________________________________|___________|
// |                          total (1)                         |
// |____________________________________________________________|
//
// Reference: http://www.software-architect.net/blog/article/date/2015/06/12/-826c6e5052.html

// /procs/meminfo - sample (all in kB)
//
// MemTotal: 32806380 kB
// MemFree: 17977744 kB
// MemAvailable: 19768972 kB
// Buffers: 517028 kB
// Cached: 2161876 kB
// SwapCached: 456 kB
// Active: 12081176 kB
// Inactive: 2164616 kB
// Active(anon): 10832884 kB
// Inactive(anon): 1477272 kB
// Active(file): 1248292 kB
// Inactive(file): 687344 kB
// Unevictable: 0 kB
// Mlocked: 0 kB
// SwapTotal: 16768892 kB
// SwapFree: 16768304 kB
// Dirty: 268 kB
// Writeback: 0 kB
// AnonPages: 11568832 kB
// Mapped: 719992 kB
// Shmem: 743272 kB
// Slab: 335716 kB
// SReclaimable: 256364 kB
// SUnreclaim: 79352 kB

function mem(callback) {

  return new Promise((resolve) => {
    process.nextTick(() => {

      let result = {
        total: os.totalmem(),
        free: os.freemem(),
        used: os.totalmem() - os.freemem(),

        active: os.totalmem() - os.freemem(),     // temporarily (fallback)
        available: os.freemem(),                  // temporarily (fallback)
        buffers: 0,
        cached: 0,
        slab: 0,
        buffcache: 0,

        swaptotal: 0,
        swapused: 0,
        swapfree: 0
      };

      if (_linux) {
        exec('export LC_ALL=C; cat /proc/meminfo 2>/dev/null ; unset LC_ALL', function (error, stdout) {
          if (!error) {
            const lines = stdout.toString().split('\n');
            result.total = parseInt(util.getValue(lines, 'memtotal'), 10);
            result.total = result.total ? result.total * 1024 : os.totalmem();
            result.free = parseInt(util.getValue(lines, 'memfree'), 10);
            result.free = result.free ? result.free * 1024 : os.freemem();
            result.used = result.total - result.free;

            result.buffers = parseInt(util.getValue(lines, 'buffers'), 10);
            result.buffers = result.buffers ? result.buffers * 1024 : 0;
            result.cached = parseInt(util.getValue(lines, 'cached'), 10);
            result.cached = result.cached ? result.cached * 1024 : 0;
            result.slab = parseInt(util.getValue(lines, 'slab'), 10);
            result.slab = result.slab ? result.slab * 1024 : 0;
            result.buffcache = result.buffers + result.cached + result.slab;

            let available = parseInt(util.getValue(lines, 'memavailable'), 10);
            result.available = available ? available * 1024 : result.free + result.buffcache;
            result.active = result.total - result.available;

            result.swaptotal = parseInt(util.getValue(lines, 'swaptotal'), 10);
            result.swaptotal = result.swaptotal ? result.swaptotal * 1024 : 0;
            result.swapfree = parseInt(util.getValue(lines, 'swapfree'), 10);
            result.swapfree = result.swapfree ? result.swapfree * 1024 : 0;
            result.swapused = result.swaptotal - result.swapfree;
          }
          if (callback) { callback(result); }
          resolve(result);
        });
      }
      if (_freebsd || _openbsd || _netbsd) {
        exec('/sbin/sysctl -a 2>/dev/null | grep -E "hw.realmem|hw.physmem|vm.stats.vm.v_page_count|vm.stats.vm.v_wire_count|vm.stats.vm.v_active_count|vm.stats.vm.v_inactive_count|vm.stats.vm.v_cache_count|vm.stats.vm.v_free_count|vm.stats.vm.v_page_size"', function (error, stdout) {
          if (!error) {
            let lines = stdout.toString().split('\n');
            const pagesize = parseInt(util.getValue(lines, 'vm.stats.vm.v_page_size'), 10);
            const inactive = parseInt(util.getValue(lines, 'vm.stats.vm.v_inactive_count'), 10) * pagesize;
            const cache = parseInt(util.getValue(lines, 'vm.stats.vm.v_cache_count'), 10) * pagesize;

            result.total = parseInt(util.getValue(lines, 'hw.realmem'), 10);
            if (isNaN(result.total)) result.total = parseInt(util.getValue(lines, 'hw.physmem'), 10);
            result.free = parseInt(util.getValue(lines, 'vm.stats.vm.v_free_count'), 10) * pagesize;
            result.buffcache = inactive + cache;
            result.available = result.buffcache + result.free;
            result.active = result.total - result.free - result.buffcache;

            result.swaptotal = 0;
            result.swapfree = 0;
            result.swapused = 0;

          }
          if (callback) { callback(result); }
          resolve(result);
        });
      }
      if (_sunos) {
        if (callback) { callback(result); }
        resolve(result);
      }
      if (_darwin) {
        exec('vm_stat 2>/dev/null | grep "Pages active"', function (error, stdout) {
          if (!error) {
            let lines = stdout.toString().split('\n');

            result.active = parseInt(lines[0].split(':')[1], 10) * 4096;
            result.buffcache = result.used - result.active;
            result.available = result.free + result.buffcache;
          }
          exec('sysctl -n vm.swapusage 2>/dev/null', function (error, stdout) {
            if (!error) {
              let lines = stdout.toString().split('\n');
              if (lines.length > 0) {
                let line = lines[0].replace(/,/g, '.').replace(/M/g, '');
                line = line.trim().split('  ');
                for (let i = 0; i < line.length; i++) {
                  if (line[i].toLowerCase().indexOf('total') !== -1) result.swaptotal = parseFloat(line[i].split('=')[1].trim()) * 1024 * 1024;
                  if (line[i].toLowerCase().indexOf('used') !== -1) result.swapused = parseFloat(line[i].split('=')[1].trim()) * 1024 * 1024;
                  if (line[i].toLowerCase().indexOf('free') !== -1) result.swapfree = parseFloat(line[i].split('=')[1].trim()) * 1024 * 1024;
                }
              }
            }
            if (callback) { callback(result); }
            resolve(result);
          });
        });
      }
      if (_windows) {
        let swaptotal = 0;
        let swapused = 0;
        try {
          util.wmic('pagefile get AllocatedBaseSize, CurrentUsage').then((stdout, error) => {
            if (!error) {
              let lines = stdout.split('\r\n').filter(line => line.trim() !== '').filter((line, idx) => idx > 0);
              lines.forEach(function (line) {
                if (line !== '') {
                  line = line.trim().split(/\s\s+/);
                  swaptotal = swaptotal + parseInt(line[0], 10);
                  swapused = swapused + parseInt(line[1], 10);
                }
              });
            }
            result.swaptotal = swaptotal * 1024 * 1024;
            result.swapused = swapused * 1024 * 1024;
            result.swapfree = result.swaptotal - result.swapused;

            if (callback) { callback(result); }
            resolve(result);
          });
        } catch (e) {
          if (callback) { callback(result); }
          resolve(result);
        }
      }
    });
  });
}

exports.mem = mem;

function memLayout(callback) {

  function getManufacturer(manId) {
    if ({}.hasOwnProperty.call(OSX_RAM_manufacturers, manId)) {
      return (OSX_RAM_manufacturers[manId]);
    }
    return manId;
  }

  return new Promise((resolve) => {
    process.nextTick(() => {

      let result = [];

      if (_linux || _freebsd || _openbsd || _netbsd) {
        exec('export LC_ALL=C; dmidecode -t memory 2>/dev/null | grep -iE "Size:|Type|Speed|Manufacturer|Form Factor|Locator|Memory Device|Serial Number|Voltage|Part Number"; unset LC_ALL', function (error, stdout) {
          if (!error) {
            let devices = stdout.toString().split('Memory Device');
            devices.shift();
            devices.forEach(function (device) {
              let lines = device.split('\n');
              const sizeString = util.getValue(lines, 'Size');
              const size = sizeString.indexOf('GB') >= 0 ? parseInt(sizeString, 10) * 1024 * 1024 * 1024 : parseInt(sizeString, 10) * 1024 * 1024;
              if (parseInt(util.getValue(lines, 'Size'), 10) > 0) {
                result.push({
                  size,
                  bank: util.getValue(lines, 'Bank Locator'),
                  type: util.getValue(lines, 'Type:'),
                  clockSpeed: (util.getValue(lines, 'Configured Clock Speed:') ? parseInt(util.getValue(lines, 'Configured Clock Speed:'), 10) : (util.getValue(lines, 'Speed:') ? parseInt(util.getValue(lines, 'Speed:'), 10) : -1)),
                  formFactor: util.getValue(lines, 'Form Factor:'),
                  manufacturer: util.getValue(lines, 'Manufacturer:'),
                  partNum: util.getValue(lines, 'Part Number:'),
                  serialNum: util.getValue(lines, 'Serial Number:'),
                  voltageConfigured: parseFloat(util.getValue(lines, 'Configured Voltage:') || -1),
                  voltageMin: parseFloat(util.getValue(lines, 'Minimum Voltage:') || -1),
                  voltageMax: parseFloat(util.getValue(lines, 'Maximum Voltage:') || -1),
                });
              } else {
                result.push({
                  size: 0,
                  bank: util.getValue(lines, 'Bank Locator'),
                  type: 'Empty',
                  clockSpeed: 0,
                  formFactor: util.getValue(lines, 'Form Factor:'),
                  partNum: '',
                  serialNum: '',
                  voltageConfigured: -1,
                  voltageMin: -1,
                  voltageMax: -1,
                });
              }
            });
          }
          if (callback) { callback(result); }
          resolve(result);
        });
      }

      if (_darwin) {
        exec('system_profiler SPMemoryDataType', function (error, stdout) {
          if (!error) {
            let devices = stdout.toString().split('        BANK ');
            let hasBank = true;
            if (devices.length === 1) {
              devices = stdout.toString().split('        DIMM');
              hasBank = false;
            }
            devices.shift();
            devices.forEach(function (device) {
              let lines = device.split('\n');
              const bank = (hasBank ? 'BANK ' : 'DIMM') + lines[0].trim().split('/')[0];
              const size = parseInt(util.getValue(lines, '          Size'));
              if (size) {
                result.push({
                  size: size * 1024 * 1024 * 1024,
                  bank: bank,
                  type: util.getValue(lines, '          Type:'),
                  clockSpeed: parseInt(util.getValue(lines, '          Speed:'), 10),
                  formFactor: '',
                  manufacturer: getManufacturer(util.getValue(lines, '          Manufacturer:')),
                  partNum: util.getValue(lines, '          Part Number:'),
                  serialNum: util.getValue(lines, '          Serial Number:'),
                  voltageConfigured: -1,
                  voltageMin: -1,
                  voltageMax: -1,
                });
              } else {
                result.push({
                  size: 0,
                  bank: bank,
                  type: 'Empty',
                  clockSpeed: 0,
                  formFactor: '',
                  manufacturer: '',
                  partNum: '',
                  serialNum: '',
                  voltageConfigured: -1,
                  voltageMin: -1,
                  voltageMax: -1,
                });
              }
            });
          }
          if (callback) { callback(result); }
          resolve(result);
        });
      }
      if (_sunos) {
        if (callback) { callback(result); }
        resolve(result);
      }
      if (_windows) {
        const memoryTypes = 'Unknown|Other|DRAM|Synchronous DRAM|Cache DRAM|EDO|EDRAM|VRAM|SRAM|RAM|ROM|FLASH|EEPROM|FEPROM|EPROM|CDRAM|3DRAM|SDRAM|SGRAM|RDRAM|DDR|DDR2|DDR2 FB-DIMM|Reserved|DDR3|FBD2|DDR4|LPDDR|LPDDR2|LPDDR3|LPDDR4'.split('|');
        const FormFactors = 'Unknown|Other|SIP|DIP|ZIP|SOJ|Proprietary|SIMM|DIMM|TSOP|PGA|RIMM|SODIMM|SRIMM|SMD|SSMP|QFP|TQFP|SOIC|LCC|PLCC|BGA|FPBGA|LGA'.split('|');

        try {
          util.wmic('memorychip get /value').then((stdout, error) => {
            if (!error) {
              let devices = stdout.toString().split('BankL');
              devices.shift();
              devices.forEach(function (device) {
                let lines = device.split('\r\n');
                result.push({
                  size: parseInt(util.getValue(lines, 'Capacity', '='), 10) || 0,
                  bank: util.getValue(lines, 'abel', '='), // BankLabel
                  type: memoryTypes[parseInt(util.getValue(lines, 'MemoryType', '='), 10)],
                  clockSpeed: parseInt(util.getValue(lines, 'ConfiguredClockSpeed', '='), 10) || 0,
                  formFactor: FormFactors[parseInt(util.getValue(lines, 'FormFactor', '='), 10) || 0],
                  manufacturer: util.getValue(lines, 'Manufacturer', '='),
                  partNum: util.getValue(lines, 'PartNumber', '='),
                  serialNum: util.getValue(lines, 'SerialNumber', '='),
                  voltageConfigured: (parseInt(util.getValue(lines, 'ConfiguredVoltage', '='), 10) || 0) / 1000.0,
                  voltageMin: (parseInt(util.getValue(lines, 'MinVoltage', '='), 10) || 0) / 1000.0,
                  voltageMax: (parseInt(util.getValue(lines, 'MaxVoltage', '='), 10) || 0) / 1000.0,
                });
              });
            }
            if (callback) { callback(result); }
            resolve(result);
          });
        } catch (e) {
          if (callback) { callback(result); }
          resolve(result);
        }
      }
    });
  });
}

exports.memLayout = memLayout;

