# systeminfo

Simple system monitoring library for node.js - Version 0.0.3

## Core concept

Node.JS comes with some basic OS-informations, but I always wanted a little more. So I came up to write this little library. This library is work in progress. It is quite "fresh" - means, there might be a lot of inconsistencies or even bugs. I was only able to test it on some Debian and Ubuntu distributions as well as OSX (Maveriks). But be carefull, not all options will work on OSX. AND: this library will definitely NOT work on Windows platforms!

If you have comments, suggestions & reports, please feel free to contact me!

## Sections

This library is splitted in several sections:

1. Operating System
2. CPU
3. Memory
4. File System
5. Network
6. Processes
7. Users
8. Internet

## Using +monitor

### Installation

At the time of writing, this library is dependent on the ```request``` module, which needs to be installed seperately. I created a npm ```package.json``` file, to be able to install it easily:

```
npm install
```

### Usage

All functions are implemented as asynchronous functions. Here a small example how to use them:

```
var systeminfo = require('./systeminfo.js');

systeminfo.cpu(function(data) {
	console.log('CPU-Information:');
	console.log(data);
})
```


## Version history

| Version        | Date           | Comment  |
| -------------- | -------------- | -------- |
| 0.0.3          | 2014-04-14     | bug-fix (cpu_speed) |
| 0.0.2          | 2014-03-14     | Optimization FS-Speed & CPU current speed |
| 0.0.1          | 2014-03-13     | initial release |

## Comments

If you have ideas or comments, please do not hesitate to contact me.


Happy monitoring!

Sincerely,
Sebastian Hildebrandt
http://www.plus-innovations.com


#### Credits

Written by Sebastian Hildebrandt

#### License

>The MIT License (MIT)
>
>Copyright (c) 2014 +innovations.
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
>Further details see "LICENSE" file.


