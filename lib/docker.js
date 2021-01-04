'use strict';
// @ts-check
// ==================================================================================
// docker.js
// ----------------------------------------------------------------------------------
// Description:   System Information - library
//                for Node.js
// Copyright:     (c) 2014 - 2021
// Author:        Sebastian Hildebrandt
// ----------------------------------------------------------------------------------
// License:       MIT
// ==================================================================================
// 13. Docker
// ----------------------------------------------------------------------------------

const util = require('./util');
const DockerSocket = require('./dockerSocket');

let _platform = process.platform;
const _windows = (_platform === 'win32');

let _docker_container_stats = {};
let _docker_socket;
let _docker_last_read = 0;


// --------------------------
// get containers (parameter all: get also inactive/exited containers)

function dockerInfo(callback) {
  return new Promise((resolve) => {
    process.nextTick(() => {
      if (!_docker_socket) {
        _docker_socket = new DockerSocket();
      }
      const result = {};

      _docker_socket.getInfo(data => {
        result.id = data.ID;
        result.containers = data.Containers;
        result.containersRunning = data.ContainersRunning;
        result.containersPaused = data.ContainersPaused;
        result.containersStopped = data.ContainersStopped;
        result.images = data.Images;
        result.driver = data.Driver;
        result.memoryLimit = data.MemoryLimit;
        result.swapLimit = data.SwapLimit;
        result.kernelMemory = data.KernelMemory;
        result.cpuCfsPeriod = data.CpuCfsPeriod;
        result.cpuCfsQuota = data.CpuCfsQuota;
        result.cpuShares = data.CPUShares;
        result.cpuSet = data.CPUSet;
        result.ipv4Forwarding = data.IPv4Forwarding;
        result.bridgeNfIptables = data.BridgeNfIptables;
        result.bridgeNfIp6tables = data.BridgeNfIp6tables;
        result.debug = data.Debug;
        result.nfd = data.NFd;
        result.oomKillDisable = data.OomKillDisable;
        result.ngoroutines = data.NGoroutines;
        result.systemTime = data.SystemTime;
        result.loggingDriver = data.LoggingDriver;
        result.cgroupDriver = data.CgroupDriver;
        result.nEventsListener = data.NEventsListener;
        result.kernelVersion = data.KernelVersion;
        result.operatingSystem = data.OperatingSystem;
        result.osType = data.OSType;
        result.architecture = data.Architecture;
        result.ncpu = data.NCPU;
        result.memTotal = data.MemTotal;
        result.dockerRootDir = data.DockerRootDir;
        result.httpProxy = data.HttpProxy;
        result.httpsProxy = data.HttpsProxy;
        result.noProxy = data.NoProxy;
        result.name = data.Name;
        result.labels = data.Labels;
        result.experimentalBuild = data.ExperimentalBuild;
        result.serverVersion = data.ServerVersion;
        result.clusterStore = data.ClusterStore;
        result.clusterAdvertise = data.ClusterAdvertise;
        result.defaultRuntime = data.DefaultRuntime;
        result.liveRestoreEnabled = data.LiveRestoreEnabled;
        result.isolation = data.Isolation;
        result.initBinary = data.InitBinary;
        result.productLicense = data.ProductLicense;
        if (callback) { callback(result); }
        resolve(result);
      });
    });
  });
}

exports.dockerInfo = dockerInfo;

function dockerContainers(all, callback) {

  function inContainers(containers, id) {
    let filtered = containers.filter(obj => {
      /**
       * @namespace
       * @property {string}  Id
       */
      return (obj.Id && (obj.Id === id));
    });
    return (filtered.length > 0);
  }

  // fallback - if only callback is given
  if (util.isFunction(all) && !callback) {
    callback = all;
    all = false;
  }

  all = all || false;
  let result = [];
  return new Promise((resolve) => {
    process.nextTick(() => {
      if (!_docker_socket) {
        _docker_socket = new DockerSocket();
      }
      const workload = [];

      _docker_socket.listContainers(all, data => {
        let docker_containers = {};
        try {
          docker_containers = data;
          if (docker_containers && Object.prototype.toString.call(docker_containers) === '[object Array]' && docker_containers.length > 0) {
            // GC in _docker_container_stats
            for (let key in _docker_container_stats) {
              if ({}.hasOwnProperty.call(_docker_container_stats, key)) {
                if (!inContainers(docker_containers, key)) delete _docker_container_stats[key];
              }
            }

            docker_containers.forEach(function (element) {

              if (element.Names && Object.prototype.toString.call(element.Names) === '[object Array]' && element.Names.length > 0) {
                element.Name = element.Names[0].replace(/^\/|\/$/g, '');
              }
              workload.push(dockerContainerInspect(element.Id.trim(), element));
              // result.push({
              //   id: element.Id,
              //   name: element.Name,
              //   image: element.Image,
              //   imageID: element.ImageID,
              //   command: element.Command,
              //   created: element.Created,
              //   state: element.State,
              //   ports: element.Ports,
              //   mounts: element.Mounts,
              //   // hostconfig: element.HostConfig,
              //   // network: element.NetworkSettings
              // });
            });
            if (workload.length) {
              Promise.all(
                workload
              ).then(data => {
                if (callback) { callback(data); }
                resolve(data);
              });
            } else {
              if (callback) { callback(result); }
              resolve(result);
            }
          } else {
            if (callback) { callback(result); }
            resolve(result);
          }
        } catch (err) {
          // GC in _docker_container_stats
          for (let key in _docker_container_stats) {
            if ({}.hasOwnProperty.call(_docker_container_stats, key)) {
              if (!inContainers(docker_containers, key)) delete _docker_container_stats[key];
            }
          }
          if (callback) { callback(result); }
          resolve(result);
        }
      });
    });
  });
}

// --------------------------
// container inspect (for one container)

function dockerContainerInspect(containerID, payload) {
  containerID = containerID || '';
  return new Promise((resolve) => {
    process.nextTick(() => {
      if (containerID) {

        if (!_docker_socket) {
          _docker_socket = new DockerSocket();
        }

        _docker_socket.getInspect(containerID.trim(), data => {
          try {
            resolve({
              id: payload.Id,
              name: payload.Name,
              image: payload.Image,
              imageID: payload.ImageID,
              command: payload.Command,
              created: payload.Created,
              started: data.State && data.State.StartedAt ? Math.round(new Date(data.State.StartedAt).getTime() / 1000) : 0,
              finished: data.State && data.State.FinishedAt && !data.State.FinishedAt.startsWith('0001-01-01') ? Math.round(new Date(data.State.FinishedAt).getTime() / 1000) : 0,
              createdAt: data.Created ? data.Created : '',
              startedAt: data.State && data.State.StartedAt ? data.State.StartedAt : '',
              finishedAt: data.State && data.State.FinishedAt && !data.State.FinishedAt.startsWith('0001-01-01') ? data.State.FinishedAt : '',
              state: payload.State,
              restartCount: data.RestartCount || 0,
              platform: data.Platform || '',
              driver: data.Driver || '',
              ports: payload.Ports,
              mounts: payload.Mounts,
              // hostconfig: payload.HostConfig,
              // network: payload.NetworkSettings
            });
          } catch (err) {
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  });
}

exports.dockerContainers = dockerContainers;

// --------------------------
// helper functions for calculation of docker stats

function docker_calcCPUPercent(cpu_stats, precpu_stats) {
  /**
   * @namespace
   * @property {object}  cpu_usage
   * @property {number}  cpu_usage.total_usage
   * @property {number}  system_cpu_usage
   * @property {object}  cpu_usage
   * @property {Array}  cpu_usage.percpu_usage
   */

  if (!_windows) {
    let cpuPercent = 0.0;
    // calculate the change for the cpu usage of the container in between readings
    let cpuDelta = cpu_stats.cpu_usage.total_usage - precpu_stats.cpu_usage.total_usage;
    // calculate the change for the entire system between readings
    let systemDelta = cpu_stats.system_cpu_usage - precpu_stats.system_cpu_usage;

    if (systemDelta > 0.0 && cpuDelta > 0.0) {
      // calculate the change for the cpu usage of the container in between readings
      cpuPercent = (cpuDelta / systemDelta) * cpu_stats.cpu_usage.percpu_usage.length * 100.0;
    }

    return cpuPercent;
  } else {
    let nanoSecNow = util.nanoSeconds();
    let cpuPercent = 0.0;
    if (_docker_last_read > 0) {
      let possIntervals = (nanoSecNow - _docker_last_read); //  / 100 * os.cpus().length;
      let intervalsUsed = cpu_stats.cpu_usage.total_usage - precpu_stats.cpu_usage.total_usage;
      if (possIntervals > 0) {
        cpuPercent = 100.0 * intervalsUsed / possIntervals;
      }
    }
    _docker_last_read = nanoSecNow;
    return cpuPercent;
  }
}

function docker_calcNetworkIO(networks) {
  let rx;
  let wx;
  for (let key in networks) {
    // skip loop if the property is from prototype
    if (!{}.hasOwnProperty.call(networks, key)) continue;

    /**
     * @namespace
     * @property {number}  rx_bytes
     * @property {number}  tx_bytes
     */
    let obj = networks[key];
    rx = +obj.rx_bytes;
    wx = +obj.tx_bytes;
  }
  return {
    rx,
    wx
  };
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
  if (blkio_stats && blkio_stats.io_service_bytes_recursive && Object.prototype.toString.call(blkio_stats.io_service_bytes_recursive) === '[object Array]' && blkio_stats.io_service_bytes_recursive.length > 0) {
    blkio_stats.io_service_bytes_recursive.forEach(function (element) {
      /**
       * @namespace
       * @property {string}  op
       * @property {number}  value
       */

      if (element.op && element.op.toLowerCase() === 'read' && element.value) {
        result.r += element.value;
      }
      if (element.op && element.op.toLowerCase() === 'write' && element.value) {
        result.w += element.value;
      }
    });
  }
  return result;
}

function dockerContainerStats(containerIDs, callback) {

  let containerArray = [];
  // fallback - if only callback is given
  if (util.isFunction(containerIDs) && !callback) {
    callback = containerIDs;
    containerArray = ['*'];
  } else {
    containerIDs = containerIDs || '*';
    containerIDs = containerIDs.trim().toLowerCase().replace(/,+/g, '|');
    containerArray = containerIDs.split('|');
  }

  return new Promise((resolve) => {
    process.nextTick(() => {

      const result = [];

      const workload = [];
      if (containerArray.length && containerArray[0].trim() === '*') {
        containerArray = [];
        dockerContainers().then(allContainers => {
          for (let container of allContainers) {
            containerArray.push(container.id);
          }
          dockerContainerStats(containerArray.join(',')).then(result => {
            if (callback) { callback(result); }
            resolve(result);
          });
        });
      } else {
        for (let containerID of containerArray) {
          workload.push(dockerContainerStatsSingle(containerID.trim()));
        }
        if (workload.length) {
          Promise.all(
            workload
          ).then(data => {
            if (callback) { callback(data); }
            resolve(data);
          });
        } else {
          if (callback) { callback(result); }
          resolve(result);
        }
      }
    });
  });
}

// --------------------------
// container stats (for one container)

function dockerContainerStatsSingle(containerID) {
  containerID = containerID || '';
  let result = {
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
  return new Promise((resolve) => {
    process.nextTick(() => {
      if (containerID) {

        if (!_docker_socket) {
          _docker_socket = new DockerSocket();
        }

        _docker_socket.getInspect(containerID, dataInspect => {
          try {
            _docker_socket.getStats(containerID, data => {
              try {
                let stats = data;
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
                  result.cpu_percent = (stats.cpu_stats && stats.precpu_stats ? docker_calcCPUPercent(stats.cpu_stats, stats.precpu_stats) : 0);
                  result.pids = (stats.pids_stats && stats.pids_stats.current ? stats.pids_stats.current : 0);
                  result.restartCount = (dataInspect.RestartCount ? dataInspect.RestartCount : 0);
                  if (stats.networks) result.netIO = docker_calcNetworkIO(stats.networks);
                  if (stats.blkio_stats) result.blockIO = docker_calcBlockIO(stats.blkio_stats);
                  result.cpu_stats = (stats.cpu_stats ? stats.cpu_stats : {});
                  result.precpu_stats = (stats.precpu_stats ? stats.precpu_stats : {});
                  result.memory_stats = (stats.memory_stats ? stats.memory_stats : {});
                  result.networks = (stats.networks ? stats.networks : {});
                }
              } catch (err) {
                util.noop();
              }
              // }
              resolve(result);
            });
          } catch (err) {
            util.noop();
          }
        });
      } else {
        resolve(result);
      }
    });
  });
}

exports.dockerContainerStats = dockerContainerStats;

// --------------------------
// container processes (for one container)

function dockerContainerProcesses(containerID, callback) {
  containerID = containerID || '';
  let result = [];
  return new Promise((resolve) => {
    process.nextTick(() => {
      if (containerID) {

        if (!_docker_socket) {
          _docker_socket = new DockerSocket();
        }

        _docker_socket.getProcesses(containerID, data => {
          /**
           * @namespace
           * @property {Array}  Titles
           * @property {Array}  Processes
           **/
          try {
            if (data && data.Titles && data.Processes) {
              let titles = data.Titles.map(function (value) {
                return value.toUpperCase();
              });
              let pos_pid = titles.indexOf('PID');
              let pos_ppid = titles.indexOf('PPID');
              let pos_pgid = titles.indexOf('PGID');
              let pos_vsz = titles.indexOf('VSZ');
              let pos_time = titles.indexOf('TIME');
              let pos_elapsed = titles.indexOf('ELAPSED');
              let pos_ni = titles.indexOf('NI');
              let pos_ruser = titles.indexOf('RUSER');
              let pos_user = titles.indexOf('USER');
              let pos_rgroup = titles.indexOf('RGROUP');
              let pos_group = titles.indexOf('GROUP');
              let pos_stat = titles.indexOf('STAT');
              let pos_rss = titles.indexOf('RSS');
              let pos_command = titles.indexOf('COMMAND');

              data.Processes.forEach(process => {
                result.push({
                  pid_host: (pos_pid >= 0 ? process[pos_pid] : ''),
                  ppid: (pos_ppid >= 0 ? process[pos_ppid] : ''),
                  pgid: (pos_pgid >= 0 ? process[pos_pgid] : ''),
                  user: (pos_user >= 0 ? process[pos_user] : ''),
                  ruser: (pos_ruser >= 0 ? process[pos_ruser] : ''),
                  group: (pos_group >= 0 ? process[pos_group] : ''),
                  rgroup: (pos_rgroup >= 0 ? process[pos_rgroup] : ''),
                  stat: (pos_stat >= 0 ? process[pos_stat] : ''),
                  time: (pos_time >= 0 ? process[pos_time] : ''),
                  elapsed: (pos_elapsed >= 0 ? process[pos_elapsed] : ''),
                  nice: (pos_ni >= 0 ? process[pos_ni] : ''),
                  rss: (pos_rss >= 0 ? process[pos_rss] : ''),
                  vsz: (pos_vsz >= 0 ? process[pos_vsz] : ''),
                  command: (pos_command >= 0 ? process[pos_command] : '')
                });
              });
            }
          } catch (err) {
            util.noop();
          }
          if (callback) { callback(result); }
          resolve(result);
        });
      } else {
        if (callback) { callback(result); }
        resolve(result);
      }
    });
  });
}

exports.dockerContainerProcesses = dockerContainerProcesses;

function dockerAll(callback) {
  return new Promise((resolve) => {
    process.nextTick(() => {
      dockerContainers(true).then(result => {
        if (result && Object.prototype.toString.call(result) === '[object Array]' && result.length > 0) {
          let l = result.length;
          result.forEach(function (element) {
            dockerContainerStats(element.id).then(res => {
              // include stats in array
              element.mem_usage = res[0].mem_usage;
              element.mem_limit = res[0].mem_limit;
              element.mem_percent = res[0].mem_percent;
              element.cpu_percent = res[0].cpu_percent;
              element.pids = res[0].pids;
              element.netIO = res[0].netIO;
              element.blockIO = res[0].blockIO;
              element.cpu_stats = res[0].cpu_stats;
              element.precpu_stats = res[0].precpu_stats;
              element.memory_stats = res[0].memory_stats;
              element.networks = res[0].networks;

              dockerContainerProcesses(element.id).then(processes => {
                element.processes = processes;

                l -= 1;
                if (l === 0) {
                  if (callback) { callback(result); }
                  resolve(result);
                }
              });
              // all done??
            });
          });
        } else {
          if (callback) { callback(result); }
          resolve(result);
        }
      });
    });
  });
}

exports.dockerAll = dockerAll;
