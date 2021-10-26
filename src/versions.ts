'use strict';

import * as os from 'os';
import { existsSync } from 'fs';
import { getValue } from './common';
import { DARWIN, LINUX, VBOXMANAGE, WINDOWS } from './common/const';
import { darwinXcodeExists } from './common/darwin';
import { execCmd, powerShell } from './common/exec';
import { VersionData } from './common/types';

export const versions = async (apps?: string | string[]) => {
  const versionObject: { [index: string]: any; } = {
    kernel: os.release(),
    openssl: '',
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
    gcc: '',
    virtualbox: '',
    bash: '',
    zsh: '',
    fish: '',
    powershell: '',
    dotnet: ''
  };

  const checkVersionParam = (apps: string | string[] = '') => {
    if (apps === '*') {
      return {
        versions: versionObject,
        counter: 30
      };
    }
    if (!Array.isArray(apps)) {
      apps = apps.trim().toLowerCase().replace(/,+/g, '|').replace(/ /g, '|');
      apps = apps.split('|');
    }
    const result: any = {
      versions: {},
      counter: 0
    };
    apps.forEach(el => {
      if (el) {
        for (const key in versionObject) {
          if ({}.hasOwnProperty.call(versionObject, key)) {
            if (key.toLowerCase() === el.toLowerCase() && !{}.hasOwnProperty.call(result.versions, key)) {
              result.versions[key] = versionObject[key];
              if (key === 'openssl') {
                result.versions.systemOpenssl = '';
                result.versions.systemOpensslLib = '';
              }
              if (!result.versions[key]) { result.counter++; }
            }
          }
        }
      }
    });
    return result;
  };

  return new Promise<VersionData[]>((resolve) => {
    process.nextTick(async () => {
      apps = apps || '*';
      const appsObj = checkVersionParam(apps);
      let totalFunctions = appsObj.counter;

      const functionProcessed = (function () {
        return function () {
          if (--totalFunctions === 0) {
            resolve(appsObj.versions);
          }
        };
      })();

      let cmd = '';
      try {
        if ({}.hasOwnProperty.call(appsObj.versions, 'openssl')) {
          appsObj.versions.openssl = process.versions.openssl;
          execCmd('openssl version').then((stdout: string) => {
            if (stdout) {
              const openssl_string = stdout.toString().split('\n')[0].trim();
              const openssl = openssl_string.split(' ');
              appsObj.versions.systemOpenssl = openssl.length > 0 ? openssl[1] : openssl[0];
              appsObj.versions.systemOpensslLib = openssl.length > 0 ? openssl[0] : 'openssl';
            }
            functionProcessed();
          });
        }
        if ({}.hasOwnProperty.call(appsObj.versions, 'npm')) {
          execCmd('npm -v').then((stdout: string) => {
            if (stdout) {
              appsObj.versions.npm = stdout.toString().split('\n')[0];
            }
            functionProcessed();
          });
        }
        if ({}.hasOwnProperty.call(appsObj.versions, 'pm2')) {
          cmd = 'pm2';
          if (WINDOWS) {
            cmd += '.cmd';
          }
          execCmd(`${cmd} -v`).then((stdout: string) => {
            if (stdout) {
              const pm2 = stdout.toString().split('\n')[0].trim();
              if (!pm2.startsWith('[PM2]')) {
                appsObj.versions.pm2 = pm2;
              }
            }
            functionProcessed();
          });
        }
        if ({}.hasOwnProperty.call(appsObj.versions, 'yarn')) {
          execCmd('yarn --version').then((stdout: string) => {
            if (stdout) {
              appsObj.versions.yarn = stdout.toString().split('\n')[0];
            }
            functionProcessed();
          });
        }
        if ({}.hasOwnProperty.call(appsObj.versions, 'gulp')) {
          cmd = 'gulp';
          if (WINDOWS) {
            cmd += '.cmd';
          }
          execCmd(`${cmd} --version`).then((stdout: string) => {
            if (stdout) {
              const gulp = stdout.toString().split('\n')[0] || '';
              appsObj.versions.gulp = (gulp.toLowerCase().split('version')[1] || '').trim();
            }
            functionProcessed();
          });
        }
        if ({}.hasOwnProperty.call(appsObj.versions, 'tsc')) {
          cmd = 'tsc';
          if (WINDOWS) {
            cmd += '.cmd';
          }
          execCmd(`${cmd} --version`).then((stdout: string) => {
            if (stdout) {
              const tsc = stdout.toString().split('\n')[0] || '';
              appsObj.versions.tsc = (tsc.toLowerCase().split('version')[1] || '').trim();
            }
            functionProcessed();
          });
        }
        if ({}.hasOwnProperty.call(appsObj.versions, 'grunt')) {
          cmd = 'grunt';
          if (WINDOWS) {
            cmd += '.cmd';
          }
          execCmd(`${cmd} --version`).then((stdout: string) => {
            if (stdout) {
              const grunt = stdout.toString().split('\n')[0] || '';
              appsObj.versions.grunt = (grunt.toLowerCase().split('cli v')[1] || '').trim();
            }
            functionProcessed();
          });
        }
        if ({}.hasOwnProperty.call(appsObj.versions, 'git')) {
          if (DARWIN) {
            const gitHomebrewExists = existsSync('/usr/local/Cellar/git');
            if (await await darwinXcodeExists() || gitHomebrewExists) {
              execCmd('git --version').then((stdout: string) => {
                if (stdout) {
                  let git = stdout.toString().split('\n')[0] || '';
                  git = (git.toLowerCase().split('version')[1] || '').trim();
                  appsObj.versions.git = (git.split(' ')[0] || '').trim();
                }
                functionProcessed();
              });
            } else {
              functionProcessed();
            }
          } else {
            execCmd('git --version').then((stdout: string) => {
              if (stdout) {
                let git = stdout.toString().split('\n')[0] || '';
                git = (git.toLowerCase().split('version')[1] || '').trim();
                appsObj.versions.git = (git.split(' ')[0] || '').trim();
              }
              functionProcessed();
            });
          }
        }
        if ({}.hasOwnProperty.call(appsObj.versions, 'apache')) {
          execCmd('apachectl -v 2>&1').then((stdout: string) => {
            if (stdout) {
              const apache = (stdout.toString().split('\n')[0] || '').split(':');
              appsObj.versions.apache = (apache.length > 1 ? apache[1].replace('Apache', '').replace('/', '').split('(')[0].trim() : '');
            }
            functionProcessed();
          });
        }
        if ({}.hasOwnProperty.call(appsObj.versions, 'nginx')) {
          execCmd('nginx -v 2>&1').then((stdout: string) => {
            if (stdout) {
              const nginx = stdout.toString().split('\n')[0] || '';
              appsObj.versions.nginx = (nginx.toLowerCase().split('/')[1] || '').trim();
            }
            functionProcessed();
          });
        }
        if ({}.hasOwnProperty.call(appsObj.versions, 'mysql')) {
          execCmd('mysql -V').then((stdout: string) => {
            if (stdout) {
              let mysql = stdout.toString().split('\n')[0] || '';
              mysql = mysql.toLowerCase();
              if (mysql.indexOf(',') > -1) {
                mysql = (mysql.split(',')[0] || '').trim();
                const parts = mysql.split(' ');
                appsObj.versions.mysql = (parts[parts.length - 1] || '').trim();
              } else {
                if (mysql.indexOf(' ver ') > -1) {
                  mysql = mysql.split(' ver ')[1];
                  appsObj.versions.mysql = mysql.split(' ')[0];
                }
              }
            }
            functionProcessed();
          });
        }
        if ({}.hasOwnProperty.call(appsObj.versions, 'php')) {
          execCmd('php -v').then((stdout: string) => {
            if (stdout) {
              const php = stdout.toString().split('\n')[0] || '';
              let parts = php.split('(');
              if (parts[0].indexOf('-')) {
                parts = parts[0].split('-');
              }
              appsObj.versions.php = parts[0].replace(/[^0-9.]/g, '');
            }
            functionProcessed();
          });
        }
        if ({}.hasOwnProperty.call(appsObj.versions, 'redis')) {
          execCmd('redis-server --version').then((stdout: string) => {
            if (stdout) {
              const redis = stdout.toString().split('\n')[0] || '';
              const parts = redis.split(' ');
              appsObj.versions.redis = getValue(parts, 'v', '=', true);
            }
            functionProcessed();
          });
        }
        if ({}.hasOwnProperty.call(appsObj.versions, 'docker')) {
          execCmd('docker --version').then((stdout: string) => {
            if (stdout) {
              const docker = stdout.toString().split('\n')[0] || '';
              const parts = docker.split(' ');
              appsObj.versions.docker = parts.length > 2 && parts[2].endsWith(',') ? parts[2].slice(0, -1) : '';
            }
            functionProcessed();
          });
        }
        if ({}.hasOwnProperty.call(appsObj.versions, 'postfix')) {
          execCmd('postconf -d | grep mail_version').then((stdout: string) => {
            if (stdout) {
              const postfix = stdout.toString().split('\n') || [];
              appsObj.versions.postfix = getValue(postfix, 'mail_version', '=', true);
            }
            functionProcessed();
          });
        }
        if ({}.hasOwnProperty.call(appsObj.versions, 'mongodb')) {
          execCmd('mongod --version').then((stdout: string) => {
            if (stdout) {
              const mongodb = stdout.toString().split('\n')[0] || '';
              appsObj.versions.mongodb = (mongodb.toLowerCase().split(',')[0] || '').replace(/[^0-9.]/g, '');
            }
            functionProcessed();
          });
        }
        if ({}.hasOwnProperty.call(appsObj.versions, 'postgresql')) {
          if (LINUX) {
            execCmd('locate bin/postgres').then((stdout: string) => {
              if (stdout) {
                const postgresqlBin = stdout.toString().split('\n').sort();
                if (postgresqlBin.length) {
                  execCmd(postgresqlBin[postgresqlBin.length - 1] + ' -V').then((stdout: string) => {
                    if (stdout) {
                      const postgresql = stdout.toString().split('\n')[0].split(' ') || [];
                      appsObj.versions.postgresql = postgresql.length ? postgresql[postgresql.length - 1] : '';
                    }
                    functionProcessed();
                  });
                } else {
                  functionProcessed();
                }
              } else {
                execCmd('psql -V').then((stdout: string) => {
                  if (stdout) {
                    const postgresql = stdout.toString().split('\n')[0].split(' ') || [];
                    appsObj.versions.postgresql = postgresql.length ? postgresql[postgresql.length - 1] : '';
                    appsObj.versions.postgresql = appsObj.versions.postgresql.split('-')[0];
                  }
                  functionProcessed();
                });
                functionProcessed();
              }
            });
          } else {
            if (WINDOWS) {
              powerShell('Get-WmiObject Win32_Service | fl *').then((stdout) => {
                const serviceSections = stdout.split(/\n\s*\n/);
                for (let i = 0; i < serviceSections.length; i++) {
                  if (serviceSections[i].trim() !== '') {
                    const lines = serviceSections[i].trim().split('\r\n');
                    const srvCaption = getValue(lines, 'caption', ':', true).toLowerCase();
                    if (srvCaption.indexOf('postgresql') > -1) {
                      const parts = srvCaption.split(' server ');
                      if (parts.length > 1) {
                        appsObj.versions.postgresql = parts[1];
                      }
                    }
                  }
                }
                functionProcessed();
              });
            } else {
              execCmd('postgres -V').then((stdout: string) => {
                if (stdout) {
                  const postgresql = stdout.toString().split('\n')[0].split(' ') || [];
                  appsObj.versions.postgresql = postgresql.length ? postgresql[postgresql.length - 1] : '';
                }
                functionProcessed();
              });
            }
          }
        }
        if ({}.hasOwnProperty.call(appsObj.versions, 'perl')) {
          execCmd('perl -v').then((stdout: string) => {
            if (stdout) {
              const perl = stdout.toString().split('\n') || '';
              while (perl.length > 0 && perl[0].trim() === '') {
                perl.shift();
              }
              if (perl.length > 0) {
                appsObj.versions.perl = (perl[0].split('(').pop() || '').split(')')[0].replace('v', '');
              }
            }
            functionProcessed();
          });
        }
        if ({}.hasOwnProperty.call(appsObj.versions, 'python')) {
          if (DARWIN) {
            const gitHomebrewExists = existsSync('/usr/local/Cellar/python');
            if (await darwinXcodeExists() || gitHomebrewExists) {
              execCmd('python -V 2>&1').then((stdout: string) => {
                if (stdout) {
                  const python = stdout.toString().split('\n')[0] || '';
                  appsObj.versions.python = python.toLowerCase().replace('python', '').trim();
                }
                functionProcessed();
              });
            } else {
              functionProcessed();
            }
          } else {
            execCmd('python -V 2>&1').then((stdout: string) => {
              if (stdout) {
                const python = stdout.toString().split('\n')[0] || '';
                appsObj.versions.python = python.toLowerCase().replace('python', '').trim();
              }
              functionProcessed();
            });
          }
        }
        if ({}.hasOwnProperty.call(appsObj.versions, 'python3')) {
          if (DARWIN) {
            const gitHomebrewExists = existsSync('/usr/local/Cellar/python3');
            if (await darwinXcodeExists() || gitHomebrewExists) {
              execCmd('python3 -V 2>&1').then((stdout: string) => {
                if (stdout) {
                  const python = stdout.toString().split('\n')[0] || '';
                  appsObj.versions.python3 = python.toLowerCase().replace('python', '').trim();
                }
                functionProcessed();
              });
            } else {
              functionProcessed();
            }
          } else {
            execCmd('python3 -V 2>&1').then((stdout: string) => {
              if (stdout) {
                const python = stdout.toString().split('\n')[0] || '';
                appsObj.versions.python3 = python.toLowerCase().replace('python', '').trim();
              }
              functionProcessed();
            });
          }
        }
        if ({}.hasOwnProperty.call(appsObj.versions, 'pip')) {
          if (DARWIN) {
            const gitHomebrewExists = existsSync('/usr/local/Cellar/pip');
            if (await darwinXcodeExists() || gitHomebrewExists) {
              execCmd('pip -V 2>&1').then((stdout: string) => {
                if (stdout) {
                  const pip = stdout.toString().split('\n')[0] || '';
                  const parts = pip.split(' ');
                  appsObj.versions.pip = parts.length >= 2 ? parts[1] : '';
                }
                functionProcessed();
              });
            } else {
              functionProcessed();
            }
          } else {
            execCmd('pip -V 2>&1').then((stdout: string) => {
              if (stdout) {
                const pip = stdout.toString().split('\n')[0] || '';
                const parts = pip.split(' ');
                appsObj.versions.pip = parts.length >= 2 ? parts[1] : '';
              }
              functionProcessed();
            });
          }
        }
        if ({}.hasOwnProperty.call(appsObj.versions, 'pip3')) {
          if (DARWIN) {
            const gitHomebrewExists = existsSync('/usr/local/Cellar/pip3');
            if (await darwinXcodeExists() || gitHomebrewExists) {
              execCmd('pip3 -V 2>&1').then((stdout: string) => {
                if (stdout) {
                  const pip = stdout.toString().split('\n')[0] || '';
                  const parts = pip.split(' ');
                  appsObj.versions.pip3 = parts.length >= 2 ? parts[1] : '';
                }
                functionProcessed();
              });
            } else {
              functionProcessed();
            }
          } else {
            execCmd('pip3 -V 2>&1').then((stdout: string) => {
              if (stdout) {
                const pip = stdout.toString().split('\n')[0] || '';
                const parts = pip.split(' ');
                appsObj.versions.pip3 = parts.length >= 2 ? parts[1] : '';
              }
              functionProcessed();
            });
          }
        }
        if ({}.hasOwnProperty.call(appsObj.versions, 'java')) {
          if (DARWIN) {
            // check if any JVM is installed but avoid dialog box that Java needs to be installed
            execCmd('/usr/libexec/java_home -V 2>&1').then((stdout: string) => {
              if (stdout && stdout.toString().toLowerCase().indexOf('no java runtime') === -1) {
                // now this can be done savely
                execCmd('java -version 2>&1').then((stdout: string) => {
                  if (stdout) {
                    const java = stdout.toString().split('\n')[0] || '';
                    const parts = java.split('"');
                    appsObj.versions.java = parts.length === 3 ? parts[1].trim() : '';
                  }
                  functionProcessed();
                });
              } else {
                functionProcessed();
              }
            });
          } else {
            execCmd('java -version 2>&1').then((stdout: string) => {
              if (stdout) {
                const java = stdout.toString().split('\n')[0] || '';
                const parts = java.split('"');
                appsObj.versions.java = parts.length === 3 ? parts[1].trim() : '';
              }
              functionProcessed();
            });
          }
        }
        if ({}.hasOwnProperty.call(appsObj.versions, 'gcc')) {
          if ((DARWIN && await darwinXcodeExists()) || !DARWIN) {
            execCmd('gcc -dumpversion').then((stdout: string) => {
              if (stdout) {
                appsObj.versions.gcc = stdout.toString().split('\n')[0].trim() || '';
              }
              if (appsObj.versions.gcc.indexOf('.') > -1) {
                functionProcessed();
              } else {
                execCmd('gcc --version').then((stdout: string) => {
                  if (stdout) {
                    const gcc = stdout.toString().split('\n')[0].trim();
                    if (gcc.indexOf('gcc') > -1 && gcc.indexOf(')') > -1) {
                      const parts = gcc.split(')');
                      appsObj.versions.gcc = parts[1].trim() || appsObj.versions.gcc;
                    }
                  }
                  functionProcessed();
                });
              }
            });
          } else {
            functionProcessed();
          }
        }
        if ({}.hasOwnProperty.call(appsObj.versions, 'virtualbox')) {
          execCmd(VBOXMANAGE + ' -v 2>&1').then((stdout: string) => {
            if (stdout) {
              const vbox = stdout.toString().split('\n')[0] || '';
              const parts = vbox.split('r');
              appsObj.versions.virtualbox = parts[0];
            }
            functionProcessed();
          });
        }
        if ({}.hasOwnProperty.call(appsObj.versions, 'bash')) {
          execCmd('bash --version').then((stdout: string) => {
            if (stdout) {
              const line = stdout.toString().split('\n')[0];
              const parts = line.split(' version ');
              if (parts.length > 1) {
                appsObj.versions.bash = parts[1].split(' ')[0].split('(')[0];
              }
            }
            functionProcessed();
          });
        }
        if ({}.hasOwnProperty.call(appsObj.versions, 'zsh')) {
          execCmd('zsh --version').then((stdout: string) => {
            if (stdout) {
              const line = stdout.toString().split('\n')[0];
              const parts = line.split('zsh ');
              if (parts.length > 1) {
                appsObj.versions.zsh = parts[1].split(' ')[0];
              }
            }
            functionProcessed();
          });
        }
        if ({}.hasOwnProperty.call(appsObj.versions, 'fish')) {
          execCmd('fish --version').then((stdout: string) => {
            if (stdout) {
              const line = stdout.toString().split('\n')[0];
              const parts = line.split(' version ');
              if (parts.length > 1) {
                appsObj.versions.fish = parts[1].split(' ')[0];
              }
            }
            functionProcessed();
          });
        }
        if ({}.hasOwnProperty.call(appsObj.versions, 'powershell')) {
          if (WINDOWS) {
            powerShell('$PSVersionTable').then((stdout) => {
              const lines = stdout.toString().split('\n').map(line => line.replace(/ +/g, ' ').replace(/ +/g, ':'));
              appsObj.versions.powershell = getValue(lines, 'psversion');
              functionProcessed();
            });
          } else {
            functionProcessed();
          }
        }
        if ({}.hasOwnProperty.call(appsObj.versions, 'dotnet')) {
          powerShell('gci "HKLM:\\SOFTWARE\\Microsoft\\NET Framework Setup\\NDP" -recurse | gp -name Version,Release -EA 0 | where { $_.PSChildName -match "^(?!S)\\p{L}"} | select PSChildName, Version, Release').then(stdout => {
            const lines = stdout.toString().split('\r\n');
            let dotnet = '';
            lines.forEach(line => {
              line = line.replace(/ +/g, ' ');
              const parts = line.split(' ');
              dotnet = dotnet || ((parts[0].toLowerCase().startsWith('client') && parts.length > 2 ? parts[1].trim() : (parts[0].toLowerCase().startsWith('full') && parts.length > 2 ? parts[1].trim() : '')));
            });
            appsObj.versions.dotnet = dotnet.trim();
            functionProcessed();
          });
        }
      } catch (e) {
        return (appsObj.versions);
      }
    });
  });
};
