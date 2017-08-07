# systeminformation

Simple system and OS information library for [node.js][nodejs-url]

  [![NPM Version][npm-image]][npm-url]
  [![NPM Downloads][downloads-image]][downloads-url]
  [![Git Issues][issues-img]][issues-url]
  [![deps status][daviddm-img]][daviddm-url]
  [![MIT license][license-img]][license-url]

## Quick Start

Collection of 35+ functions to retrieve detailed hardware, system and OS information (Linux, OSX and partial Windows support)

### Installation

```bash
$ npm install systeminformation --save
```

### Usage

All functions (except `version` and `time`) are implemented as asynchronous functions. Here a small example how to use them:

```
const si = require('systeminformation');

// callback style
si.cpu(function(data) {
	console.log('CPU-Information:');
	console.log(data);
})

// promises style - new in version 3
si.cpu()
	.then(data => console.log(data))
	.catch(error => console.error(error));

```

## News and Changes

### Latest Activity
- Version 3.25.0: improved windows support `networkStats()`, `cpuCache()`, bug fix `getStaticData()`
- Version 3.24.0: extended windows support `networkStats()`, `networkConnections()`
- Version 3.23.0: added `memLayout`, `diskLayout`, extended windows support (`inetChecksite`)
- Version 3.22.0: extended windows support (`users`, `inetLatency`)
- Version 3.21.0: extended `time` (timezone), extended windows support (`battery`, `getAll...`)
- Version 3.20.0: added additional windows support (`cpu`, `cpuCache`, `cpuCurrentspeed`, `mem`, `networkInterfaces`, `docker`)
- Version 3.19.0: OSX temperature now an optional dependency (see comments below in reference!)
- Version 3.18.0: extended `cpu` info (vendor, family, model, stepping, revision, cache, speedmin, speedmax)
- Version 3.17.0: windows support for some very first functions (work in progress)
- Version 3.16.0: `blockDevices`: added removable attribute
- Version 3.15.0: added `cpuTemperature` also for OSX
- Version 3.14.0: added `currentLoad` per cpu/core, `cpuCache` (L1, L2, L3) and cpu flags
- Version 3.13.0: added `shell` (returns standard shell)
- Version 3.12.0: refactoring and extended `currentLoad` (better OSX coverage and added irq load).
- Version 3.11.0: `blockDevices` now also for OSX and also extended (+ label, model, serial, protocol).
- Version 3.10.0: added `blockDevices` (list of disks, partitions, raids and roms).
- Version 3.9.0: extended `networkInterfaces` (added MAC address).
- Version 3.8.0: added `dockerContainerProcesses` (array of processes inside a docker container).
- Version 3.7.0: extended `dockerContainerStats`.
- Version 3.6.0: added `versions` (kernel, ssl, node, npm, pm2, ...).
- Version 3.5.0: added `graphics` info (controller and display).
- Version 3.4.0: rewritten `currentLoad` and CPU load for processes (linux). This is now much more accurate.
- Version 3.3.0: added `processes.list`. Get full process list including details like cpu and mem usage, status, command, ...
- Version 3.2.0: added `battery` support. If a battery is installed, you get information about status and current capacity level
- Version 3.1.0: added [Docker][docker-url] support. Now you can scan your docker containers and get their stats
- Version 3.0.0: added `disksIO` - overall diskIO and IOPS values for all mounted volumes

### Changelog

You can find all changes here: [detailed changelog][changelog-url]

## Core concept

[Node.js][nodejs-url] comes with some basic OS information, but I always wanted a little more. So I came up to write this
little library. This library is still work in progress. Version 3 comes with further improvements. First it
requires now node.js version 4.0 and above. Another big change is, that all functions now return promises. You can use them
like before with callbacks OR with promises (see example in this documentation). I am sure, there is for sure room for improvement.
I was only able to test it on several Debian, Raspbian, Ubuntu distributions as well as OS X (Mavericks, Yosemite, El Captain) and some Windows machines.
Since version 2 nearly all functionality is available for OS X/Darwin platforms. In Version 3 I started to add (limited!) windows support.

If you have comments, suggestions & reports, please feel free to contact me!

I also created a nice little command line tool called [mmon][mmon-github-url]  (micro-monitor) for Linux and OSX, also available via [github][mmon-github-url] and [npm][mmon-npm-url]


## Reference

### Function Reference and OS Support

#### 1. General

| Function        | Result object | Linux | OSX | Win | Comments |
| --------------- | ----- | ----- | ---- | ------- | -------- |
| si.version() | : string | X | X | X | lib version (no callback/promise) |
| si.time() | {...} | X | X | X | (no callback/promise) |
| | current | X | X | X | local time |
| | uptime | X | X | X | uptime |
| | timezone | X | X | X | e.g. GMT+0200 |
| | timezoneName | X | X | X | e.g. CEST |

#### 2. System (HW)

| Function        | Result object | Linux | OSX | Win | Comments |
| --------------- | ----- | ----- | ---- | ------- | -------- |
| si.system(cb) | {...} | X | X | X | hardware information |
| | manufacturer | X | X | X | e.g. 'MSI' |
| | model | X | X | X | model/product e.g. 'MS-7823' |
| | version | X | X | X | version e.g. '1.0' |
| | serial | X | X | X | serial number |
| | uuid | X | X | X | UUID |

#### 3. CPU, Memory, Disks, Battery, Graphics 

| Function        | Result object | Linux | OSX | Win | Comments |
| --------------- | ----- | ----- | ---- | ------- | -------- |
| si.cpu(cb) | {...} | X | X | X | CPU information|
| | manufacturer | X | X | X | e.g. 'Intel(R)' |
| | brand | X | X | X | e.g. 'Core(TM)2 Duo' |
| | speed | X | X | X | in GHz e.g. '3.40' |
| | speedmin | X | X | X | in GHz e.g. '0.80' |
| | speedmax | X | X | X | in GHz e.g. '3.90' |
| | cores | X | X | X | # cores |
| | vendor | X | X | X | Vendow ID |
| | family | X | X | X | Processor Family |
| | Model | X | X | X | Processor Model |
| | stepping | X | X | X | Processor Stepping |
| | revision | X | X | X | Revision |
| | cache | X | X | X | cache in bytes (object) |
| | cache.l1d | X | X | X | L1D (data) size |
| | cache.l1i | X | X | X | L1I (instruction) size |
| | cache.l2 | X | X | X | L2 size |
| | cache.l3 | X | X | X | L3 size |
| si.cpuFlags(cb) | : string | X | X |  | CPU flags|
| si.cpuCache(cb) | {...} | X | X | X | CPU cache sizes |
| | l1d | X | X | X | L1D size |
| | l1i | X | X | X | L1I size |
| | l2 | X | X | X | L2 size |
| | l3 | X | X | X | L3 size |
| si.cpuCurrentspeed(cb) | {...} | X | X | X | current CPU speed (in GHz)|
| | avg | X | X | X | avg CPU speed (all cores) |
| | min | X | X | X | min CPU speed (all cores) |
| | max | X | X | X | max CPU speed (all cores) |
| si.cpuTemperature(cb) | {...} | X | X* | X | CPU temperature (if supported) |
| | main | X | X | X | main temperature |
| | cores | X | X | X | array of temperatures |
| | max | X | X | X | max temperature |
| si.mem(cb) | {...} | X | X | X | Memory information (in bytes)|
| | total | X | X | X | total memory in bytes |
| | free | X | X | X | not used in bytes |
| | used | X | X | X | used (incl. buffers/cache) |
| | active | X | X | X | used actively (excl. buffers/cache)  |
| | buffcache | X | X |  | used by buffers+cache |
| | available | X | X | X | potentially available (total - active) |
| | swaptotal | X | X | X |  |
| | swapused | X | X | X |  |
| | swapfree | X | X | X |  |
| si.memLayout(cb) | {...} | X | X | X | Memory Layout |
| | size | X | X | X | size in bytes |
| | bank | X |   | X | memory bank |
| | type | X | X | X | memory type |
| | clockSpeed | X | X | X | clock speed |
| | formFactor | X |   | X | form factor |
| | partNum |   | X | X | part number |
| | serialNum | X | X | X | serial number |
| | voltageConfigured | X |   | X | voltage conf. |
| | voltageMin | X |   | X | voltage min |
| | voltageMax | X |   | X | voltage max |
| si.diskLayout(cb) | {...} | X | X | X | Physical Disk Layout (HD) |
| | type | X | X | X | HD, SSD |
| | name | X | X | X | Disk Name |
| | vendor | X | | X | vendor/producer |
| | firmwareRevision | X | X | X | firmware revision |
| | serialNum | X | X | X | serial number |
| | interfaceType | | | X |  |
| | size | X | X | X | size in bytes |
| | totalCylinders | | | X | total cylinders |
| | totalHeads | | | X | total heads |
| | totalTracks | | | X | total tracks |
| | tracksPerCylinder | | | X | tracks per cylinder |
| | sectorsPerTrack | | | X | sectors per track |
| | totalSectors | | | X | total sectors |
| | bytesPerSector | | | X | bytes per sector |
| si.battery(cb) | {...} | X | X | X | battery information |
| | hasbattery | X | X | X | indicates presence of battery |
| | cyclecount | X | X | | numbers of recharges |
| | ischarging | X | X | X | indicates if battery is charging |
| | maxcapacity | X | X | X | max capacity of battery |
| | currentcapacity | X | X | X | current capacity of battery |
| | percent | X | X | X | charging level in percent |
| si.graphics(cb) | {...} | X | X |  | arrays of graphics controllers and displays |
| | controllers[0].model | X | X | X | graphics controller model |
| | controllers[0].vendor | X | X | X | e.g. ATI |
| | controllers[0].bus | X | X | X| on which bus (e.g. PCIe) |
| | controllers[0].vram | X | X | X | VRAM size (in MB) |
| | controllers[0].vramDynamic | X | X | X | true if dynamicly allocated ram |
| | displays[0].model | X | X | X | Monitor/Display Model |
| | displays[0].main | X | X |  | true if main monitor |
| | displays[0].builtin | X | X |  | true if built in monitor |
| | displays[0].connection | X | X |  | e.g. DisplayPort or HDMI |
| | displays[0].resolutionx | X | X | X | pixel horizontal |
| | displays[0].resolutiony | X | X | X | pixel vertical |
| | displays[0].pixeldepth | X | X | X | color depth in bits |
| | displays[0].sizex | X | X |  | size in mm horizontal |
| | displays[0].sizey | X | X |  | size in mm vertical |

#### 4. Operating System

| Function        | Result object | Linux | OSX | Win | Comments |
| --------------- | ----- | ----- | ---- | ------- | -------- |
| si.osInfo(cb) | {...} | X | X | X | OS information |
| | platform   | X | X | X | 'Linux', 'Darwin', 'Windows' |
| | distro | X | X | X |  |
| | release | X | X | X |  |
| | codename | | X |  |  |
| | kernel | X | X | X | kernel release - same as os.release() |
| | arch | X | X | X | same as os.arch() |
| | hostname | X | X | X | same as os.hostname() |
| | logofile | X | X | X | e.g. 'apple', 'debian', 'fedora', ... |
| si.versions(cb) | {...} | X | X | X | Version information (kernel, ssl, node, ...) |
| si.shell(cb) | : string | X | X |  | standard shell |
| si.users(cb) | [{...}] | X | X | X | array of users online |
| | [0].user | X | X | X | user name |
| | [0].tty | X | X | X | terminal |
| | [0].date | X | X | X | login date |
| | [0].time | X | X | X | login time |
| | [0].ip | X | X |  | ip address (remote login) |
| | [0].command | X | X |  | last command or shell |

#### 5. File System

| Function        | Result object | Linux | OSX | Win | Comments |
| --------------- | ----- | ----- | ---- | ------- | -------- |
| si.fsSize(cb) | [{...}] | X | X | X | returns array of mounted file systems |
| | [0].fs | X | X | X | name of file system |
| | [0].type | X | X | X | type of file system |
| | [0].size | X | X | X | sizes in Bytes |
| | [0].used | X | X | X | used in Bytes |
| | [0].use | X | X | X | used in % |
| | [0].mount | X | X | X | mount point |
| si.blockDevices(cb) | [{...}] | X | X | X | returns array of disks, partitions,<br>raids and roms |
| | [0].name | X | X | X | name |
| | [0].type | X | X | X | type |
| | [0].fstype | X | X | X | file system type (e.g. ext4) |
| | [0].mount | X | X | X | mount point |
| | [0].size | X | X | X | size in bytes |
| | [0].physical | X | X | X | physical type (HDD, SSD, CD/DVD) |
| | [0].uuid | X | X | X | UUID |
| | [0].label | X | X | X | label |
| | [0].model | X | X |  | model |
| | [0].serial | X |  | X | serial |
| | [0].removable | X | X | X | serial |
| | [0].protocol | X | X |  | protocol (SATA, PCI-Express, ...) |
| si.fsStats(cb) | {...} | X | X |  | current transfer stats |
| | rx | X | X |  | bytes read since startup |
| | wx | X | X |  | bytes written since startup |
| | tx | X | X |  | total bytes read + written since startup |
| | rx_sec | X | X |  | bytes read / second (* see notes) |
| | wx_sec | X | X |  | bytes written / second (* see notes) |
| | tx_sec | X | X |  | total bytes reads + written / second  |
| | ms | X | X |  | interval length (for per second values) |
| si.disksIO(cb) | {...} | X | X |  | current transfer stats |
| | rIO | X | X |  | read IOs on all mounted drives |
| | wIO | X | X |  | write IOs on all mounted drives |
| | tIO | X | X |  | write IOs on all mounted drives |
| | rIO_sec | X | X |  | read IO per sec (* see notes) |
| | wIO_sec | X | X |  | write IO per sec (* see notes) |
| | tIO_sec | X | X |  | total IO per sec (* see notes) |
| | ms | X | X |  | interval length (for per second values) |

#### 6. Network related functions

| Function        | Result object | Linux | OSX | Win | Comments |
| --------------- | ----- | ----- | ---- | ------- | -------- |
| si.networkInterfaces(cb) | [{...}] | X | X | X | array of network interfaces |
| | [0].iface | X | X | X | interface name |
| | [0].ip4 | X | X | X | ip4 address |
| | [0].ip6 | X | X | X | ip6 address |
| | [0].mac | X | X | X | MAC address |
| | [0].internal | X | X | X | true if internal interface |
| si.networkInterfaceDefault(cb) | : string | X | X | X | get name of default network interface |
| si.networkStats(iface,cb) | {...} | X | X | X | current network stats of given interface<br>iface parameter is optional<br>defaults to first external network interface|
| | iface | X | X | X | interface |
| | operstate | X | X | X | up / down |
| | rx | X | X | X | received bytes overall |
| | tx | X | X | X | transferred bytes overall|
| | rx_sec | X | X | X | received bytes / second (* see notes) |
| | tx_sec | X | X | X | transferred bytes per second (* see notes) |
| | ms | X | X | X | interval length (for per second values) |
| si.networkConnections(cb) | [{...}] | X | X | X | current network network connections<br>returns an array of all connections|
| | [0].protocol | X | X | X | tcp or udp |
| | [0].localaddress | X | X | X | local address |
| | [0].localport | X | X | X | local port |
| | [0].peeraddress | X | X | X | peer address |
| | [0].peerport | X | X | X | peer port |
| | [0].state | X | X | X | like ESTABLISHED, TIME_WAIT, ... |
| si.inetChecksite(url, cb) | {...} | X | X | X | response-time (ms) to fetch given URL |
| | url | X | X | X | given url |
| | ok | X | X | X | status code OK (2xx, 3xx) |
| | status | X | X | X | status code |
| | ms | X | X | X | response time in ms |
| si.inetLatency(host, cb) | : number | X | X | X | response-time (ms) to external resource<br>host parameter is optional (default 8.8.8.8)|

#### 7. Current Load, Processes & Services 

| Function        | Result object | Linux | OSX | Win | Comments |
| --------------- | ----- | ----- | ---- | ------- | -------- |
| si.currentLoad(cb) | {...} | X | X |  | CPU-Load |
| | avgload | X | X |  | average load  |
| | currentload | X | X |  | CPU-Load in % |
| | currentload_user | X | X |  | CPU-Load User in % |
| | currentload_nice | X | X |  | CPU-Load Nice in % |
| | currentload_system | X | X |  | CPU-Load System in % |
| | currentload_irq | X | X |  | CPU-Load System in % |
| | cpus[] | X | X |  | current loads per CPU in % |
| si.fullLoad(cb) | : integer | X | X |  | CPU-full load since bootup in % |
| si.processes(cb) | {...} | X | X |  | # running processes |
| | all | X | X |  | # of all processes |
| | running | X | X |  | # of all processes running |
| | blocked | X | X |  | # of all processes blocked |
| | sleeping | X | X |  | # of all processes sleeping |
| | list[] | X | X |  | list of all processes incl. details |
| | ...[0].pid | X | X |  | process PID |
| | ...[0].pcpu | X | X |  | process % CPU usage |
| | ...[0].pcpuu | X |  |  | process % CPU usage (user) |
| | ...[0].pcpus | X |  |  | process % CPU usage (system) |
| | ...[0].pmem | X | X |  | process memory % |
| | ...[0].priority | X | X |  | process priotity |
| | ...[0].mem_vsz | X | X |  | process virtual memory size |
| | ...[0].mem_rss | X | X |  | process mem resident set size |
| | ...[0].nice | X | X |  | process nice value |
| | ...[0].started | X | X |  | process start time |
| | ...[0].state | X | X |  | process state (e.g. sleeping) |
| | ...[0].tty | X | X |  | tty from which process was started |
| | ...[0].user | X | X |  | user who started process |
| | ...[0].command | X | X |  | process starting command |
| si.processLoad('apache2',cb) | {...} | X | X |  | detailed information about given process |
| | proc | X | X |  | process name |
| | pid | X | X |  | PID |
| | cpu | X | X |  | process % CPU |
| | mem | X | X |  | process % MEM |
| si.services('mysql, apache2', cb) | [{...}] | X | X |  | pass comma separated string of services |
| | [0].name | X | X |  | name of service |
| | [0].running | X | X |  | true / false |
| | [0].pcpu | X | X |  | process % CPU |
| | [0].pmem | X | X |  | process % MEM |

#### 8. Docker 

| Function        | Result object | Linux | OSX | Win | Comments |
| --------------- | ----- | ----- | ---- | ------- | -------- |
| si.dockerContainers(all, cb) | [{...}] | X | X | X | returns array of active/all docker containers |
| | [0].id | X | X | X | ID of container |
| | [0].name | X | X | X | name of container |
| | [0].image | X | X | X | name of image |
| | [0].imageID | X | X | X | ID of image |
| | [0].command | X | X | X | command |
| | [0].created | X | X | X | creation time |
| | [0].state | X | X | X | created, running, exited |
| | [0].ports | X | X | X | array of ports |
| | [0].mounts | X | X | X | array of mounts |
| si.dockerContainerStats(id, cb) | {...} | X | X | X | statistics for a specific container |
| | id | X | X | X | Container ID |
| | mem_usage | X | X | X | memory usage in bytes |
| | mem_limit | X | X | X | memory limit (max mem) in bytes |
| | mem_percent | X | X | X | memory usage in percent |
| | cpu_percent | X | X | X | cpu usage in percent |
| | pids | X | X | X | number of processes |
| | netIO.rx | X | X | X | received bytes via network |
| | netIO.wx | X | X | X | sent bytes via network |
| | blockIO.r | X | X | X | bytes read from BlockIO |
| | blockIO.w | X | X | X | bytes written to BlockIO |
| | cpu_stats | X | X | X | detailed cpu stats |
| | percpu_stats | X | X | X | detailed per cpu stats |
| | memory_stats | X | X | X | detailed memory stats |
| | networks | X | X | X | detailed network stats per interface |
| si.dockerContainerProcesses(id, cb) | [{...}] | X | X | X | array of processes inside a container |
| | [0].pid_host | X | X | X | process ID (host) |
| | [0].ppid | X | X | X | parent process ID |
| | [0].pgid | X | X | X | process group ID |
| | [0].user | X | X | X | effective user name |
| | [0].ruser | X | X | X | real user name |
| | [0].group | X | X | X | effective group name |
| | [0].rgroup | X | X | X | real group name |
| | [0].stat | X | X | X | process state |
| | [0].time | X | X | X | accumulated CPU time |
| | [0].elapsed | X | X | X | elapsed running time |
| | [0].nice | X | X | X | nice value |
| | [0].rss | X | X | X | resident set size |
| | [0].vsz | X | X | X | virtual size in Kbytes |
| | [0].command | X | X | X | command and arguments |
| si.dockerAll(cb) | {...} | X | X | X | list of all containers including their stats<br>and processes in one single array |

#### 9. "Get All at once" - functions

| Function        | Result object | Linux | OSX | Win | Comments |
| --------------- | ----- | ----- | ---- | ------- | -------- |
| si.getStaticData(cb) | {...} | X | X | X | all static data at once |
| si.getDynamicData(srv,iface,cb) | {...} | X | X | X | all dynamic data at once |
| si.getAllData(srv,iface,cb) | {...} | X | X | X | all data at once |

### cb: Asynchronous Function Calls (callback)

Remember: all functions (except `version` and `time`) are implemented as asynchronous functions! There are now two ways to consume them:

**Callback Style**

```
var si = require('systeminformation');

si.networkStats('eth1', function(data) {
	console.log('Network Interface Stats (eth1):');
	console.log('- is up: ' + data.operstate);
	console.log('- RX bytes overall: ' + data.rx);
	console.log('- TX bytes overall: ' + data.tx);
	console.log('- RX bytes/sec: ' + data.rx_sec);
	console.log('- TX bytes/sec: ' + data.tx_sec);
})
```

### Promises

**Promises Style** is new in version 3.0.

When omitting callback parameter (cb), then you can use all function in a promise oriented way. All functions (exept of `version` and `time`) are returning a promis, that you can consume:

```
si.networkStats('eth1')
	.then(data => {
		console.log('Network Interface Stats (eth1):');
		console.log('- is up: ' + data.operstate);
		console.log('- RX bytes overall: ' + data.rx);
		console.log('- TX bytes overall: ' + data.tx);
		console.log('- RX bytes/sec: ' + data.rx_sec);
		console.log('- TX bytes/sec: ' + data.tx_sec);
	})
	.catch(error => console.error(error));

```
## Known Issues

#### OSX - Temperature Sensor 
 
To be able to measure temperature on OSX I created a litte additional package. Due to some difficulties 
in NPM with `optionalDependencies`  I unfortunately was getting unexpected warnings on other platforms. 
So I decided to drop this optional dependencies for OSX - so by default, you will not get correct values. 

But if you need to detect OSX temperature just run the following additional 
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

#### *: Additional Notes

In `fsStats`, `disksIO` and `networkStats` the results per second values (rx_sec, IOPS, ...) are calculated beginning
with the second call of the function. It is determined by calculating the difference of transferred bytes / IOs
divided by the time between two calls of the function.

#### Finding new issues

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

OSX Temperature: Credits here are going to:
 
- Massimiliano Marcon [mmarcon](https://github.com/mmarcon) for his work on [smc-code][smc-code-url]
- Sébastien Lavoie [lavoiesl](https://github.com/lavoiesl) for his work on [osx-cpu-temp][osx-cpu-temp-url] code.

## Copyright Information

Linux is a registered trademark of Linus Torvalds, OS X is a registered trademark of Apple Inc.,
Windows is a registered trademark of Microsoft Corporation. Node.js is a trademark of Joyent Inc.,
Intel is a trademark of Intel Corporation, Raspberry Pi is a trademark of the Raspberry Pi Foundation,
Debian is a trademark of the Debian Project, Ubuntu is a trademark of Canonical Ltd., Docker is a trademark of Docker, Inc.
All other trademarks are the property of their respective owners.

## License [![MIT license][license-img]][license-url]

>The [`MIT`][license-url] License (MIT)
>
>Copyright &copy; 2014-2017 Sebastian Hildebrandt, [+innovations](http://www.plus-innovations.com).
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

[license-url]: https://github.com/sebhildebrandt/systeminformation/blob/master/LICENSE
[license-img]: https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square
[npmjs-license]: https://img.shields.io/npm/l/systeminformation.svg?style=flat-square
[changelog-url]: https://github.com/sebhildebrandt/systeminformation/blob/master/CHANGELOG.md

[nodejs-url]: https://nodejs.org/en/
[docker-url]: https://www.docker.com/

[daviddm-img]: https://img.shields.io/david/sebhildebrandt/systeminformation.svg?style=flat-square
[daviddm-url]: https://david-dm.org/sebhildebrandt/systeminformation

[issues-img]: https://img.shields.io/github/issues/sebhildebrandt/systeminformation.svg?style=flat-square
[issues-url]: https://github.com/sebhildebrandt/systeminformation/issues

[mmon-npm-url]: https://npmjs.org/package/mmon
[mmon-github-url]: https://github.com/sebhildebrandt/mmon

[smc-code-url]: https://github.com/mmarcon/node-smc
[osx-cpu-temp-url]: https://github.com/lavoiesl/osx-cpu-temp
