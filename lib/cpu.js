'use strict';
// @ts-check
// ==================================================================================
// cpu.js
// ----------------------------------------------------------------------------------
// Description:   System Information - library
//                for Node.js
// Copyright:     (c) 2014 - 2020
// Author:        Sebastian Hildebrandt
// ----------------------------------------------------------------------------------
// License:       MIT
// ==================================================================================
// 4. CPU
// ----------------------------------------------------------------------------------

const os = require('os');
const exec = require('child_process').exec;
const fs = require('fs');
const util = require('./util');

let _platform = process.platform;

const _linux = (_platform === 'linux');
const _darwin = (_platform === 'darwin');
const _windows = (_platform === 'win32');
const _freebsd = (_platform === 'freebsd');
const _openbsd = (_platform === 'openbsd');
const _netbsd = (_platform === 'netbsd');
const _sunos = (_platform === 'sunos');

let _cpu_speed = '0.00';
let _current_cpu = {
  user: 0,
  nice: 0,
  system: 0,
  idle: 0,
  irq: 0,
  load: 0,
  tick: 0,
  ms: 0,
  currentload: 0,
  currentload_user: 0,
  currentload_system: 0,
  currentload_nice: 0,
  currentload_idle: 0,
  currentload_irq: 0,
  raw_currentload: 0,
  raw_currentload_user: 0,
  raw_currentload_system: 0,
  raw_currentload_nice: 0,
  raw_currentload_idle: 0,
  raw_currentload_irq: 0
};
let _cpus = [];
let _corecount = 0;

const AMDBaseFrequencies = {
  '8346': '1.8',
  '8347': '1.9',
  '8350': '2.0',
  '8354': '2.2',
  '8356|SE': '2.4',
  '8356': '2.3',
  '8360': '2.5',
  '2372': '2.1',
  '2373': '2.1',
  '2374': '2.2',
  '2376': '2.3',
  '2377': '2.3',
  '2378': '2.4',
  '2379': '2.4',
  '2380': '2.5',
  '2381': '2.5',
  '2382': '2.6',
  '2384': '2.7',
  '2386': '2.8',
  '2387': '2.8',
  '2389': '2.9',
  '2393': '3.1',
  '8374': '2.2',
  '8376': '2.3',
  '8378': '2.4',
  '8379': '2.4',
  '8380': '2.5',
  '8381': '2.5',
  '8382': '2.6',
  '8384': '2.7',
  '8386': '2.8',
  '8387': '2.8',
  '8389': '2.9',
  '8393': '3.1',
  '2419EE': '1.8',
  '2423HE': '2.0',
  '2425HE': '2.1',
  '2427': '2.2',
  '2431': '2.4',
  '2435': '2.6',
  '2439SE': '2.8',
  '8425HE': '2.1',
  '8431': '2.4',
  '8435': '2.6',
  '8439SE': '2.8',
  '4122': '2.2',
  '4130': '2.6',
  '4162EE': '1.7',
  '4164EE': '1.8',
  '4170HE': '2.1',
  '4174HE': '2.3',
  '4176HE': '2.4',
  '4180': '2.6',
  '4184': '2.8',
  '6124HE': '1.8',
  '6128HE': '2.0',
  '6132HE': '2.2',
  '6128': '2.0',
  '6134': '2.3',
  '6136': '2.4',
  '6140': '2.6',
  '6164HE': '1.7',
  '6166HE': '1.8',
  '6168': '1.9',
  '6172': '2.1',
  '6174': '2.2',
  '6176': '2.3',
  '6176SE': '2.3',
  '6180SE': '2.5',
  '3250': '2.5',
  '3260': '2.7',
  '3280': '2.4',
  '4226': '2.7',
  '4228': '2.8',
  '4230': '2.9',
  '4234': '3.1',
  '4238': '3.3',
  '4240': '3.4',
  '4256': '1.6',
  '4274': '2.5',
  '4276': '2.6',
  '4280': '2.8',
  '4284': '3.0',
  '6204': '3.3',
  '6212': '2.6',
  '6220': '3.0',
  '6234': '2.4',
  '6238': '2.6',
  '6262HE': '1.6',
  '6272': '2.1',
  '6274': '2.2',
  '6276': '2.3',
  '6278': '2.4',
  '6282SE': '2.6',
  '6284SE': '2.7',
  '6308': '3.5',
  '6320': '2.8',
  '6328': '3.2',
  '6338P': '2.3',
  '6344': '2.6',
  '6348': '2.8',
  '6366': '1.8',
  '6370P': '2.0',
  '6376': '2.3',
  '6378': '2.4',
  '6380': '2.5',
  '6386': '2.8',
  'FX|4100': '3.6',
  'FX|4120': '3.9',
  'FX|4130': '3.8',
  'FX|4150': '3.8',
  'FX|4170': '4.2',
  'FX|6100': '3.3',
  'FX|6120': '3.6',
  'FX|6130': '3.6',
  'FX|6200': '3.8',
  'FX|8100': '2.8',
  'FX|8120': '3.1',
  'FX|8140': '3.2',
  'FX|8150': '3.6',
  'FX|8170': '3.9',
  'FX|4300': '3.8',
  'FX|4320': '4.0',
  'FX|4350': '4.2',
  'FX|6300': '3.5',
  'FX|6350': '3.9',
  'FX|8300': '3.3',
  'FX|8310': '3.4',
  'FX|8320': '3.5',
  'FX|8350': '4.0',
  'FX|8370': '4.0',
  'FX|9370': '4.4',
  'FX|9590': '4.7',
  'FX|8320E': '3.2',
  'FX|8370E': '3.3',
  '1950X': '3.4',
  '1920X': '3.5',
  '1920': '3.2',
  '1900X': '3.8',
  '1800X': '3.6',
  '1700X': '3.4',
  'Pro 1700X': '3.5',
  '1700': '3.0',
  'Pro 1700': '3.0',
  '1600X': '3.6',
  '1600': '3.2',
  'Pro 1600': '3.2',
  '1500X': '3.5',
  'Pro 1500': '3.5',
  '1400': '3.2',
  '1300X': '3.5',
  'Pro 1300': '3.5',
  '1200': '3.1',
  'Pro 1200': '3.1',
  '2200U': '2.5',
  '2300U': '2.0',
  'Pro 2300U': '2.0',
  '2500U': '2.0',
  'Pro 2500U': '2.2',
  '2700U': '2.0',
  'Pro 2700U': '2.2',
  '2600H': '3.2',
  '2800H': '3.3',
  '7601': '2.2',
  '7551': '2.0',
  '7501': '2.0',
  '74501': '2.3',
  '7401': '2.0',
  '7351': '2.4',
  '7301': '2.2',
  '7281': '2.1',
  '7251': '2.1',
  '7551P': '2.0',
  '7401P': '2.0',
  '7351P': '2.4',
  '2300X': '3.5',
  '2500X': '3.6',
  '2600': '3.4',
  '2600E': '3.1',
  '2600X': '3.6',
  '2700': '3.2',
  '2700E': '2.8',
  '2700X': '3.7',
  'Pro 2700X': '3.6',
  '2920': '3.5',
  '2950': '3.5',
  '2970WX': '3.0',
  '2990WX': '3.0',
  '3200U': '2.6',
  '3300U': '2.1',
  '3500U': '2.1',
  '3550H': '2.1',
  '3580U': '2.1',
  '3700U': '2.3',
  '3750H': '2.3',
  '3780U': '2.3',
  '3500X': '3.6',
  '3600': '3.6',
  'Pro 3600': '3.6',
  '3600X': '3.8',
  'Pro 3700': '3.6',
  '3700X': '3.6',
  '3800X': '3.9',
  '3900': '3.1',
  'Pro 3900': '3.1',
  '3900X': '3.8',
  '3950X': '3.5',
  '3960X': '3.8',
  '3970X': '3.7',
  '7232P': '3.1',
  '7302P': '3.0',
  '7402P': '2.8',
  '7502P': '2.5',
  '7702P': '2.0',
  '7252': '3.1',
  '7262': '3.2',
  '7272': '2.9',
  '7282': '2.8',
  '7302': '3.0',
  '7352': '2.3',
  '7402': '2.8',
  '7452': '2.35',
  '7502': '2.5',
  '7542': '2.9',
  '7552': '2.2',
  '7642': '2.3',
  '7702': '2.0',
  '7742': '2.25',
  '7H12': '2.6'
};

const socketTypes = {
  1: 'Other',
  2: 'Unknown',
  3: 'Daughter Board',
  4: 'ZIF Socket',
  5: 'Replacement/Piggy Back',
  6: 'None',
  7: 'LIF Socket',
  8: 'Slot 1',
  9: 'Slot 2',
  10: '370 Pin Socket',
  11: 'Slot A',
  12: 'Slot M',
  13: '423',
  14: 'A (Socket 462)',
  15: '478',
  16: '754',
  17: '940',
  18: '939',
  19: 'mPGA604',
  20: 'LGA771',
  21: 'LGA775',
  22: 'S1',
  23: 'AM2',
  24: 'F (1207)',
  25: 'LGA1366',
  26: 'G34',
  27: 'AM3',
  28: 'C32',
  29: 'LGA1156',
  30: 'LGA1567',
  31: 'PGA988A',
  32: 'BGA1288',
  33: 'rPGA988B',
  34: 'BGA1023',
  35: 'BGA1224',
  36: 'LGA1155',
  37: 'LGA1356',
  38: 'LGA2011',
  39: 'FS1',
  40: 'FS2',
  41: 'FM1',
  42: 'FM2',
  43: 'LGA2011-3',
  44: 'LGA1356-3',
  45: 'LGA1150',
  46: 'BGA1168',
  47: 'BGA1234',
  48: 'BGA1364',
  49: 'AM4',
  50: 'LGA1151',
  51: 'BGA1356',
  52: 'BGA1440',
  53: 'BGA1515',
  54: 'LGA3647-1',
  55: 'SP3',
  56: 'SP3r2',
  57: 'LGA2066',
  58: 'BGA1392',
  59: 'BGA1510',
  60: 'BGA1528'
};

function cpuBrandManufacturer(res) {
  res.brand = res.brand.replace(/\(R\)+/g, '®').replace(/\s+/g, ' ').trim();
  res.brand = res.brand.replace(/\(TM\)+/g, '™').replace(/\s+/g, ' ').trim();
  res.brand = res.brand.replace(/\(C\)+/g, '©').replace(/\s+/g, ' ').trim();
  res.brand = res.brand.replace(/CPU+/g, '').replace(/\s+/g, ' ').trim();
  res.manufacturer = res.brand.split(' ')[0];

  let parts = res.brand.split(' ');
  parts.shift();
  res.brand = parts.join(' ');
  return res;
}

function getAMDSpeed(brand) {
  let result = '0.00';
  for (let key in AMDBaseFrequencies) {
    if ({}.hasOwnProperty.call(AMDBaseFrequencies, key)) {
      let parts = key.split('|');
      let found = 0;
      parts.forEach(item => {
        if (brand.indexOf(item) > -1) {
          found++;
        }
      });
      if (found === parts.length) {
        result = AMDBaseFrequencies[key];
      }
    }
  }
  return result;
}

// --------------------------
// CPU - brand, speed

function getCpu() {

  return new Promise((resolve) => {
    process.nextTick(() => {
      const UNKNOWN = 'unknown';
      let result = {
        manufacturer: UNKNOWN,
        brand: UNKNOWN,
        vendor: '',
        family: '',
        model: '',
        stepping: '',
        revision: '',
        voltage: '',
        speed: '0.00',
        speedmin: '',
        speedmax: '',
        governor: '',
        cores: util.cores(),
        physicalCores: util.cores(),
        processors: 1,
        socket: '',
        cache: {}
      };
      if (_darwin) {
        exec('sysctl machdep.cpu hw.cpufrequency_max hw.cpufrequency_min hw.packages hw.physicalcpu_max hw.ncpu', function (error, stdout) {
          // if (!error) {
          let lines = stdout.toString().split('\n');
          const modelline = util.getValue(lines, 'machdep.cpu.brand_string');
          result.brand = modelline.split('@')[0].trim();
          result.speed = modelline.split('@')[1].trim();
          result.speed = parseFloat(result.speed.replace(/GHz+/g, '')).toFixed(2);
          _cpu_speed = result.speed;
          result = cpuBrandManufacturer(result);
          result.speedmin = (util.getValue(lines, 'hw.cpufrequency_min') / 1000000000.0).toFixed(2);
          result.speedmax = (util.getValue(lines, 'hw.cpufrequency_max') / 1000000000.0).toFixed(2);
          result.vendor = util.getValue(lines, 'machdep.cpu.vendor');
          result.family = util.getValue(lines, 'machdep.cpu.family');
          result.model = util.getValue(lines, 'machdep.cpu.model');
          result.stepping = util.getValue(lines, 'machdep.cpu.stepping');
          const countProcessors = util.getValue(lines, 'hw.packages');
          const countCores = util.getValue(lines, 'hw.physicalcpu_max');
          const countThreads = util.getValue(lines, 'hw.ncpu');
          if (countProcessors) {
            result.processors = parseInt(countProcessors) || 1;
          }
          if (countCores && countThreads) {
            result.cores = parseInt(countThreads) || util.cores();
            result.physicalCores = parseInt(countCores) || util.cores();
          }
          // }
          cpuCache().then(res => {
            result.cache = res;
            resolve(result);
          });
        });
      }
      if (_linux) {
        let modelline = '';
        let lines = [];
        if (os.cpus()[0] && os.cpus()[0].model) modelline = os.cpus()[0].model;
        exec('export LC_ALL=C; lscpu; echo -n "Governor: "; cat /sys/devices/system/cpu/cpu0/cpufreq/scaling_governor 2>/dev/null; echo; unset LC_ALL', function (error, stdout) {
          if (!error) {
            lines = stdout.toString().split('\n');
          }
          modelline = util.getValue(lines, 'model name') || modelline;
          result.brand = modelline.split('@')[0].trim();
          result.speed = modelline.split('@')[1] ? parseFloat(modelline.split('@')[1].trim()).toFixed(2) : '0.00';
          if (result.speed === '0.00' && (result.brand.indexOf('AMD') > -1 || result.brand.toLowerCase().indexOf('ryzen') > -1)) {
            result.speed = getAMDSpeed(result.brand);
          }
          if (result.speed === '0.00') {
            let current = getCpuCurrentSpeedSync();
            if (current.avg !== 0) result.speed = current.avg.toFixed(2);
          }
          _cpu_speed = result.speed;
          result.speedmin = Math.round(parseFloat(util.getValue(lines, 'cpu min mhz').replace(/,/g, '.')) / 10.0) / 100;
          result.speedmin = result.speedmin ? parseFloat(result.speedmin).toFixed(2) : '';
          result.speedmax = Math.round(parseFloat(util.getValue(lines, 'cpu max mhz').replace(/,/g, '.')) / 10.0) / 100;
          result.speedmax = result.speedmax ? parseFloat(result.speedmax).toFixed(2) : '';

          result = cpuBrandManufacturer(result);
          result.vendor = util.getValue(lines, 'vendor id');
          // if (!result.vendor) { result.vendor = util.getValue(lines, 'anbieterkennung'); }

          result.family = util.getValue(lines, 'cpu family');
          // if (!result.family) { result.family = util.getValue(lines, 'prozessorfamilie'); }
          result.model = util.getValue(lines, 'model:');
          // if (!result.model) { result.model = util.getValue(lines, 'modell:'); }
          result.stepping = util.getValue(lines, 'stepping');
          result.revision = util.getValue(lines, 'cpu revision');
          result.cache.l1d = util.getValue(lines, 'l1d cache');
          if (result.cache.l1d) { result.cache.l1d = parseInt(result.cache.l1d) * (result.cache.l1d.indexOf('K') !== -1 ? 1024 : 1); }
          result.cache.l1i = util.getValue(lines, 'l1i cache');
          if (result.cache.l1i) { result.cache.l1i = parseInt(result.cache.l1i) * (result.cache.l1i.indexOf('K') !== -1 ? 1024 : 1); }
          result.cache.l2 = util.getValue(lines, 'l2 cache');
          if (result.cache.l2) { result.cache.l2 = parseInt(result.cache.l2) * (result.cache.l2.indexOf('K') !== -1 ? 1024 : 1); }
          result.cache.l3 = util.getValue(lines, 'l3 cache');
          if (result.cache.l3) { result.cache.l3 = parseInt(result.cache.l3) * (result.cache.l3.indexOf('K') !== -1 ? 1024 : 1); }

          const threadsPerCore = util.getValue(lines, 'thread(s) per core') || '1';
          // const coresPerSocketInt = parseInt(util.getValue(lines, 'cores(s) per socket') || '1', 10);
          const processors = util.getValue(lines, 'socket(s)') || '1';
          let threadsPerCoreInt = parseInt(threadsPerCore, 10);
          let processorsInt = parseInt(processors, 10);
          result.physicalCores = result.cores / threadsPerCoreInt;
          result.processors = processorsInt;
          result.governor = util.getValue(lines, 'governor') || '';

          // Test Raspberry
          if (result.vendor === 'ARM') {
            const linesRpi = fs.readFileSync('/proc/cpuinfo').toString().split('\n');
            const rPIRevision = util.decodePiCpuinfo(linesRpi);
            if (rPIRevision.model.toLowerCase().indexOf('raspberry') >= 0) {
              result.family = result.manufacturer;
              result.manufacturer = rPIRevision.manufacturer;
              result.brand = rPIRevision.processor;
              result.revision = rPIRevision.revisionCode;
              result.socket = 'SOC';
            }
          }

          // socket type
          let lines2 = [];
          exec('export LC_ALL=C; dmidecode –t 4 2>/dev/null | grep "Upgrade: Socket"; unset LC_ALL', function (error2, stdout2) {
            lines2 = stdout2.toString().split('\n');
            if (lines2 && lines2.length) {
              result.socket = util.getValue(lines2, 'Upgrade').replace('Socket', '').trim() || result.socket;
            }
            resolve(result);
          });
        });
      }
      if (_freebsd || _openbsd || _netbsd) {
        let modelline = '';
        let lines = [];
        if (os.cpus()[0] && os.cpus()[0].model) modelline = os.cpus()[0].model;
        exec('export LC_ALL=C; dmidecode -t 4; dmidecode -t 7 unset LC_ALL', function (error, stdout) {
          let cache = [];
          if (!error) {
            const data = stdout.toString().split('# dmidecode');
            const processor = data.length > 1 ? data[1] : '';
            cache = data.length > 2 ? data[2].split('Cache Information') : [];

            lines = processor.split('\n');
          }
          result.brand = modelline.split('@')[0].trim();
          result.speed = modelline.split('@')[1] ? parseFloat(modelline.split('@')[1].trim()).toFixed(2) : '0.00';
          if (result.speed === '0.00' && (result.brand.indexOf('AMD') > -1 || result.brand.toLowerCase().indexOf('ryzen') > -1)) {
            result.speed = getAMDSpeed(result.brand);
          }
          if (result.speed === '0.00') {
            let current = getCpuCurrentSpeedSync();
            if (current.avg !== 0) result.speed = current.avg.toFixed(2);
          }
          _cpu_speed = result.speed;
          result.speedmin = '';
          result.speedmax = Math.round(parseFloat(util.getValue(lines, 'max speed').replace(/Mhz/g, '')) / 10.0) / 100;
          result.speedmax = result.speedmax ? parseFloat(result.speedmax).toFixed(2) : '';

          result = cpuBrandManufacturer(result);
          result.vendor = util.getValue(lines, 'manufacturer');
          let sig = util.getValue(lines, 'signature');
          sig = sig.split(',');
          for (var i = 0; i < sig.length; i++) {
            sig[i] = sig[i].trim();
          }
          result.family = util.getValue(sig, 'Family', ' ', true);
          result.model = util.getValue(sig, 'Model', ' ', true);
          result.stepping = util.getValue(sig, 'Stepping', ' ', true);
          result.revision = '';
          const voltage = parseFloat(util.getValue(lines, 'voltage'));
          result.voltage = isNaN(voltage) ? '' : voltage.toFixed(2);
          for (let i = 0; i < cache.length; i++) {
            lines = cache[i].split('\n');
            let cacheType = util.getValue(lines, 'Socket Designation').toLowerCase().replace(' ', '-').split('-');
            cacheType = cacheType.length ? cacheType[0] : '';
            const sizeParts = util.getValue(lines, 'Installed Size').split(' ');
            let size = parseInt(sizeParts[0], 10);
            const unit = sizeParts.length > 1 ? sizeParts[1] : 'kb';
            size = size * (unit === 'kb' ? 1024 : (unit === 'mb' ? 1024 * 1024 : (unit === 'gb' ? 1024 * 1024 * 1024 : 1)));
            if (cacheType) {
              if (cacheType === 'l1') {
                result.cache[cacheType + 'd'] = size / 2;
                result.cache[cacheType + 'i'] = size / 2;
              } else {
                result.cache[cacheType] = size;
              }
            }
          }
          // socket type
          result.socket = util.getValue(lines, 'Upgrade').replace('Socket', '').trim();
          // # threads / # cores
          const threadCount = util.getValue(lines, 'thread count').trim();
          const coreCount = util.getValue(lines, 'core count').trim();
          if (coreCount && threadCount) {
            result.cores = threadCount;
            result.physicalCores = coreCount;
          }
          resolve(result);
        });
      }
      if (_sunos) {
        resolve(result);
      }
      if (_windows) {
        try {
          util.wmic('cpu get /value').then((stdout, error) => {
            if (!error) {
              let lines = stdout.split('\r\n');
              let name = util.getValue(lines, 'name', '=') || '';
              if (name.indexOf('@') >= 0) {
                result.brand = name.split('@')[0].trim();
                result.speed = name.split('@')[1] ? parseFloat(name.split('@')[1].trim()).toFixed(2) : '0.00';
                _cpu_speed = result.speed;
              } else {
                result.brand = name.trim();
                result.speed = '0.00';
              }
              result = cpuBrandManufacturer(result);
              result.revision = util.getValue(lines, 'revision', '=');
              result.cache.l1d = 0;
              result.cache.l1i = 0;
              result.cache.l2 = util.getValue(lines, 'l2cachesize', '=');
              result.cache.l3 = util.getValue(lines, 'l3cachesize', '=');
              if (result.cache.l2) { result.cache.l2 = parseInt(result.cache.l2, 10) * 1024; }
              if (result.cache.l3) { result.cache.l3 = parseInt(result.cache.l3, 10) * 1024; }
              result.vendor = util.getValue(lines, 'manufacturer', '=');
              result.speedmax = Math.round(parseFloat(util.getValue(lines, 'maxclockspeed', '=').replace(/,/g, '.')) / 10.0) / 100;
              result.speedmax = result.speedmax ? parseFloat(result.speedmax).toFixed(2) : '';
              if (result.speed === '0.00' && (result.brand.indexOf('AMD') > -1 || result.brand.toLowerCase().indexOf('ryzen') > -1)) {
                result.speed = getAMDSpeed(result.brand);
              }
              if (result.speed === '0.00') {
                result.speed = result.speedmax;
              }

              let description = util.getValue(lines, 'description', '=').split(' ');
              for (let i = 0; i < description.length; i++) {
                if (description[i].toLowerCase().startsWith('family') && (i + 1) < description.length && description[i + 1]) {
                  result.family = description[i + 1];
                }
                if (description[i].toLowerCase().startsWith('model') && (i + 1) < description.length && description[i + 1]) {
                  result.model = description[i + 1];
                }
                if (description[i].toLowerCase().startsWith('stepping') && (i + 1) < description.length && description[i + 1]) {
                  result.stepping = description[i + 1];
                }
              }
              // socket type
              const socketId = util.getValue(lines, 'UpgradeMethod', '=');
              if (socketTypes[socketId]) {
                result.socket = socketTypes[socketId];
              }
              // # threads / # cores
              const countProcessors = util.countLines(lines, 'Caption');
              const countThreads = util.getValue(lines, 'NumberOfLogicalProcessors', '=');
              const countCores = util.getValue(lines, 'NumberOfCores', '=');
              if (countProcessors) {
                result.processors = parseInt(countProcessors) || 1;
              }
              if (countCores && countThreads) {
                result.cores = parseInt(countThreads) || util.cores();
                result.physicalCores = parseInt(countCores) || util.cores();
              }
              if (countProcessors > 1) {
                result.cores = result.cores * countProcessors;
                result.physicalCores = result.physicalCores * countProcessors;
              }
            }
            util.wmic('path Win32_CacheMemory get CacheType,InstalledSize,Purpose').then((stdout, error) => {
              if (!error) {
                let lines = stdout.split('\r\n').filter(line => line.trim() !== '').filter((line, idx) => idx > 0);
                lines.forEach(function (line) {
                  if (line !== '') {
                    line = line.trim().split(/\s\s+/);
                    // L1 Instructions
                    if (line[2] === 'L1 Cache' && line[0] === '3') {
                      result.cache.l1i = parseInt(line[1], 10);
                    }
                    // L1 Data
                    if (line[2] === 'L1 Cache' && line[0] === '4') {
                      result.cache.l1d = parseInt(line[1], 10);
                    }
                  }
                });
              }
              resolve(result);
            });
          });
        } catch (e) {
          resolve(result);
        }
      }
    });
  });
}

// --------------------------
// CPU - Processor Data

function cpu(callback) {

  return new Promise((resolve) => {
    process.nextTick(() => {
      getCpu().then(result => {
        if (callback) { callback(result); }
        resolve(result);
      });
    });
  });
}

exports.cpu = cpu;

// --------------------------
// CPU - current speed - in GHz

function getCpuCurrentSpeedSync() {

  let cpus = os.cpus();
  let minFreq = 999999999;
  let maxFreq = 0;
  let avgFreq = 0;
  let cores = [];

  if (cpus && cpus.length) {
    for (let i in cpus) {
      if ({}.hasOwnProperty.call(cpus, i)) {
        avgFreq = avgFreq + cpus[i].speed;
        if (cpus[i].speed > maxFreq) maxFreq = cpus[i].speed;
        if (cpus[i].speed < minFreq) minFreq = cpus[i].speed;
      }
      cores.push(parseFloat(((cpus[i].speed + 1) / 1000).toFixed(2)));
    }
    avgFreq = avgFreq / cpus.length;
    return {
      min: parseFloat(((minFreq + 1) / 1000).toFixed(2)),
      max: parseFloat(((maxFreq + 1) / 1000).toFixed(2)),
      avg: parseFloat(((avgFreq + 1) / 1000).toFixed(2)),
      cores: cores
    };
  } else {
    return {
      min: 0,
      max: 0,
      avg: 0,
      cores: cores
    };
  }
}

function cpuCurrentspeed(callback) {

  return new Promise((resolve) => {
    process.nextTick(() => {
      let result = getCpuCurrentSpeedSync();
      if (result.avg === 0 && _cpu_speed !== '0.00') {
        const currCpuSpeed = parseFloat(_cpu_speed);
        result = {
          min: currCpuSpeed,
          max: currCpuSpeed,
          avg: currCpuSpeed,
          cores: []
        };
      }
      if (callback) { callback(result); }
      resolve(result);
    });
  });
}

exports.cpuCurrentspeed = cpuCurrentspeed;

// --------------------------
// CPU - temperature
// if sensors are installed

function cpuTemperature(callback) {

  return new Promise((resolve) => {
    process.nextTick(() => {
      let result = {
        main: -1.0,
        cores: [],
        max: -1.0
      };
      if (_linux) {
        const cmd = 'cat /sys/class/hwmon/hwmon1/temp*_la*;echo "---";cat /sys/class/hwmon/hwmon1/temp*_i*';
        try {
          exec(cmd, function (error, stdout) {
            if (!error) {
              let parts = stdout.toString().split('---');
              let labels = parts[0].split('\n');
              let temps = parts[1].split('\n');
              temps.shift();
              for (let i = 0; i < temps.length; i++) {
                if (temps[i] && (labels[i] === undefined || (labels[i] && labels[i].toLowerCase().startsWith('core')))) {
                  result.cores.push(Math.round(parseInt(temps[i], 10) / 100) / 10);
                } else if (temps[i] && labels[i] && result.main === -1) {
                  result.main = Math.round(parseInt(temps[i], 10) / 100) / 10;
                }
              }
              if (result.cores.length > 0) {
                if (result.main === -1) {
                  result.main = Math.round(result.cores.reduce((a, b) => a + b, 0) / result.cores.length);
                }
                let maxtmp = Math.max.apply(Math, result.cores);
                result.max = (maxtmp > result.main) ? maxtmp : result.main;
              }
              if (result.main !== -1) {
                if (result.max === -1) {
                  result.max = result.main;
                }
                if (callback) { callback(result); }
                resolve(result);
                return;
              }
            }
            exec('sensors', function (error, stdout) {
              if (!error) {
                let lines = stdout.toString().split('\n');
                let tdieTemp = -1;
                lines.forEach(function (line) {
                  let regex = /[+-]([^°]*)/g;
                  let temps = line.match(regex);
                  let firstPart = line.split(':')[0].toUpperCase();
                  if (firstPart.indexOf('PHYSICAL') !== -1 || firstPart.indexOf('PACKAGE') !== -1) {
                    result.main = parseFloat(temps);
                  }
                  if (firstPart.indexOf('CORE ') !== -1) {
                    result.cores.push(parseFloat(temps));
                  }
                  if (firstPart.indexOf('TDIE') !== -1 && tdieTemp === -1) {
                    tdieTemp = parseFloat(temps);
                  }
                });
                if (result.cores.length > 0) {
                  if (result.main === -1) {
                    result.main = Math.round(result.cores.reduce((a, b) => a + b, 0) / result.cores.length);
                  }
                  let maxtmp = Math.max.apply(Math, result.cores);
                  result.max = (maxtmp > result.main) ? maxtmp : result.main;
                } else {
                  if (result.main === -1 && tdieTemp !== -1) {
                    result.main = tdieTemp;
                    result.max = tdieTemp;
                  }
                }
                if (result.main !== -1.0 || result.max !== -1.0) {
                  if (callback) { callback(result); }
                  resolve(result);
                  return;
                }
              }
              fs.stat('/sys/class/thermal/thermal_zone0/temp', function (err) {
                if (err === null) {
                  fs.readFile('/sys/class/thermal/thermal_zone0/temp', function (error, stdout) {
                    if (!error) {
                      let lines = stdout.toString().split('\n');
                      if (lines.length > 0) {
                        result.main = parseFloat(lines[0]) / 1000.0;
                        result.max = result.main;
                      }
                    }
                    if (callback) { callback(result); }
                    resolve(result);
                  });
                } else {
                  exec('/opt/vc/bin/vcgencmd measure_temp', function (error, stdout) {
                    if (!error) {
                      let lines = stdout.toString().split('\n');
                      if (lines.length > 0 && lines[0].indexOf('=')) {
                        result.main = parseFloat(lines[0].split('=')[1]);
                        result.max = result.main;
                      }
                    }
                    if (callback) { callback(result); }
                    resolve(result);
                  });
                }
              });
            });
          });
        } catch (er) {
          if (callback) { callback(result); }
          resolve(result);
        }
      }
      if (_freebsd || _openbsd || _netbsd) {
        exec('sysctl dev.cpu | grep temp', function (error, stdout) {
          if (!error) {
            let lines = stdout.toString().split('\n');
            let sum = 0;
            lines.forEach(function (line) {
              const parts = line.split(':');
              if (parts.length > 1) {
                const temp = parseFloat(parts[1].replace(',', '.'));
                if (temp > result.max) result.max = temp;
                sum = sum + temp;
                result.cores.push(temp);
              }
            });
            if (result.cores.length) {
              result.main = Math.round(sum / result.cores.length * 100) / 100;
            }
          }
          if (callback) { callback(result); }
          resolve(result);
        });
      }
      if (_darwin) {
        let osxTemp = null;
        try {
          osxTemp = require('osx-temperature-sensor');
        } catch (er) {
          osxTemp = null;
        }
        if (osxTemp) {
          result = osxTemp.cpuTemperature();
        }

        if (callback) { callback(result); }
        resolve(result);
      }
      if (_sunos) {
        if (callback) { callback(result); }
        resolve(result);
      }
      if (_windows) {
        try {
          util.wmic('/namespace:\\\\root\\wmi PATH MSAcpi_ThermalZoneTemperature get CurrentTemperature').then((stdout, error) => {
            if (!error) {
              let sum = 0;
              let lines = stdout.split('\r\n').filter(line => line.trim() !== '').filter((line, idx) => idx > 0);
              lines.forEach(function (line) {
                let value = (parseInt(line, 10) - 2732) / 10;
                sum = sum + value;
                if (value > result.max) result.max = value;
                result.cores.push(value);
              });
              if (result.cores.length) {
                result.main = sum / result.cores.length;
              }
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

exports.cpuTemperature = cpuTemperature;

// --------------------------
// CPU Flags

function cpuFlags(callback) {

  return new Promise((resolve) => {
    process.nextTick(() => {
      let result = '';
      if (_windows) {
        try {
          exec('reg query "HKEY_LOCAL_MACHINE\\HARDWARE\\DESCRIPTION\\System\\CentralProcessor\\0" /v FeatureSet', util.execOptsWin, function (error, stdout) {
            if (!error) {
              let flag_hex = stdout.split('0x').pop().trim();
              let flag_bin_unpadded = parseInt(flag_hex, 16).toString(2);
              let flag_bin = '0'.repeat(32 - flag_bin_unpadded.length) + flag_bin_unpadded;
              // empty flags are the reserved fields in the CPUID feature bit list
              // as found on wikipedia:
              // https://en.wikipedia.org/wiki/CPUID
              let all_flags = [
                'fpu', 'vme', 'de', 'pse', 'tsc', 'msr', 'pae', 'mce', 'cx8', 'apic',
                '', 'sep', 'mtrr', 'pge', 'mca', 'cmov', 'pat', 'pse-36', 'psn', 'clfsh',
                '', 'ds', 'acpi', 'mmx', 'fxsr', 'sse', 'sse2', 'ss', 'htt', 'tm', 'ia64', 'pbe'
              ];
              for (let f = 0; f < all_flags.length; f++) {
                if (flag_bin[f] === '1' && all_flags[f] !== '') {
                  result += ' ' + all_flags[f];
                }
              }
              result = result.trim();
            }
            if (callback) { callback(result); }
            resolve(result);
          });
        } catch (e) {
          if (callback) { callback(result); }
          resolve(result);
        }
      }
      if (_linux) {
        try {

          exec('export LC_ALL=C; lscpu; unset LC_ALL', function (error, stdout) {
            if (!error) {
              let lines = stdout.toString().split('\n');
              lines.forEach(function (line) {
                if (line.split(':')[0].toUpperCase().indexOf('FLAGS') !== -1) {
                  result = line.split(':')[1].trim().toLowerCase();
                }
              });
            }
            if (!result) {
              fs.readFile('/proc/cpuinfo', function (error, stdout) {
                if (!error) {
                  let lines = stdout.toString().split('\n');
                  result = util.getValue(lines, 'features', ':', true).toLowerCase();
                }
                if (callback) { callback(result); }
                resolve(result);
              });
            } else {
              if (callback) { callback(result); }
              resolve(result);
            }
          });
        } catch (e) {
          if (callback) { callback(result); }
          resolve(result);
        }
      }
      if (_freebsd || _openbsd || _netbsd) {
        exec('export LC_ALL=C; dmidecode -t 4 2>/dev/null; unset LC_ALL', function (error, stdout) {
          let flags = [];
          if (!error) {
            let parts = stdout.toString().split('\tFlags:');
            const lines = parts.length > 1 ? parts[1].split('\tVersion:')[0].split['\n'] : [];
            lines.forEach(function (line) {
              let flag = (line.indexOf('(') ? line.split('(')[0].toLowerCase() : '').trim().replace(/\t/g, '');
              if (flag) {
                flags.push(flag);
              }
            });
          }
          result = flags.join(' ').trim();
          if (callback) { callback(result); }
          resolve(result);
        });
      }
      if (_darwin) {
        exec('sysctl machdep.cpu.features', function (error, stdout) {
          if (!error) {
            let lines = stdout.toString().split('\n');
            if (lines.length > 0 && lines[0].indexOf('machdep.cpu.features:') !== -1) {
              result = lines[0].split(':')[1].trim().toLowerCase();
            }
          }
          if (callback) { callback(result); }
          resolve(result);
        });
      }
      if (_sunos) {
        if (callback) { callback(result); }
        resolve(result);
      }
    });
  });
}

exports.cpuFlags = cpuFlags;

// --------------------------
// CPU Cache

function cpuCache(callback) {

  return new Promise((resolve) => {
    process.nextTick(() => {

      let result = {
        l1d: -1,
        l1i: -1,
        l2: -1,
        l3: -1,
      };
      if (_linux) {
        try {
          exec('export LC_ALL=C; lscpu; unset LC_ALL', function (error, stdout) {
            if (!error) {
              let lines = stdout.toString().split('\n');
              lines.forEach(function (line) {
                let parts = line.split(':');
                if (parts[0].toUpperCase().indexOf('L1D CACHE') !== -1) {
                  result.l1d = parseInt(parts[1].trim()) * (parts[1].indexOf('K') !== -1 ? 1024 : 1);
                }
                if (parts[0].toUpperCase().indexOf('L1I CACHE') !== -1) {
                  result.l1i = parseInt(parts[1].trim()) * (parts[1].indexOf('K') !== -1 ? 1024 : 1);
                }
                if (parts[0].toUpperCase().indexOf('L2 CACHE') !== -1) {
                  result.l2 = parseInt(parts[1].trim()) * (parts[1].indexOf('K') !== -1 ? 1024 : 1);
                }
                if (parts[0].toUpperCase().indexOf('L3 CACHE') !== -1) {
                  result.l3 = parseInt(parts[1].trim()) * (parts[1].indexOf('K') !== -1 ? 1024 : 1);
                }
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
      if (_freebsd || _openbsd || _netbsd) {
        exec('export LC_ALL=C; dmidecode -t 7 2>/dev/null; unset LC_ALL', function (error, stdout) {
          let cache = [];
          if (!error) {
            const data = stdout.toString();
            cache = data.split('Cache Information');
            cache.shift();
          }
          for (let i = 0; i < cache.length; i++) {
            const lines = cache[i].split('\n');
            let cacheType = util.getValue(lines, 'Socket Designation').toLowerCase().replace(' ', '-').split('-');
            cacheType = cacheType.length ? cacheType[0] : '';
            const sizeParts = util.getValue(lines, 'Installed Size').split(' ');
            let size = parseInt(sizeParts[0], 10);
            const unit = sizeParts.length > 1 ? sizeParts[1] : 'kb';
            size = size * (unit === 'kb' ? 1024 : (unit === 'mb' ? 1024 * 1024 : (unit === 'gb' ? 1024 * 1024 * 1024 : 1)));
            if (cacheType) {
              if (cacheType === 'l1') {
                result.cache[cacheType + 'd'] = size / 2;
                result.cache[cacheType + 'i'] = size / 2;
              } else {
                result.cache[cacheType] = size;
              }
            }
          }
          if (callback) { callback(result); }
          resolve(result);
        });
      }
      if (_darwin) {
        exec('sysctl hw.l1icachesize hw.l1dcachesize hw.l2cachesize hw.l3cachesize', function (error, stdout) {
          if (!error) {
            let lines = stdout.toString().split('\n');
            lines.forEach(function (line) {
              let parts = line.split(':');
              if (parts[0].toLowerCase().indexOf('hw.l1icachesize') !== -1) {
                result.l1d = parseInt(parts[1].trim()) * (parts[1].indexOf('K') !== -1 ? 1024 : 1);
              }
              if (parts[0].toLowerCase().indexOf('hw.l1dcachesize') !== -1) {
                result.l1i = parseInt(parts[1].trim()) * (parts[1].indexOf('K') !== -1 ? 1024 : 1);
              }
              if (parts[0].toLowerCase().indexOf('hw.l2cachesize') !== -1) {
                result.l2 = parseInt(parts[1].trim()) * (parts[1].indexOf('K') !== -1 ? 1024 : 1);
              }
              if (parts[0].toLowerCase().indexOf('hw.l3cachesize') !== -1) {
                result.l3 = parseInt(parts[1].trim()) * (parts[1].indexOf('K') !== -1 ? 1024 : 1);
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
        try {
          util.wmic('cpu get l2cachesize, l3cachesize /value').then((stdout, error) => {
            if (!error) {
              let lines = stdout.split('\r\n');
              result.l1d = 0;
              result.l1i = 0;
              result.l2 = util.getValue(lines, 'l2cachesize', '=');
              result.l3 = util.getValue(lines, 'l3cachesize', '=');
              if (result.l2) { result.l2 = parseInt(result.l2, 10) * 1024; }
              if (result.l3) { result.l3 = parseInt(result.l3, 10) * 1024; }
            }
            util.wmic('path Win32_CacheMemory get CacheType,InstalledSize,Purpose').then((stdout, error) => {
              if (!error) {
                let lines = stdout.split('\r\n').filter(line => line.trim() !== '').filter((line, idx) => idx > 0);
                lines.forEach(function (line) {
                  if (line !== '') {
                    line = line.trim().split(/\s\s+/);
                    // L1 Instructions
                    if (line[2] === 'L1 Cache' && line[0] === '3') {
                      result.l1i = parseInt(line[1], 10);
                    }
                    // L1 Data
                    if (line[2] === 'L1 Cache' && line[0] === '4') {
                      result.l1d = parseInt(line[1], 10);
                    }
                  }
                });
              }
              if (callback) { callback(result); }
              resolve(result);
            });
          });
        } catch (e) {
          if (callback) { callback(result); }
          resolve(result);
        }
      }
    });
  });
}

exports.cpuCache = cpuCache;

// --------------------------
// CPU - current load - in %

function getLoad() {

  return new Promise((resolve) => {
    process.nextTick(() => {
      let loads = os.loadavg().map(function (x) { return x / util.cores(); });
      let avgload = parseFloat((Math.max.apply(Math, loads)).toFixed(2));
      let result = {};

      let now = Date.now() - _current_cpu.ms;
      if (now >= 200) {
        _current_cpu.ms = Date.now();
        const cpus = os.cpus();
        let totalUser = 0;
        let totalSystem = 0;
        let totalNice = 0;
        let totalIrq = 0;
        let totalIdle = 0;
        let cores = [];
        _corecount = (cpus && cpus.length) ? cpus.length : 0;

        for (let i = 0; i < _corecount; i++) {
          const cpu = cpus[i].times;
          totalUser += cpu.user;
          totalSystem += cpu.sys;
          totalNice += cpu.nice;
          totalIdle += cpu.idle;
          totalIrq += cpu.irq;
          let tmp_tick = (_cpus && _cpus[i] && _cpus[i].totalTick ? _cpus[i].totalTick : 0);
          let tmp_load = (_cpus && _cpus[i] && _cpus[i].totalLoad ? _cpus[i].totalLoad : 0);
          let tmp_user = (_cpus && _cpus[i] && _cpus[i].user ? _cpus[i].user : 0);
          let tmp_system = (_cpus && _cpus[i] && _cpus[i].sys ? _cpus[i].sys : 0);
          let tmp_nice = (_cpus && _cpus[i] && _cpus[i].nice ? _cpus[i].nice : 0);
          let tmp_idle = (_cpus && _cpus[i] && _cpus[i].idle ? _cpus[i].idle : 0);
          let tmp_irq = (_cpus && _cpus[i] && _cpus[i].irq ? _cpus[i].irq : 0);
          _cpus[i] = cpu;
          _cpus[i].totalTick = _cpus[i].user + _cpus[i].sys + _cpus[i].nice + _cpus[i].irq + _cpus[i].idle;
          _cpus[i].totalLoad = _cpus[i].user + _cpus[i].sys + _cpus[i].nice + _cpus[i].irq;
          _cpus[i].currentTick = _cpus[i].totalTick - tmp_tick;
          _cpus[i].load = (_cpus[i].totalLoad - tmp_load);
          _cpus[i].load_user = (_cpus[i].user - tmp_user);
          _cpus[i].load_system = (_cpus[i].sys - tmp_system);
          _cpus[i].load_nice = (_cpus[i].nice - tmp_nice);
          _cpus[i].load_idle = (_cpus[i].idle - tmp_idle);
          _cpus[i].load_irq = (_cpus[i].irq - tmp_irq);
          cores[i] = {};
          cores[i].load = _cpus[i].load / _cpus[i].currentTick * 100;
          cores[i].load_user = _cpus[i].load_user / _cpus[i].currentTick * 100;
          cores[i].load_system = _cpus[i].load_system / _cpus[i].currentTick * 100;
          cores[i].load_nice = _cpus[i].load_nice / _cpus[i].currentTick * 100;
          cores[i].load_idle = _cpus[i].load_idle / _cpus[i].currentTick * 100;
          cores[i].load_irq = _cpus[i].load_irq / _cpus[i].currentTick * 100;
          cores[i].raw_load = _cpus[i].load;
          cores[i].raw_load_user = _cpus[i].load_user;
          cores[i].raw_load_system = _cpus[i].load_system;
          cores[i].raw_load_nice = _cpus[i].load_nice;
          cores[i].raw_load_idle = _cpus[i].load_idle;
          cores[i].raw_load_irq = _cpus[i].load_irq;
        }
        let totalTick = totalUser + totalSystem + totalNice + totalIrq + totalIdle;
        let totalLoad = totalUser + totalSystem + totalNice + totalIrq;
        let currentTick = totalTick - _current_cpu.tick;
        result = {
          avgload: avgload,
          currentload: (totalLoad - _current_cpu.load) / currentTick * 100,
          currentload_user: (totalUser - _current_cpu.user) / currentTick * 100,
          currentload_system: (totalSystem - _current_cpu.system) / currentTick * 100,
          currentload_nice: (totalNice - _current_cpu.nice) / currentTick * 100,
          currentload_idle: (totalIdle - _current_cpu.idle) / currentTick * 100,
          currentload_irq: (totalIrq - _current_cpu.irq) / currentTick * 100,
          raw_currentload: (totalLoad - _current_cpu.load),
          raw_currentload_user: (totalUser - _current_cpu.user),
          raw_currentload_system: (totalSystem - _current_cpu.system),
          raw_currentload_nice: (totalNice - _current_cpu.nice),
          raw_currentload_idle: (totalIdle - _current_cpu.idle),
          raw_currentload_irq: (totalIrq - _current_cpu.irq),
          cpus: cores
        };
        _current_cpu = {
          user: totalUser,
          nice: totalNice,
          system: totalSystem,
          idle: totalIdle,
          irq: totalIrq,
          tick: totalTick,
          load: totalLoad,
          ms: _current_cpu.ms,
          currentload: result.currentload,
          currentload_user: result.currentload_user,
          currentload_system: result.currentload_system,
          currentload_nice: result.currentload_nice,
          currentload_idle: result.currentload_idle,
          currentload_irq: result.currentload_irq,
          raw_currentload: result.raw_currentload,
          raw_currentload_user: result.raw_currentload_user,
          raw_currentload_system: result.raw_currentload_system,
          raw_currentload_nice: result.raw_currentload_nice,
          raw_currentload_idle: result.raw_currentload_idle,
          raw_currentload_irq: result.raw_currentload_irq,
        };
      } else {
        let cores = [];
        for (let i = 0; i < _corecount; i++) {
          cores[i] = {};
          cores[i].load = _cpus[i].load / _cpus[i].currentTick * 100;
          cores[i].load_user = _cpus[i].load_user / _cpus[i].currentTick * 100;
          cores[i].load_system = _cpus[i].load_system / _cpus[i].currentTick * 100;
          cores[i].load_nice = _cpus[i].load_nice / _cpus[i].currentTick * 100;
          cores[i].load_idle = _cpus[i].load_idle / _cpus[i].currentTick * 100;
          cores[i].load_irq = _cpus[i].load_irq / _cpus[i].currentTick * 100;
          cores[i].raw_load = _cpus[i].load;
          cores[i].raw_load_user = _cpus[i].load_user;
          cores[i].raw_load_system = _cpus[i].load_system;
          cores[i].raw_load_nice = _cpus[i].load_nice;
          cores[i].raw_load_idle = _cpus[i].load_idle;
          cores[i].raw_load_irq = _cpus[i].load_irq;
        }
        result = {
          avgload: avgload,
          currentload: _current_cpu.currentload,
          currentload_user: _current_cpu.currentload_user,
          currentload_system: _current_cpu.currentload_system,
          currentload_nice: _current_cpu.currentload_nice,
          currentload_idle: _current_cpu.currentload_idle,
          currentload_irq: _current_cpu.currentload_irq,
          raw_currentload: _current_cpu.raw_currentload,
          raw_currentload_user: _current_cpu.raw_currentload_user,
          raw_currentload_system: _current_cpu.raw_currentload_system,
          raw_currentload_nice: _current_cpu.raw_currentload_nice,
          raw_currentload_idle: _current_cpu.raw_currentload_idle,
          raw_currentload_irq: _current_cpu.raw_currentload_irq,
          cpus: cores
        };
      }
      resolve(result);
    });
  });
}

function currentLoad(callback) {

  return new Promise((resolve) => {
    process.nextTick(() => {
      getLoad().then(result => {
        if (callback) { callback(result); }
        resolve(result);
      });
    });
  });
}

exports.currentLoad = currentLoad;

// --------------------------
// PS - full load
// since bootup

function getFullLoad() {

  return new Promise((resolve) => {
    process.nextTick(() => {

      const cpus = os.cpus();
      let totalUser = 0;
      let totalSystem = 0;
      let totalNice = 0;
      let totalIrq = 0;
      let totalIdle = 0;

      let result = 0;

      if (cpus && cpus.length) {
        for (let i = 0, len = cpus.length; i < len; i++) {
          const cpu = cpus[i].times;
          totalUser += cpu.user;
          totalSystem += cpu.sys;
          totalNice += cpu.nice;
          totalIrq += cpu.irq;
          totalIdle += cpu.idle;
        }
        let totalTicks = totalIdle + totalIrq + totalNice + totalSystem + totalUser;
        result = (totalTicks - totalIdle) / totalTicks * 100.0;

      } else {
        result = 0;
      }
      resolve(result);
    });
  });
}

function fullLoad(callback) {

  return new Promise((resolve) => {
    process.nextTick(() => {
      getFullLoad().then(result => {
        if (callback) { callback(result); }
        resolve(result);
      });
    });
  });
}

exports.fullLoad = fullLoad;

