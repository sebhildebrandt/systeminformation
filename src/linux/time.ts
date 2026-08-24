import { EOL, uptime } from 'node:os';
import { execSync } from 'child_process';

export const nixTime = () => {
  try {
    const stdout = execSync('date +%Z && date +%z && ls -l /etc/localtime 2>/dev/null');
    const lines = stdout.toString().split(EOL);
    if (lines.length > 3 && !lines[0]) {
      lines.shift();
    }
    let timezone = lines[0] || '';
    if (timezone.startsWith('+') || timezone.startsWith('-')) {
      timezone = 'GMT';
    }
    return {
      current: Date.now(),
      uptime: uptime(),
      timezone: lines[1] ? timezone + lines[1] : timezone,
      timezoneName: lines[2] && lines[2].indexOf('/zoneinfo/') > 0 ? lines[2].split('/zoneinfo/')[1] || '' : ''
    };
  } catch (e) {
    return null;
  }
};
