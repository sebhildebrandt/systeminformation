'use strict';
// ==================================================================================
// cpu.js
// ----------------------------------------------------------------------------------
// Description:   System Information - library
//                for Node.js
// Copyright:     (c) 2014 - 2017
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

let _platform = os.type();

const _linux = (_platform === 'Linux');
const _darwin = (_platform === 'Darwin');
const _windows = (_platform === 'Windows_NT');
const NOT_SUPPORTED = 'not supported';

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
  currentload_nice: 0,
  currentload_system: 0,
  currentload_irq: 0
};
let _cpus = [];
let _corecount = 0;

function cpuBrandManufacturer(res) {
  res.brand = res.brand.replace(/\(R\)+/g, "®");
  res.brand = res.brand.replace(/\(TM\)+/g, "™");
  res.brand = res.brand.replace(/\(C\)+/g, "©");
  res.brand = res.brand.replace(/CPU+/g, "").trim();
  res.manufacturer = res.brand.split(' ')[0];

  let parts = res.brand.split(' ');
  parts.shift();
  res.brand = parts.join(' ');
  return res;
}

function getValue(lines, property, separator) {
  separator = separator || ':';
  property = property.toLowerCase();
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].toLowerCase().startsWith(property)) {
      const parts = lines[i].split(separator);
      if (parts.length > 1) {
        return parts[1].trim();
      }
    }
  }
  return '';
}

// --------------------------
// CPU - brand, speed

function getCpu() {

  return new Promise((resolve) => {
    process.nextTick(() => {
      const UNKNOWN = 'unknown'
      let result = {
        manufacturer: UNKNOWN,
        brand: UNKNOWN,
        vendor: '',
        family: '',
        model: '',
        stepping: '',
        revision: '',
        speed: '0.00',
        speedmin: '',
        speedmax: '',
        cores: util.cores(),
        cache: {}
      };
      if (_darwin) {
        exec("sysctl machdep.cpu hw.cpufrequency_max hw.cpufrequency_min", function (error, stdout) {
          if (!error) {
            let lines = stdout.toString().split('\n');
            const modelline = getValue(lines, 'machdep.cpu.brand_string');
            result.brand = modelline.split('@')[0].trim();
            result.speed = modelline.split('@')[1].trim();
            result.speed = parseFloat(result.speed.replace(/GHz+/g, "")).toFixed(2);
            _cpu_speed = result.speed;
            result = cpuBrandManufacturer(result);
            result.speedmin = (getValue(lines, 'hw.cpufrequency_min') / 1000000000.0 ).toFixed(2);
            result.speedmax = (getValue(lines, 'hw.cpufrequency_max') / 1000000000.0 ).toFixed(2);
            result.vendor = getValue(lines, 'machdep.cpu.vendor');
            result.family = getValue(lines, 'machdep.cpu.family');
            result.model = getValue(lines, 'machdep.cpu.model');
            result.stepping = getValue(lines, 'machdep.cpu.stepping');

          }
          cpuCache().then(res => {
            result.cache = res;
            resolve(result);
          })
        });
      }
      if (_linux) {
        exec("export LC_ALL=C; lscpu; unset LC_ALL", function (error, stdout) {
          if (!error) {
            let lines = stdout.toString().split('\n');
            const modelline = getValue(lines, 'model name');
            result.brand = modelline.split('@')[0].trim();
            result.speed = modelline.split('@')[1] ? parseFloat(modelline.split('@')[1].trim()).toFixed(2) : '0.00';
            if (result.speed === '0.00') {
              let current = getCpuCurrentSpeedSync();
              if (current !== '0.00') result.speed = current;
            }
            _cpu_speed = result.speed;
            result.speedmin = Math.round(parseFloat(getValue(lines, 'cpu min mhz').replace(/,/g, '.')) / 10.0) / 100;
            result.speedmin = result.speedmin ? parseFloat(result.speedmin).toFixed(2) : ''
            result.speedmax = Math.round(parseFloat(getValue(lines, 'cpu max mhz').replace(/,/g, '.')) / 10.0) / 100;
            result.speedmax = result.speedmax ? parseFloat(result.speedmax).toFixed(2) : ''

            result = cpuBrandManufacturer(result);
            result.vendor = getValue(lines, 'vendor id');
            // if (!result.vendor) { result.vendor = getValue(lines, 'anbieterkennung'); }
            result.family = getValue(lines, 'cpu family');
            // if (!result.family) { result.family = getValue(lines, 'prozessorfamilie'); }
            result.model = getValue(lines, 'model:');
            // if (!result.model) { result.model = getValue(lines, 'modell:'); }
            result.stepping = getValue(lines, 'stepping');
            result.revision = getValue(lines, 'cpu revision');
            result.cache.l1d = getValue(lines, 'l1d cache');
            if (result.cache.l1d) { result.cache.l1d = parseInt(result.cache.l1d) * (result.cache.l1d.indexOf('K') !== -1 ? 1024 : 1)}
            result.cache.l1i = getValue(lines, 'l1i cache');
            if (result.cache.l1i) { result.cache.l1i = parseInt(result.cache.l1i) * (result.cache.l1i.indexOf('K') !== -1 ? 1024 : 1)}
            result.cache.l2 = getValue(lines, 'l2 cache');
            if (result.cache.l2) { result.cache.l2 = parseInt(result.cache.l2) * (result.cache.l2.indexOf('K') !== -1 ? 1024 : 1)}
            result.cache.l3 = getValue(lines, 'l3 cache');
            if (result.cache.l3) { result.cache.l3 = parseInt(result.cache.l3) * (result.cache.l3.indexOf('K') !== -1 ? 1024 : 1)}
          } else {

          }
          resolve(result);
        })
      }
      if (_windows) {
        exec("wmic cpu get name, description, revision, l2cachesize, l3cachesize, manufacturer, currentclockspeed, maxclockspeed /value", function (error, stdout) {
          if (!error) {
            let lines = stdout.split('\r\n');
            let name = getValue(lines, 'name', '=') || '';
            result.brand = name.split('@')[0].trim();
            result.speed = name.split('@')[1].trim();
            result.speed = parseFloat(result.speed.replace(/GHz+/g, "").trim()).toFixed(2);
            _cpu_speed = result.speed;
            result = cpuBrandManufacturer(result);
            result.revision = getValue(lines, 'revision', '=');
            result.cache.l1d = 0;
            result.cache.l1i = 0;
            result.cache.l2 = getValue(lines, 'l2cachesize', '=');
            result.cache.l3 = getValue(lines, 'l3cachesize', '=');
            if (result.cache.l2) { result.cache.l2 = parseInt(result.cache.l2) * 1024}
            if (result.cache.l3) { result.cache.l3 = parseInt(result.cache.l3) * 1024}
            result.vendor = getValue(lines, 'manufacturer', '=');
            result.speedmax = Math.round(parseFloat(getValue(lines, 'maxclockspeed', '=').replace(/,/g, '.')) / 10.0) / 100;
            result.speedmax = result.speedmax ? parseFloat(result.speedmax).toFixed(2) : ''

            let description = getValue(lines, 'description', '=').split(' ');
            for (let i = 0; i < description.length; i++) {
              if (description[i].toLowerCase().startsWith('family') && (i+1) < description.length && description[i+1]) {
                result.family = description[i+1]
              }
              if (description[i].toLowerCase().startsWith('model') && (i+1) < description.length && description[i+1]) {
                result.model = description[i+1]
              }
              if (description[i].toLowerCase().startsWith('stepping') && (i+1) < description.length && description[i+1]) {
                result.stepping = description[i+1]
              }
            }
          }
          exec("wmic path Win32_CacheMemory get CacheType,InstalledSize,Purpose", function (error, stdout) {
            if (!error) {
              let lines = stdout.split('\r\n').filter(line => line.trim() !== '').filter((line, idx) => idx > 0);
              lines.forEach(function (line) {
                if (line !== '') {
                  line = line.trim().split(/\s\s+/);
                  // L1 Instructions
                  if (line[2] === 'L1 Cache' && line[0] === '3') {
                    result.cache.l1i = parseInt(line[1], 10)
                  }
                  // L1 Data
                  if (line[2] === 'L1 Cache' && line[0] === '4') {
                    result.cache.l1d = parseInt(line[1], 10)
                  }
                }
              });
            }
            resolve(result);
          })
        })
      }
    });
  });
}

// --------------------------
// CPU - Processor Data

function cpu(callback) {

  return new Promise((resolve, reject) => {
    process.nextTick(() => {
      getCpu().then(result => {
        if (callback) { callback(result) }
        resolve(result);
      })
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
    }
  } else {
    return {
      min: 0,
      max: 0,
      avg: 0
    }
  }
}

function cpuCurrentspeed(callback) {

  return new Promise((resolve) => {
    process.nextTick(() => {
      let result = getCpuCurrentSpeedSync();
      if (result === 0 && _cpu_speed !== '0.00') result = parseFloat(_cpu_speed);

      if (callback) { callback(result) }
      resolve(result);
    });
  });
}

exports.cpuCurrentspeed = cpuCurrentspeed;

// --------------------------
// CPU - temperature
// if sensors are installed

function cpuTemperature(callback) {

  return new Promise((resolve, reject) => {
    process.nextTick(() => {
      let result = {
        main: -1.0,
        cores: [],
        max: -1.0
      };
      if (_linux) {
        exec("sensors", function (error, stdout) {
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
            if (callback) { callback(result) }
            resolve(result);
          } else {
            fs.stat('/sys/class/thermal/thermal_zone0/temp', function(err, stat) {
              if(err === null) {
                exec("cat /sys/class/thermal/thermal_zone0/temp", function (error, stdout) {
                  if (!error) {
                    let lines = stdout.toString().split('\n');
                    if (lines.length > 0) {
                      result.main = parseFloat(lines[0]) / 1000.0;
                      result.max = result.main
                    }
                  }
                  if (callback) { callback(result) }
                  resolve(result);
                });
              } else {
                exec("/opt/vc/bin/vcgencmd measure_temp", function (error, stdout) {
                  if (!error) {
                    let lines = stdout.toString().split('\n');
                    if (lines.length > 0 && lines[0].indexOf('=')) {
                      result.main = parseFloat(lines[0].split("=")[1]);
                      result.max = result.main
                    }
                  }
                  if (callback) { callback(result) }
                  resolve(result);
                });
              }
            });

          }
        });
      }
      if (_darwin) {
        let osxTemp = null;
        try {
          osxTemp = require('osx-temperature-sensor');
        } catch (er) {
          osxTemp = null
        }
        if (osxTemp) {
          result = osxTemp.cpuTemperature();
        }

        if (callback) { callback(result) }
        resolve(result);
      }
      if (_windows) {
        exec("wmic /namespace:\\\\root\\wmi PATH MSAcpi_ThermalZoneTemperature get CriticalTripPoint,CurrentTemperature /value", function (error, stdout) {
          if (!error) {
            let sum = 0;
            let lines = stdout.trim().split(/\s\s+/);
            lines.forEach(function (line) {
              if (line.match('CriticalTripPoint') && !result.max)
                result.max = (parseInt(line.split('CriticalTripPoint=')[1]) - 2732) / 10;
              else if (line.match('CurrentTemperature')) {
                let value = (parseInt(line.split('CurrentTemperature=')[1]) - 2732) / 10;
                sum = sum + value;
                result.cores.push(value);
              }
            });
            if (result.cores.length) {
              result.main = sum / result.cores.length;
            }
          }
          if (callback) { callback(result) }
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

  return new Promise((resolve, reject) => {
    process.nextTick(() => {
      let result = '';
      if (_windows) {
        if (callback) { callback(result) }
        resolve(result);
      }

      if (_linux) {
        exec("lscpu", function (error, stdout) {
          if (!error) {
            let lines = stdout.toString().split('\n');
            lines.forEach(function (line) {
              if (line.split(':')[0].toUpperCase().indexOf('FLAGS') !== -1) {
                result = line.split(':')[1].trim().toLowerCase();
              }
            });
          }
          if (callback) { callback(result) }
          resolve(result);
        });
      }
      if (_darwin) {
        exec("sysctl machdep.cpu.features", function (error, stdout) {
          if (!error) {
            let lines = stdout.toString().split('\n');
            if (lines.length > 0 && lines[0].indexOf('machdep.cpu.features:') !== -1) {
              result = lines[0].split(':')[1].trim().toLowerCase();
            }
          }
          if (callback) { callback(result) }
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

  return new Promise((resolve, reject) => {
    process.nextTick(() => {

      let result = {};
      if (_linux) {
        exec("lscpu", function (error, stdout) {
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
          if (callback) { callback(result) }
          resolve(result);
        });
      }
      if (_darwin) {
        exec("sysctl hw.l1icachesize hw.l1dcachesize hw.l2cachesize hw.l3cachesize", function (error, stdout) {
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
          if (callback) { callback(result) }
          resolve(result);
        });
      }
      if (_windows) {
        exec("wmic cpu get l2cachesize, l3cachesize /value", function (error, stdout) {
          if (!error) {
            let lines = stdout.split('\r\n');
            result.l1d = 0;
            result.l1i = 0;
            result.l2 = getValue(lines, 'l2cachesize', '=');
            result.l3 = getValue(lines, 'l3cachesize', '=');
            if (result.l2) { result.l2 = parseInt(result.l2) * 1024}
            if (result.l3) { result.l3 = parseInt(result.l3) * 1024}
          }
          exec("wmic path Win32_CacheMemory get CacheType,InstalledSize,Purpose", function (error, stdout) {
            if (!error) {
              let lines = stdout.split('\r\n').filter(line => line.trim() !== '').filter((line, idx) => idx > 0);
              lines.forEach(function (line) {
                if (line !== '') {
                  line = line.trim().split(/\s\s+/);
                  // L1 Instructions
                  if (line[2] === 'L1 Cache' && line[0] === '3') {
                    result.l1i = parseInt(line[1], 10)
                  }
                  // L1 Data
                  if (line[2] === 'L1 Cache' && line[0] === '4') {
                    result.l1d = parseInt(line[1], 10)
                  }
                }
              });
            }
            if (callback) { callback(result) }
            resolve(result);
          })
        })
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
      let loads = os.loadavg().map(function (x) { return x / util.cores() });
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
          totalIrq += cpu.irq;
          totalIdle += cpu.idle;
          let tmp_tick = (_cpus && _cpus[i] && _cpus[i].totalTick ? _cpus[i].totalTick : 0);
          let tmp_load = (_cpus && _cpus[i] && _cpus[i].totalLoad ? _cpus[i].totalLoad : 0);
          let tmp_user = (_cpus && _cpus[i] && _cpus[i].user ? _cpus[i].user : 0);
          let tmp_system = (_cpus && _cpus[i] && _cpus[i].sys ? _cpus[i].sys : 0);
          let tmp_nice = (_cpus && _cpus[i] && _cpus[i].nice ? _cpus[i].nice : 0);
          let tmp_irq = (_cpus && _cpus[i] && _cpus[i].irq ? _cpus[i].irq : 0);
          _cpus[i] = cpu;
          _cpus[i].totalTick = _cpus[i].user + _cpus[i].sys + _cpus[i].nice + _cpus[i].irq + _cpus[i].idle;
          _cpus[i].totalLoad = _cpus[i].user + _cpus[i].sys + _cpus[i].nice + _cpus[i].irq;
          _cpus[i].currentTick = _cpus[i].totalTick - tmp_tick;
          _cpus[i].load = (_cpus[i].totalLoad - tmp_load) / _cpus[i].currentTick * 100;
          _cpus[i].load_user = (_cpus[i].user - tmp_user) / _cpus[i].currentTick * 100;
          _cpus[i].load_system = (_cpus[i].sys - tmp_system) / _cpus[i].currentTick * 100;
          _cpus[i].load_nice = (_cpus[i].nice - tmp_nice) / _cpus[i].currentTick * 100;
          _cpus[i].load_irq = (_cpus[i].irq - tmp_irq) / _cpus[i].currentTick * 100;
          cores[i] = {};
          cores[i].load = _cpus[i].load;
          cores[i].load_user = _cpus[i].load_user;
          cores[i].load_system = _cpus[i].load_system;
          cores[i].load_nice = _cpus[i].load_nice;
          cores[i].load_irq = _cpus[i].load_irq;
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
          currentload_irq: (totalIrq - _current_cpu.irq) / currentTick * 100,
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
          currentload_irq: result.currentload_irq,
        };
      } else {
        let cores = [];
        for (let i = 0; i < _corecount; i++) {
          cores[i] = {};
          cores[i].load = _cpus[i].load;
          cores[i].load_user = _cpus[i].load_user;
          cores[i].load_system = _cpus[i].load_system;
          cores[i].load_nice = _cpus[i].load_nice;
          cores[i].load_irq = _cpus[i].load_irq;
        }
        result = {
          avgload: avgload,
          currentload: _current_cpu.currentload,
          currentload_user: _current_cpu.currentload_user,
          currentload_system: _current_cpu.currentload_system,
          currentload_nice: _current_cpu.currentload_nice,
          currentload_irq: _current_cpu.currentload_irq,
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
        if (callback) { callback(result) }
        resolve(result);
      })
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
        if (callback) { callback(result) }
        resolve(result);
      })
    });
  });
}

exports.fullLoad = fullLoad;
