'use strict';
// ==================================================================================
// osinfo.js
// ----------------------------------------------------------------------------------
// Description:   System Information - library
//                for Node.js
// Copyright:     (c) 2014 - 2018
// Author:        Sebastian Hildebrandt
// ----------------------------------------------------------------------------------
// License:       MIT
// ==================================================================================
// 3. Operating System
// ----------------------------------------------------------------------------------

const os = require('os');
const exec = require('child_process').exec;
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

const NOT_SUPPORTED = 'not supported';

// --------------------------
// Get current time and OS uptime

function time() {
  let t = new Date().toString().split(' ');

  return {
    current: Date.now(),
    uptime: os.uptime(),
    timezone: (t.length >= 7) ? t[5] : '',
    timezoneName: (t.length >= 7) ? t.slice(6).join(' ').replace(/\(/g, '').replace(/\)/g, '') : ''
  };
}

exports.time = time;

// --------------------------
// Get logo filename of OS distribution

function getLogoFile(distro) {
  distro = distro || '';
  distro = distro.toLowerCase();
  let result = 'linux';
  if (_windows) {
    result = 'windows';
  }
  else if (distro.indexOf('mac os') !== -1) {
    result = 'apple';
  }
  else if (distro.indexOf('arch') !== -1) {
    result = 'arch';
  }
  else if (distro.indexOf('centos') !== -1) {
    result = 'centos';
  }
  else if (distro.indexOf('coreos') !== -1) {
    result = 'coreos';
  }
  else if (distro.indexOf('debian') !== -1) {
    result = 'debian';
  }
  else if (distro.indexOf('deepin') !== -1) {
    result = 'deepin';
  }
  else if (distro.indexOf('elementary') !== -1) {
    result = 'elementary';
  }
  else if (distro.indexOf('fedora') !== -1) {
    result = 'fedora';
  }
  else if (distro.indexOf('gentoo') !== -1) {
    result = 'gentoo';
  }
  else if (distro.indexOf('mageia') !== -1) {
    result = 'mageia';
  }
  else if (distro.indexOf('mandriva') !== -1) {
    result = 'mandriva';
  }
  else if (distro.indexOf('manjaro') !== -1) {
    result = 'manjaro';
  }
  else if (distro.indexOf('mint') !== -1) {
    result = 'mint';
  }
  else if (distro.indexOf('openbsd') !== -1) {
    result = 'openbsd';
  }
  else if (distro.indexOf('freebsd') !== -1) {
    result = 'freebsd';
  }
  else if (distro.indexOf('opensuse') !== -1) {
    result = 'opensuse';
  }
  else if (distro.indexOf('pclinuxos') !== -1) {
    result = 'pclinuxos';
  }
  else if (distro.indexOf('puppy') !== -1) {
    result = 'puppy';
  }
  else if (distro.indexOf('raspbian') !== -1) {
    result = 'raspbian';
  }
  else if (distro.indexOf('reactos') !== -1) {
    result = 'reactos';
  }
  else if (distro.indexOf('redhat') !== -1) {
    result = 'redhat';
  }
  else if (distro.indexOf('slackware') !== -1) {
    result = 'slackware';
  }
  else if (distro.indexOf('sugar') !== -1) {
    result = 'sugar';
  }
  else if (distro.indexOf('steam') !== -1) {
    result = 'steam';
  }
  else if (distro.indexOf('suse') !== -1) {
    result = 'suse';
  }
  else if (distro.indexOf('mate') !== -1) {
    result = 'ubuntu-mate';
  }
  else if (distro.indexOf('lubuntu') !== -1) {
    result = 'lubuntu';
  }
  else if (distro.indexOf('xubuntu') !== -1) {
    result = 'xubuntu';
  }
  else if (distro.indexOf('ubuntu') !== -1) {
    result = 'ubuntu';
  }
  return result;
}

// --------------------------
// OS Information

function osInfo(callback) {

  return new Promise((resolve) => {
    process.nextTick(() => {
      let result = {

        platform: (_platform === 'Windows_NT' ? 'Windows' : _platform),
        distro: 'unknown',
        release: 'unknown',
        codename: '',
        kernel: os.release(),
        arch: os.arch(),
        hostname: os.hostname(),
        logofile: ''
      };

      if (_linux) {

        exec('cat /etc/*-release', function (error, stdout) {
          //if (!error) {
          /**
           * @namespace
           * @property {string}  DISTRIB_ID
           * @property {string}  NAME
           * @property {string}  DISTRIB_RELEASE
           * @property {string}  VERSION_ID
           * @property {string}  DISTRIB_CODENAME
           */
          let release = {};
          let lines = stdout.toString().split('\n');
          lines.forEach(function (line) {
            if (line.indexOf('=') !== -1) {
              release[line.split('=')[0].trim().toUpperCase()] = line.split('=')[1].trim();
            }
          });
          result.distro = (release.DISTRIB_ID || release.NAME || 'unknown').replace(/"/g, '');
          result.logofile = getLogoFile(result.distro);
          result.release = (release.DISTRIB_RELEASE || release.VERSION_ID || 'unknown').replace(/"/g, '');
          result.codename = (release.DISTRIB_CODENAME || '').replace(/"/g, '');
          //}
          if (callback) {
            callback(result);
          }
          resolve(result);
        });
      }
      if (_freebsd || _openbsd) {

        exec('sysctl kern.ostype kern.osrelease kern.osrevision', function (error, stdout) {
          if (!error) {
            let lines = stdout.toString().split('\n');
            result.distro = util.getValue(lines, 'kern.ostype');
            result.logofile = getLogoFile(result.distro);
            result.release = util.getValue(lines, 'kern.osrelease').split('-')[0];
            result.codename = '';
          }
          if (callback) {
            callback(result);
          }
          resolve(result);
        });
      }
      if (_darwin) {
        exec('sw_vers', function (error, stdout) {
          let lines = stdout.toString().split('\n');
          lines.forEach(function (line) {
            if (line.indexOf('ProductName') !== -1) {
              result.distro = line.split(':')[1].trim();
              result.logofile = getLogoFile(result.distro);
            }
            if (line.indexOf('ProductVersion') !== -1) result.release = line.split(':')[1].trim();
          });
          if (callback) {
            callback(result);
          }
          resolve(result);
        });
      }
      if (_windows) {
        result.logofile = getLogoFile();
        result.release = result.kernel;
        exec(util.getWmic() + ' os get Caption', opts, function (error, stdout) {
          result.distro = result.codename = stdout.slice(stdout.indexOf('\r\n') + 2).trim();
          if (callback) {
            callback(result);
          }
          resolve(result);
        });
      }
    });
  });
}

exports.osInfo = osInfo;

function versions(callback) {
  return new Promise((resolve) => {
    process.nextTick(() => {
      let result = {
        kernel: os.release(),
        openssl: process.versions.openssl,
        node: process.versions.node,
        v8: process.versions.v8,
        npm: '',
        yarn: '',
        pm2: '',
        gulp: '',
        grunt: '',
        git: '',
        tsc: '',
      };
      let parts = [];
      exec('npm -v', function (error, stdout) {
        if (!error) {
          result.npm = stdout.toString().split('\n')[0];
        }
        exec('pm2 -v', function (error, stdout) {
          if (!error) {
            parts = stdout.toString().split('\n');
            if (parts.length >= 2) {
              result.pm2 = parts[parts.length - 2];
            }
          }
          exec('yarn --version', function (error, stdout) {
            if (!error) {
              result.yarn = stdout.toString().split('\n')[0];
            }
            exec('gulp --version', function (error, stdout) {
              if (!error) {
                result.gulp = stdout.toString().split('\n')[0] || '';
                result.gulp = (result.gulp.toLowerCase().split('version')[1] || '').trim();
              }
              exec('tsc --version', function (error, stdout) {
                if (!error) {
                  result.tsc = stdout.toString().split('\n')[0] || '';
                  result.tsc = (result.tsc.toLowerCase().split('version')[1] || '').trim();
                }
                exec('grunt --version', function (error, stdout) {
                  if (!error) {
                    result.grunt = stdout.toString().split('\n')[0] || '';
                    result.grunt = (result.grunt.toLowerCase().split('cli v')[1] || '').trim();
                  }
                  exec('git --version', function (error, stdout) {
                    if (!error) {
                      result.git = stdout.toString().split('\n')[0] || '';
                      result.git = (result.git.toLowerCase().split('version')[1] || '').trim();
                      result.git = (result.git.split(' ')[0] || '').trim();
                    }
                    if (callback) {
                      callback(result);
                    }
                    resolve(result);
                  });
                });
              });
            });
          });
        });
      });
    });
  });
}

exports.versions = versions;

function shell(callback) {
  return new Promise((resolve, reject) => {
    process.nextTick(() => {
      if (_windows) {
        let error = new Error(NOT_SUPPORTED);
        if (callback) {
          callback(NOT_SUPPORTED);
        }
        reject(error);
      }

      let result = '';
      exec('echo $SHELL', function (error, stdout) {
        if (!error) {
          result = stdout.toString().split('\n')[0];
        }
        if (callback) {
          callback(result);
        }
        resolve(result);
      });
    });
  });
}

exports.shell = shell;
