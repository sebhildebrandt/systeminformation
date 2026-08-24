import { findObjectByKey, nextTick, toInt } from '../common';
import { execOptsWin } from '../common/const';
import { execSave } from '../common/exec';
import { smartMonToolsInstalled } from '../common/filesys';
import { diskVendorFromModel } from '../common/mappings';
import type { DiskLayoutData } from '../common/types';
import { ps, psArray } from '../common/windows';

export const diskLayout = async (): Promise<DiskLayoutData[]> => {
  await nextTick();
  const result: DiskLayoutData[] = [];
  try {
    const [diskDrives, physicalDisks] = await Promise.all([
      ps.exec(
        'Get-CimInstance Win32_DiskDrive | select Caption,Size,Status,PNPDeviceId,DeviceId,BytesPerSector,TotalCylinders,TotalHeads,TotalSectors,TotalTracks,TracksPerCylinder,SectorsPerTrack,FirmwareRevision,SerialNumber,InterfaceType | ConvertTo-Json'
      ),
      ps.exec('Get-PhysicalDisk | select BusType,MediaType,FriendlyName,Model,SerialNumber,Size | ConvertTo-Json')
    ]);
    psArray(diskDrives).forEach((device: any) => {
      const size = toInt(device.Size);
      const status = String(device.Status || '')
        .trim()
        .toLowerCase();
      if (size) {
        result.push({
          device: device.DeviceId || '',
          type: JSON.stringify(device).indexOf('SSD') > -1 ? 'SSD' : 'HD', // just a starting point ... better: MSFT_PhysicalDisk - Media Type ... see below
          name: device.Caption || '',
          vendor: diskVendorFromModel(String(device.Caption || '').trim()),
          size,
          bytesPerSector: toInt(device.BytesPerSector),
          totalCylinders: toInt(device.TotalCylinders),
          totalHeads: toInt(device.TotalHeads),
          totalSectors: toInt(device.TotalSectors),
          totalTracks: toInt(device.TotalTracks),
          tracksPerCylinder: toInt(device.TracksPerCylinder),
          sectorsPerTrack: toInt(device.SectorsPerTrack),
          firmwareRevision: String(device.FirmwareRevision || '').trim(),
          serialNum: String(device.SerialNumber || '').trim(),
          interfaceType: String(device.InterfaceType || '').trim(),
          smartStatus: status === 'ok' ? 'Ok' : status === 'degraded' ? 'Degraded' : status === 'pred fail' ? 'Predicted Failure' : 'Unknown',
          temperature: null
        });
      }
    });
    psArray(physicalDisks).forEach((device: any) => {
      const serialNum = String(device.SerialNumber || '').trim();
      const name = String(device.FriendlyName || '')
        .trim()
        .replace('Msft ', 'Microsoft');
      const size = toInt(device.Size);
      const model = String(device.Model || '')
        .trim()
        .toLowerCase();
      const interfaceType = String(device.BusType || '').trim();
      let mediaType = String(device.MediaType ?? '').trim();
      if (mediaType === '3' || mediaType === 'HDD') {
        mediaType = 'HD';
      }
      if (mediaType === '4') {
        mediaType = 'SSD';
      }
      if (mediaType === '5') {
        mediaType = 'SCM';
      }
      if (mediaType === 'Unspecified' && (model.indexOf('virtual') > -1 || model.indexOf('vbox') > -1)) {
        mediaType = 'Virtual';
      }
      if (size) {
        let i = findObjectByKey(result, 'serialNum', serialNum);
        if (i === -1 || serialNum === '') {
          i = findObjectByKey(result, 'name', name);
        }
        if (i !== -1) {
          result[i].type = mediaType;
          result[i].interfaceType = interfaceType;
        }
      }
    });
    // S.M.A.R.T
    if (await smartMonToolsInstalled()) {
      try {
        const { stdout } = await execSave('smartctl --scan -j', execOptsWin);
        const smartDev = JSON.parse(stdout.trim());
        if (smartDev?.devices && smartDev.devices.length > 0) {
          for (const dev of smartDev.devices) {
            try {
              const { stdout: smartOut } = await execSave(`smartctl -j -a ${dev.name}`, execOptsWin);
              const smartData = JSON.parse(smartOut);
              if (smartData.serial_number) {
                const serialNum = smartData.serial_number;
                const i = findObjectByKey(result, 'serialNum', serialNum);
                if (i !== -1) {
                  result[i].smartStatus = smartData.smart_status?.passed ? 'Ok' : smartData.smart_status?.passed === false ? 'Predicted Failure' : 'unknown';
                  if (smartData.temperature?.current) {
                    result[i].temperature = smartData.temperature.current;
                  }
                  result[i].smartData = smartData;
                }
              }
            } catch {}
          }
        }
      } catch {}
    }
  } catch {
    return [];
  }
  return result;
};
