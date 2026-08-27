import { readdir, readFile, readlink } from 'fs/promises';
import { getValue, nextTick, toInt } from '../common';
import { execOptsLinux } from '../common/const';
import { exec, execSave } from '../common/exec';
import { mergeControllerNvidia, nvidiaDevices } from '../common/nvidia';
import { getRpiGpu, isRaspberry } from '../common/raspberry';
import { GpuData } from '../common/types';

type DrmMetrics = {
  busAddress: string;
  utilizationGpu: number | null;
  memoryTotal: number | null;
  memoryUsed: number | null;
  temperatureGpu: number | null;
  powerDraw: number | null;
  powerLimit: number | null;
  clockCore: number | null;
};

const readSysfs = async (file: string) => {
  try {
    return (await readFile(file, 'utf8')).trim();
  } catch {
    return '';
  }
};

// first candidate that holds a number wins; divisor converts the sysfs unit (m°C, µW, bytes)
// preferNonZero: idle GPUs report 0 in the "actual" clock nodes - keep looking for a current one
const readSysfsNumber = async (files: string[], divisor = 1, preferNonZero = false) => {
  let fallback: number | null = null;
  for (const file of files) {
    const value = Number.parseFloat(await readSysfs(file));
    if (Number.isNaN(value)) {
      continue;
    }
    if (!preferNonZero || value !== 0) {
      return value / divisor;
    }
    fallback = 0;
  }
  return fallback;
};

// amdgpu clock table: "1: 2100Mhz *" marks the current level
const parseAmdClock = (stdout: string) => {
  const line = stdout.split('\n').find((l) => l.includes('*'));
  const value = line ? Number.parseFloat(line.replace(/^\d+:\s*/, '')) : Number.NaN;
  return Number.isNaN(value) ? null : value;
};

// runtime values the kernel exposes per DRM card without root (i915, xe, amdgpu)
export const drmDevices = async (drmPath = '/sys/class/drm'): Promise<DrmMetrics[]> => {
  const devices: DrmMetrics[] = [];
  let cards: string[] = [];
  try {
    cards = (await readdir(drmPath)).filter((entry) => /^card\d+$/.test(entry));
  } catch {
    return devices;
  }
  for (const card of cards) {
    const cardPath = `${drmPath}/${card}`;
    const devicePath = `${cardPath}/device`;
    let busAddress = '';
    try {
      // symlink target ends with the PCI address, e.g. .../0000:00:02.0
      busAddress = ((await readlink(devicePath)).split('/').pop() || '').replace(/^0000:/, '');
    } catch {
      continue;
    }
    if (!/^[\da-f]{2}:[\da-f]{2}\.[\da-f]$/i.test(busAddress)) {
      continue;
    }
    let hwmon: string[] = [];
    try {
      hwmon = (await readdir(`${devicePath}/hwmon`)).map((node) => `${devicePath}/hwmon/${node}`);
    } catch {}
    const clockCore = await readSysfsNumber(
      [
        `${cardPath}/gt_act_freq_mhz`,
        `${cardPath}/gt_cur_freq_mhz`,
        `${cardPath}/gt/gt0/rps_act_freq_mhz`,
        `${cardPath}/gt/gt0/rps_cur_freq_mhz`,
        `${devicePath}/tile0/gt0/freq0/act_freq`,
        `${devicePath}/tile0/gt0/freq0/cur_freq`
      ],
      1,
      true
    );
    devices.push({
      busAddress,
      utilizationGpu: await readSysfsNumber([`${devicePath}/gpu_busy_percent`]),
      memoryTotal: await readSysfsNumber([`${devicePath}/mem_info_vram_total`], 1024 * 1024),
      memoryUsed: await readSysfsNumber([`${devicePath}/mem_info_vram_used`], 1024 * 1024),
      temperatureGpu: await readSysfsNumber(
        hwmon.map((node) => `${node}/temp1_input`),
        1000
      ),
      powerDraw: await readSysfsNumber(
        hwmon.map((node) => `${node}/power1_input`),
        1000000
      ),
      powerLimit: await readSysfsNumber(
        hwmon.map((node) => `${node}/power1_max`),
        1000000
      ),
      clockCore: clockCore !== null ? clockCore : parseAmdClock(await readSysfs(`${devicePath}/pp_dpm_sclk`))
    });
  }
  return devices;
};

// sysfs only fills gaps - values already delivered by nvidia-smi stay untouched
export const mergeControllerDrm = (controller: GpuData, drm?: DrmMetrics) => {
  if (!drm) {
    return controller;
  }
  if (controller.utilizationGpu === undefined && drm.utilizationGpu !== null) {
    controller.utilizationGpu = drm.utilizationGpu;
  }
  if (controller.memoryTotal === undefined && drm.memoryTotal) {
    controller.memoryTotal = drm.memoryTotal;
    if (controller.vram === null) {
      controller.vram = drm.memoryTotal;
      controller.vramDynamic = false;
    }
  }
  if (controller.memoryUsed === undefined && drm.memoryUsed !== null) {
    controller.memoryUsed = drm.memoryUsed;
    if (controller.memoryFree === undefined && drm.memoryTotal) {
      controller.memoryFree = drm.memoryTotal - drm.memoryUsed;
    }
  }
  if (controller.temperatureGpu === undefined && drm.temperatureGpu !== null) {
    controller.temperatureGpu = drm.temperatureGpu;
  }
  if (controller.powerDraw === undefined && drm.powerDraw !== null) {
    controller.powerDraw = drm.powerDraw;
  }
  if (controller.powerLimit === undefined && drm.powerLimit !== null) {
    controller.powerLimit = drm.powerLimit;
  }
  if (controller.clockCore === undefined && drm.clockCore !== null) {
    controller.clockCore = drm.clockCore;
  }
  return controller;
};

const parseLinesLinuxControllers = async (lines: string[]) => {
  const controllers: GpuData[] = [];
  let currentController: GpuData = {
    vendor: '',
    subVendor: '',
    model: '',
    bus: '',
    busAddress: '',
    vram: null,
    vramDynamic: false,
    pciID: ''
  };
  let isGraphicsController = false;
  // PCI bus IDs
  let pciIDs: string[] = [];
  try {
    const { stdout } = await exec('export LC_ALL=C; dmidecode -t 9 2>/dev/null; unset LC_ALL | grep "Bus Address: "', execOptsLinux);
    pciIDs = stdout.split('\n');
    for (let i = 0; i < pciIDs.length; i++) {
      pciIDs[i] = pciIDs[i].replace('Bus Address:', '').replace('0000:', '').trim();
    }
    pciIDs = pciIDs.filter(function (el) {
      return el != null && el;
    });
  } catch {}
  let i = 1;
  lines.forEach((line) => {
    let subsystem = '';
    if (i < lines.length && lines[i]) {
      // get next line;
      subsystem = lines[i];
      if (subsystem.indexOf(':') > 0) {
        subsystem = subsystem.split(':')[1];
      }
    }
    if ('' !== line.trim()) {
      if (' ' !== line[0] && '\t' !== line[0]) {
        // first line of new entry
        const isExternal = pciIDs.indexOf(line.split(' ')[0]) >= 0;
        let vgapos = line.toLowerCase().indexOf(' vga ');
        const _3dcontrollerpos = line.toLowerCase().indexOf('3d controller');
        const _displaycontrollerpos = line.toLowerCase().indexOf('display controller');
        if (vgapos !== -1 || _3dcontrollerpos !== -1 || _displaycontrollerpos !== -1) {
          // VGA
          if (_3dcontrollerpos !== -1 && vgapos === -1) {
            vgapos = _3dcontrollerpos;
          }
          if (_displaycontrollerpos !== -1 && vgapos === -1) {
            vgapos = _displaycontrollerpos;
          }
          if (currentController.vendor || currentController.model || currentController.bus || currentController.vram !== null || currentController.vramDynamic) {
            // already a controller found
            controllers.push(currentController);
            currentController = {
              vendor: '',
              model: '',
              bus: '',
              busAddress: '',
              vram: null,
              vramDynamic: false,
              pciID: ''
            };
          }

          const pciIDCandidate = line.split(' ')[0];
          if (/[\da-fA-F]{2}:[\da-fA-F]{2}\.[\da-fA-F]/.test(pciIDCandidate)) {
            currentController.busAddress = pciIDCandidate;
          }
          isGraphicsController = true;
          const endpos = line.search(/\[[0-9a-f]{4}:[0-9a-f]{4}]|$/);
          const parts = line.substring(vgapos, endpos).split(':');
          currentController.busAddress = line.substring(0, vgapos).trim();
          if (parts.length > 1) {
            parts[1] = parts[1].trim();
            if (parts[1].toLowerCase().indexOf('corporation') >= 0) {
              currentController.vendor = parts[1].substring(0, parts[1].toLowerCase().indexOf('corporation') + 11).trim();
              currentController.model = parts[1]
                .substring(parts[1].toLowerCase().indexOf('corporation') + 11, 200)
                .trim()
                .split('(')[0];
              currentController.bus = pciIDs.length > 0 && isExternal ? 'PCIe' : 'Onboard';
              currentController.vram = null;
              currentController.vramDynamic = false;
            } else if (parts[1].toLowerCase().indexOf(' inc.') >= 0) {
              if ((parts[1].match(/]/g) || []).length > 1) {
                currentController.vendor = parts[1].substring(0, parts[1].toLowerCase().indexOf(']') + 1).trim();
                currentController.model = parts[1]
                  .substring(parts[1].toLowerCase().indexOf(']') + 1, 200)
                  .trim()
                  .split('(')[0]
                  .trim();
              } else {
                currentController.vendor = parts[1].substring(0, parts[1].toLowerCase().indexOf(' inc.') + 5).trim();
                currentController.model = parts[1]
                  .substring(parts[1].toLowerCase().indexOf(' inc.') + 5, 200)
                  .trim()
                  .split('(')[0]
                  .trim();
              }
              currentController.bus = pciIDs.length > 0 && isExternal ? 'PCIe' : 'Onboard';
              currentController.vram = null;
              currentController.vramDynamic = false;
            } else if (parts[1].toLowerCase().indexOf(' ltd.') >= 0) {
              if ((parts[1].match(/]/g) || []).length > 1) {
                currentController.vendor = parts[1].substring(0, parts[1].toLowerCase().indexOf(']') + 1).trim();
                currentController.model = parts[1]
                  .substring(parts[1].toLowerCase().indexOf(']') + 1, 200)
                  .trim()
                  .split('(')[0]
                  .trim();
              } else {
                currentController.vendor = parts[1].substring(0, parts[1].toLowerCase().indexOf(' ltd.') + 5).trim();
                currentController.model = parts[1]
                  .substring(parts[1].toLowerCase().indexOf(' ltd.') + 5, 200)
                  .trim()
                  .split('(')[0]
                  .trim();
              }
            }
          }
          if (currentController.model && subsystem.indexOf(currentController.model) !== -1) {
            const subVendor = subsystem.split(currentController.model)[0].trim();
            if (subVendor) {
              currentController.subVendor = subVendor;
            }
          }
        } else {
          isGraphicsController = false;
        }
      }
      if (isGraphicsController) {
        // within VGA details
        const parts = line.split(':');
        if (parts.length > 1 && parts[0].replace(/ +/g, '').toLowerCase().indexOf('devicename') !== -1 && parts[1].toLowerCase().indexOf('onboard') !== -1) {
          currentController.bus = 'Onboard';
        }
        if (parts.length > 1 && parts[0].replace(/ +/g, '').toLowerCase().indexOf('region') !== -1 && parts[1].toLowerCase().indexOf('memory') !== -1) {
          const sizeMatch = parts[1].match(/size=(\d+)([KMG])?/i);
          if (sizeMatch) {
            let vram = parseInt(sizeMatch[1], 10);
            const unit = (sizeMatch[2] || '').toUpperCase();
            if (unit === 'G') {
              vram *= 1024;
            } else if (unit === 'K') {
              vram = Math.round(vram / 1024);
            } else if (unit === '') {
              vram = Math.round(vram / 1024 / 1024);
            } // bytes
            // keep the largest memory region (the actual framebuffer aperture)
            if (currentController.vram === null || vram > currentController.vram) {
              currentController.vram = vram;
            }
          }
        }
      }
    }
    i++;
  });
  if (currentController.vendor || currentController.model || currentController.bus || currentController.busAddress || currentController.vram !== null || currentController.vramDynamic) {
    // already a controller found
    controllers.push(currentController);
  }
  return controllers;
};

const parseLinesLinuxClinfo = (controllers: GpuData[], lines: string[]) => {
  const fieldPattern = /\[([^\]]+)\]\s+(\w+)\s+(.*)/;
  const devices = lines.reduce((device: { [index: string]: any }, line) => {
    const field = fieldPattern.exec(line.trim());
    if (field) {
      if (!device[field[1]]) {
        device[field[1]] = {};
      }
      device[field[1]][field[2]] = field[3];
    }
    return device;
  }, {});
  for (const deviceId in devices) {
    const device = devices[deviceId];
    if (device['CL_DEVICE_TYPE'] === 'CL_DEVICE_TYPE_GPU') {
      let busAddress = '';
      if (device['CL_DEVICE_TOPOLOGY_AMD']) {
        const bdf = device['CL_DEVICE_TOPOLOGY_AMD'].match(/[a-zA-Z0-9]+:\d+\.\d+/);
        if (bdf) {
          busAddress = bdf[0];
        }
      } else if (device['CL_DEVICE_PCI_BUS_ID_NV'] && device['CL_DEVICE_PCI_SLOT_ID_NV']) {
        const bus = parseInt(device['CL_DEVICE_PCI_BUS_ID_NV']);
        const slot = parseInt(device['CL_DEVICE_PCI_SLOT_ID_NV']);
        if (!isNaN(bus) && !isNaN(slot)) {
          const b = bus & 0xff;
          const d = (slot >> 3) & 0xff;
          const f = slot & 0x07;
          busAddress = `${b.toString().padStart(2, '0')}:${d.toString().padStart(2, '0')}.${f}`;
        }
      }
      if (busAddress) {
        let controller = controllers.find((controller) => controller.busAddress === busAddress);
        if (!controller) {
          controller = {
            vendor: '',
            model: '',
            bus: '',
            busAddress,
            vram: null,
            vramDynamic: false
          };
          controllers.push(controller);
        }
        controller.vendor = device['CL_DEVICE_VENDOR'];
        if (device['CL_DEVICE_BOARD_NAME_AMD']) {
          controller.model = device['CL_DEVICE_BOARD_NAME_AMD'];
        } else {
          controller.model = device['CL_DEVICE_NAME'];
        }
        const memory = parseInt(device['CL_DEVICE_GLOBAL_MEM_SIZE']);
        if (!isNaN(memory)) {
          controller.vram = Math.round(memory / 1024 / 1024);
        }
      }
    }
  }
  return controllers;
};

export const gpu = async () => {
  await nextTick();
  let result: GpuData[] = [];

  try {
    // Raspberry: https://elinux.org/RPI_vcgencmd_usage
    if (await isRaspberry()) {
      const { stdout } = await exec('vcgencmd get_mem gpu 2> /dev/null', execOptsLinux);
      const lines = stdout.split('\n');
      if (lines.length >= 1 && stdout.toString().indexOf('gpu=') >= 0) {
        result.push({
          vendor: 'Broadcom',
          model: await getRpiGpu(),
          bus: '',
          vram: toInt(getValue(lines, 'gpu', '=').replace('M', '')),
          vramDynamic: true
        });
      }
    }

    let stdout = '';
    try {
      ({ stdout } = await execSave('lspci -vvv  2>/dev/null'));
      const lines = stdout.toString().split('\n');
      if (result.length === 0) {
        result = await parseLinesLinuxControllers(lines);
        const nvidiaData = (await nvidiaDevices()).filter((item: any) => item !== null);
        // needs to be rewritten ... using no spread operators
        result = result.map((controller) => {
          // match by busAddress
          return mergeControllerNvidia(controller, nvidiaData.find((contr: any) => contr.pciBus && controller.busAddress && contr.pciBus.toLowerCase().endsWith(controller.busAddress.toLowerCase())) || {});
        });
      }

      const drmData = await drmDevices();
      if (drmData.length) {
        result = result.map((controller) =>
          mergeControllerDrm(
            controller,
            drmData.find((device) => controller.busAddress && device.busAddress.toLowerCase() === controller.busAddress.toLowerCase())
          )
        );
      }

      try {
        ({ stdout } = await execSave('clinfo --raw'));
        const lines = stdout.split('\n');
        result = parseLinesLinuxClinfo(result, lines);
      } catch {}
    } catch {}
  } catch {}
  return result;
};
