import { uptime } from 'node:os';
import { DARWIN, LINUX } from './common/const';

export const time = async () => {
  const t = new Date().toString().split(' ');
  let timezoneName = '';
  try {
    timezoneName = Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    timezoneName = t.length >= 7 ? t.slice(6).join(' ').replace(/\(/g, '').replace(/\)/g, '') : '';
  }

  const result = {
    current: Date.now(),
    uptime: uptime(),
    timezone: t.length >= 7 ? t[5] : '',
    timezoneName
  };

  switch (true) {
    case LINUX || DARWIN:
      return (await import('./linux/time.js')).nixTime() || result;
    default:
      return result;
  }
};
