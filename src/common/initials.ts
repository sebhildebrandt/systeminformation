'use strict';

import * as os from 'os';
import { BatteryObject, UsbData, CpuObject, CpuCacheData, CpuTemperatureObject, InetChecksiteData, MemData, OsData, UuidData, ChassisData, BaseboardData, BiosData, SystemData } from './types';
import { PLATFORM, UNKNOWN } from './const';
import { getFQDN, getUniqueMacAdresses } from './network';

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
  cores: os.cpus().length,
  physicalCores: os.cpus().length,
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
  total: os.totalmem(),
  free: os.freemem(),
  used: os.totalmem() - os.freemem(),

  active: os.totalmem() - os.freemem(),     // temporarily (fallback)
  available: os.freemem(),                  // temporarily (fallback)
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
    kernel: os.release(),
    arch: os.arch(),
    hostname: os.hostname(),
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
  macs: getUniqueMacAdresses()
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
