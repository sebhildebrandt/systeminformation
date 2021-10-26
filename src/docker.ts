// ==================================================================================
// docker.ts
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

import { WINDOWS } from './common/const';
import { DockerContainerData, DockerContainerStatsData, DockerContainerProcessData, DockerVolumeData } from './common/types';
import { DockerSocket } from './dockerSocket';
import { sanitizeShellString, isPrototypePolluted, stringReplace, stringToLower, stringTrim, mathMin } from './common/security';
import { nanoSeconds } from './common/datetime';
import { nextTick } from './common';

const _docker_container_stats: { [index: string]: any; } = {};
let _docker_socket: DockerSocket;
let _docker_last_read = 0;

// --------------------------
// get docker info

export const dockerInfo = async () => {
  await nextTick();
  if (!_docker_socket) {
    _docker_socket = new DockerSocket();
  }
  _docker_socket.getInfo().then((data: any) => {
    return {
      id: data.ID,
      containers: data.Containers,
      containersRunning: data.ContainersRunning,
      containersPaused: data.ContainersPaused,
      containersStopped: data.ContainersStopped,
      images: data.Images,
      driver: data.Driver,
      memoryLimit: data.MemoryLimit,
      swapLimit: data.SwapLimit,
      kernelMemory: data.KernelMemory,
      cpuCfsPeriod: data.CpuCfsPeriod,
      cpuCfsQuota: data.CpuCfsQuota,
      cpuShares: data.CPUShares,
      cpuSet: data.CPUSet,
      ipv4Forwarding: data.IPv4Forwarding,
      bridgeNfIptables: data.BridgeNfIptables,
      bridgeNfIp6tables: data.BridgeNfIp6tables,
      debug: data.Debug,
      nfd: data.NFd,
      oomKillDisable: data.OomKillDisable,
      ngoroutines: data.NGoroutines,
      systemTime: data.SystemTime,
      loggingDriver: data.LoggingDriver,
      cgroupDriver: data.CgroupDriver,
      nEventsListener: data.NEventsListener,
      kernelVersion: data.KernelVersion,
      operatingSystem: data.OperatingSystem,
      osType: data.OSType,
      architecture: data.Architecture,
      ncpu: data.NCPU,
      memTotal: data.MemTotal,
      dockerRootDir: data.DockerRootDir,
      httpProxy: data.HttpProxy,
      httpsProxy: data.HttpsProxy,
      noProxy: data.NoProxy,
      name: data.Name,
      labels: data.Labels,
      experimentalBuild: data.ExperimentalBuild,
      serverVersion: data.ServerVersion,
      clusterStore: data.ClusterStore,
      clusterAdvertise: data.ClusterAdvertise,
      defaultRuntime: data.DefaultRuntime,
      liveRestoreEnabled: data.LiveRestoreEnabled,
      isolation: data.Isolation,
      initBinary: data.InitBinary,
      productLicense: data.ProductLicense,
    };
  });
};

export const dockerImages = async (all = false) => {

  await nextTick();
  if (!_docker_socket) {
    _docker_socket = new DockerSocket();
  }
  const workload: any[] = [];

  _docker_socket.listImages(all).then((data: any) => {
    let dockerImages: any = {};
    try {
      dockerImages = data;
      if (dockerImages && Object.prototype.toString.call(dockerImages) === '[object Array]' && dockerImages.length > 0) {
        dockerImages.forEach(function (element: any) {
          if (element.Names && Object.prototype.toString.call(element.Names) === '[object Array]' && element.Names.length > 0) {
            element.Name = element.Names[0].replace(/^\/|\/$/g, '');
          }
          workload.push(dockerImagesInspect(element.Id.trim(), element));
        });
        if (workload.length) {
          Promise.all(
            workload
          ).then(data => {
            return data;
          });
        } else {
          return [];
        }
      } else {
        return [];
      }
    } catch (err) {
      return [];
    }
  });
};

// --------------------------
// container inspect (for one container)

const dockerImagesInspect = async (imageID: string, payload: any) => {
  await nextTick();
  imageID = imageID || '';
  if (typeof imageID !== 'string') {
    return null;
  }
  const imageIDSanitized = (isPrototypePolluted() ? '' : sanitizeShellString(imageID, true)).trim();
  if (imageIDSanitized) {
    if (!_docker_socket) {
      _docker_socket = new DockerSocket();
    }

    _docker_socket.inspectImage(imageIDSanitized.trim()).then((data: any) => {
      try {
        return {
          id: payload.Id,
          container: data.Container,
          comment: data.Comment,
          os: data.Os,
          architecture: data.Architecture,
          parent: data.Parent,
          dockerVersion: data.DockerVersion,
          size: data.Size,
          sharedSize: payload.SharedSize,
          virtualSize: data.VirtualSize,
          author: data.Author,
          created: data.Created ? Math.round(new Date(data.Created).getTime() / 1000) : 0,
          containerConfig: data.ContainerConfig ? data.ContainerConfig : {},
          graphDriver: data.GraphDriver ? data.GraphDriver : {},
          repoDigests: data.RepoDigests ? data.RepoDigests : {},
          repoTags: data.RepoTags ? data.RepoTags : {},
          config: data.Config ? data.Config : {},
          rootFS: data.RootFS ? data.RootFS : {},
        };
      } catch (err) {
        return null;
      }
    });
  } else {
    return null;
  }
};

export const dockerContainers = async (all = false): Promise<DockerContainerData[]> => {

  const inContainers = (containers: any, id: string) => {
    const filtered = containers.filter((obj: any) => {
      /**
       * @namespace
       * @property {string}  Id
       */
      return (obj.Id && (obj.Id === id));
    });
    return (filtered.length > 0);
  };

  const result: DockerContainerData[] = [];
  await nextTick();
  if (!_docker_socket) {
    _docker_socket = new DockerSocket();
  }
  const workload: any[] = [];

  _docker_socket.listContainers(all).then((data: any) => {
    let docker_containers: any[] = [];
    try {
      docker_containers = data;
      if (docker_containers && Object.prototype.toString.call(docker_containers) === '[object Array]' && docker_containers.length > 0) {
        // GC in _docker_container_stats
        for (const key in _docker_container_stats) {
          if ({}.hasOwnProperty.call(_docker_container_stats, key)) {
            if (!inContainers(docker_containers, key)) { delete _docker_container_stats[key]; }
          }
        }

        docker_containers.forEach(function (element) {

          if (element.Names && Object.prototype.toString.call(element.Names) === '[object Array]' && element.Names.length > 0) {
            element.Name = element.Names[0].replace(/^\/|\/$/g, '');
          }
          workload.push(dockerContainerInspect(element.Id.trim(), element));
        });
        if (workload.length) {
          Promise.all(
            workload
          ).then(data => {
            return data;
          });
        } else {
          return result;
        }
      } else {
        return result;
      }
    } catch (err) {
      // GC in _docker_container_stats
      for (const key in _docker_container_stats) {
        if ({}.hasOwnProperty.call(_docker_container_stats, key)) {
          if (!inContainers(docker_containers, key)) { delete _docker_container_stats[key]; }
        }
      }
    }
  });
  return result;
};

// --------------------------
// container inspect (for one container)

const dockerContainerInspect = async (containerID: string, payload: any) => {
  await nextTick();
  containerID = containerID || '';
  if (typeof containerID !== 'string') {
    return null;
  }
  const containerIdSanitized = (isPrototypePolluted() ? '' : sanitizeShellString(containerID, true)).trim();
  if (containerIdSanitized) {

    if (!_docker_socket) {
      _docker_socket = new DockerSocket();
    }

    _docker_socket.getInspect(containerIdSanitized.trim()).then((data: any) => {
      try {
        return {
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
        };
      } catch (err) {
        return null;
      }
    });
  } else {
    return null;
  }
};

// --------------------------
// helper functions for calculation of docker stats

const docker_calcCPUPercent = (cpu_stats: any, precpu_stats: any) => {

  if (!WINDOWS) {
    let cpuPercent = 0.0;
    // calculate the change for the cpu usage of the container in between readings
    const cpuDelta = cpu_stats.cpu_usage.total_usage - precpu_stats.cpu_usage.total_usage;
    // calculate the change for the entire system between readings
    const systemDelta = cpu_stats.system_cpu_usage - precpu_stats.system_cpu_usage;

    if (systemDelta > 0.0 && cpuDelta > 0.0) {
      // calculate the change for the cpu usage of the container in between readings
      cpuPercent = (cpuDelta / systemDelta) * cpu_stats.cpu_usage.percpu_usage.length * 100.0;
    }

    return cpuPercent;
  } else {
    const nanoSecNow = nanoSeconds();
    let cpuPercent = 0.0;
    if (_docker_last_read > 0) {
      const possIntervals = (nanoSecNow - _docker_last_read); //  / 100 * os.cpus().length;
      const intervalsUsed = cpu_stats.cpu_usage.total_usage - precpu_stats.cpu_usage.total_usage;
      if (possIntervals > 0) {
        cpuPercent = 100.0 * intervalsUsed / possIntervals;
      }
    }
    _docker_last_read = nanoSecNow;
    return cpuPercent;
  }
};

const docker_calcNetworkIO = (networks: any) => {
  let rx = 0;
  let wx = 0;
  for (const key in networks) {
    // skip loop if the property is from prototype
    if (!{}.hasOwnProperty.call(networks, key)) { continue; }

    /**
     * @namespace
     * @property {number}  rx_bytes
     * @property {number}  tx_bytes
     */
    const obj = networks[key];
    rx = +obj.rx_bytes;
    wx = +obj.tx_bytes;
  }
  return {
    rx,
    wx
  };
};

const docker_calcBlockIO = (blkio_stats: any) => {
  const result = {
    r: 0,
    w: 0
  };

  /**
   * @namespace
   * @property {Array}  io_service_bytes_recursive
   */
  if (blkio_stats && blkio_stats.io_service_bytes_recursive && Object.prototype.toString.call(blkio_stats.io_service_bytes_recursive) === '[object Array]' && blkio_stats.io_service_bytes_recursive.length > 0) {
    blkio_stats.io_service_bytes_recursive.forEach((element: any) => {
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
};

export const dockerContainerStats = async (containerIDs = '*') => {

  let containerArray: string[] = [];
  await nextTick();

  // fallback - if only callback is given
  if (typeof containerIDs !== 'string') {
    return [];
  }
  let containerIDsSanitized: any = '';
  containerIDsSanitized.__proto__.toLowerCase = stringToLower;
  containerIDsSanitized.__proto__.replace = stringReplace;
  containerIDsSanitized.__proto__.trim = stringTrim;

  containerIDsSanitized = containerIDs;
  containerIDsSanitized = containerIDsSanitized.trim();
  if (containerIDsSanitized !== '*') {
    containerIDsSanitized = '';
    const s: any = (isPrototypePolluted() ? '' : sanitizeShellString(containerIDs, true)).trim();
    for (let i = 0; i <= mathMin(s.length, 2000); i++) {
      if (!(s[i] === undefined)) {
        s[i].__proto__.toLowerCase = stringToLower;
        const sl = s[i].toLowerCase();
        if (sl && sl[0] && !sl[1]) {
          containerIDsSanitized = containerIDsSanitized + sl[0];
        }
      }
    }
  }

  containerIDsSanitized = containerIDsSanitized.trim().toLowerCase().replace(/,+/g, '|');
  containerArray = containerIDsSanitized.split('|');

  const result: DockerContainerStatsData[] = [];

  const workload = [];
  if (containerArray.length && containerArray[0].trim() === '*') {
    containerArray = [];
    dockerContainers().then(allContainers => {
      for (const container of allContainers) {
        containerArray.push(container.id);
      }
      if (containerArray.length) {
        dockerContainerStats(containerArray.join(',')).then(result => {
          return result;
        });
      } else {
        return result;
      }
    });
  } else {
    for (const containerID of containerArray) {
      workload.push(dockerContainerStatsSingle(containerID.trim()));
    }
    if (workload.length) {
      Promise.all(
        workload
      ).then(data => {
        return data;
      });
    } else {
      return result;
    }
  }
};

// --------------------------
// container stats (for one container)

const dockerContainerStatsSingle = async (containerID: string) => {
  containerID = containerID || '';
  const result: DockerContainerStatsData = {
    id: containerID,
    memUsage: 0,
    memLimit: 0,
    memPercent: 0,
    cpuPercent: 0,
    pids: 0,
    netIO: {
      rx: 0,
      wx: 0
    },
    blockIO: {
      r: 0,
      w: 0
    },
    restartCount: 0,
    cpuStats: {},
    precpuStats: {},
    memoryStats: {},
    networks: {},
  };
  await nextTick();
  if (containerID) {

    if (!_docker_socket) {
      _docker_socket = new DockerSocket();
    }

    _docker_socket.getInspect(containerID).then((dataInspect: any) => {
      try {
        _docker_socket.getStats(containerID).then((data: any) => {
          try {
            const stats = data;

            if (!stats.message) {
              result.memUsage = (stats.memory_stats && stats.memory_stats.usage ? stats.memory_stats.usage : 0);
              result.memLimit = (stats.memory_stats && stats.memory_stats.limit ? stats.memory_stats.limit : 0);
              result.memPercent = (stats.memory_stats && stats.memory_stats.usage && stats.memory_stats.limit ? stats.memory_stats.usage / stats.memory_stats.limit * 100.0 : 0);
              result.cpuPercent = (stats.cpu_stats && stats.precpu_stats ? docker_calcCPUPercent(stats.cpu_stats, stats.precpu_stats) : 0);
              result.pids = (stats.pids_stats && stats.pids_stats.current ? stats.pids_stats.current : 0);
              result.restartCount = (dataInspect.RestartCount ? dataInspect.RestartCount : 0);
              if (stats.networks) { result.netIO = docker_calcNetworkIO(stats.networks); }
              if (stats.blkio_stats) { result.blockIO = docker_calcBlockIO(stats.blkio_stats); }
              result.cpuStats = (stats.cpu_stats ? stats.cpu_stats : {});
              result.precpuStats = (stats.precpu_stats ? stats.precpu_stats : {});
              result.memoryStats = (stats.memory_stats ? stats.memory_stats : {});
              result.networks = (stats.networks ? stats.networks : {});
            }
          } catch (err) {
          }
          // }
          return result;
        });
      } catch (err) {
      }
    });
  } else {
    return result;
  }
};

// --------------------------
// container processes (for one container)

export const dockerContainerProcesses = async (containerID: string) => {
  const result: DockerContainerProcessData[] = [];
  await nextTick();
  containerID = containerID || '';
  if (typeof containerID !== 'string') {
    return result;
  }
  const containerIdSanitized = (isPrototypePolluted() ? '' : sanitizeShellString(containerID, true)).trim();

  if (containerIdSanitized) {

    if (!_docker_socket) {
      _docker_socket = new DockerSocket();
    }

    _docker_socket.getProcesses(containerIdSanitized).then((data: any) => {
      try {
        if (data && data.Titles && data.Processes) {
          const titles = data.Titles.map((value: string) => {
            return value.toUpperCase();
          });
          const pos_pid = titles.indexOf('PID');
          const pos_ppid = titles.indexOf('PPID');
          const pos_pgid = titles.indexOf('PGID');
          const pos_vsz = titles.indexOf('VSZ');
          const pos_time = titles.indexOf('TIME');
          const pos_elapsed = titles.indexOf('ELAPSED');
          const pos_ni = titles.indexOf('NI');
          const pos_ruser = titles.indexOf('RUSER');
          const pos_user = titles.indexOf('USER');
          const pos_rgroup = titles.indexOf('RGROUP');
          const pos_group = titles.indexOf('GROUP');
          const pos_stat = titles.indexOf('STAT');
          const pos_rss = titles.indexOf('RSS');
          const pos_command = titles.indexOf('COMMAND');

          data.Processes.forEach((process: any) => {
            result.push({
              pidHost: (pos_pid >= 0 ? process[pos_pid] : ''),
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
      }
      return result;
    });
  } else {
    return result;
  }
};

export const dockerVolumes = async () => {

  const result: DockerVolumeData[] = [];
  await nextTick();
  if (!_docker_socket) {
    _docker_socket = new DockerSocket();
  }
  _docker_socket.listVolumes().then((data: any) => {
    let dockerVolumes: any = {};
    try {
      dockerVolumes = data;
      if (dockerVolumes && dockerVolumes.Volumes && Object.prototype.toString.call(dockerVolumes.Volumes) === '[object Array]' && dockerVolumes.Volumes.length > 0) {

        dockerVolumes.Volumes.forEach((element: any) => {

          result.push({
            name: element.Name,
            driver: element.Driver,
            labels: element.Labels,
            mountpoint: element.Mountpoint,
            options: element.Options,
            scope: element.Scope,
            created: element.CreatedAt ? Math.round(new Date(element.CreatedAt).getTime() / 1000) : 0,
          });
        });
        return result;
      } else {
        return result;
      }
    } catch (err) {
      return result;
    }
  });
};

export const dockerAll = async () => {
  await nextTick();
  dockerContainers(true).then(result => {
    if (result && Object.prototype.toString.call(result) === '[object Array]' && result.length > 0) {
      let l = result.length;
      result.forEach((element: any) => {
        dockerContainerStats(element.id).then(res => {
          // include stats in array
          if (res) {
            element.memUsage = res[0].memUsage;
            element.memLimit = res[0].memLimit;
            element.memPercent = res[0].memPercent;
            element.cpuPercent = res[0].cpuPercent;
            element.pids = res[0].pids;
            element.netIO = res[0].netIO;
            element.blockIO = res[0].blockIO;
            element.cpuStats = res[0].cpuStats;
            element.precpuStats = res[0].precpuStats;
            element.memoryStats = res[0].memoryStats;
            element.networks = res[0].networks;
          }

          dockerContainerProcesses(element.id).then(processes => {
            element.processes = processes;

            l -= 1;
            if (l === 0) {
              return result;
            }
          });
          // all done??
        });
      });
    } else {
      return result;
    }
  });
};
