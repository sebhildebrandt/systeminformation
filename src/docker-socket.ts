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
import { EOL, type } from 'os';

const isWin = type() === 'Windows_NT';
const socketPath = isWin ? '//./pipe/docker_engine' : '/var/run/docker.sock';

export class DockerSocket {
  private fetch(endpoint: string, params?: Record<string, string | number | boolean>) {
    return new Promise((resolve, reject) => {
      try {
        const args = Object.entries(params ?? {});
        const socket = net.createConnection({ path: socketPath });
        let result = '';

        socket.on('connect', () => {
          socket.write(`GET ${endpoint}${args.length > 0 ? '?' + args.map(([name, value]) => `${name}=${value}`).join('&') : ''} HTTP/1.0${EOL}${EOL}`);
        });

        socket.on('data', data => {
          result = result + data.toString();
        });

        socket.on('error', error => {
          reject(error);
        });

        socket.on('end', () => {
          const start = result.indexOf('\r\n\r\n');
          try {
            resolve(JSON.parse(result.substring(start + 4)));
          } catch (error) {
            reject(error);
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  async getInfo() {
    return this.fetch('http:/info');
  }

  listImages(all = true) {
    return this.fetch('http:/images/json', { all: all ? 1 : 0 });
  }

  inspectImage(id: string) {
    if (!id) throw new Error('Missing "id" argument');
    return this.fetch(`http:/images/${id}/json`, { stream: 0 });
  }

  listContainers(all: boolean) {
    return this.fetch('http:/containers/json', { all: all ? 1 : 0 });
  }

  getStats(id: string) {
    if (!id) throw new Error('Missing "id" argument');
    return this.fetch(`http:/containers/${id}/stats`, { stream: 0 });
  }

  getInspect(id: string) {
    if (!id) throw new Error('Missing "id" argument');
    return this.fetch(`http:/containers/${id}/json`, { stream: 0 });
  }

  getProcesses(id: string) {
    if (!id) throw new Error('Missing "id" argument');
    return this.fetch(`http:/containers/${id}/top`, { ps_args: '-opid,ppid,pgid,vsz,time,etime,nice,ruser,user,rgroup,group,stat,rss,args' });
  }

  listVolumes() {
    return this.fetch('http:/volumes');
  }
}
