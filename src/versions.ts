import { release } from 'node:os';
import { getValue, semverCompare } from './common';
import { DARWIN, LINUX, VBOXMANAGE, WINDOWS } from './common/const';
import { darwinXcodeExists } from './common/darwin';
import { exec, execSave } from './common/exec';
import { fileExists } from './common/files';
import { ps } from './common/windows';
import type { VersionData } from './common/types';

export const versions = async (apps?: string | string[]) => {
  const versionObject: { [index: string]: any } = {
    kernel: release(),
    openssl: '',
    systemOpenssl: '',
    systemOpensslLib: '',
    node: '',
    v8: process.versions.v8,
    angular: '',
    apache: '',
    bash: '',
    bun: '',
    cargo: '',
    composer: '',
    curl: '',
    deno: '',
    docker: '',
    dockerCompose: '',
    dotnet: '',
    fish: '',
    gcc: '',
    git: '',
    go: '',
    gradle: '',
    grunt: '',
    gulp: '',
    herd: '',
    homebrew: '',
    java: '',
    laravel: '',
    maven: '',
    mongodb: '',
    mysql: '',
    nginx: '',
    npm: '',
    perl: '',
    php: '',
    pip3: '',
    pip: '',
    pm2: '',
    podman: '',
    postfix: '',
    postgresql: '',
    powershell: '',
    python3: '',
    python: '',
    rails: '',
    redis: '',
    ruby: '',
    rust: '',
    sqlite3: '',
    tsc: '',
    virtualbox: '',
    vi: '',
    vim: '',
    vue: '',
    yarn: '',
    zsh: ''
  };

  const checkVersionParam = (apps: string | string[] = '') => {
    if (apps === '*') {
      return {
        versions: versionObject,
        counter: Object.keys(versionObject).length - 4
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
    apps.forEach((el) => {
      if (el) {
        for (const key in versionObject) {
          if (Object.keys(versionObject).includes(key)) {
            if (key.toLowerCase() === el.toLowerCase() && !Object.keys(result.versions).includes(key)) {
              result.versions[key] = versionObject[key];
              if (key === 'openssl') {
                result.versions.systemOpenssl = '';
                result.versions.systemOpensslLib = '';
              }
              if (!result.versions[key]) {
                result.counter++;
              }
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

      if (totalFunctions <= 0) {
        return resolve(appsObj.versions);
      }

      const functionProcessed = (() => () => {
        if (--totalFunctions === 0) {
          resolve(appsObj.versions);
        }
      })();

      let cmd = '';
      try {
        if (Object.keys(appsObj.versions).includes('openssl')) {
          appsObj.versions.openssl = process.versions.openssl;
          exec('openssl version')
            .then((res) => {
              if (res.stdout) {
                const openssl_string = res.stdout.split('\n')[0].trim();
                const openssl = openssl_string.split(' ');
                appsObj.versions.systemOpenssl = openssl.length > 0 ? openssl[1] : openssl[0];
                appsObj.versions.systemOpensslLib = openssl.length > 0 ? openssl[0] : 'openssl';
              }
              functionProcessed();
            })
            .catch(() => {
              functionProcessed();
            });
        }
        if (Object.keys(appsObj.versions).includes('npm')) {
          exec('npm -v')
            .then((res) => {
              if (res.stdout) {
                appsObj.versions.npm = res.stdout.split('\n')[0];
              }
              functionProcessed();
            })
            .catch(() => {
              functionProcessed();
            });
        }
        if (Object.keys(appsObj.versions).includes('pm2')) {
          cmd = 'pm2';
          if (WINDOWS) {
            cmd += '.cmd';
          }
          exec(`${cmd} -v`)
            .then((res) => {
              if (res.stdout) {
                const lines = res.stdout.split('\n').slice(0, -1);
                const pm2 = lines[lines.length - 1];
                if (!pm2.startsWith('[PM2]')) {
                  appsObj.versions.pm2 = pm2;
                }
              }
              functionProcessed();
            })
            .catch(() => {
              functionProcessed();
            });
        }
        if (Object.keys(appsObj.versions).includes('yarn')) {
          exec('yarn --version')
            .then((res) => {
              if (res.stdout) {
                appsObj.versions.yarn = res.stdout.split('\n')[0];
              }
              functionProcessed();
            })
            .catch(() => {
              functionProcessed();
            });
        }
        if (Object.keys(appsObj.versions).includes('gulp')) {
          cmd = 'gulp';
          if (WINDOWS) {
            cmd += '.cmd';
          }
          exec(`${cmd} --version`)
            .then((res) => {
              if (res.stdout) {
                const gulp = res.stdout.split('\n')[0] || '';
                appsObj.versions.gulp = (gulp.toLowerCase().split('version')[1] || '').trim();
              }
              functionProcessed();
            })
            .catch(() => {
              functionProcessed();
            });
        }
        if (Object.keys(appsObj.versions).includes('homebrew')) {
          cmd = 'brew';
          exec(`${cmd} --version`)
            .then((res) => {
              if (res.stdout) {
                const brew = res.stdout.split('\n')[0] || '';
                appsObj.versions.homebrew = (brew.toLowerCase().split(' ')[1] || '').trim();
              }
              functionProcessed();
            })
            .catch(() => {
              functionProcessed();
            });
        }
        if (Object.keys(appsObj.versions).includes('tsc')) {
          cmd = 'tsc';
          if (WINDOWS) {
            cmd += '.cmd';
          }
          exec(`${cmd} --version`)
            .then((res) => {
              if (res.stdout) {
                const tsc = res.stdout.split('\n')[0] || '';
                appsObj.versions.tsc = (tsc.toLowerCase().split('version')[1] || '').trim();
              }
              functionProcessed();
            })
            .catch(() => {
              functionProcessed();
            });
        }
        if (Object.keys(appsObj.versions).includes('grunt')) {
          cmd = 'grunt';
          if (WINDOWS) {
            cmd += '.cmd';
          }
          exec(`${cmd} --version`)
            .then((res) => {
              if (res.stdout) {
                const grunt = res.stdout.split('\n')[0] || '';
                appsObj.versions.grunt = (grunt.toLowerCase().split('cli v')[1] || '').trim();
              }
              functionProcessed();
            })
            .catch(() => {
              functionProcessed();
            });
        }
        if (Object.keys(appsObj.versions).includes('git')) {
          if (DARWIN) {
            const gitHomebrewExists = (await fileExists('/usr/local/Cellar/git')) || (await fileExists('/opt/homebrew/bin/git'));
            if ((await darwinXcodeExists()) || gitHomebrewExists) {
              exec('git --version')
                .then((res) => {
                  if (res.stdout) {
                    let git = res.stdout.split('\n')[0] || '';
                    git = (git.toLowerCase().split('version')[1] || '').trim();
                    appsObj.versions.git = (git.split(' ')[0] || '').trim();
                  }
                  functionProcessed();
                })
                .catch(() => {
                  functionProcessed();
                });
            } else {
              functionProcessed();
            }
          } else {
            exec('git --version')
              .then((res) => {
                if (res.stdout) {
                  let git = res.stdout.split('\n')[0] || '';
                  git = (git.toLowerCase().split('version')[1] || '').trim();
                  appsObj.versions.git = (git.split(' ')[0] || '').trim();
                }
                functionProcessed();
              })
              .catch(() => {
                functionProcessed();
              });
          }
        }
        if (Object.keys(appsObj.versions).includes('apache')) {
          exec('apachectl -v 2>&1')
            .then((res) => {
              if (res.stdout) {
                const apache = (res.stdout.split('\n')[0] || '').split(':');
                appsObj.versions.apache = apache.length > 1 ? apache[1].replace('Apache', '').replace('/', '').split('(')[0].trim() : '';
              }
              functionProcessed();
            })
            .catch(() => {
              functionProcessed();
            });
        }
        if (Object.keys(appsObj.versions).includes('nginx')) {
          exec('nginx -v 2>&1')
            .then((res) => {
              if (res.stdout) {
                const nginx = res.stdout.split('\n')[0] || '';
                appsObj.versions.nginx = (nginx.toLowerCase().split('/')[1] || '').trim();
              }
              functionProcessed();
            })
            .catch(() => {
              functionProcessed();
            });
        }
        if (Object.keys(appsObj.versions).includes('mysql')) {
          exec('mysql -V')
            .then((res) => {
              if (res.stdout) {
                let mysql = res.stdout.split('\n')[0] || '';
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
            })
            .catch(() => {
              functionProcessed();
            });
        }
        if (Object.keys(appsObj.versions).includes('php')) {
          exec('php -v')
            .then((res) => {
              if (res.stdout) {
                const php = res.stdout.split('\n')[0] || '';
                let parts = php.split('(');
                if (parts[0].indexOf('-')) {
                  parts = parts[0].split('-');
                }
                appsObj.versions.php = parts[0].replace(/[^0-9.]/g, '');
              }
              functionProcessed();
            })
            .catch(() => {
              functionProcessed();
            });
        }
        if (Object.keys(appsObj.versions).includes('redis')) {
          exec('redis-server --version')
            .then((res) => {
              if (res.stdout) {
                const redis = res.stdout.split('\n')[0] || '';
                const parts = redis.split(' ');
                appsObj.versions.redis = getValue(parts, 'v', '=', true);
              }
              functionProcessed();
            })
            .catch(() => {
              functionProcessed();
            });
        }
        if (Object.keys(appsObj.versions).includes('docker')) {
          exec('docker --version')
            .then((res) => {
              if (res.stdout) {
                const docker = res.stdout.split('\n')[0] || '';
                const parts = docker.split(' ');
                appsObj.versions.docker = parts.length > 2 && parts[2].endsWith(',') ? parts[2].slice(0, -1) : '';
              }
              functionProcessed();
            })
            .catch(() => {
              functionProcessed();
            });
        }
        if (Object.keys(appsObj.versions).includes('podman')) {
          exec('podman --version')
            .then((res) => {
              if (res.stdout) {
                const podman = res.stdout.split('\n')[0] || '';
                const parts = podman.split(' ');
                appsObj.versions.podman = parts.length > 2 ? parts[2] : '';
              }
              functionProcessed();
            })
            .catch(() => {
              functionProcessed();
            });
        }
        if (Object.keys(appsObj.versions).includes('postfix')) {
          exec('postconf -d | grep mail_version')
            .then((res) => {
              if (res.stdout) {
                const postfix = res.stdout.split('\n') || [];
                appsObj.versions.postfix = getValue(postfix, 'mail_version', '=', true);
              }
              functionProcessed();
            })
            .catch(() => {
              functionProcessed();
            });
        }
        if (Object.keys(appsObj.versions).includes('mongodb')) {
          exec('mongod --version')
            .then((res) => {
              if (res.stdout) {
                const mongodb = res.stdout.split('\n')[0] || '';
                appsObj.versions.mongodb = (mongodb.toLowerCase().split(',')[0] || '').replace(/[^0-9.]/g, '');
              }
              functionProcessed();
            })
            .catch(() => {
              functionProcessed();
            });
        }
        if (Object.keys(appsObj.versions).includes('postgresql')) {
          if (LINUX) {
            exec('locate bin/postgres')
              .then((res) => {
                const postgresqlBin = res.stdout.split('\n').sort();
                if (postgresqlBin.length) {
                  exec(postgresqlBin[postgresqlBin.length - 1] + ' -V')
                    .then((res) => {
                      if (res.stdout) {
                        const postgresql = res.stdout.split('\n')[0].split(' ') || [];
                        appsObj.versions.postgresql = postgresql.length ? postgresql[postgresql.length - 1] : '';
                      }
                      functionProcessed();
                    })
                    .catch(() => {
                      functionProcessed();
                    });
                } else {
                  functionProcessed();
                }
              })
              .catch(() => {
                exec('psql -V')
                  .then((res) => {
                    const postgresql = res.stdout.split('\n')[0].split(' ') || [];

                    appsObj.versions.postgresql = postgresql.length ? postgresql[postgresql.length - 1] : '';
                    appsObj.versions.postgresql = appsObj.versions.postgresql.split('-')[0];
                    functionProcessed();
                  })
                  .catch(() => {
                    functionProcessed();
                  });
              });
          } else {
            if (WINDOWS) {
              ps.exec('Get-CimInstance Win32_Service | select caption | fl')
                .then((stdout: any) => {
                  const serviceSections = (stdout ? stdout.toString() : '').split(/\n\s*\n/);
                  serviceSections.forEach((item: string) => {
                    const lines = item.trim().split('\r\n');
                    const srvCaption = getValue(lines, 'caption', ':', true).toLowerCase();
                    if (srvCaption.indexOf('postgresql') > -1) {
                      const parts = srvCaption.split(' server ');
                      if (parts.length > 1) {
                        appsObj.versions.postgresql = parts[1];
                      }
                    }
                  });
                  functionProcessed();
                })
                .catch(() => {
                  functionProcessed();
                });
            } else {
              exec('postgres -V')
                .then((res) => {
                  if (res.stdout) {
                    const postgresql = res.stdout.split('\n')[0].split(' ') || [];
                    appsObj.versions.postgresql = postgresql.length ? postgresql[postgresql.length - 1] : '';
                    if (appsObj.versions.postgresql.includes('(') && postgresql.length >= 2 && !postgresql[postgresql.length - 2].includes('(')) {
                      appsObj.versions.postgresql = postgresql[postgresql.length - 2];
                    }
                  }
                  functionProcessed();
                })
                .catch(() => {
                  exec('pg_config --version 2> /dev/null')
                    .then((res) => {
                      if (res.stdout) {
                        const postgresql = res.stdout.toString().split('\n')[0].split(' ') || [];
                        appsObj.versions.postgresql = postgresql.length ? postgresql[postgresql.length - 1] : '';
                        if (appsObj.versions.postgresql.includes('(') && postgresql.length >= 2 && !postgresql[postgresql.length - 2].includes('(')) {
                          appsObj.versions.postgresql = postgresql[postgresql.length - 2];
                        }
                      }
                    })
                    .catch(() => {})
                    .finally(() => {
                      functionProcessed();
                    });
                });
            }
          }
        }
        if (Object.keys(appsObj.versions).includes('perl')) {
          exec('perl -v')
            .then((res) => {
              if (res.stdout) {
                let perl = res.stdout.split('\n') || '';
                while (perl.length > 0 && perl[0].trim() === '') {
                  perl = perl.splice(1);
                }
                if (perl.length > 0) {
                  appsObj.versions.perl = (perl[0].split('(').pop() || '').split(')')[0].replace('v', '');
                }
              }
              functionProcessed();
            })
            .catch(() => {
              functionProcessed();
            });
        }
        if (Object.keys(appsObj.versions).includes('python')) {
          if (DARWIN) {
            const { stdout } = await execSave('sw_vers');
            const lines = stdout.split('\n');
            const osVersion = getValue(lines, 'ProductVersion', ':');

            const pythonHomebrewExists1 = await fileExists('/usr/local/Cellar/python');
            const pythonHomebrewExists2 = await fileExists('/opt/homebrew/bin/python');
            if (((await darwinXcodeExists()) && semverCompare('12.0.1', osVersion) < 0) || pythonHomebrewExists1 || pythonHomebrewExists2) {
              const cmd = pythonHomebrewExists1 ? '/usr/local/Cellar/python -V 2>&1' : pythonHomebrewExists2 ? '/opt/homebrew/bin/python -V 2>&1' : 'python -V 2>&1';
              exec(cmd)
                .then((res) => {
                  if (res.stdout) {
                    const python = res.stdout.split('\n')[0] || '';
                    appsObj.versions.python = python.toLowerCase().replace('python', '').trim();
                  }
                  functionProcessed();
                })
                .catch(() => {
                  functionProcessed();
                });
            } else {
              functionProcessed();
            }
          } else {
            exec('python -V 2>&1')
              .then((res) => {
                if (res.stdout) {
                  const python = res.stdout.split('\n')[0] || '';
                  appsObj.versions.python = python.toLowerCase().replace('python', '').trim();
                }
                functionProcessed();
              })
              .catch(() => {
                functionProcessed();
              });
          }
        }
        if (Object.keys(appsObj.versions).includes('python3')) {
          if (DARWIN) {
            const pythonHomebrewExists = (await fileExists('/usr/local/Cellar/python3')) || (await fileExists('/opt/homebrew/bin/python3'));
            if ((await darwinXcodeExists()) || pythonHomebrewExists) {
              exec('python3 -V 2>&1')
                .then((res) => {
                  if (res.stdout) {
                    const python = res.stdout.split('\n')[0] || '';
                    appsObj.versions.python3 = python.toLowerCase().replace('python', '').trim();
                  }
                  functionProcessed();
                })
                .catch(() => {
                  functionProcessed();
                });
            } else {
              functionProcessed();
            }
          } else {
            exec('python3 -V 2>&1')
              .then((res) => {
                if (res.stdout) {
                  const python = res.stdout.split('\n')[0] || '';
                  appsObj.versions.python3 = python.toLowerCase().replace('python', '').trim();
                }
                functionProcessed();
              })
              .catch(() => {
                functionProcessed();
              });
          }
        }
        if (Object.keys(appsObj.versions).includes('pip')) {
          if (DARWIN) {
            const pipHomebrewExists = (await fileExists('/usr/local/Cellar/pip')) || (await fileExists('/opt/homebrew/bin/pip'));
            if ((await darwinXcodeExists()) || pipHomebrewExists) {
              exec('pip -V 2>&1')
                .then((res) => {
                  if (res.stdout) {
                    const pip = res.stdout.split('\n')[0] || '';
                    const parts = pip.split(' ');
                    appsObj.versions.pip = parts.length >= 2 ? parts[1] : '';
                  }
                  functionProcessed();
                })
                .catch(() => {
                  functionProcessed();
                });
            } else {
              functionProcessed();
            }
          } else {
            exec('pip -V 2>&1')
              .then((res) => {
                if (res.stdout) {
                  const pip = res.stdout.split('\n')[0] || '';
                  const parts = pip.split(' ');
                  appsObj.versions.pip = parts.length >= 2 ? parts[1] : '';
                }
                functionProcessed();
              })
              .catch(() => {
                functionProcessed();
              });
          }
        }
        if (Object.keys(appsObj.versions).includes('pip3')) {
          if (DARWIN) {
            const pipHomebrewExists = (await fileExists('/usr/local/Cellar/pip3')) || (await fileExists('/opt/homebrew/bin/pip3'));
            if ((await darwinXcodeExists()) || pipHomebrewExists) {
              exec('pip3 -V 2>&1')
                .then((res) => {
                  if (res.stdout) {
                    const pip = res.stdout.split('\n')[0] || '';
                    const parts = pip.split(' ');
                    appsObj.versions.pip3 = parts.length >= 2 ? parts[1] : '';
                  }
                  functionProcessed();
                })
                .catch(() => {
                  functionProcessed();
                });
            } else {
              functionProcessed();
            }
          } else {
            exec('pip3 -V 2>&1')
              .then((res) => {
                if (res.stdout) {
                  const pip = res.stdout.split('\n')[0] || '';
                  const parts = pip.split(' ');
                  appsObj.versions.pip3 = parts.length >= 2 ? parts[1] : '';
                }
                functionProcessed();
              })
              .catch(() => {
                functionProcessed();
              });
          }
        }
        if (Object.keys(appsObj.versions).includes('java')) {
          if (DARWIN) {
            // check if any JVM is installed but avoid dialog box that Java needs to be installed
            exec('/usr/libexec/java_home -V 2>&1')
              .then((res) => {
                if (res.stdout && res.stdout.toLowerCase().indexOf('no java runtime') === -1) {
                  // now this can be done savely
                  exec('java -version 2>&1')
                    .then((res) => {
                      if (res.stdout) {
                        const java = res.stdout.split('\n')[0] || '';
                        const parts = java.split('"');
                        appsObj.versions.java = parts.length === 3 ? parts[1].trim() : '';
                      }
                      functionProcessed();
                    })
                    .catch(() => {
                      functionProcessed();
                    });
                } else {
                  functionProcessed();
                }
              })
              .catch(() => {
                functionProcessed();
              });
          } else {
            exec('java -version 2>&1')
              .then((res) => {
                if (res.stdout) {
                  const java = res.stdout.split('\n')[0] || '';
                  const parts = java.split('"');
                  appsObj.versions.java = parts.length === 3 ? parts[1].trim() : '';
                }
                functionProcessed();
              })
              .catch(() => {
                functionProcessed();
              });
          }
        }
        if (Object.keys(appsObj.versions).includes('gcc')) {
          if ((DARWIN && (await darwinXcodeExists())) || !DARWIN) {
            exec('gcc -dumpversion')
              .then((res) => {
                if (res.stdout) {
                  appsObj.versions.gcc = res.stdout.split('\n')[0].trim() || '';
                }
                if (appsObj.versions.gcc.indexOf('.') > -1) {
                  functionProcessed();
                } else {
                  exec('gcc --version')
                    .then((res) => {
                      if (res.stdout) {
                        const gcc = res.stdout.split('\n')[0].trim();
                        if (gcc.indexOf('gcc') > -1 && gcc.indexOf(')') > -1) {
                          const parts = gcc.split(')');
                          appsObj.versions.gcc = parts[1].trim() || appsObj.versions.gcc;
                        }
                      }
                      functionProcessed();
                    })
                    .catch(() => {
                      functionProcessed();
                    });
                }
              })
              .catch(() => {
                functionProcessed();
              });
          } else {
            functionProcessed();
          }
        }
        if (Object.keys(appsObj.versions).includes('virtualbox')) {
          exec(VBOXMANAGE + ' -v 2>&1')
            .then((res) => {
              if (res.stdout) {
                const vbox = res.stdout.split('\n')[0] || '';
                const parts = vbox.split('r');
                appsObj.versions.virtualbox = parts[0];
              }
              functionProcessed();
            })
            .catch(() => {
              functionProcessed();
            });
        }
        if (Object.keys(appsObj.versions).includes('bash')) {
          exec('bash --version')
            .then((res) => {
              if (res.stdout) {
                const line = res.stdout.split('\n')[0];
                const parts = line.split(' version ');
                if (parts.length > 1) {
                  appsObj.versions.bash = parts[1].split(' ')[0].split('(')[0];
                }
              }
              functionProcessed();
            })
            .catch(() => {
              functionProcessed();
            });
        }
        if (Object.keys(appsObj.versions).includes('zsh')) {
          exec('zsh --version')
            .then((res) => {
              if (res.stdout) {
                const line = res.stdout.split('\n')[0];
                const parts = line.split('zsh ');
                if (parts.length > 1) {
                  appsObj.versions.zsh = parts[1].split(' ')[0];
                }
              }
              functionProcessed();
            })
            .catch(() => {
              functionProcessed();
            });
        }
        if (Object.keys(appsObj.versions).includes('fish')) {
          exec('fish --version')
            .then((res) => {
              if (res.stdout) {
                const line = res.stdout.split('\n')[0];
                const parts = line.split(' version ');
                if (parts.length > 1) {
                  appsObj.versions.fish = parts[1].split(' ')[0];
                }
              }
              functionProcessed();
            })
            .catch(() => {
              functionProcessed();
            });
        }
        if (Object.keys(appsObj.versions).includes('powershell')) {
          if (WINDOWS) {
            ps.exec('$PSVersionTable')
              .then((stdout: any) => {
                const lines = (stdout ? stdout.toString() : '')
                  .toLowerCase()
                  .split('\n')
                  .map((line: string) => line.replace(/ +/g, ' ').replace(/ +/g, ':'));
                appsObj.versions.powershell = getValue(lines, 'psversion');
                functionProcessed();
              })
              .catch(() => {
                functionProcessed();
              });
          } else {
            functionProcessed();
          }
        }
        if (Object.keys(appsObj.versions).includes('dotnet')) {
          if (WINDOWS) {
            ps.exec('gci "HKLM:\\SOFTWARE\\Microsoft\\NET Framework Setup\\NDP" -recurse | gp -name Version,Release -EA 0 | where { $_.PSChildName -match "^(?!S)\\p{L}"} | select PSChildName, Version, Release')
              .then((stdout: any) => {
                const lines: string[] = (stdout ? stdout.toString() : '').split('\r\n');
                let dotnet = '';
                lines.forEach((line) => {
                  line = line.replace(/ +/g, ' ');
                  const parts = line.split(' ');
                  dotnet =
                    dotnet ||
                    (parts[0].toLowerCase().startsWith('client') && parts.length > 2 ? parts[1].trim() : parts[0].toLowerCase().startsWith('full') && parts.length > 2 ? parts[1].trim() : '');
                });
                appsObj.versions.dotnet = dotnet.trim();
                functionProcessed();
              })
              .catch(() => {
                functionProcessed();
              });
          } else {
            functionProcessed();
          }
        }
        if (Object.keys(appsObj.versions).includes('vue')) {
          exec('vue --version')
            .then((res) => {
              if (res.stdout) {
                const line = res.stdout.split('\n')[0];
                const parts = line.split(' ');
                if (parts.length > 1) {
                  appsObj.versions.vue = parts[1];
                }
              }
              functionProcessed();
            })
            .catch(() => {
              functionProcessed();
            });
        }
        if (Object.keys(appsObj.versions).includes('angular')) {
          exec('ng version')
            .then((res) => {
              if (res.stdout) {
                const lines = res.stdout.split('\n');
                lines.forEach((line) => {
                  if (line.toLowerCase().startsWith('angular cli')) {
                    const parts = line.split(':');
                    if (parts.length > 1) {
                      appsObj.versions.angular = parts[1].trim();
                    }
                  }
                });
              }
              functionProcessed();
            })
            .catch(() => {
              functionProcessed();
            });
        }
        if (Object.keys(appsObj.versions).includes('rust')) {
          exec('rustc --version')
            .then((res) => {
              if (res.stdout) {
                const line = res.stdout.split('\n')[0];
                const parts = line.split(' ');
                if (parts.length > 1) {
                  appsObj.versions.rust = parts[1].trim();
                }
              }
              functionProcessed();
            })
            .catch(() => {
              functionProcessed();
            });
        }
        if (Object.keys(appsObj.versions).includes('go')) {
          exec('go version')
            .then((res) => {
              if (res.stdout) {
                const line = res.stdout.split('\n')[0];
                const parts = line.split(' ');
                if (parts.length > 2) {
                  appsObj.versions.go = parts[2].trim();
                }
              }
              functionProcessed();
            })
            .catch(() => {
              functionProcessed();
            });
        }
        if (Object.keys(appsObj.versions).includes('maven')) {
          exec('mvn --version')
            .then((res) => {
              if (res.stdout) {
                const line = res.stdout.split('\n')[0];
                const parts = line.split(' ');
                if (parts.length > 2) {
                  appsObj.versions.maven = parts[2].trim();
                }
              }
              functionProcessed();
            })
            .catch(() => {
              functionProcessed();
            });
        }
        if (Object.keys(appsObj.versions).includes('gradle')) {
          exec('gradle -v')
            .then((res) => {
              if (res.stdout) {
                const lines = res.stdout.split('\n');
                lines.forEach((line) => {
                  if (line.toLowerCase().startsWith('gradle')) {
                    const parts = line.split(' ');
                    if (parts.length >= 2) {
                      appsObj.versions.gradle = parts[1].trim();
                    }
                  }
                });
              }
              functionProcessed();
            })
            .catch(() => {
              functionProcessed();
            });
        }
        if (Object.keys(appsObj.versions).includes('dockerCompose')) {
          exec('docker-compose -v')
            .then((res) => {
              if (res.stdout) {
                const line = res.stdout.split('\n')[0];
                const parts = line.split('version ');
                appsObj.versions.dockerCompose = parts.length > 1 ? parts[1].trim() : '';
              }
              functionProcessed();
            })
            .catch(() => {
              functionProcessed();
            });
        }
        if (Object.keys(appsObj.versions).includes('bun')) {
          exec('bun -v')
            .then((res) => {
              if (res.stdout) {
                const line = res.stdout.split('\n')[0];
                appsObj.versions.bun = line.trim();
              }
              functionProcessed();
            })
            .catch(() => {
              functionProcessed();
            });
        }
        if (Object.keys(appsObj.versions).includes('deno')) {
          exec('deno -v')
            .then((res) => {
              if (res.stdout) {
                const line = res.stdout.split('\n')[0];
                const parts = line.split(' ');
                appsObj.versions.deno = line.length > 1 ? parts[1].trim() : '';
              }
              functionProcessed();
            })
            .catch(() => {
              functionProcessed();
            });
        }
        if (Object.keys(appsObj.versions).includes('curl')) {
          exec('curl -V')
            .then((res) => {
              if (res.stdout) {
                const line = res.stdout.split('\n')[0];
                const parts = line.split(' ');
                appsObj.versions.curl = line.length > 1 ? parts[1].trim() : '';
              }
              functionProcessed();
            })
            .catch(() => {
              functionProcessed();
            });
        }
        if (Object.keys(appsObj.versions).includes('ruby')) {
          exec('ruby -v')
            .then((res) => {
              if (res.stdout) {
                const line = res.stdout.split('\n')[0];
                const parts = line.split(' ');
                appsObj.versions.ruby = line.length > 1 ? parts[1].trim() : '';
              }
              functionProcessed();
            })
            .catch(() => {
              functionProcessed();
            });
        }
        if (Object.keys(appsObj.versions).includes('cargo')) {
          exec('cargo -V')
            .then((res) => {
              if (res.stdout) {
                const line = res.stdout.split('\n')[0];
                const parts = line.split(' ');
                appsObj.versions.cargo = line.length > 1 ? parts[1].trim() : '';
              }
              functionProcessed();
            })
            .catch(() => {
              functionProcessed();
            });
        }
        if (Object.keys(appsObj.versions).includes('sqlite3')) {
          exec('sqlite3 --version')
            .then((res) => {
              if (res.stdout) {
                const line = res.stdout.split('\n')[0];
                const parts = line.split(' ');
                appsObj.versions.sqlite3 = line.length > 1 ? parts[0].trim() : '';
              }
              functionProcessed();
            })
            .catch(() => {
              functionProcessed();
            });
        }
        if (Object.keys(appsObj.versions).includes('vi')) {
          exec('vi --version')
            .then((res) => {
              if (res.stdout) {
                const line = res.stdout.split('\n')[0];
                const parts = line.split('(');
                appsObj.versions.vi = line.length > 1 ? parts[0].trim() : '';
              }
              functionProcessed();
            })
            .catch(() => {
              functionProcessed();
            });
        }
        if (Object.keys(appsObj.versions).includes('node')) {
          exec('node -v')
            .then((res) => {
              if (res.stdout) {
                let line = res.stdout.split('\n')[0].trim();
                if (line.startsWith('v')) {
                  line = line.slice(1);
                }
                appsObj.versions.node = line;
              }
              functionProcessed();
            })
            .catch(() => {
              functionProcessed();
            });
        }
        if (Object.keys(appsObj.versions).includes('composer')) {
          exec('composer --version')
            .then((res) => {
              if (res.stdout) {
                const parts = res.stdout.split('\n')[0].trim().split(' ');
                appsObj.versions.composer = parts.length >= 3 ? parts[2].trim() : '';
              }
              functionProcessed();
            })
            .catch(() => {
              functionProcessed();
            });
        }
        if (Object.keys(appsObj.versions).includes('herd')) {
          exec('herd --version')
            .then((res) => {
              if (res.stdout) {
                const parts = res.stdout.split('\n')[0].trim().split(' ');
                appsObj.versions.herd = parts.length >= 2 ? parts[1].trim() : '';
              }
              functionProcessed();
            })
            .catch(() => {
              functionProcessed();
            });
        }
        if (Object.keys(appsObj.versions).includes('laravel')) {
          exec('laravel --version')
            .then((res) => {
              if (res.stdout) {
                const parts = res.stdout.split('\n')[0].trim().split(' ');
                appsObj.versions.laravel = parts.length >= 3 ? parts[2].trim() : '';
              }
              functionProcessed();
            })
            .catch(() => {
              functionProcessed();
            });
        }
        if (Object.keys(appsObj.versions).includes('rails')) {
          exec('rails -v')
            .then((res) => {
              if (res.stdout) {
                // the 'rails' stub answers with a hint text when rails is not installed
                const version = res.stdout.split('\n')[0].match(/^Rails\s+(\d+(\.\d+)*)/i);
                appsObj.versions.rails = version ? version[1] : '';
              }
              functionProcessed();
            })
            .catch(() => {
              functionProcessed();
            });
        }
        if (Object.keys(appsObj.versions).includes('vim')) {
          exec('vim --version')
            .then((res) => {
              if (res.stdout) {
                const version = res.stdout.split('\n')[0].match(/\d+(\.\d+)+/);
                appsObj.versions.vim = version ? version[0] : '';
              }
              functionProcessed();
            })
            .catch(() => {
              functionProcessed();
            });
        }
      } catch (e) {
        return appsObj.versions;
      }
    });
  });
};
