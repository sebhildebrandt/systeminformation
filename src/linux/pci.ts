import { exec } from '../common/exec';
import { cloneObj, getValue, nextTick } from '../common';
import { PciData } from '../common/types';
import { initPciData } from '../common/defaults';
import { execOptsLinux } from '../common/const';

// machine-readable value like "Intel Corporation [8086]" -> { name, id }
const splitId = (value: string): { name: string; id: string } => {
  const match = value.match(/^(.*?)\s*\[([0-9a-fA-F]{4})\]\s*$/);
  if (match) {
    return { name: match[1].trim(), id: match[2].toLowerCase() };
  }
  return { name: value.trim(), id: '' };
};

const parsePci = (stdout: string): PciData[] => {
  const result: PciData[] = [];
  stdout.split(/\n\s*\n/).forEach((block) => {
    const lines = block.split('\n');
    const slot = getValue(lines, 'Slot', ':', true);
    if (!slot) {
      return;
    }
    const cls = splitId(getValue(lines, 'Class', ':', true));
    const vendor = splitId(getValue(lines, 'Vendor', ':', true));
    const device = splitId(getValue(lines, 'Device', ':', true));
    const svendor = splitId(getValue(lines, 'SVendor', ':', true));
    const sdevice = splitId(getValue(lines, 'SDevice', ':', true));
    const slotParts = slot.split(':');
    result.push({
      ...cloneObj(initPciData),
      slot,
      bus: slotParts.length >= 3 ? slotParts[1] : slotParts[0],
      type: cls.name,
      vendor: vendor.name,
      vendorId: vendor.id,
      model: device.name,
      deviceId: device.id,
      subVendorId: svendor.id,
      subDeviceId: sdevice.id,
      revision: getValue(lines, 'Rev', ':', true),
      driver: getValue(lines, 'Driver', ':', true)
    });
  });
  return result;
};

export const pci = async (): Promise<PciData[]> => {
  await nextTick();
  try {
    // -mm machine readable, -nn numeric+name ids, -k kernel driver
    const { stdout } = await exec('lspci -vmmnnk 2>/dev/null', execOptsLinux);
    return parsePci(stdout.toString());
  } catch {
    return [];
  }
};
