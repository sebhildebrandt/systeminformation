'use strict';
// ==================================================================================
// index.js
// ----------------------------------------------------------------------------------
// Description:   System Information - library
//                for Node.js
// Copyright:     (c) 2014 - 2016
// Author:        Sebastian Hildebrandt
// ----------------------------------------------------------------------------------
// Contributors:  Guillaume Legrain (https://github.com/glegrain)
//                Riccardo Novaglia (https://github.com/richy24)
//                Quentin Busuttil (https://github.com/Buzut)
//                Lapsio (https://github.com/lapsio)
// ----------------------------------------------------------------------------------
// License:       MIT
// ==================================================================================
//
// Sections
// --------------------------------
// 1. General
// 2. System (HW)
// 3. OS - Operating System
// 4. CPU
// 5. Memory
// 6. Battery
// 7. Graphics
// 8. File System
// 9. Network
// 10. Processes
// 11. Users/Sessions
// 12. Internet
// 13. Docker
// 14. GetAll - get all data
//
// ==================================================================================
//
// Installation
// --------------------------------
//
// # npm install systeminformation --save
//
// Since version 2.0 systeminformation has no more dependencies.
//
// ==================================================================================
//
// Usage
// --------------------------------
// All functions (except `version` and `time`) are asynchronous functions. Here a small example how to use them:
//
// var si = require('systeminformation');
//
// // callback style
// si.cpu(function(data) {
//	  console.log('CPU-Information:');
//	  console.log(data);
// })
//
// // promises style
// si.cpu()
// 	.then(data => console.log(data))
// 	.catch(error => console.error(error));
//
// ==================================================================================
//
// Comments
// --------------------------------
//
// This library is still work in progress. Version 3 comes with further improvements. First it
// requires now node.js version 4.0 and above. Another big change is, that all functions now
// return promises. You can use them like before with callbacks OR with promises (see documentation
// below. I am sure, there is for sure room for improvement. I was only able to test it on several
// Debian, Raspbian, Ubuntu distributions as well as OS X (Mavericks, Yosemite, El Captain).
// Since version 2 nearly all functionality is available on OS X/Darwin platforms.
// But be careful, this library will definitely NOT work on Windows platforms!
//
// Comments, suggestions & reports are very welcome!
//
// ==================================================================================
//
// Version history
// --------------------------------
//
// version	date	comment
// 3.5.1  2016-09-14  bugfix graphics info
// 3.5.0  2016-09-14  added graphics info (controller, display)
// 3.4.4  2016-09-02  tiny fixes system.model, getDefaultNetworkInterface
// 3.4.3  2016-09-02  tiny bug fix fsStats, disksIO OSX
// 3.4.2  2016-09-01  improved default network interface
// 3.4.1  2016-08-30  updated docs
// 3.4.0  2016-08-30  rewritten current process cpu usage (linux)
// 3.3.0  2016-08-24  added process list
// 3.2.1  2016-08-20  updated docs, improvement system
// 3.2.0  2016-08-19  added battery info
// 3.1.1  2016-08-18  improved system and os detection (vm, ...), bug fix disksIO
// 3.1.0  2016-08-18  added docker stats
// 3.0.1  2016-08-17  Bug-Fix disksIO, users, updated docs
// 3.0.0	2016-08-03	new major version 3.0
// 2.0.5	2016-02-22	some more tiny correction ...
// 2.0.4	2016-02-22	tiny correction - removed double quotes CPU brand, ...
// 2.0.3	2016-02-22	optimized cpuCurrentspeed
// 2.0.2	2016-02-22	added CoreOS identification
// 2.0.1	2016-01-07	minor patch
// 2.0.0	2016-01-07	new major version 2.0
// 1.0.7	2015-11-27	fixed: si.network_speed()
// 1.0.6	2015-09-17	fixed: si.users()
// 1.0.5	2015-09-14	updated dependencies
// 1.0.4	2015-07-18	updated docs
// 1.0.3	2015-07-18	bugfix cpu cores
// 1.0.2	2015-07-18	bugfix cpu_currentspeed, cpu_temperature
// 1.0.1	2015-07-18	documentation update
// 1.0.0	2015-07-18	bug-fixes, version bump, published as npm component
// 0.0.3	2014-04-14	bug-fix (cpu_speed)
// 0.0.2	2014-03-14	Optimization FS-Speed & CPU current speed
// 0.0.1	2014-03-13	initial release
//
// ==================================================================================

// ----------------------------------------------------------------------------------
// Dependencies
// ----------------------------------------------------------------------------------

const os = require('os')
  , exec = require('child_process').exec
  , execSync = require('child_process').execSync
  , fs = require('fs')
  , lib_version = require('../package.json').version;

var _cores = 0;
var _platform = os.type();
var _linux = (_platform == 'Linux');
var _darwin = (_platform == 'Darwin');
var _windows = (_platform == 'Windows_NT');
var _network = {};
var _cpu_speed = '0.00';
var _fs_speed = {};
var _disk_io = {};
var _default_iface;
var _docker_container_stats = {};
var _process_cpu = {
  all: 0,
  list: {},
  ms: 0
};
var _current_cpu = {
  user: 0,
  nice: 0,
  system: 0,
  idle: 0,
  iowait: 0,
  irq: 0,
  softirq: 0,
  steal: 0,
  guest: 0,
  guest_nice: 0,
  all: 0
};

const NOT_SUPPORTED = 'not supported';

// ----------------------------------------------------------------------------------
// 0. helper functions
// ----------------------------------------------------------------------------------

function isFunction(functionToCheck) {
  var getType = {};
  return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}

// ----------------------------------------------------------------------------------
// 1. System (Hardware)
// ----------------------------------------------------------------------------------

function system(callback) {

  return new Promise((resolve, reject) => {
    process.nextTick(() => {
      if (_windows) {
        let error = new Error(NOT_SUPPORTED);
        if (callback) { callback(NOT_SUPPORTED) }
        reject(error);
      }

      var result = {
        manufacturer: '',
        model: 'Computer',
        version: '',
        serial: '-',
        uuid: '-'
      };

      if (_linux) {
        exec("dmidecode -t system", function (error, stdout) {
          if (!error) {
            var lines = stdout.toString().split('\n');
            lines.forEach(function (line) {
              if (line.indexOf(':') != -1) {
                if (line.toLowerCase().indexOf('manufacturer') != -1) result.manufacturer = result.manufacturer || line.split(':')[1].trim();
                if (line.toLowerCase().indexOf('product name') != -1) result.model = line.split(':')[1].trim();
                if (line.toLowerCase().indexOf('version') != -1) result.version = result.version || line.split(':')[1].trim();
                if (line.toLowerCase().indexOf('serial number') != -1) result.serial = line.split(':')[1].trim();
                if (line.toLowerCase().indexOf('uuid') != -1) result.uuid = line.split(':')[1].trim();
              }
            });
            if (result.serial.toLowerCase().indexOf('o.e.m.') != -1) result.serial = '-';
            if (result.manufacturer.toLowerCase().indexOf('o.e.m.') != -1) result.manufacturer = '';
            if (result.model.toLowerCase().indexOf('o.e.m.') != -1) result.model = 'Computer';
            if (result.version.toLowerCase().indexOf('o.e.m.') != -1) result.version = '-';

            if (result.manufacturer == '' && result.model == 'Computer' && result.version == '-') {
              // Check Raspberry Pi
              exec("grep Hardware /proc/cpuinfo; grep Serial /proc/cpuinfo; grep Revision /proc/cpuinfo", function (error, stdout) {
                if (!error) {
                  var lines = stdout.toString().split('\n');
                  lines.forEach(function (line) {
                    if (line.indexOf(':') != -1) {
                      if (line.toLowerCase().indexOf('hardware') != -1) result.model = line.split(':')[1].trim();
                      if (line.toLowerCase().indexOf('revision') != -1) result.version = line.split(':')[1].trim();
                      if (line.toLowerCase().indexOf('serial') != -1) result.serial = line.split(':')[1].trim();
                    }
                  });
                  if (result.model == 'BCM2709') {
                    result.manufacturer = 'Raspberry Pi Foundation';
                    result.model = result.model + ' - Pi 2 Model B';
                    if (['a01041', 'a21041'].indexOf(result.version) >= 0) {
                      result.version = result.version + ' - Rev. 1.1'
                    }
                  }
                  if (result.model == 'BCM2708') {
                    result.manufacturer = 'Raspberry Pi Foundation';
                    if (['0002', '0003'].indexOf(result.version) >= 0) {
                      result.model = result.model + ' - Pi Model B';
                      result.version = result.version + ' - Rev 1.0';
                    }
                    if (['0007', '0008', '0009'].indexOf(result.version) >= 0) {
                      result.model = result.model + ' - Pi Model A';
                      result.version = result.version + ' - Rev 2.0';
                    }
                    if (['0004', '0005', '0006', '000d', '000e', '000f'].indexOf(result.version) >= 0) {
                      result.model = result.model + ' - Pi Model B';
                      result.version = result.version + ' - Rev 2.0';
                    }
                    if (['0012'].indexOf(result.version) >= 0) {
                      result.model = result.model + ' - Pi Model A+';
                      result.version = result.version + ' - Rev 1.0';
                    }
                    if (['0010'].indexOf(result.version) >= 0) {
                      result.model = result.model + ' - Pi Model B+';
                      result.version = result.version + ' - Rev 1.0';
                    }
                    if (['0013'].indexOf(result.version) >= 0) {
                      result.model = result.model + ' - Pi Model B+';
                      result.version = result.version + ' - Rev 1.2';
                    }
                  }
                }
                if (callback) { callback(result) }
                resolve(result);
              })
            } else {
              if (callback) { callback(result) }
              resolve(result);
            }
          } else {
            exec("dmesg | grep -i virtual | grep -iE 'vmware|qemu|kvm|xen'", function (error, stdout) {
              if (!error) {
                var lines = stdout.toString().split('\n');
                if (lines.length > 0) result.model = 'Virtual machine'
              }
              if (fs.existsSync('/.dockerenv') || fs.existsSync('/.dockerinit')) {
                result.model = 'Docker Container'
              }
              if (callback) { callback(result) }
              resolve(result);
            });
          }
        })
      }
      if (_darwin) {
        exec("ioreg -c IOPlatformExpertDevice -d 2", function (error, stdout) {
          if (!error) {
            var lines = stdout.toString().split('\n');
            lines.forEach(function (line) {
              line = line.replace(/[<>"]/g, "");
              if (line.indexOf('=') != -1) {
                if (line.toLowerCase().indexOf('manufacturer') != -1) result.manufacturer = line.split('=')[1].trim();
                if (line.toLowerCase().indexOf('model') != -1) result.model = line.split('=')[1].trim();
                if (line.toLowerCase().indexOf('version') != -1) result.version = line.split('=')[1].trim();
                if (line.toLowerCase().indexOf('ioplatformserialnumber') != -1) result.serial = line.split('=')[1].trim();
                if (line.toLowerCase().indexOf('ioplatformuuid') != -1) result.uuid = line.split('=')[1].trim();
              }
            });
          }
          if (callback) { callback(result) }
          resolve(result);
        })
      }
    });
  });
}

exports.system = system;

// ----------------------------------------------------------------------------------
// 2. General
// ----------------------------------------------------------------------------------

function version() {
  return lib_version;
}

exports.version = version;

// ----------------------------------------------------------------------------------
// 3. Operating System
// ----------------------------------------------------------------------------------

// --------------------------
// Get current time and OS uptime

function time() {
  return {
    current: Date.now(),
    uptime: os.uptime()
  };
}

exports.time = time;

// --------------------------
// Get logo filename of OS distribution

function getLogoFile(distro) {
  distro = distro.toLowerCase();
  let result = 'linux';
  if (distro.indexOf('mac os') != -1) { result = 'apple' }
  else if (distro.indexOf('arch') != -1) { result = 'arch' }
  else if (distro.indexOf('centos') != -1) { result = 'centos' }
  else if (distro.indexOf('coreos') != -1) { result = 'coreos' }
  else if (distro.indexOf('debian') != -1) { result = 'debian' }
  else if (distro.indexOf('elementary') != -1) { result = 'elementary' }
  else if (distro.indexOf('fedora') != -1) { result = 'fedora' }
  else if (distro.indexOf('gentoo') != -1) { result = 'gentoo' }
  else if (distro.indexOf('mageia') != -1) { result = 'mageia' }
  else if (distro.indexOf('mandriva') != -1) { result = 'mandriva' }
  else if (distro.indexOf('manjaro') != -1) { result = 'manjaro' }
  else if (distro.indexOf('mint') != -1) { result = 'mint' }
  else if (distro.indexOf('openbsd') != -1) { result = 'openbsd' }
  else if (distro.indexOf('opensuse') != -1) { result = 'opensuse' }
  else if (distro.indexOf('pclinuxos') != -1) { result = 'pclinuxos' }
  else if (distro.indexOf('puppy') != -1) { result = 'puppy' }
  else if (distro.indexOf('raspbian') != -1) { result = 'raspbian' }
  else if (distro.indexOf('reactos') != -1) { result = 'reactos' }
  else if (distro.indexOf('redhat') != -1) { result = 'redhat' }
  else if (distro.indexOf('slackware') != -1) { result = 'slackware' }
  else if (distro.indexOf('sugar') != -1) { result = 'sugar' }
  else if (distro.indexOf('steam') != -1) { result = 'steam' }
  else if (distro.indexOf('suse') != -1) { result = 'suse' }
  else if (distro.indexOf('mate') != -1) { result = 'ubuntu-mate' }
  else if (distro.indexOf('lubuntu') != -1) { result = 'lubuntu' }
  else if (distro.indexOf('xubuntu') != -1) { result = 'xubuntu' }
  else if (distro.indexOf('ubuntu') != -1) { result = 'ubuntu' }
  return result;
}

// --------------------------
// OS Information

function osInfo(callback) {

  return new Promise((resolve, reject) => {
    process.nextTick(() => {
      if (_windows) {
        let error = new Error(NOT_SUPPORTED);
        if (callback) { callback(NOT_SUPPORTED) }
        reject(error);
      }

      var result = {

        platform: _platform,
        distro: 'unknown',
        release: 'unknown',
        codename: '',
        kernel: os.release(),
        arch: os.arch(),
        hostname: os.hostname(),
        logofile: ''
      };

      if (_linux) {

        exec("cat /etc/*-release", function (error, stdout) {
          //if (!error) {
            /**
             * @namespace
             * @property {string}  DISTRIB_ID
             * @property {string}  NAME
             * @property {string}  DISTRIB_RELEASE
             * @property {string}  VERSION_ID
             * @property {string}  DISTRIB_CODENAME
             */
            var release = {};
            var lines = stdout.toString().split('\n');
            lines.forEach(function (line) {
              if (line.indexOf('=') != -1) {
                release[line.split('=')[0].trim().toUpperCase()] = line.split('=')[1].trim();
              }
            });
            result.distro = (release.DISTRIB_ID || release.NAME || 'unknown').replace(/"/g, '');
            result.logofile = getLogoFile(result.distro);
            result.release = (release.DISTRIB_RELEASE || release.VERSION_ID || 'unknown').replace(/"/g, '');
            result.codename = (release.DISTRIB_CODENAME || '').replace(/"/g, '');
          //}
          if (callback) { callback(result) }
          resolve(result);
        })
      }
      if (_darwin) {
        exec("sw_vers", function (error, stdout) {
          var lines = stdout.toString().split('\n');
          lines.forEach(function (line) {
            if (line.indexOf('ProductName') != -1) {
              result.distro = line.split(':')[1].trim();
              result.logofile = getLogoFile(result.distro);
            }
            if (line.indexOf('ProductVersion') != -1) result.release = line.split(':')[1].trim();
          });
          if (callback) { callback(result) }
          resolve(result);
        })
      }
    });
  });
}

exports.osInfo = osInfo;

// ----------------------------------------------------------------------------------
// 4. CPU
// ----------------------------------------------------------------------------------

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

// --------------------------
// CPU - brand, speed

function getCpu() {

  return new Promise((resolve, reject) => {
    process.nextTick(() => {
      if (_windows) {
        let error = new Error(NOT_SUPPORTED);
        if (callback) { callback(NOT_SUPPORTED) }
        reject(error);
      }

      var result = {
        manufacturer: 'unknown',
        brand: 'unknown',
        speed: '0.00',
        cores: _cores
      };
      if (_darwin) {
        exec("sysctl -n machdep.cpu.brand_string", function (error, stdout) {
          if (!error) {
            let lines = stdout.toString().split('\n');
            result.brand = lines[0].split('@')[0].trim();
            result.speed = lines[0].split('@')[1].trim();
            result.speed = parseFloat(result.speed.replace(/GHz+/g, ""));
            _cpu_speed = result.speed;
          }
          result = cpuBrandManufacturer(result);
          resolve(result);
        });
      }
      if (_linux) {
        exec("cat /proc/cpuinfo | grep 'model name'", function (error, stdout) {
          if (!error) {
            let lines = stdout.toString().split('\n');
            let line = lines[0].split(':')[1];
            result.brand = line.split('@')[0].trim();
            result.speed = line.split('@')[1] ? parseFloat(line.split('@')[1].trim()).toFixed(2) : '0.00';
            if (result.speed == '0.00') {
              let current = getCpuCurrentSpeedSync();
              if (current != '0.00') result.speed = current;
            }
            _cpu_speed = result.speed;
          }
          result = cpuBrandManufacturer(result);
          resolve(result);
        })
      }
    });
  });
}

// --------------------------
// CPU - Processor cores

function cores() {

  return new Promise((resolve, reject) => {
    process.nextTick(() => {
      if (_windows) {
        let error = new Error(NOT_SUPPORTED);
        if (callback) { callback(NOT_SUPPORTED) }
        reject(error);
      }
      let result = os.cpus().length;
      resolve(result);
    });
  });
}

// --------------------------
// CPU - Processor Data

function cpu(callback) {

  return new Promise((resolve, reject) => {
    process.nextTick(() => {
      if (_windows) {
        let error = new Error(NOT_SUPPORTED);
        if (callback) { callback(NOT_SUPPORTED) }
        reject(error);
      }

      if (_cores == 0) {
        cores()
          .then(data => {
            _cores = data;
            getCpu().then(result => {
              if (callback) { callback(result) }
              resolve(result);
            })
          })
      } else {
        getCpu().then(result => {
          if (callback) { callback(result) }
          resolve(result);
        })
      }
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
      min: parseFloat((minFreq / 1000).toFixed(2)),
      max: parseFloat((maxFreq / 1000).toFixed(2)),
      avg: parseFloat((avgFreq / 1000).toFixed(2))
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

  return new Promise((resolve, reject) => {
    process.nextTick(() => {
      if (_windows) {
        let error = new Error(NOT_SUPPORTED);
        if (callback) { callback(NOT_SUPPORTED) }
        reject(error);
      }

      let result = getCpuCurrentSpeedSync();
      if (result == 0 && _cpu_speed != '0.00') result = parseFloat(_cpu_speed);

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
      if (_windows) {
        let error = new Error(NOT_SUPPORTED);
        if (callback) { callback(NOT_SUPPORTED) }
        reject(error);
      }

      var result = {
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
              if (line.split(':')[0].toUpperCase().indexOf('PHYSICAL') != -1) {
                result.main = parseFloat(temps);
              }
              if (line.split(':')[0].toUpperCase().indexOf('CORE ') != -1) {
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
      if (_darwin) {
        if (callback) { callback(result) }
        resolve(result);
      }
    });
  });
}

exports.cpuTemperature = cpuTemperature;

// ----------------------------------------------------------------------------------
// 5. Memory
// ----------------------------------------------------------------------------------

// |                         R A M                              |          H D           |
// |______________________|_________________________|           |                        |
// |        active             buffers/cache        |           |                        |
// |________________________________________________|___________|_________|______________|
// |                     used                            free   |   used       free      |
// |____________________________________________________________|________________________|
// |                        total                               |          swap          |
// |                                                            |                        |

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
      if (_windows) {
        let error = new Error(NOT_SUPPORTED);
        if (callback) { callback(NOT_SUPPORTED) }
        reject(error);
      }

      var result = {
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
                  if (line[i].toLowerCase().indexOf('total') != -1) result.swaptotal = parseFloat(line[i].split('=')[1].trim()) * 1024 * 1024;
                  if (line[i].toLowerCase().indexOf('used') != -1) result.swapused = parseFloat(line[i].split('=')[1].trim()) * 1024 * 1024;
                  if (line[i].toLowerCase().indexOf('free') != -1) result.swapfree = parseFloat(line[i].split('=')[1].trim()) * 1024 * 1024;

                }
              }
            }
            if (callback) { callback(result) }
            resolve(result);
          });
        });
      }
    });
  });
}

exports.mem = mem;


// ----------------------------------------------------------------------------------
// 6. Battery
// ----------------------------------------------------------------------------------

function battery(callback) {

  return new Promise((resolve, reject) => {
    process.nextTick(() => {
      if (_windows) {
        let error = new Error(NOT_SUPPORTED);
        if (callback) { callback(NOT_SUPPORTED) }
        reject(error);
      }

      let result = {
        hasbattery: false,
        cyclecount: 0,
        ischarging: false,
        maxcapacity: 0,
        currentcapacity: 0,
        percent: 0
      };

      if (_linux) {
        let battery_path = '';
        if (fs.existsSync('/sys/class/power_supply/BAT1/status')) {
          battery_path = '/sys/class/power_supply/BAT1/'
        } else if (fs.existsSync('/sys/class/power_supply/BAT0/status')) {
          battery_path = '/sys/class/power_supply/BAT0/'
        }
        if (battery_path) {
          exec("cat " + battery_path + "status", function (error, stdout) {
            if (!error) {
              let lines = stdout.toString().split('\n');
              if (lines.length > 0 && lines[0]) result.ischarging = (lines[0].trim().toLowerCase() == 'charging')
            }
            exec("cat " + battery_path + "cyclec_ount", function (error, stdout) {
              if (!error) {
                let lines = stdout.toString().split('\n');
                if (lines.length > 0 && lines[0]) result.cyclecount = parseFloat(lines[0].trim());
              }
              exec("cat " + battery_path + "charge_full", function (error, stdout) {
                if (!error) {
                  let lines = stdout.toString().split('\n');
                  if (lines.length > 0 && lines[0]) result.maxcapacity = parseFloat(lines[0].trim());
                }
                exec("cat " + battery_path + "charge_now", function (error, stdout) {
                  if (!error) {
                    let lines = stdout.toString().split('\n');
                    if (lines.length > 0 && lines[0]) result.currentcapacity = parseFloat(lines[0].trim());
                  }
                  if (result.maxcapacity && result.currentcapacity) {
                    result.hasbattery = true;
                    result.percent = 100.0 * result.currentcapacity / result.maxcapacity;
                  }
                  if (callback) { callback(result) }
                  resolve(result);
                })
              })
            })
          })
        } else {
          if (callback) { callback(result) }
          resolve(result);
        }
      }
      if (_darwin) {
        exec("ioreg -n AppleSmartBattery -r | grep '\"CycleCount\"';ioreg -n AppleSmartBattery -r | grep '\"IsCharging\"';ioreg -n AppleSmartBattery -r | grep '\"MaxCapacity\"';ioreg -n AppleSmartBattery -r | grep '\"CurrentCapacity\"'", function (error, stdout) {
          if (!error) {
            let lines = stdout.toString().replace(/ +/g, "").replace(/"+/g, "").split('\n');
            lines.forEach(function (line) {
              if (line.indexOf('=') != -1) {
                if (line.toLowerCase().indexOf('cyclecount') != -1) result.cyclecount = parseFloat(line.split('=')[1].trim());
                if (line.toLowerCase().indexOf('ischarging') != -1) result.ischarging = (line.split('=')[1].trim().toLowerCase() == 'yes');
                if (line.toLowerCase().indexOf('maxcapacity') != -1) result.maxcapacity = parseFloat(line.split('=')[1].trim());
                if (line.toLowerCase().indexOf('currentcapacity') != -1) result.currentcapacity = parseFloat(line.split('=')[1].trim());
              }
            });
          }
          if (result.maxcapacity && result.currentcapacity) {
            result.hasbattery = true;
            result.percent = 100.0 * result.currentcapacity / result.maxcapacity;
          }
          if (callback) { callback(result) }
          resolve(result);
        });
      }
    });
  });
}

exports.battery = battery;

// ----------------------------------------------------------------------------------
// 7. Graphics (controller, display)
// ----------------------------------------------------------------------------------

function graphics(callback) {

  function parseLinesDarwin(lines) {
    let starts = [];
    let level = -1;
    let lastlevel = -1;
    let controllers = [];
    let displays = [];
    let currentController = {};
    let currentDisplay = {};
    for (let i = 0; i < lines.length; i++) {
      if ('' != lines[i].trim()) {
        let start = lines[i].search(/\S|$/);
        if (-1 == starts.indexOf(start)) {
          starts.push(start);
        }
        level = starts.indexOf(start);
        if (level < lastlevel) {
          if (Object.keys(currentController).length > 0) {// just changed to Displays
            controllers.push(currentController);
            currentController = {};
          }
          if (Object.keys(currentDisplay).length > 0) {// just changed to Displays
            displays.push(currentDisplay);
            currentDisplay = {};
          }
        }
        lastlevel = level;
        let parts = lines[i].split(':');
        if (2 == level) {       // grafics controller level
          if (parts.length > 1 && parts[0].replace(/ +/g, "").toLowerCase().indexOf('chipsetmodel') != -1) currentController.model = parts[1].trim();
          if (parts.length > 1 && parts[0].replace(/ +/g, "").toLowerCase().indexOf('bus') != -1) currentController.bus = parts[1].trim();
          if (parts.length > 1 && parts[0].replace(/ +/g, "").toLowerCase().indexOf('vendor') != -1) currentController.vendor = parts[1].split('(')[0].trim();
          if (parts.length > 1 && parts[0].replace(/ +/g, "").toLowerCase().indexOf('vram(total)') != -1) {
            currentController.vram = parseInt(parts[1]);    // in MB
            currentController.vramDynamic = false;
          }
          if (parts.length > 1 && parts[0].replace(/ +/g, "").toLowerCase().indexOf('vram(dynamic,max)') != -1) {
            currentController.vram = parseInt(parts[1]);    // in MB
            currentController.vramDynamic = true;
          }
        }
        if (3 == level) {       // display controller level
          if (parts.length > 1 && '' == parts[1]) {
            currentDisplay.model = parts[0].trim();
            currentDisplay.main = false;
            currentDisplay.builtin = false;
            currentDisplay.connection = '';
            currentDisplay.sizex = -1;
            currentDisplay.sizey = -1;
          }
        }
        if (4 == level) {       // display controller details level
          if (parts.length > 1 && parts[0].replace(/ +/g, "").toLowerCase().indexOf('resolution') != -1) {
            let resolution = parts[1].split('x');
            currentDisplay.resolutionx = (resolution.length > 1 ? parseInt(resolution[0]) : 0);
            currentDisplay.resolutiony = (resolution.length > 1 ? parseInt(resolution[1]) : 0);
          }
          if (parts.length > 1 && parts[0].replace(/ +/g, "").toLowerCase().indexOf('pixeldepth') != -1) currentDisplay.pixeldepth = parseInt(parts[1]); // in BIT
          if (parts.length > 1 && parts[0].replace(/ +/g, "").toLowerCase().indexOf('maindisplay') != -1 && parts[1].replace(/ +/g, "").toLowerCase() == 'yes') currentDisplay.main = true;
          if (parts.length > 1 && parts[0].replace(/ +/g, "").toLowerCase().indexOf('built-in') != -1 && parts[1].replace(/ +/g, "").toLowerCase() == 'yes') {
            currentDisplay.builtin = true;
            currentDisplay.connection = '';
          }
          if (parts.length > 1 && parts[0].replace(/ +/g, "").toLowerCase().indexOf('connectiontype') != -1) {
            currentDisplay.builtin = false;
            currentDisplay.connection = parts[1].trim();
          }
        }
      }
    }
    if (Object.keys(currentController).length > 0) {// just changed to Displays
      controllers.push(currentController);
    }
    if (Object.keys(currentDisplay).length > 0) {// just changed to Displays
      displays.push(currentDisplay);
    }
    return ({
      controllers: controllers,
      displays: displays
    })
  }

  function parseLinesLinuxControllers(lines) {
    let controllers = [];
    let currentController = {};
    let is_vga = false;
    for (let i = 0; i < lines.length; i++) {
      if ('' != lines[i].trim()) {
        if (' ' != lines[i][0] && '\t' != lines[i][0]) {        // first line of new entry
          let vgapos = lines[i].toLowerCase().indexOf('vga');
          if (vgapos != -1) {         // VGA
            if (Object.keys(currentController).length > 0) {// already a controller found
              controllers.push(currentController);
              currentController = {};
            }
            is_vga = true;
            let endpos = lines[i].search(/\[[0-9a-f]{4}:[0-9a-f]{4}]|$/);
            let parts = lines[i].substr(vgapos, endpos - vgapos).split(':');
            if (parts.length > 1)
            {
              parts[1] = parts[1].trim();
              if (parts[1].toLowerCase().indexOf('corporation')) {
                currentController.vendor = parts[1].substr(0, parts[1].toLowerCase().indexOf('corporation') + 11).trim();
                currentController.model = parts[1].substr(parts[1].toLowerCase().indexOf('corporation') + 11, 200).trim().split('(')[0];
                currentController.bus = '';
                currentController.vram = -1;
                currentController.vramDynamic = false;
              }
            }

          } else {
            is_vga = false;
          }
        }
        if (is_vga) { // within VGA details
          let parts = lines[i].split(':');
          if (parts.length > 1 && parts[0].replace(/ +/g, "").toLowerCase().indexOf('devicename') != -1 && parts[0].toLowerCase().indexOf('onboard') != -1)  currentController.bus = 'Onboard';
          if (parts.length > 1 && parts[0].replace(/ +/g, "").toLowerCase().indexOf('region') != -1 && parts[1].toLowerCase().indexOf('memory') != -1) {
            let memparts = parts[1].split("=");
            if (memparts.length > 1) {
              currentController.vram = parseInt(memparts[1]);
            }
          }
        }
      }
    }
    if (Object.keys(currentController).length > 0) {// still controller information available
      controllers.push(currentController);
    }
    return (controllers)
  }

  function parseLinesLinuxEdid(edid) {
    // parsen EDID
    // --> model
    // --> resolutionx
    // --> resolutiony
    // --> builtin = false
    // --> pixeldepth (?)
    // --> sizex
    // --> sizey
    let result = {};
    // find first "Detailed Timing Description"
    let start = 108;
    if (edid.substr(start,6) == '000000') {
      start += 36;
    }
    if (edid.substr(start,6) == '000000') {
      start += 36;
    }
    if (edid.substr(start,6) == '000000') {
      start += 36;
    }
    if (edid.substr(start,6) == '000000') {
      start += 36;
    }
    result.resolutionx = parseInt('0x0' + edid.substr(start + 8,1) + edid.substr(start + 4,2));
    result.resolutiony = parseInt('0x0' + edid.substr(start + 14,1) + edid.substr(start + 10,2));
    result.sizex = parseInt('0x0' + edid.substr(start + 28,1) + edid.substr(start + 24,2));
    result.sizey = parseInt('0x0' + edid.substr(start + 29,1) + edid.substr(start + 26,2));
    // monitor name
    start = edid.indexOf('000000fc00'); // find first "Monitor Description Data"
    if (start >= 0) {
      let model_raw = edid.substr(start+10, 26);
      if (model_raw.indexOf('0a') != -1) {
        model_raw = model_raw.substr(0,model_raw.indexOf('0a'))
      }
      result.model = model_raw.match(/.{1,2}/g).map(function(v){
        return String.fromCharCode(parseInt(v, 16));
      }).join('');
    } else {
      result.model = '';
    }
    return result;
  }

  function parseLinesLinuxDisplays(lines, depth) {
    let displays = [];
    let currentDisplay = {};
    let is_edid = false;
    let edid_raw = '';
    let start = 0;
    for (let i = 1; i < lines.length; i++) {        // start with second line
      if ('' != lines[i].trim()) {
        if (' ' != lines[i][0] && '\t' != lines[i][0] && lines[i].toLowerCase().indexOf(' connected ') != -1 ) {        // first line of new entry
          if (Object.keys(currentDisplay).length > 0) {         // push last display to array
            displays.push(currentDisplay);
            currentDisplay = {};
          }
          let parts = lines[i].split(' ');
          currentDisplay.connection = parts[0];
          currentDisplay.main = (parts[2] == 'primary');
          currentDisplay.builtin = (parts[0].toLowerCase().indexOf('edp') >= 0)
        }

        // try to read EDID information
        if (is_edid) {
          if (lines[i].search(/\S|$/) > start) {
            edid_raw += lines[i].toLowerCase().trim();
          } else {
            // parsen EDID
            let edid_decoded = parseLinesLinuxEdid(edid_raw);
            currentDisplay.model = edid_decoded.model;
            currentDisplay.resolutionx = edid_decoded.resolutionx;
            currentDisplay.resolutiony = edid_decoded.resolutiony;
            currentDisplay.sizex = edid_decoded.sizex;
            currentDisplay.sizey = edid_decoded.sizey;
            currentDisplay.pixeldepth = depth;
            is_edid = false;
          }
        }
        if (lines[i].toLowerCase().indexOf('edid:') != -1 ) {
          is_edid = true;
          start = lines[i].search(/\S|$/);
        }
      }
    }

    // pushen displays
    if (Object.keys(currentDisplay).length > 0) {         // still information there
      displays.push(currentDisplay);
    }
    return displays
  }

  // function starts here
  return new Promise((resolve, reject) => {
    process.nextTick(() => {
      if (_windows) {
        let error = new Error(NOT_SUPPORTED);
        if (callback) {
          callback(NOT_SUPPORTED)
        }
        reject(error);
      }
      let result = {
        controllers: [],
        displays: []
      };
      if (_darwin) {
        let cmd = 'system_profiler SPDisplaysDataType';
        exec(cmd, function (error, stdout) {
          if (!error) {
            let lines = stdout.toString().split('\n');
            result = parseLinesDarwin(lines);
          }
          if (callback) {
            callback(result)
          }
          resolve(result);
        })
      }
      if (_linux) {
        let cmd = 'lspci -vvv  2>/dev/null';
        exec(cmd, function (error, stdout) {
          if (!error) {
            let lines = stdout.toString().split('\n');
            result.controllers = parseLinesLinuxControllers(lines);
          }
          let cmd = "xdpyinfo 2>/dev/null | grep 'depth of root window' | awk '{ print $5 }'";
          exec(cmd, function (error, stdout) {
            let depth = 0;
            if (!error) {
              let lines = stdout.toString().split('\n');
              depth = parseInt(lines[0]) || 0;
            }
            let cmd = 'xrandr --verbose 2>/dev/null';
            exec(cmd, function (error, stdout) {
              if (!error) {
                let lines = stdout.toString().split('\n');
                result.displays = parseLinesLinuxDisplays(lines, depth);
              }
              if (callback) {
                callback(result)
              }
              resolve(result);
            })
          })
        })
      }
    });
  });
}

exports.graphics = graphics;
// ----------------------------------------------------------------------------------
// 8. File System
// ----------------------------------------------------------------------------------

// --------------------------
// FS - devices

function fsSize(callback) {

  return new Promise((resolve, reject) => {
    process.nextTick(() => {
      if (_windows) {
        let error = new Error(NOT_SUPPORTED);
        if (callback) { callback(NOT_SUPPORTED) }
        reject(error);
      }

      exec("df -lk | grep ^/", function (error, stdout) {
        let data = [];
        if (!error) {
          let lines = stdout.toString().split('\n');
          //lines.splice(0, 1);
          lines.forEach(function (line) {
            if (line != '') {
              line = line.replace(/ +/g, " ").split(' ');
              data.push({
                'fs': line[0],
                'size': parseInt(line[1]) * 1024,
                'used': parseInt(line[2]) * 1024,
                'use': parseFloat((100.0 * line[2] / line[1]).toFixed(2)),
                'mount': line[line.length - 1]
              })
            }
          });
        }
        if (callback) { callback(data) }
        resolve(data);
      });
    });
  });
}

exports.fsSize = fsSize;

// --------------------------
// FS - speed

function fsStats(callback) {

  return new Promise((resolve, reject) => {
    process.nextTick(() => {
      if (_windows) {
        let error = new Error(NOT_SUPPORTED);
        if (callback) { callback(NOT_SUPPORTED) }
        reject(error);
      }

      var result = {
        rx: 0,
        wx: 0,
        tx: 0,
        rx_sec: -1,
        wx_sec: -1,
        tx_sec: -1,
        ms: 0
      };

      if (_linux) {
//		exec("df -k | grep /dev/", function(error, stdout) {
        exec("lsblk | grep /", function (error, stdout) {
          if (!error) {
            let lines = stdout.toString().split('\n');
            let fs_filter = [];
            lines.forEach(function (line) {
              if (line != '') {
                line = line.replace(/[├─│└]+/g, "").trim().split(' ');
                if (fs_filter.indexOf(line[0]) == -1) fs_filter.push(line[0])
              }
            });

            let output = fs_filter.join('|');
            exec("cat /proc/diskstats | egrep '" + output + "'", function (error, stdout) {
              if (!error) {
                let lines = stdout.toString().split('\n');
                lines.forEach(function (line) {
                  line = line.trim();
                  if (line != '') {
                    line = line.replace(/ +/g, " ").split(' ');

                    result.rx += parseInt(line[5]) * 512;
                    result.wx += parseInt(line[9]) * 512;
                  }
                });
                result.tx = result.rx + result.wx;
                if (_fs_speed && _fs_speed.ms) {
                  result.ms = Date.now() - _fs_speed.ms;
                  result.rx_sec = (result.rx - _fs_speed.bytes_read) / (result.ms / 1000);
                  result.wx_sec = (result.wx - _fs_speed.bytes_write) / (result.ms / 1000);
                  result.tx_sec = result.rx_sec + result.wx_sec;
                } else {
                  result.rx_sec = -1;
                  result.wx_sec = -1;
                  result.tx_sec = -1;
                }
                _fs_speed.bytes_read = result.rx;
                _fs_speed.bytes_write = result.wx;
                _fs_speed.bytes_overall = result.rx + result.wx;
                _fs_speed.ms = Date.now();
              }
              if (callback) { callback(result) }
              resolve(result);
            })
          } else {
            if (callback) { callback(result) }
            resolve(result);
          }
        })
      }
      if (_darwin) {
        exec("ioreg -c IOBlockStorageDriver -k Statistics -r -w0 | sed -n '/IOBlockStorageDriver/,/Statistics/p' | grep 'Statistics' | tr -cd '01234567890,\n' | awk -F',' '{print $3, $10}'", function (error, stdout) {
          if (!error) {
            let lines = stdout.toString().split('\n');
            lines.forEach(function (line) {
              line = line.trim();
              if (line != '') {
                line = line.split(' ');

                result.rx += parseInt(line[0]);
                result.wx += parseInt(line[1]);
              }
            });
            result.tx = result.rx + result.wx;
            if (_fs_speed && _fs_speed.ms) {
              result.ms = Date.now() - _fs_speed.ms;
              result.rx_sec = (result.rx - _fs_speed.bytes_read) / (result.ms / 1000);
              result.wx_sec = (result.wx - _fs_speed.bytes_write) / (result.ms / 1000);
              result.tx_sec = result.rx_sec + result.wx_sec;
            } else {
              result.rx_sec = -1;
              result.wx_sec = -1;
              result.tx_sec = -1;
            }
            _fs_speed.bytes_read = result.rx;
            _fs_speed.bytes_write = result.wx;
            _fs_speed.bytes_overall = result.rx + result.wx;
            _fs_speed.ms = Date.now();
          }
          if (callback) { callback(result) }
          resolve(result);
        })
      }
    });
  });
}

exports.fsStats = fsStats;

function disksIO(callback) {

  return new Promise((resolve, reject) => {
    process.nextTick(() => {
      if (_windows) {
        let error = new Error(NOT_SUPPORTED);
        if (callback) { callback(NOT_SUPPORTED) }
        reject(error);
      }

      var result = {
        rIO: 0,
        wIO: 0,
        tIO: 0,
        rIO_sec: -1,
        wIO_sec: -1,
        tIO_sec: -1,
        ms: 0
      };
      if (_linux) {
        // prints Block layer statistics for all mounted volumes
        // var cmd = "for mount in `lsblk | grep / | sed -r 's/│ └─//' | cut -d ' ' -f 1`; do cat /sys/block/$mount/stat | sed -r 's/ +/;/g' | sed -r 's/^;//'; done";
        // var cmd = "for mount in `lsblk | grep / | sed 's/[│└─├]//g' | awk '{$1=$1};1' | cut -d ' ' -f 1 | sort -u`; do cat /sys/block/$mount/stat | sed -r 's/ +/;/g' | sed -r 's/^;//'; done";
        let cmd = "for mount in `lsblk | grep ' disk ' | sed 's/[│└─├]//g' | awk '{$1=$1};1' | cut -d ' ' -f 1 | sort -u`; do cat /sys/block/$mount/stat | sed -r 's/ +/;/g' | sed -r 's/^;//'; done";

        exec(cmd, function (error, stdout) {
          if (!error) {
            let lines = stdout.split('\n');
            lines.forEach(function (line) {
              // ignore empty lines
              if (!line) return;

              // sum r/wIO of all disks to compute all disks IO
              let stats = line.split(';');
              result.rIO += parseInt(stats[0]);
              result.wIO += parseInt(stats[4]);
            });
            result.tIO = result.rIO + result.wIO;
            if (_disk_io && _disk_io.ms) {
              result.ms = Date.now() - _disk_io.ms;
              result.rIO_sec = (result.rIO - _disk_io.rIO) / (result.ms / 1000);
              result.wIO_sec = (result.wIO - _disk_io.wIO) / (result.ms / 1000);
              result.tIO_sec = result.rIO_sec + result.wIO_sec;
            } else {
              result.rIO_sec = -1;
              result.wIO_sec = -1;
              result.tIO_sec = -1;
            }
            _disk_io.rIO = result.rIO;
            _disk_io.wIO = result.wIO;
            _disk_io.tIO = result.tIO;
            _disk_io.ms = Date.now();

            if (callback) { callback(result) }
            resolve(result);
          } else {
            if (callback) { callback(result) }
            resolve(result);
          }
        });
      }
      if (_darwin) {
        exec("ioreg -c IOBlockStorageDriver -k Statistics -r -w0 | sed -n '/IOBlockStorageDriver/,/Statistics/p' | grep 'Statistics' | tr -cd '01234567890,\n' | awk -F',' '{print $1, $11}'", function (error, stdout) {
          if (!error) {
            let lines = stdout.toString().split('\n');
            lines.forEach(function (line) {
              line = line.trim();
              if (line != '') {
                line = line.split(' ');

                result.rIO += parseInt(line[1]);
                result.wIO += parseInt(line[0]);
              }
            });

            result.tIO = result.rIO + result.wIO;
            if (_disk_io && _disk_io.ms) {
              result.ms = Date.now() - _disk_io.ms;
              result.rIO_sec = (result.rIO - _disk_io.rIO) / (result.ms / 1000);
              result.wIO_sec = (result.wIO - _disk_io.wIO) / (result.ms / 1000);
              result.tIO_sec = result.rIO_sec + result.wIO_sec;
            } else {
              result.rIO_sec = -1;
              result.wIO_sec = -1;
              result.tIO_sec = -1;
            }
            _disk_io.rIO = result.rIO;
            _disk_io.wIO = result.wIO;
            _disk_io.tIO = result.tIO;
            _disk_io.ms = Date.now();
          }
          if (callback) { callback(result) }
          resolve(result);
        })
      }
    });
  });
}

exports.disksIO = disksIO;

// ----------------------------------------------------------------------------------
// 9. Network
// ----------------------------------------------------------------------------------

function getDefaultNetworkInterface() {

  let ifacename = '';
  let cmd = (_linux ? "route 2>/dev/null | grep default | awk '{print $8}'" : "route get 0.0.0.0 2>/dev/null | grep interface: | awk '{print $2}'");
  let result = execSync(cmd);
  ifacename = result.toString().split('\n')[0];

  if (!ifacename) {         // fallback - "first" external interface
    const sortObject = o => Object.keys(o).sort().reduce((r, k) => (r[k] = o[k], r), {});

    let ifaces = sortObject(os.networkInterfaces());

    for (let dev in ifaces) {
      if (ifaces.hasOwnProperty(dev)) {
        ifaces[dev].forEach(function (details) {
          if (details && details.internal == false) {
            ifacename = ifacename || dev;
          }
        })
      }
    }
  }
  if (ifacename) _default_iface = ifacename;
  return ifacename;
}

function networkInterfaceDefault(callback) {

  return new Promise((resolve, reject) => {
    process.nextTick(() => {
      if (_windows) {
        let error = new Error(NOT_SUPPORTED);
        if (callback) { callback(NOT_SUPPORTED) }
        reject(error);
      }

      let result = getDefaultNetworkInterface();
      if (callback) { callback(result) }
      resolve(result);
    });
  });
}

exports.networkInterfaceDefault = networkInterfaceDefault;

// --------------------------
// NET - interfaces

function networkInterfaces(callback) {

  return new Promise((resolve, reject) => {
    process.nextTick(() => {
      if (_windows) {
        let error = new Error(NOT_SUPPORTED);
        if (callback) { callback(NOT_SUPPORTED) }
        reject(error);
      }

      let ifaces = os.networkInterfaces();
      let result = [];

      for (let dev in ifaces) {
        let ip4 = '';
        let ip6 = '';
        if (ifaces.hasOwnProperty(dev)) {
          ifaces[dev].forEach(function (details) {
            if (details.family == 'IPv4') {
              ip4 = details.address
            }
            if (details.family == 'IPv6') {
              ip6 = details.address
            }
          });
          let internal = (ifaces[dev] && ifaces[dev][0]) ? ifaces[dev][0].internal : null;
          result.push({ iface: dev, ip4: ip4, ip6: ip6, internal: internal })
        }
      }
      if (callback) { callback(result) }
      resolve(result);
    });
  });
}

exports.networkInterfaces = networkInterfaces;

// --------------------------
// NET - Speed

function calcNetworkSpeed(iface, rx, tx) {
  let rx_sec = -1;
  let tx_sec = -1;
  let ms = 0;
  if (_network[iface] && _network[iface].ms) {
    ms = Date.now() - _network[iface].ms;
    rx_sec = (rx - _network[iface].rx) / (ms / 1000);
    tx_sec = (tx - _network[iface].tx) / (ms / 1000);
  } else {
    _network[iface] = {};
  }
  _network[iface].rx = rx;
  _network[iface].tx = tx;
  _network[iface].ms = Date.now();
  return ({
    rx_sec: rx_sec,
    tx_sec: tx_sec,
    ms: ms
  })
}
function networkStats(iface, callback) {

  // fallback - if only callback is given
  if (isFunction(iface) && !callback) {
    callback = iface;
    iface = '';
  }

  return new Promise((resolve, reject) => {
    process.nextTick(() => {
      if (_windows) {
        let error = new Error(NOT_SUPPORTED);
        if (callback) { callback(NOT_SUPPORTED) }
        reject(error);
      }

      _default_iface = _default_iface || getDefaultNetworkInterface();
      iface = iface || _default_iface; // (_darwin ? 'en0' : 'eth0');

      let result = {
        iface: iface,
        operstate: 'unknown',
        rx: 0,
        tx: 0,
        rx_sec: -1,
        tx_sec: -1,
        ms: 0
      };

      let cmd, lines, stats, speed;

      if (_linux) {
        if (fs.existsSync('/sys/class/net/' + iface)) {
          cmd =
            "cat /sys/class/net/" + iface + "/operstate; " +
            "cat /sys/class/net/" + iface + "/statistics/rx_bytes; " +
            "cat /sys/class/net/" + iface + "/statistics/tx_bytes; ";
          exec(cmd, function (error, stdout) {
            if (!error) {
              lines = stdout.toString().split('\n');
              result.operstate = lines[0].trim();
              result.rx = parseInt(lines[1]);
              result.tx = parseInt(lines[2]);

              speed = calcNetworkSpeed(iface, result.rx, result.tx);

              result.rx_sec = speed.rx_sec;
              result.tx_sec = speed.tx_sec;
              result.ms = speed.ms;
            }
            if (callback) { callback(result) }
            resolve(result);
          });
        } else {
          if (callback) { callback(result) }
          resolve(result);
        }
      }
      if (_darwin) {
        cmd = "ifconfig " + iface + " | grep 'status'";
        exec(cmd, function (error, stdout) {
          result.operstate = (stdout.toString().split(':')[1] || '').trim();
          result.operstate = (result.operstate || '').toLowerCase();
          result.operstate = (result.operstate == 'active' ? 'up' : (result.operstate == 'inactive' ? 'down' : 'unknown'));
          cmd = "netstat -bI " + iface;
          exec(cmd, function (error, stdout) {
            if (!error) {
              lines = stdout.toString().split('\n');
              // if there is less than 2 lines, no information for this interface was found
              if (lines.length > 1 && lines[1].trim() != '') {
                // skip header line
                // use the second line because it is tied to the NIC instead of the ipv4 or ipv6 address
                stats = lines[1].replace(/ +/g, " ").split(' ');
                result.rx = parseInt(stats[6]);
                result.tx = parseInt(stats[9]);

                speed = calcNetworkSpeed(iface, result.rx, result.tx);

                result.rx_sec = speed.rx_sec;
                result.tx_sec = speed.tx_sec;
              }
            }
            if (callback) { callback(result) }
            resolve(result);
          });
        });
      }
    });
  });
}

exports.networkStats = networkStats;

// --------------------------
// NET - connections (sockets)

function networkConnections(callback) {

  return new Promise((resolve, reject) => {
    process.nextTick(() => {
      if (_windows) {
        let error = new Error(NOT_SUPPORTED);
        if (callback) { callback(NOT_SUPPORTED) }
        reject(error);
      }

      var result = [];
      if (_linux) {
        let cmd = "netstat -tuna | grep 'ESTABLISHED\\|SYN_SENT\\|SYN_RECV\\|FIN_WAIT1\\|FIN_WAIT2\\|TIME_WAIT\\|CLOSE\\|CLOSE_WAIT\\|LAST_ACK\\|LISTEN\\|CLOSING\\|UNKNOWN\\|VERBUNDEN'";
        exec(cmd, function (error, stdout) {
          if (!error) {
            var lines = stdout.toString().split('\n');
            lines.forEach(function (line) {
              line = line.replace(/ +/g, " ").split(' ');
              if (line.length >= 6) {
                let localip = line[3];
                let localport = '';
                let localaddress = line[3].split(':');
                if (localaddress.length > 1) {
                  localport = localaddress[localaddress.length - 1];
                  localaddress.pop();
                  localip = localaddress.join(':');
                }
                let peerip = line[4];
                let peerport = '';
                let peeraddress = line[4].split(':');
                if (peeraddress.length > 1) {
                  peerport = peeraddress[peeraddress.length - 1];
                  peeraddress.pop();
                  peerip = peeraddress.join(':');
                }
                let connstate = line[5];
                if (connstate == 'VERBUNDEN') connstate = 'ESTABLISHED';
                if (connstate) {
                  result.push({
                    protocol: line[0],
                    localaddress: localip,
                    localport: localport,
                    peeraddress: peerip,
                    peerport: peerport,
                    state: connstate
                  })
                }
              }
            });
            if (callback) {
              callback(result)
            }
            resolve(result);
          } else {
            cmd = "ss -tuna | grep 'ESTAB\\|SYN-SENT\\|SYN-RECV\\|FIN-WAIT1\\|FIN-WAIT2\\|TIME-WAIT\\|CLOSE\\|CLOSE-WAIT\\|LAST-ACK\\|LISTEN\\|CLOSING'";
            exec(cmd, function (error, stdout) {

              if (!error) {
                var lines = stdout.toString().split('\n');
                lines.forEach(function (line) {
                  line = line.replace(/ +/g, " ").split(' ');
                  if (line.length >= 6) {
                    let localip = line[4];
                    let localport = '';
                    let localaddress = line[4].split(':');
                    if (localaddress.length > 1) {
                      localport = localaddress[localaddress.length - 1];
                      localaddress.pop();
                      localip = localaddress.join(':');
                    }
                    let peerip = line[5];
                    let peerport = '';
                    let peeraddress = line[5].split(':');
                    if (peeraddress.length > 1) {
                      peerport = peeraddress[peeraddress.length - 1];
                      peeraddress.pop();
                      peerip = peeraddress.join(':');
                    }
                    let connstate = line[1];
                    if (connstate == 'ESTAB') connstate = 'ESTABLISHED';
                    if (connstate == 'TIME-WAIT') connstate = 'TIME_WAIT';
                    if (connstate) {
                      result.push({
                        protocol: line[0],
                        localaddress: localip,
                        localport: localport,
                        peeraddress: peerip,
                        peerport: peerport,
                        state: connstate
                      })
                    }
                  }
                });
              }
              if (callback) {
                callback(result)
              }
              resolve(result);
            })
          }
        })
      }
      if (_darwin) {
        let cmd = "netstat -nat | grep 'ESTABLISHED\\|SYN_SENT\\|SYN_RECV\\|FIN_WAIT1\\|FIN_WAIT2\\|TIME_WAIT\\|CLOSE\\|CLOSE_WAIT\\|LAST_ACK\\|LISTEN\\|CLOSING\\|UNKNOWN'";
        exec(cmd, function (error, stdout) {
          if (!error) {

            let lines = stdout.toString().split('\n');

            lines.forEach(function (line) {
              line = line.replace(/ +/g, " ").split(' ');
              if (line.length >= 6) {
                let localip = line[3];
                let localport = '';
                let localaddress = line[3].split('.');
                if (localaddress.length > 1) {
                  localport = localaddress[localaddress.length - 1];
                  localaddress.pop();
                  localip = localaddress.join('.');
                }
                let peerip = line[4];
                let peerport = '';
                let peeraddress = line[4].split('.');
                if (peeraddress.length > 1) {
                  peerport = peeraddress[peeraddress.length - 1];
                  peeraddress.pop();
                  peerip = peeraddress.join('.');
                }
                let connstate = line[5];
                if (connstate) {
                  result.push({
                    protocol: line[0],
                    localaddress: localip,
                    localport: localport,
                    peeraddress: peerip,
                    peerport: peerport,
                    state: connstate
                  })
                }
              }
            });
            if (callback) {
              callback(result)
            }
            resolve(result);
          }
        })
      }
    });
  });
}

exports.networkConnections = networkConnections;

// ----------------------------------------------------------------------------------
// 10. Processes
// ----------------------------------------------------------------------------------

// --------------------------
// PS - current load - in %

function getLoad() {

  return new Promise((resolve) => {
    process.nextTick(() => {
      let result = {};
      let loads = os.loadavg().map(function (x) { return x / _cores; });
      result.avgload = parseFloat((Math.max.apply(Math, loads)).toFixed(2));
      result.currentload = -1;
      result.currentload_user = -1;
      result.currentload_nice = -1;
      result.currentload_system = -1;

      if (_darwin) {
        exec("ps -cax -o pcpu", function (error, stdout) {
          if (!error) {
            let lines = stdout.toString().replace(/,+/g, ".").split('\n');
            lines.shift();
            lines.pop();
            result.currentload = parseFloat(((lines.reduce(function (pv, cv) {
              return pv + parseFloat(cv.trim());
            }, 0)) / _cores).toFixed(2));
          }
          resolve(result);
        });
      }
      if (_linux) {
        exec("cat /proc/stat | grep 'cpu '", function (error, stdout) {
          if (!error) {
            let lines = stdout.toString().split('\n');
            let parts = lines[0].replace(/ +/g, " ").split(' ');
            let user = (parts.length >= 2 ? parseInt(parts[1]) : 0);
            let nice = (parts.length >= 3 ? parseInt(parts[2]) : 0);
            let system = (parts.length >= 4 ? parseInt(parts[3]) : 0);
            let idle = (parts.length >= 5 ? parseInt(parts[4]) : 0);
            let iowait = (parts.length >= 6 ? parseInt(parts[5]) : 0);
            let irq = (parts.length >= 7 ? parseInt(parts[6]) : 0);
            let softirq = (parts.length >= 8 ? parseInt(parts[7]) : 0);
            let steal = (parts.length >= 9 ? parseInt(parts[8]) : 0);
            let guest = (parts.length >= 10 ? parseInt(parts[9]) : 0);
            let guest_nice = (parts.length >= 11 ? parseInt(parts[10]) : 0);
            let all = user + nice + system + idle + iowait + irq + softirq + steal + guest + guest_nice;
            result.currentload = (user + nice + system - _current_cpu.user - _current_cpu.nice - _current_cpu.system) / (all - _current_cpu.all) * 100;

            result.currentload_user = (user - _current_cpu.user) / (all - _current_cpu.all) * 100;
            result.currentload_nice = (nice - _current_cpu.nice) / (all - _current_cpu.all) * 100;
            result.currentload_system = (system - _current_cpu.system) / (all - _current_cpu.all) * 100;
            _current_cpu = {
              user: user,
              nice: nice,
              system: system,
              idle: idle,
              iowait: iowait,
              irq: irq,
              softirq: softirq,
              steal: steal,
              guest: guest,
              guest_nice: guest_nice,
              all: all
            }
          }
          resolve(result);
        });
      }
    });
  });
}

function currentLoad(callback) {

  return new Promise((resolve, reject) => {
    process.nextTick(() => {
      if (_windows) {
        let error = new Error(NOT_SUPPORTED);
        if (callback) { callback(NOT_SUPPORTED) }
        reject(error);
      }

      if (_cores == 0) {
        cores()
          .then(data => {
            _cores = data;
            getLoad().then(result => {
              if (callback) { callback(result) }
              resolve(result);
            })
          })
      } else {
        getLoad().then(result => {
          if (callback) { callback(result) }
          resolve(result);
        })
      }
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

      let result = {};
      if (_linux) {
        if (fs.existsSync('/proc/uptime')) {
          let output = fs.readFileSync('/proc/uptime').toString();
          output = output.replace(/ +/g, " ").split(' ');
          let uptime = parseFloat(output[0]);
          let idletime = parseFloat(output[1]) / _cores;
          result.fullload = (uptime - idletime) / uptime * 100.0;
          resolve(result);
        }
      }
      if (_darwin) {
        result.fullload = 0;
        resolve(result);
      }
    });
  });
}

function fullLoad(callback) {

  return new Promise((resolve, reject) => {
    process.nextTick(() => {
      if (_windows) {
        let error = new Error(NOT_SUPPORTED);
        if (callback) { callback(NOT_SUPPORTED) }
        reject(error);
      }

      if (_cores == 0) {
        cores()
          .then(data => {
            _cores = data;
            getFullLoad().then(result => {
              if (callback) { callback(result) }
              resolve(result);
            })
          })
      } else {
        getFullLoad().then(result => {
          if (callback) { callback(result) }
          resolve(result);
        })
      }
    });
  });
}

exports.fullLoad = fullLoad;

// --------------------------
// PS - services
// pass a comma separated string with services to check (mysql, apache, postgresql, ...)
// this function gives an array back, if the services are running.

function services(srv, callback) {

  // fallback - if only callback is given
  if (isFunction(srv) && !callback) {
    callback = srv;
    srv = '';
  }

  return new Promise((resolve, reject) => {
    process.nextTick(() => {
      if (_windows) {
        let error = new Error(NOT_SUPPORTED);
        if (callback) { callback(NOT_SUPPORTED) }
        reject(error);
      }

      srv = srv.trim().replace(/,+/g, " ").replace(/  +/g, " ").replace(/ +/g, "|");
      var srvs = srv.split('|');
      var comm = (_darwin) ? "ps -caxm -o pcpu,pmem,comm" : "ps axo pcpu,pmem,comm";
      var data = [];
      if (srv != '' && srvs.length > 0) {
        exec(comm + " | grep -v grep | egrep '" + srv + "'", function (error, stdout) {
          if (!error) {
            var lines = stdout.toString().replace(/ +/g, " ").replace(/,+/g, ".").split('\n');
            srvs.forEach(function (srv) {
              var ps = lines.filter(function (e) {
                return e.indexOf(srv) != -1
              });
              data.push({
                'name': srv,
                'running': ps.length > 0,
                'pcpu': parseFloat((ps.reduce(function (pv, cv) {
                  return pv + parseFloat(cv.trim().split(' ')[0]);
                }, 0)).toFixed(2)),
                'pmem': parseFloat((ps.reduce(function (pv, cv) {
                  return pv + parseFloat(cv.trim().split(' ')[1]);
                }, 0)).toFixed(2))
              })
            });
            if (callback) { callback(data) }
            resolve(data);
          } else {
            srvs.forEach(function (srv) {
              data.push({
                'name': srv,
                'running': false,
                'pcpu': 0,
                'pmem': 0
              })
            });
            if (callback) { callback(data) }
            resolve(data);
          }
        });
      } else {
        if (callback) { callback(data) }
        resolve(data);
      }
    });
  });
}

exports.services = services;

// --------------------------
// running processes

function processes(callback) {

  let parsedhead = [];

  function parseHead(head, rights) {
    let space = (rights > 0);
    let count = 1;
    let from = 0;
    let to = 0;
    let result = [];
    for (let i = 0; i < head.length; i++) {
      if (count <= rights) {
        if (head[i] == ' ' && !space) {
          to = i - 1;
          result.push({
            from: from,
            to: to+1,
            cap: head.substring(from, to+1)
          });
          from = to + 2;
          count++;
        }
        space = head[i] == ' ';
      } else {
        if (head[i] != ' ' && space) {
          to = i - 1;
          if (from < to) {
            result.push({
              from: from,
              to: to,
              cap: head.substring(from, to)
            });
          }
          from = to + 1;
          count++;
        }
        space = head[i] == ' ';
      }
    }
    to = 1000;
    result.push({
      from: from,
      to: to,
      cap: head.substring(from, to)
    });
    return result;

  }

  function parseLine(line) {
    let pid = parseInt(line.substring(parsedhead[0].from,parsedhead[0].to));
    let pcpu = parseFloat(line.substring(parsedhead[1].from,parsedhead[1].to).replace(/,/g, "."));
    let pmem = parseFloat(line.substring(parsedhead[2].from,parsedhead[2].to).replace(/,/g, "."));
    let priority = parseInt(line.substring(parsedhead[3].from,parsedhead[3].to));
    let vsz = parseInt(line.substring(parsedhead[4].from,parsedhead[4].to));
    let rss = parseInt(line.substring(parsedhead[5].from,parsedhead[5].to));
    let started = line.substring(parsedhead[6].from,parsedhead[6].to).trim();
    let state = line.substring(parsedhead[7].from,parsedhead[7].to).trim();
    state = (state[0] == 'R' ? 'running': (state[0] == 'S' ? 'sleeping': (state[0] == 'T' ? 'stopped': (state[0] == 'W' ? 'paging': (state[0] == 'X' ? 'dead': (state[0] == 'Z' ? 'zombie': ((state[0] == 'D' || state[0] == 'U') ? 'blocked': 'unknown')))))));
    let tty = line.substring(parsedhead[8].from,parsedhead[8].to).trim();
    if (tty == '?' || tty == '??') tty = '';
    let user = line.substring(parsedhead[9].from,parsedhead[9].to).trim();
    let command = line.substring(parsedhead[10].from,parsedhead[10].to).trim().replace(/\[/g, "").replace(/]/g, "");

    return ({
      pid: pid,
      pcpu: pcpu,
      pmem: pmem,
      priority: priority,
      mem_vsz: vsz,
      mem_rss: rss,
      started: started,
      state: state,
      tty: tty,
      user: user,
      command: command
    })
  }

  function parseProcesses(lines) {
    let result = [];
    if (lines.length > 1) {
      let head = lines[0];
      parsedhead = parseHead(head, 7);
      lines.shift();
      lines.forEach(function (line) {
        if (line.trim() != '') {
          result.push(parseLine(line));
        }
      });
    }
    return result;
  }

  function parseProcStat(line) {
    let parts = line.replace(/ +/g, " ").split(' ');
    let user = (parts.length >= 2 ? parseInt(parts[1]) : 0);
    let nice = (parts.length >= 3 ? parseInt(parts[2]) : 0);
    let system = (parts.length >= 4 ? parseInt(parts[3]) : 0);
    let idle = (parts.length >= 5 ? parseInt(parts[4]) : 0);
    let iowait = (parts.length >= 6 ? parseInt(parts[5]) : 0);
    let irq = (parts.length >= 7 ? parseInt(parts[6]) : 0);
    let softirq = (parts.length >= 8 ? parseInt(parts[7]) : 0);
    let steal = (parts.length >= 9 ? parseInt(parts[8]) : 0);
    let guest = (parts.length >= 10 ? parseInt(parts[9]) : 0);
    let guest_nice = (parts.length >= 11 ? parseInt(parts[10]) : 0);
    return user + nice + system + idle + iowait + irq + softirq + steal + guest + guest_nice;
  }
  function parseProcPidStat(line, all) {
    let parts = line.replace(/ +/g, " ").split(' ');
    if (parts.length >= 17) {
      let pid = parseInt(parts[0]);
      let utime = parseInt(parts[13]);
      let stime = parseInt(parts[14]);
      let cutime = parseInt(parts[15]);
      let cstime = parseInt(parts[16]);

      // calc
      let pcpuu = 0;
      let pcpus = 0;
      if (_process_cpu.all > 0 && _process_cpu.list[pid]) {
        pcpuu = (utime + cutime - _process_cpu.list[pid].utime - _process_cpu.list[pid].cutime) / (all - _process_cpu.all) * 100; // user
        pcpus = (stime + cstime - _process_cpu.list[pid].stime - _process_cpu.list[pid].cstime) / (all - _process_cpu.all) * 100; // system
      } else {
        pcpuu = (utime + cutime) / (all) * 100; // user
        pcpus = (stime + cstime) / (all) * 100; // system
      }
      return {
        pid: pid,
        utime: utime,
        stime: stime,
        cutime: cutime,
        cstime: cstime,
        pcpuu: pcpuu,
        pcpus: pcpus
      }
    } else {
      return {
        pid: 0,
        utime: 0,
        stime: 0,
        cutime: 0,
        cstime: 0,
        pcpuu: 0,
        pcpus: 0
      }
    }
  }

  return new Promise((resolve, reject) => {
    process.nextTick(() => {
      if (_windows) {
        let error = new Error(NOT_SUPPORTED);
        if (callback) { callback(NOT_SUPPORTED) }
        reject(error);
      }
      let result = {
        all: 0,
        running: 0,
        blocked: 0,
        sleeping: 0,
        list: []
      };

      let cmd = "";
      if (_linux) cmd = "ps axo pid:10,pcpu:6,pmem:6,pri:5,vsz:10,rss:10,start:20,state:20,tty:20,user:20,command";
      if (_darwin) cmd = "ps acxo pid,pcpu,pmem,pri,vsz,rss,start,state,tty,user,command -r";
      exec(cmd, function (error, stdout) {
        if (!error) {
          result.list = parseProcesses(stdout.toString().split('\n'));
          result.all = result.list.length;
          result.running = result.list.filter(function (e) {
            return e.state == 'running'
          }).length;
          result.blocked = result.list.filter(function (e) {
            return e.state == 'blocked'
          }).length;
          result.sleeping = result.list.filter(function (e) {
            return e.state == 'sleeping'
          }).length;

          if (_linux) {
            // calc process_cpu - ps is not accurate in linux!
            cmd = "cat /proc/stat | grep 'cpu '";
            for (let i=0; i< result.list.length; i++) {
              cmd += (';cat /proc/' + result.list[i].pid + '/stat')
            }
            exec(cmd, function (error, stdout) {
              let curr_processes = stdout.toString().split('\n');

              // first line (all - /proc/stat)
              let all = parseProcStat(curr_processes.shift());

              // process
              let list_new = {};
              let resultProcess = {};
              for (let i=0; i< curr_processes.length; i++) {
                resultProcess = parseProcPidStat(curr_processes[i], all);

                if (resultProcess.pid) {

                  // store pcpu in outer array
                  let listPos = result.list.map(function(e) { return e.pid; }).indexOf(resultProcess.pid);
                  if (listPos >= 0) {
                    result.list[listPos].pcpu = resultProcess.pcpuu + resultProcess.pcpus
                  }

                  // save new values
                  list_new[resultProcess.pid] = {
                    pcpuu: resultProcess.pcpuu,
                    pcpus: resultProcess.pcpus,
                    utime: resultProcess.utime,
                    stime: resultProcess.stime,
                    cutime: resultProcess.cutime,
                    cstime: resultProcess.cstime
                  }
                }
              }

              // store old values
              _process_cpu.all = all;
              _process_cpu.list = list_new;
              _process_cpu.ms = Date.now() - _process_cpu.ms;
              if (callback) { callback(result) }
              resolve(result);
            })
          } else {
            if (callback) { callback(result) }
            resolve(result);
          }
        }
      });
    });
  });
}

exports.processes = processes;

// --------------------------
// PS - process load
// get detailed information about a certain process
// (PID, CPU-Usage %, Mem-Usage %)

function processLoad(proc, callback) {

  // fallback - if only callback is given
  if (isFunction(proc) && !callback) {
    callback = proc;
    proc = '';
  }

  return new Promise((resolve, reject) => {
    process.nextTick(() => {
      if (_windows) {
        let error = new Error(NOT_SUPPORTED);
        if (callback) { callback(NOT_SUPPORTED) }
        reject(error);
      }

      var result = {
        'proc': proc,
        'pid': -1,
        'cpu': 0,
        'mem': 0
      };

      if (proc) {
        exec("ps aux | grep " + proc + " | grep -v grep", function (error, stdout) {
          if (!error) {
            let data = stdout.replace(/ +/g, " ").split(' ');

            if (data.length > 2) {
              result = {
                'proc': proc,
                'pid': data[1],
                'cpu': parseFloat(data[2].replace(',', '.')),
                'mem': parseFloat(data[3].replace(',', '.'))
              }
            }
          }
          if (callback) { callback(result) }
          resolve(result);
        });
      } else {
        if (callback) { callback(result) }
        resolve(result);
      }
    });
  });
}

exports.processLoad = processLoad;

// ----------------------------------------------------------------------------------
// 11. Users/Sessions
// ----------------------------------------------------------------------------------

// --------------------------
// array of users online = sessions

function parseUsers1(lines) {
  var result = [];
  var result_who = [];
  var result_w = {};
  var w_first = true;
  var w_header = [];
  var w_pos = [];
  var w_headerline = '';
  var who_line = {};

  var is_whopart = true;
  lines.forEach(function (line) {
    if (line == '---') {
      is_whopart = false;
    } else {
      var l = line.replace(/ +/g, " ").split(' ');

      // who part
      if (is_whopart) {
        result_who.push({
          user: l[0],
          tty: l[1],
          date: l[2],
          time: l[3],
          ip: (l && l.length > 4) ? l[4].replace(/\(/g, "").replace(/\)/g, "") : ''
        })
      } else {
        // w part
        if (w_first) {    // header
          w_header = l;
          w_headerline = line;
          w_header.forEach(function(item) {
            w_pos.push(line.indexOf(item))
          });
          w_first = false;
        } else {
          // split by w_pos
          result_w.user = line.substring(w_pos[0], w_pos[1]-1).trim();
          result_w.tty = line.substring(w_pos[1], w_pos[2]-1).trim();
          result_w.ip = line.substring(w_pos[2], w_pos[3]-1).replace(/\(/g, "").replace(/\)/g, "").trim();
          result_w.command = line.substring(w_pos[7], 1000).trim();
          // find corresponding 'who' line
          who_line = result_who.filter(function(obj) {
            return (obj.user.substring(0,8).trim() == result_w.user && obj.tty == result_w.tty)
          });
          if (who_line.length == 1) {
            result.push({
              user: who_line[0].user,
              tty: who_line[0].tty,
              date: who_line[0].date,
              time: who_line[0].time,
              ip: who_line[0].ip,
              command: result_w.command
            })
          }
        }
      }
    }
  });
  return result;
}

function parseUsers2(lines) {
  var result = [];
  var result_who = [];
  var result_w = {};
  var who_line = {};

  var is_whopart = true;
  lines.forEach(function (line) {
    if (line == '---') {
      is_whopart = false;
    } else {
      var l = line.replace(/ +/g, " ").split(' ');

      // who part
      if (is_whopart) {
        result_who.push({
          user: l[0],
          tty: l[1],
          date: ("" + new Date().getFullYear()) + '-' + ("0" + ("JANFEBMARAPRMAYJUNJULAUGSEPOCTNOVDEC".indexOf(l[2].toUpperCase()) / 3 + 1)).slice(-2) + '-' + ("0" + l[3]).slice(-2),
          time: l[4],
        })
      } else {
        // w part
        // split by w_pos
        result_w.user = l[0];
        result_w.tty = l[1];
        result_w.ip = (l[2] != '-') ? l[2] : '';
        result_w.command = l.slice(5, 1000).join(' ');
        // find corresponding 'who' line
        who_line = result_who.filter(function(obj) {
          return (obj.user == result_w.user && (obj.tty.substring(3,1000) == result_w.tty || obj.tty == result_w.tty))
        });
        if (who_line.length == 1) {
          result.push({
            user: who_line[0].user,
            tty: who_line[0].tty,
            date: who_line[0].date,
            time: who_line[0].time,
            ip: result_w.ip,
            command: result_w.command
          })
        }
      }
    }
  });
  return result;
}

function users(callback) {

  return new Promise((resolve, reject) => {
    process.nextTick(() => {
      if (_windows) {
        let error = new Error(NOT_SUPPORTED);
        if (callback) { callback(NOT_SUPPORTED) }
        reject(error);
      }

      var result = [];

      // linux
      if (_linux) {
        exec("who --ips; echo '---'; w | tail -n +2", function (error, stdout) {
          if (!error) {
            // lines / split
            var lines = stdout.toString().split('\n');
            result = parseUsers1(lines);
            if (result.length == 0) {
              exec("who; echo '---'; w | tail -n +2", function (error, stdout) {
                if (!error) {
                  // lines / split
                  lines = stdout.toString().split('\n');
                  result = parseUsers1(lines);
                  if (callback) { callback(result) }
                  resolve(result);
                } else {
                  if (callback) { callback(result) }
                  resolve(result);
                }
              });
            } else {
              if (callback) { callback(result) }
              resolve(result);
            }
          } else {
            if (callback) { callback(result) }
            resolve(result);
          }
        });
      }

      if (_darwin) {
        exec("who; echo '---'; w -ih", function (error, stdout) {
          if (!error) {
            // lines / split
            var lines = stdout.toString().split('\n');
            result = parseUsers2(lines);

            if (callback) { callback(result) }
            resolve(result);
          } else {
            if (callback) { callback(result) }
            resolve(result);
          }
        });
      }


    });
  });
}

exports.users = users;

// ----------------------------------------------------------------------------------
// 12. Internet
// ----------------------------------------------------------------------------------

// --------------------------
// check if external site is available

function inetChecksite(url, callback) {

  return new Promise((resolve, reject) => {
    process.nextTick(() => {
      if (_windows) {
        let error = new Error(NOT_SUPPORTED);
        if (callback) { callback(NOT_SUPPORTED) }
        reject(error);
      }

      var result = {
        url: url,
        ok: false,
        status: 404,
        ms: -1
      };
      if (url) {
        var t = Date.now();
        let args = " -I --connect-timeout 5 -m 5 " + url + " 2>/dev/null | head -n 1 | cut -d ' ' -f2";
        let cmd = "curl";
        exec(cmd + args, function (error, stdout) {
          let statusCode = parseInt(stdout.toString());
          result.status = statusCode || 404;
          result.ok = !error && (statusCode == 200 || statusCode == 301 || statusCode == 302 || statusCode == 304);
          result.ms = (result.ok ? Date.now() - t : -1);
          if (callback) { callback(result) }
          resolve(result);
        })
      } else {
        if (callback) { callback(result) }
        resolve(result);
      }
    });
  });
}

exports.inetChecksite = inetChecksite;

// --------------------------
// check inet latency

function inetLatency(host, callback) {

  // fallback - if only callback is given
  if (isFunction(host) && !callback) {
    callback = host;
    host = '';
  }

  host = host || '8.8.8.8';

  return new Promise((resolve, reject) => {
    process.nextTick(() => {
      if (_windows) {
        let error = new Error(NOT_SUPPORTED);
        if (callback) { callback(NOT_SUPPORTED) }
        reject(error);
      }

      var t = Date.now();
      let cmd;
      if (_linux) {
        cmd = "ping -c 2 -w 3 " + host + " | grep rtt | cut -d'/' -f4 | awk '{ print $3 }'";
      }
      if (_darwin) {
        cmd = "ping -c 2 -t 3 " + host + " | grep avg | cut -d'/' -f4 | awk '{ print $3 }'";
      }

      exec(cmd, function (error, stdout) {
        let result = -1;
        if (!error) {
          result = parseFloat(stdout.toString());
        }
        if (callback) { callback(result) }
        resolve(result);
      })
    });
  });
}

exports.inetLatency = inetLatency;

// ----------------------------------------------------------------------------------
// 13. Docker
// ----------------------------------------------------------------------------------

// --------------------------
// get containers (parameter all: get also inactive/exited containers)

function dockerContainers(all, callback) {

  function inContainers(containers, id) {
    let filtered = containers.filter(obj => {
      /**
       * @namespace
       * @property {string}  Id
       */
      return (obj.Id && (obj.Id == id))
    });
    return (filtered.length > 0);
  }
  // fallback - if only callback is given
  if (isFunction(all) && !callback) {
    callback = all;
    all = false;
  }

  all = all || false;
  var result = [];
  return new Promise((resolve, reject) => {
    process.nextTick(() => {
      if (_windows) {
        let error = new Error(NOT_SUPPORTED);
        if (callback) { callback(NOT_SUPPORTED) }
        reject(error);
      }
      let cmd = "curl --unix-socket /var/run/docker.sock http:/containers/json" + (all ? "?all=1": "");
      exec(cmd, function (error, stdout) {
        if (!error) {
          try {
            let jsonString = stdout.toString();
            var docker_containers = JSON.parse(jsonString);
            if (docker_containers && Object.prototype.toString.call(docker_containers) === '[object Array]' && docker_containers.length > 0) {
              docker_containers.forEach(function (element) {
                /**
                 * @namespace
                 * @property {string}  Id
                 * @property {string}  Name
                 * @property {string}  Image
                 * @property {string}  ImageID
                 * @property {string}  Command
                 * @property {number}  Created
                 * @property {string}  State
                 * @property {Array}  Names
                 * @property {Array}  Ports
                 * @property {Array}  Mounts
                 */

                if (element.Names && Object.prototype.toString.call(element.Names) === '[object Array]' && element.Names.length > 0) {
                  element.Name = element.Names[0].replace(/^\/|\/$/g, '');
                }
                result.push({
                  id: element.Id,
                  name: element.Name,
                  image: element.Image,
                  imageID: element.ImageID,
                  command: element.Command,
                  created: element.Created,
                  state: element.State,
                  ports: element.Ports,
                  mounts: element.Mounts,
                  // hostconfig: element.HostConfig,
                  // network: element.NetworkSettings
                })
              });
            }
          } catch (err) {
          }
        }

        // GC in _docker_container_stats
        for (var key in _docker_container_stats) {
          if (_docker_container_stats.hasOwnProperty(key)) {
            if (!inContainers(docker_containers, key)) delete _docker_container_stats[key];
          }
        }
        if (callback) { callback(result) }
        resolve(result);
      });
    });
  });
}

exports.dockerContainers = dockerContainers;

// --------------------------
// helper functions for calculation of docker stats

function docker_calcCPUPercent(cpu_stats, id) {
  /**
   * @namespace
   * @property {object}  cpu_usage
   * @property {number}  cpu_usage.total_usage
   * @property {number}  system_cpu_usage
   * @property {object}  cpu_usage
   * @property {Array}  cpu_usage.percpu_usage
   */

  var cpuPercent = 0.0;
  // calculate the change for the cpu usage of the container in between readings
  var cpuDelta = cpu_stats.cpu_usage.total_usage - (_docker_container_stats[id] && _docker_container_stats[id].prev_CPU ? _docker_container_stats[id].prev_CPU : 0);
  // calculate the change for the entire system between readings
  var systemDelta = cpu_stats.system_cpu_usage - (_docker_container_stats[id] && _docker_container_stats[id].prev_system ? _docker_container_stats[id].prev_system : 0);

  if (systemDelta > 0.0 && cpuDelta > 0.0) {
    cpuPercent = (cpuDelta / systemDelta) * cpu_stats.cpu_usage.percpu_usage.length * 100.0;
  }
  if (!_docker_container_stats[id]) _docker_container_stats[id] = {};
  _docker_container_stats[id].prev_CPU = cpu_stats.cpu_usage.total_usage;
  _docker_container_stats[id].prev_system = cpu_stats.system_cpu_usage;

  return cpuPercent
}

function docker_calcNetworkIO(networks) {
  var rx;
  var tx;
  for (var key in networks) {
    // skip loop if the property is from prototype
    if (!networks.hasOwnProperty(key)) continue;

    /**
     * @namespace
     * @property {number}  rx_bytes
     * @property {number}  tx_bytes
     */
    var obj = networks[key];
    rx =+ obj.rx_bytes;
    tx =+ obj.tx_bytes;
  }
  return {
    rx: rx,
    tx: tx
  }
}

function docker_calcBlockIO(blkio_stats) {
  let result = {
    r: 0,
    w: 0
  };

  /**
   * @namespace
   * @property {Array}  io_service_bytes_recursive
   */
  if (blkio_stats && blkio_stats.io_service_bytes_recursive && Object.prototype.toString.call( blkio_stats.io_service_bytes_recursive ) === '[object Array]' && blkio_stats.io_service_bytes_recursive.length > 0) {
    blkio_stats.io_service_bytes_recursive.forEach( function(element) {
      /**
       * @namespace
       * @property {string}  op
       * @property {number}  value
       */

      if (element.op && element.op.toLowerCase() == 'read' && element.value) {
        result.r += element.value;
      }
      if (element.op && element.op.toLowerCase() == 'write' && element.value) {
        result.w += element.value;
      }
    })
  }
  return result;
}

// --------------------------
// container Stats (for one container)

function dockerContainerStats(containerID, callback) {
  containerID = containerID || '';
  var result = {
    id: containerID,
    mem_usage: 0,
    mem_limit: 0,
    mem_percent: 0,
    cpu_percent: 0,
    pids: 0,
    netIO: {
      rx: 0,
      wx: 0
    },
    blockIO: {
      r: 0,
      w: 0
    }
  };
  return new Promise((resolve, reject) => {
    process.nextTick(() => {
      if (_windows) {
        let error = new Error(NOT_SUPPORTED);
        if (callback) { callback(NOT_SUPPORTED) }
        reject(error);
      }
      if (containerID) {
        let cmd = "curl --unix-socket /var/run/docker.sock http:/containers/" + containerID + "/stats?stream=0";
        exec(cmd, function (error, stdout) {
          if (!error) {
            let jsonString = stdout.toString();
            try {
              let stats = JSON.parse(jsonString);
              /**
               * @namespace
               * @property {Object}  memory_stats
               * @property {number}  memory_stats.usage
               * @property {number}  memory_stats.limit
               * @property {Object}  cpu_stats
               * @property {Object}  pids_stats
               * @property {number}  pids_stats.current
               * @property {Object}  networks
               * @property {Object}  blkio_stats
               */

              if (!stats.message) {
                result.mem_usage = (stats.memory_stats && stats.memory_stats.usage ? stats.memory_stats.usage : 0);
                result.mem_limit = (stats.memory_stats && stats.memory_stats.limit ? stats.memory_stats.limit : 0);
                result.mem_percent = (stats.memory_stats && stats.memory_stats.usage && stats.memory_stats.limit ? stats.memory_stats.usage / stats.memory_stats.limit * 100.0 : 0);
                result.cpu_percent = (stats.cpu_stats ? docker_calcCPUPercent(stats.cpu_stats, containerID) : 0);
                result.pids = (stats.pids_stats && stats.pids_stats.current ? stats.pids_stats.current : 0);
                if (stats.networks)  result.netIO = docker_calcNetworkIO(stats.networks);
                if (stats.blkio_stats)result.blockIO = docker_calcBlockIO(stats.blkio_stats);
              }
            } catch (err) {
            }
          }
          if (callback) { callback(result) }
          resolve(result);
        });
      } else {
        if (callback) { callback(result) }
        resolve(result);
      }
    });
  });
}

exports.dockerContainerStats = dockerContainerStats;

function dockerAll(callback) {
  return new Promise((resolve, reject) => {
    process.nextTick(() => {
      if (_windows) {
        let error = new Error(NOT_SUPPORTED);
        if (callback) { callback(NOT_SUPPORTED) }
        reject(error);
      }
      dockerContainers(true).then(result => {
        if (result && Object.prototype.toString.call( result ) === '[object Array]' && result.length > 0) {
          var l = result.length;
          result.forEach( function(element) {
            dockerContainerStats(element.id).then(res => {
              // include stats in array
              element.mem_usage = res.mem_usage;
              element.mem_limit = res.mem_limit;
              element.mem_percent = res.mem_percent;
              element.cpu_percent = res.cpu_percent;
              element.pids = res.pids;
              element.netIO = res.netIO;
              element.blockIO = res.blockIO;

              // all done??
              l -= 1;
              if (l == 0) {
                if (callback) { callback(result) }
                resolve(result);
              }
            })
          })
        } else {
          if (callback) { callback(result) }
          resolve(result);
        }
      })
    });
  });
}

exports.dockerAll = dockerAll;

// ----------------------------------------------------------------------------------
// 14. get all
// ----------------------------------------------------------------------------------

// --------------------------
// get static data - they should not change until restarted

function getStaticData(callback) {

  return new Promise((resolve, reject) => {
    process.nextTick(() => {
      if (_windows) {
        let error = new Error(NOT_SUPPORTED);
        if (callback) { callback(NOT_SUPPORTED) }
        reject(error);
      }

      var data = {};

      data.version = version();

      system().then(res => {
        data.system = res;
        osInfo().then(res => {
          data.os = res;
          cpu().then(res => {
            data.cpu = res;
            graphics().then(res => {
              data.graphics = res;
              networkInterfaces().then(res => {
                data.net = res;
                if (callback) { callback(data) }
                resolve(data);
              })
            })
          })
        })
      })
    });
  });
}

exports.getStaticData = getStaticData;

// --------------------------
// get all dynamic data - e.g. for monitoring agents
// may take some seconds to get all data
// --------------------------
// 2 additional parameters needed
// - srv: 		comma separated list of services to monitor e.g. "mysql, apache, postgresql"
// - iface:	define network interface for which you like to monitor network speed e.g. "eth0"

function getDynamicData(srv, iface, callback) {

  if (isFunction(iface)) {
    callback = iface;
    iface = '';
  }
  if (isFunction(srv)) {
    callback = srv;
    srv = '';
  }

  return new Promise((resolve, reject) => {
    process.nextTick(() => {
      if (_windows) {
        let error = new Error(NOT_SUPPORTED);
        if (callback) { callback(NOT_SUPPORTED) }
        reject(error);
      }

      iface = iface || getDefaultNetworkInterface();
      srv = srv || '';

      // use closure to track ƒ completion
      var functionProcessed = (function () {
        var totalFunctions = 14;

        return function () {
          if (--totalFunctions === 0) {
            if (callback) { callback(data) }
            resolve(data);
          }
        };
      })();

      // var totalFunctions = 14;
      // function functionProcessed() {
      //   if (--totalFunctions === 0) {
      //     if (callback) { callback(data) }
      //     resolve(data);
      //   }
      // }

      var data = {};

      // get time
      data.time = time();

      /**
       * @namespace
       * @property {Object}  versions
       * @property {string}  versions.node
       * @property {string}  versions.v8
       */
      data.node = process.versions.node;
      data.v8 = process.versions.v8;

      cpuCurrentspeed().then(res => {
        data.cpuCurrentspeed = res;
        functionProcessed();
      });

      users().then(res => {
        data.users = res;
        functionProcessed();
      });

      processes().then(res => {
        data.processes = res;
        functionProcessed();
      });

      currentLoad().then(res => {
        data.currentLoad = res;
        functionProcessed();
      });

      cpuTemperature().then(res => {
        data.temp = res;
        functionProcessed();
      });

      networkStats(iface).then(res => {
        data.networkStats = res;
        functionProcessed();
      });

      networkConnections().then(res => {
        data.networkConnections = res;
        functionProcessed();
      });

      mem().then(res => {
        data.mem = res;
        functionProcessed();
      });

      battery().then(res => {
        data.battery = res;
        functionProcessed();
      });

      services(srv).then(res => {
        data.services = res;
        functionProcessed();
      });

      fsSize().then(res => {
        data.fsSize = res;
        functionProcessed();
      });

      fsStats().then(res => {
        data.fsStats = res;
        functionProcessed();
      });

      disksIO().then(res => {
        data.disksIO = res;
        functionProcessed();
      });

      inetLatency().then(res => {
        data.inetLatency = res;
        functionProcessed();
      });
    });
  });
}

exports.getDynamicData = getDynamicData;

// --------------------------
// get all data at once
// --------------------------
// 2 additional parameters needed
// - srv: 		comma separated list of services to monitor e.g. "mysql, apache, postgresql"
// - iface:	define network interface for which you like to monitor network speed e.g. "eth0"

function getAllData(srv, iface, callback) {

  return new Promise((resolve, reject) => {
    process.nextTick(() => {
      if (_windows) {
        let error = new Error(NOT_SUPPORTED);
        if (callback) { callback(NOT_SUPPORTED) }
        reject(error);
      }

      var data = {};

      getStaticData().then(res => {
        data = res;
        getDynamicData(srv, iface).then(res => {
          for (var key in res) {
            if (res.hasOwnProperty(key)) {
              data[key] = res[key];
            }
          }
          if (callback) { callback(data) }
          resolve(data);
        });
      })
    });
  });
}

exports.getAllData = getAllData;
