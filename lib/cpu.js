'use strict';
// ==================================================================================
// cpu.js
// ----------------------------------------------------------------------------------
// Description:   System Information - library
//                for Node.js
// Copyright:     (c) 2014 - 2018
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

const opts = {
  windowsHide: true
};

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
  '7351P': '2.4'
};

function cpuBrandManufacturer(res) {
  res.brand = res.brand.replace(/\(R\)+/g, '®');
  res.brand = res.brand.replace(/\(TM\)+/g, '™');
  res.brand = res.brand.replace(/\(C\)+/g, '©');
  res.brand = res.brand.replace(/CPU+/g, '').trim();
  res.manufacturer = res.brand.split(' ')[0];

  let parts = res.brand.split(' ');
  parts.shift();
  res.brand = parts.join(' ');
  return res;
}

function getAMDSpeed(brand) {
  let result = '0.00';
  for (let key in AMDBaseFrequencies) {
    if (AMDBaseFrequencies.hasOwnProperty(key)) {
      let parts = key.split('|');
      //console.log(item);
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
        cores: util.cores(),
        cache: {}
      };
      if (_darwin) {
        exec('sysctl machdep.cpu hw.cpufrequency_max hw.cpufrequency_min', function (error, stdout) {
          if (!error) {
            let lines = stdout.toString().split('\n');
            const modelline = util.getValue(lines, 'machdep.cpu.brand_string');
            result.brand = modelline.split('@')[0].trim();
            result.speed = modelline.split('@')[1].trim();
            result.speed = parseFloat(result.speed.replace(/GHz+/g, '')).toFixed(2);
            _cpu_speed = result.speed;
            result = cpuBrandManufacturer(result);
            result.speedmin = (util.getValue(lines, 'hw.cpufrequency_min') / 1000000000.0 ).toFixed(2);
            result.speedmax = (util.getValue(lines, 'hw.cpufrequency_max') / 1000000000.0 ).toFixed(2);
            result.vendor = util.getValue(lines, 'machdep.cpu.vendor');
            result.family = util.getValue(lines, 'machdep.cpu.family');
            result.model = util.getValue(lines, 'machdep.cpu.model');
            result.stepping = util.getValue(lines, 'machdep.cpu.stepping');

          }
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
        exec('export LC_ALL=C; lscpu; unset LC_ALL', function (error, stdout) {
          if (!error) {
            lines = stdout.toString().split('\n');
          }
          modelline = util.getValue(lines, 'model name') || modelline;
          result.brand = modelline.split('@')[0].trim();
          result.speed = modelline.split('@')[1] ? parseFloat(modelline.split('@')[1].trim()).toFixed(2) : '0.00';
          if (result.speed === '0.00' && result.brand.indexOf('AMD') > -1) {
            result.speed = getAMDSpeed(result.brand);
          }
          if (result.speed === '0.00') {
            let current = getCpuCurrentSpeedSync();
            if (current !== '0.00') result.speed = current.avg.toFixed(2);
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
          resolve(result);
        });
      }
      if (_freebsd || _openbsd) {
        let modelline = '';
        let lines = [];
        if (os.cpus()[0] && os.cpus()[0].model) modelline = os.cpus()[0].model;
        exec('export LC_ALL=C; dmidecode -t 4; dmidecode -t 7 ; unset LC_ALL', function (error, stdout) {
          let cache = [];
          if (!error) {
            const data = stdout.toString().split('# dmidecode');
            const processor = data.length > 0 ? data[1] : '';
            cache = data.length > 1 ? data[2].split('Cache Information') : [];

            lines = processor.split('\n');
          }
          result.brand = modelline.split('@')[0].trim();
          result.speed = modelline.split('@')[1] ? parseFloat(modelline.split('@')[1].trim()).toFixed(2) : '0.00';
          if (result.speed === '0.00' && result.brand.indexOf('AMD') > -1) {
            result.speed = getAMDSpeed(result.brand);
          }
          if (result.speed === '0.00') {
            let current = getCpuCurrentSpeedSync();
            if (current !== '0.00') result.speed = current.avg.toFixed(2);
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
            let cacheType = util.getValue(lines,'Socket Designation').toLowerCase().replace(' ', '-').split('-');
            cacheType = cacheType.length ? cacheType[0] : '';
            const sizeParts = util.getValue(lines,'Installed Size').split(' ');
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
          resolve(result);
        });
      }
      if (_windows) {
        exec(util.getWmic() + ' cpu get name, description, revision, l2cachesize, l3cachesize, manufacturer, currentclockspeed, maxclockspeed /value', opts, function (error, stdout) {
          if (!error) {
            let lines = stdout.split('\r\n');
            let name = util.getValue(lines, 'name', '=') || '';
            if (name.indexOf('@') >= 0) {
              result.brand = name.split('@')[0].trim();
              result.speed = name.split('@')[1].trim();
              result.speed = parseFloat(result.speed.replace(/GHz+/g, '').trim()).toFixed(2);
              _cpu_speed = result.speed;
            } else {
              result.brand = name.trim();
              result.speed = 0;
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
            if (!result.speed && result.brand.indexOf('AMD') > -1) {
              result.speed = getAMDSpeed(result.brand);
            }
            if (!result.speed) {
              result.speed = result.speedmax;
            }

            let description = util.getValue(lines, 'description', '=').split(' ');
            for (let i = 0; i < description.length; i++) {
              if (description[i].toLowerCase().startsWith('family') && (i+1) < description.length && description[i+1]) {
                result.family = description[i+1];
              }
              if (description[i].toLowerCase().startsWith('model') && (i+1) < description.length && description[i+1]) {
                result.model = description[i+1];
              }
              if (description[i].toLowerCase().startsWith('stepping') && (i+1) < description.length && description[i+1]) {
                result.stepping = description[i+1];
              }
            }
          }
          exec(util.getWmic() + ' path Win32_CacheMemory get CacheType,InstalledSize,Purpose', function (error, stdout) {
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

  if (cpus.length) {
    for (let i in cpus) {
      if (cpus.hasOwnProperty(i)) {
        avgFreq = avgFreq + cpus[i].speed;
        if (cpus[i].speed > maxFreq) maxFreq = cpus[i].speed;
        if (cpus[i].speed < minFreq) minFreq = cpus[i].speed;
      }
    }
    avgFreq = avgFreq / cpus.length;
    return {
      min: parseFloat(((minFreq + 1) / 1000).toFixed(2)),
      max: parseFloat(((maxFreq + 1)  / 1000).toFixed(2)),
      avg: parseFloat(((avgFreq + 1)  / 1000).toFixed(2))
    };
  } else {
    return {
      min: 0,
      max: 0,
      avg: 0
    };
  }
}

function cpuCurrentspeed(callback) {

  return new Promise((resolve) => {
    process.nextTick(() => {
      let result = getCpuCurrentSpeedSync();
      if (result === 0 && _cpu_speed !== '0.00') result = parseFloat(_cpu_speed);

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
        exec('sensors', function (error, stdout) {
          if (!error) {
            let lines = stdout.toString().split('\n');
            lines.forEach(function (line) {
              let regex = /\+([^°]*)/g;
              let temps = line.match(regex);
              if (line.split(':')[0].toUpperCase().indexOf('PHYSICAL') !== -1) {
                result.main = parseFloat(temps);
              }
              if (line.split(':')[0].toUpperCase().indexOf('CORE ') !== -1) {
                result.cores.push(parseFloat(temps));
              }
            });
            if (result.cores.length > 0) {
              let maxtmp = Math.max.apply(Math, result.cores);
              result.max = (maxtmp > result.main) ? maxtmp : result.main;
            }
            if (callback) { callback(result); }
            resolve(result);
          } else {
            fs.stat('/sys/class/thermal/thermal_zone0/temp', function(err) {
              if(err === null) {
                exec('cat /sys/class/thermal/thermal_zone0/temp', function (error, stdout) {
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

          }
        });
      }
      if (_freebsd || _openbsd) {
        exec('sysctl dev.cpu | grep temp', function (error, stdout) {
          if (!error) {
            let lines = stdout.toString().split('\n');
            let sum = 0;
            lines.forEach(function (line) {
              const parts = line.split(':');
              if (parts.length > 0) {
                const temp = parseFloat(parts[1].replace(',', '.'), 10);
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
      if (_windows) {
        exec(util.getWmic() + ' /namespace:\\\\root\\wmi PATH MSAcpi_ThermalZoneTemperature get CurrentTemperature', opts, function (error, stdout) {
          if (!error) {
            let sum = 0;
            let lines = stdout.split('\r\n').filter(line => line.trim() !== '').filter((line, idx) => idx > 0);
            lines.forEach(function (line) {
              let value = (parseInt(line) - 2732) / 10;
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
        exec('reg query "HKEY_LOCAL_MACHINE\\HARDWARE\\DESCRIPTION\\System\\CentralProcessor\\0" /v FeatureSet', opts, function (error, stdout) {
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
      }
      if (_linux) {
        exec('lscpu', function (error, stdout) {
          if (!error) {
            let lines = stdout.toString().split('\n');
            lines.forEach(function (line) {
              if (line.split(':')[0].toUpperCase().indexOf('FLAGS') !== -1) {
                result = line.split(':')[1].trim().toLowerCase();
              }
            });
          }
          if (callback) { callback(result); }
          resolve(result);
        });
      }
      if (_freebsd || _openbsd) {
        exec('export LC_ALL=C; dmidecode -t 4; unset LC_ALL', function (error, stdout) {
          let flags = [];
          if (!error) {
            let parts = stdout.toString().split('\tFlags:');
            const lines = parts.length > 1 ? parts[1].split('\tVersion:')[0].split['\n'] : [];
            lines.forEach(function (line) {
              let flag = (line.indexOf('(') ? line .split('(')[0].toLowerCase() : '').trim().replace(/\t/g, '');
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
    });
  });
}

exports.cpuFlags = cpuFlags;

// --------------------------
// CPU Flags

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
        exec('lscpu', function (error, stdout) {
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
      }
      if (_freebsd || _openbsd) {
        exec('export LC_ALL=C; dmidecode -t 7 ; unset LC_ALL', function (error, stdout) {
          let cache = [];
          if (!error) {
            const data = stdout.toString();
            cache = data.split('Cache Information');
            cache.shift();
          }
          for (let i = 0; i < cache.length; i++) {
            const lines = cache[i].split('\n');
            let cacheType = util.getValue(lines,'Socket Designation').toLowerCase().replace(' ', '-').split('-');
            cacheType = cacheType.length ? cacheType[0] : '';
            const sizeParts = util.getValue(lines,'Installed Size').split(' ');
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
      if (_windows) {
        exec(util.getWmic() + ' cpu get l2cachesize, l3cachesize /value', opts, function (error, stdout) {
          if (!error) {
            let lines = stdout.split('\r\n');
            result.l1d = 0;
            result.l1i = 0;
            result.l2 = util.getValue(lines, 'l2cachesize', '=');
            result.l3 = util.getValue(lines, 'l3cachesize', '=');
            if (result.l2) { result.l2 = parseInt(result.l2) * 1024; }
            if (result.l3) { result.l3 = parseInt(result.l3) * 1024; }
          }
          exec(util.getWmic() + ' path Win32_CacheMemory get CacheType,InstalledSize,Purpose', function (error, stdout) {
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
        _corecount = cpus.length;

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

      for (let i = 0, len = cpus.length; i < len; i++) {
        const cpu = cpus[i].times;
        totalUser += cpu.user;
        totalSystem += cpu.sys;
        totalNice += cpu.nice;
        totalIrq += cpu.irq;
        totalIdle += cpu.idle;
      }
      let totalTicks = totalIdle + totalIrq + totalNice + totalSystem + totalUser;
      let result = (totalTicks - totalIdle) / totalTicks * 100.0;

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
