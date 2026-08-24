import { nextTick } from '../common';
import { execOptsLinux } from '../common/const';
import { exec } from '../common/exec';
import { blkStdoutToObject, parseLinuxBlk } from '../common/filesys';
import { diskVendorFromModel } from '../common/mappings';
import { sanitizeShellString } from '../common/security';
import { DiskLayoutData } from '../common/types';

export const diskLayout = async (): Promise<DiskLayoutData[]> => {
  await nextTick();
  const result: DiskLayoutData[] = [];
  let stdout = '';
  let cmd = '';
  let cmdFullSmart = '';
  try {
    ({ stdout } = await exec('export LC_ALL=C; lsblk -ablJO 2>/dev/null; unset LC_ALL', execOptsLinux));
    const out = stdout.trim();
    let devices = [];
    try {
      const outJSON = JSON.parse(out);
      if (outJSON && Object.keys(outJSON).includes('blockdevices')) {
        devices = outJSON.blockdevices.filter((item: any) => {
          return (
            item.type === 'disk' &&
            item.size > 0 &&
            (item.model !== null ||
              (item.mountpoint === null &&
                item.label === null &&
                item.fstype === null &&
                item.parttype === null &&
                item.path &&
                item.path.indexOf('/ram') !== 0 &&
                item.path.indexOf('/loop') !== 0 &&
                item['disc-max'] &&
                item['disc-max'] !== 0))
          );
        });
      }
    } catch (e) {
      // fallback to older version of lsblk
      try {
        ({ stdout } = await exec('export LC_ALL=C; lsblk -bPo NAME,TYPE,SIZE,FSTYPE,MOUNTPOINT,UUID,ROTA,RO,RM,LABEL,MODEL,OWNER,GROUP 2>/dev/null; unset LC_ALL', execOptsLinux));
        const lines = blkStdoutToObject(stdout).split('\n');
        const data = parseLinuxBlk(lines);
        devices = data.filter((item) => {
          return item.type === 'disk' && item.size > 0 && ((item.model !== null && item.model !== '') || (item.mount === '' && item.label === '' && item.fsType === ''));
        });
      } catch {}
    }
    for (const device of devices) {
      let mediumType = '';
      const logical = sanitizeShellString(device.name || '', true);
      const bsdName = '/dev/' + logical;
      try {
        ({ stdout } = await exec('cat /sys/block/' + logical + '/queue/rotational 2>/dev/null', execOptsLinux));
        mediumType = stdout.split('\n')[0];
      } catch {}
      let interfaceType = device.tran ? device.tran.toUpperCase().trim() : '';
      if (interfaceType === 'NVME') {
        mediumType = '2';
        interfaceType = 'PCIe';
      }
      result.push({
        device: bsdName,
        type:
          mediumType === '0'
            ? 'SSD'
            : mediumType === '1'
              ? 'HD'
              : mediumType === '2'
                ? 'NVMe'
                : device.model && device.model.indexOf('SSD') > -1
                  ? 'SSD'
                  : device.model && device.model.indexOf('NVM') > -1
                    ? 'NVMe'
                    : 'HD',
        name: device.model || '',
        vendor: diskVendorFromModel(device.model) || (device.vendor ? device.vendor.trim() : ''),
        size: device.size || 0,
        bytesPerSector: null,
        totalCylinders: null,
        totalHeads: null,
        totalSectors: null,
        totalTracks: null,
        tracksPerCylinder: null,
        sectorsPerTrack: null,
        firmwareRevision: device.rev ? device.rev.trim() : '',
        serialNum: device.serial ? device.serial.trim() : '',
        interfaceType: interfaceType,
        smartStatus: 'unknown',
        temperature: null,
        bsdName: bsdName
      });
      cmd += `printf "\n${bsdName}|"; smartctl -H ${bsdName} | grep overall;`;
      cmdFullSmart += `${cmdFullSmart ? 'printf ",";' : ''}smartctl -a -j ${bsdName};`;
    }
    // check S.M.A.R.T. status
    try {
      ({ stdout } = await exec(cmdFullSmart, execOptsLinux));
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
        ({ stdout } = await exec(cmd, execOptsLinux));
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
