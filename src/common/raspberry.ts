import { readFile } from 'fs/promises';
import { getValue, hex2bin } from './index';
import type { RaspberryFullRevisionData } from './types';

let _rpi_cpuinfo: string[] = [];

export const decodePiCpuinfo = (lines?: string[]) => {
  if (_rpi_cpuinfo.length === 0) {
    _rpi_cpuinfo = lines || [];
  }
  if (lines === undefined) {
    lines = _rpi_cpuinfo;
  }

  // reference values: https://elinux.org/RPi_HardwareHistory
  // https://www.raspberrypi.org/documentation/hardware/raspberrypi/revision-codes/README.md
  // https://www.raspberrypi.com/documentation/computers/raspberry-pi.html#hardware-revision-codes

  const oldRevisionCodes: any = {
    '0002': {
      type: 'B',
      revision: '1.0',
      memory: 256,
      manufacturer: 'Egoman',
      processor: 'BCM2835'
    },
    '0003': {
      type: 'B',
      revision: '1.0',
      memory: 256,
      manufacturer: 'Egoman',
      processor: 'BCM2835'
    },
    '0004': {
      type: 'B',
      revision: '2.0',
      memory: 256,
      manufacturer: 'Sony UK',
      processor: 'BCM2835'
    },
    '0005': {
      type: 'B',
      revision: '2.0',
      memory: 256,
      manufacturer: 'Qisda',
      processor: 'BCM2835'
    },
    '0006': {
      type: 'B',
      revision: '2.0',
      memory: 256,
      manufacturer: 'Egoman',
      processor: 'BCM2835'
    },
    '0007': {
      type: 'A',
      revision: '2.0',
      memory: 256,
      manufacturer: 'Egoman',
      processor: 'BCM2835'
    },
    '0008': {
      type: 'A',
      revision: '2.0',
      memory: 256,
      manufacturer: 'Sony UK',
      processor: 'BCM2835'
    },
    '0009': {
      type: 'A',
      revision: '2.0',
      memory: 256,
      manufacturer: 'Qisda',
      processor: 'BCM2835'
    },
    '000d': {
      type: 'B',
      revision: '2.0',
      memory: 512,
      manufacturer: 'Egoman',
      processor: 'BCM2835'
    },
    '000e': {
      type: 'B',
      revision: '2.0',
      memory: 512,
      manufacturer: 'Sony UK',
      processor: 'BCM2835'
    },
    '000f': {
      type: 'B',
      revision: '2.0',
      memory: 512,
      manufacturer: 'Egoman',
      processor: 'BCM2835'
    },
    '0010': {
      type: 'B+',
      revision: '1.2',
      memory: 512,
      manufacturer: 'Sony UK',
      processor: 'BCM2835'
    },
    '0011': {
      type: 'CM1',
      revision: '1.0',
      memory: 512,
      manufacturer: 'Sony UK',
      processor: 'BCM2835'
    },
    '0012': {
      type: 'A+',
      revision: '1.1',
      memory: 256,
      manufacturer: 'Sony UK',
      processor: 'BCM2835'
    },
    '0013': {
      type: 'B+',
      revision: '1.2',
      memory: 512,
      manufacturer: 'Embest',
      processor: 'BCM2835'
    },
    '0014': {
      type: 'CM1',
      revision: '1.0',
      memory: 512,
      manufacturer: 'Embest',
      processor: 'BCM2835'
    },
    '0015': {
      type: 'A+',
      revision: '1.1',
      memory: 256,
      manufacturer: '512MB	Embest',
      processor: 'BCM2835'
    }
  };

  const processorList = ['BCM2835', 'BCM2836', 'BCM2837', 'BCM2711', 'BCM2712'];
  const manufacturerList = ['Sony UK', 'Egoman', 'Embest', 'Sony Japan', 'Embest', 'Stadium'];
  const typeList: any = {
    '00': 'A',
    '01': 'B',
    '02': 'A+',
    '03': 'B+',
    '04': '2B',
    '05': 'Alpha (early prototype)',
    '06': 'CM1',
    '08': '3B',
    '09': 'Zero',
    '0a': 'CM3',
    '0c': 'Zero W',
    '0d': '3B+',
    '0e': '3A+',
    '0f': 'Internal use only',
    '10': 'CM3+',
    '11': '4B',
    '12': 'Zero 2 W',
    '13': '400',
    '14': 'CM4',
    '15': 'CM4S',
    '16': 'Internal use only',
    '17': '5',
    '18': 'CM5 (EMMC)',
    '19': '500',
    '1a': 'CM5 (Lite)'
  };

  const revisionCode = getValue(lines, 'revision', ':', true);
  const model = getValue(lines, 'model:', ':', true);
  const serial = getValue(lines, 'serial', ':', true);

  let result: RaspberryFullRevisionData = {
    model: '',
    serial: '',
    revisionCode: '',
    memory: 0,
    manufacturer: '',
    processor: '',
    type: '',
    revision: ''
  };
  if (Object.keys(oldRevisionCodes).includes(revisionCode)) {
    // old revision codes
    result = {
      model,
      serial,
      revisionCode,
      memory: oldRevisionCodes[revisionCode].memory,
      manufacturer: oldRevisionCodes[revisionCode].manufacturer,
      processor: oldRevisionCodes[revisionCode].processor,
      type: oldRevisionCodes[revisionCode].type,
      revision: oldRevisionCodes[revisionCode].revision
    };
  } else {
    // new revision code
    const revision = `00000000${getValue(lines, 'revision', ':', true).toLowerCase()}`.substr(-8);
    // const revisionStyleNew = hex2bin(revision.substr(2, 1)).substr(4, 1) === '1';
    const memSizeCode = parseInt(hex2bin(revision.substr(2, 1)).substr(5, 3), 2) || 0;
    const manufacturer = manufacturerList[parseInt(revision.substr(3, 1), 10)];
    const processor = processorList[parseInt(revision.substr(4, 1), 10)];
    const typeCode = revision.substr(5, 2);

    result = {
      model,
      serial,
      revisionCode,
      memory: 256 * Math.pow(2, memSizeCode),
      manufacturer,
      processor,
      type: Object.keys(typeList).includes(typeCode) ? typeList[typeCode] : '',
      revision: '1.' + revision.substr(7, 1)
    };
  }
  return result;
};

let _is_raspberry: boolean | null = null;

export const isRaspberry = async (cpuinfo?: string[]) => {
  if (_is_raspberry !== null) {
    return _is_raspberry;
  }
  const PI_MODEL_NO = ['BCM2708', 'BCM2709', 'BCM2710', 'BCM2711', 'BCM2712', 'BCM2835', 'BCM2836', 'BCM2837', 'BCM2837B0'];
  if (_rpi_cpuinfo.length !== 0) {
    cpuinfo = _rpi_cpuinfo;
  } else if (cpuinfo === undefined) {
    try {
      cpuinfo = (await readFile('/proc/cpuinfo', { encoding: 'utf8' })).split('\n');
      _rpi_cpuinfo = cpuinfo;
    } catch {
      _is_raspberry = false;
      return _is_raspberry;
    }
  }

  const hardware = getValue(cpuinfo, 'hardware');
  const model = getValue(cpuinfo, 'model');

  _is_raspberry = (hardware !== '' && PI_MODEL_NO.indexOf(hardware) > -1) || (model !== '' && model.indexOf('Raspberry Pi') > -1);
  return _is_raspberry;
};

export const getRpiGpu = async (cpuinfo?: string[]) => {
  if (_rpi_cpuinfo.length === 0 && cpuinfo !== undefined) {
    _rpi_cpuinfo = cpuinfo;
  } else if (cpuinfo === undefined && _rpi_cpuinfo.length > 0) {
    cpuinfo = _rpi_cpuinfo;
  } else {
    try {
      cpuinfo = (await readFile('/proc/cpuinfo', { encoding: 'utf8' })).split('\n');
      _rpi_cpuinfo = cpuinfo;
    } catch {
      return '';
    }
  }

  const rpi = decodePiCpuinfo(cpuinfo);
  if (rpi.type === '4B' || rpi.type === 'CM4' || rpi.type === 'CM4S' || rpi.type === '400') {
    return 'VideoCore VI';
  }
  if (rpi.type === '5' || rpi.type === '500') {
    return 'VideoCore VII';
  }
  return 'VideoCore IV';
};

let _is_raspbian: boolean | null = null;

export const isRaspbian = async () => {
  if (_is_raspbian !== null) {
    return _is_raspbian;
  }

  let osrelease = [];
  try {
    osrelease = (await readFile('/etc/os-release', { encoding: 'utf8' })).split('\n');
  } catch {
    _is_raspbian = false;
    return _is_raspbian;
  }
  const id = getValue(osrelease, 'id', '=');
  _is_raspbian = id !== '' && id.indexOf('raspbian') > -1;
  return _is_raspbian;
};
