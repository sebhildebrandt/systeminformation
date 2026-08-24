import { nextTick, toInt } from '../common';
import { FREEBSD, MAX_BUFFER_SIZE, NETBSD, OPENBSD } from '../common/const';
import { execSave } from '../common/exec';
import type { NetworkConnectionsData } from '../common/types';

export const networkConnections = async (): Promise<NetworkConnectionsData[]> => {
  await nextTick();
  const result: NetworkConnectionsData[] = [];

  let stdout = '';
  let stderr = '';
  let cmd = 'export LC_ALL=C; netstat -tunap | grep "ESTABLISHED\\|SYN_SENT\\|SYN_RECV\\|FIN_WAIT1\\|FIN_WAIT2\\|TIME_WAIT\\|CLOSE\\|CLOSE_WAIT\\|LAST_ACK\\|LISTEN\\|CLOSING\\|UNKNOWN"; unset LC_ALL';
  if (FREEBSD || NETBSD || OPENBSD) {
    cmd = 'export LC_ALL=C; netstat -na | grep "ESTABLISHED\\|SYN_SENT\\|SYN_RECV\\|FIN_WAIT1\\|FIN_WAIT2\\|TIME_WAIT\\|CLOSE\\|CLOSE_WAIT\\|LAST_ACK\\|LISTEN\\|CLOSING\\|UNKNOWN"; unset LC_ALL';
  }
  ({ stdout, stderr } = await execSave(cmd, { maxBuffer: MAX_BUFFER_SIZE }));
  const lines = stdout.split('\n');
  if (!stderr && (lines.length > 1 || lines[0] !== '')) {
    lines.forEach((line: string) => {
      const lineParts = line.replace(/ +/g, ' ').split(' ');
      if (lineParts.length >= 7) {
        let localip = lineParts[3];
        let localport = '';
        const localaddress = lineParts[3].split(':');
        if (localaddress.length > 1) {
          localport = localaddress[localaddress.length - 1];
          localaddress.pop();
          localip = localaddress.join(':');
        }
        let peerip = lineParts[4];
        let peerport = '';
        const peeraddress = lineParts[4].split(':');
        if (peeraddress.length > 1) {
          peerport = peeraddress[peeraddress.length - 1];
          peeraddress.pop();
          peerip = peeraddress.join(':');
        }
        const connstate = lineParts[5];
        const proc = lineParts[6].split('/');

        if (connstate) {
          result.push({
            protocol: lineParts[0],
            localAddress: localip,
            localPort: localport,
            peerAddress: peerip,
            peerPort: peerport,
            state: connstate,
            pid: proc[0] && proc[0] !== '-' ? toInt(proc[0]) : null,
            process: proc[1] ? proc[1].split(' ')[0].split(':')[0] : ''
          });
        }
      }
    });
    return result;
  } else {
    cmd = 'ss -tunap | grep "ESTAB\\|SYN-SENT\\|SYN-RECV\\|FIN-WAIT1\\|FIN-WAIT2\\|TIME-WAIT\\|CLOSE\\|CLOSE-WAIT\\|LAST-ACK\\|LISTEN\\|CLOSING"';
    ({ stdout, stderr } = await execSave(cmd, { maxBuffer: MAX_BUFFER_SIZE }));

    if (!stderr) {
      const lines = stdout.toString().split('\n');
      lines.forEach((line) => {
        const lineParts = line.replace(/ +/g, ' ').split(' ');
        if (lineParts.length >= 6) {
          let localip = lineParts[4];
          let localport = '';
          const localaddress = lineParts[4].split(':');
          if (localaddress.length > 1) {
            localport = localaddress[localaddress.length - 1];
            localaddress.pop();
            localip = localaddress.join(':');
          }
          let peerip = lineParts[5];
          let peerport = '';
          const peeraddress = lineParts[5].split(':');
          if (peeraddress.length > 1) {
            peerport = peeraddress[peeraddress.length - 1];
            peeraddress.pop();
            peerip = peeraddress.join(':');
          }
          let connstate = lineParts[1];
          if (connstate === 'ESTAB') {
            connstate = 'ESTABLISHED';
          }
          if (connstate === 'TIME-WAIT') {
            connstate = 'TIME_WAIT';
          }
          let pid = null;
          let process = '';
          if (lineParts.length >= 7 && lineParts[6].indexOf('users:') > -1) {
            const proc = lineParts[6].replace('users:(("', '').replace(/"/g, '').split(',');
            if (proc.length > 2) {
              process = proc[0].split(' ')[0].split(':')[0];
              pid = toInt(proc[1]);
            }
          }
          if (connstate) {
            result.push({
              protocol: lineParts[0],
              localAddress: localip,
              localPort: localport,
              peerAddress: peerip,
              peerPort: peerport,
              state: connstate,
              pid,
              process
            });
          }
        }
      });
    }
    return result;
  }
};
