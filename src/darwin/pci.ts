import { plistParser } from '../common/darwin';
import { cloneObj, nextTick } from '../common';
import { exec } from '../common/exec';
import { PciData } from '../common/types';
import { initPciData } from '../common/defaults';

const hexId = (value: string): string => (value || '').replace(/^0x/i, '').toLowerCase();

const parsePci = (data: any[]): PciData[] => {
  const result: PciData[] = [];
  (data || []).forEach((el: any) => {
    result.push({
      ...cloneObj(initPciData),
      slot: el.sppci_slot_name || '',
      bus: el.sppci_bus || '',
      type: (el.sppci_device_type || '').replace('sppci_type_', ''),
      model: el.sppci_model || el._name || el.sppci_name || '',
      vendorId: hexId(el['sppci_vendor-id']),
      deviceId: hexId(el['sppci_device-id']),
      subVendorId: hexId(el['sppci_subsystem-vendor-id']),
      subDeviceId: hexId(el['sppci_subsystem-id']),
      revision: hexId(el['sppci_revision-id'])
    });
  });
  return result;
};

export const pci = async (): Promise<PciData[]> => {
  await nextTick();

  try {
    const { stdout } = await exec('system_profiler SPPCIDataType -xml');
    return parsePci(plistParser(stdout));
  } catch {
    return [];
  }
};
