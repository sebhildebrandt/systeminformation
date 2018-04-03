'use strict';
// ==================================================================================
// network.js
// ----------------------------------------------------------------------------------
// Description:   System Information - library
//                for Node.js
// Copyright:     (c) 2014 - 2018
// Author:        Sebastian Hildebrandt
// ----------------------------------------------------------------------------------
// License:       MIT
// ==================================================================================
// 9. Network
// ----------------------------------------------------------------------------------

const os = require('os');
const exec = require('child_process').exec;
const execSync = require('child_process').execSync;
const fs = require('fs');
const util = require('./util');

let _platform = process.platform;

const _linux = (_platform === 'linux');
const _darwin = (_platform === 'darwin');
const _windows = (_platform === 'win32');
const _freebsd = (_platform === 'freebsd');
const _openbsd = (_platform === 'openbsd');

const opts = {
  windowsHide: true
};

let _network = {};
let _default_iface;
let _mac = {};
let isIpAvailable;

function getDefaultNetworkInterface() {

  let ifaces = os.networkInterfaces();
  let ifacename = '';
  let scopeid = 9999;

  // fallback - "first" external interface (sorted by scopeid)
  for (let dev in ifaces) {
    if (ifaces.hasOwnProperty(dev)) {
      ifaces[dev].forEach(function (details) {
        if (details && details.internal === false && details.scopeid && details.scopeid < scopeid) {
          ifacename = dev;
          scopeid = details.scopeid;
        }
      });
    }
  }
  if (_linux || _darwin || _freebsd || _openbsd) {
    let cmd = '';
    if (_linux) cmd = 'route 2>/dev/null | grep default | awk \'{print $8}\'';
    if (_darwin) cmd = 'route get 0.0.0.0 2>/dev/null | grep interface: | awk \'{print $2}\'';
    if (_freebsd || _openbsd) cmd = 'route get 0.0.0.0 | grep interface:';
    let result = execSync(cmd);
    ifacename = result.toString().split('\n')[0];
    if (ifacename.indexOf(':') > -1) {
      ifacename = ifacename.split(':')[1].trim();
    }
  }

  if (ifacename) _default_iface = ifacename;
  return _default_iface;
}

exports.getDefaultNetworkInterface = getDefaultNetworkInterface;

function getMacAddresses() {
  let iface = '';
  let mac = '';
  let result = {};
  if (_linux || _freebsd || _openbsd) {
    if (typeof isIpAvailable === 'undefined') {
      if (fs.existsSync('/sbin/ip')) {
        isIpAvailable = true;
      } else {
        isIpAvailable = false;
      }
    }
    const cmd = 'export LC_ALL=C; /sbin/' + ((isIpAvailable) ? 'ip link show up' : 'ifconfig') + '; unset LC_ALL';
    let res = execSync(cmd);
    const lines = res.toString().split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i] && lines[i][0] !== ' ') {
        if (isIpAvailable) {
          let nextline = lines[i + 1].trim().split(' ');
          if (nextline[0] === 'link/ether') {
            iface = lines[i].split(' ')[1];
            iface = iface.slice(0, iface.length - 1);
            mac = nextline[1];
          }
        } else {
          iface = lines[i].split(' ')[0];
          mac = lines[i].split('HWaddr ')[1];
        }

        if (iface && mac) {
          result[iface] = mac.trim();
          iface = '';
          mac = '';
        }
      }
    }
  }
  if (_darwin) {
    const cmd = '/sbin/ifconfig';
    let res = execSync(cmd);
    const lines = res.toString().split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i] && lines[i][0] !== '\t' && lines[i].indexOf(':') > 0) {
        iface = lines[i].split(':')[0];
      } else if (lines[i].indexOf('\tether ') === 0) {
        mac = lines[i].split('\tether ')[1];
        if (iface && mac) {
          result[iface] = mac.trim();
          iface = '';
          mac = '';
        }
      }
    }
  }
  return result;
}

function networkInterfaceDefault(callback) {

  return new Promise((resolve) => {
    process.nextTick(() => {
      let result = getDefaultNetworkInterface();
      if (callback) { callback(result); }
      resolve(result);
    });
  });
}

exports.networkInterfaceDefault = networkInterfaceDefault;

// --------------------------
// NET - interfaces

function networkInterfaces(callback) {

  return new Promise((resolve) => {
    process.nextTick(() => {
      let ifaces = os.networkInterfaces();
      let result = [];

      for (let dev in ifaces) {
        let ip4 = '';
        let ip6 = '';
        let mac = '';
        if (ifaces.hasOwnProperty(dev)) {
          ifaces[dev].forEach(function (details) {
            if (details.family === 'IPv4') {
              ip4 = details.address;
            }
            if (details.family === 'IPv6') {
              if (!ip6 || ip6.match(/^fe80::/i)) {
                ip6 = details.address;
              }
            }
            mac = details.mac;
            if (mac.indexOf('00:00:0') > -1 && (_linux || _darwin)) {
              if (Object.keys(_mac).length === 0) {
                _mac = getMacAddresses();
              }
              mac = _mac[dev] || '';
            }
          });
          let internal = (ifaces[dev] && ifaces[dev][0]) ? ifaces[dev][0].internal : null;
          result.push({ iface: dev, ip4: ip4, ip6: ip6, mac: mac, internal: internal });
        }
      }
      if (callback) { callback(result); }
      resolve(result);
    });
  });
}

exports.networkInterfaces = networkInterfaces;

// --------------------------
// NET - Speed

function calcNetworkSpeed(iface, rx, tx, operstate) {
  let result = {
    iface: iface,
    operstate: operstate,
    rx: rx,
    tx: tx,
    rx_sec: -1,
    tx_sec: -1,
    ms: 0
  };

  if (_network[iface] && _network[iface].ms) {
    result.ms = Date.now() - _network[iface].ms;
    result.rx_sec = (rx - _network[iface].rx) >= 0 ? (rx - _network[iface].rx) / (result.ms / 1000) : 0;
    result.tx_sec = (tx - _network[iface].tx) >= 0 ? (tx - _network[iface].tx) / (result.ms / 1000) : 0;
    _network[iface].rx = rx;
    _network[iface].tx = tx;
    _network[iface].rx_sec = result.rx_sec;
    _network[iface].tx_sec = result.tx_sec;
    _network[iface].ms = Date.now();
    _network[iface].last_ms = result.ms;
    _network[iface].operstate = operstate;
  } else {
    if (!_network[iface]) _network[iface] = {};
    _network[iface].rx = rx;
    _network[iface].tx = tx;
    _network[iface].rx_sec = -1;
    _network[iface].tx_sec = -1;
    _network[iface].ms = Date.now();
    _network[iface].last_ms = 0;
    _network[iface].operstate = operstate;
  }
  return result;
}

function networkStats(iface, callback) {

  function parseLinesWindowsNics(sections) {
    let nics = [];
    for (let i in sections) {
      if (sections.hasOwnProperty(i)) {
        if (sections[i].trim() !== '') {

          let lines = sections[i].trim().split('\r\n');
          let netEnabled = util.getValue(lines, 'NetEnabled', '=');
          if (netEnabled) {
            nics.push({
              mac: util.getValue(lines, 'MACAddress', '=').toLowerCase(),
              name: util.getValue(lines, 'Name', '=').replace(/[()\[\] ]+/g, '').toLowerCase(),
              netEnabled: netEnabled === 'TRUE'
            });
          }
        }
      }
    }
    return nics;
  }

  function parseLinesWindowsPerfData(sections) {
    let perfData = [];
    for (let i in sections) {
      if (sections.hasOwnProperty(i)) {
        if (sections[i].trim() !== '') {

          let lines = sections[i].trim().split('\r\n');
          perfData.push({
            name: util.getValue(lines, 'Name', '=').replace(/[()\[\] ]+/g, '').toLowerCase(),
            rx: parseInt(util.getValue(lines, 'BytesReceivedPersec', '='), 10),
            tx: parseInt(util.getValue(lines, 'BytesSentPersec', '='), 10)
          });
        }
      }
    }
    return perfData;
  }


  // fallback - if only callback is given
  if (util.isFunction(iface) && !callback) {
    callback = iface;
    iface = '';
  }

  return new Promise((resolve) => {
    process.nextTick(() => {

      iface = iface || getDefaultNetworkInterface();

      let result = {
        iface: iface,
        operstate: 'unknown',
        rx: 0,
        tx: 0,
        rx_sec: -1,
        tx_sec: -1,
        ms: 0
      };

      let operstate = 'unknown';
      let rx = 0;
      let tx = 0;

      let cmd, lines, stats;
      if (!_network[iface] || (_network[iface] && !_network[iface].ms) || (_network[iface] && _network[iface].ms && Date.now() - _network[iface].ms >= 500)) {
        if (_linux) {
          if (fs.existsSync('/sys/class/net/' + iface)) {
            cmd =
              'cat /sys/class/net/' + iface + '/operstate; ' +
              'cat /sys/class/net/' + iface + '/statistics/rx_bytes; ' +
              'cat /sys/class/net/' + iface + '/statistics/tx_bytes; ';
            exec(cmd, function (error, stdout) {
              if (!error) {
                lines = stdout.toString().split('\n');
                operstate = lines[0].trim();
                rx = parseInt(lines[1]);
                tx = parseInt(lines[2]);

                result = calcNetworkSpeed(iface, rx, tx, operstate);

              }
              if (callback) { callback(result); }
              resolve(result);
            });
          } else {
            if (callback) { callback(result); }
            resolve(result);
          }
        }
        if (_freebsd || _openbsd) {
          cmd = 'netstat -ibnI ' + iface;
          exec(cmd, function (error, stdout) {
            if (!error) {
              lines = stdout.toString().split('\n');
              for (let i = 1; i < lines.length; i++) {
                const line = lines[i].replace(/ +/g, ' ').split(' ');
                if (line && line[0] && line[7] && line[10]) {
                  rx = rx + parseInt(line[7]);
                  tx = tx + parseInt(line[10]);
                  operstate = 'up';
                }
              }
              result = calcNetworkSpeed(iface, rx, tx, operstate);
            }
            if (callback) { callback(result); }
            resolve(result);
          });
        }
        if (_darwin) {
          cmd = 'ifconfig ' + iface + ' | grep "status"';
          exec(cmd, function (error, stdout) {
            result.operstate = (stdout.toString().split(':')[1] || '').trim();
            result.operstate = (result.operstate || '').toLowerCase();
            result.operstate = (result.operstate === 'active' ? 'up' : (result.operstate === 'inactive' ? 'down' : 'unknown'));
            cmd = 'netstat -bI ' + iface;
            exec(cmd, function (error, stdout) {
              if (!error) {
                lines = stdout.toString().split('\n');
                // if there is less than 2 lines, no information for this interface was found
                if (lines.length > 1 && lines[1].trim() !== '') {
                  // skip header line
                  // use the second line because it is tied to the NIC instead of the ipv4 or ipv6 address
                  stats = lines[1].replace(/ +/g, ' ').split(' ');
                  rx = parseInt(stats[6]);
                  tx = parseInt(stats[9]);

                  result = calcNetworkSpeed(iface, rx, tx, result.operstate);
                }
              }
              if (callback) { callback(result); }
              resolve(result);
            });
          });
        }
        if (_windows) {
          // NICs
          let perfData = [];
          let nics = [];
          cmd = util.getWmic() + ' nic get MACAddress, name, NetEnabled /value';
          exec(cmd, opts, function (error, stdout) {
            if (!error) {
              const nsections = stdout.split(/\n\s*\n/);
              nics = parseLinesWindowsNics(nsections);

              // Performance Data
              cmd = util.getWmic() + ' path Win32_PerfRawData_Tcpip_NetworkInterface Get name,BytesReceivedPersec,BytesSentPersec,BytesTotalPersec /value';
              exec(cmd, opts, function (error, stdout) {
                if (!error) {
                  const psections = stdout.split(/\n\s*\n/);
                  perfData = parseLinesWindowsPerfData(psections);
                }

                // Network Interfaces
                networkInterfaces().then(interfaces => {
                  // get mac from 'interfaces' by interfacename
                  let mac = '';
                  interfaces.forEach(detail => {
                    if (detail.iface === iface) {
                      mac = detail.mac;
                    }
                  });

                  // get name from 'nics' (by macadress)
                  let name = '';
                  nics.forEach(detail => {
                    if (detail.mac === mac) {
                      name = detail.name;
                      operstate = (detail.netEnabled ? 'up' : 'down');
                    }
                  });

                  // get bytes sent, received from perfData by name
                  rx = 0;
                  tx = 0;
                  perfData.forEach(detail => {
                    if (detail.name === name) {
                      rx = detail.rx;
                      tx = detail.tx;
                    }
                  });

                  if (rx && tx) {
                    result = calcNetworkSpeed(iface, parseInt(rx), parseInt(tx), operstate);
                  }
                  if (callback) { callback(result); }
                  resolve(result);
                });
              });
            }
          });
        }
      } else {
        result.rx = _network[iface].rx;
        result.tx = _network[iface].tx;
        result.rx_sec = _network[iface].rx_sec;
        result.tx_sec = _network[iface].tx_sec;
        result.ms = _network[iface].last_ms;
        result.operstate = _network[iface].operstate;
        if (callback) { callback(result); }
        resolve(result);
      }
    });
  });
}

exports.networkStats = networkStats;

// --------------------------
// NET - connections (sockets)

function networkConnections(callback) {

  return new Promise((resolve) => {
    process.nextTick(() => {
      let result = [];
      if (_linux || _freebsd || _openbsd) {
        let cmd = 'netstat -tuna | grep "ESTABLISHED\\|SYN_SENT\\|SYN_RECV\\|FIN_WAIT1\\|FIN_WAIT2\\|TIME_WAIT\\|CLOSE\\|CLOSE_WAIT\\|LAST_ACK\\|LISTEN\\|CLOSING\\|UNKNOWN\\|VERBUNDEN"';
        if (_freebsd || _openbsd) cmd = 'netstat -na | grep "ESTABLISHED\\|SYN_SENT\\|SYN_RECV\\|FIN_WAIT1\\|FIN_WAIT2\\|TIME_WAIT\\|CLOSE\\|CLOSE_WAIT\\|LAST_ACK\\|LISTEN\\|CLOSING\\|UNKNOWN\\|VERBUNDEN"';
        exec(cmd, function (error, stdout) {
          if (!error) {
            let lines = stdout.toString().split('\n');
            lines.forEach(function (line) {
              line = line.replace(/ +/g, ' ').split(' ');
              if (line.length >= 6) {
                let localip = line[3];
                let localport = '';
                let localaddress = line[3].split(':');
                if (localaddress.length > 1) {
                  localport = localaddress[localaddress.length - 1];
                  localaddress.pop();
                  localip = localaddress.join(':');
                }
                let peerip = line[4];
                let peerport = '';
                let peeraddress = line[4].split(':');
                if (peeraddress.length > 1) {
                  peerport = peeraddress[peeraddress.length - 1];
                  peeraddress.pop();
                  peerip = peeraddress.join(':');
                }
                let connstate = line[5];
                if (connstate === 'VERBUNDEN') connstate = 'ESTABLISHED';
                if (connstate) {
                  result.push({
                    protocol: line[0],
                    localaddress: localip,
                    localport: localport,
                    peeraddress: peerip,
                    peerport: peerport,
                    state: connstate
                  });
                }
              }
            });
            if (callback) {
              callback(result);
            }
            resolve(result);
          } else {
            cmd = 'ss -tuna | grep "ESTAB\\|SYN-SENT\\|SYN-RECV\\|FIN-WAIT1\\|FIN-WAIT2\\|TIME-WAIT\\|CLOSE\\|CLOSE-WAIT\\|LAST-ACK\\|LISTEN\\|CLOSING"';
            exec(cmd, function (error, stdout) {

              if (!error) {
                let lines = stdout.toString().split('\n');
                lines.forEach(function (line) {
                  line = line.replace(/ +/g, ' ').split(' ');
                  if (line.length >= 6) {
                    let localip = line[4];
                    let localport = '';
                    let localaddress = line[4].split(':');
                    if (localaddress.length > 1) {
                      localport = localaddress[localaddress.length - 1];
                      localaddress.pop();
                      localip = localaddress.join(':');
                    }
                    let peerip = line[5];
                    let peerport = '';
                    let peeraddress = line[5].split(':');
                    if (peeraddress.length > 1) {
                      peerport = peeraddress[peeraddress.length - 1];
                      peeraddress.pop();
                      peerip = peeraddress.join(':');
                    }
                    let connstate = line[1];
                    if (connstate === 'ESTAB') connstate = 'ESTABLISHED';
                    if (connstate === 'TIME-WAIT') connstate = 'TIME_WAIT';
                    if (connstate) {
                      result.push({
                        protocol: line[0],
                        localaddress: localip,
                        localport: localport,
                        peeraddress: peerip,
                        peerport: peerport,
                        state: connstate
                      });
                    }
                  }
                });
              }
              if (callback) {
                callback(result);
              }
              resolve(result);
            });
          }
        });
      }
      if (_darwin) {
        let cmd = 'netstat -nat | grep "ESTABLISHED\\|SYN_SENT\\|SYN_RECV\\|FIN_WAIT1\\|FIN_WAIT2\\|TIME_WAIT\\|CLOSE\\|CLOSE_WAIT\\|LAST_ACK\\|LISTEN\\|CLOSING\\|UNKNOWN"';
        exec(cmd, function (error, stdout) {
          if (!error) {

            let lines = stdout.toString().split('\n');

            lines.forEach(function (line) {
              line = line.replace(/ +/g, ' ').split(' ');
              if (line.length >= 6) {
                let localip = line[3];
                let localport = '';
                let localaddress = line[3].split('.');
                if (localaddress.length > 1) {
                  localport = localaddress[localaddress.length - 1];
                  localaddress.pop();
                  localip = localaddress.join('.');
                }
                let peerip = line[4];
                let peerport = '';
                let peeraddress = line[4].split('.');
                if (peeraddress.length > 1) {
                  peerport = peeraddress[peeraddress.length - 1];
                  peeraddress.pop();
                  peerip = peeraddress.join('.');
                }
                let connstate = line[5];
                if (connstate) {
                  result.push({
                    protocol: line[0],
                    localaddress: localip,
                    localport: localport,
                    peeraddress: peerip,
                    peerport: peerport,
                    state: connstate
                  });
                }
              }
            });
            if (callback) {
              callback(result);
            }
            resolve(result);
          }
        });
      }
      if (_windows) {
        let cmd = 'netstat -na';
        exec(cmd, opts, function (error, stdout) {
          if (!error) {

            let lines = stdout.toString().split('\r\n');

            lines.forEach(function (line) {
              line = line.trim().replace(/ +/g, ' ').split(' ');
              if (line.length >= 4) {
                let localip = line[1];
                let localport = '';
                let localaddress = line[1].split(':');
                if (localaddress.length > 1) {
                  localport = localaddress[localaddress.length - 1];
                  localaddress.pop();
                  localip = localaddress.join(':');
                }
                let peerip = line[2];
                let peerport = '';
                let peeraddress = line[2].split(':');
                if (peeraddress.length > 1) {
                  peerport = peeraddress[peeraddress.length - 1];
                  peeraddress.pop();
                  peerip = peeraddress.join(':');
                }
                let connstate = line[3];
                if (connstate === 'HERGESTELLT') connstate = 'ESTABLISHED';
                if (connstate.startsWith('ABH')) connstate = 'LISTEN';
                if (connstate === 'SCHLIESSEN_WARTEN') connstate = 'CLOSE_WAIT';
                if (connstate === 'WARTEND') connstate = 'TIME_WAIT';
                if (connstate === 'SYN_GESENDET') connstate = 'SYN_SENT';

                if (connstate === 'LISTENING') connstate = 'LISTEN';
                if (connstate === 'SYN_RECEIVED') connstate = 'SYN_RECV';
                if (connstate === 'FIN_WAIT_1') connstate = 'FIN_WAIT1';
                if (connstate === 'FIN_WAIT_2') connstate = 'FIN_WAIT2';
                if (connstate) {
                  result.push({
                    protocol: line[0].toLowerCase(),
                    localaddress: localip,
                    localport: localport,
                    peeraddress: peerip,
                    peerport: peerport,
                    state: connstate
                  });
                }
              }
            });
            if (callback) {
              callback(result);
            }
            resolve(result);
          }
        });
      }
    });
  });
}

exports.networkConnections = networkConnections;
