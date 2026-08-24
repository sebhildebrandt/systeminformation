import { getValue, nextTick, toInt } from '../common';
import { mergeControllerNvidia, nvidiaDevices } from '../common/nvidia';
import type { GpuData } from '../common/types';
import { shareInflight } from '../common/exec';
import { ps } from '../common/windows';

const parseLinesWindowsControllers = (sections: any[], vections: any[]) => {
  const memorySizes: any = {};
  for (const i in vections) {
    if (Object.prototype.hasOwnProperty.call(vections, i)) {
      if (vections[i].trim() !== '') {
        const lines = vections[i].trim().split('\n');
        const matchingDeviceId = getValue(lines, 'MatchingDeviceId').match(/PCI\\(VEN_[0-9A-F]{4})&(DEV_[0-9A-F]{4})(?:&(SUBSYS_[0-9A-F]{8}))?(?:&(REV_[0-9A-F]{2}))?/i);
        if (matchingDeviceId) {
          const quadWordmemorySize = toInt(getValue(lines, 'HardwareInformation.qwMemorySize'));
          if (!Number.isNaN(quadWordmemorySize)) {
            let deviceId = `${matchingDeviceId[1].toUpperCase()}&${matchingDeviceId[2].toUpperCase()}`;
            if (matchingDeviceId[3]) {
              deviceId += `&${matchingDeviceId[3].toUpperCase()}`;
            }
            if (matchingDeviceId[4]) {
              deviceId += `&${matchingDeviceId[4].toUpperCase()}`;
            }
            memorySizes[deviceId] = quadWordmemorySize;
          }
        }
      }
    }
  }

  const controllers: GpuData[] = [];
  for (const i in sections) {
    if (Object.prototype.hasOwnProperty.call(sections, i)) {
      if (sections[i].trim() !== '') {
        const lines = sections[i].trim().split('\n');
        const pnpDeviceId = getValue(lines, 'PNPDeviceID', ':').match(/PCI\\(VEN_[0-9A-F]{4})&(DEV_[0-9A-F]{4})(?:&(SUBSYS_[0-9A-F]{8}))?(?:&(REV_[0-9A-F]{2}))?/i);
        let subDeviceId = '';
        let memorySize = null;
        if (pnpDeviceId) {
          subDeviceId = pnpDeviceId[3] || '';
          if (subDeviceId) {
            subDeviceId = subDeviceId.split('_')[1] || '';
          }

          // Match PCI device identifier (there's an order of increasing generality):
          // https://docs.microsoft.com/en-us/windows-hardware/drivers/install/identifiers-for-pci-devices

          // PCI\VEN_v(4)&DEV_d(4)&SUBSYS_s(4)n(4)&REV_r(2)
          if (memorySize == null && pnpDeviceId[3] && pnpDeviceId[4]) {
            const deviceId = `${pnpDeviceId[1].toUpperCase()}&${pnpDeviceId[2].toUpperCase()}&${pnpDeviceId[3].toUpperCase()}&${pnpDeviceId[4].toUpperCase()}`;
            if (Object.prototype.hasOwnProperty.call(memorySizes, deviceId)) {
              memorySize = memorySizes[deviceId];
            }
          }

          // PCI\VEN_v(4)&DEV_d(4)&SUBSYS_s(4)n(4)
          if (memorySize == null && pnpDeviceId[3]) {
            const deviceId = `${pnpDeviceId[1].toUpperCase()}&${pnpDeviceId[2].toUpperCase()}&${pnpDeviceId[3].toUpperCase()}`;
            if (Object.prototype.hasOwnProperty.call(memorySizes, deviceId)) {
              memorySize = memorySizes[deviceId];
            }
          }

          // PCI\VEN_v(4)&DEV_d(4)&REV_r(2)
          if (memorySize == null && pnpDeviceId[4]) {
            const deviceId = `${pnpDeviceId[1].toUpperCase()}&${pnpDeviceId[2].toUpperCase()}&${pnpDeviceId[4].toUpperCase()}`;
            if (Object.prototype.hasOwnProperty.call(memorySizes, deviceId)) {
              memorySize = memorySizes[deviceId];
            }
          }

          // PCI\VEN_v(4)&DEV_d(4)
          if (memorySize == null) {
            const deviceId = `${pnpDeviceId[1].toUpperCase()}&${pnpDeviceId[2].toUpperCase()}`;
            if (Object.prototype.hasOwnProperty.call(memorySizes, deviceId)) {
              memorySize = memorySizes[deviceId];
            }
          }
        }

        controllers.push({
          vendor: getValue(lines, 'AdapterCompatibility', ':'),
          model: getValue(lines, 'name', ':'),
          bus: getValue(lines, 'PNPDeviceID', ':').startsWith('PCI') ? 'PCI' : '',
          vram: (memorySize == null ? toInt(getValue(lines, 'AdapterRAM', ':')) : memorySize) / 1024 / 1024,
          vramDynamic: getValue(lines, 'VideoMemoryType', ':') === '2',
          subDeviceId
        });
      }
    }
  }
  return controllers;
};

export const gpu = async () => {
  await nextTick();
  let result: GpuData[] = [];

  try {
    const workload = [];
    workload.push(shareInflight('win32_VideoController', () => ps.exec('Get-CimInstance win32_VideoController | fl *')));
    workload.push(
      ps.exec(
        'gp "HKLM:\\SYSTEM\\ControlSet001\\Control\\Class\\{4d36e968-e325-11ce-bfc1-08002be10318}\\*" -ErrorAction SilentlyContinue | where MatchingDeviceId $null -NE | select MatchingDeviceId,HardwareInformation.qwMemorySize | fl'
      )
    );

    const nvidiaData = (await nvidiaDevices()).filter((item) => item !== null);
    const data = await Promise.allSettled(workload).then((results) => results.map((result) => (result.status === 'fulfilled' ? result.value : '')));
    // controller + vram
    const csections = data[0]
      .toString()
      .replace(/\r/g, '')
      .split(/\n\s*\n/);
    const vsections = data[1]
      .toString()
      .replace(/\r/g, '')
      .split(/\n\s*\n/);
    result = parseLinesWindowsControllers(csections, vsections);
    result = result.map((controller) => {
      // match by subDeviceId
      if (controller.vendor.toLowerCase() === 'nvidia') {
        return mergeControllerNvidia(
          controller,
          nvidiaData.find((device) => {
            let windowsSubDeviceId = (controller.subDeviceId || '').toLowerCase();
            const nvidiaSubDeviceIdParts = (device ? device.subDeviceId || '' : '').split('x');
            let nvidiaSubDeviceId = nvidiaSubDeviceIdParts.length > 1 ? nvidiaSubDeviceIdParts[1].toLowerCase() : nvidiaSubDeviceIdParts[0].toLowerCase();
            const lengthDifference = Math.abs(windowsSubDeviceId.length - nvidiaSubDeviceId.length);
            if (windowsSubDeviceId.length > nvidiaSubDeviceId.length) {
              for (let i = 0; i < lengthDifference; i++) {
                nvidiaSubDeviceId = `0${nvidiaSubDeviceId}`;
              }
            } else if (windowsSubDeviceId.length < nvidiaSubDeviceId.length) {
              for (let i = 0; i < lengthDifference; i++) {
                windowsSubDeviceId = `0${windowsSubDeviceId}`;
              }
            }
            return windowsSubDeviceId === nvidiaSubDeviceId;
          }) || {}
        );
      } else {
        return controller;
      }
    });
  } catch {}
  return result;
};
