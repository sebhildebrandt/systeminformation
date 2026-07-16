'use strict';
// @ts-check
// ==================================================================================
// dockerSockets.js
// ----------------------------------------------------------------------------------
// Description:   System Information - library
//                for Node.js
// Copyright:     (c) 2014 - 2026
// Author:        Sebastian Hildebrandt
// ----------------------------------------------------------------------------------
// License:       MIT
// ==================================================================================
// 13. DockerSockets
// ----------------------------------------------------------------------------------

const net = require('net');
const isWin = require('os').type() === 'Windows_NT';
const socketPath = process.env.DOCKER_SOCKET || (isWin ? '//./pipe/docker_engine' : '/var/run/docker.sock');
const socketTimeout = +process.env.DOCKER_SOCKET_TIMEOUT || 30000;

function fetchJson(path, callback) {
  let done = false;
  const finish = (result) => {
    if (!done) {
      done = true;
      callback(result);
    }
  };
  try {
    const socket = net.createConnection({ path: socketPath });
    let alldata = '';

    socket.setTimeout(socketTimeout, () => {
      socket.destroy();
      finish({});
    });

    socket.on('connect', () => {
      socket.write(`GET ${path} HTTP/1.0\r\n\r\n`);
    });

    socket.on('data', (data) => {
      alldata = alldata + data.toString();
    });

    socket.on('error', () => {
      finish({});
    });

    socket.on('end', () => {
      const startbody = alldata.indexOf('\r\n\r\n');
      const status = parseInt(alldata.split(' ')[1], 10);
      if (startbody < 0 || isNaN(status) || status < 200 || status >= 300) {
        return finish({});
      }
      try {
        finish(JSON.parse(alldata.substring(startbody + 4)));
      } catch {
        finish({});
      }
    });
  } catch {
    finish({});
  }
}

class DockerSocket {
  getInfo(callback) {
    fetchJson('http:/info', callback);
  }

  listImages(all, callback) {
    fetchJson(`http:/images/json${all ? '?all=1' : ''}`, callback);
  }

  inspectImage(id, callback) {
    if (id) {
      fetchJson(`http:/images/${id}/json?stream=0`, callback);
    } else {
      callback({});
    }
  }

  listContainers(all, callback) {
    fetchJson(`http:/containers/json${all ? '?all=1' : ''}`, callback);
  }

  getStats(id, callback) {
    if (id) {
      fetchJson(`http:/containers/${id}/stats?stream=0`, callback);
    } else {
      callback({});
    }
  }

  getInspect(id, callback) {
    if (id) {
      fetchJson(`http:/containers/${id}/json?stream=0`, callback);
    } else {
      callback({});
    }
  }

  getProcesses(id, callback) {
    if (id) {
      fetchJson(`http:/containers/${id}/top?ps_args=-opid,ppid,pgid,vsz,time,etime,nice,ruser,user,rgroup,group,stat,rss,args`, callback);
    } else {
      callback({});
    }
  }

  listVolumes(callback) {
    fetchJson('http:/volumes', callback);
  }
}

module.exports = DockerSocket;
