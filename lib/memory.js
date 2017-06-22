'use strict';
// ==================================================================================
// memory.js
// ----------------------------------------------------------------------------------
// Description:   System Information - library
//                for Node.js
// Copyright:     (c) 2014 - 2017
// Author:        Sebastian Hildebrandt
// ----------------------------------------------------------------------------------
// License:       MIT
// ==================================================================================
// 5. Memory
// ----------------------------------------------------------------------------------

const os = require('os');
const exec = require('child_process').exec;
const fs = require('fs');
const util = require('./util');

let _platform = os.type();

const _linux = (_platform === 'Linux');
const _darwin = (_platform === 'Darwin');
const _windows = (_platform === 'Windows_NT');
const NOT_SUPPORTED = 'not supported';

function getValue(lines, property, separator, trimmed) {
  separator = separator || ':';
  property = property.toLowerCase();
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].toLowerCase();
    if (trimmed) {
      line = line.trim();
    }
    if (line.toLowerCase().startsWith(property)) {
      const parts = lines[i].split(separator);
      if (parts.length >= 2) {
        parts.shift();
        return parts.join(':').trim();
      } else {
        return ''
      }
    }
  }
  return '';
}
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

  return new Promise((resolve, reject) => {
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
        exec("free -b", function (error, stdout) {
          if (!error) {
            let lines = stdout.toString().split('\n');

            let mem = lines[1].replace(/ +/g, " ").split(' ');
            result.total = parseInt(mem[1]);
            result.free = parseInt(mem[3]);

            if (lines.length === 4) {                   // free (since free von procps-ng 3.3.10)
              result.buffcache = parseInt(mem[5]);
              result.available = parseInt(mem[6]);
              mem = lines[2].replace(/ +/g, " ").split(' ');
            } else {                                    // free (older versions)
              result.buffcache = parseInt(mem[5]) + parseInt(mem[6]);
              result.available = result.free + result.buffcache;
              mem = lines[3].replace(/ +/g, " ").split(' ');
            }
            result.active = result.total - result.free - result.buffcache;

            result.swaptotal = parseInt(mem[1]);
            result.swapfree = parseInt(mem[3]);
            result.swapused = parseInt(mem[2]);

          }
          if (callback) { callback(result) }
          resolve(result);
        });
      }
      if (_darwin) {
        exec("vm_stat | grep 'Pages active'", function (error, stdout) {
          if (!error) {
            let lines = stdout.toString().split('\n');

            result.active = parseInt(lines[0].split(':')[1]) * 4096;
            result.buffcache = result.used - result.active;
            result.available = result.free + result.buffcache;
          }
          exec("sysctl -n vm.swapusage", function (error, stdout) {
            if (!error) {
              let lines = stdout.toString().split('\n');
              if (lines.length > 0) {
                let line = lines[0].replace(/,/g, ".").replace(/M/g, "");
                line = line.trim().split('  ');
                for (let i = 0; i < line.length; i++) {
                  if (line[i].toLowerCase().indexOf('total') !== -1) result.swaptotal = parseFloat(line[i].split('=')[1].trim()) * 1024 * 1024;
                  if (line[i].toLowerCase().indexOf('used') !== -1) result.swapused = parseFloat(line[i].split('=')[1].trim()) * 1024 * 1024;
                  if (line[i].toLowerCase().indexOf('free') !== -1) result.swapfree = parseFloat(line[i].split('=')[1].trim()) * 1024 * 1024;

                }
              }
            }
            if (callback) { callback(result) }
            resolve(result);
          });
        });
      }
      if (_windows) {
        let swaptotal = 0;
        let swapused = 0;
        exec("wmic pagefile get AllocatedBaseSize, CurrentUsage", function (error, stdout) {
          if (!error) {
            let lines = stdout.split('\r\n').filter(line => line.trim() !== '').filter((line, idx) => idx > 0);
            lines.forEach(function (line) {
              if (line !== '') {
                line = line.trim().split(/\s\s+/);
                swaptotal = swaptotal + parseInt(line[0]);
                swapused = swapused + parseInt(line[1]);
              }
            });
          }
          result.swaptotal = swaptotal * 1024 * 1024;
          result.swapused = swapused * 1024 * 1024;
          result.swapfree = result.swaptotal - result.swapused;

          if (callback) { callback(result) }
          resolve(result);
        });
      }
    });
  });
}

exports.mem = mem;

function memLayout(callback) {

  return new Promise((resolve, reject) => {
    process.nextTick(() => {

      let result = [];

      if (_linux) {
        exec("dmidecode -t memory | grep -iE 'Size:|Type|Speed|Manufacturer|Form Factor|Locator|Memory Device|Serial Number|Voltage'", function (error, stdout) {
          if (!error) {
            let devices = stdout.toString().split('Memory Device');
            devices.shift();
            devices.forEach(function (device) {
              let lines = device.split('\n');
              result.push({
                size: parseInt(getValue(lines, '	Size'))*1024*1024,
                bank: getValue(lines, '	Bank Locator'),
                type: getValue(lines, '	Type:'),
                clockSpeed: (getValue(lines, '	Configured Clock Speed:') ? parseInt(getValue(lines, '	Configured Clock Speed:')) : parseInt(getValue(lines, '	Speed:'))),
                formFactor: getValue(lines, '	Form Factor:'),
                partNum: '',
                serialNum: getValue(lines, '	Serial Number:'),
                voltageConfigured: parseFloat(getValue(lines, '	Configured Voltage:')),
                voltageMin: parseFloat(getValue(lines, '	Minimum Voltage:')),
                voltageMax: parseFloat(getValue(lines, '	Maximum Voltage:')),
              })
            });
          }
          if (callback) { callback(result) }
          resolve(result);
        });
      }

      if (_darwin) {
        exec("system_profiler SPMemoryDataType", function (error, stdout) {
          if (!error) {
            let devices = stdout.toString().split('        BANK ');
            devices.shift();
            devices.forEach(function (device) {
              let lines = device.split('\n');
              const size = parseInt(getValue(lines, '          Size'));
              if (size) {
                result.push({
                  size: size * 1024 * 1024 * 1024,
                  bank: '',
                  type: getValue(lines, '          Type:'),
                  clockSpeed: parseInt(getValue(lines, '          Speed:')),
                  formFactor: '',
                  partNum: getValue(lines, '          Part Number:'),
                  serialNum: getValue(lines, '          Serial Number:'),
                  voltageConfigured: -1,
                  voltageMin: -1,
                  voltageMax: -1,
                })
              }
            });
          }
          if (callback) { callback(result) }
          resolve(result);
        });
      }
      if (_windows) {
        const memoryTypes = 'Unknown|Other|DRAM|Synchronous DRAM|Cache DRAM|EDO|EDRAM|VRAM|SRAM|RAM|ROM|FLASH|EEPROM|FEPROM|EPROM|CDRAM|3DRAM|SDRAM|SGRAM|RDRAM|DDR|DDR2|DDR2 FB-DIMM|Reserved|DDR3|FBD2|DDR4|LPDDR|LPDDR2|LPDDR3|LPDDR4'.split('|')
        const FormFactors = 'Unknown|Other|SIP|DIP|ZIP|SOJ|Proprietary|SIMM|DIMM|TSOP|PGA|RIMM|SODIMM|SRIMM|SMD|SSMP|QFP|TQFP|SOIC|LCC|PLCC|BGA|FPBGA|LGA'.split('|');

        exec("wmic memorychip get BankLabel, Capacity, ConfiguredClockSpeed, ConfiguredVoltage, MaxVoltage, MinVoltage, DataWidth, FormFactor, Manufacturer, MemoryType, PartNumber, SerialNumber, Speed, Tag /value", function (error, stdout) {
          if (!error) {
            let devices = stdout.toString().split('BankL');
            devices.shift();
            devices.forEach(function (device) {
              let lines = device.split('\r\n');
              result.push({
                size: parseInt(getValue(lines, 'Capacity', '=')),
                bank: getValue(lines, 'abel', '='), // BankLabel
                type: memoryTypes[parseInt(getValue(lines, 'MemoryType', '='))],
                clockSpeed: parseInt(getValue(lines, 'ConfiguredClockSpeed', '=')),
                formFactor: FormFactors[parseInt(getValue(lines, 'FormFactor', '='))],
                partNum: getValue(lines, 'PartNumber', '='),
                serialNum: getValue(lines, 'SerialNumber', '='),
                voltageConfigured: parseInt(getValue(lines, 'ConfiguredVoltage', '=')) / 1000.0,
                voltageMin: parseInt(getValue(lines, 'MinVoltage', '=')) / 1000.0,
                voltageMax: parseInt(getValue(lines, 'MaxVoltage', '=')) / 1000.0,
              })
            });
          }

          if (callback) { callback(result) }
          resolve(result);
        });
      }
    });
  });
}

exports.memLayout = memLayout;

