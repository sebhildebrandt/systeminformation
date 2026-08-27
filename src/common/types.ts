export type AudioPCI = {
  slotId: string;
  driver: string;
};

export type DarwinAudioData = {
  _name: string;
  coreaudio_device_transport: string;
  coreaudio_device_manufacturer: string;
  coreaudio_default_audio_input_device: string;
  coreaudio_default_audio_output_device: string;
  coreaudio_device_input: string;
  coreaudio_device_output: string;
};

export type DarwinMemData = {
  _name: string;
  dimm_manufacturer: string;
  dimm_part_number: string;
  dimm_serial_number: string;
  dimm_size: string;
  dimm_speed: string;
  dimm_status: string;
  dimm_type: string;
};

export type AudioData = {
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
  cycleCount: number | null;
  isCharging: boolean;
  designedCapacity: number | null;
  maxCapacity: number | null;
  currentCapacity: number | null;
  voltage: number;
  capacityUnit: string;
  percent: number | null;
  timeRemaining: number | null;
  acConnected: boolean;
  type: string;
  model: string;
  manufacturer: string;
  serial: string;
};

export type BluetoothObject = {
  device: string | null;
  name: string;
  manufacturer: string | null;
  macDevice: string | null;
  macHost: string | null;
  batteryPercent: number | null;
  type: string | null;
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
  labels: { [key: string]: string };
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
  memoryStats: any;
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
  efficiencyCores: number;
  performanceCores: number;
  processors: number;
  socket: string;
  flags: string;
  virtualization: boolean;
  cache: CpuCacheData | null;
};

export type CpuBrandObject = {
  manufacturer: string;
  brand: string;
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
  currentLoadSteal: number;
  currentLoadGuest: number;
  rawCurrentLoad: number;
  rawCurrentLoadUser: number;
  rawCurrentLoadSystem: number;
  rawCurrentLoadNice: number;
  rawCurrentLoadIdle: number;
  rawCurrentLoadIrq: number;
  rawCurrentLoadSteal: number;
  rawCurrentLoadGuest: number;
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
  networkInterface: string;
  model: string | null;
  vendor: string | null;
  mac: string | null;
};

export type WifiConnectionData = {
  id: string;
  networkInterface: string;
  model: string | null;
  ssid: string;
  bssid: string | null;
  channel: number | null;
  type: string | null;
  security: string | null;
  frequency: number;
  signalLevel: number | null;
  quality: number | null;
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
  model: string;
  serial: string;
  revisionCode: string;
  memory: number;
  manufacturer: string;
  processor: string;
  type: string;
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
  reclaimable: number;
  swaptotal: number;
  swapused: number;
  swapfree: number;
  writeback: number;
  dirty: number;
};

export type MemLayoutData = {
  size: number;
  bank: string | null;
  channel: string | null;
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
  installDate: Date | null;
  lastUpdate: Date | null;
  displayServer: string;
  awake: boolean;
  hwAcceleration: string[];
  hypervizor?: boolean;
  remoteSession?: boolean;
  hypervisor?: boolean;
};

export type InetPublicIpData = {
  ip4: string;
  ip6: string;
  ms: number;
};

export type UuidData = {
  os: string;
  hardware: string;
  macs: string[];
  disks: string[];
};

export type VersionData = {
  kernel?: string;
  openssl?: string;
  systemOpenssl?: string;
  systemOpensslLib?: string;
  node?: string;
  v8?: string;
  angular?: string;
  apache?: string;
  bash?: string;
  bun?: string;
  cargo?: string;
  composer?: string;
  curl?: string;
  deno?: string;
  docker?: string;
  dockerCompose?: string;
  dotnet?: string;
  fish?: string;
  gcc?: string;
  git?: string;
  go?: string;
  gradle?: string;
  grunt?: string;
  gulp?: string;
  herd?: string;
  homebrew?: string;
  java?: string;
  laravel?: string;
  maven?: string;
  mongodb?: string;
  mysql?: string;
  nginx?: string;
  npm?: string;
  perl?: string;
  php?: string;
  pip?: string;
  pip3?: string;
  pm2?: string;
  podman?: string;
  postfix?: string;
  postgresql?: string;
  powershell?: string;
  python?: string;
  python3?: string;
  rails?: string;
  redis?: string;
  ruby?: string;
  rust?: string;
  sqlite3?: string;
  tsc?: string;
  vi?: string;
  vim?: string;
  virtualbox?: string;
  vue?: string;
  yarn?: string;
  zsh?: string;
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

export type BiosIBridgeData = {
  modelName: string;
  build: string;
  bootUuid: string;
  secureBoot: string;
};

export type BiosData = {
  vendor: string;
  version: string;
  releaseDate: string;
  revision: string;
  serial?: string;
  language?: string;
  features?: string[];
  iBridge?: BiosIBridgeData;
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

export type FsSizeData = {
  fs: string;
  type: string;
  size: number;
  used: number;
  available: number;
  use: number;
  mount: string;
  rw: boolean | null;
};

export type FsOpenFilesData = {
  max: number | null;
  allocated: number | null;
  available: number | null;
};

export type FsBlockDevicesData = {
  name: string;
  identifier: string;
  type: string;
  fsType: string;
  mount: string;
  size: number;
  physical: string;
  uuid: string;
  guid: string;
  label: string;
  model: string;
  serial: string;
  removable: boolean;
  protocol: string;
  group: string;
  device: string;
};

export type FsStatsData = {
  rx: number;
  wx: number;
  tx: number;
  rx_sec: number | null;
  wx_sec: number | null;
  tx_sec: number | null;
  ms: number;
};

export type DisksIoData = {
  rIO: number;
  wIO: number;
  tIO: number;
  rIO_sec: number | null;
  wIO_sec: number | null;
  tIO_sec: number | null;
  rWaitTime: number;
  wWaitTime: number;
  tWaitTime: number;
  rWaitPercent: number | null;
  wWaitPercent: number | null;
  tWaitPercent: number | null;
  ms: number;
};

export type SmartData = {
  json_format_version: number[];
  smartctl: {
    version: number[];
    platform_info: string;
    build_info: string;
    argv: string[];
    exit_status: number;
  };
  device: {
    name: string;
    info_name: string;
    type: string;
    protocol: string;
  };
  model_family?: string;
  model_name?: string;
  serial_number?: string;
  firmware_version?: string;
  smart_status: {
    passed: boolean;
  };
  trim?: {
    supported: boolean;
  };
  ata_smart_attributes?: {
    revision: number;
    table: {
      id: number;
      name: string;
      value: number;
      worst: number;
      thresh: number;
      when_failed: string;
      flags: {
        value: number;
        string: string;
        prefailure: boolean;
        updated_online: boolean;
        performance: boolean;
        error_rate: boolean;
        event_count: boolean;
        auto_keep: boolean;
      };
      raw: { value: number; string: string };
    }[];
  };
  ata_smart_error_log?: {
    summary: {
      revision: number;
      count: number;
    };
  };
  ata_smart_self_test_log?: {
    standard: {
      revision: number;
      table: {
        type: {
          value: number;
          string: string;
        };
        status: {
          value: number;
          string: string;
          passed: boolean;
        };
        lifetime_hours: number;
      }[];
      count: number;
      error_count_total: number;
      error_count_outdated: number;
    };
  };
  nvme_pci_vendor?: {
    id: number;
    subsystem_id: number;
  };
  nvme_smart_health_information_log?: {
    critical_warning?: number;
    temperature?: number;
    available_spare?: number;
    available_spare_threshold?: number;
    percentage_used?: number;
    data_units_read?: number;
    data_units_written?: number;
    host_reads?: number;
    host_writes?: number;
    controller_busy_time?: number;
    power_cycles?: number;
    power_on_hours?: number;
    unsafe_shutdowns?: number;
    media_errors?: number;
    num_err_log_entries?: number;
    warning_temp_time?: number;
    critical_comp_time?: number;
    temperature_sensors?: number[];
  };
  user_capacity?: {
    blocks: number;
    bytes: number;
  };
  logical_block_size?: number;
  temperature: {
    current: number;
  };
  power_cycle_count: number;
  power_on_time: {
    hours: number;
  };
};

export type DiskLayoutData = {
  device: string;
  type: string;
  name: string;
  vendor: string;
  size: number;
  bytesPerSector: number | null;
  totalCylinders: number | null;
  totalHeads: number | null;
  totalSectors: number | null;
  totalTracks: number | null;
  tracksPerCylinder: number | null;
  sectorsPerTrack: number | null;
  firmwareRevision: string;
  serialNum: string;
  interfaceType: string;
  smartStatus: string;
  temperature: number | null;
  bsdName?: string;
  smartData?: SmartData;
};

export type GpuData = {
  vendor: string;
  subVendor?: string;
  vendorId?: string;
  model: string;
  deviceId?: string;
  bus: string;
  busAddress?: string;
  vram: number | null;
  vramDynamic: boolean;
  external?: boolean;
  cores?: number;
  metalVersion?: string;
  subDeviceId?: string;
  driverVersion?: string;
  name?: string;
  pciBus?: string;
  pciID?: string;
  fanSpeed?: number;
  memoryTotal?: number;
  memoryUsed?: number;
  memoryFree?: number;
  utilizationGpu?: number;
  utilizationMemory?: number;
  temperatureGpu?: number;
  temperatureMemory?: number;
  powerDraw?: number;
  powerLimit?: number;
  clockCore?: number;
  clockMemory?: number;
};

export type DisplayData = {
  vendor: string;
  vendorId: string | null;
  model: string;
  productionYear: number | null;
  serial: string | null;
  deviceName: string | null;
  displayId: string | null;
  main: boolean;
  builtin: boolean;
  connection: string | null;
  sizeX: number | null;
  sizeY: number | null;
  pixelDepth: number | null;
  resolutionX: number | null;
  resolutionY: number | null;
  currentResX: number | null;
  currentResY: number | null;
  positionX: number;
  positionY: number;
  currentRefreshRate: number | null;
};

export type GpuNvidiaData = {
  driverVersion: string;
  subDeviceId: string;
  name: string;
  pciBus: string;
  fanSpeed: number;
  memoryTotal: number;
  memoryUsed: number;
  memoryFree: number;
  utilizationGpu: number;
  utilizationMemory: number;
  temperatureGpu: number;
  temperatureMemory: number;
  powerDraw: number;
  powerLimit: number;
  clockCore: number;
  clockMemory: number;
};

export type ProcStatData = {
  pid: number;
  name: string;
  utime: number;
  stime: number;
  cutime?: number;
  cstime?: number;
  cpu?: number;
  cpuu: number;
  cpus: number;
  mem?: number;
};

export type CpuData = {
  all: number;
  all_utime: number;
  all_stime: number;
  list: any;
  ms: number;
  result: any;
};

export type ServicesData = {
  name: string;
  running: boolean;
  startmode: string;
  pids: number[];
  cpu: number;
  mem: number;
};

export type ProcStatsData = {
  name: string;
  pid: number;
  ppid: number;
  cpu: number;
  mem: number;
};

export type ProcessesProcessData = {
  pid: number;
  parentPid: number;
  name: string;
  cpu: number;
  cpuu: number;
  cpus: number;
  mem: number;
  priority: number;
  memVsz: number;
  memRss: number;
  nice: number;
  started: string;
  state: string;
  tty: string;
  user: string;
  command: string;
  params: string;
  path: string;
};

export type ProcessesData = {
  all: number;
  running: number;
  blocked: number;
  sleeping: number;
  unknown: number;
  list: ProcessesProcessData[];
};

export type ProcessLoadData = {
  proc: string;
  pid: number | null;
  pids: number[];
  cpu: number;
  mem: number;
};

export type NetworkInterfacesData = {
  iface: string;
  ifaceName: string;
  default: boolean;
  ip4: string;
  ip4subnet: string;
  ip6: string;
  ip6subnet: string;
  mac: string;
  internal: boolean;
  virtual: boolean;
  operstate: string;
  type: string;
  duplex: string;
  mtu: number;
  speed: number | null;
  dhcp: boolean;
  dnsSuffix: string;
  ieee8021xAuth: string;
  ieee8021xState: string;
  carrierChanges: number;
};

export type NetworkStatsData = {
  iface: string;
  operstate: string;
  rx_bytes: number;
  rx_dropped: number;
  rx_errors: number;
  tx_bytes: number;
  tx_dropped: number;
  tx_errors: number;
  rx_sec: number | null;
  tx_sec: number | null;
  ms: number;
};

export type NetworkConnectionsData = {
  protocol: string;
  localAddress: string;
  localPort: string;
  peerAddress: string;
  peerPort: string;
  state: string;
  pid: number | null;
  process: string;
};

export type Camera = {
  name: string;
  model: string;
  vendor: string;
  serial: string;
  connection: string;
};

export type Keyboard = {
  name: string;
  model: string;
  vendor: string;
  serial: string;
  connection: string;
};

export type Mouse = {
  name: string;
  type: string;
  model: string;
  vendor: string;
  serial: string;
  connection: string;
};

export type Npm = {
  name: string;
  version: string;
};

export type Software = {
  name: string;
  description: string;
  version: string;
  installDate: Date | null;
  architecture: string;
  source: string;
  path: string;
  signedBy: string[];
};

export type PciData = {
  slot: string;
  bus: string;
  type: string;
  vendor: string;
  vendorId: string;
  model: string;
  deviceId: string;
  subVendorId: string;
  subDeviceId: string;
  revision: string;
  driver: string;
};

export type NpuData = {
  vendor: string;
  name: string;
  model: string;
  cores: number | null;
  vendorId: string;
  deviceId: string;
  driver: string;
};

export type Thunderbolt = {
  name: string;
  uuid: string;
  bus: number | null;
  type: string;
  speed: number;
};
