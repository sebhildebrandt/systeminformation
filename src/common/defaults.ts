import { arch, cpus, freemem, hostname, release, totalmem } from 'node:os';
import { hwAcceleration } from './acceleration';
import { PLATFORM, UNKNOWN } from './const';
import { getFQDN, getUniqueMacAddresses } from './host';
import type {
  AudioData,
  BaseboardData,
  BatteryObject,
  BiosData,
  ChassisData,
  CpuCacheData,
  CpuObject,
  CpuTemperatureObject,
  DisksIoData,
  DisplayData,
  FsBlockDevicesData,
  FsOpenFilesData,
  FsStatsData,
  InetChecksiteData,
  MemData,
  NetworkInterfacesData,
  NetworkStatsData,
  NpuData,
  OsData,
  PciData,
  ProcessesData,
  SerialPortData,
  SystemData,
  UsbData,
  UuidData
} from './types';

export const initBatteryResult: BatteryObject = {
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

export const initAudioResult: AudioData = {
  id: '',
  name: '',
  manufacturer: '',
  revision: null,
  driver: null,
  default: null,
  channel: null,
  type: '',
  in: null,
  out: null,
  status: ''
};

export const initSerialPortResult: SerialPortData = {
  device: '',
  name: null,
  manufacturer: null,
  serialNumber: null,
  vendorId: null,
  productId: null,
  pnpId: null,
  type: 'unknown'
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
  serialNumber: null
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
  performanceCores: cpus().length,
  efficiencyCores: 0,
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
  l3: null
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

  active: totalmem() - freemem(), // temporarily (fallback)
  available: freemem(), // temporarily (fallback)
  buffers: 0,
  cached: 0,
  slab: 0,
  buffcache: 0,
  reclaimable: 0,
  swaptotal: 0,
  swapused: 0,
  swapfree: 0,
  writeback: 0,
  dirty: 0
};

export const initOsInfo = async (): Promise<OsData> => {
  return {
    platform: PLATFORM === 'win32' ? 'windows' : PLATFORM,
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
    uefi: false,
    installDate: null,
    lastUpdate: null,
    displayServer: '',
    awake: true,
    hwAcceleration: await hwAcceleration()
  };
};

export const initUUID: UuidData = {
  os: '',
  hardware: '',
  macs: getUniqueMacAddresses(),
  disks: []
};

export const initChassis: ChassisData = {
  manufacturer: '',
  model: '',
  type: '',
  version: '',
  serial: '-',
  assetTag: '-',
  sku: ''
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
  revision: ''
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

export const initFsOpenFiles: FsOpenFilesData = {
  max: null,
  allocated: null,
  available: null
};

export const initFsBlockDevice: FsBlockDevicesData = {
  name: '',
  identifier: '',
  type: 'disk',
  fsType: '',
  mount: '',
  size: 0,
  physical: 'HDD',
  uuid: '',
  guid: '',
  label: '',
  model: '',
  serial: '',
  removable: false,
  protocol: '',
  group: '',
  device: ''
};

export const initFsStats: FsStatsData = {
  rx: 0,
  wx: 0,
  tx: 0,
  rx_sec: null,
  wx_sec: null,
  tx_sec: null,
  ms: 0
};

export const initDiskIo: DisksIoData = {
  rIO: 0,
  wIO: 0,
  tIO: 0,
  rIO_sec: null,
  wIO_sec: null,
  tIO_sec: null,
  rWaitTime: 0,
  wWaitTime: 0,
  tWaitTime: 0,
  rWaitPercent: null,
  wWaitPercent: null,
  tWaitPercent: null,
  ms: 0
};

export const initDisplay: DisplayData = {
  vendor: '',
  vendorId: '',
  model: '',
  productionYear: null,
  serial: null,
  deviceName: '',
  displayId: null,
  main: false,
  mirror: false,
  builtin: false,
  connection: '',
  sizeX: null,
  sizeY: null,
  pixelDepth: null,
  resolutionX: null,
  resolutionY: null,
  currentResX: null,
  currentResY: null,
  positionX: 0,
  positionY: 0,
  currentRefreshRate: null,
  scale: null
};

export const initProcesses: ProcessesData = {
  all: 0,
  running: 0,
  blocked: 0,
  sleeping: 0,
  unknown: 0,
  list: []
};

export const initNetworkInterface: NetworkInterfacesData = {
  iface: '',
  ifaceName: '',
  default: false,
  ip4: '',
  ip4subnet: '',
  ip6: '',
  ip6subnet: '',
  mac: '',
  internal: true,
  virtual: false,
  operstate: 'down',
  type: '',
  duplex: '',
  mtu: 0,
  speed: 0,
  dhcp: false,
  dnsSuffix: '',
  ieee8021xAuth: '',
  ieee8021xState: '',
  carrierChanges: 0
};

export const initNpuData: NpuData = {
  vendor: '',
  name: '',
  model: '',
  cores: null,
  vendorId: '',
  deviceId: '',
  driver: ''
};

export const initPciData: PciData = {
  slot: '',
  bus: '',
  type: '',
  vendor: '',
  vendorId: '',
  model: '',
  deviceId: '',
  subVendorId: '',
  subDeviceId: '',
  revision: '',
  driver: ''
};

export const initNetworkSpeed: NetworkStatsData = {
  iface: '',
  operstate: '',
  rx_bytes: 0,
  rx_dropped: 0,
  rx_errors: 0,
  tx_bytes: 0,
  tx_dropped: 0,
  tx_errors: 0,
  rx_sec: null,
  tx_sec: null,
  ms: 0
};
