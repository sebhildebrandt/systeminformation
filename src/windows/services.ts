import { getValue, nextTick, toInt } from '../common';
import { isPrototypePolluted, sanitizeServiceString } from '../common/security';
import type { ServicesData } from '../common/types';
import { ps } from '../common/windows';

export const services = async (srv: string): Promise<ServicesData[]> => {
  await nextTick();
  const result: ServicesData[] = [];
  if (!isPrototypePolluted()) {
    const srvs = sanitizeServiceString(srv);
    const dataSrv: any[] = [];

    try {
      let wincommand = 'Get-CimInstance Win32_Service';
      if (srvs[0] !== '*') {
        wincommand += ' -Filter "';
        srvs.forEach((srv: string) => {
          wincommand += `Name='${srv}' or `;
        });
        wincommand = `${wincommand.slice(0, -4)}"`;
      }
      wincommand += ' | select Name,Caption,Started,StartMode,ProcessId | fl';

      const stdout: string = await ps.exec(wincommand);
      if (stdout) {
        const serviceSections = stdout.split(/\n\s*\n/);
        serviceSections.forEach((element) => {
          if (element.trim() !== '') {
            const lines = element.trim().split('\r\n');
            const srvName = getValue(lines, 'Name', ':', true).toLowerCase();
            const srvCaption = getValue(lines, 'Caption', ':', true).toLowerCase();
            const started = getValue(lines, 'Started', ':', true);
            const startMode = getValue(lines, 'StartMode', ':', true);
            const pid = toInt(getValue(lines, 'ProcessId', ':', true));
            if ((srvs.length === 1 && srvs[0] === '*') || srvs.indexOf(srvName) >= 0 || srvs.indexOf(srvCaption) >= 0) {
              result.push({
                name: srvName,
                running: started.toLowerCase() === 'true',
                startmode: startMode,
                lastChanged: null,
                pids: [pid],
                cpu: 0,
                mem: 0
              });
              dataSrv.push(srvName);
              dataSrv.push(srvCaption);
            }
          }
        });
        if (srvs.length !== 1 || srvs[0] !== '*') {
          const srvsMissing = srvs.filter((e: string) => {
            return dataSrv.indexOf(e) === -1;
          });
          srvsMissing.forEach((srvName: string) => {
            result.push({
              name: srvName,
              running: false,
              startmode: '',
              lastChanged: null,
              pids: [],
              cpu: 0,
              mem: 0
            });
          });
        }
        return result;
      } else {
        srvs.forEach((srvName: string) => {
          result.push({
            name: srvName,
            running: false,
            startmode: '',
            lastChanged: null,
            pids: [],
            cpu: 0,
            mem: 0
          });
        });
        return result;
      }
    } catch {}
  }
  return result;
};
