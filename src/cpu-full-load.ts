import { cpus } from 'node:os';
import { nextTick } from './common';
import { WINDOWS } from './common/const';

export const fullLoad = async () => {
  await nextTick();

  const oscpus = cpus();
  let totalUser = 0;
  let totalSystem = 0;
  let totalNice = 0;
  let totalIrq = 0;
  let totalIdle = 0;

  let result = 0;

  if (oscpus && oscpus.length) {
    for (let i = 0, len = oscpus.length; i < len; i++) {
      const cpu = oscpus[i].times;
      totalUser += cpu.user;
      // windows: sys (kernel time) already includes irq time — avoid double counting
      totalSystem += WINDOWS ? Math.max(0, cpu.sys - cpu.irq) : cpu.sys;
      totalNice += cpu.nice;
      totalIrq += cpu.irq;
      totalIdle += cpu.idle;
    }
    const totalTicks = totalIdle + totalIrq + totalNice + totalSystem + totalUser;
    result = ((totalTicks - totalIdle) / totalTicks) * 100.0;
  }
  return result;
};
