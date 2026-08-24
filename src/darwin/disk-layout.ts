import { nextTick } from '../common';
import { MAX_BUFFER_SIZE } from '../common/const';
import { plistParser } from '../common/darwin';
import { exec, execSave } from '../common/exec';
import { diskVendorFromModel } from '../common/mappings';
import type { DiskLayoutData } from '../common/types';

export const diskLayout = async (): Promise<DiskLayoutData[]> => {
  await nextTick();
  const result: DiskLayoutData[] = [];
  let stdout = '';
  let cmd = '';
  let cmdFullSmart = '';

  try {
    ({ stdout } = await exec(`system_profiler SPSerialATADataType SPNVMeDataType SPUSBDataType SPStorageDataType -xml`, { maxBuffer: MAX_BUFFER_SIZE }));
    const data = plistParser(stdout, false);
    const diskSATA = data.length >= 4 && data[0]._items ? data[0]._items : [];
    const diskNVME = data.length >= 4 && data[1]._items ? data[1]._items : [];
    const diskUSB = data.length >= 4 && data[2]._items ? data[2]._items : [];
    const diskLine = data.length >= 4 && data[3]._items ? data[3]._items : [];
    // Serial ATA Drives
    if (diskSATA?.length && diskSATA._items) {
      diskSATA.forEach((controller: any) => {
        if (controller?._items && controller._items.length) {
          // const mediumType = util.getValue(lines, 'Medium Type', ':', true).trim();
          // mediumType.startsWith('Solid') ? 'SSD' : 'HD',
          const deviceType = controller._names && controller._names.tolower().indexOf('ssd') >= 0 ? 'SSD' : 'HD'; // based on controller type
          controller._items.forEach((disk: any) => {
            result.push({
              device: disk.bsd_name,
              type: deviceType,
              name: disk._name || '',
              vendor: diskVendorFromModel(disk.device_model || disk.manufacturer || disk._name),
              size: disk.size_in_bytes,
              bytesPerSector: null,
              totalCylinders: null,
              totalHeads: null,
              totalSectors: null,
              totalTracks: null,
              tracksPerCylinder: null,
              sectorsPerTrack: null,
              firmwareRevision: disk.device_revision || '',
              serialNum: disk.device_serial || '',
              interfaceType: 'PCIe ' + (disk.spnvme_linkwidth || ''), // util.getValue(lines, 'InterfaceType', ':', true).trim(),
              smartStatus: disk.smart_status === 'verified' ? 'OK' : disk.smart_status || 'unknown',
              temperature: null,
              bsdName: disk.bsd_name
            });
            cmd += 'printf "\n' + disk.bsd_name + '|"; diskutil info /dev/' + disk.bsd_name + ' | grep SMART;';
            cmdFullSmart += `${cmdFullSmart ? 'printf ",";' : ''}smartctl -a -j ${disk.bsd_name};`;
          });
        }
      });
    }
    // NVME Drives
    if (diskNVME?.length) {
      diskNVME.forEach((controller: any) => {
        if (controller?._items && controller._items.length) {
          controller._items.forEach((disk: any) => {
            result.push({
              device: disk.bsd_name,
              type: 'NVMe',
              name: disk._name || '',
              vendor: diskVendorFromModel(disk.device_model || disk.manufacturer || disk._name),
              size: disk.size_in_bytes,
              bytesPerSector: null,
              totalCylinders: null,
              totalHeads: null,
              totalSectors: null,
              totalTracks: null,
              tracksPerCylinder: null,
              sectorsPerTrack: null,
              firmwareRevision: disk.device_revision || '',
              serialNum: disk.device_serial || '',
              interfaceType: 'PCIe ' + (disk.spnvme_linkwidth || ''),
              smartStatus: disk.smart_status === 'verified' ? 'OK' : disk.smart_status || 'unknown',
              temperature: null,
              bsdName: disk.bsd_name
            });
            cmd += 'printf "\n' + disk.bsd_name + '|"; diskutil info /dev/' + disk.bsd_name + ' | grep SMART;';
            cmdFullSmart += `${cmdFullSmart ? 'printf ",";' : ''}smartctl -a -j ${disk.bsd_name};`;
          });
        }
      });
    }
    // USB Drives
    if (diskUSB?.length) {
      diskUSB.forEach((controller: any) => {
        if (controller?._items && controller._items.length) {
          controller._items.forEach((disk: any) => {
            if (disk.Media?.length && disk.Media[0] && disk.Media[0].size_in_bytes && disk.Media[0].bsd_name) {
              const media = disk.Media[0];
              result.push({
                device: media.bsd_name,
                type: 'USB',
                name: disk._name || '',
                vendor: diskVendorFromModel(disk.manufacturer || disk.vendor_id || disk._name) || disk.manufacturer || '',
                size: media.size_in_bytes,
                bytesPerSector: null,
                totalCylinders: null,
                totalHeads: null,
                totalSectors: null,
                totalTracks: null,
                tracksPerCylinder: null,
                sectorsPerTrack: null,
                firmwareRevision: disk.device_revision || '',
                serialNum: disk.serial_num || '',
                interfaceType: 'USB',
                smartStatus: disk.smart_status === 'verified' ? 'OK' : disk.smart_status || 'unknown',
                temperature: null,
                bsdName: media.bsd_name
              });
              cmd += 'printf "\n' + media.bsd_name + '|"; diskutil info /dev/' + media.bsd_name + ' | grep SMART;';
              cmdFullSmart += `${cmdFullSmart ? 'printf ",";' : ''}smartctl -a -j ${disk.bsd_name};`;
            } else if (disk?._items.length) {
              disk._items.forEach((subdisk: any) => {
                if (subdisk.Media && subdisk.Media?.length && subdisk.Media[0] && subdisk.Media[0].size_in_bytes && subdisk.Media[0].bsd_name) {
                  const media = subdisk.Media[0];
                  result.push({
                    device: media.bsd_name,
                    type: 'USB',
                    name: subdisk._name || '',
                    vendor: diskVendorFromModel(subdisk.manufacturer || subdisk.vendor_id || subdisk._name) || subdisk.manufacturer || '',
                    size: media.size_in_bytes,
                    bytesPerSector: null,
                    totalCylinders: null,
                    totalHeads: null,
                    totalSectors: null,
                    totalTracks: null,
                    tracksPerCylinder: null,
                    sectorsPerTrack: null,
                    firmwareRevision: subdisk.device_revision || '',
                    serialNum: subdisk.serial_num || '',
                    interfaceType: 'USB',
                    smartStatus: subdisk.smart_status === 'verified' ? 'OK' : subdisk.smart_status || 'unknown',
                    temperature: null,
                    bsdName: media.bsd_name
                  });
                }
              });
            }
          });
        }
      });
    }

    // Storage volumes (SPStorageDataType) — add physical drives not already covered above.
    // Dedup on the physical drive's model name: multiple volumes (and the APFS container vs. its
    // backing NVMe/SATA disk) share the same device_name but have different bsd_names.
    if (diskLine?.length) {
      const known = new Set(result.map((d) => d.name).filter(Boolean));
      diskLine.forEach((disk: any) => {
        const pd = disk.physical_drive || {};
        const name = pd.device_name || disk._name || '';
        const bsdName = (disk.bsd_name || '').match(/^disk\d+/)?.[0];
        if (!name || !bsdName || known.has(name)) {
          return;
        }
        known.add(name);
        const smart = (pd.smart_status || '').toLowerCase();
        result.push({
          device: bsdName,
          type: pd.protocol === 'USB' ? 'USB' : pd.medium_type === 'ssd' ? 'SSD' : 'HD',
          name,
          vendor: diskVendorFromModel(pd.device_name || disk._name),
          size: disk.size_in_bytes,
          bytesPerSector: null,
          totalCylinders: null,
          totalHeads: null,
          totalSectors: null,
          totalTracks: null,
          tracksPerCylinder: null,
          sectorsPerTrack: null,
          firmwareRevision: '',
          serialNum: '',
          interfaceType: pd.protocol || '',
          smartStatus: smart === 'verified' ? 'OK' : smart || 'unknown',
          temperature: null,
          bsdName
        });
        cmdFullSmart += `${cmdFullSmart ? 'printf ",";' : ''}smartctl -a -j ${bsdName};`;
      });
    }

    // check S.M.A.R.T. status
    try {
      ({ stdout } = await execSave(cmdFullSmart, { maxBuffer: MAX_BUFFER_SIZE }));
      const data = JSON.parse(`[${stdout}]`);
      data.forEach((disk: any) => {
        const bsdName = disk.smartctl.argv[disk.smartctl.argv.length - 1];

        for (let i = 0; i < result.length; i++) {
          if (result[i].bsdName === bsdName) {
            result[i].smartStatus = disk.smart_status.passed ? 'Ok' : disk.smart_status.passed === false ? 'Predicted Failure' : 'unknown';
            if (disk.temperature && disk.temperature.current) {
              result[i].temperature = disk.temperature.current;
            }
            result[i].smartData = disk;
          }
        }
      });
      cmd = '';
    } catch {}
    if (cmd) {
      cmd = cmd + 'printf "\n"';
      try {
        ({ stdout } = await exec(cmd, { maxBuffer: MAX_BUFFER_SIZE }));
        const lines = stdout.split('\n');
        lines.forEach((line) => {
          if (line) {
            const parts = line.split('|');
            if (parts.length === 2) {
              const bsdName = parts[0];
              parts[1] = parts[1].trim();
              const parts2 = parts[1].split(':');
              if (parts2.length === 2) {
                parts2[1] = parts2[1].trim();
                const status = parts2[1].toLowerCase();
                for (let i = 0; i < result.length; i++) {
                  if (result[i].bsdName === bsdName) {
                    result[i].smartStatus = status === 'passed' ? 'Ok' : status === 'failed!' ? 'Predicted Failure' : 'unknown';
                  }
                }
              }
            }
          }
        });
      } catch {}
    }
    for (let i = 0; i < result.length; i++) {
      delete result[i].bsdName;
    }
    return result;
  } catch {
    return [];
  }
};
