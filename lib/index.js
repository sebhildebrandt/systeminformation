// @ts-check
// ==================================================================================
// index.js
// ----------------------------------------------------------------------------------
// Description:   System Information - library
//                for Node.js
// Copyright:     (c) 2014 - 2022
// Author:        Sebastian Hildebrandt
// ----------------------------------------------------------------------------------
// Contributors:  Guillaume Legrain (https://github.com/glegrain)
//                Riccardo Novaglia (https://github.com/richy24)
//                Quentin Busuttil (https://github.com/Buzut)
//                Lapsio (https://github.com/lapsio)
//                csy (https://github.com/csy1983)
// ----------------------------------------------------------------------------------
// License:       MIT
// ==================================================================================
// ----------------------------------------------------------------------------------
// Dependencies
// ----------------------------------------------------------------------------------
import pkg from '../package.json';
import * as util from './util.js';
import * as system from './system.js';
import * as osInfo from './osinfo.js';
import * as cpu from './cpu.js';
import * as memory from './memory.js';
import {battery} from './battery.js';
import * as graphics from './graphics.js';
import * as filesystem from './filesystem.js';
import * as network from './network.js';
import * as wifi from './wifi.js';
import * as processes from './processes.js';
import * as users from './users.js';
import * as internet from './internet.js';

export * from './util.js';
export * from './system.js';
export * from './osinfo.js';
export * from './cpu.js';
export * from './memory.js';
export * from './battery.js';
export * from './graphics.js';
export * from './filesystem.js';
export * from './network.js';
export * from './wifi.js';
export * from './processes.js';
export * from './users.js';
export * from './internet.js';
export * from './docker.js';
export * from './virtualbox.js';
export * from './printer.js';
export * from './usb.js';
export * from './audio.js';
export * from './bluetooth.js';

const lib_version = pkg.version;
let _platform = process.platform;
const _windows = _platform === 'win32';
const _freebsd = _platform === 'freebsd';
const _openbsd = _platform === 'openbsd';
const _netbsd = _platform === 'netbsd';
const _sunos = _platform === 'sunos';
// ----------------------------------------------------------------------------------
// init
// ----------------------------------------------------------------------------------
if (_windows) {
  util.getCodepage();
}
// ----------------------------------------------------------------------------------
// General
// ----------------------------------------------------------------------------------
export function version() {
  return lib_version;
}
// ----------------------------------------------------------------------------------
// Get static and dynamic data (all)
// ----------------------------------------------------------------------------------
// --------------------------
// get static data - they should not change until restarted
export function getStaticData(callback) {
  return new Promise((resolve) => {
    process.nextTick(() => {
      let data = {};
      data.version = version();
      Promise.all([
        system.system(),
        system.bios(),
        system.baseboard(),
        system.chassis(),
        osInfo.osInfo(),
        osInfo.uuid(),
        osInfo.versions(),
        cpu.cpu(),
        cpu.cpuFlags(),
        graphics.graphics(),
        network.networkInterfaces(),
        memory.memLayout(),
        filesystem.diskLayout(),
      ]).then((res) => {
        data.system = res[0];
        data.bios = res[1];
        data.baseboard = res[2];
        data.chassis = res[3];
        data.os = res[4];
        data.uuid = res[5];
        data.versions = res[6];
        data.cpu = res[7];
        data.cpu.flags = res[8];
        data.graphics = res[9];
        data.net = res[10];
        data.memLayout = res[11];
        data.diskLayout = res[12];
        if (callback) {
          callback(data);
        }
        resolve(data);
      });
    });
  });
}
// --------------------------
// get all dynamic data - e.g. for monitoring agents
// may take some seconds to get all data
// --------------------------
// 2 additional parameters needed
// - srv: 		comma separated list of services to monitor e.g. "mysql, apache, postgresql"
// - iface:	define network interface for which you like to monitor network speed e.g. "eth0"
export function getDynamicData(srv, iface, callback) {
  if (util.isFunction(iface)) {
    callback = iface;
    iface = '';
  }
  if (util.isFunction(srv)) {
    callback = srv;
    srv = '';
  }
  return new Promise((resolve) => {
    process.nextTick(() => {
      iface = iface || network.getDefaultNetworkInterface();
      srv = srv || '';
      // use closure to track ƒ completion
      let functionProcessed = (function () {
        let totalFunctions = 15;
        if (_windows) {
          totalFunctions = 13;
        }
        if (_freebsd || _openbsd || _netbsd) {
          totalFunctions = 11;
        }
        if (_sunos) {
          totalFunctions = 6;
        }
        return function () {
          if (--totalFunctions === 0) {
            if (callback) {
              callback(data);
            }
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
      let data = {};
      // get time
      data.time = osInfo.time();
      /**
       * @namespace
       * @property {Object}  versions
       * @property {string}  versions.node
       * @property {string}  versions.v8
       */
      data.node = process.versions.node;
      data.v8 = process.versions.v8;
      cpu.cpuCurrentSpeed().then((res) => {
        data.cpuCurrentSpeed = res;
        functionProcessed();
      });
      users.users().then((res) => {
        data.users = res;
        functionProcessed();
      });
      processes.processes().then((res) => {
        data.processes = res;
        functionProcessed();
      });
      cpu.currentLoad().then((res) => {
        data.currentLoad = res;
        functionProcessed();
      });
      if (!_sunos) {
        cpu.cpuTemperature().then((res) => {
          data.temp = res;
          functionProcessed();
        });
      }
      if (!_openbsd && !_freebsd && !_netbsd && !_sunos) {
        network.networkStats(iface).then((res) => {
          data.networkStats = res;
          functionProcessed();
        });
      }
      if (!_sunos) {
        network.networkConnections().then((res) => {
          data.networkConnections = res;
          functionProcessed();
        });
      }
      memory.mem().then((res) => {
        data.mem = res;
        functionProcessed();
      });
      if (!_sunos) {
        battery().then((res) => {
          data.battery = res;
          functionProcessed();
        });
      }
      if (!_sunos) {
        processes.services(srv).then((res) => {
          data.services = res;
          functionProcessed();
        });
      }
      if (!_sunos) {
        filesystem.fsSize().then((res) => {
          data.fsSize = res;
          functionProcessed();
        });
      }
      if (!_windows && !_openbsd && !_freebsd && !_netbsd && !_sunos) {
        filesystem.fsStats().then((res) => {
          data.fsStats = res;
          functionProcessed();
        });
      }
      if (!_windows && !_openbsd && !_freebsd && !_netbsd && !_sunos) {
        filesystem.disksIO().then((res) => {
          data.disksIO = res;
          functionProcessed();
        });
      }
      if (!_openbsd && !_freebsd && !_netbsd && !_sunos) {
        wifi.wifiNetworks().then((res) => {
          data.wifiNetworks = res;
          functionProcessed();
        });
      }
      internet.inetLatency().then((res) => {
        data.inetLatency = res;
        functionProcessed();
      });
    });
  });
}
// --------------------------
// get all data at once
// --------------------------
// 2 additional parameters needed
// - srv: 		comma separated list of services to monitor e.g. "mysql, apache, postgresql"
// - iface:	define network interface for which you like to monitor network speed e.g. "eth0"
export function getAllData(srv, iface, callback) {
  return new Promise((resolve) => {
    process.nextTick(() => {
      let data = {};
      if (iface && util.isFunction(iface) && !callback) {
        callback = iface;
        iface = '';
      }
      if (srv && util.isFunction(srv) && !iface && !callback) {
        callback = srv;
        srv = '';
        iface = '';
      }
      getStaticData().then((res) => {
        data = res;
        getDynamicData(srv, iface).then((res) => {
          for (let key in res) {
            if ({}.hasOwnProperty.call(res, key)) {
              data[key] = res[key];
            }
          }
          if (callback) {
            callback(data);
          }
          resolve(data);
        });
      });
    });
  });
}
export function get(valueObject, callback) {
  return new Promise((resolve) => {
    process.nextTick(() => {
      const allPromises = Object.keys(valueObject)
        .filter((func) => ({}.hasOwnProperty.call(exports, func)))
        .map((func) => {
          const params = valueObject[func].substring(
            valueObject[func].lastIndexOf('(') + 1,
            valueObject[func].lastIndexOf(')')
          );
          let funcWithoutParams =
            func.indexOf(')') >= 0 ? func.split(')')[1].trim() : func;
          funcWithoutParams =
            func.indexOf('|') >= 0
              ? func.split('|')[0].trim()
              : funcWithoutParams;
          if (params) {
            return exports[funcWithoutParams](params);
          } else {
            return exports[funcWithoutParams]('');
          }
        });
      Promise.all(allPromises).then((data) => {
        const result = {};
        let i = 0;
        for (let key in valueObject) {
          if (
            {}.hasOwnProperty.call(valueObject, key) &&
            {}.hasOwnProperty.call(exports, key) &&
            data.length > i
          ) {
            if (valueObject[key] === '*' || valueObject[key] === 'all') {
              result[key] = data[i];
            } else {
              let keys = valueObject[key];
              // let params = '';
              let filter = '';
              let filterParts = [];
              // remove params
              if (keys.indexOf(')') >= 0) {
                keys = keys.split(')')[1].trim();
              }
              // extract filter and remove it from keys
              if (keys.indexOf('|') >= 0) {
                filter = keys.split('|')[1].trim();
                filterParts = filter.split(':');
                keys = keys.split('|')[0].trim();
              }
              keys = keys.replace(/,/g, ' ').replace(/ +/g, ' ').split(' ');
              if (data[i]) {
                if (Array.isArray(data[i])) {
                  // result is in an array, go through all elements of array and pick only the right ones
                  const partialArray = [];
                  data[i].forEach((element) => {
                    let partialRes = {};
                    if (
                      keys.length === 1 &&
                      (keys[0] === '*' || keys[0] === 'all')
                    ) {
                      partialRes = element;
                    } else {
                      keys.forEach((k) => {
                        if ({}.hasOwnProperty.call(element, k)) {
                          partialRes[k] = element[k];
                        }
                      });
                    }
                    // if there is a filter, then just take those elements
                    if (filter && filterParts.length === 2) {
                      if (
                        {}.hasOwnProperty.call(
                          partialRes,
                          filterParts[0].trim()
                        )
                      ) {
                        const val = partialRes[filterParts[0].trim()];
                        if (typeof val == 'number') {
                          if (val === parseFloat(filterParts[1].trim())) {
                            partialArray.push(partialRes);
                          }
                        } else if (typeof val == 'string') {
                          if (
                            val.toLowerCase() ===
                            filterParts[1].trim().toLowerCase()
                          ) {
                            partialArray.push(partialRes);
                          }
                        }
                      }
                    } else {
                      partialArray.push(partialRes);
                    }
                  });
                  result[key] = partialArray;
                } else {
                  const partialRes = {};
                  keys.forEach((k) => {
                    if ({}.hasOwnProperty.call(data[i], k)) {
                      partialRes[k] = data[i][k];
                    }
                  });
                  result[key] = partialRes;
                }
              } else {
                result[key] = {};
              }
            }
            i++;
          }
        }
        if (callback) {
          callback(result);
        }
        resolve(result);
      });
    });
  });
}
export function observe(valueObject, interval, callback) {
  let _data = null;
  const result = setInterval(() => {
    get(valueObject).then((data) => {
      if (JSON.stringify(_data) !== JSON.stringify(data)) {
        _data = Object.assign({}, data);
        callback(data);
      }
    });
  }, interval);
  return result;
}
