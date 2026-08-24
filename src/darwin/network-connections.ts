import { nextTick } from '../common';
import { MAX_BUFFER_SIZE } from '../common/const';
import { execSave } from '../common/exec';
import type { NetworkConnectionsData } from '../common/types';

const getProcessName = (processes: string[], pid: number) => {
  let cmd = '';
  processes.forEach((line) => {
    const parts = line.split(' ');
    const id = parseInt(parts[0], 10) || -1;
    if (id === pid) {
      parts.shift();
      cmd = parts.join(' ').split(':')[0];
    }
  });
  cmd = cmd.split(' -')[0];
  cmd = cmd.split(' /')[0];
  return cmd;
  // const cmdParts = cmd.split('/');
  // return cmdParts[cmdParts.length - 1];
};

export const networkConnections = async (): Promise<NetworkConnectionsData[]> => {
  await nextTick();
  const result: NetworkConnectionsData[] = [];

  const cmd = 'netstat -natvln | head -n2; netstat -natvln | grep "tcp4\\|tcp6\\|udp4\\|udp6"';
  const states = 'ESTABLISHED|SYN_SENT|SYN_RECV|FIN_WAIT1|FIN_WAIT_1|FIN_WAIT2|FIN_WAIT_2|TIME_WAIT|CLOSE|CLOSE_WAIT|LAST_ACK|LISTEN|CLOSING|UNKNOWN'.split('|');
  let { stdout, stderr } = await execSave(cmd, { maxBuffer: MAX_BUFFER_SIZE });
  const netstat = stdout;
  const neterr = stderr;
  ({ stdout, stderr } = await execSave('ps -axo pid,command', {
    maxBuffer: MAX_BUFFER_SIZE
  }));
  let processes = stdout.toString().split('\n');
  processes = processes.map((line) => {
    return line.trim().replace(/ +/g, ' ');
  });

  if (!neterr) {
    const lines = netstat.split('\n');

    lines.shift();
    let pidPos = 8;
    if (lines.length > 1 && lines[0].indexOf('pid') > 0) {
      const header = (lines.shift() || '')
        .replace(/ Address/g, '_Address')
        .replace(/process:/g, '')
        .replace(/ +/g, ' ')
        .split(' ');
      pidPos = header.indexOf('pid');
    }

    lines.forEach((line) => {
      const lineParts = line.replace(/ +/g, ' ').split(' ');
      if (lineParts.length >= 8) {
        let localip = lineParts[3];
        let localport = '';
        const localaddress = lineParts[3].split('.');
        if (localaddress.length > 1) {
          localport = localaddress[localaddress.length - 1];
          localaddress.pop();
          localip = localaddress.join('.');
        }
        let peerip = lineParts[4];
        let peerport = '';
        const peeraddress = lineParts[4].split('.');
        if (peeraddress.length > 1) {
          peerport = peeraddress[peeraddress.length - 1];
          peeraddress.pop();
          peerip = peeraddress.join('.');
        }
        const hasState = states.indexOf(lineParts[5]) >= 0;
        const connstate = hasState ? lineParts[5] : 'UNKNOWN';
        let pidField = '';
        if (lineParts[lineParts.length - 9] && lineParts[lineParts.length - 9].indexOf(':') >= 0) {
          pidField = lineParts[lineParts.length - 9].split(':')[1];
        } else {
          pidField = lineParts[pidPos + (hasState ? 0 : -1)] || '';

          if (pidField.indexOf(':') >= 0) {
            pidField = pidField.split(':')[1];
          }
        }
        const pid = parseInt(pidField, 10);
        if (connstate) {
          result.push({
            protocol: lineParts[0],
            localAddress: localip,
            localPort: localport,
            peerAddress: peerip,
            peerPort: peerport,
            state: connstate,
            pid: pid,
            process: getProcessName(processes, pid)
          });
        }
      }
    });
    return result;
  }
  return result;
};
