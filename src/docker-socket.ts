import * as net from 'node:net';
import { type } from 'node:os';

const isWin = type() === 'Windows_NT';
const socketPath = process.env.DOCKER_SOCKET || (isWin ? '//./pipe/docker_engine' : '/var/run/docker.sock');
const socketTimeout = +(process.env.DOCKER_SOCKET_TIMEOUT || 0) || 30000;

export class DockerSocket {
  private get(endpoint: string, params?: Record<string, string | number | boolean>) {
    return new Promise((resolve) => {
      let done = false;
      const finish = (result: any) => {
        if (!done) {
          done = true;
          resolve(result);
        }
      };
      try {
        const args = Object.entries(params || {});
        const socket = net.createConnection({ path: socketPath });
        let alldata = '';

        socket.setTimeout(socketTimeout, () => {
          socket.destroy();
          finish('');
        });

        socket.on('connect', () => {
          socket.write(`GET ${endpoint}${args.length > 0 ? '?' + args.map(([name, value]) => `${name}=${value}`).join('&') : ''} HTTP/1.0\r\n\r\n`);
        });

        socket.on('data', (data) => {
          alldata = alldata + data.toString();
        });

        socket.on('error', () => {
          finish('');
        });

        socket.on('end', () => {
          const startbody = alldata.indexOf('\r\n\r\n');
          const status = parseInt(alldata.split(' ')[1] || '', 10);
          if (startbody < 0 || Number.isNaN(status) || status < 200 || status >= 300) {
            return finish('');
          }
          try {
            finish(JSON.parse(alldata.substring(startbody + 4)));
          } catch {
            finish('');
          }
        });
      } catch {
        finish('');
      }
    });
  }

  async getInfo() {
    return this.get('http:/info');
  }

  listImages(all = true) {
    return this.get('http:/images/json', { all: all ? 1 : 0 });
  }

  inspectImage(id = '0000000000') {
    return this.get(`http:/images/${id}/json`, { stream: 0 });
  }

  listContainers(all: boolean) {
    return this.get('http:/containers/json', { all: all ? 1 : 0 });
  }

  getStats(id = '0000000000') {
    return this.get(`http:/containers/${id}/stats`, { stream: 0 });
  }

  getInspect(id = '0000000000') {
    return this.get(`http:/containers/${id}/json`, { stream: 0 });
  }

  getProcesses(id = '0000000000') {
    return this.get(`http:/containers/${id}/top`, { ps_args: '-opid,ppid,pgid,vsz,time,etime,nice,ruser,user,rgroup,group,stat,rss,args' });
  }

  listVolumes() {
    return this.get('http:/volumes');
  }
}
