'use strict';
// @ts-check
// ==================================================================================
// osinfo.js
// ----------------------------------------------------------------------------------
// Description:   System Information - library
//                for Node.js
// Copyright:     (c) 2014 - 2019
// Author:        Sebastian Hildebrandt
// ----------------------------------------------------------------------------------
// License:       MIT
// ==================================================================================
// 3. Operating System
// ----------------------------------------------------------------------------------

const os = require('os');
const exec = require('child_process').exec;
const util = require('./util');
const fs = require('fs');

let _platform = process.platform;

const _linux = (_platform === 'linux');
const _darwin = (_platform === 'darwin');
const _windows = (_platform === 'win32');
const _freebsd = (_platform === 'freebsd');
const _openbsd = (_platform === 'openbsd');
const _sunos = (_platform === 'sunos');

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
  let result = _platform;
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
  else if (distro.indexOf('solaris') !== -1) {
    result = 'solaris';
  }
  else if (distro.indexOf('tails') !== -1) {
    result = 'tails';
  }
  else if (distro.indexOf('robolinux') !== -1) {
    result = 'robolinux';
  } else if (_linux && distro) {
    result = distro.toLowerCase();
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
        codepage: '',
        logofile: '',
        serial: '',
        build: '',
        servicepack: ''
      };

      if (_linux) {

        exec('cat /etc/*-release; cat /usr/lib/os-release; cat /etc/openwrt_release', function (error, stdout) {
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
          let releaseVersion = (release.VERSION || '').replace(/"/g, '');
          let codename = (release.DISTRIB_CODENAME || release.VERSION_CODENAME || '').replace(/"/g, '');
          if (releaseVersion.indexOf('(') >= 0) {
            codename = releaseVersion.split('(')[1].replace(/[()]/g, '').trim();
            releaseVersion = releaseVersion.split('(')[0].trim();
          }
          result.distro = (release.DISTRIB_ID || release.NAME || 'unknown').replace(/"/g, '');
          result.logofile = getLogoFile(result.distro);
          result.release = (releaseVersion || release.DISTRIB_RELEASE || release.VERSION_ID || 'unknown').replace(/"/g, '');
          result.codename = codename;
          result.codepage = util.getCodepage();
          result.build = (release.BUILD_ID || '').replace(/"/g, '').trim();
          uuid().then(data => {
            result.serial = data.os;
            if (callback) {
              callback(result);
            }
            resolve(result);
          });
          //}
        });
      }
      if (_freebsd || _openbsd) {

        exec('sysctl kern.ostype kern.osrelease kern.osrevision kern.hostuuid', function (error, stdout) {
          if (!error) {
            let lines = stdout.toString().split('\n');
            result.distro = util.getValue(lines, 'kern.ostype');
            result.logofile = getLogoFile(result.distro);
            result.release = util.getValue(lines, 'kern.osrelease').split('-')[0];
            result.serial = util.getValue(lines, 'kern.uuid');
            result.codename = '';
            result.codepage = util.getCodepage();
          }
          if (callback) {
            callback(result);
          }
          resolve(result);
        });
      }
      if (_darwin) {
        exec('sw_vers; sysctl kern.ostype kern.osrelease kern.osrevision kern.uuid', function (error, stdout) {
          let lines = stdout.toString().split('\n');
          result.serial = util.getValue(lines, 'kern.uuid');
          result.distro = util.getValue(lines, 'ProductName');
          result.release = util.getValue(lines, 'ProductVersion');
          result.build = util.getValue(lines, 'BuildVersion');
          result.logofile = getLogoFile(result.distro);
          result.codename = 'macOS';
          result.codename = (result.release.indexOf('10.4') > -1 ? 'Mac OS X Tiger' : result.codename);
          result.codename = (result.release.indexOf('10.4') > -1 ? 'Mac OS X Tiger' : result.codename);
          result.codename = (result.release.indexOf('10.4') > -1 ? 'Mac OS X Tiger' : result.codename);
          result.codename = (result.release.indexOf('10.5') > -1 ? 'Mac OS X Leopard' : result.codename);
          result.codename = (result.release.indexOf('10.6') > -1 ? 'Mac OS X Snow Leopard' : result.codename);
          result.codename = (result.release.indexOf('10.7') > -1 ? 'Mac OS X Lion' : result.codename);
          result.codename = (result.release.indexOf('10.8') > -1 ? 'OS X Mountain Lion' : result.codename);
          result.codename = (result.release.indexOf('10.9') > -1 ? 'OS X Mavericks' : result.codename);
          result.codename = (result.release.indexOf('10.10') > -1 ? 'OS X Yosemite' : result.codename);
          result.codename = (result.release.indexOf('10.11') > -1 ? 'OS X El Capitan' : result.codename);
          result.codename = (result.release.indexOf('10.12') > -1 ? 'macOS Sierra' : result.codename);
          result.codename = (result.release.indexOf('10.13') > -1 ? 'macOS High Sierra' : result.codename);
          result.codename = (result.release.indexOf('10.14') > -1 ? 'macOS Mojave' : result.codename);

          result.codepage = util.getCodepage();
          if (callback) {
            callback(result);
          }
          resolve(result);
        });
      }
      if (_sunos) {
        result.release = result.kernel;
        exec('uname -o', function (error, stdout) {
          let lines = stdout.toString().split('\n');
          result.distro = lines[0];
          result.logofile = getLogoFile(result.distro);
          if (callback) { callback(result); }
          resolve(result);
        });
      }
      if (_windows) {
        result.logofile = getLogoFile();
        result.release = result.kernel;
        try {
          util.wmic('os get /value').then((stdout, error) => {
            let lines = stdout.toString().split('\r\n');
            result.distro = util.getValue(lines, 'Caption', '=').trim();
            result.serial = util.getValue(lines, 'SerialNumber', '=').trim();
            result.build = util.getValue(lines, 'BuildNumber', '=').trim();
            result.servicepack = util.getValue(lines, 'ServicePackMajorVersion', '=').trim() + '.' + util.getValue(lines, 'ServicePackMinorVersion', '=').trim();
            result.codepage = util.getCodepage();
            if (callback) {
              callback(result);
            }
            resolve(result);
          });
        } catch (e) {
          if (callback) { callback(result); }
          resolve(result);
        }
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
        systemOpenssl: '',
        systemOpensslLib: '',
        node: process.versions.node,
        v8: process.versions.v8,
        npm: '',
        yarn: '',
        pm2: '',
        gulp: '',
        grunt: '',
        git: '',
        tsc: '',
        mysql: '',
        redis: '',
        mongodb: '',
        apache: '',
        nginx: '',
        php: '',
        docker: '',
        postfix: '',
        postgresql: '',
        perl: '',
        python: '',
        python3: '',
        pip: '',
        pip3: '',
        java: '',
        gcc: ''
      };

      let functionProcessed = (function () {
        let totalFunctions = 23;
        return function () {
          if (--totalFunctions === 0) {
            if (callback) {
              callback(result);
            }
            resolve(result);
          }
        };
      })();

      try {
        exec('openssl version', function (error, stdout) {
          if (!error) {
            let openssl_string = stdout.toString().split('\n')[0].trim();
            let openssl = openssl_string.split(' ');
            result.systemOpenssl = openssl.length > 0 ? openssl[1] : openssl[0];
            result.systemOpensslLib = openssl.length > 0 ? openssl[0] : 'openssl';
          }
          functionProcessed();
        });
        exec('npm -v', function (error, stdout) {
          if (!error) {
            result.npm = stdout.toString().split('\n')[0];
          }
          functionProcessed();
        });
        exec('pm2 -v', function (error, stdout) {
          if (!error) {
            let pm2 = stdout.toString().split('\n')[0].trim();
            if (!pm2.startsWith('[PM2]')) {
              result.pm2 = pm2;
            }
          }
          functionProcessed();
        });
        exec('yarn --version', function (error, stdout) {
          if (!error) {
            result.yarn = stdout.toString().split('\n')[0];
          }
          functionProcessed();
        });
        exec('gulp --version', function (error, stdout) {
          if (!error) {
            const gulp = stdout.toString().split('\n')[0] || '';
            result.gulp = (gulp.toLowerCase().split('version')[1] || '').trim();
          }
          functionProcessed();
        });
        exec('tsc --version', function (error, stdout) {
          if (!error) {
            const tsc = stdout.toString().split('\n')[0] || '';
            result.tsc = (tsc.toLowerCase().split('version')[1] || '').trim();
          }
          functionProcessed();
        });
        exec('grunt --version', function (error, stdout) {
          if (!error) {
            const grunt = stdout.toString().split('\n')[0] || '';
            result.grunt = (grunt.toLowerCase().split('cli v')[1] || '').trim();
          }
          functionProcessed();
        });
        if (_darwin) {
          const cmdLineToolsExists = fs.existsSync('/Library/Developer/CommandLineTools/usr/bin/');
          const xcodeAppExists = fs.existsSync('/Applications/Xcode.app/Contents/Developer/Tools');
          const xcodeExists = fs.existsSync('/Library/Developer/Xcode/');
          const gitHomebrewExists = fs.existsSync('/usr/local/Cellar/git');
          if (cmdLineToolsExists || xcodeExists || gitHomebrewExists || xcodeAppExists) {
            exec('git --version', function (error, stdout) {
              if (!error) {
                let git = stdout.toString().split('\n')[0] || '';
                git = (git.toLowerCase().split('version')[1] || '').trim();
                result.git = (git.split(' ')[0] || '').trim();
              }
              functionProcessed();
            });
          } else {
            functionProcessed();
          }
        } else {
          exec('git --version', function (error, stdout) {
            if (!error) {
              let git = stdout.toString().split('\n')[0] || '';
              git = (git.toLowerCase().split('version')[1] || '').trim();
              result.git = (git.split(' ')[0] || '').trim();
            }
            functionProcessed();
          });
        }
        exec('apachectl -v 2>&1', function (error, stdout) {
          if (!error) {
            const apache = (stdout.toString().split('\n')[0] || '').split(':');
            result.apache = (apache.length > 1 ? apache[1].replace('Apache', '').replace('/', '').trim() : '');
          }
          functionProcessed();
        });
        exec('nginx -v 2>&1', function (error, stdout) {
          if (!error) {
            const nginx = stdout.toString().split('\n')[0] || '';
            result.nginx = (nginx.toLowerCase().split('/')[1] || '').trim();
          }
          functionProcessed();
        });
        exec('mysql -V', function (error, stdout) {
          if (!error) {
            let mysql = stdout.toString().split('\n')[0] || '';
            mysql = (mysql.toLowerCase().split(',')[0] || '').trim();
            const parts = mysql.split(' ');
            result.mysql = (parts[parts.length - 1] || '').trim();
          }
          functionProcessed();
        });
        exec('php -v', function (error, stdout) {
          if (!error) {
            const php = stdout.toString().split('\n')[0] || '';
            let parts = php.split('(');
            if (parts[0].indexOf('-')) {
              parts = parts[0].split('-');
            }
            result.php = parts[0].replace(/[^0-9.]/g, '');
          }
          functionProcessed();
        });
        exec('redis-server --version', function (error, stdout) {
          if (!error) {
            const redis = stdout.toString().split('\n')[0] || '';
            const parts = redis.split(' ');
            result.redis = util.getValue(parts, 'v', '=', true);
          }
          functionProcessed();
        });
        exec('docker --version', function (error, stdout) {
          if (!error) {
            const docker = stdout.toString().split('\n')[0] || '';
            const parts = docker.split(' ');
            result.docker = parts.length > 2 && parts[2].endsWith(',') ? parts[2].slice(0, -1) : '';
          }
          functionProcessed();
        });
        exec('postconf -d | grep mail_version', function (error, stdout) {
          if (!error) {
            const postfix = stdout.toString().split('\n') || [];
            result.postfix = util.getValue(postfix, 'mail_version', '=', true);
          }
          functionProcessed();
        });
        exec('mongod --version', function (error, stdout) {
          if (!error) {
            const mongodb = stdout.toString().split('\n')[0] || '';
            result.mongodb = (mongodb.toLowerCase().split(',')[0] || '').replace(/[^0-9.]/g, '');
          }
          functionProcessed();
        });
        if (_linux) {
          exec('locate bin/postgres', function (error, stdout) {
            if (!error) {
              const postgresqlBin = stdout.toString().split('\n').sort();
              if (postgresqlBin.length) {
                exec(postgresqlBin[postgresqlBin.length - 1] + ' -V', function (error, stdout) {
                  if (!error) {
                    const postgresql = stdout.toString().split('\n')[0].split(' ') || [];
                    result.postgresql = postgresql.length ? postgresql[postgresql.length - 1] : '';
                  }
                  functionProcessed();
                });
              } else {
                functionProcessed();
              }
            } else {
              functionProcessed();
            }
          });
        } else {
          if (_windows) {
            util.wmic('service get /value').then((stdout, error) => {
              let serviceSections = stdout.split(/\n\s*\n/);
              for (let i = 0; i < serviceSections.length; i++) {
                if (serviceSections[i].trim() !== '') {
                  let lines = serviceSections[i].trim().split('\r\n');
                  let srvCaption = util.getValue(lines, 'caption', '=', true).toLowerCase();
                  if (srvCaption.indexOf('postgresql') > -1) {
                    const parts = srvCaption.split(' server ');
                    if (parts.length > 1) {
                      result.postgresql = parts[1];
                    }
                  }
                }
              }
              functionProcessed();
            });
          } else {
            exec('postgres -V', function (error, stdout) {
              if (!error) {
                const postgresql = stdout.toString().split('\n')[0].split(' ') || [];
                result.postgresql = postgresql.length ? postgresql[postgresql.length - 1] : '';
              }
              functionProcessed();
            });
          }
        }
        exec('perl -v', function (error, stdout) {
          if (!error) {
            const perl = stdout.toString().split('\n') || '';
            while (perl.length > 0 && perl[0].trim() === '') {
              perl.shift();
            }
            if (perl.length > 0) {
              result.perl = perl[0].split('(').pop().split(')')[0].replace('v', '');
            }
          }
          functionProcessed();
        });
        exec('python -V 2>&1', function (error, stdout) {
          if (!error) {
            const python = stdout.toString().split('\n')[0] || '';
            result.python = python.toLowerCase().replace('python', '').trim();
          }
          functionProcessed();
        });
        exec('python3 -V 2>&1', function (error, stdout) {
          if (!error) {
            const python = stdout.toString().split('\n')[0] || '';
            result.python3 = python.toLowerCase().replace('python', '').trim();
          }
          functionProcessed();
        });
        exec('pip -V 2>&1', function (error, stdout) {
          if (!error) {
            const pip = stdout.toString().split('\n')[0] || '';
            const parts = pip.split(' ');
            result.pip = parts.length >= 2 ? parts[2] : '';
          }
          functionProcessed();
        });
        exec('pip3 -V 2>&1', function (error, stdout) {
          if (!error) {
            const pip = stdout.toString().split('\n')[0] || '';
            const parts = pip.split(' ');
            result.pip3 = parts.length >= 2 ? parts[2] : '';
          }
          functionProcessed();
        });
        exec('java -version 2>&1', function (error, stdout) {
          if (!error) {
            const java = stdout.toString().split('\n')[0] || '';
            const parts = java.split('"');
            result.java = parts.length === 3 ? parts[1].trim() : '';
          }
          functionProcessed();
        });
        exec('gcc -dumpversion', function (error, stdout) {
          if (!error) {
            result.gcc = stdout.toString().split('\n')[0].trim() || '';
          }
          if (result.gcc.indexOf('.') > -1) {
            functionProcessed();
          } else {
            exec('gcc --version', function (error, stdout) {
              if (!error) {
                const gcc = stdout.toString().split('\n')[0].trim();
                if (gcc.indexOf('gcc') > -1 && gcc.indexOf(')') > -1) {
                  const parts = gcc.split(')');
                  result.gcc = parts[1].trim() || result.gcc;
                }
              }
              functionProcessed();
            });
          }
        });
      } catch (e) {
        if (callback) { callback(result); }
        resolve(result);
      }
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

function uuid(callback) {
  return new Promise((resolve) => {
    process.nextTick(() => {

      let result = {
        os: ''
      };
      let parts;

      if (_darwin) {
        exec('ioreg -rd1 -c IOPlatformExpertDevice | grep IOPlatformUUID', function (error, stdout) {
          if (!error) {
            parts = stdout.toString().split('\n')[0].replace(/"/g, '').split('=');
            result.os = parts.length > 1 ? parts[1].trim().toLowerCase() : '';
          }
          if (callback) {
            callback(result);
          }
          resolve(result);
        });
      }
      if (_linux) {
        exec('( cat /var/lib/dbus/machine-id /etc/machine-id 2> /dev/null || hostname ) | head -n 1 || :', function (error, stdout) {
          if (!error) {
            result.os = stdout.toString().split('\n')[0].trim().toLowerCase();
          }
          if (callback) {
            callback(result);
          }
          resolve(result);
        });
      }
      if (_freebsd || _openbsd) {
        exec('kenv -q smbios.system.uuid', function (error, stdout) {
          if (!error) {
            result.os = stdout.toString().split('\n')[0].trim().toLowerCase();
          }
          if (callback) {
            callback(result);
          }
          resolve(result);
        });
      }
      if (_windows) {
        exec('%windir%\\System32\\reg query "HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Cryptography" /v MachineGuid', util.execOptsWin, function (error, stdout) {
          if (!error) {
            parts = stdout.toString().split('\n\r')[0].split('REG_SZ');
            result.os = parts.length > 1 ? parts[1].replace(/\r+|\n+|\s+/ig, '').toLowerCase() : '';
          }
          if (callback) {
            callback(result);
          }
          resolve(result);
        });
      }
    });
  });
}

exports.uuid = uuid;
