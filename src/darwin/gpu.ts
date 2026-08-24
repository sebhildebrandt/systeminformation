import { nextTick } from '../common';
import { plistParser } from '../common/darwin';
import { exec, shareInflight } from '../common/exec';
import { graphicsMetalVersion, graphicsModelToVendor, graphicsVendorToId } from '../common/mappings';
import { GpuData } from '../common/types';

const parseControllersDarwin = (graphicsArr: any[]): GpuData[] => {
  const controllers: GpuData[] = [];
  try {
    graphicsArr.forEach((item: any) => {
      const bus = (item.sppci_bus || '').indexOf('builtin') > -1 ? 'Built-In' : (item.sppci_bus || '').indexOf('pcie') > -1 ? 'PCIe' : '';
      const vram = (parseInt(item.spdisplays_vram || '', 10) || 0) * ((item.spdisplays_vram || '').indexOf('GB') > -1 ? 1024 : 1);
      const vramDyn = (parseInt(item.spdisplays_vram_shared || '', 10) || 0) * ((item.spdisplays_vram_shared || '').indexOf('GB') > -1 ? 1024 : 1);
      const metalVersion = graphicsMetalVersion(item.spdisplays_metal || item.spdisplays_metalfamily || '');
      controllers.push({
        vendor: graphicsModelToVendor(item.spdisplays_vendor || '') || item.spdisplays_vendor || '',
        model: item.sppci_model || '',
        bus,
        vramDynamic: bus === 'Built-In',
        vram: vram || vramDyn || null,
        deviceId: item['spdisplays_device-id'] || '',
        vendorId: item['spdisplays_vendor-id'] || graphicsVendorToId((item['spdisplays_vendor'] || '') + (item.sppci_model || '')),
        external: item.sppci_device_type === 'spdisplays_egpu',
        cores: item['sppci_cores'] || null,
        metalVersion
      });
    });
  } catch {}
  return controllers;
};

export const gpu = async () => {
  await nextTick();
  let result: GpuData[] = [];

  try {
    const { stdout } = await shareInflight('SPDisplaysDataType', () => exec('system_profiler -xml -detailLevel full SPDisplaysDataType'));
    result = parseControllersDarwin(plistParser(stdout));
    try {
      // GPU temperature (Apple Silicon) - optional macos-temperature-sensor dependency
      const macosTemp = require('macos-temperature-sensor');
      const temps = macosTemp.temperature();
      if (temps && temps.gpu) {
        for (const controller of result) {
          if (controller.bus === 'Built-In') {
            controller.temperatureGpu = Math.round(temps.gpu * 100) / 100;
          }
        }
      }
    } catch {}
  } catch {}
  return result;
};
