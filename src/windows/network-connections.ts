import { nextTick, toInt } from '../common';
import { execOptsWin } from '../common/const';
import { execSave } from '../common/exec';
import type { NetworkConnectionsData } from '../common/types';

export const networkConnections = async (): Promise<NetworkConnectionsData[]> => {
  await nextTick();
  const result: NetworkConnectionsData[] = [];

  const { stdout, stderr } = await execSave('netstat -nao', execOptsWin);
  if (!stderr) {
    const lineParts = stdout.split('\r\n');

    lineParts.forEach((line: string) => {
      const lineParts = line.trim().replace(/ +/g, ' ').split(' ');
      if (lineParts.length >= 4) {
        let localip = lineParts[1];
        let localport = '';
        const localaddress = lineParts[1].split(':');
        if (localaddress.length > 1) {
          localport = localaddress[localaddress.length - 1];
          localaddress.pop();
          localip = localaddress.join(':');
        }
        localip = localip.replace(/\[/g, '').replace(/\]/g, '');
        let peerip = lineParts[2];
        let peerport = '';
        const peeraddress = lineParts[2].split(':');
        if (peeraddress.length > 1) {
          peerport = peeraddress[peeraddress.length - 1];
          peeraddress.pop();
          peerip = peeraddress.join(':');
        }
        peerip = peerip.replace(/\[/g, '').replace(/\]/g, '');
        const pid = toInt(lineParts[4]);
        let connstate = lineParts[3];
        if (connstate === 'HERGESTELLT') {
          connstate = 'ESTABLISHED';
        }
        if (connstate.startsWith('ABH')) {
          connstate = 'LISTEN';
        }
        if (connstate === 'SCHLIESSEN_WARTEN') {
          connstate = 'CLOSE_WAIT';
        }
        if (connstate === 'WARTEND') {
          connstate = 'TIME_WAIT';
        }
        if (connstate === 'SYN_GESENDET') {
          connstate = 'SYN_SENT';
        }

        if (connstate === 'LISTENING') {
          connstate = 'LISTEN';
        }
        if (connstate === 'SYN_RECEIVED') {
          connstate = 'SYN_RECV';
        }
        if (connstate === 'FIN_WAIT_1') {
          connstate = 'FIN_WAIT1';
        }
        if (connstate === 'FIN_WAIT_2') {
          connstate = 'FIN_WAIT2';
        }
        if (lineParts[0].toLowerCase() !== 'udp' && connstate) {
          result.push({
            protocol: lineParts[0].toLowerCase(),
            localAddress: localip,
            localPort: localport,
            peerAddress: peerip,
            peerPort: peerport,
            state: connstate,
            pid,
            process: ''
          });
        } else if (lineParts[0].toLowerCase() === 'udp') {
          result.push({
            protocol: lineParts[0].toLowerCase(),
            localAddress: localip,
            localPort: localport,
            peerAddress: peerip,
            peerPort: peerport,
            state: '',
            pid: parseInt(lineParts[3], 10),
            process: ''
          });
        }
      }
    });
    return result;
  }
  return result;
};
