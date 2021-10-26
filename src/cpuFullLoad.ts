import * as os from 'os';
import { nextTick } from './common';

const getFullLoad = () => {

  const cpus = os.cpus();
  let totalUser = 0;
  let totalSystem = 0;
  let totalNice = 0;
  let totalIrq = 0;
  let totalIdle = 0;

  let result = 0;

  if (cpus && cpus.length) {
    for (let i = 0, len = cpus.length; i < len; i++) {
      const cpu = cpus[i].times;
      totalUser += cpu.user;
      totalSystem += cpu.sys;
      totalNice += cpu.nice;
      totalIrq += cpu.irq;
      totalIdle += cpu.idle;
    }
    const totalTicks = totalIdle + totalIrq + totalNice + totalSystem + totalUser;
    result = (totalTicks - totalIdle) / totalTicks * 100.0;

  } else {
    result = 0;
  }
  return result;
};

export const fullLoad = async () => {
  await nextTick();
  return getFullLoad();
};
