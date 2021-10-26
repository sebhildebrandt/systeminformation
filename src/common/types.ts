export type AudioPCI = {
  slotId: string;
  driver: string;
};

export type DarwinAudioObject = {
  _name: string;
  coreaudio_device_transport: string;
  coreaudio_device_manufacturer: string;
  coreaudio_default_audio_input_device: string;
  coreaudio_default_audio_output_device: string;
  coreaudio_device_input: string;
  coreaudio_device_output: string;
};

export type AudioObject = {
  id: string;
  name: string;
  manufacturer: string;
  revision: string | null;
  driver: string | null;
  default: boolean | null;
  channel: string | null;
  type: string;
  in: boolean | null;
  out: boolean | null;
  status: string;
};

export type BatteryObject = {
  hasBattery: boolean;
  cycleCount: number | null;
  isCharging: boolean;
  designedCapacity: number | null;
  maxCapacity: number | null;
  currentCapacity: number | null;
  voltage: number;
  capacityUnit: string;
  percent: number | null;
  timeRemaining: number | null,
  acConnected: boolean;
  type: string;
  model: string;
  manufacturer: string;
  serial: string;
  additionalBatteries?: any;
};

export type BluetoothObject = {
  device: string | null,
  name: string,
  manufacturer: string | null,
  macDevice: string | null,
  macHost: string | null,
  batteryPercent: number | null,
  type: string | null,
  connected: boolean | null;

};

export type DockerInfoData = {
  id: string;
  containers: number;
  containersRunning: number;
  containersPaused: number;
  containersStopped: number;
  images: number;
  driver: string;
  memoryLimit: boolean;
  swapLimit: boolean;
  kernelMemory: boolean;
  cpuCfsPeriod: boolean;
  cpuCfsQuota: boolean;
  cpuShares: boolean;
  cpuSet: boolean;
  ipv4Forwarding: boolean;
  bridgeNfIptables: boolean;
  bridgeNfIp6tables: boolean;
  debug: boolean;
  nfd: number;
  oomKillDisable: boolean;
  ngoroutines: number;
  systemTime: string;
  loggingDriver: string;
  cgroupDriver: string;
  nEventsListener: number;
  kernelVersion: string;
  operatingSystem: string;
  osType: string;
  architecture: string;
  ncpu: number;
  memTotal: number;
  dockerRootDir: string;
  httpProxy: string;
  httpsProxy: string;
  noProxy: string;
  name: string;
  labels: string[];
  experimentalBuild: boolean;
  serverVersion: string;
  clusterStore: string;
  clusterAdvertise: string;
  defaultRuntime: string;
  liveRestoreEnabled: boolean;
  isolation: string;
  initBinary: string;
  productLicense: string;
};

export type DockerImageData = {
  id: string;
  container: string;
  comment: string;
  os: string;
  architecture: string;
  parent: string;
  dockerVersion: string;
  size: number;
  sharedSize: number;
  virtualSize: number;
  author: string;
  created: number;
  containerConfig: any;
  graphDriver: any;
  repoDigests: any;
  repoTags: any;
  config: any;
  rootFS: any;
};

export type DockerContainerData = {
  id: string;
  name: string;
  image: string;
  imageID: string;
  command: string;
  created: number;
  started: number;
  finished: number;
  createdAt: string;
  startedAt: string;
  finishedAt: string;
  state: string;
  restartCount: number;
  platform: string;
  driver: string;
  ports: number[];
  mounts: DockerContainerMountData[];
};

export type DockerContainerMountData = {
  Type: string;
  Source: string;
  Destination: string;
  Mode: string;
  RW: boolean;
  Propagation: string;
};

export type DockerContainerStatsData = {
  id: string;
  memUsage: number;
  memLimit: number;
  memPercent: number;
  cpuPercent: number;
  pids: number;
  netIO: {
    rx: number;
    wx: number;
  };
  blockIO: {
    r: number;
    w: number;
  };
  restartCount: number;
  cpuStats: any;
  precpuStats: any;
  memoryStats: any,
  networks: any;
};

export type DockerContainerProcessData = {
  pidHost: string;
  ppid: string;
  pgid: string;
  user: string;
  ruser: string;
  group: string;
  rgroup: string;
  stat: string;
  time: string;
  elapsed: string;
  nice: string;
  rss: string;
  vsz: string;
  command: string;
};


export type DockerVolumeData = {
  name: string;
  driver: string;
  labels: any;
  mountpoint: string;
  options: any;
  scope: string;
  created: number;
};

export type PrinterData = {
  id: string | number | null;
  name: string;
  model: string;
  uri: string | null;
  uuid: string | null;
  local: boolean;
  status: string | null;
  default: boolean | null;
  shared: boolean;
  engine: string | null;
  engineVersion: string | null;
};

export type UsbData = {
  id: number | string | null;
  bus: number | null;
  deviceId: number | string | null;
  name: string | null;
  type: string | null;
  removable: boolean | null;
  vendor: string | null;
  manufacturer: string | null;
  maxPower: string | null;
  serialNumber: string | null;
};

export type UserData = {
  user: string;
  tty: string;
  date: string;
  time: string;
  ip: string | null;
  command: string | null;
};

export type VboxInfoData = {
  id: string;
  name: string;
  running: boolean;
  started: string;
  runningSince: number;
  stopped: string;
  stoppedSince: number;
  guestOS: string;
  hardwareUUID: string;
  memory: number;
  vram: number;
  cpus: number;
  cpuExepCap: string;
  cpuProfile: string;
  chipset: string;
  firmware: string;
  pageFusion: boolean;
  configFile: string;
  snapshotFolder: string;
  logFolder: string;
  hpet: boolean;
  pae: boolean;
  longMode: boolean;
  tripleFaultReset: boolean;
  apic: boolean;
  x2Apic: boolean;
  acpi: boolean;
  ioApic: boolean;
  biosApicMode: string;
  bootMenuMode: string;
  bootDevice1: string;
  bootDevice2: string;
  bootDevice3: string;
  bootDevice4: string;
  timeOffset: string;
  rtc: string;
};


export type CpuObject = {
  manufacturer: string;
  brand: string;
  vendor: string;
  family: string;
  model: string;
  stepping: string;
  revision: string;
  voltage: string;
  speed: number;
  speedMin: number;
  speedMax: number;
  governor: string;
  cores: number;
  physicalCores: number;
  efficiencyCores?: number;
  performanceCores?: number;
  processors: number;
  socket: string;
  flags: string;
  virtualization: boolean;
  cache: CpuCacheData | null;
};

export type CpuCacheData = {
  l1d: number | null;
  l1i: number | null;
  l2: number | null;
  l3: number | null;
};

export type CpuCurrentSpeedObject = {
  min: number;
  max: number;
  avg: number;
  cores: number[];
};

export type CpuTemperatureObject = {
  main: number | null;
  cores: number[];
  max: number | null;
  socket: number[];
  chipset: number | null;
};

export type CurrentLoadData = {
  avgLoad: number;
  currentLoad: number;
  currentLoadUser: number;
  currentLoadSystem: number;
  currentLoadNice: number;
  currentLoadIdle: number;
  currentLoadIrq: number;
  rawCurrentLoad: number;
  rawCurrentLoadUser: number;
  rawCurrentLoadSystem: number;
  rawCurrentLoadNice: number;
  rawCurrentLoadIdle: number;
  rawCurrentLoadIrq: number;
  cpus: CurrentLoadCpuData[];
};

export type CurrentLoadCpuData = {
  load: number;
  loadUser: number;
  loadSystem: number;
  loadNice: number;
  loadIdle: number;
  loadIrq: number;
  rawLoad: number;
  rawLoadUser: number;
  rawLoadSystem: number;
  rawLoadNice: number;
  rawLoadIdle: number;
  rawLoadIrq: number;
};

export type WifiNetworkData = {
  ssid: string;
  bssid: string;
  mode: string;
  channel: number | null;
  frequency: number | null;
  signalLevel: number | null;
  quality: number | null;
  security: string[];
  wpaFlags: string[];
  rsnFlags: string[];
};

export type WifiInterfaceData = {
  id: string | null;
  iface: string;
  model: string | null;
  vendor: string | null;
  mac: string | null;
};

export type WifiConnectionData = {
  id: string;
  iface: string;
  model: string | null;
  ssid: string;
  bssid: string | null;
  channel: number | null;
  type: string | null;
  security: string | null;
  frequency: number;
  signalLevel: number | null;
  txRate: number | null;
};

export type InetChecksiteData = {
  url: string;
  ok: boolean;
  status: number;
  ms: number;
};

export type RaspberryRevisionData = {
  manufacturer: string;
  processor: string;
  type: string;
  revision: string;
};

export type RaspberryFullRevisionData = {
  model: string,
  serial: string,
  revisionCode: string,
  memory: number;
  manufacturer: string,
  processor: string,
  type: string,
  revision: string;
};

export type MemData = {
  total: number;
  free: number;
  used: number;
  active: number;
  available: number;
  buffcache: number;
  buffers: number;
  cached: number;
  slab: number;
  swaptotal: number;
  swapused: number;
  swapfree: number;
};

export type MemLayoutData = {
  size: number;
  bank: string;
  type: string;
  ecc?: boolean | null;
  clockSpeed: number | null;
  formFactor: string;
  manufacturer?: string;
  partNum: string;
  serialNum: string;
  voltageConfigured: number | null;
  voltageMin: number | null;
  voltageMax: number | null;
};

export type OsData = {
  platform: string;
  distro: string;
  release: string;
  codename: string;
  kernel: string;
  arch: string;
  hostname: string;
  fqdn: string;
  codepage: string;
  logofile: string;
  serial: string;
  build: string;
  servicepack: string;
  uefi: boolean;
  hypervizor?: boolean;
  remoteSession?: boolean;
  hypervisor?: boolean;
};

export type UuidData = {
  os: string;
  hardware: string;
  macs: string[];
};

export type VersionData = {
  kernel?: string;
  openssl?: string;
  systemOpenssl?: string;
  systemOpensslLib?: string;
  node?: string;
  v8?: string;
  npm?: string;
  yarn?: string;
  pm2?: string;
  gulp?: string;
  grunt?: string;
  git?: string;
  tsc?: string;
  mysql?: string;
  redis?: string;
  mongodb?: string;
  nginx?: string;
  php?: string;
  docker?: string;
  postfix?: string;
  postgresql?: string;
  perl?: string;
  python?: string;
  python3?: string;
  pip?: string;
  pip3?: string;
  java?: string;
  gcc?: string;
  virtualbox?: string;
  dotnet?: string;
};

export type SystemData = {
  manufacturer: string;
  model: string;
  version: string;
  serial: string;
  uuid: string;
  sku: string;
  virtual: boolean;
  virtualHost?: string;
  raspberry?: RaspberryRevisionData;
};

export type BiosData = {
  vendor: string;
  version: string;
  releaseDate: string;
  revision: string;
  language?: string;
  features?: string[];
};

export type BaseboardData = {
  manufacturer: string;
  model: string;
  version: string;
  serial: string;
  assetTag: string;
  memMax: number | null;
  memSlots: number | null;
};

export type ChassisData = {
  manufacturer: string;
  model: string;
  type: string;
  version: string;
  serial: string;
  assetTag: string;
  sku: string;
};
