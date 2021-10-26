import { cpus, freemem, totalmem, release, arch, hostname } from 'os';
import { BatteryObject, UsbData, CpuObject, CpuCacheData, CpuTemperatureObject, InetChecksiteData, MemData, OsData, UuidData, ChassisData, BaseboardData, BiosData, SystemData } from './types';
import { PLATFORM, UNKNOWN } from './const';
import { getFQDN, getUniqueMacAddresses } from './network';

export const initBatteryResult: BatteryObject = {
  hasBattery: false,
  cycleCount: null,
  isCharging: false,
  designedCapacity: null,
  maxCapacity: null,
  currentCapacity: 0,
  voltage: 0,
  capacityUnit: '',
  percent: 0,
  timeRemaining: null,
  acConnected: true,
  type: '',
  model: '',
  manufacturer: '',
  serial: ''
};

export const initUsbResult: UsbData = {
  id: null,
  bus: null,
  deviceId: null,
  name: null,
  type: null,
  removable: null,
  vendor: null,
  manufacturer: null,
  maxPower: null,
  serialNumber: null,
};

export const initCpuResult: CpuObject = {
  manufacturer: UNKNOWN,
  brand: UNKNOWN,
  vendor: '',
  family: '',
  model: '',
  stepping: '',
  revision: '',
  voltage: '',
  speed: 0,
  speedMin: 0,
  speedMax: 0,
  governor: '',
  cores: cpus().length,
  physicalCores: cpus().length,
  processors: 1,
  socket: '',
  flags: '',
  virtualization: false,
  cache: null
};

export const initCpuCacheResult: CpuCacheData = {
  l1d: null,
  l1i: null,
  l2: null,
  l3: null,
};

export const initCpuTemperature: CpuTemperatureObject = {
  main: null,
  cores: [],
  max: null,
  socket: [],
  chipset: null
};

export const initCheckSite: InetChecksiteData = {
  url: '',
  ok: false,
  status: 404,
  ms: 0
};

export const initMemData: MemData = {
  total: totalmem(),
  free: freemem(),
  used: totalmem() - freemem(),

  active: totalmem() - freemem(),     // temporarily (fallback)
  available: freemem(),                  // temporarily (fallback)
  buffers: 0,
  cached: 0,
  slab: 0,
  buffcache: 0,

  swaptotal: 0,
  swapused: 0,
  swapfree: 0
};

export const initOsInfo = async (): Promise<OsData> => {
  return {
    platform: (PLATFORM === 'win32' ? 'Windows' : PLATFORM),
    distro: 'unknown',
    release: 'unknown',
    codename: '',
    kernel: release(),
    arch: arch(),
    hostname: hostname(),
    fqdn: await getFQDN(),
    codepage: '',
    logofile: '',
    serial: '',
    build: '',
    servicepack: '',
    uefi: false
  };
};

export const initUUID: UuidData = {
  os: '',
  hardware: '',
  macs: getUniqueMacAddresses()
};

export const initChassis: ChassisData = {
  manufacturer: '',
  model: '',
  type: '',
  version: '',
  serial: '-',
  assetTag: '-',
  sku: '',
};

export const initBaseboard: BaseboardData = {
  manufacturer: '',
  model: '',
  version: '',
  serial: '-',
  assetTag: '-',
  memMax: null,
  memSlots: null
};

export const initBios: BiosData = {
  vendor: '',
  version: '',
  releaseDate: '',
  revision: '',
};

export const initSystem: SystemData = {
  manufacturer: '',
  model: 'Computer',
  version: '',
  serial: '-',
  uuid: '-',
  sku: '-',
  virtual: false
};
