import { nextTick } from './common';
import { WINDOWS } from './common/const';
import { nanoSeconds } from './common/datetime';
import { isPrototypePolluted, sanitizeContainerID, sanitizeImageID } from './common/security';
import type { DockerContainerData, DockerContainerProcessData, DockerContainerStatsData, DockerVolumeData } from './common/types';
import { DockerSocket } from './docker-socket';

const _docker_cpu_last_read: { [index: string]: number } = {};
let _docker_socket: DockerSocket;

// --------------------------
// get docker info

export const dockerInfo = async () => {
  await nextTick();
  if (!_docker_socket) {
    _docker_socket = new DockerSocket();
  }
  const data: any = await _docker_socket.getInfo();
  if (data) {
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
      productLicense: data.ProductLicense
    };
  } else {
    return {};
  }
};

export const dockerImages = async (all = false) => {
  await nextTick();
  if (!_docker_socket) {
    _docker_socket = new DockerSocket();
  }
  const workload: any[] = [];

  const data: any = await _docker_socket.listImages(all);
  let dockerImages: any = {};
  try {
    dockerImages = data;
    if (dockerImages && Object.prototype.toString.call(dockerImages) === '[object Array]' && dockerImages.length > 0) {
      dockerImages.forEach((element: any) => {
        if (element.Names && Object.prototype.toString.call(element.Names) === '[object Array]' && element.Names.length > 0) {
          element.Name = element.Names[0].replace(/^\/|\/$/g, '');
        }
        if (element.Id && typeof element.Id === 'string') {
          workload.push(dockerImagesInspect(element.Id.trim(), element));
        }
      });
      if (workload.length) {
        const res = await Promise.all(workload);
        return res;
      } else {
        return [];
      }
    } else {
      return [];
    }
  } catch (err) {
    return [];
  }
};

// --------------------------
// container inspect (for one container)

const dockerImagesInspect = async (imageID: string, payload: any) => {
  await nextTick();
  imageID = imageID || '';
  if (typeof imageID !== 'string') {
    return null;
  }
  const imageIDSanitized = isPrototypePolluted() ? '' : sanitizeImageID(imageID);
  if (imageIDSanitized) {
    if (!_docker_socket) {
      _docker_socket = new DockerSocket();
    }

    try {
      const data: any = await _docker_socket.inspectImage(imageIDSanitized);
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
        repoDigests: data.RepoDigests ? data.RepoDigests : [],
        repoTags: data.RepoTags ? data.RepoTags : [],
        config: data.Config ? data.Config : {},
        rootFS: data.RootFS ? data.RootFS : {}
      };
    } catch (err) {
      return null;
    }
  } else {
    return null;
  }
};

export const dockerContainers = async (all = true): Promise<DockerContainerData[]> => {
  const inContainers = (containers: any, id: string) => {
    return containers.some((obj: any) => obj.Id && obj.Id.indexOf(id) === 0);
  };

  const result: DockerContainerData[] = [];
  await nextTick();
  if (!_docker_socket) {
    _docker_socket = new DockerSocket();
  }
  const workload: any[] = [];

  const data: any = await _docker_socket.listContainers(all);
  let docker_containers: any[] = [];
  try {
    docker_containers = data;
    if (docker_containers && Object.prototype.toString.call(docker_containers) === '[object Array]' && docker_containers.length > 0) {
      // GC in _docker_cpu_last_read
      for (const key in _docker_cpu_last_read) {
        if (Object.keys(_docker_cpu_last_read).includes(key)) {
          if (!inContainers(docker_containers, key)) {
            delete _docker_cpu_last_read[key];
          }
        }
      }

      docker_containers.forEach((element) => {
        if (element.Names && Object.prototype.toString.call(element.Names) === '[object Array]' && element.Names.length > 0) {
          element.Name = element.Names[0].replace(/^\/|\/$/g, '');
        }
        if (element.Id && typeof element.Id === 'string') {
          workload.push(dockerContainerInspect(element.Id.trim(), element));
        }
      });
      if (workload.length) {
        const data = await Promise.all(workload);
        return data;
      } else {
        return result;
      }
    } else {
      return result;
    }
  } catch (err) {}
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
  const containerIdSanitized = isPrototypePolluted() ? '' : sanitizeContainerID(containerID);
  if (containerIdSanitized) {
    if (!_docker_socket) {
      _docker_socket = new DockerSocket();
    }

    try {
      const data: any = await _docker_socket.getInspect(containerIdSanitized);
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
        status: data.State && data.State.Health && data.State.Health.Status ? data.State.Health.Status : '',
        state: payload.State,
        restartCount: data.RestartCount || 0,
        platform: data.Platform || '',
        driver: data.Driver || '',
        labels: data.Config && data.Config.Labels ? data.Config.Labels : {},
        ports: payload.Ports,
        mounts: payload.Mounts
      };
    } catch (err) {
      return null;
    }
  } else {
    return null;
  }
};

// --------------------------
// helper functions for calculation of docker stats

const docker_calcCPUPercent = (cpu_stats: any, precpu_stats: any, id: string) => {
  if (!cpu_stats || !cpu_stats.cpu_usage || !precpu_stats) {
    return 0;
  }
  const precpuTotal = precpu_stats.cpu_usage && precpu_stats.cpu_usage.total_usage ? precpu_stats.cpu_usage.total_usage : 0;

  if (!WINDOWS) {
    let cpuPercent = 0.0;
    // calculate the change for the cpu usage of the container in between readings
    const cpuDelta = cpu_stats.cpu_usage.total_usage - precpuTotal;
    // calculate the change for the entire system between readings
    const systemDelta = cpu_stats.system_cpu_usage - (precpu_stats.system_cpu_usage || 0);

    if (systemDelta > 0.0 && cpuDelta > 0.0) {
      // calculate the change for the cpu usage of the container in between readings
      if (precpu_stats.online_cpus) {
        cpuPercent = (cpuDelta / systemDelta) * precpu_stats.online_cpus * 100.0;
      } else if (cpu_stats.cpu_usage.percpu_usage && cpu_stats.cpu_usage.percpu_usage.length) {
        cpuPercent = (cpuDelta / systemDelta) * cpu_stats.cpu_usage.percpu_usage.length * 100.0;
      }
    }

    return cpuPercent;
  } else {
    const nanoSecNow = nanoSeconds();
    let cpuPercent = 0.0;
    const lastRead = _docker_cpu_last_read[id] || 0;
    if (lastRead > 0) {
      const possIntervals = nanoSecNow - lastRead;
      const intervalsUsed = cpu_stats.cpu_usage.total_usage - precpuTotal;
      if (possIntervals > 0) {
        cpuPercent = (100.0 * intervalsUsed) / possIntervals;
      }
    }
    _docker_cpu_last_read[id] = nanoSecNow;
    return cpuPercent;
  }
};

const docker_calcNetworkIO = (networks: any) => {
  let rx = 0;
  let wx = 0;
  for (const key in networks) {
    // skip loop if the property is from prototype
    if (!Object.keys(networks).includes(key)) {
      continue;
    }

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
  if (
    blkio_stats &&
    blkio_stats.io_service_bytes_recursive &&
    Object.prototype.toString.call(blkio_stats.io_service_bytes_recursive) === '[object Array]' &&
    blkio_stats.io_service_bytes_recursive.length > 0
  ) {
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

  let containerIDsSanitized = containerIDs.trim();
  if (containerIDsSanitized !== '*') {
    containerIDsSanitized = isPrototypePolluted() ? '' : sanitizeContainerID(containerIDs);
  }
  containerArray = containerIDsSanitized
    .trim()
    .toLowerCase()
    .replace(/,+/g, '|')
    .split('|')
    .filter((item) => item.trim());
  if (containerArray.length && containerIDsSanitized.trim() === '*') {
    containerArray = [];
    const allContainers = await dockerContainers();
    for (const container of (allContainers || []).filter(Boolean)) {
      if (container && container.id && container.state === 'running') {
        containerArray.push(container.id.substring(0, 12));
      }
    }
  }
  const result: DockerContainerStatsData[] = [];
  // console.log(containerArray);
  const workload = [];
  for (const containerID of containerArray) {
    workload.push(dockerContainerStatsSingle(containerID.trim()));
  }
  if (workload.length) {
    const data: any = (await Promise.all(workload)).filter((data: any) => {
      return data !== null;
    });
    return data;
  } else {
    return result;
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
    networks: {}
  };
  await nextTick();
  if (containerID) {
    if (!_docker_socket) {
      _docker_socket = new DockerSocket();
    }

    const dataInspect: any = await _docker_socket.getInspect(containerID);
    try {
      const data: any = await _docker_socket.getStats(containerID);
      try {
        const stats = data;
        if (!stats.message) {
          return {
            ...result,
            id: data.id ? data.id : containerID,
            memUsage: stats.memory_stats && stats.memory_stats.usage ? stats.memory_stats.usage : 0,
            memLimit: stats.memory_stats && stats.memory_stats.limit ? stats.memory_stats.limit : 0,
            memPercent: stats.memory_stats && stats.memory_stats.usage && stats.memory_stats.limit ? (stats.memory_stats.usage / stats.memory_stats.limit) * 100.0 : 0,
            cpuPercent: stats.cpu_stats && stats.precpu_stats ? docker_calcCPUPercent(stats.cpu_stats, stats.precpu_stats, containerID) : 0,
            pids: stats.pids_stats && stats.pids_stats.current ? stats.pids_stats.current : 0,
            restartCount: dataInspect.RestartCount ? dataInspect.RestartCount : 0,
            netIO: stats.networks ? docker_calcNetworkIO(stats.networks) : result.netIO,
            blockIO: stats.blkio_stats ? docker_calcBlockIO(stats.blkio_stats) : result.blockIO,
            cpuStats: stats.cpu_stats ? stats.cpu_stats : {},
            precpuStats: stats.precpu_stats ? stats.precpu_stats : {},
            memoryStats: stats.memory_stats ? stats.memory_stats : {},
            networks: stats.networks ? stats.networks : {}
          };
        }
      } catch {}
    } catch {}
    return null;
  } else {
    return null;
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
  const containerIdSanitized = isPrototypePolluted() ? '' : sanitizeContainerID(containerID);

  if (containerIdSanitized) {
    if (!_docker_socket) {
      _docker_socket = new DockerSocket();
    }

    try {
      const data: any = await _docker_socket.getProcesses(containerIdSanitized);
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
            pidHost: pos_pid >= 0 ? process[pos_pid] : '',
            ppid: pos_ppid >= 0 ? process[pos_ppid] : '',
            pgid: pos_pgid >= 0 ? process[pos_pgid] : '',
            user: pos_user >= 0 ? process[pos_user] : '',
            ruser: pos_ruser >= 0 ? process[pos_ruser] : '',
            group: pos_group >= 0 ? process[pos_group] : '',
            rgroup: pos_rgroup >= 0 ? process[pos_rgroup] : '',
            stat: pos_stat >= 0 ? process[pos_stat] : '',
            time: pos_time >= 0 ? process[pos_time] : '',
            elapsed: pos_elapsed >= 0 ? process[pos_elapsed] : '',
            nice: pos_ni >= 0 ? process[pos_ni] : '',
            rss: pos_rss >= 0 ? process[pos_rss] : '',
            vsz: pos_vsz >= 0 ? process[pos_vsz] : '',
            command: pos_command >= 0 ? process[pos_command] : ''
          });
        });
      }
    } catch (err) {}
    return result;
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
  const data: any = await _docker_socket.listVolumes();
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
          created: element.CreatedAt ? Math.round(new Date(element.CreatedAt).getTime() / 1000) : 0
        });
      });
      return result;
    } else {
      return result;
    }
  } catch (err) {
    return result;
  }
};

export const dockerAll = async () => {
  await nextTick();
  const result = await dockerContainers(true);
  if (result && Object.prototype.toString.call(result) === '[object Array]' && result.length > 0) {
    result.forEach(async (element: any) => {
      const res = await dockerContainerStats(element.id);
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

      const processes = await dockerContainerProcesses(element.id);
      element.processes = processes;
    });
    return result;

    // all done??
  } else {
    return result;
  }
};
