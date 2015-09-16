// ==================================================================================
// sysinfo.js
// ----------------------------------------------------------------------------------
// Description:   System Information - library
//                for Node.js
// Copyright:     (c) 2014 - 2015
// Author:        Sebastian Hildebrandt
// ----------------------------------------------------------------------------------
// License:       MIT
// ==================================================================================
//
// Sections
// --------------------------------
// 1. Operating System
// 2. CPU
// 3. Memory
// 4. File System
// 5. Network
// 6. Processes
// 7. Users
// 8. Internet
// 
// ==================================================================================
//
// Installation
// --------------------------------
// At the time of writing, this library is dependent on the "request" module, 
// which needs to be installed seperately. I created a npm package.json file, 
// to be able to install it easily:
//
// npm install
// 
// ==================================================================================
//
// Usage
// --------------------------------
// All functions are asynchronous functions. Here a small example how to use them:
// 
// var sysinfo = require('./sysinfo.js');
// 
// sysinfo.cpu(function(data) {
//	  console.log('CPU-Information:');
//	  console.log(data);
// })
// 
// ==================================================================================
//
// Comments
// --------------------------------
// This library is work in progress. It is quite "fresh" - means, there might be a 
// lot of inconsoistencies or even bugs. I was only able to test it on some 
// Debian and Ubuntu distributions as well as OSX (Maveriks).
//
// Comments, suggestions & reports are very wellcome!
//
// ==================================================================================
//
// Version history
// --------------------------------
// Verion 0.0.2 - 14.03.2014 - Optimization FS-Speed & CPU current speed
//
// Verion 0.0.1 - 13.03.2014 - initial release
//
// ==================================================================================

// ----------------------------------------------------------------------------------
// Dependencies
// ----------------------------------------------------------------------------------

var os = require('os')
  , exec = require('child_process').exec
  , fs = require('fs')
  , request = require('request');

var tmp_cores = 0;
var tmp_platform = os.type();
var tmp_network = {};
var tmp_cpu_speed = 0;
var tmp_fs_speed = {};

exports.time = function() {
	result = {
		current : Date.now(),
		uptime  : os.uptime()
	}
	return result;
}

// ----------------------------------------------------------------------------------
// 1. Operating System
// ----------------------------------------------------------------------------------

// --------------------------
// Get logo filename of OS distribution

function getLogoFile(distro) {
	result = 'linux';
	if (distro.toLowerCase().indexOf('mac os') != -1) { result = 'apple' } else
	if (distro.toLowerCase().indexOf('arch') != -1)	{ result = 'arch' } else
	if (distro.toLowerCase().indexOf('centos') != -1)	{ result = 'centos' } else
	if (distro.toLowerCase().indexOf('debian') != -1)	{ result = 'debian' } else
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
	if (distro.toLowerCase().indexOf('reactos') != -1)	{ result = 'reactos' } else
	if (distro.toLowerCase().indexOf('redhat') != -1)	{ result = 'redhat' } else
	if (distro.toLowerCase().indexOf('slackware') != -1)	{ result = 'slackware' } else
	if (distro.toLowerCase().indexOf('suse') != -1)	{ result = 'suse' } else
	if (distro.toLowerCase().indexOf('xubuntu') != -1)	{ result = 'xubuntu' } else
	if (distro.toLowerCase().indexOf('ubuntu') != -1)	{ result = 'ubuntu' }
	return result;
}

// --------------------------
// OS Information

exports.osinfo =function(callback) {

	var result = {

    	platform : tmp_platform,
    	distro : 'unknown',
    	release : 'unknown',
    	codename : '',
    	kernel : os.release(),
    	arch : os.arch(),
    	hostname : os.hostname(),
    	logofile : ''
	}

    if (result.platform == 'Linux') {

    	exec("cat /etc/*-release", function(error, stdout, stderr) {
			if (!error) {
				var lines = stdout.toString().split('\n');
	            lines.forEach(function(line) {
    	            if (line.toUpperCase().indexOf('DISTRIB_ID') != -1) {
        	        	result.distro = line.split('=')[1].trim();
            	    	result.logofile = getLogoFile(result.distro);
                	}
                	if (line.toUpperCase().indexOf('DISTRIB_RELEASE') != -1) result.release = line.split('=')[1].trim();
                	if (line.toUpperCase().indexOf('DISTRIB_CODENAME') != -1) result.codename = line.split('=')[1].trim();
            	})
	        }
	    	callback(result);
	    })
    } else if (result.platform == 'Darwin') {
    	exec("sw_vers", function(error, stdout, stderr) {
    		var lines = stdout.toString().split('\n');
    		lines.forEach(function(line) {
    			if (line.indexOf('ProductName') != -1) {
                	result.distro = line.split(':')[1].trim();
                	result.logofile = getLogoFile(result.distro);
                }    			
    			if (line.indexOf('ProductVersion') != -1) result.release = line.split(':')[1].trim();
    		})
    		callback(result);
    	})
    } else callback(result);
}

// ----------------------------------------------------------------------------------
// 2. CPU
// ----------------------------------------------------------------------------------

// --------------------------
// CPU - brand, speed

function getcpu(callback) {
	var result = {
		brand : 'unknown',
		speed : 'unknown',
		cores : tmp_cores
	};
	// grep "^model name" /proc/cpuinfo 2>/dev/null || sysctl -n machdep.cpu.brand_string
	if (tmp_platform == 'Darwin') {
		exec("sysctl -n machdep.cpu.brand_string", function(error, stdout, stderr) {
			if (!error) {
				var lines = stdout.toString().split('\n');
				result.brand = lines[0].split('@')[0].trim();
				result.speed = lines[0].split('@')[1].trim();
    		}

    		callback(result);
    	});
	} else {
		exec("cat /proc/cpuinfo | grep 'model name'", function(error, stdout, stderr) {
			if (!error) {
				var lines = stdout.toString().split('\n');
				var line = lines[0].split(':')[1];
				result.brand = line.split('@')[0].trim();
				result.speed = line.split('@')[1].trim();
				tmp_cpu_speed = parseFloat(result.speed) * 1000000000;
    		}

    		callback(result);
    	});
	}
}

// --------------------------
// CPU - Processor cores

function cores(callback) {
	exec("grep -c ^processor /proc/cpuinfo 2>/dev/null || sysctl -n hw.ncpu", function(error, stdout, stderr) {
		var result = {cores: 1};
		if (!error) {
			result.cores = parseInt(stdout.toString());
			tmp_cores = result.cores;
    	}
    	if (callback) callback(result);
  });
}

// --------------------------
// CPU - Processor Data

exports.cpu = function(callback) {
	if (tmp_cores == 0) {
		cores(function(data) {
			getcpu(callback)
		})
	} else {
		getcpu(callback)
	}
}

// --------------------------
// CPU - current speed

exports.cpu_currentspeed = function(callback) {
	var result = {current : tmp_cpu_speed};
	if (tmp_platform == 'Darwin') {
		exec("sysctl -n hw.cpufrequency", function(error, stdout, stderr) {
			if (!error) {
				var lines = stdout.toString().split('\n');
				result = parseInt(lines[0]);
    		}
    		callback(result);
    	});
	} else {
		var output = "";
		if (fs.existsSync("/sys/devices/system/cpu/cpu0/cpufreq/cpuinfo_cur_freq")) {
			output = fs.readFileSync("/sys/devices/system/cpu/cpu0/cpufreq/cpuinfo_cur_freq").toString();
		} else if (fs.existsSync("/sys/devices/system/cpu/cpu0/cpufreq/scaling_cur_freq")) {
			output = fs.readFileSync("/sys/devices/system/cpu/cpu0/cpufreq/scaling_cur_freq").toString();
		}
		if (output.trim()) {
			var lines = output.toString().split('\n');
			result = parseInt(lines[0]) * 1000;
		}
    	callback(result);
	}
}

// --------------------------
// CPU - temperature 
// if sensors are installed

exports.cpu_temperature = function(callback) {
	var result = {
		main : 0.0,
		cores : []
	}
    if (tmp_platform == 'Linux') {
		var regex = /\+([^°]*)/g;
		exec("sensors", function(error, stdout, stderr) {
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
				})
	    	}
	    	callback(result)
		});
	} else {
		callback(result)
	}
};


// ----------------------------------------------------------------------------------
// 3. Memory
// ----------------------------------------------------------------------------------

// |                         R A M                          |          H D           |
// |_________________|__________________________|           |                        |
// |      active           buffers/cache        |           |                        |
// |____________________________________________|___________|_________|______________|
// |                   used                          free   |   used       free      |
// |________________________________________________________|________________________|
// |                        total                           |          swap          |
// |                                                        |                        |

exports.mem = function(callback) {

	var result = {
		total : os.totalmem(),
		free : os.freemem(),
		used : os.totalmem() - os.freemem(),

		active : os.totalmem() - os.freemem(),
		buffcache : 0,

		swaptotal : 0,
		swapused : 0,
		swapfree : 0
	}

	if (tmp_platform == 'Linux') {
		exec("free -b", function(error, stdout, stderr) {
			if (!error) {
				var lines = stdout.toString().split('\n');

				var mem = lines[1].replace(/ +/g, " ").split(' ');
				result.total = parseInt(mem[1]);
				result.free = parseInt(mem[3]);
				result.buffcache = parseInt(mem[5]) + parseInt(mem[6]);
				result.active = result.total - result.free - result.buffcache

				var mem = lines[3].replace(/ +/g, " ").split(' ');
				result.swaptotal = parseInt(mem[1]);
				result.swapfree = parseInt(mem[3]);
				result.swapused = parseInt(mem[2]);

				callback(result);	
			} else {
				callback(result);
			}
		});  
	} else {
		exec("vm_stat | grep 'Pages active'", function(error, stdout, stderr) {
			if (!error) {
				var lines = stdout.toString().split('\n');

				result.active = parseInt(lines[0].split(':')[1]) * 4096;
				result.buffcache = result.used - result.active;
				callback(result);	
			} else {
				callback(result);
			}
		});  	
	}
}

// ----------------------------------------------------------------------------------
// 4. File System
// ----------------------------------------------------------------------------------

// --------------------------
// FS - devices

exports.fs_size = function(callback) {
	exec("df -lk | grep ^/", function(error, stdout, stderr) {
		var lines = stdout.toString().split('\n');
		//lines.splice(0, 1);
		var data = [];
		lines.forEach(function(line) {
			if (line != '') {
				var line = line.replace(/ +/g, " ").split(' ');
				data.push({
					'fs': line[0],
					'size': parseInt(line[1])*1024,
					'used': parseInt(line[2])*1024,
					'use': 1.0 * line[2] / line[1],
					'mount': line[line.length-1]
				})
			}
		})
		callback(data)
	});  
}

// --------------------------
// FS - speed

exports.fs_speed = function(callback) {
	var result = {
    	read_sec : -1,
    	write_sec : -1
	}
	var bytes_read  = 0;
	var bytes_write = 0;

    if (tmp_platform == 'Linux') {
//		exec("df -k | grep /dev/ | cut -d' ' -f1 | sed 's/\/dev\///g' | sed ':a;N;$!ba;s/\n/|/g'", function(error, stdout, stderr) {
		exec("df -k | grep /dev/", function(error, stdout, stderr) {
			var lines = stdout.toString().split('\n');
			var fs_filter = [];
			lines.forEach(function(line) {
				if (line != '') {
					var line = line.replace(/ +/g, " ").split(' ');
					fs_filter.push(line[0].replace(/\/dev\/+/g, ""))
    			}
    		});

			var output = fs_filter.join('|')
			exec("cat /proc/diskstats | egrep '" + output + "'", function(error, stdout, stderr) {
				var lines = stdout.toString().split('\n');
				lines.forEach(function(line) {
					line = line.trim();
					if (line != '') {
						var line = line.replace(/ +/g, " ").split(' ');

    					bytes_read  = bytes_read  + parseInt(line[5]) * 512;
    					bytes_write = bytes_write + parseInt(line[9]) * 512;
    				}
    			});
				if (tmp_fs_speed && tmp_fs_speed.ms) {
    				var ms = Date.now() - tmp_fs_speed.ms;
    				result.read_sec  = (bytes_read  - tmp_fs_speed.bytes_read)  / (ms / 1000);
	    			result.write_sec = (bytes_write - tmp_fs_speed.bytes_write) / (ms / 1000);
    			} else {
    				result.read_sec = 0;
    				result.write_sec = 0;
	    		}
    			tmp_fs_speed.bytes_read  = bytes_read;
    			tmp_fs_speed.bytes_write = bytes_write;
    			tmp_fs_speed.ms = Date.now();

	    		callback(result);
			})
		})
	} else {
		callback(result)
	}
}

// ----------------------------------------------------------------------------------
// 5. Network
// ----------------------------------------------------------------------------------

// --------------------------
// NET - interfaces

exports.network_interfaces = function(callback) {
	var ifaces=os.networkInterfaces();
	result = [];
	for (var dev in ifaces) {
  		var alias=0;
  		var ip4 = '';
  		var ip6 = '';
  		ifaces[dev].forEach(function(details){
    		if (details.family=='IPv4') {
    			ip4 = details.address
    		}
    		if (details.family=='IPv6') {
    			ip6 = details.address
    		}
  		});
		++alias;
    	//result.push({iface : dev+(alias?':'+alias:''), ip4 : ip4, ip6 : ip6})
    	result.push({iface : dev, ip4 : ip4, ip6 : ip6})
	}	
	callback(result);
}

// --------------------------
// NET - Speed

exports.network_speed = function(interface, callback) {
	var iface = interface || 'eth0';
    if (tmp_platform == 'Linux') {
    	if (fs.existsSync('/sys/class/net/'+ iface)) {
    		var cmd =
    		"cat /sys/class/net/" + iface + "/operstate; " +
    		"cat /sys/class/net/" + iface + "/statistics/rx_bytes; " +
    		"cat /sys/class/net/" + iface + "/statistics/tx_bytes; "
    		exec(cmd, function(error, stdout, stderr) {
    			if (!error) {
    				var lines = stdout.toString().split('\n');
    				var operstate = lines[0].trim();
    				var rx = parseInt(lines[1]);
    				var tx = parseInt(lines[2]);
    				
    				if (tmp_network["iface"]) {
    					var ms = Date.now() - tmp_network["iface"].ms;
    					rx_sec = (rx - tmp_network["iface"].rx) / (ms / 1000);
    					tx_sec = (tx - tmp_network["iface"].tx) / (ms / 1000);
    				} else {
    					rx_sec = 0;
    					tx_sec = 0;
    					tmp_network["iface"] = {};
    				}
    				tmp_network["iface"].rx = rx;
    				tmp_network["iface"].tx = tx;
    				tmp_network["iface"].ms = Date.now();

    				callback({
    					operstate : operstate,
    					rx_sec : rx_sec,
    					tx_sec : tx_sec
    				});
    			}
    		});
    	} else callback(null);
    } else {
        var cmd = "netstat -ibI " + iface;
        exec(cmd, function(error, stdout, stderr) {
            if (!error) {
                var lines = stdout.toString().split('\n');
                // if there is less than 2 lines, no information for this interface was found
                if (lines.length > 1) {
                    // skip header line
                    // TODO: operstate
                    // use the second line because it is tied to the NIC instead of the ipv4 or ipv6 address
                    var stats = lines[1].replace(/ +/g, " ").split(' ');
                    var rx = parseInt(stats[6]);
                    var tx = parseInt(stats[9]);

                    if (tmp_network["iface"]) {
                        var ms = Date.now() - tmp_network["iface"].ms;
                        rx_sec = (rx - tmp_network["iface"].rx) / (ms / 1000);
                        tx_sec = (tx - tmp_network["iface"].tx) / (ms / 1000);
                    } else {
                        rx_sec = 0;
                        tx_sec = 0;
                        tmp_network["iface"] = {};
                    }
                    tmp_network["iface"].rx = rx;
                    tmp_network["iface"].tx = tx;
                    tmp_network["iface"].ms = Date.now();

                    callback({
                        rx_sec : rx_sec,
                        tx_sec : tx_sec
                    });
                }
            }
        });
    } else callback(null);
}


// ----------------------------------------------------------------------------------
// 6. Processes
// ----------------------------------------------------------------------------------

// --------------------------
// PS - current load

function getload(callback) {
	var result = {};
	var loads = os.loadavg().map(function(x) { return x / tmp_cores; } );
	result.avgload = (Math.max.apply(Math, loads)).toFixed(2);
	var comm = (tmp_platform == 'Darwin') ? "ps -caxm -o pcpu" : "ps axo pcpu"
	exec(comm, function(error, stdout, stderr) {
		var lines = stdout.toString().replace(/,+/g, ".").split('\n');
		lines.splice(0, 1)
		lines.pop()
		result.currentload = ((lines.reduce(function(pv, cv) { return pv + parseFloat(cv.trim()); }, 0)) / tmp_cores),
		callback(result)
	});  
}

exports.currentload = function(callback) {
	if (tmp_cores == 0) {
		cores(function(data) {
			getload(callback)
		})
	} else {
		getload(callback)
	}
}

// --------------------------
// PS - full load 
// since bootup

function getfullload(callback) {
	var result = {};
    if (tmp_platform == 'Linux') {
    	if (fs.existsSync('/proc/uptime')) {
    		var output = fs.readFileSync('/proc/uptime').toString();
    		output = output.replace(/ +/g, " ").split(' ');
    		var uptime = parseFloat(output[0])
    		var idletime = parseFloat(output[1]) / tmp_cores;
    		result.fullload = (uptime - idletime) / uptime * 100.0
    		callback(result);
    	}
    } else {
    	result.fullload = 0;
    	callback(result);
    }
}

exports.fullload = function(callback) {
	if (tmp_cores == 0) {
		cores(function(data) {
			getfullload(callback)
		})
	} else {
		getfullload(callback)
	}
}


// --------------------------
// PS - services
// pass a koma separated string with services to check (mysql, apache, postgresql, ...) 
// this function gives an array back, if the services are running.

exports.services = function(srv, callback) {
	var srv = srv.replace(/ +/g, "").replace(/,+/g, "|")
    var comm = (tmp_platform == 'Darwin') ? "ps -caxm -o pcpu,pmem,comm" : "ps axo pcpu,pmem,comm"
	exec(comm + " | grep -v grep | egrep '" + srv + "'", function(error, stdout, stderr) {
		var lines = stdout.toString().replace(/ +/g, " ").replace(/,+/g, ".").split('\n');
		var srvs = srv.split('|');
		var data = [];
		srvs.forEach(function(srv) {
			var ps = lines.filter(function(e) {return e.indexOf(srv) != -1});
			data.push({
				'service': srv,
				'running': ps.length > 0,
				'pcpu' : (ps.reduce(function(pv, cv) { return pv + parseFloat(cv.trim().split(' ')[0]); }, 0)).toFixed(2),
				'pmem' : (ps.reduce(function(pv, cv) { return pv + parseFloat(cv.trim().split(' ')[1]); }, 0)).toFixed(2)
			})
		})
		callback(data)
	});  
}

// --------------------------
// running processes

exports.processes = function(callback) {
	exec("ps aux | grep -v 'ps aux' | wc -l", function(error, stdout, stderr) {
		var result = {
			all: 0,
			running: 0,
			blocked: 0
		};
		if (!error) {
			result.all = parseInt(stdout.toString());
			if (tmp_platform == 'Darwin') {
				exec("ps axo state | grep 'R' | wc -l; ps axo state | grep 'U' | wc -l", function(error, stdout, stderr) {
					if (!error) {
						var lines = stdout.toString().split('\n');
						result.running = parseInt(lines[0]);
						result.blocked = parseInt(lines[1]);
					}
					callback(result);
				})
			} else {
				exec("cat /proc/stat | grep procs_", function(error, stdout, stderr) {
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

// --------------------------
// PS - process load 
// get detailed information about a certain process 
// (PID, CPU-Usage %, Mem-Usage %)

exports.processload = function(proc, callback) {
	exec("ps aux | grep " + proc + " | grep -v grep", function(error, stdout, stderr) {
		var result = {
				'proc' : proc,
				'pid' : -1,
				'cpu' : 0,
				'mem' : 0
			};
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
}


// ----------------------------------------------------------------------------------
// 7. Users
// ----------------------------------------------------------------------------------

// --------------------------
// array of users online

exports.users = function(callback) {
	result = {};
	result.users = [];
	exec("users", function(error, stdout, stderr) {
		if (!error) {
			result.users = stdout.toString().replace(/ +/g, " ").replace(/\n+/g, " ").trim().split(' ').filter(function(e) {return e.trim() !== ''});
		}
		callback(result);
	});  
}

// ----------------------------------------------------------------------------------
// 8. Internet
// ----------------------------------------------------------------------------------

// --------------------------
// check if external site is available 

exports.checksite = function(url, callback) {
	var t = Date.now();
	request(url, function (error, response, body) {
  		callback({
  			ok : !error && (response.statusCode == 200 || response.statusCode == 301 || response.statusCode == 302 || response.statusCode == 304),
  			response_ms : Date.now() - t
  		});
	})
}
