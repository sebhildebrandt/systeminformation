// ==================================================================================
// index.js
// ----------------------------------------------------------------------------------
// Description:   System Information - library
//                for Node.js
// Copyright:     (c) 2014 - 2016
// Author:        Sebastian Hildebrandt
// ----------------------------------------------------------------------------------
// Contributors:  Guillaume Legrain (https://github.com/glegrain)
//                Riccardo Novaglia (https://github.com/richy24)
// ----------------------------------------------------------------------------------
// License:       MIT
// ==================================================================================
//
// Sections
// --------------------------------
// 1. General
// 2. System (HW)
// 3. OS - Operating System
// 4. CPU
// 5. Memory
// 6. File System
// 7. Network
// 8. Processes
// 9. Users/Sessions
// 10. Internet
// 11. GetAll - get all data
//
// ==================================================================================
//
// Installation
// --------------------------------
//
// # npm install systeminformation --save
//
// The new version 2.0 has no more dependencies.
//
// ==================================================================================
//
// Usage
// --------------------------------
// All functions (except `version` and `time`) are asynchronous functions. Here a small example how to use them:
//
// var si = require('systeminformation');
//
// si.cpu(function(data) {
//	  console.log('CPU-Information:');
//	  console.log(data);
// })
//
// ==================================================================================
//
// Comments
// --------------------------------
//
// This library is still work in progress. In version 2 I cleaned up a lot of inconsistencies
// and bugs, but there is for sure room for improvement. I was only able to test it on several
// Debian, Raspbian, Ubuntu distributions as well as OS X (Mavericks, Yosemite, El Captain).
// Version 2 now also supports nearly all functionality on OS X/Darwin platforms.
// But be careful, this library will definitely NOT work on Windows platforms!
//
// Comments, suggestions & reports are very welcome!
//
// ==================================================================================
//
// Version history
// --------------------------------
//
// version	date	comment
// 2.0.4	2016-02-22	tiny correction - removed double quotes CPU brand, ...
// 2.0.3	2016-02-22	optimized cpuCurrentspeed
// 2.0.2	2016-02-22	added CoreOS identification
// 2.0.1	2016-01-07	minor patch
// 2.0.0	2016-01-07	new major version 2.0
// 1.0.7	2015-11-27	fixed: si.network_speed()
// 1.0.6	2015-09-17	fixed: si.users()
// 1.0.5	2015-09-14	updated dependencies
// 1.0.4	2015-07-18	updated docs
// 1.0.3	2015-07-18	bugfix cpu cores
// 1.0.2	2015-07-18	bugfix cpu_currentspeed, cpu_temperature
// 1.0.1	2015-07-18	documentation update
// 1.0.0	2015-07-18	bug-fixes, version bump, published as npm component
// 0.0.3	2014-04-14	bug-fix (cpu_speed)
// 0.0.2	2014-03-14	Optimization FS-Speed & CPU current speed
// 0.0.1	2014-03-13	initial release
//
// ==================================================================================

// ----------------------------------------------------------------------------------
// Dependencies
// ----------------------------------------------------------------------------------

var os = require('os')
  , exec = require('child_process').exec
  , fs = require('fs')
  , lib_version = require('../package.json').version;

var _cores = 0;
var _platform = os.type();
var _linux = (_platform == 'Linux');
var _darwin = (_platform == 'Darwin');
var _windows = (_platform == 'Windows_NT');
var _network = {};
var _cpu_speed = '0.00';
var _fs_speed = {};

const NOT_SUPPORTED = 'not supported';

// ----------------------------------------------------------------------------------
// 0. helper functions
// ----------------------------------------------------------------------------------

function isFunction(functionToCheck) {
	var getType = {};
	return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}

// ----------------------------------------------------------------------------------
// 1. System (Hardware)
// ----------------------------------------------------------------------------------

function system(callback) {
	if (_windows) {
		callback(NOT_SUPPORTED);
	}

	var result = {
		manufacturer : '-',
		model : '-',
		version : '-',
		serial : '-',
		uuid : '-'
	};

	if (_linux) {
		exec("dmidecode -t system", function(error, stdout) {
			if (!error) {
				var lines = stdout.toString().split('\n');
				lines.forEach(function(line) {
					if (line.indexOf(':') != -1) {
						if (line.toLowerCase().indexOf('manufacturer') != -1) result.manufacturer = line.split(':')[1].trim();
						if (line.toLowerCase().indexOf('product name') != -1) result.model = line.split(':')[1].trim();
						if (line.toLowerCase().indexOf('version') != -1) result.version = line.split(':')[1].trim();
						if (line.toLowerCase().indexOf('serial number') != -1) result.serial = line.split(':')[1].trim();
						if (line.toLowerCase().indexOf('uuid') != -1) result.uuid = line.split(':')[1].trim();
					}
				});
				if (result.serial.toLowerCase().indexOf('o.e.m.') != -1) result.serial = '-';

				if (result.manufacturer == '-' && result.model == '-' && result.version == '-') {
					// Check Raspberry Pi
					exec("grep Hardware /proc/cpuinfo; grep Serial /proc/cpuinfo; grep Revision /proc/cpuinfo", function(error, stdout) {
						if (!error) {
							var lines = stdout.toString().split('\n');
							lines.forEach(function(line) {
								if (line.indexOf(':') != -1) {
									if (line.toLowerCase().indexOf('hardware') != -1) result.model = line.split(':')[1].trim();
									if (line.toLowerCase().indexOf('revision') != -1) result.version = line.split(':')[1].trim();
									if (line.toLowerCase().indexOf('serial') != -1) result.serial = line.split(':')[1].trim();
								}
							});
							if (result.model == 'BCM2709') {
								result.manufacturer = 'Raspberry Pi Foundation';
								result.model = result.model + ' - Pi 2 Model B';
								if (['a01041', 'a21041'].indexOf(result.version) >= 0) {
									result.version = result.version + ' - Rev. 1.1'
								}
							}
							if (result.model == 'BCM2708') {
								result.manufacturer = 'Raspberry Pi Foundation';
								if (['0002', '0003'].indexOf(result.version) >= 0) {
									result.model = result.model + ' - Pi Model B';
									result.version = result.version + ' - Rev 1.0';
								}
								if (['0007', '0008', '0009'].indexOf(result.version) >= 0) {
									result.model = result.model + ' - Pi Model A';
									result.version = result.version + ' - Rev 2.0';
								}
								if (['0004', '0005', '0006', '000d', '000e', '000f'].indexOf(result.version) >= 0) {
									result.model = result.model + ' - Pi Model B';
									result.version = result.version + ' - Rev 2.0';
								}
								if (['0012'].indexOf(result.version) >= 0) {
									result.model = result.model + ' - Pi Model A+';
									result.version = result.version + ' - Rev 1.0';
								}
								if (['0010'].indexOf(result.version) >= 0) {
									result.model = result.model + ' - Pi Model B+';
									result.version = result.version + ' - Rev 1.0';
								}
								if (['0013'].indexOf(result.version) >= 0) {
									result.model = result.model + ' - Pi Model B+';
									result.version = result.version + ' - Rev 1.2';
								}
							}
						}
					})
				}
			}
			callback(result);
		})
	}
	if (_darwin) {
		exec("ioreg -c IOPlatformExpertDevice -d 2", function(error, stdout) {
			if (!error) {
				var lines = stdout.toString().split('\n');
				lines.forEach(function(line) {
					line = line.replace(/[<>"]/g, "");
					if (line.indexOf('=') != -1) {
						if (line.toLowerCase().indexOf('manufacturer') != -1) result.manufacturer = line.split('=')[1].trim();
						if (line.toLowerCase().indexOf('model') != -1) result.model = line.split('=')[1].trim();
						if (line.toLowerCase().indexOf('version') != -1) result.version = line.split('=')[1].trim();
						if (line.toLowerCase().indexOf('ioplatformserialnumber') != -1) result.serial = line.split('=')[1].trim();
						if (line.toLowerCase().indexOf('ioplatformuuid') != -1) result.uuid = line.split('=')[1].trim();
					}
				});
			}
			callback(result);
		})
	}

}

exports.system = system;

// ----------------------------------------------------------------------------------
// 2. General
// ----------------------------------------------------------------------------------

function version() {
	return lib_version;
}

exports.version = version;

// ----------------------------------------------------------------------------------
// 3. Operating System
// ----------------------------------------------------------------------------------

// --------------------------
// Get current time and OS uptime

function time() {
	return {
		current : Date.now(),
		uptime  : os.uptime()
	};
}

exports.time = time;

// --------------------------
// Get logo filename of OS distribution

function getLogoFile(distro) {
	var result = 'linux';
	if (distro.toLowerCase().indexOf('mac os') != -1) { result = 'apple' } else
	if (distro.toLowerCase().indexOf('arch') != -1)	{ result = 'arch' } else
	if (distro.toLowerCase().indexOf('centos') != -1)	{ result = 'centos' } else
	if (distro.toLowerCase().indexOf('coreos') != -1)	{ result = 'coreos' } else
	if (distro.toLowerCase().indexOf('debian') != -1)	{ result = 'debian' } else
	if (distro.toLowerCase().indexOf('elementary') != -1)	{ result = 'elementary' } else
	if (distro.toLowerCase().indexOf('fedora') != -1)	{ result = 'fedora' } else
	if (distro.toLowerCase().indexOf('gentoo') != -1)	{ result = 'gentoo' } else
	if (distro.toLowerCase().indexOf('mageia') != -1)	{ result = 'mageia' } else
	if (distro.toLowerCase().indexOf('mandriva') != -1)	{ result = 'mandriva' } else
	if (distro.toLowerCase().indexOf('manjaro') != -1)	{ result = 'manjaro' } else
	if (distro.toLowerCase().indexOf('mint') != -1)	{ result = 'mint' } else
	if (distro.toLowerCase().indexOf('openbsd') != -1)	{ result = 'openbsd' } else
	if (distro.toLowerCase().indexOf('opensuse') != -1)	{ result = 'opensuse' } else
	if (distro.toLowerCase().indexOf('pclinuxos') != -1)	{ result = 'pclinuxos' } else
	if (distro.toLowerCase().indexOf('puppy') != -1)	{ result = 'puppy' } else
	if (distro.toLowerCase().indexOf('raspbian') != -1)	{ result = 'raspbian' } else
	if (distro.toLowerCase().indexOf('reactos') != -1)	{ result = 'reactos' } else
	if (distro.toLowerCase().indexOf('redhat') != -1)	{ result = 'redhat' } else
	if (distro.toLowerCase().indexOf('slackware') != -1)	{ result = 'slackware' } else
	if (distro.toLowerCase().indexOf('sugar') != -1)	{ result = 'sugar' } else
	if (distro.toLowerCase().indexOf('steam') != -1)	{ result = 'steam' } else
	if (distro.toLowerCase().indexOf('suse') != -1)	{ result = 'suse' } else
	if (distro.toLowerCase().indexOf('mate') != -1)	{ result = 'ubuntu-mate' } else
	if (distro.toLowerCase().indexOf('lubuntu') != -1)	{ result = 'lubuntu' } else
	if (distro.toLowerCase().indexOf('xubuntu') != -1)	{ result = 'xubuntu' } else
	if (distro.toLowerCase().indexOf('ubuntu') != -1)	{ result = 'ubuntu' }
	return result;
}

// --------------------------
// OS Information

function osInfo(callback) {
	if (_windows) {
		callback(NOT_SUPPORTED);
	}

	var result = {
    	platform : _platform,
    	distro : 'unknown',
    	release : 'unknown',
    	codename : '',
    	kernel : os.release(),
    	arch : os.arch(),
    	hostname : os.hostname(),
    	logofile : ''
	};

    if (_linux) {
    	exec("cat /etc/*-release", function(error, stdout) {
			if (!error) {
				var release = {};
				var lines = stdout.toString().split('\n');
	            lines.forEach(function(line) {
	            	if (line.indexOf('=') != -1) {
	            		release[line.split('=')[0].trim().toUpperCase()] = line.split('=')[1].trim();
	            	}
	            });
	            result.distro = (release.DISTRIB_ID || release.NAME || 'unknown').replace(/"/g, '');
	            result.logofile = getLogoFile(result.distro);
	            result.release = (release.DISTRIB_RELEASE || release.VERSION_ID || 'unknown').replace(/"/g, '');
	            result.codename = (release.DISTRIB_CODENAME || '').replace(/"/g, '');
	        }
	    	callback(result);
	    })
    }
	if (_darwin) {
    	exec("sw_vers", function(error, stdout) {
    		var lines = stdout.toString().split('\n');
    		lines.forEach(function(line) {
    			if (line.indexOf('ProductName') != -1) {
                	result.distro = line.split(':')[1].trim();
                	result.logofile = getLogoFile(result.distro);
                }
    			if (line.indexOf('ProductVersion') != -1) result.release = line.split(':')[1].trim();
    		});
    		callback(result);
    	})
    }
}

exports.osInfo = osInfo;

// ----------------------------------------------------------------------------------
// 4. CPU
// ----------------------------------------------------------------------------------

function cpuBrandManufacturer(res) {
	res.brand = res.brand.replace(/\(R\)+/g, "®");
	res.brand = res.brand.replace(/\(TM\)+/g, "™");
	res.brand = res.brand.replace(/\(C\)+/g, "©");
	res.brand = res.brand.replace(/CPU+/g, "").trim();
	res.manufacturer = res.brand.split(' ')[0];
	var parts = res.brand.split(' ');
	parts.shift();
	res.brand = parts.join(' ');
	return res;
}

// --------------------------
// CPU - brand, speed

function getCpu(callback) {
	var result = {
		manufacturer : 'unknown',
		brand : 'unknown',
		speed : '0.00',
		cores : _cores
	};

	if (_darwin) {
		exec("sysctl -n machdep.cpu.brand_string", function(error, stdout) {
			if (!error) {
				var lines = stdout.toString().split('\n');
				result.brand = lines[0].split('@')[0].trim();
				result.speed = lines[0].split('@')[1].trim();
				result.speed = parseFloat(result.speed.replace(/GHz+/g, ""));
				_cpu_speed = result.speed;
    		}
			result = cpuBrandManufacturer(result);
    		callback(result);
    	});
	}
	if (_linux) {
		exec("cat /proc/cpuinfo | grep 'model name'", function(error, stdout) {
			if (!error) {
				var lines = stdout.toString().split('\n');
				var line = lines[0].split(':')[1];
				result.brand = line.split('@')[0].trim();
        result.speed = line.split('@')[1] ? parseFloat(line.split('@')[1].trim()).toFixed(2) : '0.00';
        if (result.speed == '0.00') {
            cpuCurrentspeed(function(res) {
                var current = res;
                if (current != '0.00') result.speed = current;
            });
        }
        _cpu_speed = result.speed;
    		}
			result = cpuBrandManufacturer(result);
    		callback(result);
    	})
	}
}

// --------------------------
// CPU - Processor cores

function cores(callback) {
	exec("grep -c ^processor /proc/cpuinfo 2>/dev/null || sysctl -n hw.ncpu", function(error, stdout) {
		var result = {cores: 1};
		if (!error) {
			result.cores = parseInt(stdout.toString());
			_cores = result.cores;
    	}
    	if (callback) callback(result);
  })
}

// --------------------------
// CPU - Processor Data

function cpu(callback) {
	if (_windows) {
		callback(NOT_SUPPORTED);
	}

	if (_cores == 0) {
		cores(function() {
			getCpu(callback)
		})
	} else {
		getCpu(callback)
	}
}

exports.cpu = cpu;

// --------------------------
// CPU - current speed - in GHz

function getCpuCurrentSpeedSync(file) {
	var output = "";
	var result = "0.00";
	if (file === 'cpuinfo') {
		output = fs.readFileSync("/sys/devices/system/cpu/cpu0/cpufreq/cpuinfo_cur_freq").toString();
	} else {
		output = fs.readFileSync("/sys/devices/system/cpu/cpu0/cpufreq/scaling_cur_freq").toString();
	}
	if (output.trim()) {
		var lines = output.toString().split('\n');
		result = parseFloat((parseInt(lines[0]) / 1000 / 1000).toFixed(2));
	}
	return result;
}

function cpuCurrentspeed(callback) {
	if (_windows) {
		callback(NOT_SUPPORTED);
	}

	var result = _cpu_speed;
	if (_darwin) {
		exec("sysctl -n hw.cpufrequency", function(error, stdout) {
			if (!error) {
				var lines = stdout.toString().split('\n');
				result = parseFloat((parseInt(lines[0]) / 1000 / 1000 / 1000).toFixed(2));
    		}
    		callback(result);
    	});
	}
	if (_linux) {
        result = '0.00';

        // make sure cpu file speed exists and is readable (not on virtual system)
        fs.access("/sys/devices/system/cpu/cpu0/cpufreq/cpuinfo_cur_freq", fs.F_OK | fs.R_OK, function(err) {
            if (!err) {
                result = getCpuCurrentSpeedSync('cpuinfo');
                callback(result);
            }

            else {
                fs.access("/sys/devices/system/cpu/cpu0/cpufreq/scaling_cur_freq", fs.F_OK | fs.R_OK, function(err) {
                    if (!err) result = getCpuCurrentSpeedSync('scaling');
                    else {
                        if (result == '0.00' && _cpu_speed != '0.00') result = _cpu_speed;
                    }
                    callback(result);
                });
            }
        });
	}
}

exports.cpuCurrentspeed = cpuCurrentspeed;

// --------------------------
// CPU - temperature
// if sensors are installed

function cpuTemperature(callback) {
	if (_windows) {
		callback(NOT_SUPPORTED);
	}

	var result = {
		main : -1.0,
		cores : [],
		max : -1.0
	};

    if (_linux) {
		var regex = /\+([^°]*)/g;
		exec("sensors", function(error, stdout) {
			if (!error) {
				var lines = stdout.toString().split('\n');
				lines.forEach(function(line) {
					var temps = line.match(regex);
					if (line.split(':')[0].toUpperCase().indexOf('PHYSICAL') != -1) {
						result.main = parseFloat(temps);
					}
					if (line.split(':')[0].toUpperCase().indexOf('CORE ') != -1) {
						result.cores.push(parseFloat(temps));
					}
				});
				if (result.cores.length > 0) {
					var maxtmp = Math.max.apply(Math, result.cores);
					result.max = (maxtmp > result.main) ? maxtmp : result.main;
				}
				callback(result)
	    	} else {
				exec("/opt/vc/bin/vcgencmd measure_temp", function(error, stdout) {
					if (!error) {
						var lines = stdout.toString().split('\n');
						if (lines.length > 0 && lines[0].indexOf('=')) {
							result.main = parseFloat(lines[0].split("=")[1]);
							result.max = result.main
						}
					}
					callback(result)
				});

			}
		});
	}
	if (_darwin) {
		callback(result)
	}
}

exports.cpuTemperature = cpuTemperature;

// ----------------------------------------------------------------------------------
// 5. Memory
// ----------------------------------------------------------------------------------

// |                         R A M                          |          H D           |
// |_________________|__________________________|           |                        |
// |      active           buffers/cache        |           |                        |
// |____________________________________________|___________|_________|______________|
// |                   used                          free   |   used       free      |
// |________________________________________________________|________________________|
// |                        total                           |          swap          |
// |                                                        |                        |

function mem(callback) {
	if (_windows) {
		callback(NOT_SUPPORTED);
	}

	var result = {
		total : os.totalmem(),
		free : os.freemem(),
		used : os.totalmem() - os.freemem(),

		active : os.totalmem() - os.freemem(),
		buffcache : 0,

		swaptotal : 0,
		swapused : 0,
		swapfree : 0
	};

	if (_linux) {
		exec("free -b", function(error, stdout) {
			if (!error) {
				var lines = stdout.toString().split('\n');

				var mem = lines[1].replace(/ +/g, " ").split(' ');
				result.total = parseInt(mem[1]);
				result.free = parseInt(mem[3]);
				result.buffcache = parseInt(mem[5]) + parseInt(mem[6]);
				result.active = result.total - result.free - result.buffcache;

                if (lines.length === 4) mem = lines[2].replace(/ +/g, " ").split(' ');
                else mem = lines[3].replace(/ +/g, " ").split(' ');
				result.swaptotal = parseInt(mem[1]);
				result.swapfree = parseInt(mem[3]);
				result.swapused = parseInt(mem[2]);

			}
			callback(result);
		});
	}
	if (_darwin) {
		exec("vm_stat | grep 'Pages active'", function(error, stdout) {
			if (!error) {
				var lines = stdout.toString().split('\n');

				result.active = parseInt(lines[0].split(':')[1]) * 4096;
				result.buffcache = result.used - result.active;
			}
			exec("sysctl -n vm.swapusage", function(error, stdout) {
				if (!error) {
					var lines = stdout.toString().split('\n');
					if (lines.length > 0) {
						var line = lines[0].replace(/,/g, ".").replace(/M/g, "");
						line = line.trim().split('  ');
						for (var i = 0; i < line.length; i++) {
							if(line[i].toLowerCase().indexOf('total') != -1) result.swaptotal = parseFloat(line[i].split('=')[1].trim()) * 1024 * 1024;
							if(line[i].toLowerCase().indexOf('used') != -1) result.swapused = parseFloat(line[i].split('=')[1].trim()) * 1024 * 1024;
							if(line[i].toLowerCase().indexOf('free') != -1) result.swapfree = parseFloat(line[i].split('=')[1].trim()) * 1024 * 1024;

						}
					}
				}
				callback(result);
			});
		});
	}
}

exports.mem = mem;

// ----------------------------------------------------------------------------------
// 6. File System
// ----------------------------------------------------------------------------------

// --------------------------
// FS - devices

function fsSize(callback) {
	if (_windows) {
		callback(NOT_SUPPORTED);
	}

	exec("df -lk | grep ^/", function(error, stdout) {
		var data = [];
		if (!error) {
			var lines = stdout.toString().split('\n');
			//lines.splice(0, 1);
			lines.forEach(function (line) {
				if (line != '') {
					line = line.replace(/ +/g, " ").split(' ');
					data.push({
						'fs': line[0],
						'size': parseInt(line[1]) * 1024,
						'used': parseInt(line[2]) * 1024,
						'use': parseFloat((100.0 * line[2] / line[1]).toFixed(2)),
						'mount': line[line.length - 1]
					})
				}
			});
		}
		callback(data)
	});
}

exports.fsSize = fsSize;

// --------------------------
// FS - speed

function fsRWStats(callback) {
	if (_windows) {
		callback(NOT_SUPPORTED);
	}

	var result = {
		rx : -1,
		wx : -1,
		rx_sec : -1,
		wx_sec : -1
	};

	var bytes_read  = 0;
	var bytes_write = 0;
	var lines;

    if (_linux) {
//		exec("df -k | grep /dev/", function(error, stdout) {
		exec("lsblk | grep /", function(error, stdout) {
			if (!error) {
				lines = stdout.toString().split('\n');
				var fs_filter = [];
				lines.forEach(function (line) {
					if (line != '') {
						line = line.replace(/[├─│└]+/g, "").trim().split(' ');
						if (fs_filter.indexOf(line[0]) == -1) fs_filter.push(line[0])
					}
				});

				var output = fs_filter.join('|');
				exec("cat /proc/diskstats | egrep '" + output + "'", function (error, stdout) {
					if (!error) {
						lines = stdout.toString().split('\n');
						lines.forEach(function (line) {
							line = line.trim();
							if (line != '') {
								line = line.replace(/ +/g, " ").split(' ');

								bytes_read = bytes_read + parseInt(line[5]) * 512;
								bytes_write = bytes_write + parseInt(line[9]) * 512;
							}
						});
						if (_fs_speed && _fs_speed.ms) {
							var ms = Date.now() - _fs_speed.ms;

							result.rx = bytes_read;
							result.wx = bytes_write;
							result.rx_sec = (bytes_read - _fs_speed.bytes_read) / (ms / 1000);
							result.wx_sec = (bytes_write - _fs_speed.bytes_write) / (ms / 1000);
						} else {
							result.rx = bytes_read;
							result.wx = bytes_write;
							result.rx_sec = 0;
							result.wx_sec = 0;
						}
						_fs_speed.bytes_read = bytes_read;
						_fs_speed.bytes_write = bytes_write;
						_fs_speed.bytes_overall = bytes_read + bytes_write;
						_fs_speed.ms = Date.now();
					}

                    // call ƒ once more to compute fs speed
                    if (!ms) setTimeout(function(){
                        fsRWStats(callback);
                    }, 3000);
					else callback(result);
				});
			} else callback(result);
		})
	}
	if (_darwin) {
		exec("ioreg -c IOBlockStorageDriver -k Statistics -r -w0 | sed -n '/IOBlockStorageDriver/,/Statistics/p' | grep 'Statistics' | tr -d [:alpha:] | tr -d [:punct:] | awk '{print $3, $10}'", function(error, stdout) {
			if (!error) {
				lines = stdout.toString().split('\n');
				lines.forEach(function (line) {
					line = line.trim();
					if (line != '') {
						line = line.split(' ');

						bytes_read = bytes_read + parseInt(line[0]);
						bytes_write = bytes_write + parseInt(line[1]);
					}
				});

				if (_fs_speed && _fs_speed.ms) {
					var ms = Date.now() - _fs_speed.ms;
					result.rx = bytes_read;
					result.wx = bytes_write;
					result.rx_sec = (bytes_read - _fs_speed.bytes_read) / (ms / 1000);
					result.wx_sec = (bytes_write - _fs_speed.bytes_write) / (ms / 1000);
				} else {
					result.rx = bytes_read;
					result.wx = bytes_write;
					result.rx_sec = 0;
					result.wx_sec = 0;
				}
				_fs_speed.bytes_read = bytes_read;
				_fs_speed.bytes_write = bytes_write;
				_fs_speed.bytes_overall = bytes_read + bytes_write;
				_fs_speed.ms = Date.now();

                // call ƒ once more to compute fs speed
                if (!ms) setTimeout(function(){
                    fsRWStats(callback);
                }, 3000);
                else callback(result);
			} else callback(result);
		})
	}
}

function disksIO(callback) {
    var result = {
        rIO: 0,
        wIO: 0
    };

    // prints Block layer statistics for all mounted volumes
    var cmd = "for mount in `lsblk | grep / | sed -r 's/│ └─//' | cut -d ' ' -f 1`; do cat /sys/block/$mount/stat | sed -r 's/ +/;/g' | sed -r 's/^;//'; done";

    result.t = Date.now();
    exec(cmd, function(error, stdout) {
        if (!error) {
            var lines = stdout.split('\n');
            lines.forEach(function (line) {
                // ignore empty lines
                if (!line) return;

                // sum r/wIO of all disks to compute all disks IO
                var stats = line.split(';');
                result.rIO += parseInt(stats[0]);
                result.wIO += parseInt(stats[4]);
            });

            callback(result);
        } else {
            callback(result);
        }
    });
}

function diskIOPS(callback) {
    if (_windows || _darwin) {
		callback(NOT_SUPPORTED);
	}

    var result = {};
    disksIO(function(result) {
        var t0 = result.t;
        var rIO0 = result.rIO;
        var wIO0 = result.wIO;

        // it's not accurate under 3 sec (the more the better)
        setTimeout(function(){
            disksIO(function(result) {
                var tDiff = result.t - t0;
                var rDiff = result.rIO - rIO0;
                var wDiff = result.wIO - wIO0;

                var multiplier = 1000/tDiff;
                var rIOPS = rDiff * multiplier;
                var wIOPS = wDiff * multiplier;
                var totalIOPS = rIOPS + wIOPS;

                result.rIOPS = rIOPS;
                result.wIOPS = wIOPS;
                result.totalIOPS = totalIOPS;

                callback(result);
            });
        }, 3000);
    });
}

function fsStats(callback) {
	if (_windows) {
		callback(NOT_SUPPORTED);
	}

    var fsDatas = {};

    // use closure to track ƒ completion
    var functionProcessed = (function() {
        var totalFunctions = 2;

        return function() {
            if (--totalFunctions === 0) callback(fsDatas);
        };
    })();

    fsRWStats(function(result) {
        fsDatas.rx = result.rx;
        fsDatas.wx = result.wx;
        fsDatas.rx_sec = result.rx_sec;
        fsDatas.wx_sec = result.wx_sec;
        functionProcessed();
    });

    diskIOPS(function (result) {
        fsDatas.rIOPS = result.rIOPS;
        fsDatas.wIOPS = result.wIOPS;
        fsDatas.totalIOPS = result.totalIOPS;
        functionProcessed();
    });
}

exports.fsStats = fsStats;

// ----------------------------------------------------------------------------------
// 7. Network
// ----------------------------------------------------------------------------------

// --------------------------
// NET - interfaces

function networkInterfaces(callback) {
	var ifaces=os.networkInterfaces();
	var result = [];

	for (var dev in ifaces) {
  		var ip4 = '';
  		var ip6 = '';
		if (ifaces.hasOwnProperty(dev)) {
			ifaces[dev].forEach(function(details){
				if (details.family=='IPv4') {
					ip4 = details.address
				}
				if (details.family=='IPv6') {
					ip6 = details.address
				}
			});
			result.push({iface : dev, ip4 : ip4, ip6 : ip6})
		}
	}
	callback(result);
}

exports.networkInterfaces = networkInterfaces;

// --------------------------
// NET - Speed

function calcNetworkSpeed(iface, rx, tx) {
	var rx_sec = -1;
	var tx_sec = -1;
	if (_network[iface]) {
		var ms = Date.now() - _network[iface].ms;
		rx_sec = (rx - _network[iface].rx) / (ms / 1000);
		tx_sec = (tx - _network[iface].tx) / (ms / 1000);
	} else {
		_network[iface] = {};
	}
	_network[iface].rx = rx;
	_network[iface].tx = tx;
	_network[iface].ms = Date.now();
	return ({
		rx_sec : rx_sec,
		tx_sec : tx_sec
	})
}
function networkStats(iface, callback) {
	// fallback - if only callback is given
	if (isFunction(iface) && !callback) {
		callback = iface;
		iface = '';
	}
	iface = iface || (_darwin ? 'en0' : 'eth0');

	if (_windows) {
		callback(NOT_SUPPORTED);
	}

	var result = {
		iface : iface,
		operstate : 'unknown',
		rx: 0,
		tx: 0,
		rx_sec : -1,
		tx_sec : -1
	};

	var cmd, lines, stats, speed;

    if (_linux) {
    	if (fs.existsSync('/sys/class/net/'+ iface)) {
    		cmd =
    		"cat /sys/class/net/" + iface + "/operstate; " +
    		"cat /sys/class/net/" + iface + "/statistics/rx_bytes; " +
    		"cat /sys/class/net/" + iface + "/statistics/tx_bytes; ";
    		exec(cmd, function(error, stdout) {
    			if (!error) {
    				lines = stdout.toString().split('\n');
    				result.operstate = lines[0].trim();
					result.rx = parseInt(lines[1]);
					result.tx = parseInt(lines[2]);

					speed = calcNetworkSpeed(iface, result.rx, result.tx);

					result.rx_sec = speed.rx_sec;
					result.tx_sec = speed.tx_sec;
    			}

                // call ƒ once more to compute network speed
                if (result.rx_sec === -1) networkStats(iface, callback);
				else callback(result);
    		});
    	} else callback(result);
    }
	if (_darwin) {
		cmd = "ifconfig " + iface + " | grep 'status'";
		exec(cmd, function(error, stdout) {
			result.operstate = (stdout.toString().split(':')[1] || '').trim();
			result.operstate = (result.operstate || '').toLowerCase();
			result.operstate = (result.operstate == 'active' ? 'up' : (result.operstate == 'inactive' ? 'down' : 'unknown'));
			cmd = "netstat -bI " + iface;
			exec(cmd, function(error, stdout) {
				if (!error) {
					lines = stdout.toString().split('\n');
					// if there is less than 2 lines, no information for this interface was found
					if (lines.length > 1 && lines[1].trim() != '') {
						// skip header line
						// use the second line because it is tied to the NIC instead of the ipv4 or ipv6 address
						stats = lines[1].replace(/ +/g, " ").split(' ');
						result.rx = parseInt(stats[6]);
						result.tx = parseInt(stats[9]);

						speed = calcNetworkSpeed(iface, result.rx, result.tx);

						result.rx_sec = speed.rx_sec;
						result.tx_sec = speed.tx_sec;
					}
				}

                // call ƒ once more to compute network speed
                if (result.rx_sec === -1) networkStats(iface, callback);
				else callback(result);
			});
		});
    }
}

exports.networkStats = networkStats;

// --------------------------
// NET - connections (sockets)

function networkConnections(callback) {
	if (_windows) {
		callback(NOT_SUPPORTED);
	}

	var cmd = 'netstat -tun | tail -n +3 | wc -l';
	var result;
	exec(cmd, function(error, stdout) {
		if (!error) {
			result = parseInt(stdout.toString());
			callback(result);
		} else {
			cmd = 'ss -tun | tail -n +2 | wc -l';
			exec(cmd, function(error, stdout) {
				if (!error) {
					result = parseInt(stdout.toString());
				} else {
					result = -1;
				}
				callback(result);
			})
		}
	})
}

exports.networkConnections = networkConnections;

// ----------------------------------------------------------------------------------
// 8. Processes
// ----------------------------------------------------------------------------------

// --------------------------
// PS - current load - in %

function getLoad(callback) {
	var result = {};
	var loads = os.loadavg().map(function(x) { return x / _cores; } );
	result.avgload = parseFloat((Math.max.apply(Math, loads)).toFixed(2));
	result.currentload = -1;

	var cmd = (_darwin) ? "ps -caxm -o pcpu" : "ps axo pcpu";
	exec(cmd, function(error, stdout) {
		if (!error) {
			var lines = stdout.toString().replace(/,+/g, ".").split('\n');
			lines.shift();
			lines.pop();
			result.currentload = parseFloat(((lines.reduce(function (pv, cv) {
				return pv + parseFloat(cv.trim());
			}, 0)) / _cores).toFixed(2));
		}
		callback(result)
	});
}

function currentLoad(callback) {
	if (_windows) {
		callback(NOT_SUPPORTED);
	}

	if (_cores == 0) {
		cores(function() {
			getLoad(callback)
		})
	} else {
		getLoad(callback)
	}
}

exports.currentLoad = currentLoad;

// --------------------------
// PS - full load
// since bootup

function getFullLoad(callback) {
	if (_windows) {
		callback(NOT_SUPPORTED);
	}

	var result = {};
    if (_linux) {
    	if (fs.existsSync('/proc/uptime')) {
    		var output = fs.readFileSync('/proc/uptime').toString();
    		output = output.replace(/ +/g, " ").split(' ');
    		var uptime = parseFloat(output[0]);
    		var idletime = parseFloat(output[1]) / _cores;
    		result.fullload = (uptime - idletime) / uptime * 100.0;
    		callback(result);
    	}
    }
	if (_darwin) {
    	result.fullload = 0;
    	callback(result);
    }
}

function fullLoad(callback) {
	if (_cores == 0) {
		cores(function() {
			getFullLoad(callback)
		})
	} else {
		getFullLoad(callback)
	}
}

exports.fullLoad = fullLoad;


// --------------------------
// PS - services
// pass a comma separated string with services to check (mysql, apache, postgresql, ...)
// this function gives an array back, if the services are running.

function services(srv, callback) {
	// fallback - if only callback is given
	if (isFunction(srv) && !callback) {
		callback = srv;
		srv = '';
	}

	if (_windows) {
		callback(NOT_SUPPORTED);
	}

	srv = srv.trim().replace(/,+/g, " ").replace(/  +/g, " ").replace(/ +/g, "|");
	var srvs = srv.split('|');
    var comm = (_darwin) ? "ps -caxm -o pcpu,pmem,comm" : "ps axo pcpu,pmem,comm";
	var data = [];
	if (srv != '' && srvs.length > 0) {
		exec(comm + " | grep -v grep | egrep '" + srv + "'", function (error, stdout) {
			if (!error) {
				var lines = stdout.toString().replace(/ +/g, " ").replace(/,+/g, ".").split('\n');
				srvs.forEach(function (srv) {
					var ps = lines.filter(function (e) {
						return e.indexOf(srv) != -1
					});
					data.push({
						'name': srv,
						'running': ps.length > 0,
						'pcpu': parseFloat((ps.reduce(function (pv, cv) {
							return pv + parseFloat(cv.trim().split(' ')[0]);
						}, 0)).toFixed(2)),
						'pmem': parseFloat((ps.reduce(function (pv, cv) {
							return pv + parseFloat(cv.trim().split(' ')[1]);
						}, 0)).toFixed(2))
					})
				});
				callback(data)
			} else {
				srvs.forEach(function (srv) {
					data.push({
						'name': srv,
						'running': false,
						'pcpu': 0,
						'pmem': 0
					})
				});
				callback(data)
			}
		});
	} else callback(data)
}

exports.services = services;

// --------------------------
// running processes

function processes(callback) {
	if (_windows) {
		callback(NOT_SUPPORTED);
	}

	exec("ps aux | grep -v 'ps aux' | wc -l", function(error, stdout) {
		var result = {
			all: 0,
			running: 0,
			blocked: 0
		};

		if (!error) {
			result.all = parseInt(stdout.toString());
			if (_darwin) {
				exec("ps axo state | grep 'R' | wc -l; ps axo state | grep 'U' | wc -l", function(error, stdout) {
					if (!error) {
						var lines = stdout.toString().split('\n');
						result.running = parseInt(lines[0]);
						result.blocked = parseInt(lines[1]);
					}
					callback(result);
				})
			}
			if (_linux) {
				exec("cat /proc/stat | grep procs_", function(error, stdout) {
					if (!error) {
						var lines = stdout.toString().split('\n');
						lines.forEach(function(line) {
							if (line.toUpperCase().indexOf('PROCS_RUNNING') != -1) {
								result.running = parseInt(line.replace(/ +/g, " ").split(' ')[1]);
							}
							if (line.toUpperCase().indexOf('PROCS_BLOCKED') != -1) {
								result.blocked = parseInt(line.replace(/ +/g, " ").split(' ')[1]);
							}
						})
					}
					callback(result);
				})
			}
		} else {
			callback(result);
		}
	});
}

exports.processes = processes;

// --------------------------
// PS - process load
// get detailed information about a certain process
// (PID, CPU-Usage %, Mem-Usage %)

function processLoad(proc, callback) {
	// fallback - if only callback is given
	if (isFunction(proc) && !callback) {
		callback = proc;
		proc = '';
	}

	if (_windows) {
		callback(NOT_SUPPORTED);
	}

	var result = {
		'proc' : proc,
		'pid' : -1,
		'cpu' : 0,
		'mem' : 0
	};

	if (proc) {
		exec("ps aux | grep " + proc + " | grep -v grep", function(error, stdout) {
			if (!error) {
				var data = stdout.replace(/ +/g, " ").split(' ');

				if (data.length > 2) {
					result = {
						'proc' : proc,
						'pid' : data[1],
						'cpu' : parseFloat(data[2].replace(',', '.')),
						'mem' : parseFloat(data[3].replace(',', '.'))
					}
				}
			}
			callback(result);
		});
	} else callback(result);
}

exports.processLoad = processLoad;


// ----------------------------------------------------------------------------------
// 9. Users/Sessions
// ----------------------------------------------------------------------------------

// --------------------------
// array of users online = sessions

function users(callback) {
	if (_windows) {
		callback(NOT_SUPPORTED);
	}

	var result = [];
	exec("users", function(error, stdout) {
		if (!error) {
			result = stdout.toString().replace(/ +/g, " ").replace(/\n+/g, " ").trim().split(' ').filter(function(e) {return e.trim() !== ''});
		}
		callback(result);
	});
}

exports.users = users;

// ----------------------------------------------------------------------------------
// 10. Internet
// ----------------------------------------------------------------------------------

// --------------------------
// check if external site is available

function inetChecksite(url, callback) {
	if (_windows) {
		callback(NOT_SUPPORTED);
	}

	var result = {
		url: url,
		ok : false,
		status: 404,
		ms : -1
	};

	if (url && (isFunction(callback))) {
		var t = Date.now();
		var args = " -I --connect-timeout 5 -m 5 " + url + " 2>/dev/null | head -n 1 | cut -d ' ' -f2";
		var cmd = "curl";
		exec(cmd + args, function(error, stdout) {
			var statusCode = parseInt(stdout.toString());
			result.status = statusCode || 404;
			result.ok = !error && (statusCode == 200 || statusCode == 301 || statusCode == 302 || statusCode == 304);
			result.ms = (result.ok ? Date.now() - t : -1);
			callback(result);
		})
	} else {
		callback(result)
	}
}

exports.inetChecksite = inetChecksite;

// --------------------------
// check inet latency

function inetLatency(callback) {
	if (_windows) {
		callback(NOT_SUPPORTED);
	}

	var t = Date.now();
	var cmd;
	if (_linux) {
		cmd = "ping -c 2 -w 3 8.8.8.8 | grep rtt | cut -d'/' -f4 | awk '{ print $3 }'";
	}
	if (_darwin) {
		cmd = "ping -c 2 -t 3 8.8.8.8 | grep avg | cut -d'/' -f4 | awk '{ print $3 }'";
	}

	exec(cmd, function(error, stdout) {
		if (!error) {
			callback(parseFloat(stdout.toString()));
		} else {
			callback(-1)
		}
	})
}

exports.inetLatency = inetLatency;

// ----------------------------------------------------------------------------------
// 11. get all
// ----------------------------------------------------------------------------------

// --------------------------
// get static data - they should not change until restarted


function getStaticData(callback) {
	if (_windows) {
		callback(NOT_SUPPORTED);
	}

	var data = {};
	data.version = version();

	system(function(res) {
		data.system = res;
		osInfo(function(res) {
			data.os = res;
			cpu(function(res) {
				data.cpu = res;
				networkInterfaces(function(res) {
					data.net = res;
					callback(data);
				})
			})
		})
	})
}

exports.getStaticData = getStaticData;

// --------------------------
// get all dynamic data - e.g. for monitoring agents
// may take some seconds to get all data
// --------------------------
// 2 additional parameters needed
// - srv: 		comma separated list of services to monitor e.g. "mysql, apache, postgresql"
// - network:	define network for which you like to monitor network speed e.g. "eth0"

function getDynamicData(callback, srv, network) {
	if (_windows) {
		callback(NOT_SUPPORTED);
	}

	network = network || (_darwin ? 'en0' : 'eth0');
	srv = srv || '';

	var data = {};

    // use closure to track ƒ completion
    var functionProcessed = (function() {
        var totalFunctions = 12;

        return function() {
            if (--totalFunctions === 0) callback(data);
        };
    })();

	// get time
	data.time = time();
	data.node = process.versions.node;
	data.v8 = process.versions.v8;

	cpuCurrentspeed(function(res) {
		data.cpuCurrentspeed = res;
        functionProcessed();
    });

    users(function(res) {
		data.users = res;
        functionProcessed();
    });

	processes(function(res) {
		data.processes = res;
        functionProcessed();
    });

	currentLoad(function(res) {
		data.currentLoad = res;
        functionProcessed();
    });

	cpuTemperature(function(res) {
		data.temp = res;
        functionProcessed();
    });

    networkStats(network, function(res) {
		data.networkStats = res;
        functionProcessed();
    });

	networkConnections(function(res) {
		data.networkConnections = res;
        functionProcessed();
    });

	mem(function(res) {
		data.mem = res;
        functionProcessed();
    });

	services(srv, function(res) {
		data.services = res;
        functionProcessed();
    });

	fsSize(function(res) {
		data.fsSize = res;
        functionProcessed();
    });

	fsStats(function(res) {
		data.fsStats=res;
        functionProcessed();
    });

	inetLatency(function(res) {
		data.inetLatency = res;
        functionProcessed();
    });
}

exports.getDynamicData = getDynamicData;

// --------------------------
// get all data at once
// --------------------------
// 2 additional parameters needed
// - srv: 		comma separated list of services to monitor e.g. "mysql, apache, postgresql"
// - network:	define network for which you like to monitor network speed e.g. "eth0"

function getAllData(callback, srv, network) {
	if (_windows) {
		callback(NOT_SUPPORTED);
	}

	var data = {};

	getStaticData(function(res) {
		data = res;
		getDynamicData(function(res) {
			for(var key in res) {
				if (res.hasOwnProperty(key)) {
					data[key]=res[key];
				}
			}
			callback(data);
		}, srv, network);
	})
}

exports.getAllData = getAllData;
