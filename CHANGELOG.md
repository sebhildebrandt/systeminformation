# Changelog

### Major (breaking) Changes - Version 3

- works only with [node.js][nodejs-url] **v4.0.0** and above (using now internal ES6 promise function, arrow functions, ...)
- **Promises**. As you can see in the documentation, you can now also use it in a promise oriented way. But callbacks are still supported.
- **Async/Await**. Due to the promises support, systeminformation also works perfectly with the `async/await` pattern (available in [node.js][nodejs-url] **v7.6.0** and above). See example in the docs.
- `cpuCurrentspeed`: now returns an object with current minimal, maximal and average CPU frequencies of all cores.
- `mem`: now supports also newer versions of `free` (Version 3.3.10 and above); extended information `avaliable` (potentially available memory)
- `fsStats`: added information sum bytes read + write (tx) and sum transfer rate/sec (tx_sec)
- `networkInterfaces`: now providing one more detail: internal - true if this is an internal interface like "lo"
- `networkConnections`: instead of only counting sockets, you now get an array of objects with connection details for each socket (protocol, local and peer address, state)
- `users`: now provides an array of objects with users online including detailed session information (login date/time, ip address, terminal, command)
- `inetLatency`: now you can provide a host against which you want to test latency (default is 8.8.8.8)
- `getDynamicData`: changed order of parameters (callback - if provided - is now the last one): `getDynamicData(srv, network, callback)`
- `getAllData`: changed order of parameters (callback - if provided - is now the last one): `getAllData(srv, network, callback)`

New Functions

- FreeBSD support: for some basic functions (new in version 3.34 ff)
- `diskLayout`: returns hard disk layout (new in version 3.23)
- `memLayout`: returns memory chip layout (new in version 3.23)
- Windows support: for some basic functions (new in version 3.17 ff)
- `cpuCache`: returns CPU cache (L1, L2, L3) sizes (new in version 3.14)
- `cpuFlags`: returns CPU flags (new in version 3.14)
- `currentLoad.cpus`: returns current load per cpu/core in an array (new in version 3.14)
- `shell`: returns standard shell e.g. /bin/bash (new in version 3.13)
- `blockDevices`: returns array of block devices like disks, partitions, raids, roms (new in version 3.10)
- `dockerContainerProcesses`: returns processes for a specific docker container (new in version 3.8)
- `versions`: returns object of versions - kernel, ssl, node, npm, ...(new in version 3.6)
- `graphics`: returns arrays of graphics controllers and displays (new in version 3.5)
- `networkInterfaceDefault`: returns default network interface (new in version 3.4)
- `processes`: now returns also a process list with all process details (new in version 3.3)
- `battery`: retrieves battery status and charging level (new in version 3.2)
- `dockerContainers`: returns a list of all docker containers (new in version 3.1)
- `dockerContainerStats`: returns statistics for a specific docker container (new in version 3.1)
- `dockerAll`: returns a list of all docker containers including their stats (new in version 3.1)
- `disksIO`: returns overall diskIO and IOPS values for all mounted volumes (new in version 3.0)

Bug Fixes / improvements

- improvement `cpuTemperature` - works now also on Raspberry Pi
- bugfix `disksIO` - on OSX read and write got mixed up
- several bug fixes (like assess errors in `cpuCurrentspeed`, potentially incorrect results in `users`, ...)
- testet on even more platforms and linux distributions

**Be aware**, that the new version 3.x is **NOT fully backward compatible** to version 2.x ...


### Major (breaking) Changes - Version 2

There had been a lot of changes in version 2 of systeminformation! Here is a quick overview (for those who come from version 1):

New Functions

- `version`: returns systeminformation version (semver) of this library
- `system`: hardware info (manufacturer, product/model name, version, serial, uuid)
- `networkConnections`: number of active connections
- `inetLatency`: latency in ms to external resource (internet)
- `getStaticData`: returns on json object with static data at once (OS, CPU, Network Interfaces - they should not change until restarted)
- `getDynamicData`: returns on json object with all dynamic data at once (e.g. for monitoring agents)
- `getAllData`: returns on json object with all data (static and dynamic) at once

Renamed Functions (now all camelCase)

- `osinfo`: renamed to `osInfo`
- `cpu_currentspeed`: renamed to `cpuCurrentspeed`
- `cpu_temperature`: renamed to `cpuTemperature`
- `fs_size`: renamed to `fsSize`
- `fs_speed`: renamed to `fsStats`
- `network_interfaces`: renamed to `networkInterfaces`
- `network_speed`: renamed to `networkStats`
- `network_connections`: renamed to `networkConnections`
- `currentload`: renamed to `currentLoad`
- `fullload`: renamed to `fullLoad`
- `processload`: renamed to `processLoad`
- `checksite`: renamed to `inetChecksite`

Function Changes

- `cpu_temperature`/`cpuTemperature`: -1 is new default (and indicates that non sensors are installed)
- `cpu_temperature`/`cpuTemperature`: new result `max` which returns max temperature of all cores
- `cpu_currentspeed`/`cpuCurrentspeed`: now in GHz
- `cpu`: splitted `manufacturer` (e.g. Intel) and `brand` (e.g. Core 2 Duo)
- `network_speed`/`networkStats`: now better support for OS X (also support for `operstate`)
- `network_speed`/`networkStats`: overall received and transferred bytes (rx, tx)
- `mem`: now better support for OS X (also support for `swaptotal`, `swapused`, `swapfree`)
- `fs_size`/`fsSize`: use-values now in % (0 - 100% instead of 0 - 1)
- `fs_speed`/`fsStats`: now also full support for OS X
- `checksite`/`inetChecksite`: new result structure - see command reference
- `checksite`/`inetChecksite`: ms (former `response_ms`): -1 if not ok

Other changes

- osx-temperature-sensor: now added as an optional dependency
- no more external dependencies: `request` is not longer needed
- where possible results are now integer or float values (instead of strings) because it is easier to calculate with numbers ;-)

## Version history

| Version        | Date           | Comment  |
| -------------- | -------------- | -------- |
| 3.38.0         | 2018-04-06     | added `battery().acconnected` |
| 3.37.12        | 2018-04-05     | another optimization `battery().ischarging` for macOS |
| 3.37.11        | 2018-04-05     | another optimization `battery().ischarging` for macOS |
| 3.37.10        | 2018-04-05     | `battery().ischarging` optimized for macOS |
| 3.37.9         | 2018-04-03     | optimized `processes()`, bugfix `networkInterfaceDefault()` |
| 3.37.8         | 2018-03-25     | optimized `networkDefaultInterface()` detection, fixed network `operstate` MacOS |
| 3.37.7         | 2018-03-13     | celebrating 4th birthday |
| 3.37.6         | 2018-03-12     | updated docs: fixed `diskLayout`and `mamlayout` |
| 3.37.5         | 2018-03-12     | added support for `ip` instead of `ifconfig` |
| 3.37.4         | 2018-02-22     | bugfix windows `processes()`, `disklayout()` |
| 3.37.3         | 2018-02-19     | added windows exec `windowsHide` option |
| 3.37.2         | 2018-02-15     | fixed bug `battery().percent` for macOS |
| 3.37.1         | 2018-02-13     | fixed bug `battery().ischarging` for macOS |
| 3.37.0         | 2018-02-11     | extended FreeBSD support `networkStats()` |
| 3.36.0         | 2018-02-11     | extended FreeBSD support `networkConnections()` |
| 3.35.0         | 2018-02-11     | extended FreeBSD support `processLoad()` |
| 3.34.1         | 2018-02-11     | updated docs |
| 3.34.0         | 2018-02-10     | first partial FreeBSD support |
| 3.33.15        | 2018-01-21     | optimized OSX battery |
| 3.33.14        | 2018-01-17     | bugfix `diskLayout()` (Windows) |
| 3.33.13        | 2018-01-12     | bugfix `memLayout()` (Windows) |
| 3.33.12        | 2017-12-25     | fixed typos |
| 3.33.11        | 2017-12-17     | updated docs |
| 3.33.10        | 2017-12-14     | bugfix WMIC blockDevice parse (Windows 7) |
| 3.33.9         | 2017-12-14     | bugfix WMIC not found (Windows) |
| 3.33.8         | 2017-12-02     | bugfix diskLayout().size (OSX) |
| 3.33.7         | 2017-11-28     | bugfix diskLayout().size |
| 3.33.6         | 2017-11-16     | bugfix diskLayout().size |
| 3.33.5         | 2017-11-09     | code cleanup |
| 3.33.4         | 2017-11-09     | bugfix graphics controller win (bytes) |
| 3.33.3         | 2017-11-08     | bugfix cpu speed arm - type |
| 3.33.2         | 2017-11-08     | bugfix cpu speed arm |
| 3.33.1         | 2017-11-07     | improved bios and main board information |
| 3.33.0         | 2017-11-07     | added bios and main board information |
| 3.32.4         | 2017-11-02     | AMD cpu base frequencies table also for windows |
| 3.32.3         | 2017-11-02     | code cleanup, AMD cpu base frequencies table |
| 3.32.2         | 2017-11-01     | bugfix JSON.parse error `blockDevices()` |
| 3.32.1         | 2017-10-23     | updated docs |
| 3.32.0         | 2017-10-23     | extended `memLayout()` - added manufacturer |
| 3.31.4         | 2017-10-21     | updated `README.md` |
| 3.31.3         | 2017-10-21     | bugfix `graphics()`, fixed typo `README.md` |
| 3.31.2         | 2017-10-16     | bugfix `graphics()` vendor and model parsing linux VGA/3D |
| 3.31.1         | 2017-10-16     | bugfix `graphics()` vendor and model parsing linux |
| 3.31.0         | 2017-10-15     | extended windows support `cpuFlags()` (partially) |
| 3.30.6         | 2017-10-05     | updated community profile |
| 3.30.5         | 2017-10-05     | bugfix `users()` - parsing values on windows |
| 3.30.4         | 2017-10-03     | bugfix `cpuTemperature()` - parsing values on windows |
| 3.30.3         | 2017-10-03     | bugfix `cpuTemperature()` - max value on windows |
| 3.30.2         | 2017-09-26     | bugfix `networkInterfaces()` - optimized ip6 address selection |
| 3.30.1         | 2017-09-21     | bugfix/typo `inetChecksite()` |
| 3.30.0         | 2017-09-21     | extended `versions()` (added `yarn`, `gulp`, `grunt`, `tsc`, `git`) |
| 3.29.0         | 2017-09-15     | extended windows support `services()`, optimized `diskLayout()` (OSX), bugfixes |
| 3.28.0         | 2017-09-14     | extended windows support `processes()` |
| 3.27.1         | 2017-09-13     | updated Raspberry version detection `system()` (Pi 3, Zero) |
| 3.27.0         | 2017-09-12     | added raw data to `currentLoad()`, fixed `networkInterfaces()` MAC problem node 8.x |
| 3.26.2         | 2017-09-01     | removed redundant code |
| 3.26.1         | 2017-08-23     | fixed `cpu().speed` windows / AMD, updated docs |
| 3.26.0         | 2017-08-21     | extended `getDynamicData()` (windows), updated docs |
| 3.25.1         | 2017-08-07     | updated docs  |
| 3.25.0         | 2017-08-07     | improved windows support `networkStats()`, `cpuCache()`, bug fix `getStaticData()` |
| 3.24.0         | 2017-08-05     | extended windows support `networkStats()`, `networkConnections()` |
| 3.23.7         | 2017-07-11     | bug fix `diskLayout()` |
| 3.23.6         | 2017-07-11     | added `cpuFlags()` to `getStaticData()`, bug fix `graphics()` (Win) |
| 3.23.5         | 2017-06-29     | bug fix `inetChecksite()` |
| 3.23.4         | 2017-06-24     | bug fix `getDynamicData(), getAllData() - mem` |
| 3.23.3         | 2017-06-23     | updated docs |
| 3.23.2         | 2017-06-23     | bug fix `battery` (windows) |
| 3.23.1         | 2017-06-22     | updated docs |
| 3.23.0         | 2017-06-22     | added `memLayout`, `diskLayout`, extended windows support (`inetChecksite`)|
| 3.22.0         | 2017-06-19     | extended windows support (`users`, `inetLatency`) |
| 3.21.0         | 2017-06-18     | extended time (timezone), extended windows support (battery, getAll...) |
| 3.20.1         | 2017-06-17     | updated docs |
| 3.20.0         | 2017-06-16     | extend WIN support (cpu, cpuCache, cpuCurrentspeed, mem, networkInterfaces, docker) |
| 3.19.0         | 2017-06-12     | OSX temperature now an optional dependency  |
| 3.18.0         | 2017-05-27     | extended `cpu` info (vendor, family, model, stepping, revision, cache, speedmin/max) |
| 3.17.3         | 2017-04-29     | minor fix (blockDevices data array, Windows) |
| 3.17.2         | 2017-04-24     | minor fix (removed console.log) |
| 3.17.1         | 2017-04-23     | fixed bugs fsSize(win), si.processes (command), si.osinfo(win) |
| 3.17.0         | 2017-02-19     | windows support for some first functions, extended process list (linux)|
| 3.16.0         | 2017-01-19     | blockDevices: added removable attribute + fix |
| 3.15.1         | 2017-01-17     | minor cpuTemperature fix (OSX) |
| 3.15.0         | 2017-01-15     | added cpuTemperature also for OSX |
| 3.14.0         | 2017-01-14     | added currentLoad per cpu/core, cpu cache and cpu flags |
| 3.13.0         | 2016-11-23     | added shell (returns standard shell) |
| 3.12.0         | 2016-11-17     | refactoring and extended currentLoad |
| 3.11.2         | 2016-11-16     | blockDevices: improved for older lsblk versions |
| 3.11.1         | 2016-11-16     | fixed small bug in blockDevices |
| 3.11.0         | 2016-11-15     | blockDevices for OSX and extended blockDevices |
| 3.10.2         | 2016-11-14     | bug fix fsSize on OSX |
| 3.10.1         | 2016-11-14     | optimization fsStats, disksIO, networkStats |
| 3.10.0         | 2016-11-12     | added blockDevices, fixed fsSize, added file system type |
| 3.9.0          | 2016-11-11     | added MAC address to networkInterfaces, fixed currentLoad |
| 3.8.1          | 2016-11-04     | updated docs |
| 3.8.0          | 2016-11-04     | added dockerContainerProcesses |
| 3.7.1          | 2016-11-03     | code refactoring |
| 3.7.0          | 2016-11-02     | extended docker stats, and no longer relying on curl |
| 3.6.0          | 2016-09-14     | added versions (kernel, ssl, node, npm, pm2, ...) |
| 3.5.1          | 2016-09-14     | bugfix graphics info |
| 3.5.0          | 2016-09-14     | added graphics info (controller, display) |
| 3.4.4          | 2016-09-02     | tiny fixes system.model, getDefaultNetworkInterface |
| 3.4.3          | 2016-09-02     | tiny bug fix fsStats, disksIO OSX |
| 3.4.2          | 2016-09-01     | improved default network interface |
| 3.4.1          | 2016-08-30     | updated docs |
| 3.4.0          | 2016-08-30     | rewritten processes current cpu usage |
| 3.3.0          | 2016-08-24     | process list added to processes |
| 3.2.1          | 2016-08-19     | updated docs, improvement system |
| 3.2.0          | 2016-08-19     | added battery information |
| 3.1.1          | 2016-08-18     | improved system and os detection (vm, ...), bugfix disksIO |
| 3.1.0          | 2016-08-18     | added Docker stats |
| 3.0.1          | 2016-08-17     | Bug-Fix disksIO, users, updated docs |
| 3.0.0          | 2016-08-03     | new major version 3.0 |
| 2.0.5          | 2016-03-02     | changed .gitignore |
| 2.0.4          | 2016-02-22     | tiny correction - removed double quotes CPU brand, ... |
| 2.0.3          | 2016-02-22     | optimized cpuCurrentspeed |
| 2.0.2          | 2016-02-22     | added CoreOS identification |
| 2.0.1          | 2016-01-07     | minor patch |
| 2.0.0          | 2016-01-07     | new major version 2.0 |
| 1.0.7          | 2015-11-27     | fixed: si.network_speed() |
| 1.0.6          | 2015-09-17     | fixed: si.users() |
| 1.0.5          | 2015-09-14     | updated dependencies |
| 1.0.4          | 2015-07-18     | updated docs |
| 1.0.3          | 2015-07-18     | bugfix cpu cores |
| 1.0.2          | 2015-07-18     | bugfix cpu_currentspeed, cpu_temperature |
| 1.0.1          | 2015-07-18     | documentation update |
| 1.0.0          | 2015-07-18     | bug-fixes, version bump, published as npm component |
| 0.0.3          | 2014-04-14     | bug-fix (cpu_speed) |
| 0.0.2          | 2014-03-14     | Optimization FS-Speed & CPU current speed |
| 0.0.1          | 2014-03-13     | initial release |

[nodejs-url]: https://nodejs.org/en/
