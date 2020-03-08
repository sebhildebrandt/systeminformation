// Type definitions for systeminformation
// Project: https://github.com/sebhildebrandt/systeminformation
// Definitions by: sebhildebrandt <https://github.com/sebhildebrandt>

export namespace Systeminformation {

  // 1. General

  interface TimeData {
    current: string;
    uptime: string;
    timezone: string;
    timezoneName: string;
  }

  // 2. System (HW)

  interface SystemData {
    manufacturer: string;
    model: string;
    version: string;
    serial: string;
    uuid: string;
    sku: string;
  }

  interface BiosData {
    vendor: string;
    version: string;
    releaseDate: string;
    revision: string;
  }

  interface BaseboardData {
    manufacturer: string;
    model: string;
    version: string;
    serial: string;
    assetTag: string;
  }

  interface ChassisData {
    manufacturer: string;
    model: string;
    type: string;
    version: string;
    serial: string;
    assetTag: string;
    sku: string;
  }

  // 3. CPU, Memory, Disks, Battery, Graphics

  interface CpuData {
    manufacturer: string;
    brand: string;
    vendor: string;
    family: string;
    model: string;
    stepping: string;
    revision: string;
    voltage: string;
    speed: string;
    speedmin: string;
    speedmax: string;
    governor: string;
    cores: number;
    physicalCores: number;
    processors: number;
    socket: string;
    cache: CpuCacheData;
  }

  interface CpuWithFlagsData extends CpuData {
    flags: string;
  }

  interface CpuCacheData {
    l1d: number;
    l1i: number;
    l2: number;
    l3: number;
  }

  interface CpuCurrentSpeedData {
    min: number;
    max: number;
    avg: number;
    cores: number[];
  }

  interface CpuTemperatureData {
    main: number;
    cores: number[];
    max: number;
  }

  interface MemData {
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
  }

  interface MemLayoutData {
    size: number;
    bank: string;
    type: string;
    clockSpeed: number;
    formFactor: string;
    partNum: string;
    serialNum: string;
    voltageConfigured: number;
    voltageMin: number;
    voltageMax: number;
  }

  interface DiskLayoutData {
    device: string;
    type: string;
    name: string;
    vendor: string;
    size: number;
    bytesPerSector: number;
    totalCylinders: number;
    totalHeads: number;
    totalSectors: number;
    totalTracks: number;
    tracksPerCylinder: number;
    sectorsPerTrack: number;
    firmwareRevision: string;
    serialNum: string;
    interfaceType: string;
    smartStatus: string;
  }

  interface BatteryData {
    hasbattery: boolean;
    cyclecount: number;
    ischarging: boolean;
    voltage: number;
    designedcapacity: number;
    maxcapacity: number;
    currentcapacity: number;
    capacityUnit: string;
    percent: number;
    timeremaining: number,
    acconnected: boolean;
    type: string;
    model: string;
    manufacturer: string;
    serial: string;
  }

  interface GraphicsData {
    controllers: GraphicsControllerData[];
    displays: GraphicsDisplayData[];
  }

  interface GraphicsControllerData {
    vendor: string;
    model: string;
    bus: string;
    vram: number;
    vramDynamic: boolean;
  }

  interface GraphicsDisplayData {
    vendor: string;
    model: string;
    main: boolean;
    builtin: boolean;
    connection: string;
    sizex: number;
    sizey: number;
    pixeldepth: number;
    resolutionx: number;
    resolutiony: number;
    currentResX: number;
    currentResY: number;
    positionX: number;
    positionY: number;
    currentRefreshRate: number;
  }

  // 4. Operating System

  interface OsData {
    platform: string;
    distro: string;
    release: string;
    codename: string;
    kernel: string;
    arch: string;
    hostname: string;
    codepage: string;
    logofile: string;
    serial: string;
    build: string;
    servicepack: string;
    uefi: boolean;
  }

  interface UuidData {
    os: string;
  }

  interface VersionData {
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
  }

  interface UserData {
    user: string;
    tty: string;
    date: string;
    time: string;
    ip: string;
    command: string;
  }

  // 5. File System

  interface FsSizeData {
    fs: string;
    type: string;
    size: number;
    used: number;
    use: number;
    mount: string;
  }

  interface FsOpenFilesData {
    max: number;
    allocated: number;
    available: number;
  }

  interface BlockDevicesData {
    name: string;
    identifier: string;
    type: string;
    fstype: string;
    mount: string;
    size: number;
    physical: string;
    uuid: string;
    label: string;
    model: string;
    serial: string;
    removable: boolean;
    protocol: string;
  }

  interface FsStatsData {
    rx_bytes: number;
    wx_bytes: number;
    tx_bytes: number;
    rx_sec: number;
    wx_sec: number;
    tx_sec: number;
    ms: number;
  }

  interface DisksIoData {
    rIO: number;
    wIO: number;
    tIO: number;
    rIO_sec: number;
    wIO_sec: number;
    tIO_sec: number;
    ms: number;
  }

  // 6. Network related functions

  interface NetworkInterfacesData {
    iface: string;
    ifaceName: string;
    ip4: string;
    ip6: string;
    mac: string;
    internal: boolean;
    virtual: boolean;
    operstate: string;
    type: string;
    duplex: string;
    mtu: number;
    speed: number;
    dhcp: boolean;
    dnsSuffix: string;
    ieee8021xAuth: string;
    ieee8021xState: string;
    carrier_changes: number;
  }

  interface NetworkStatsData {
    iface: string;
    operstate: string;
    rx_bytes: number;
    rx_dropped: number;
    rx_errors: number;
    tx_bytes: number;
    tx_dropped: number;
    tx_errors: number;
    rx_sec: number;
    tx_sec: number;
    ms: number;
  }

  interface NetworkConnectionsData {
    protocol: string;
    localaddress: string;
    localport: string;
    peeraddress: string;
    peerport: string;
    state: string;
    pid: number;
    process: string;
  }

  interface InetChecksiteData {
    url: string;
    ok: boolean;
    status: number;
    ms: number;
  }

  interface WifiNetworkData {
    ssid: string;
    bssid: string;
    mode: string;
    channel: number;
    frequency: number;
    signalLevel: number;
    quality: number;
    security: string[];
    wpaFlags: string[];
    rsnFlags: string[];
  }

  // 7. Current Load, Processes & Services

  interface CurrentLoadData {
    avgload: number;
    currentload: number;
    currentload_user: number;
    currentload_system: number;
    currentload_nice: number;
    currentload_idle: number;
    currentload_irq: number;
    raw_currentload: number;
    raw_currentload_user: number;
    raw_currentload_system: number;
    raw_currentload_nice: number;
    raw_currentload_idle: number;
    raw_currentload_irq: number;
    cpus: CurrentLoadCpuData[];
  }

  interface CurrentLoadCpuData {
    load: number;
    load_user: number;
    load_system: number;
    load_nice: number;
    load_idle: number;
    load_irq: number;
    raw_load: number;
    raw_load_user: number;
    raw_load_system: number;
    raw_load_nice: number;
    raw_load_idle: number;
    raw_load_irq: number;
  }

  interface ProcessesData {
    all: number;
    running: number;
    blocked: number;
    sleeping: number;
    unknown: number;
    list: ProcessesProcessData[];
  }

  interface ProcessesProcessData {
    pid: number;
    parentPid: number;
    name: string,
    pcpu: number;
    pcpuu: number;
    pcpus: number;
    pmem: number;
    priority: number;
    mem_vsz: number;
    mem_rss: number;
    nice: number;
    started: string,
    state: string;
    tty: string;
    user: string;
    command: string;
    params: string;
    path: string;
  }

  interface ProcessesProcessLoadData {
    proc: string;
    pid: number;
    pids: number[];
    cpu: number;
    mem: number;
  }

  interface ServicesData {
    name: string;
    running: boolean;
    startmode: string;
    pids: number[];
    pcpu: number;
    pmem: number;
  }

  // 8. Docker

  interface DockerInfoData {
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
    mfd: number;
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
  }

  interface DockerContainerData {
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
  }

  interface DockerContainerMountData {
    Type: string;
    Source: string;
    Destination: string;
    Mode: string;
    RW: boolean;
    Propagation: string;
  }

  interface DockerContainerStatsData {
    id: string;
    mem_usage: number;
    mem_limit: number;
    mem_percent: number;
    cpu_percent: number;
    netIO: {
      rx: number;
      wx: number;
    };
    blockIO: {
      r: number;
      w: number;
    };
    restartCount: number;
    cpu_stats: any;
    precpu_stats: any;
    memory_stats: any,
    networks: any;
  }

  // 9. Virtual Box

  interface VboxInfoData {
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
    HPET: boolean;
    PAE: boolean;
    longMode: boolean;
    tripleFaultReset: boolean;
    APIC: boolean;
    X2APIC: boolean;
    ACPI: boolean;
    IOAPIC: boolean;
    biosAPICmode: string;
    bootMenuMode: string;
    bootDevice1: string;
    bootDevice2: string;
    bootDevice3: string;
    bootDevice4: string;
    timeOffset: string;
    RTC: string;
  }

  // 10. "Get All at once" - functions

  interface StaticData {
    version: string;
    system: SystemData;
    bios: BiosData;
    baseboard: BaseboardData;
    chassis: ChassisData;
    os: OsData;
    uuid: UuidData;
    versions: VersionData;
    cpu: CpuWithFlagsData;
    graphics: GraphicsData;
    net: NetworkInterfacesData[];
    memLayout: MemLayoutData[];
    diskLayout: DiskLayoutData[];
  }

}

export function version(): string;
export function system(cb?: (data: Systeminformation.SystemData) => any): Promise<Systeminformation.SystemData>;
export function bios(cb?: (data: Systeminformation.BiosData) => any): Promise<Systeminformation.BiosData>;
export function baseboard(cb?: (data: Systeminformation.BaseboardData) => any): Promise<Systeminformation.BaseboardData>;
export function chassis(cb?: (data: Systeminformation.ChassisData) => any): Promise<Systeminformation.ChassisData>;

export function time(): Systeminformation.TimeData;
export function osInfo(cb?: (data: Systeminformation.OsData) => any): Promise<Systeminformation.OsData>;
export function versions(apps?: string, cb?: (data: Systeminformation.VersionData) => any): Promise<Systeminformation.VersionData>;
export function shell(cb?: (data: string) => any): Promise<string>;
export function uuid(cb?: (data: Systeminformation.UuidData) => any): Promise<Systeminformation.UuidData>;

export function cpu(cb?: (data: Systeminformation.CpuData) => any): Promise<Systeminformation.CpuData>;
export function cpuFlags(cb?: (data: string) => any): Promise<string>;
export function cpuCache(cb?: (data: Systeminformation.CpuCacheData) => any): Promise<Systeminformation.CpuCacheData>;
export function cpuCurrentspeed(cb?: (data: Systeminformation.CpuCurrentSpeedData) => any): Promise<Systeminformation.CpuCurrentSpeedData>;
export function cpuTemperature(cb?: (data: Systeminformation.CpuTemperatureData) => any): Promise<Systeminformation.CpuTemperatureData>;
export function currentLoad(cb?: (data: Systeminformation.CurrentLoadData) => any): Promise<Systeminformation.CurrentLoadData>;
export function fullLoad(cb?: (data: number) => any): Promise<number>;

export function mem(cb?: (data: Systeminformation.MemData) => any): Promise<Systeminformation.MemData>;
export function memLayout(cb?: (data: Systeminformation.MemLayoutData[]) => any): Promise<Systeminformation.MemLayoutData[]>;

export function battery(cb?: (data: Systeminformation.BatteryData) => any): Promise<Systeminformation.BatteryData>;
export function graphics(cb?: (data: Systeminformation.GraphicsData) => any): Promise<Systeminformation.GraphicsData>;

export function fsSize(cb?: (data: Systeminformation.FsSizeData[]) => any): Promise<Systeminformation.FsSizeData[]>;
export function fsOpenFiles(cb?: (data: Systeminformation.FsOpenFilesData[]) => any): Promise<Systeminformation.FsOpenFilesData[]>;
export function blockDevices(cb?: (data: Systeminformation.BlockDevicesData[]) => any): Promise<Systeminformation.BlockDevicesData[]>;
export function fsStats(cb?: (data: Systeminformation.FsStatsData) => any): Promise<Systeminformation.FsStatsData>;
export function disksIO(cb?: (data: Systeminformation.DisksIoData) => any): Promise<Systeminformation.DisksIoData>;
export function diskLayout(cb?: (data: Systeminformation.DiskLayoutData[]) => any): Promise<Systeminformation.DiskLayoutData[]>;

export function networkInterfaceDefault(cb?: (data: string) => any): Promise<string>;
export function networkGatewayDefault(cb?: (data: string) => any): Promise<string>;
export function networkInterfaces(cb?: (data: Systeminformation.NetworkInterfacesData[]) => any): Promise<Systeminformation.NetworkInterfacesData[]>;

export function networkStats(ifaces?: string, cb?: (data: Systeminformation.NetworkStatsData[]) => any): Promise<Systeminformation.NetworkStatsData[]>;
export function networkConnections(cb?: (data: Systeminformation.NetworkConnectionsData[]) => any): Promise<Systeminformation.NetworkConnectionsData[]>;
export function inetChecksite(url: string, cb?: (data: Systeminformation.InetChecksiteData) => any): Promise<Systeminformation.InetChecksiteData>;
export function inetLatency(host?: string, cb?: (data: number) => any): Promise<number>;

export function wifiNetworks(cb?: (data: Systeminformation.WifiNetworkData[]) => any): Promise<Systeminformation.WifiNetworkData[]>;

export function users(cb?: (data: Systeminformation.UserData[]) => any): Promise<Systeminformation.UserData[]>;

export function processes(cb?: (data: Systeminformation.ProcessesData) => any): Promise<Systeminformation.ProcessesData>;
export function processLoad(processName: string, cb?: (data: Systeminformation.ProcessesProcessLoadData) => any): Promise<Systeminformation.ProcessesProcessLoadData>;
export function services(serviceName: string, cb?: (data: Systeminformation.ServicesData[]) => any): Promise<Systeminformation.ServicesData[]>;

export function dockerInfo(cb?: (data: Systeminformation.DockerInfoData) => any): Promise<Systeminformation.DockerInfoData>;
export function dockerContainers(all?: boolean, cb?: (data: Systeminformation.DockerContainerData[]) => any): Promise<Systeminformation.DockerContainerData[]>;
export function dockerContainerStats(id?: string, cb?: (data: Systeminformation.DockerContainerStatsData[]) => any): Promise<Systeminformation.DockerContainerStatsData[]>;
export function dockerContainerProcesses(id?: string, cb?: (data: any) => any): Promise<any>;
export function dockerAll(cb?: (data: any) => any): Promise<any>;

export function vboxInfo(cb?: (data: Systeminformation.VboxInfoData[]) => any): Promise<Systeminformation.VboxInfoData[]>;

export function getStaticData(cb?: (data: Systeminformation.StaticData) => any): Promise<Systeminformation.StaticData>;
export function getDynamicData(srv?: string, iface?: string, cb?: (data: any) => any): Promise<any>;
export function getAllData(srv?: string, iface?: string, cb?: (data: any) => any): Promise<any>;
