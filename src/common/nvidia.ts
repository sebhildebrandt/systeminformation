import { readdir, stat } from 'fs/promises';
import { execOptsWin, LINUX, WINDIR, WINDOWS } from './const';
import { exec } from './exec';
import { sanitizeShellString } from './security';
import type { GpuData, GpuNvidiaData } from './types';

let _nvidiaSmiPath: string | null = null;

export const getNvidiaSmi = async () => {
  if (_nvidiaSmiPath !== null) {
    return _nvidiaSmiPath;
  }

  if (WINDOWS) {
    // driver setup hard-links the current driver's nvidia-smi.exe into System32
    const system32Path = String.raw`${WINDIR}\System32\nvidia-smi.exe`;
    try {
      await stat(system32Path);
      _nvidiaSmiPath = system32Path;
      return _nvidiaSmiPath;
    } catch {}
    // fallback (older DCH drivers without the System32 link): newest
    // nvidia-smi.exe in the driver store - only nv* dirs can contain it
    try {
      const basePath = String.raw`${WINDIR}\System32\DriverStore\FileRepository`;
      let lastMod = 0;
      for (const dir of await readdir(basePath)) {
        if (!dir.toLowerCase().startsWith('nv')) {
          continue;
        }
        const smiPath = [basePath, dir, 'nvidia-smi.exe'].join('\\');
        try {
          const stats = await stat(smiPath);
          if (stats.ctimeMs > lastMod) {
            lastMod = stats.ctimeMs;
            _nvidiaSmiPath = smiPath;
          }
        } catch {}
      }
    } catch {}
  } else if (LINUX) {
    _nvidiaSmiPath = 'nvidia-smi';
  }
  // cache the negative result too - no driver store rescan on every call
  _nvidiaSmiPath = _nvidiaSmiPath || '';
  return _nvidiaSmiPath;
};

export const nvidiaSmi = async () => {
  const nvidiaSmiExe = await getNvidiaSmi();
  if (nvidiaSmiExe) {
    const nvidiaSmiOpts =
      '--query-gpu=driver_version,pci.sub_device_id,name,pci.bus_id,fan.speed,memory.total,memory.used,memory.free,utilization.gpu,utilization.memory,temperature.gpu,temperature.memory,power.draw,power.limit,clocks.gr,clocks.mem --format=csv,noheader,nounits';
    const cmd = `${nvidiaSmiExe} ${nvidiaSmiOpts}`;
    try {
      const sanitized = sanitizeShellString(cmd) + (LINUX ? '  2>/dev/null' : '') + (WINDOWS ? '  2> nul' : '');
      const { stdout } = await exec(sanitized, execOptsWin);
      return stdout;
    } catch {}
  }
  return '';
};

const safeParseNumber = (value: any) => {
  if ([null, undefined].includes(value)) {
    return value;
  }
  return Number.parseFloat(value);
};

export const nvidiaDevices = async () => {
  const stdout = await nvidiaSmi();
  if (!stdout) {
    return [];
  }

  const gpus = stdout.split('\n').filter(Boolean);
  let results = gpus.map((gpu: string) => {
    const splittedData = gpu.split(', ').map((value) => (value.includes('N/A') ? undefined : value));
    if (splittedData.length === 16) {
      return {
        driverVersion: splittedData[0],
        subDeviceId: splittedData[1],
        name: splittedData[2],
        pciBus: splittedData[3],
        fanSpeed: safeParseNumber(splittedData[4]),
        memoryTotal: safeParseNumber(splittedData[5]),
        memoryUsed: safeParseNumber(splittedData[6]),
        memoryFree: safeParseNumber(splittedData[7]),
        utilizationGpu: safeParseNumber(splittedData[8]),
        utilizationMemory: safeParseNumber(splittedData[9]),
        temperatureGpu: safeParseNumber(splittedData[10]),
        temperatureMemory: safeParseNumber(splittedData[11]),
        powerDraw: safeParseNumber(splittedData[12]),
        powerLimit: safeParseNumber(splittedData[13]),
        clockCore: safeParseNumber(splittedData[14]),
        clockMemory: safeParseNumber(splittedData[15])
      };
    } else {
      return null;
    }
  });
  results = results.filter((item) => {
    return item !== null && 'pciBus' in item;
  });
  return results;
};

export const mergeControllerNvidia = (controller: GpuData, nvidia: GpuNvidiaData | any) => {
  if (nvidia.driverVersion) {
    controller.driverVersion = nvidia.driverVersion;
  }
  if (nvidia.subDeviceId) {
    controller.subDeviceId = nvidia.subDeviceId;
  }
  if (nvidia.name) {
    controller.name = nvidia.name;
  }
  if (nvidia.pciBus) {
    controller.pciBus = nvidia.pciBus;
  }
  if (nvidia.fanSpeed) {
    controller.fanSpeed = nvidia.fanSpeed;
  }
  if (nvidia.memoryTotal) {
    controller.memoryTotal = nvidia.memoryTotal;
    controller.vram = nvidia.memoryTotal;
    controller.vramDynamic = false;
  }
  if (nvidia.memoryUsed) {
    controller.memoryUsed = nvidia.memoryUsed;
  }
  if (nvidia.memoryFree) {
    controller.memoryFree = nvidia.memoryFree;
  }
  if (nvidia.utilizationGpu) {
    controller.utilizationGpu = nvidia.utilizationGpu;
  }
  if (nvidia.utilizationMemory) {
    controller.utilizationMemory = nvidia.utilizationMemory;
  }
  if (nvidia.temperatureGpu) {
    controller.temperatureGpu = nvidia.temperatureGpu;
  }
  if (nvidia.temperatureMemory) {
    controller.temperatureMemory = nvidia.temperatureMemory;
  }
  if (nvidia.powerDraw) {
    controller.powerDraw = nvidia.powerDraw;
  }
  if (nvidia.powerLimit) {
    controller.powerLimit = nvidia.powerLimit;
  }
  if (nvidia.clockCore) {
    controller.clockCore = nvidia.clockCore;
  }
  if (nvidia.clockMemory) {
    controller.clockMemory = nvidia.clockMemory;
  }
  return controller;
};
