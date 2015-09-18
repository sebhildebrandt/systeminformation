# systeminformation

Simple system and OS information library for [node.js][nodejs-url]

  [![NPM Version][npm-image]][npm-url]
  [![NPM Downloads][downloads-image]][downloads-url]
  [![MIT license][license-img]][license-url]
  [![deps status][daviddm-img]][daviddm-url]

### --- Working already on Version 2 - stay tuned ---

## Quick Start

### Installation

```bash
$ npm install systeminformation
```

### Usage

All functions are implemented as asynchronous functions. Here a small example how to use them:

```
var si = require('systeminformation');

si.cpu(function(data) {
	console.log('CPU-Information:');
	console.log(data);
})
```

## Core concept

Node.JS comes with some basic OS-informations, but I always wanted a little more. So I came up to write this little library. This library is work in progress. It is quite "fresh" - means, there might be a lot of inconsistencies or even bugs. I was only able to test it on some Debian and Ubuntu distributions as well as OSX (Maveriks). But be carefull, not all options will work on OSX. AND: this library will definitely NOT work on Windows platforms!

If you have comments, suggestions & reports, please feel free to contact me!

## Reference

### Sections

This library is splitted in several sections:

1. Operating System
2. CPU
3. Memory
4. File System
5. Network
6. Processes
7. Users
8. Internet

### Command Reference and OS Support

| command        | Linux           | OSX  | Comments |
| -------------- | ------ | ------ | ------- |
| si.osinfo() | X | X | OS information|
| - platform   | X | X | 'Linux' or 'Darwin' |
| - distro | X | X |  |
| - release | X | X |  |
| - codename | | X |  |
| - kernel | X | X | kernel release - same as os.release()|
| - arch | X | X | same as os.arch() |
| - hostname | X | X | same as os.hostname() |
| - logofile | X | X | e.g. 'apple', 'debian', 'fedora', ... |
| si.cpu() | X | X | CPU information|
| - brand | X | X | e.g. 'Intel(R)' |
| - speed | X | X | e.g. '3.40GHz' |
| - cores | X | X | # cores |
| si.cpu_currentspeed() | X | X | current speed (GHz)|
| si.cpu_temperature() | X | | CPU temperature (if sensors is installed) |
| - main | X | X | main temperature |
| - cores | X | X | array of temperatures |
| si.mem() | X | X | Memory information|
| - total | X | X |  |
| - free | X | X |  |
| - used | X | X |  |
| - active | X | X |  |
| - buffcache | X | X |  |
| - swaptotal | X | |  |
| - swapused | X | |  |
| - swapfree | X | |  |
| si.fs_size() | X | X | returns array of mounted file systems |
| - [0].fs | X | X | name of file system |
| - [0].size | X | X | sizes in Bytes |
| - [0].used | X | X | used in Bytes |
| - [0].use | X | X | used in % |
| - [0].mount | X | X | mount point |
| si.fs_speed() | X | | currend transfer speed |
| - read_sec | X | | bytes read / second |
| - write_sec | X | | bytes written / second |
| si.network_interfaces() | X | X | array of network interfaces |
| - [0].iface | X | X | interface name |
| - [0].ip4 | X | X | ip4 address |
| - [0].ip6 | X | X | ip6 address |
| si.network_speed('eth1') | X | | current network speed of given interface |
| - operstate | X | | up / down |
| - rx_sec | X | X | received bytes / second |
| - tx_sec | X | X | transferred bytes per second |
| si.currentload() | X | X | CPU-Load in % |
| si.fullload() | X | X | CPU-full load since bootup in % |
| si.services('mysql, apache2, nginx') | X | X | pass comma separated string of services |
| - [0].service | X | X | name of service |
| - [0].running | X | X | true / false |
| - [0].pcpu | X | X | process % CPU |
| - [0].pmem | X | X | process % MEM |
| si.processes() | X | X | # running processes |
| si.processload('apache2') | X | X | detailed information about given process |
| - proc | X | X | process name |
| - pid | X | X | PID |
| - cpu | X | X | process % CPU |
| - mem | X | X | process % MEM |
| si.users() | X | X | array of users online |
| si.checksite(url) | X | X | response-time (ms) to fetch given URL |

Remember: All functions are implemented as asynchronous functions! So another example, how to use a specific function might be:

```
var si = require('systeminformation');

si.network_speed('eth1', function(data) {
	console.log('Network Interface Speed (eth1):');
	console.log('- is up: ' + data.operstate);
	console.log('- RX speed/sec: ' + data.rx_sec);
	console.log('- TX speed/sec: ' + data.tx_sec);
})
```

## Version history

| Version        | Date           | Comment  |
| -------------- | -------------- | -------- |
| 1.0.6          | 2015-09-17     | fixed: si.users() |
| 1.0.5          | 2015-09-14     | updated dependencies |
| 1.0.4          | 2015-07-18     | updated docs |
| 1.0.3          | 2015-07-18     | bugfix cpu cores |
| 1.0.2          | 2015-07-18     | bugfix cpu_currentspeed, cpu_temperature |
| 1.0.1          | 2015-07-18     | documentation update |
| 1.0.0          | 2015-07-18     | bug-fixes, version bumb, published as npm component |
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

Guillaume Legrain [glegrain](https://github.com/glegrain)

## License [![MIT license][license-img]][license-url]

>The [`MIT`][license-url] License (MIT)
>
>Copyright &copy; 2015 Sebastian Hildebrandt, [+innovations](http://www.plus-innovations.com).
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

[daviddm-url]: https://david-dm.org/sebhildebrandt/systeminformation
[daviddm-img]: https://img.shields.io/david/sebhildebrandt/systeminformation.svg?style=flat-square
