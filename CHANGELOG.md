# Changelog

### Major Changes - Version 4

**New Functions**

- `chassis()`: chassis information

**Breaking Changes**

- `networkStats()`: will provide an **array** of stats for all given interfaces. In previous versions only one interface was provided as a parameter. Pass '*' for all interfaces
- `networkStats()`: `rx` and `tx` changed to `rx_bytes` and `tx_bytes`
- `dockerContainerStats()`: will provide an **array** of stats for all given docker containers. In previous versions only one interface was provided as a parameter. Pass '*' for all docker containers

**Other Changes**

- `system()` optimized system detection (e.g. new Raspberry Pi models, ...)
- `system()`, `bios()`, `baseboard()` information also as non-root (linux)
- `graphics()` better controller and display detection, fixes
- `versions()` optimization, fixes
- `networkInterfaces()` added `operstate`, `type`, `duplex`, `mtu`, `speed`, `carrierChanges`
- `networkStats()` added stats for `errors`, `dropped`
- added TypeScript definitions

**Be aware**, that the new version 4.x is **NOT fully backward compatible** to version 3.x ...

For major (breaking) changes - version 3 and 2 see end of page.

## Version history

| Version        | Date           | Comment  |
| -------------- | -------------- | -------- |
| 4.30.0         | 2020-11-12     | `get()` possibility to provide params |
| 4.29.3         | 2020-11-09     | `blockdevices()` catch errors adapted for just one line |
| 4.29.2         | 2020-11-09     | `blockdevices()` catch errors |
| 4.29.1         | 2020-11-08     | `cpu()`, `system()` better parsing Raspberry Pi revision codes |
| 4.29.0         | 2020-11-08     | `fsSize()` correct fs type detection macOS (HFS, APFS, NFS) |
| 4.28.1         | 2020-11-05     | code cleanup, removing debug console.log() |
| 4.28.0         | 2020-11-04     | `graphics()` added deviceName (windows) |
| 4.27.11        | 2020-10-26     | `inetChecksite()` fixed vulnerability: command injection |
| 4.27.10        | 2020-10-16     | `dockerContainers()` resolved hanging issue |
| 4.27.9         | 2020-10-13     | `networkInterfaces()` loopback internal detection (windows) |
| 4.27.8         | 2020-10-08     | windows codepages partial fix |
| 4.27.7         | 2020-10-05     | updated typescript typings, minor fixes |
| 4.27.6         | 2020-10-02     | `get()` fixed when results are in arrays |
| 4.27.5         | 2020-09-18     | `cpuTemperature()` fix try catch (linux) |
| 4.27.4         | 2020-09-16     | `networkInterfaceDefault()` optimization (macOS) |
| 4.27.3         | 2020-08-26     | updated typescript typings |
| 4.27.2         | 2020-08-26     | fixed issue breaking node v4 compatibility |
| 4.27.1         | 2020-08-25     | `networkStats()` fixed packages dropped (linux) |
| 4.27.0         | 2020-08-24     | `observe()` added function to observe/watch system parameters |
| 4.26.12        | 2020-08-21     | `versions()` fixed issue windows |
| 4.26.11        | 2020-08-20     | `cpuTemperature()` fixed issue windows |
| 4.26.10        | 2020-07-16     | `networkStats()` fixed issue blocking windows |
| 4.26.9         | 2020-06-06     | `networkStats()` fixed comparison issue windows |
| 4.26.8         | 2020-06-06     | `networkInterfaces()` fixed caching issue |
| 4.26.7         | 2020-06-06     | `cpuTemperature()` fixed raspberry pi sensors issue |
| 4.26.6         | 2020-06-03     | `diskLayout()` fixed issue linux |
| 4.26.5         | 2020-05-27     | `cpuTemperature()` optimizes scanning AMD linux sensors |
| 4.26.4         | 2020-05-21     | `cpuTemperature()` fix (BSD), code cleanup |
| 4.26.3         | 2020-05-20     | updated documentation (macOS temperature) |
| 4.26.2         | 2020-05-19     | `processes()` memory leak fix |
| 4.26.1         | 2020-05-13     | code cleanup |
| 4.26.0         | 2020-05-12     | `diskLayout()` added full smart data where supported |
| 4.25.2         | 2020-05-12     | `getDynamicData()` added wifiNetworks() |
| 4.25.1         | 2020-05-07     | `get()` minor bounds test fix, updated docs |
| 4.25.0         | 2020-05-07     | `get()` added function to get partial system info |
| 4.24.2         | 2020-05-06     | `cpu()` fix (BSD), `networkStats()` fix BSD |
| 4.24.1         | 2020-05-03     | `processes()` fix parsing command and params |
| 4.24.0         | 2020-05-01     | `networkInterfaces()` added subnet mask ip4 and ip6 |
| 4.23.10        | 2020-05-01     | `cpuTemperature()` optimized parsing linux |
| 4.23.9         | 2020-04-29     | `currentLoad()` workarround for no os.cpus info |
| 4.23.8         | 2020-04-26     | `getMacAddresses()` fix added try catch |
| 4.23.7         | 2020-04-26     | `getCpuCurrentSpeedSync()` workarround fix |
| 4.23.6         | 2020-04-25     | `networkGatewayDefault()` bug fix no interfaces |
| 4.23.5         | 2020-04-20     | updated docs |
| 4.23.4         | 2020-04-20     | `users()` optimized parseDateTime function |
| 4.23.3         | 2020-04-09     | refactored to avoid `cat` |
| 4.23.2         | 2020-04-08     | `cpu()` fixed getting base frequency for AMD Ryzen |
| 4.23.1         | 2020-03-11     | `diskLayout()` optimized detection linux |
| 4.23.0         | 2020-03-08     | `versions()` added param to specify which program/lib versions to detect |
| 4.22.7         | 2020-03-08     | `diskLayout()` fixed linux |
| 4.22.6         | 2020-03-08     | `network()` fixed DHCP linux|
| 4.22.5         | 2020-03-04     | `graphics()` fixed vram macOS |
| 4.22.4         | 2020-03-01     | `versions()` added dotnet, typings fix |
| 4.22.3         | 2020-02-20     | `memLayout()` code cleanup |
| 4.22.2         | 2020-02-19     | `memLayout()` raspberry PI mem voltage fix |
| 4.22.1         | 2020-02-17     | `memLayout()` raspberry PI support |
| 4.22.0         | 2020-02-17     | `services()` added pids (windows) |
| 4.21.3         | 2020-02-16     | `versions()` fixed mysql version (macOS) |
| 4.21.2         | 2020-02-11     | `networkConnections()` fixed linux (debian) issue |
| 4.21.1         | 2020-01-31     | `networkGatewayDefault()` fixed windows 7 issue |
| 4.21.0         | 2020-01-27     | `npx` compatibility |
| 4.20.1         | 2020-01-26     | `battery()` code refactoring, cleanup, updated docs |
| 4.20.1         | 2020-01-26     | `battery()` code refactoring, cleanup, updated docs |
| 4.20.0         | 2020-01-25     | `battery()` added designcapacity, voltage, unit |
| 4.19.4         | 2020-01-24     | `mem()` prevent log messages, `memgetDefaultNetworkInterface()` catch errors |
| 4.19.3         | 2020-01-24     | `memLayout()` bank info fix macOS |
| 4.19.2         | 2020-01-19     | `cpu()` muli-processor fix windows |
| 4.19.1         | 2020-01-14     | `osInfo()` uefi fix windows |
| 4.19.0         | 2020-01-12     | `osInfo()` added uefi |
| 4.18.3         | 2020-01-10     | `fsSize()` fix excluding loop/snap devices |
| 4.18.2         | 2020-01-10     | `memLayout()` fix memsize linux (modules >= 32 GB) |
| 4.18.1         | 2020-01-07     | updated docs |
| 4.18.0         | 2020-01-07     | `networkInterfaces()` added dhcp for mac os, added dhcp linux fallback |
| 4.17.3         | 2020-01-05     | code cleanup |
| 4.17.2         | 2020-01-05     | `cpu().speed` AMD base frequency and fix (0.00) |
| 4.17.1         | 2020-01-04     | `fsSize()` alpine linux support |
| 4.17.0         | 2020-01-04     | `networkInterfaces()` added dhcp, dnsSuffix, ieee8021xAuth, ieee8021xState |
| 4.16.1         | 2020-01-02     | `networkInterfaces()` bug fix (osx) |
| 4.16.0         | 2019-11-27     | `networkGatewayDefault()` added |
| 4.15.3         | 2019-11-10     | type definitions and docs update |
| 4.15.2         | 2019-11-10     | `mem()` improved calculation linux |
| 4.15.1         | 2019-11-10     | `diskLayout()` added support for older lsblk versions (linux) |
| 4.15.0         | 2019-11-10     | `cpu()` added governor (linux) |
| 4.14.17        | 2019-10-22     | `graphics()` improved display detection (windows) |
| 4.14.16        | 2019-10-19     | `graphics()` improved display detection (windows) |
| 4.14.15        | 2019-10-18     | `graphics()` fallback display detection (windows) |
| 4.14.14        | 2019-10-18     | `powerShell()` fixed error handling (windows) |
| 4.14.13        | 2019-10-15     | `networkConnections()` fixed parsing (linux) |
| 4.14.12        | 2019-10-14     | `getCpu()` fixed multi socket detection (linux) |
| 4.14.11        | 2019-10-01     | type definitions fix dockerInfo |
| 4.14.10        | 2019-10-01     | type definitions fix memLayout |
| 4.14.9         | 2019-10-01     | `processLoad()` fix windows |
| 4.14.8         | 2019-08-22     | `parseDateTime()` fix coding error |
| 4.14.7         | 2019-08-22     | `battery()` windows acconnected improvement |
| 4.14.6         | 2019-08-22     | `users()` improved date time parsing |
| 4.14.5         | 2019-08-22     | `fsSize()` fix windows result as number |
| 4.14.4         | 2019-07-20     | `verions()` fix pip, pip3 |
| 4.14.3         | 2019-07-09     | `system()` sku fix windows |
| 4.14.2         | 2019-07-07     | `networkConnections()` pid linux fix NAN |
| 4.14.1         | 2019-07-04     | `graphics()` added display position windows |
| 4.14.0         | 2019-07-03     | `processes()` added process path and params |
| 4.13.2         | 2019-07-02     | `versions()` fix getting all versions |
| 4.13.1         | 2019-07-01     | `versions()` gcc fix macos |
| 4.13.0         | 2019-07-01     | `networkConnections()` added PID and process |
| 4.12.2         | 2019-06-24     | `system()` added Raspberry PI 4 detection |
| 4.12.1         | 2019-06-24     | `networkInterface()` virtual interfaces macos, `networkInterfaceDefault()` |
| 4.12.0         | 2019-06-21     | `networkInterface()` added property virtual |
| 4.11.6         | 2019-06-19     | `util` bug fix |
| 4.11.5         | 2019-06-19     | `dockerAll()` bug fix |
| 4.11.4         | 2019-06-17     | type definitions bug fix |
| 4.11.3         | 2019-06-16     | `graphics()` optimization windows |
| 4.11.2         | 2019-06-16     | `wifiNetworks()` bug fixes |
| 4.11.1         | 2019-06-15     | updated docs |
| 4.11.0         | 2019-06-14     | `wifiNetworks()` added available wifi networks |
| 4.10.0         | 2019-06-14     | `graphics()` windows multiple display support |
| 4.9.2          | 2019-06-12     | type definitions bug fix |
| 4.9.1          | 2019-06-11     | `networkStats()` bug fix windows |
| 4.9.0          | 2019-06-03     | `graphics()` added vendor, refresh rate, current res |
| 4.8.4          | 2019-06-03     | `vboxInfo()` fixed call parameters |
| 4.8.3          | 2019-06-01     | `vboxInfo()` added stoppedSince, started, stopped |
| 4.8.2          | 2019-05-31     | `dockerInfo()` changed property naming style |
| 4.8.1          | 2019-05-31     | updated docs |
| 4.8.0          | 2019-05-31     | added `vboxInfo()` detailed virtual box info |
| 4.7.3          | 2019-05-30     | updated typescript typings |
| 4.7.2          | 2019-05-30     | `versions()` added virtualbox, java popup fix macos |
| 4.7.1          | 2019-05-29     | `memLayout()` fix macos mojave  |
| 4.7.0          | 2019-05-29     | partial netBSD support  |
| 4.6.1          | 2019-05-29     | get wmic path - fic windows  |
| 4.6.0          | 2019-05-27     | added `dockerInfo()` |
| 4.5.1          | 2019-05-17     | updated docs |
| 4.5.0          | 2019-05-17     | `fsOpenFiles()` added open file descriptor count |
| 4.4.1          | 2019-05-11     | updated docs |
| 4.4.0          | 2019-05-11     | `dockerContainers()` added started, finished time |
| 4.3.0          | 2019-05-09     | `dockerContainers()` `dockerStats()` added restartCount |
| 4.2.1          | 2019-05-09     | `networkInterfaceDefault()` time delay fix (linux) |
| 4.2.0          | 2019-05-09     | `osInfo()` extended service pack version (windows) |
| 4.1.8          | 2019-05-09     | `graphics()` resolve on error (windows) |
| 4.1.7          | 2019-05-09     | `users()` parsing fix (windows) |
| 4.1.6          | 2019-04-24     | `memory()` swap used fix (linux) |
| 4.1.5          | 2019-04-19     | refactored `wmic` calls to work also on Windows XP |
| 4.1.4          | 2019-03-26     | `networkInterfaces()` speed bug (windows) |
| 4.1.3          | 2019-03-24     | wmic path detection (windows) |
| 4.1.2          | 2019-03-23     | updated docs |
| 4.1.1          | 2019-03-13     | updated typescript typings |
| 4.1.0          | 2019-03-13     | `versions()` added pip, pip3 |
| 4.0.16         | 2019-03-12     | Happy birthday - 5th aniversary |
| 4.0.15         | 2019-03-02     | `versions()` added java, python3, optimized gcc |
| 4.0.14         | 2019-03-01     | updated typescript typings |
| 4.0.13         | 2019-03-01     | `diskLayout()` added device (/dev/sda...) linux, mac |
| 4.0.12         | 2019-03-01     | `diskLayout()` linux rewritten - better detection |
| 4.0.11         | 2019-02-23     | `users()` fix windows (time), added @ts-check |
| 4.0.10         | 2019-02-10     | `networkInterfaceDefault()` fix windows  |
| 4.0.9          | 2019-02-08     | `cpu()` fix, code cleanup  |
| 4.0.8          | 2019-02-05     | `inetLatency()` Windows fix parse chinese output |
| 4.0.7          | 2019-02-05     | `inetLatency()` Windows fix |
| 4.0.6          | 2019-02-04     | powershell catch error |
| 4.0.5          | 2019-02-03     | updated docs |
| 4.0.4          | 2019-02-03     | code cleanup, updated docs |
| 4.0.3          | 2019-02-03     | `networkInterfaces(), chassis()` fixed two more issues |
| 4.0.2          | 2019-02-03     | `networkInterfaces(), chassis()` fixed smaller issues |
| 4.0.1          | 2019-02-02     | updated docs |
| 4.0.0          | 2019-02-02     | new major version |
| 3.54.0         | 2018-12-30     | added TypeScript type definitions |
| 3.53.1         | 2018-12-29     | `versions()` bug fix nginx version |
| 3.53.0         | 2018-12-29     | `versions()` added perl, python, gcc |
| 3.52.7         | 2018-12-29     | `versions()` bug fix macOS detection |
| 3.52.6         | 2018-12-28     | `versions()` bug fix macOS |
| 3.52.5         | 2018-12-28     | preparing automated tests, travis-ci integration, added dev-dependencies |
| 3.52.4         | 2018-12-27     | `graphics().controllers` bugfix linux |
| 3.52.3         | 2018-12-27     | `os().codepage` bugfix |
| 3.52.2         | 2018-12-17     | code cleanup |
| 3.52.1         | 2018-12-17     | `inetChecksite()` bugfix windows |
| 3.52.0         | 2018-12-15     | `cpu()` added physical cores, processors, socket type |
| 3.51.4         | 2018-12-05     | `versions()` bugfix, optimization postgres |
| 3.51.3         | 2018-11-27     | `mem()` refactoring parsing linux, code cleanup |
| 3.51.2         | 2018-11-26     | `mem()` bugfix parsing `free` output linux |
| 3.51.1         | 2018-11-26     | `processLoad()` bugfix windows |
| 3.51.0         | 2018-11-25     | `processLoad()` added for windows |
| 3.50.3         | 2018-11-25     | `processLoad()`, `services()` fixed cpu data (linux) |
| 3.50.2         | 2018-11-23     | network mac adresses: ip support fix |
| 3.50.1         | 2018-11-23     | `services()` added possibility to specify ALL services "*" for win |
| 3.50.0         | 2018-11-23     | `services()` added possibility to specify ALL services "*" for linux |
| 3.49.4         | 2018-11-21     | `battery()` timeremaining optimization (linux) thanks to Jorai Rijsdijk |
| 3.49.3         | 2018-11-20     | `memLayout()` optimized parsing (win) |
| 3.49.2         | 2018-11-19     | code cleanup |
| 3.49.1         | 2018-11-19     | `cpu().brand` removed extra spaces, tabs |
| 3.49.0         | 2018-11-19     | added system `uuid()` (os specific), `versions()` added postgresql |
| 3.48.4         | 2018-11-18     | windows: garbled output because of codepage |
| 3.48.3         | 2018-11-18     | `dockerContainerStats()` fixed issue `cpu_percent` win |
| 3.48.2         | 2018-11-18     | `dockerContainerStats()` fixed issue `cpu_percent`, win exec |
| 3.48.1         | 2018-11-17     | `docker...()` fixed issue parsing docker socket JSON |
| 3.48.0         | 2018-11-17     | `diskLayout()` better interface detection (WIN), `osInfo()` added build, serial |
| 3.47.0         | 2018-11-06     | `versions()` added docker, postfix |
| 3.46.0         | 2018-11-05     | fixed issue `versions()`, added system openssl version |
| 3.45.10        | 2018-11-03     | fixed issue `battery()`, modified `package.json` - files |
| 3.45.9         | 2018-10-22     | fixed node 4 incompatibility |
| 3.45.8         | 2018-10-22     | `system()` fix Raspberry Pi detection |
| 3.45.7         | 2018-10-05     | fixed typos |
| 3.45.6         | 2018-09-12     | `mem()` bug parsing linux in other languages |
| 3.45.5         | 2018-09-07     | `diskLayout()` tiny bug S.M.A.R.T status windows |
| 3.45.4         | 2018-09-06     | added icon to README.md |
| 3.45.3         | 2018-09-06     | `diskLayout()` optimized media type detection (HD, SSD) on Windows |
| 3.45.2         | 2018-09-05     | updated imags shields icons |
| 3.45.1         | 2018-09-05     | updated documentation |
| 3.45.0         | 2018-09-04     | `diskLayout()` added smartStatus |
| 3.44.2         | 2018-08-28     | added code quality badges |
| 3.44.1         | 2018-08-28     | code cleanup |
| 3.44.0         | 2018-08-25     | `battery()` bugfix & added type, model, manufacturer, serial |
| 3.43.0         | 2018-08-25     | `cpuCurrentspeed()` added cpu speed for all cores |
| 3.42.10        | 2018-08-25     | `processes()` optimized start time parsing |
| 3.42.9         | 2018-08-08     | `cpuTemperature()` optimized parsing |
| 3.42.8         | 2018-08-03     | updated docs |
| 3.42.7         | 2018-08-03     | `processes()` optimized parsing ps name |
| 3.42.6         | 2018-08-03     | `processes()` bugfix parsing ps linux |
| 3.42.5         | 2018-08-03     | `processes()` bugfix parsing ps linux |
| 3.42.4         | 2018-07-09     | `cpuTemperature()` bugfix parsing negative values |
| 3.42.3         | 2018-07-05     | `services()` bugfix not finding services with capital letters |
| 3.42.2         | 2018-07-03     | `users()` optimized results if lack of permissions |
| 3.42.1         | 2018-07-03     | `versions()` bugfix git version macOS |
| 3.42.0         | 2018-06-01     | `processes()` added parent process PID |
| 3.41.4         | 2018-05-28     | windows exec WMIC path detection (windows) in try catch |
| 3.41.3         | 2018-05-13     | improved SunOS support `getStaticData()`, `getDynamicData()` |
| 3.41.2         | 2018-05-13     | bugfix `system()` and `flags()` Raspberry Pi |
| 3.41.1         | 2018-05-11     | updated docs |
| 3.41.0         | 2018-05-11     | `system()` Raspberry Pi bugfix and extended detection, added partial `SunOS` support |
| 3.40.1         | 2018-05-10     | bugfix `system().sku` (windows) |
| 3.40.0         | 2018-04-29     | extended `versions()` (php, redis, mongodb) |
| 3.39.0         | 2018-04-29     | added `versions().mysql` and `versions().nginx`, starting `SunOS` support (untested) |
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
| 3.33.10        | 2017-12-14     | bugfix WMIC path detection (windows) blockDevice parse (Windows 7) |
| 3.33.9         | 2017-12-14     | bugfix WMIC path detection (windows) not found (Windows) |
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

[nodejs-url]: https://nodejs.org/en/
