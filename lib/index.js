'use strict';
// ==================================================================================
// index.js
// ----------------------------------------------------------------------------------
// Description:   System Information - library
//                for Node.js
// Copyright:     (c) 2014 - 2018
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
// return promises. You can use them like before with callbacks OR with promises
// (see example in this documentation). I am sure, there is for sure room for improvement.
// I was only able to test it on several Debian, Raspbian, Ubuntu distributions as well as
// OS X (Mavericks, Yosemite, El Captain) and some Windows machines.
// Since version 2 nearly all functionality is available for OS X/Darwin platforms.
// In Version 3 I started to add (limited!) windows support.
//
// Comments, suggestions & reports are very welcome!
//
// ==================================================================================

// ----------------------------------------------------------------------------------
// Dependencies
// ----------------------------------------------------------------------------------

const os = require('os');

const lib_version = require('../package.json').version;
const util = require('./util');
const system = require('./system');
const osInfo = require('./osinfo');
const cpu = require('./cpu');
const memory = require('./memory');
const battery = require('./battery');
const graphics = require('./graphics');
const filesystem = require('./filesystem');
const network = require('./network');
const processes = require('./processes');
const users = require('./users');
const internet = require('./internet');
const docker = require('./docker');

let _platform = os.type();
let _windows = (_platform === 'Windows_NT');

// ----------------------------------------------------------------------------------
// 1. General
// ----------------------------------------------------------------------------------

function version() {
  return lib_version;
}

// ----------------------------------------------------------------------------------
// 14. get all
// ----------------------------------------------------------------------------------

// --------------------------
// get static data - they should not change until restarted

function getStaticData(callback) {

  return new Promise((resolve) => {
    process.nextTick(() => {

      let data = {};

      data.version = version();

      Promise.all([
        system.system(),
        system.bios(),
        system.baseboard(),
        osInfo.osInfo(),
        osInfo.versions(),
        cpu.cpu(),
        cpu.cpuFlags(),
        graphics.graphics(),
        network.networkInterfaces(),
        memory.memLayout(),
        filesystem.diskLayout()
      ]).then(res => {
        data.system = res[0];
        data.bios = res[1];
        data.baseboard = res[2];
        data.os = res[3];
        data.versions =res[4];
        data.cpu = res[5];
        data.cpu.flags = res[6];
        data.graphics = res[7];
        data.net = res[8];
        data.memLayout = res[9];
        data.diskLayout = res[10];
        if (callback) { callback(data); }
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

function getDynamicData(srv, iface, callback) {

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
        let totalFunctions = (_windows ? 10 : 14);

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

      cpu.cpuCurrentspeed().then(res => {
        data.cpuCurrentspeed = res;
        functionProcessed();
      });

      users.users().then(res => {
        data.users = res;
        functionProcessed();
      });

      if (!_windows) {
        processes.processes().then(res => {
          data.processes = res;
          functionProcessed();
        });
      }

      cpu.currentLoad().then(res => {
        data.currentLoad = res;
        functionProcessed();
      });

      cpu.cpuTemperature().then(res => {
        data.temp = res;
        functionProcessed();
      });

      network.networkStats(iface).then(res => {
        data.networkStats = res;
        functionProcessed();
      });

      network.networkConnections().then(res => {
        data.networkConnections = res;
        functionProcessed();
      });

      memory.mem().then(res => {
        data.mem = res;
        functionProcessed();
      });

      battery().then(res => {
        data.battery = res;
        functionProcessed();
      });

      if (!_windows) {
        processes.services(srv).then(res => {
          data.services = res;
          functionProcessed();
        });
      }

      filesystem.fsSize().then(res => {
        data.fsSize = res;
        functionProcessed();
      });

      if (!_windows) {
        filesystem.fsStats().then(res => {
          data.fsStats = res;
          functionProcessed();
        });
      }

      if (!_windows) {
        filesystem.disksIO().then(res => {
          data.disksIO = res;
          functionProcessed();
        });
      }

      internet.inetLatency().then(res => {
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

function getAllData(srv, iface, callback) {

  return new Promise((resolve) => {
    process.nextTick(() => {
      let data = {};

      getStaticData().then(res => {
        data = res;
        getDynamicData(srv, iface).then(res => {
          for (let key in res) {
            if (res.hasOwnProperty(key)) {
              data[key] = res[key];
            }
          }
          if (callback) { callback(data); }
          resolve(data);
        });
      });
    });
  });
}

// ----------------------------------------------------------------------------------
// export all libs
// ----------------------------------------------------------------------------------

exports.version = version;
exports.system = system.system;
exports.bios = system.bios;
exports.baseboard = system.baseboard;

exports.time = osInfo.time;
exports.osInfo = osInfo.osInfo;
exports.versions = osInfo.versions;
exports.shell = osInfo.shell;

exports.cpu = cpu.cpu;
exports.cpuFlags = cpu.cpuFlags;
exports.cpuCache = cpu.cpuCache;
exports.cpuCurrentspeed = cpu.cpuCurrentspeed;
exports.cpuTemperature = cpu.cpuTemperature;
exports.currentLoad = cpu.currentLoad;
exports.fullLoad = cpu.fullLoad;

exports.mem = memory.mem;
exports.memLayout = memory.memLayout;

exports.battery = battery;

exports.graphics = graphics.graphics;

exports.fsSize = filesystem.fsSize;
exports.blockDevices = filesystem.blockDevices;
exports.fsStats = filesystem.fsStats;
exports.disksIO = filesystem.disksIO;
exports.diskLayout = filesystem.diskLayout;

exports.networkInterfaceDefault = network.networkInterfaceDefault;
exports.networkInterfaces = network.networkInterfaces;
exports.networkStats = network.networkStats;
exports.networkConnections = network.networkConnections;

exports.services = processes.services;
exports.processes = processes.processes;
exports.processLoad = processes.processLoad;

exports.users = users.users;

exports.inetChecksite = internet.inetChecksite;
exports.inetLatency = internet.inetLatency;

exports.dockerContainers = docker.dockerContainers;
exports.dockerContainerStats = docker.dockerContainerStats;
exports.dockerContainerProcesses = docker.dockerContainerProcesses;
exports.dockerAll = docker.dockerAll;

exports.getStaticData = getStaticData;
exports.getDynamicData = getDynamicData;
exports.getAllData = getAllData;
