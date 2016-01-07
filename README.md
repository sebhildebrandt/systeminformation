# systeminformation

Simple system and OS information library for [node.js][nodejs-url]

  [![NPM Version][npm-image]][npm-url]
  [![NPM Downloads][downloads-image]][downloads-url]
  [![MIT license][license-img]][license-url]

## Quick Start

### Installation

```bash
$ npm install systeminformation --save
```

### Usage

All functions (except `version` and `time`) are implemented as asynchronous functions. Here a small example how to use them:

```
var si = require('systeminformation');

si.cpu(function(data) {
	console.log('CPU-Information:');
	console.log(data);
})
```

### Major Changes - Version 2

There are a lot of changes in version 2 of systeminformation! Here is a quick overview:

New Functions  

- `version`: returns systeminformation version (semver)
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

- no more external dependencies: `request` is not longer needed
- where possible results are now integer or float values (instead of strings) because it is easier to calculate with numbers ;-)

**Be aware**, that the new version 2.x is **NOT backward compatible** to version 1.x ....

## Core concept

[Node.js][nodejs-url] comes with some basic OS information, but I always wanted a little more. So I came up to write this 
little library. This library is still work in progress. In version 2 I cleaned up a lot of inconsistencies and bugs, but 
there is for sure room for improvement. I was only able to test it on several Debian, Raspbian, Ubuntu distributions as well 
as OS X (Mavericks, Yosemite, El Captain). Version 2 now also supports nearly all functionality on OS X/Darwin platforms. 
But be careful, this library will definitely NOT work on Windows platforms!

If you have comments, suggestions & reports, please feel free to contact me!

## Reference

### Sections

This library is splitted in several sections:

1. General
2. System (HW)
3. Operating System
4. CPU
5. Memory
6. File System
7. Network
8. Processes
9. Users
10. Internet
11. GetAll

### Function Reference and OS Support

| function        | Linux           | OS X  | Comments |
| -------------- | ------ | ------ | ------- |
| si.version() | X | X | systeminformation version (no callback!) |
| si.time() | X | X | time information (no callback!) |
| - current | X | X | local time |
| - uptime | X | X | uptime |
| si.system(cb) | X | X | hardware information |
| - manufacturer | X | X | e.g. 'MSI' |
| - model | X | X | model/product e.g. 'MS-7823' |
| - version | X | X | version e.g. '1.0' |
| - serial | X | X | serial number |
| - uuid | X | X | UUID |
| si.osInfo(cb) | X | X | OS information |
| - platform   | X | X | 'Linux' or 'Darwin' |
| - distro | X | X |  |
| - release | X | X |  |
| - codename | | X |  |
| - kernel | X | X | kernel release - same as os.release() |
| - arch | X | X | same as os.arch() |
| - hostname | X | X | same as os.hostname() |
| - logofile | X | X | e.g. 'apple', 'debian', 'fedora', ... |
| si.cpu(cb) | X | X | CPU information|
| - manufacturer | X | X | e.g. 'Intel(R)' |
| - brand | X | X | e.g. 'Core(TM)2 Duo' |
| - speed | X | X | in GHz e.g. '3.40' |
| - cores | X | X | # cores |
| si.cpuCurrentspeed(cb) | X | X | current speed (in GHz)|
| si.cpuTemperature(cb) | X | | CPU temperature (if sensors is installed) |
| - main | X | | main temperature |
| - cores | X | | array of temperatures |
| - max | X | | max temperature |
| si.mem(cb) | X | X | Memory information|
| - total | X | X |  |
| - free | X | X |  |
| - used | X | X |  |
| - active | X | X |  |
| - buffcache | X | X |  |
| - swaptotal | X | X |  |
| - swapused | X | X |  |
| - swapfree | X | X |  |
| si.fsSize(cb) | X | X | returns array of mounted file systems |
| - [0].fs | X | X | name of file system |
| - [0].size | X | X | sizes in Bytes |
| - [0].used | X | X | used in Bytes |
| - [0].use | X | X | used in % |
| - [0].mount | X | X | mount point |
| si.fsStats(cb) | X | X | current transfer stats |
| - rx | X | X | bytes read since startup |
| - wx | X | X | bytes written since startup |
| - rx_sec | X | X | bytes read / second (* see notes) |
| - wx_sec | X | X | bytes written / second (* see notes) |
| si.networkInterfaces(cb) | X | X | array of network interfaces |
| - [0].iface | X | X | interface name |
| - [0].ip4 | X | X | ip4 address |
| - [0].ip6 | X | X | ip6 address |
| si.networkStats('eth1',cb) | X | X | current network stats of given interface |
| - iface | X | X | interface |
| - operstate | X | X | up / down |
| - rx | X | X | received bytes overall |
| - tx | X | X | transferred bytes overall|
| - rx_sec | X | X | received bytes / second (* see notes) |
| - tx_sec | X | X | transferred bytes per second (* see notes) |
| si.currentLoad(cb) | X | X | CPU-Load in % |
| si.fullLoad(cb) | X | X | CPU-full load since bootup in % |
| si.services('mysql, apache2', cb) | X | X | pass comma separated string of services |
| - [0].name | X | X | name of service |
| - [0].running | X | X | true / false |
| - [0].pcpu | X | X | process % CPU |
| - [0].pmem | X | X | process % MEM |
| si.processes(cb) | X | X | # running processes |
| si.processLoad('apache2',cb) | X | X | detailed information about given process |
| - proc | X | X | process name |
| - pid | X | X | PID |
| - cpu | X | X | process % CPU |
| - mem | X | X | process % MEM |
| si.users(cb) | X | X | array of users online |
| si.inetChecksite(url, cb) | X | X | response-time (ms) to fetch given URL |
| - url | X | X | given url |
| - ok | X | X | status code OK (2xx, 3xx) |
| - status | X | X | status code |
| - ms | X | X | response time in ms |
| si.inetLatency(cb) | X | X | response-time (ms) to external ressource |
| si.getStaticData(cb)  | X | X | all static data at once |
| si.getDynamicData(cb,srv,iface) | X | X | all dynamic data at once |
| si.getAllData(cb,srv,iface) | X | X | all data at once |

### cb: Asynchronous Function Calls (callback)

Remember: all functions (except `version` and `time`) are implemented as asynchronous (callback) functions! 
So another example, how to use a specific function might be:

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

### *: Additional Notes

In `fsStats` and `networkStats` the results per second values (rx_sec, ...) are calculated beginning 
with the second call of the function. It is determined by calculating the difference of transferred bytes 
divided by the time between two calls of the function.

## Known Issues

There is one major things, that I was still not able to solve:

For OS X, I did not find a reliable way to get the CPU temperature. All suggestions I found did not work on current version of OS X on different machines (intel platform). So if anyone has an idea, this would be helpful. 

I am happy to discuss any comments and suggestions. Please feel free to contact me if you see any possibility of improvement!

## Version history

| Version        | Date           | Comment  |
| -------------- | -------------- | -------- |
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

## Copyright Information

Linux is a registered trademark of Linus Torvalds, OS X is a registered trademark of Apple Inc., 
Windows is a registered trademark of Microsoft Corporation. Node.js is a trademark of Joyent Inc., 
Intel is a trademark of Intel Corporation, Raspberry Pi is a trademark of the Raspberry Pi Foundation, 
Debian is a trademark of the Debian Project, Ubuntu is a trademark of Canonical Ltd. 
All other trademarks are the property of their respective owners.

## License [![MIT license][license-img]][license-url]

>The [`MIT`][license-url] License (MIT)
>
>Copyright &copy; 2014-2016 Sebastian Hildebrandt, [+innovations](http://www.plus-innovations.com).
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

[nodejs-url]: https://nodejs.org/en/
