<p align="center">
  <a href="https://systeminformation.io/">
    <img src="https://systeminformation.io/assets/logo_inv.png" alt="systeminformation logo" width="102" height="72">
  </a>
</p>

<h3 align="center">systeminformation</h3>

<p align="center">
  System and OS information library for node.js
  <br>
  <a href="https://systeminformation.io/"><strong>Explore Systeminformation docs »</strong></a>
  <br>
  <br>
  <a href="https://github.com/sebhildebrandt/systeminformation/issues/new?template=bug_report.md">Report bug</a>
  ·
  <a href="https://github.com/sebhildebrandt/systeminformation/issues/new?template=feature_request.md&labels=feature">Request feature</a>
  ·
  <a href="https://github.com/sebhildebrandt/systeminformation/blob/master/CHANGELOG.md">Changelog</a>
</p>

  [![NPM Version][npm-image]][npm-url]
  [![NPM Downloads][downloads-image]][downloads-url]
  [![Git Issues][issues-img]][issues-url]
  [![Closed Issues][closed-issues-img]][closed-issues-url]
  [![deps status][daviddm-img]][daviddm-url]
  [![Code Quality: Javascript][lgtm-badge]][lgtm-badge-url]
  [![Total alerts][lgtm-alerts]][lgtm-alerts-url]
  [![Caretaker][caretaker-image]][caretaker-url]
  [![Sponsoring][sponsor-badge]][sponsor-url]
  [![MIT license][license-img]][license-url]

This is amazing. Started as a small project just for myself, it now has > 9,000 lines of code, > 300 versions published, > 1 mio downloads per month, > 15 mio downloads overall. Thank you to all who contributed to this project!

## New Version 4.0

This next major version release 4.0 comes with several optimizations and changes:

- new systeminformation website with better documentation and examples [systeminformation.io][systeminformation-url]
- added typescript definitions
- reworked network section: this will now return more information and allows to get networkStats for more than one interface at once.
- dockerContainerStats for multiple containers or all containers at once
- optimized graphics controller and display detection
- added wifiNetworks to get available wifi networks
- added vboxInfo to get detailed vm information
- added chassis information
- better Raspberry-PI detection
- lot of minor improvements

Breaking Changes: you will see some minor breaking changes. Read the [detailed changelog][changelog-url].

## Quick Start

Lightweight collection of 40+ functions to retrieve detailed hardware, system and OS information.

- simple to use
- get detailed information about system, cpu, baseboard, battery, memory, disks/filesystem, network, docker, software, services and processes
- supports Linux, macOS, partial Windows, FreeBSD, OpenBSD, NetBSD and SunOS support
- no npm dependencies (for production)

**Attention**: this is a `node.js` library. It is supposed to be used as a backend/server-side library and will definilely not work within a browser.

### Installation

```bash
$ npm install systeminformation --save
```

### Usage

All functions (except `version` and `time`) are implemented as asynchronous functions. Here a small example how to use them:

```js
const si = require('systeminformation');

// promises style - new since version 3
si.cpu()
  .then(data => console.log(data))
  .catch(error => console.error(error));
```

**Callback, Promises, Awync / Await**

## News and Changes

### Latest Activity

(last 7 major and minor version releases)

- Version 4.27.0: `observe()` added observe / watch function
- Version 4.26.0: `diskLayout()` added full S.M.A.R.T data (linux)
- Version 4.25.0: `get()` added function to get partial system info
- Version 4.24.0: `networkInterfaces()` added subnet mask ip4 and ip6
- Version 4.23.0: `versions()` added param to specify which program/lib versions to detect
- Version 4.22.0: `services()` added pids (windows)
- Version 4.21.0: added npx copmpatibility
- ...

You can find all changes here: [detailed changelog][changelog-url]

## Core concept

[Node.js][nodejs-url] comes with some basic OS information, but I always wanted a little more. So I came up to write this little library. This library is still work in progress. It is supposed to be used as a backend/server-side library (will definilely not work within a browser). It requires node.js version 4.0 and above.

I was able to test it on several Debian, Raspbian, Ubuntu distributions as well as macOS (Mavericks, Yosemite, El Captain, Sierra, High Sierra, Mojave) and some Windows 7, Windows 10, FreeBSD, OpenBSD, NetBSD and SunOS machines. Not all functions are supported on all operating systems. Have a look at the function reference in the docs to get further details.

If you have comments, suggestions & reports, please feel free to contact me!

I also created a nice little command line tool called [mmon][mmon-github-url] (micro-monitor) for Linux and macOS, also available via [github][mmon-github-url] and [npm][mmon-npm-url]


## Reference

### Function Reference and OS Support

#### 1. General

| Function        | Result object | Linux | BSD | Mac | Win | Sun | Comments |
| --------------- | ------------- | ----- | ------- | --- | --- | --- | -------- |
| si.version() | : string | X | X | X | X | X | lib version (no callback/promise) |
| si.time() | {...} | X | X | X | X | X | (no callback/promise) |
| | current | X | X | X | X | X | local (server) time |
| | uptime | X | X | X | X | X | uptime in number of seconds |
| | timezone | X | X | X | X | X | e.g. GMT+0200 |
| | timezoneName | X | X | X | X | X | e.g. CEST |

#### 2. System (HW)

| Function        | Result object | Linux | BSD | Mac | Win | Sun | Comments |
| --------------- | ------------- | ----- | ------- | --- | --- | --- | -------- |
| si.system(cb) | {...} | X | X | X | X |  | hardware information |
| | manufacturer | X | X | X | X |  | e.g. 'MSI' |
| | model | X | X | X | X |  | model/product e.g. 'MS-7823' |
| | version | X | X | X | X |  | version e.g. '1.0' |
| | serial | X | X | X | X |  | serial number |
| | uuid | X | X | X | X |  | UUID |
| | sku | X | X | X | X |  | SKU number |
| si.bios(cb) | {...} | X | X | X | X |  | bios information |
| | vendor | X | X | X | X |  | e.g. 'AMI' |
| | version | X | X |  | X |  | version |
| | releaseDate | X | X |  | X |  | release date |
| | revision | X | X |  | X |  | revision |
| si.baseboard(cb) | {...} | X | X | X | X |  | baseboard information |
| | manufacturer | X | X | X | X |  | e.g. 'ASUS' |
| | model | X | X | X | X |  | model / product name |
| | version | X | X | X | X |  | version |
| | serial | X | X | X | X |  | serial number |
| | assetTag | X | X | X | X |  | asset tag |
| si.chassis(cb) | {...} | X | X | X | X |  | chassis information |
| | manufacturer | X | X | X | X |  | e.g. 'MSI' |
| | model | X | X | X | X |  | model / product name |
| | type | X | X | X | X |  | model / product name |
| | version | X | X | X | X |  | version |
| | serial | X | X | X | X |  | serial number |
| | assetTag | X | X | X | X |  | asset tag |
| | sku |  |  |  | X |  | SKU number |

#### 3. CPU

| Function        | Result object | Linux | BSD | Mac | Win | Sun | Comments |
| --------------- | ------------- | ----- | ------- | --- | --- | --- | -------- |
| si.cpu(cb) | {...} | X | X | X | X |  | CPU information|
| | manufacturer | X | X | X | X |  | e.g. 'Intel(R)' |
| | brand | X | X | X | X |  | e.g. 'Core(TM)2 Duo' |
| | speed | X | X | X | X |  | in GHz e.g. '3.40' |
| | speedmin | X |  | X | X |  | in GHz e.g. '0.80' |
| | speedmax | X | X | X | X |  | in GHz e.g. '3.90' |
| | governor | X | | | |  | e.g. 'powersave' |
| | cores | X | X | X | X |  | # cores |
| | physicalCores | X | X | X | X |  | # physical cores |
| | processors | X | X | X | X |  | # processors |
| | socket | X | X |  | X |  | socket type e.g. "LGA1356" |
| | vendor | X | X | X | X |  | vendor ID |
| | family | X | X | X | X |  | processor family |
| | model | X | X | X | X |  | processor model |
| | stepping | X | X | X | X |  | processor stepping |
| | revision | X |  | X | X |  | revision |
| | voltage |   | X |   |   |  | voltage |
| | cache | X | X | X | X |  | cache in bytes (object) |
| | cache.l1d | X | X | X | X |  | L1D (data) size |
| | cache.l1i | X | X | X | X |  | L1I (instruction) size |
| | cache.l2 | X | X | X | X |  | L2 size |
| | cache.l3 | X | X | X | X |  | L3 size |
| si.cpuFlags(cb) | : string | X | X | X | X |  | CPU flags|
| si.cpuCache(cb) | {...} | X | X | X | X |  | CPU cache sizes |
| | l1d | X | X | X | X |  | L1D size |
| | l1i | X | X | X | X |  | L1I size |
| | l2 | X | X | X | X |  | L2 size |
| | l3 | X | X | X | X |  | L3 size |
| si.cpuCurrentspeed(cb) | {...} | X | X | X | X | X | current CPU speed (in GHz)|
| | avg | X | X | X | X | X | avg CPU speed (all cores) |
| | min | X | X | X | X | X | min CPU speed (all cores) |
| | max | X | X | X | X | X | max CPU speed (all cores) |
| | cores | X | X | X | X | X | CPU speed per core (array) |
| si.cpuTemperature(cb) | {...} | X | X | X* | X |  | CPU temperature (if supported) |
| | main | X | X | X | X |  | main temperature (avg) |
| | cores | X | X | X | X |  | array of temperatures |
| | max | X | X | X | X |  | max temperature |

#### 4. Memory

| Function        | Result object | Linux | BSD | Mac | Win | Sun | Comments |
| --------------- | ------------- | ----- | ------- | --- | --- | --- | -------- |
| si.mem(cb) | {...} | X | X | X | X | X | Memory information (in bytes)|
| | total | X | X | X | X | X | total memory in bytes |
| | free | X | X | X | X | X | not used in bytes |
| | used | X | X | X | X | X | used (incl. buffers/cache) |
| | active | X | X | X | X | X | used actively (excl. buffers/cache)  |
| | buffcache | X | X | X |  | X | used by buffers+cache |
| | buffers | X |  |  |  |  | used by buffers |
| | cached | X |  |  |  |  | used by cache |
| | slab | X |  |  |  |  | used by slab |
| | available | X | X | X | X | X | potentially available (total - active) |
| | swaptotal | X | X | X | X | X |  |
| | swapused | X | X | X | X | X |  |
| | swapfree | X | X | X | X | X |  |
| si.memLayout(cb) | [{...}] | X | X | X | X |  | Memory Layout (array) |
| | [0].size | X | X | X | X |  | size in bytes |
| | [0].bank | X | X |   | X |  | memory bank |
| | [0].type | X | X | X | X |  | memory type |
| | [0].clockSpeed | X | X | X | X |  | clock speed |
| | [0].formFactor | X | X |   | X |  | form factor |
| | [0].manufacturer | X | X | X | X |  | manufacturer |
| | [0].partNum | X | X | X | X |  | part number |
| | [0].serialNum | X | X | X | X |  | serial number |
| | [0].voltageConfigured | X | X |   | X |  | voltage conf. |
| | [0].voltageMin | X | X |   | X |  | voltage min |
| | [0].voltageMax | X | X |   | X |  | voltage max |

#### 5. Battery

| Function        | Result object | Linux | BSD | Mac | Win | Sun | Comments |
| --------------- | ------------- | ----- | ------- | --- | --- | --- | -------- |
| si.battery(cb) | {...} | X | X | X | X |  | battery information |
| | hasbattery | X | X | X | X |  | indicates presence of battery |
| | cyclecount | X |  | X | |  | numbers of recharges |
| | ischarging | X | X | X | X |  | indicates if battery is charging |
| | designedcapacity | X |  | X | X |  | max capacity of battery (mWh) |
| | maxcapacity | X |  | X | X |  | max capacity of battery (mWh) |
| | currentcapacity | X |  | X | X |  | current capacity of battery (mWh) |
| | capacityUnit | X |  | X | X |  | capacity unit (mWh) |
| | voltage | X |  | X | X |  | current voltage of battery (V) |
| | percent | X | X | X | X |  | charging level in percent |
| | timeremaining | X |  | X |  |  | minutes left (if discharging) |
| | acconnected | X | X | X | X |  | AC connected |
| | type | X |  | X |  |  | battery type |
| | model | X |  | X |  |  | model |
| | manufacturer | X |  | X |  |  | manufacturer |
| | serial | X |  | X |  |  | battery serial |

* See known issues if you have problem with macOS temperature or windows temperature

#### 6. Graphics

| Function        | Result object | Linux | BSD | Mac | Win | Sun | Comments |
| --------------- | ------------- | ----- | ------- | --- | --- | --- | -------- |
| si.graphics(cb) | {...} | X |  | X | X |  | arrays of graphics controllers and displays |
| | controllers[]| X |  | X | X |  | graphics controllers array |
| | ...[0].model | X |  | X | X |  | graphics controller model |
| | ...[0].vendor | X |  | X | X |  | e.g. ATI |
| | ...[0].bus | X |  | X | X |  | on which bus (e.g. PCIe) |
| | ...[0].vram | X |  | X | X |  | VRAM size (in MB) |
| | ...[0].vramDynamic | X |  | X | X |  | true if dynamicly allocated ram |
| | displays[] | X |  | X | X |  | monitor/display array |
| | ...[0].vendor |  |  |  | X |  | monitor/display vendor |
| | ...[0].model | X |  | X | X |  | monitor/display model |
| | ...[0].main | X |  | X | X|  | true if main monitor |
| | ...[0].builtin | X |  | X |  |  | true if built in monitor |
| | ...[0].connection | X |  | X | X |  | e.g. DisplayPort or HDMI |
| | ...[0].sizex | X |  | X | X |  | size in mm horizontal |
| | ...[0].sizey | X |  | X | X |  | size in mm vertical |
| | ...[0].pixeldepth | X |  | X | X |  | color depth in bits |
| | ...[0].resolutionx | X |  | X | X |  | pixel horizontal |
| | ...[0].resolutiony | X |  | X | X |  | pixel vertical |
| | ...[0].currentResX | X |  | X | X |  | current pixel horizontal |
| | ...[0].currentResY | X |  | X | X |  | current pixel vertical |
| | ...[0].positionX |  |  |  | X |  | display position X |
| | ...[0].positionY |  |  |  | X |  | display position Y |
| | ...[0].currentRefreshRate | X |  | X | X |  | current screen refresh rate |

#### 7. Operating System

| Function        | Result object | Linux | BSD | Mac | Win | Sun | Comments |
| --------------- | ------------- | ----- | ------- | --- | --- | --- | -------- |
| si.osInfo(cb) | {...} | X | X | X | X | X | OS information |
| | platform   | X | X | X | X | X | 'linux', 'darwin', 'win32', ... |
| | distro | X | X | X | X | X |  |
| | release | X | X | X | X | X |  |
| | codename | | | X |  |  |  |
| | kernel | X | X | X | X | X | kernel release - same as os.release() |
| | arch | X | X | X | X | X | same as os.arch() |
| | hostname | X | X | X | X | X | same as os.hostname() |
| | codepage | X | X | X | X |   | OS build version |
| | logofile | X | X | X | X | X | e.g. 'apple', 'debian', 'fedora', ... |
| | serial | X | X | X | X |   | OS/Host serial number |
| | build | X |   | X | X |   | OS build version |
| | servicepack | | | | X |   | service pack version |
| | uefi | X | X | X | X |   | OS started via UEFI |
| si.uuid(cb) | {...} | X | X | X | X | X | object of several UUIDs |
| | os | X | X | X | X |  | os specific UUID |
| si.versions(apps, cb) | {...} | X | X | X | X | X | version information (kernel, ssl, node, ...)<br />apps param is optional for detecting<br />only specific apps/libs<br />(string, comma separated) |
| si.shell(cb) | : string | X | X | X |  |  | standard shell |
| si.users(cb) | [{...}] | X | X | X | X | X | array of users online |
| | [0].user | X | X | X | X | X | user name |
| | [0].tty | X | X | X | X | X | terminal |
| | [0].date | X | X | X | X | X | login date |
| | [0].time | X | X | X | X | X | login time |
| | [0].ip | X | X | X |  | X | ip address (remote login) |
| | [0].command | X | X | X |  | X | last command or shell |

#### 8. Current Load, Processes & Services

| Function        | Result object | Linux | BSD | Mac | Win | Sun | Comments |
| --------------- | ------------- | ----- | ------- | --- | --- | --- | -------- |
| si.currentLoad(cb) | {...} | X |  | X | X | X | CPU-Load |
| | avgload | X |  | X | | X | average load  |
| | currentload | X |  | X | X | X | CPU load in % |
| | currentload_user | X |  | X | X | X | CPU load user in % |
| | currentload_system | X |  | X | X | X | CPU load system in % |
| | currentload_nice | X |  | X | X | X | CPU load nice in % |
| | currentload_idle | X |  | X | X | X | CPU load idle in % |
| | currentload_irq | X |  | X | X | X | CPU load system in % |
| | raw_currentload... | X |  | X | X | X | CPU load raw values (ticks) |
| | cpus[] | X |  | X | X | X | current loads per CPU in % + raw ticks |
| si.fullLoad(cb) | : integer | X |  | X | X |  | CPU full load since bootup in % |
| si.processes(cb) | {...} | X | X | X | X | X | # running processes |
| | all | X | X | X | X | X | # of all processes |
| | running | X | X | X | X | X | # of all processes running |
| | blocked | X | X | X | X | X | # of all processes blocked |
| | sleeping | X | X | X | X | X | # of all processes sleeping |
| | unknown |   |   |   | X |  | # of all processes unknown status |
| | list[] | X | X | X | X | X | list of all processes incl. details |
| | ...[0].pid | X | X | X | X | X | process PID |
| | ...[0].parentPid | X | X | X | X | X | parent process PID |
| | ...[0].name | X | X | X | X | X | process name |
| | ...[0].pcpu | X | X | X | X | X | process % CPU usage |
| | ...[0].pcpuu | X | X |  | X |   | process % CPU usage (user) |
| | ...[0].pcpus | X | X |  | X |   | process % CPU usage (system) |
| | ...[0].pmem | X | X | X | X | X | process memory % |
| | ...[0].priority | X | X | X | X | X | process priotity |
| | ...[0].mem_vsz | X | X | X | X | X | process virtual memory size |
| | ...[0].mem_rss | X | X | X | X | X | process mem resident set size |
| | ...[0].nice | X | X | X |  | X | process nice value |
| | ...[0].started | X | X | X | X | X | process start time |
| | ...[0].state | X | X | X | X | X | process state (e.g. sleeping) |
| | ...[0].tty | X | X | X |  | X | tty from which process was started |
| | ...[0].user | X | X | X |  | X | user who started process |
| | ...[0].command | X | X | X | X | X | process starting command |
| | ...[0].params | X | X | X |   | X | process params |
| | ...[0].path | X | X | X | X | X | process path |
| | proc | X | X | X | X |  | process name |
| | pid | X | X | X | X |  | PID |
| | pids | X | X | X | X |  | additional pids |
| | cpu | X | X | X | X |  | process % CPU |
| | mem | X | X | X | X |  | process % MEM |
| si.services('mysql, apache2', cb) | [{...}] | X | X | X | X |  | pass comma separated string of services<br>pass "*" for ALL services (linux/win only) |
| | [0].name | X | X | X | X |  | name of service |
| | [0].running | X | X | X | X |  | true / false |
| | [0].startmode |   |   |   | X |  | manual, automatic, ... |
| | [0].pids | X | X | X | X |  | pids |
| | [0].pcpu | X | X | X |  |  | process % CPU |
| | [0].pmem | X | X | X |  |  | process % MEM |

#### 9. File System

| Function        | Result object | Linux | BSD | Mac | Win | Sun | Comments |
| --------------- | ------------- | ----- | ------- | --- | --- | --- | -------- |
| si.diskLayout(cb) | [{...}] | X |  | X | X |  | physical disk layout (array) |
| | [0].device | X |  | X |  |  | e.g. /dev/sda |
| | [0].type | X |  | X | X |  | HD, SSD, NVMe |
| | [0].name | X |  | X | X |  | disk name |
| | [0].vendor | X |  | | X |  | vendor/producer |
| | [0].size | X |  | X | X |  | size in bytes |
| | [0].bytesPerSector | |  | | X |  | bytes per sector |
| | [0].totalCylinders | |  | | X |  | total cylinders |
| | [0].totalHeads | |  | | X |  | total heads |
| | [0].totalSectors | |  | | X |  | total sectors |
| | [0].totalTracks | |  | | X |  | total tracks |
| | [0].tracksPerCylinder | |  | | X |  | tracks per cylinder |
| | [0].sectorsPerTrack | |  | | X |  | sectors per track |
| | [0].firmwareRevision | X |  | X | X |  | firmware revision |
| | [0].serialNum | X |  | X | X |  | serial number |
| | [0].interfaceType | X |  | | X |  | SATA, PCIe, ... |
| | [0].smartStatus | X |  | X | X |  | S.M.A.R.T Status (see Known Issues) |
| | [0].smartData | X |  |  |  |  | full S.M.A.R.T data from smartctl<br>requires at least smartmontools 7.0 |
| si.blockDevices(cb) | [{...}] | X |  | X | X |  | returns array of disks, partitions,<br>raids and roms |
| | [0].name | X |  | X | X |  | name |
| | [0].type | X |  | X | X |  | type |
| | [0].fstype | X |  | X | X |  | file system type (e.g. ext4) |
| | [0].mount | X |  | X | X |  | mount point |
| | [0].size | X |  | X | X |  | size in bytes |
| | [0].physical | X |  | X | X |  | physical type (HDD, SSD, CD/DVD) |
| | [0].uuid | X |  | X | X |  | UUID |
| | [0].label | X |  | X | X |  | label |
| | [0].model | X |  | X |  |  | model |
| | [0].serial | X |  |  | X |  | serial |
| | [0].removable | X |  | X | X |  | serial |
| | [0].protocol | X |  | X |  |  | protocol (SATA, PCI-Express, ...) |
| si.disksIO(cb) | {...} | X |  | X |  |  | current transfer stats |
| | rIO | X |  | X |  |  | read IOs on all mounted drives |
| | wIO | X |  | X |  |  | write IOs on all mounted drives |
| | tIO | X |  | X |  |  | write IOs on all mounted drives |
| | rIO_sec | X |  | X |  |  | read IO per sec (* see notes) |
| | wIO_sec | X |  | X |  |  | write IO per sec (* see notes) |
| | tIO_sec | X |  | X |  |  | total IO per sec (* see notes) |
| | ms | X |  | X |  |  | interval length (for per second values) |
| si.fsSize(cb) | [{...}] | X | X | X | X |  | returns array of mounted file systems |
| | [0].fs | X | X | X | X |  | name of file system |
| | [0].type | X | X | X | X |  | type of file system |
| | [0].size | X | X | X | X |  | sizes in bytes |
| | [0].used | X | X | X | X |  | used in bytes |
| | [0].use | X | X | X | X |  | used in % |
| | [0].mount | X | X | X | X |  | mount point |
| si.fsOpenFiles(cb) | {...} | X | X | X |  |  | count max/allocated file descriptors |
| | max | X | X | X |  |  | max file descriptors |
| | allocated | X | X | X |  |  | current open files count |
| | available | X | X | X |  |  | count available |
| si.fsStats(cb) | {...} | X |  | X |  |  | current transfer stats |
| | rx | X |  | X |  |  | bytes read since startup |
| | wx | X |  | X |  |  | bytes written since startup |
| | tx | X |  | X |  |  | total bytes read + written since startup |
| | rx_sec | X |  | X |  |  | bytes read / second (* see notes) |
| | wx_sec | X |  | X |  |  | bytes written / second (* see notes) |
| | tx_sec | X |  | X |  |  | total bytes reads + written / second  |
| | ms | X |  | X |  |  | interval length (for per second values) |

#### 10. Network related functions

| Function        | Result object | Linux | BSD | Mac | Win | Sun | Comments |
| --------------- | ------------- | ----- | ------- | --- | --- | --- | -------- |
| si.networkInterfaces(cb) | [{...}] | X | X | X | X | X | array of network interfaces |
| | [0].iface | X | X | X | X | X | interface |
| | [0].ifaceName | X | X | X | X | X | interface name (differs on Windows) |
| | [0].ip4 | X | X | X | X | X | ip4 address |
| | [0].ip4subnet | X | X | X | X | X | ip4 subnet mask |
| | [0].ip6 | X | X | X | X | X | ip6 address |
| | [0].ip6subnet | X | X | X | X | X | ip6 subnet mask |
| | [0].mac | X | X | X | X | X | MAC address |
| | [0].internal | X | X | X | X | X | true if internal interface |
| | [0].virtual | X | X | X | X | X | true if virtual interface |
| | [0].operstate | X | | X | X |  | up / down |
| | [0].type | X | | X | X | | wireless / wired |
| | [0].duplex | X | | X | | | duplex |
| | [0].mtu | X | | X | | | maximum transmission unit |
| | [0].speed | X | | X | X | | speed in MBit / s |
| | [0].dhcp | X | | X | X | | IP address obtained by DHCP |
| | [0].dnsSuffix | X | | | X | | DNS suffix |
| | [0].ieee8021xAuth | X | | | X | | IEEE 802.1x auth |
| | [0].ieee8021xState | X | | | X | | IEEE 802.1x state |
| | [0].carrierChanges | X | | | | | # changes up/down |
| si.networkInterfaceDefault(cb) | : string | X | X | X | X | X | get name of default network interface |
| si.networkGatewayDefault(cb) | : string | X | X | X | X | X | get default network gateway |
| si.networkStats(ifaces,cb) | [{...}] | X | X | X | X |  | current network stats of given interfaces<br>iface list: space or comma separated<br>iface parameter is optional<br>defaults to first external network interface,<br />Pass '*' for all interfaces |
| | [0].iface | X | X | X | X |  | interface |
| | [0].operstate | X | X | X | X |  | up / down |
| | [0].rx_bytes | X | X | X | X |  | received bytes overall |
| | [0].rx_dropped | X | X | X | X |  | received dropped overall |
| | [0].rx_errors | X | X | X | X |  | received errors overall |
| | [0].tx_bytes | X | X | X | X |  | transferred bytes overall |
| | [0].tx_dropped | X | X | X | X |  | transferred dropped overall |
| | [0].tx_errors | X | X | X | X |  | transferred errors overall |
| | [0].rx_sec | X | X | X | X |  | received bytes / second (* see notes) |
| | [0].tx_sec | X | X | X | X |  | transferred bytes per second (* see notes) |
| | [0].ms | X | X | X | X |  | interval length (for per second values) |
| si.networkConnections(cb) | [{...}] | X | X | X | X |  | current network network connections<br>returns an array of all connections|
| | [0].protocol | X | X | X | X |  | tcp or udp |
| | [0].localaddress | X | X | X | X |  | local address |
| | [0].localport | X | X | X | X |  | local port |
| | [0].peeraddress | X | X | X | X |  | peer address |
| | [0].peerport | X | X | X | X |  | peer port |
| | [0].state | X | X | X | X |  | like ESTABLISHED, TIME_WAIT, ... |
| | [0].pid | X | X | X | X |  | process ID |
| | [0].process | X | X |  |  |  | process name |
| si.inetChecksite(url, cb) | {...} | X | X | X | X | X | response-time (ms) to fetch given URL |
| | url | X | X | X | X | X | given url |
| | ok | X | X | X | X | X | status code OK (2xx, 3xx) |
| | status | X | X | X | X | X | status code |
| | ms | X | X | X | X | X | response time in ms |
| si.inetLatency(host, cb) | : number | X | X | X | X | X | response-time (ms) to external resource<br>host parameter is optional (default 8.8.8.8)|

#### 11. Wifi networks
| Function        | Result object | Linux | BSD | Mac | Win | Sun | Comments |
| --------------- | ------------- | ----- | ------- | --- | --- | --- | -------- |
| si.wifiNetworks(cb) | [{...}] | X |  | X | X |  | array of available wifi networks |
| | [0].ssid | X |  | X | X |   | Wifi network SSID |
| | [0].bssid | X |  | X | X |   | BSSID (mac) |
| | [0].mode | X |  |   |   |   | mode |
| | [0].channel | X |  | X | X |   | channel |
| | [0].frequency | X |  | X | X |   | frequengy in MHz |
| | [0].signalLevel | X |  | X | X |   | signal level in dB |
| | [0].quality | X |  | X | X |   | quaility in % |
| | [0].security | X |  | X | X |   | array e.g. WPA, WPA-2 |
| | [0].wpaFlags | X |  | X | X |   | array of WPA flags |
| | [0].rsnFlags | X |  |  |   |   | array of RDN flags |

#### 12. Docker

| Function        | Result object | Linux | BSD | Mac | Win | Sun | Comments |
| --------------- | ------------- | ----- | ------- | --- | --- | --- | -------- |
| si.dockerInfo(cb) | {...} | X | X | X | X | X | returns general docker info |
| | id | X | X | X | X | X | Docker ID |
| | containers | X | X | X | X | X | number of containers |
| | containersRunning | X | X | X | X | X | number of running containers |
| | containersPaused | X | X | X | X | X | number of paused containers |
| | containersStopped | X | X | X | X | X | number of stopped containers |
| | images | X | X | X | X | X | number of images |
| | driver | X | X | X | X | X | driver (e.g. 'devicemapper', 'overlay2') |
| | memoryLimit | X | X | X | X | X | has memory limit |
| | swapLimit | X | X | X | X | X | has swap limit |
| | kernelMemory | X | X | X | X | X | has kernal memory |
| | cpuCfsPeriod | X | X | X | X | X | has CpuCfsPeriod |
| | cpuCfsQuota | X | X | X | X | X | has CpuCfsQuota |
| | cpuShares | X | X | X | X | X | has CPUShares |
| | cpuSet | X | X | X | X | X | has CPUShares |
| | ipv4Forwarding | X | X | X | X | X | has IPv4Forwarding |
| | bridgeNfIptables | X | X | X | X | X | has BridgeNfIptables |
| | bridgeNfIp6tables | X | X | X | X | X | has BridgeNfIp6tables |
| | debug | X | X | X | X | X | Debug on |
| | nfd | X | X | X | X | X | named data networking forwarding daemon |
| | oomKillDisable | X | X | X | X | X | out-of-memory kill disabled |
| | ngoroutines | X | X | X | X | X | number NGoroutines |
| | systemTime | X | X | X | X | X | docker SystemTime |
| | loggingDriver | X | X | X | X | X | logging driver e.g. 'json-file' |
| | cgroupDriver | X | X | X | X | X | cgroup driver e.g. 'cgroupfs' |
| | nEventsListener | X | X | X | X | X | number NEventsListeners |
| | kernelVersion | X | X | X | X | X | docker kernel version |
| | operatingSystem | X | X | X | X | X | docker OS e.g. 'Docker for Mac' |
| | osType | X | X | X | X | X | OSType e.g. 'linux' |
| | architecture | X | X | X | X | X | architecture e.g. x86_64 |
| | ncpu | X | X | X | X | X | number of CPUs |
| | memTotal | X | X | X | X | X | memory total |
| | dockerRootDir | X | X | X | X | X | docker root directory |
| | httpProxy | X | X | X | X | X | http proxy |
| | httpsProxy | X | X | X | X | X | https proxy |
| | noProxy | X | X | X | X | X | NoProxy |
| | name | X | X | X | X | X | Name |
| | labels | X | X | X | X | X | array of labels |
| | experimentalBuild | X | X | X | X | X | is experimental build |
| | serverVersion | X | X | X | X | X | server version |
| | clusterStore | X | X | X | X | X | cluster store |
| | clusterAdvertise | X | X | X | X | X | cluster advertise |
| | defaultRuntime | X | X | X | X | X | default runtime e.g. 'runc' |
| | liveRestoreEnabled | X | X | X | X | X | live store enabled |
| | isolation | X | X | X | X | X | isolation |
| | initBinary | X | X | X | X | X | init binary |
| | productLicense | X | X | X | X | X | product license |
| si.dockerContainers(all, cb) | [{...}] | X | X | X | X | X | returns array of active/all docker containers |
| | [0].id | X | X | X | X | X | ID of container |
| | [0].name | X | X | X | X | X | name of container |
| | [0].image | X | X | X | X | X | name of image |
| | [0].imageID | X | X | X | X | X | ID of image |
| | [0].command | X | X | X | X | X | command |
| | [0].created | X | X | X | X | X | creation time (unix) |
| | [0].started | X | X | X | X | X | creation time (unix) |
| | [0].finished | X | X | X | X | X | creation time (unix) |
| | [0].createdAt | X | X | X | X | X | creation date time string |
| | [0].startedAt | X | X | X | X | X | creation date time string |
| | [0].finishedAt | X | X | X | X | X | creation date time string |
| | [0].state | X | X | X | X | X | created, running, exited |
| | [0].ports | X | X | X | X | X | array of ports |
| | [0].mounts | X | X | X | X | X | array of mounts |
| si.dockerContainerStats(ids, cb) | [{...}] | X | X | X | X | X | statistics for specific containers<br>container IDs: space or comma separated,<br>pass '*' for all containers|
| | [0].id | X | X | X | X | X | Container ID |
| | [0].mem_usage | X | X | X | X | X | memory usage in bytes |
| | [0].mem_limit | X | X | X | X | X | memory limit (max mem) in bytes |
| | [0].mem_percent | X | X | X | X | X | memory usage in percent |
| | [0].cpu_percent | X | X | X | X | X | cpu usage in percent |
| | [0].pids | X | X | X | X | X | number of processes |
| | [0].netIO.rx | X | X | X | X | X | received bytes via network |
| | [0].netIO.wx | X | X | X | X | X | sent bytes via network |
| | [0].blockIO.r | X | X | X | X | X | bytes read from BlockIO |
| | [0].blockIO.w | X | X | X | X | X | bytes written to BlockIO |
| | [0].cpu_stats | X | X | X | X | X | detailed cpu stats |
| | [0].percpu_stats | X | X | X | X | X | detailed per cpu stats |
| | [0].memory_stats | X | X | X | X | X | detailed memory stats |
| | [0].networks | X | X | X | X | X | detailed network stats per interface |
| si.dockerContainerProcesses(id, cb) | [{...}] | X | X | X | X | X | array of processes inside a container |
| | [0].pid_host | X | X | X | X | X | process ID (host) |
| | [0].ppid | X | X | X | X | X | parent process ID |
| | [0].pgid | X | X | X | X | X | process group ID |
| | [0].user | X | X | X | X | X | effective user name |
| | [0].ruser | X | X | X | X | X | real user name |
| | [0].group | X | X | X | X | X | effective group name |
| | [0].rgroup | X | X | X | X | X | real group name |
| | [0].stat | X | X | X | X | X | process state |
| | [0].time | X | X | X | X | X | accumulated CPU time |
| | [0].elapsed | X | X | X | X | X | elapsed running time |
| | [0].nice | X | X | X | X | X | nice value |
| | [0].rss | X | X | X | X | X | resident set size |
| | [0].vsz | X | X | X | X | X | virtual size in Kbytes |
| | [0].command | X | X | X | X | X | command and arguments |
| si.dockerAll(cb) | {...} | X | X | X | X | X | list of all containers including their stats<br>and processes in one single array |

#### 13. Virtual Box

| Function        | Result object | Linux | BSD | Mac | Win | Sun | Comments |
| --------------- | ------------- | ----- | ------- | --- | --- | --- | -------- |
| si.vboxInfo(cb) | [{...}] | X | X | X | X | X | returns array general virtual box info |
| | [0].id | X | X | X | X | X | virtual box ID |
| | [0].name | X | X | X | X | X | name |
| | [0].running | X | X | X | X | X | vbox is running |
| | [0].started | X | X | X | X | X | started date time |
| | [0].runningSince | X | X | X | X | X | running since (secs) |
| | [0].stopped | X | X | X | X | X | stopped date time |
| | [0].stoppedSince | X | X | X | X | X | stopped since (secs) |
| | [0].guestOS | X | X | X | X | X | Guest OS |
| | [0].hardwareUUID | X | X | X | X | X | Hardware UUID |
| | [0].memory | X | X | X | X | X | Memory in MB |
| | [0].vram | X | X | X | X | X | VRAM in MB |
| | [0].cpus | X | X | X | X | X | CPUs |
| | [0].cpuExepCap | X | X | X | X | X | CPU exec cap |
| | [0].cpuProfile | X | X | X | X | X | CPU profile |
| | [0].chipset | X | X | X | X | X | chipset |
| | [0].firmware | X | X | X | X | X | firmware |
| | [0].pageFusion | X | X | X | X | X | page fusion |
| | [0].configFile | X | X | X | X | X | config file |
| | [0].snapshotFolder | X | X | X | X | X | snapshot folder |
| | [0].logFolder | X | X | X | X | X | log folder path |
| | [0].HPET | X | X | X | X | X | HPET |
| | [0].PAE | X | X | X | X | X | PAE |
| | [0].longMode | X | X | X | X | X | long mode |
| | [0].tripleFaultReset | X | X | X | X | X | triple fault reset |
| | [0].APIC | X | X | X | X | X | APIC |
| | [0].X2APIC | X | X | X | X | X | X2APIC |
| | [0].ACPI | X | X | X | X | X | ACPI |
| | [0].IOAPIC | X | X | X | X | X | IOAPIC |
| | [0].biosAPICmode | X | X | X | X | X | BIOS APIC mode |
| | [0].bootMenuMode | X | X | X | X | X | boot menu Mode |
| | [0].bootDevice1 | X | X | X | X | X | bootDevice1 |
| | [0].bootDevice2 | X | X | X | X | X | bootDevice2 |
| | [0].bootDevice3 | X | X | X | X | X | bootDevice3 |
| | [0].bootDevice4 | X | X | X | X | X | bootDevice4 |
| | [0].timeOffset | X | X | X | X | X | time Offset |
| | [0].RTC | X | X | X | X | X | RTC |

#### 14. "Get All / Observe" - functions

| Function        | Result object | Linux | BSD | Mac | Win | Sun | Comments |
| --------------- | ------------- | ----- | ------- | --- | --- | --- | -------- |
| si.getStaticData(cb) | {...} | X | X | X | X | X | all static data at once |
| si.getDynamicData(srv,iface,cb) | {...} | X | X | X | X | X | all dynamic data at once<br>Specify services and interfaces to monitor<br>Defaults to first external network interface<br>Pass "*" for ALL services (linux/win only)<br>Pass "*" for ALL network interfaces |
| si.getAllData(srv,iface,cb) | {...} | X | X | X | X | X | all data at once<br>Specify services and interfaces to monitor<br>Defaults to first external network interface<br>Pass "*" for ALL services (linux/win only)<br>Pass "*" for ALL network interfaces |
| si.get(valueObject,cb) | {...} | X | X | X | X | X | get partial system info data at once<br>In valueObject you can define<br>all values, you want to get back <br>(see documentation for details) |
| si.observe(valueObject,interval,cb) | - | X | X | X | X | X | Observe a defined value object<br>call callback on changes<br>polling interval in milliseconds |

### cb: Asynchronous Function Calls (callback)

Remember: all functions (except `version` and `time`) are implemented as asynchronous functions! There are now three ways to consume them:

**Callback Style**

```js
const si = require('systeminformation');

si.cpu(function(data) {
  console.log('CPU Information:');
  console.log('- manufucturer: ' + data.manufacturer);
  console.log('- brand: ' + data.brand);
  console.log('- speed: ' + data.speed);
  console.log('- cores: ' + data.cores);
  console.log('- physical cores: ' + data.physicalCores);
  console.log('...');
})
```

### Promises

**Promises Style** is new in version 3.0.

When omitting callback parameter (cb), then you can use all function in a promise oriented way. All functions (exept of `version` and `time`) are returning a promise, that you can consume:

```js
const si = require('systeminformation');

si.cpu()
  .then(data => {
    console.log('CPU Information:');
    console.log('- manufucturer: ' + data.manufacturer);
    console.log('- brand: ' + data.brand);
    console.log('- speed: ' + data.speed);
    console.log('- cores: ' + data.cores);
    console.log('- physical cores: ' + data.physicalCores);
    console.log('...');
  })
  .catch(error => console.error(error));
```

### Async / Await

**Using async / await** (available since node v7.6)

Since node v7.6 you can also use the `async` / `await` pattern. The above example would then look like this:

```js
const si = require('systeminformation');

async function cpuData() {
  try {
    const data = await si.cpu();
    console.log('CPU Information:');
    console.log('- manufucturer: ' + data.manufacturer);
    console.log('- brand: ' + data.brand);
    console.log('- speed: ' + data.speed);
    console.log('- cores: ' + data.cores);
    console.log('- physical cores: ' + data.physicalCores);
    console.log('...');
  } catch (e) {
    console.log(e)
  }
}
```

## Known Issues

#### macOS - Temperature Sensor

To be able to measure temperature on macOS I created a little additional package. Due to some difficulties
in NPM with `optionalDependencies` I unfortunately was getting unexpected warnings on other platforms.
So I decided to drop this optional dependency for macOS - so by default, you will not get correct values.

But if you need to detect macOS temperature just run the following additional
installation command:

```bash
$ npm install osx-temperature-sensor --save
```

`systeminformation` will then detect this additional library and return the temperature when calling systeminformations standard function `cpuTemperature()`

#### Windows Temperature, Battery, ...

`wmic` - which is used to determine temperature and battery sometimes needs to be run with admin
privileges. So if you do not get any values, try to run it again with according
privileges. If you still do not get any values, your system might not support this feature.
In some cases we also discovered that `wmic` returned incorrect temperature values.

#### Linux Temperature

In some cases you need to install the linux `sensors` package to be able to measure temperature
e.g. on DEBIAN based systems by running `sudo apt-get install lm-sensors`

#### Linux S.M.A.R.T. Status

To be able to detect S.M.A.R.T. status on Linux you need to install `smartmontools`. On DEBIAN based linux distributions you can install it by running `sudo apt-get install smartmontools`

## *: Additional Notes

In `fsStats()`, `disksIO()` and `networkStats()` the results / sec. values (rx_sec, IOPS, ...) are calculated correctly beginning
with the second call of the function. It is determined by calculating the difference of transferred bytes / IOs
divided by the time between two calls of the function.

The first time you are calling one of this functions, you will get `-1` for transfer rates. The second time, you should then get statistics based on the time between the two calls ...

So basically, if you e.g. need a values for network stats every second, your code should look like this:

```js
const si = require('systeminformation');

setInterval(function() {
  si.networkStats().then(data => {
    console.log(data);
  })
}, 1000)
```

Beginning with the second call, you get network transfer values per second.

## Finding new issues

I am happy to discuss any comments and suggestions. Please feel free to contact me if you see any possibility of improvement!


## Comments

If you have ideas or comments, please do not hesitate to contact me.


Happy monitoring!

Sincerely,

Sebastian Hildebrandt, [+innovations](http://www.plus-innovations.com)

## Credits

Written by Sebastian Hildebrandt [sebhildebrandt](https://github.com/sebhildebrandt)

#### Contributers

- Guillaume Legrain [glegrain](https://github.com/glegrain)
- Riccardo Novaglia [richy24](https://github.com/richy24)
- Quentin Busuttil [Buzut](https://github.com/Buzut)
- lapsio [lapsio](https://github.com/lapsio)
- csy [csy](https://github.com/csy1983)
- Tiago Roldão [tiagoroldao](https://github.com/tiagoroldao)
- dragonjet [dragonjet](https://github.com/dragonjet)
- Adam Reis [adamreisnz](https://github.com/adamreisnz)
- Jimi M [ItsJimi](https://github.com/ItsJimi)
- Git² [GitSquared](https://github.com/GitSquared)
- weiyin [weiyin](https://github.com/weiyin)
- Jorai Rijsdijk [Erackron](https://github.com/Erackron)
- Rasmus Porsager [porsager](https://github.com/porsager)
- Nathan Patten [nrpatten](https://github.com/nrpatten)
- Juan Campuzano [juancampuzano](https://github.com/juancampuzano)
- Ricardo Polo [ricardopolo](https://github.com/ricardopolo)
- Miłosz Dźwigała [mily20001]https://github.com/mily20001

OSX Temperature: credits here are going to:

- Frank Stock [pcafstockf](https://github.com/pcafstockf) - for his work on [smc-code][smc-code-url]

## Copyright Information

Linux is a registered trademark of Linus Torvalds. Apple, macOS, OS X are registered trademarks of Apple Inc.,
Windows is a registered trademark of Microsoft Corporation. Node.js is a trademark of Joyent Inc.,
Intel is a trademark of Intel Corporation, AMD is a trademark of Advanced Micro Devices Inc.,
Raspberry Pi is a trademark of the Raspberry Pi Foundation, Debian is a trademark of the Debian Project,
Ubuntu is a trademark of Canonical Ltd., FreeBSD is a registered trademark of The FreeBSD Foundation,
NetBSD is a registered trademark of The NetBSD Foundation, Docker is a trademark of Docker, Inc., Sun,
Solaris, OpenSolaris and registered trademarks of Sun Microsystems.

All other trademarks are the property of their respective owners.

## License [![MIT license][license-img]][license-url]

>The [`MIT`][license-url] License (MIT)
>
>Copyright &copy; 2014-2020 Sebastian Hildebrandt, [+innovations](http://www.plus-innovations.com).
>
>Permission is hereby granted, free of charge, to any person obtaining a copy
>of this software and associated documentation files (the "Software"), to deal
>in the Software without restriction, including without limitation the rights
>to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
>copies of the Software, and to permit persons to whom the Software is
>furnished to do so, subject to the following conditions:
>
>The above copyright notice and this permission notice shall be included in
>all copies or substantial portions of the Software.
>
>THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
>IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
>FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
>AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
>LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
>OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
>THE SOFTWARE.
>
>Further details see [LICENSE](LICENSE) file.


[npm-image]: https://img.shields.io/npm/v/systeminformation.svg?style=flat-square
[npm-url]: https://npmjs.org/package/systeminformation
[downloads-image]: https://img.shields.io/npm/dm/systeminformation.svg?style=flat-square
[downloads-url]: https://npmjs.org/package/systeminformation

[lgtm-badge]: https://img.shields.io/lgtm/grade/javascript/g/sebhildebrandt/systeminformation.svg?style=flat-square
[lgtm-badge-url]: https://lgtm.com/projects/g/sebhildebrandt/systeminformation/context:javascript
[lgtm-alerts]: https://img.shields.io/lgtm/alerts/g/sebhildebrandt/systeminformation.svg?style=flat-square
[lgtm-alerts-url]: https://lgtm.com/projects/g/sebhildebrandt/systeminformation/alerts

[sponsor-badge]: https://img.shields.io/badge/-Buy%20me%20a%20coffee-blue?style=flat-square
[sponsor-url]: https://www.buymeacoffee.com/systeminfo

[license-url]: https://github.com/sebhildebrandt/systeminformation/blob/master/LICENSE
[license-img]: https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square
[npmjs-license]: https://img.shields.io/npm/l/systeminformation.svg?style=flat-square
[changelog-url]: https://github.com/sebhildebrandt/systeminformation/blob/master/CHANGELOG.md
[caretaker-url]: https://github.com/sebhildebrandt
[caretaker-image]: https://img.shields.io/badge/caretaker-sebhildebrandt-blue.svg?style=flat-square

[nodejs-url]: https://nodejs.org/en/
[docker-url]: https://www.docker.com/
[systeminformation-url]: https://systeminformation.io

[daviddm-img]: https://img.shields.io/david/sebhildebrandt/systeminformation.svg?style=flat-square
[daviddm-url]: https://david-dm.org/sebhildebrandt/systeminformation

[issues-img]: https://img.shields.io/github/issues/sebhildebrandt/systeminformation.svg?style=flat-square
[issues-url]: https://github.com/sebhildebrandt/systeminformation/issues
[closed-issues-img]: https://img.shields.io/github/issues-closed-raw/sebhildebrandt/systeminformation.svg?style=flat-square&color=brightgreen
[closed-issues-url]: https://github.com/sebhildebrandt/systeminformation/issues?q=is%3Aissue+is%3Aclosed

[mmon-npm-url]: https://npmjs.org/package/mmon
[mmon-github-url]: https://github.com/sebhildebrandt/mmon

[smc-code-url]: https://github.com/pcafstockf/osx-temperature-sensor
