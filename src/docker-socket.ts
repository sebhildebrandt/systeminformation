// ==================================================================================
// dockerSockets.ts
// ----------------------------------------------------------------------------------
// Description:   System Information - library
//                for Node.js
// Copyright:     (c) 2014 - 2021
// Author:        Sebastian Hildebrandt
// ----------------------------------------------------------------------------------
// License:       MIT
// ==================================================================================
// 13. DockerSockets
// ----------------------------------------------------------------------------------

import * as net from 'net';
import { type } from 'os';
const isWin = type() === 'Windows_NT';
const socketPath = isWin ? '//./pipe/docker_engine' : '/var/run/docker.sock';

export class DockerSocket {

  getInfo() {
    return new Promise((resolve) => {
      try {
        const socket = net.createConnection({ path: socketPath });
        let alldata = '';
        let data;

        socket.on('connect', () => {
          socket.write('GET http:/info HTTP/1.0\r\n\r\n');
        });

        socket.on('data', data => {
          alldata = alldata + data.toString();
        });

        socket.on('error', () => {
          resolve({});
        });

        socket.on('end', () => {
          const startbody = alldata.indexOf('\r\n\r\n');
          alldata = alldata.substring(startbody + 4);
          try {
            data = JSON.parse(alldata);
            resolve(data);
          } catch (err) {
            resolve({});
          }
        });
      } catch (err) {
        resolve({});
      }
    });
  }

  listImages(all: boolean) {
    return new Promise((resolve) => {
      try {
        const socket = net.createConnection({ path: socketPath });
        let alldata = '';
        let data;

        socket.on('connect', () => {
          socket.write('GET http:/images/json' + (all ? '?all=1' : '') + ' HTTP/1.0\r\n\r\n');
        });

        socket.on('data', data => {
          alldata = alldata + data.toString();
        });

        socket.on('error', () => {
          resolve({});
        });

        socket.on('end', () => {
          const startbody = alldata.indexOf('\r\n\r\n');
          alldata = alldata.substring(startbody + 4);
          try {
            data = JSON.parse(alldata);
            resolve(data);
          } catch (err) {
            resolve({});
          }
        });
      } catch (err) {
        resolve({});
      }
    });
  }

  inspectImage(id = '') {
    return new Promise((resolve) => {
      if (id) {
        try {
          const socket = net.createConnection({ path: socketPath });
          let alldata = '';
          let data;

          socket.on('connect', () => {
            socket.write('GET http:/images/' + id + '/json?stream=0 HTTP/1.0\r\n\r\n');
          });

          socket.on('data', data => {
            alldata = alldata + data.toString();
          });

          socket.on('error', () => {
            resolve({});
          });

          socket.on('end', () => {
            const startbody = alldata.indexOf('\r\n\r\n');
            alldata = alldata.substring(startbody + 4);
            try {
              data = JSON.parse(alldata);
              resolve(data);
            } catch (err) {
              resolve({});
            }
          });
        } catch (err) {
          resolve({});
        }
      } else {
        resolve({});
      }
    });
  }

  listContainers(all: boolean) {
    return new Promise((resolve) => {
      try {

        const socket = net.createConnection({ path: socketPath });
        let alldata = '';
        let data;

        socket.on('connect', () => {
          socket.write('GET http:/containers/json' + (all ? '?all=1' : '') + ' HTTP/1.0\r\n\r\n');
        });

        socket.on('data', data => {
          alldata = alldata + data.toString();
        });

        socket.on('error', () => {
          resolve({});
        });

        socket.on('end', () => {
          const startbody = alldata.indexOf('\r\n\r\n');
          alldata = alldata.substring(startbody + 4);
          try {
            data = JSON.parse(alldata);
            resolve(data);
          } catch (err) {
            resolve({});
          }
        });
      } catch (err) {
        resolve({});
      }
    });
  }

  getStats(id = '') {
    return new Promise((resolve) => {
      if (id) {
        try {
          const socket = net.createConnection({ path: socketPath });
          let alldata = '';
          let data;

          socket.on('connect', () => {
            socket.write('GET http:/containers/' + id + '/stats?stream=0 HTTP/1.0\r\n\r\n');
          });

          socket.on('data', data => {
            alldata = alldata + data.toString();
          });

          socket.on('error', () => {
            resolve({});
          });

          socket.on('end', () => {
            const startbody = alldata.indexOf('\r\n\r\n');
            alldata = alldata.substring(startbody + 4);
            try {
              data = JSON.parse(alldata);
              resolve(data);
            } catch (err) {
              resolve({});
            }
          });
        } catch (err) {
          resolve({});
        }
      } else {
        resolve({});
      }
    });
  }

  getInspect(id = '') {
    return new Promise((resolve) => {
      if (id) {
        try {
          const socket = net.createConnection({ path: socketPath });
          let alldata = '';
          let data;

          socket.on('connect', () => {
            socket.write('GET http:/containers/' + id + '/json?stream=0 HTTP/1.0\r\n\r\n');
          });

          socket.on('data', data => {
            alldata = alldata + data.toString();
          });

          socket.on('error', () => {
            resolve({});
          });

          socket.on('end', () => {
            const startbody = alldata.indexOf('\r\n\r\n');
            alldata = alldata.substring(startbody + 4);
            try {
              data = JSON.parse(alldata);
              resolve(data);
            } catch (err) {
              resolve({});
            }
          });
        } catch (err) {
          resolve({});
        }
      } else {
        resolve({});
      }
    });
  }

  getProcesses(id = '') {
    return new Promise((resolve) => {
      if (id) {
        try {
          const socket = net.createConnection({ path: socketPath });
          let alldata = '';
          let data;

          socket.on('connect', () => {
            socket.write('GET http:/containers/' + id + '/top?ps_args=-opid,ppid,pgid,vsz,time,etime,nice,ruser,user,rgroup,group,stat,rss,args HTTP/1.0\r\n\r\n');
          });

          socket.on('data', data => {
            alldata = alldata + data.toString();
          });

          socket.on('error', () => {
            resolve({});
          });

          socket.on('end', () => {
            const startbody = alldata.indexOf('\r\n\r\n');
            alldata = alldata.substring(startbody + 4);
            try {
              data = JSON.parse(alldata);
              resolve(data);
            } catch (err) {
              resolve({});
            }
          });
        } catch (err) {
          resolve({});
        }
      } else {
        resolve({});
      }
    });
  }

  listVolumes() {
    return new Promise((resolve) => {
      try {

        const socket = net.createConnection({ path: socketPath });
        let alldata = '';
        let data;

        socket.on('connect', () => {
          socket.write('GET http:/volumes HTTP/1.0\r\n\r\n');
        });

        socket.on('data', data => {
          alldata = alldata + data.toString();
        });

        socket.on('error', () => {
          resolve({});
        });

        socket.on('end', () => {
          const startbody = alldata.indexOf('\r\n\r\n');
          alldata = alldata.substring(startbody + 4);
          try {
            data = JSON.parse(alldata);
            resolve(data);
          } catch (err) {
            resolve({});
          }
        });
      } catch (err) {
        resolve({});
      }
    });
  }
}
