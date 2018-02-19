'use strict';
// ==================================================================================
// memory.js
// ----------------------------------------------------------------------------------
// Description:   System Information - library
//                for Node.js
// Copyright:     (c) 2014 - 2018
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

const opts = {
  windowsHide: true
};

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
  '0x859B': 'Crucial'
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

function mem(callback) {

  return new Promise((resolve) => {
    process.nextTick(() => {

      let result = {
        total: os.totalmem(),
        free: os.freemem(),
        used: os.totalmem() - os.freemem(),

        active: os.totalmem() - os.freemem(),     // temporarily (fallback)
        available: os.freemem(),                  // temporarily (fallback)
        buffcache: 0,

        swaptotal: 0,
        swapused: 0,
        swapfree: 0
      };

      if (_linux) {
        exec('free -b', function (error, stdout) {
          if (!error) {
            let lines = stdout.toString().split('\n');

            let mem = lines[1].replace(/ +/g, ' ').split(' ');
            result.total = parseInt(mem[1], 10);
            result.free = parseInt(mem[3], 10);

            if (lines.length === 4) {                   // free (since free von procps-ng 3.3.10)
              result.buffcache = parseInt(mem[5], 10);
              result.available = parseInt(mem[6], 10);
              mem = lines[2].replace(/ +/g, ' ').split(' ');
            } else {                                    // free (older versions)
              result.buffcache = parseInt(mem[5], 10) + parseInt(mem[6], 10);
              result.available = result.free + result.buffcache;
              mem = lines[3].replace(/ +/g, ' ').split(' ');
            }
            result.active = result.total - result.free - result.buffcache;

            result.swaptotal = parseInt(mem[1], 10);
            result.swapfree = parseInt(mem[3], 10);
            result.swapused = parseInt(mem[2], 10);

          }
          if (callback) { callback(result); }
          resolve(result);
        });
      }
      if (_freebsd || _openbsd) {
        exec('/sbin/sysctl -a | grep -E "hw.realmem|hw.physmem|vm.stats.vm.v_page_count|vm.stats.vm.v_wire_count|vm.stats.vm.v_active_count|vm.stats.vm.v_inactive_count|vm.stats.vm.v_cache_count|vm.stats.vm.v_free_count|vm.stats.vm.v_page_size"', function (error, stdout) {
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
      if (_darwin) {
        exec('vm_stat | grep "Pages active"', function (error, stdout) {
          if (!error) {
            let lines = stdout.toString().split('\n');

            result.active = parseInt(lines[0].split(':')[1], 10) * 4096;
            result.buffcache = result.used - result.active;
            result.available = result.free + result.buffcache;
          }
          exec('sysctl -n vm.swapusage', function (error, stdout) {
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
        exec(util.getWmic() + ' pagefile get AllocatedBaseSize, CurrentUsage', opts, function (error, stdout) {
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
      }
    });
  });
}

exports.mem = mem;

function memLayout(callback) {

  function getManufacturer(manId) {
    if (OSX_RAM_manufacturers.hasOwnProperty(manId)) {
      return(OSX_RAM_manufacturers[manId]);
    }
    return manId;
  }

  return new Promise((resolve) => {
    process.nextTick(() => {

      let result = [];

      if (_linux || _freebsd || _openbsd) {
        exec('dmidecode -t memory | grep -iE "Size:|Type|Speed|Manufacturer|Form Factor|Locator|Memory Device|Serial Number|Voltage|Part Number"', function (error, stdout) {
          if (!error) {
            let devices = stdout.toString().split('Memory Device');
            devices.shift();
            devices.forEach(function (device) {
              let lines = device.split('\n');
              if (parseInt(util.getValue(lines, 'Size'), 10) > 0) {
                result.push({
                  size: parseInt(util.getValue(lines, 'Size'), 10)*1024*1024,
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
            devices.shift();
            devices.forEach(function (device) {
              let lines = device.split('\n');
              const bank = 'BANK ' + lines[0].trim();
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
      if (_windows) {
        const memoryTypes = 'Unknown|Other|DRAM|Synchronous DRAM|Cache DRAM|EDO|EDRAM|VRAM|SRAM|RAM|ROM|FLASH|EEPROM|FEPROM|EPROM|CDRAM|3DRAM|SDRAM|SGRAM|RDRAM|DDR|DDR2|DDR2 FB-DIMM|Reserved|DDR3|FBD2|DDR4|LPDDR|LPDDR2|LPDDR3|LPDDR4'.split('|');
        const FormFactors = 'Unknown|Other|SIP|DIP|ZIP|SOJ|Proprietary|SIMM|DIMM|TSOP|PGA|RIMM|SODIMM|SRIMM|SMD|SSMP|QFP|TQFP|SOIC|LCC|PLCC|BGA|FPBGA|LGA'.split('|');

        exec(util.getWmic() + ' memorychip get BankLabel, Capacity, ConfiguredClockSpeed, ConfiguredVoltage, MaxVoltage, MinVoltage, DataWidth, FormFactor, Manufacturer, MemoryType, PartNumber, SerialNumber, Speed, Tag /value', opts, function (error, stdout) {
          if (!error) {
            let devices = stdout.toString().split('BankL');
            devices.shift();
            devices.forEach(function (device) {
              let lines = device.split('\r\n');
              result.push({
                size: parseInt(util.getValue(lines, 'Capacity', '='), 10),
                bank: util.getValue(lines, 'abel', '='), // BankLabel
                type: memoryTypes[parseInt(util.getValue(lines, 'MemoryType', '='), 10)],
                clockSpeed: parseInt(util.getValue(lines, 'ConfiguredClockSpeed', '='), 10),
                formFactor: FormFactors[parseInt(util.getValue(lines, 'FormFactor', '='), 10)],
                manufacturer: util.getValue(lines, 'Manufacturer', '='),
                partNum: util.getValue(lines, 'PartNumber', '='),
                serialNum: util.getValue(lines, 'SerialNumber', '='),
                voltageConfigured: parseInt(util.getValue(lines, 'ConfiguredVoltage', '='), 10) / 1000.0,
                voltageMin: parseInt(util.getValue(lines, 'MinVoltage', '='), 10) / 1000.0,
                voltageMax: parseInt(util.getValue(lines, 'MaxVoltage', '='), 10) / 1000.0,
              });
            });
          }
          if (callback) { callback(result); }
          resolve(result);
        });
      }
    });
  });
}

exports.memLayout = memLayout;

