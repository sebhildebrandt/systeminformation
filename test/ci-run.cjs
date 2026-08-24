const withTimeout = (fn, ms = 20000) =>
  Promise.race([
    Promise.resolve().then(fn),
    new Promise((_, reject) => setTimeout(() => reject(new Error(`timeout after ${ms}ms`)), ms).unref())
  ]);

const describe = (res) => (Array.isArray(res) ? `array(${res.length})` : res === null ? 'null (n/a)' : typeof res);

// --- output formatting ------------------------------------------------------

const useColor = process.stdout.isTTY || !!process.env.FORCE_COLOR;
const green = (s) => (useColor ? `\x1b[32m${s}\x1b[0m` : s);
const red = (s) => (useColor ? `\x1b[31m${s}\x1b[0m` : s);

const NAME_WIDTH = 42;
const TYPE_WIDTH = 14;
const BOX_WIDTH = 72;

const boxTop = () => console.log('┌' + '─'.repeat(BOX_WIDTH) + '┐');
const boxSep = () => console.log('├' + '─'.repeat(BOX_WIDTH) + '┤');
const boxBottom = () => console.log('└' + '─'.repeat(BOX_WIDTH) + '┘');
// pad first, colorize after — ANSI codes must not distort the width
const boxLine = (content, colorize = (s) => s) => console.log('│' + colorize(('  ' + content).padEnd(BOX_WIDTH).substring(0, BOX_WIDTH)) + '│');

const printResultLine = (name, type, ok, ms, detail) => {
  const line = ('  ' + name + ' ').padEnd(NAME_WIDTH, '.') + ' ' + type.padEnd(TYPE_WIDTH);
  const duration = (String(ms) + ' ms').padStart(9) + '  ';
  const status = ok ? green('PASS') : red('FAIL') + (detail ? red(`  (${detail})`) : '');
  console.log(line + duration + status);
};

// si -> name -> thunk (mit sinnvollen Default-Argumenten wo nötig)
function buildTests(si) {
  return {
    // OS / System
    version: () => si.version(),
    osInfo: () => si.osInfo(),
    uuid: () => si.uuid(),
    versions: () => si.versions(),
    system: () => si.system(),
    baseboard: () => si.baseboard(),
    bios: () => si.bios(),
    chassis: () => si.chassis(),
    time: () => si.time(),
    users: () => si.users(),
    shell: () => si.shell(),
    software: () => si.software(),
    npm: () => si.npm(),
    vboxInfo: () => si.vboxInfo(),
    // CPU / Memory
    cpu: () => si.cpu(),
    cpuFlags: () => si.cpuFlags(),
    cpuCache: () => si.cpuCache(),
    cpuCurrentSpeed: () => si.cpuCurrentSpeed(),
    cpuTemperature: () => si.cpuTemperature(),
    currentLoad: () => si.currentLoad(),
    fullLoad: () => si.fullLoad(),
    mem: () => si.mem(),
    memLayout: () => si.memLayout(),
    // Hardware / Peripherals
    gpu: () => si.gpu(),
    displays: () => si.displays(),
    audio: () => si.audio(),
    battery: () => si.battery(),
    bluetoothDevices: () => si.bluetoothDevices(),
    usb: () => si.usb(),
    printer: () => si.printer(),
    camera: () => si.camera(),
    keyboard: () => si.keyboard(),
    mouse: () => si.mouse(),
    pci: () => si.pci(),
    thunderbolt: () => si.thunderbolt(),
    npu: () => si.npu(),
    // File system
    diskLayout: () => si.diskLayout(),
    blockDevices: () => si.blockDevices(),
    disksIO: () => si.disksIO(),
    fsSize: () => si.fsSize(),
    fsOpenFiles: () => si.fsOpenFiles(),
    fsStats: () => si.fsStats(),
    // Network
    networkInterfaces: () => si.networkInterfaces(),
    networkInterfaceDefault: () => si.networkInterfaceDefault(),
    networkGatewayDefault: () => si.networkGatewayDefault(),
    networkConnections: () => si.networkConnections(),
    networkStats: () => si.networkStats('*'),
    inetLatency: () => si.inetLatency('github.com'), // ponytail: braucht Netz; auf CI-Runnern vorhanden
    inetChecksite: () => si.inetChecksite('https://github.com'),
    wifiNetworks: () => si.wifiNetworks(),
    wifiInterfaces: () => si.wifiInterfaces(),
    wifiConnections: () => si.wifiConnections(),
    // Processes
    processes: () => si.processes(),
    processLoad: () => si.processLoad('node'),
    services: () => si.services('*'),
    // Aggregation
    get: () => si.get({ cpu: 'manufacturer, brand, speed', mem: 'total, free', osInfo: '*' }),
    observe: () =>
      new Promise((resolve) => {
        const handle = si.observe({ time: 'uptime' }, 500, () => {
          clearInterval(handle);
          resolve('callback fired');
        });
      }),
    getStaticData: () => si.getStaticData(),
    getDynamicData: () => si.getDynamicData(),
    getAllData: () => si.getAllData(),
    // Docker (ohne laufenden Daemon: leeres Ergebnis erwartet, kein Crash)
    dockerInfo: () => si.dockerInfo(),
    dockerImages: () => si.dockerImages(),
    dockerContainers: () => si.dockerContainers(),
    dockerContainerStats: () => si.dockerContainerStats(),
    dockerContainerProcesses: () => si.dockerContainerProcesses('*'),
    dockerVolumes: () => si.dockerVolumes(),
    dockerAll: () => si.dockerAll()
  };
}

// ponytail: versions probes ~50 tools; JVM cold starts (gradle/maven) push it past 20s on windows runners
const SLOW = new Set(['versions', 'getStaticData', 'getDynamicData', 'getAllData', 'inetChecksite', 'inetLatency']);

async function runCi(si) {
  const lib_version = String(await si.version());
  const tests = buildTests(si);
  const failed = [];
  const names = Object.keys(tests);

  boxTop();
  boxLine('SYSTEMINFORMATION CI'.padEnd(BOX_WIDTH - 13 - lib_version.length) + 'Version: ' + lib_version);
  boxBottom();
  console.log('');

  const started = Date.now();
  for (const name of names) {
    const t = Date.now();
    try {
      const res = await withTimeout(tests[name], SLOW.has(name) ? 120000 : 20000);
      if (res === undefined) {
        throw new Error('returned undefined');
      }
      printResultLine(name, describe(res), true, Date.now() - t);
    } catch (e) {
      const detail = (e && e.message) || String(e);
      printResultLine(name, '-', false, Date.now() - t, detail);
      failed.push({ name, detail });
    }
  }

  console.log('');
  boxTop();
  boxLine(
    `Functions: ${String(names.length).padStart(3)}      PASS: ${String(names.length - failed.length).padStart(3)}      FAIL: ${String(failed.length).padStart(3)}      Time: ${((Date.now() - started) / 1000).toFixed(1)} s`,
    failed.length ? red : green
  );
  if (failed.length) {
    boxSep();
    boxLine('Failed: ' + failed.map((f) => f.name).join(', '), red);
  }
  boxBottom();
  if (failed.length && process.env.GITHUB_ACTIONS) {
    // surface failures as annotations (visible in the run summary / checks API)
    for (const f of failed) {
      console.log(`::error title=CI ${f.name}::${f.detail.replace(/\r?\n/g, ' ')}`);
    }
  }
  process.exit(failed.length ? 1 : 0);
}

module.exports = { runCi };
