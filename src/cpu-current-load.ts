import { loadavg, cpus as oscpu } from 'node:os';
import { nextTick } from './common';
import { LINUX, WINDOWS } from './common/const';
import { exec } from './common/exec';
import type { CurrentLoadData } from './common/types';

let _current_cpu = {
  user: 0,
  nice: 0,
  system: 0,
  idle: 0,
  irq: 0,
  steal: 0,
  guest: 0,
  load: 0,
  tick: 0,
  ms: 0,
  currentLoad: 0,
  currentLoadUser: 0,
  currentLoadSystem: 0,
  currentLoadNice: 0,
  currentLoadIdle: 0,
  currentLoadIrq: 0,
  currentLoadSteal: 0,
  currentLoadGuest: 0,
  rawCurrentLoad: 0,
  rawCurrentLoadUser: 0,
  rawCurrentLoadSystem: 0,
  rawCurrentLoadNice: 0,
  rawCurrentLoadIdle: 0,
  rawCurrentLoadIrq: 0,
  rawCurrentLoadSteal: 0,
  rawCurrentLoadGuest: 0
};
const _cpus: any[] = [];
let _corecount = 0;

export const currentLoad = async () => {
  await nextTick();

  const loads = loadavg().map((x) => x / oscpu().length);
  const avgLoad = parseFloat(Math.max(...loads).toFixed(2));
  let result: CurrentLoadData = {
    avgLoad: 0,
    currentLoad: 0,
    currentLoadUser: 0,
    currentLoadSystem: 0,
    currentLoadNice: 0,
    currentLoadIdle: 0,
    currentLoadIrq: 0,
    currentLoadSteal: 0,
    currentLoadGuest: 0,
    rawCurrentLoad: 0,
    rawCurrentLoadUser: 0,
    rawCurrentLoadSystem: 0,
    rawCurrentLoadNice: 0,
    rawCurrentLoadIdle: 0,
    rawCurrentLoadIrq: 0,
    rawCurrentLoadSteal: 0,
    rawCurrentLoadGuest: 0,
    cpus: []
  };

  const now = Date.now() - _current_cpu.ms;
  if (now >= 200) {
    _current_cpu.ms = Date.now();
    const cpus = oscpu().map((cpu: any) => {
      cpu.times.steal = 0;
      cpu.times.guest = 0;
      if (WINDOWS) {
        // windows: sys (kernel time) already includes irq time — avoid double counting
        cpu.times.sys = Math.max(0, cpu.times.sys - cpu.times.irq);
      }
      return cpu;
    });
    let totalUser = 0;
    let totalSystem = 0;
    let totalNice = 0;
    let totalIrq = 0;
    let totalIdle = 0;
    let totalSteal = 0;
    let totalGuest = 0;
    const cores: any[] = [];
    _corecount = cpus && cpus.length ? cpus.length : 0;

    // linux: try to get other cpu stats
    if (LINUX) {
      try {
        const { stdout } = await exec('cat /proc/stat 2>/dev/null | grep cpu');
        const lines = stdout.split('\n');
        if (lines.length > 1) {
          lines.shift();
          if (lines.length === cpus.length) {
            for (let i = 0; i < lines.length; i++) {
              const parts = lines[i].split(' ');
              if (parts.length >= 10) {
                const steal = parseFloat(parts[8]) || 0;
                const guest = parseFloat(parts[9]) || 0;
                cpus[i].times.steal = steal;
                cpus[i].times.guest = guest;
              }
            }
          }
        }
      } catch {}
    }

    for (let i = 0; i < _corecount; i++) {
      const cpu = cpus[i].times;
      totalUser += cpu.user;
      totalSystem += cpu.sys;
      totalNice += cpu.nice;
      totalIdle += cpu.idle;
      totalIrq += cpu.irq;
      totalSteal += cpu.steal || 0;
      totalGuest += cpu.guest || 0;
      const tmpTick = _cpus && _cpus[i] && _cpus[i].totalTick ? _cpus[i].totalTick : 0;
      const tmpLoad = _cpus && _cpus[i] && _cpus[i].totalLoad ? _cpus[i].totalLoad : 0;
      const tmpUser = _cpus && _cpus[i] && _cpus[i].user ? _cpus[i].user : 0;
      const tmpSystem = _cpus && _cpus[i] && _cpus[i].sys ? _cpus[i].sys : 0;
      const tmpNice = _cpus && _cpus[i] && _cpus[i].nice ? _cpus[i].nice : 0;
      const tmpIdle = _cpus && _cpus[i] && _cpus[i].idle ? _cpus[i].idle : 0;
      const tmpIrq = _cpus && _cpus[i] && _cpus[i].irq ? _cpus[i].irq : 0;
      const tmpSteal = _cpus && _cpus[i] && _cpus[i].steal ? _cpus[i].steal : 0;
      const tmpGuest = _cpus && _cpus[i] && _cpus[i].guest ? _cpus[i].guest : 0;
      _cpus[i] = cpu;
      _cpus[i].totalTick = _cpus[i].user + _cpus[i].sys + _cpus[i].nice + _cpus[i].irq + _cpus[i].steal + _cpus[i].guest + _cpus[i].idle;
      _cpus[i].totalLoad = _cpus[i].user + _cpus[i].sys + _cpus[i].nice + _cpus[i].irq + _cpus[i].steal + _cpus[i].guest;
      _cpus[i].currentTick = _cpus[i].totalTick - tmpTick;
      _cpus[i].load = _cpus[i].totalLoad - tmpLoad;
      _cpus[i].loadUser = _cpus[i].user - tmpUser;
      _cpus[i].loadSystem = _cpus[i].sys - tmpSystem;
      _cpus[i].loadNice = _cpus[i].nice - tmpNice;
      _cpus[i].loadIdle = _cpus[i].idle - tmpIdle;
      _cpus[i].loadIrq = _cpus[i].irq - tmpIrq;
      _cpus[i].loadSteal = _cpus[i].steal - tmpSteal;
      _cpus[i].loadGuest = _cpus[i].guest - tmpGuest;
      cores[i] = {};
      const coreTick = _cpus[i].currentTick || 1;
      cores[i].load = (_cpus[i].load / coreTick) * 100;
      cores[i].loadUser = (_cpus[i].loadUser / coreTick) * 100;
      cores[i].loadSystem = (_cpus[i].loadSystem / coreTick) * 100;
      cores[i].loadNice = (_cpus[i].loadNice / coreTick) * 100;
      cores[i].loadIdle = (_cpus[i].loadIdle / coreTick) * 100;
      cores[i].loadIrq = (_cpus[i].loadIrq / coreTick) * 100;
      cores[i].loadSteal = (_cpus[i].loadSteal / coreTick) * 100;
      cores[i].loadGuest = (_cpus[i].loadGuest / coreTick) * 100;
      cores[i].rawLoad = _cpus[i].load;
      cores[i].rawLoadUser = _cpus[i].loadUser;
      cores[i].rawLoadSystem = _cpus[i].loadSystem;
      cores[i].rawLoadNice = _cpus[i].loadNice;
      cores[i].rawLoadIdle = _cpus[i].loadIdle;
      cores[i].rawLoadIrq = _cpus[i].loadIrq;
      cores[i].rawLoadSteal = _cpus[i].loadSteal;
      cores[i].rawLoadGuest = _cpus[i].loadGuest;
    }
    const totalTick = totalUser + totalSystem + totalNice + totalIrq + totalSteal + totalGuest + totalIdle;
    const totalLoad = totalUser + totalSystem + totalNice + totalIrq + totalSteal + totalGuest;
    const currentTick = totalTick - _current_cpu.tick || 1;
    result = {
      avgLoad: avgLoad,
      currentLoad: ((totalLoad - _current_cpu.load) / currentTick) * 100,
      currentLoadUser: ((totalUser - _current_cpu.user) / currentTick) * 100,
      currentLoadSystem: ((totalSystem - _current_cpu.system) / currentTick) * 100,
      currentLoadNice: ((totalNice - _current_cpu.nice) / currentTick) * 100,
      currentLoadIdle: ((totalIdle - _current_cpu.idle) / currentTick) * 100,
      currentLoadIrq: ((totalIrq - _current_cpu.irq) / currentTick) * 100,
      currentLoadSteal: ((totalSteal - _current_cpu.steal) / currentTick) * 100,
      currentLoadGuest: ((totalGuest - _current_cpu.guest) / currentTick) * 100,
      rawCurrentLoad: totalLoad - _current_cpu.load,
      rawCurrentLoadUser: totalUser - _current_cpu.user,
      rawCurrentLoadSystem: totalSystem - _current_cpu.system,
      rawCurrentLoadNice: totalNice - _current_cpu.nice,
      rawCurrentLoadIdle: totalIdle - _current_cpu.idle,
      rawCurrentLoadIrq: totalIrq - _current_cpu.irq,
      rawCurrentLoadSteal: totalSteal - _current_cpu.steal,
      rawCurrentLoadGuest: totalGuest - _current_cpu.guest,
      cpus: cores
    };
    _current_cpu = {
      user: totalUser,
      nice: totalNice,
      system: totalSystem,
      idle: totalIdle,
      irq: totalIrq,
      steal: totalSteal,
      guest: totalGuest,
      tick: totalTick,
      load: totalLoad,
      ms: _current_cpu.ms,
      currentLoad: result.currentLoad,
      currentLoadUser: result.currentLoadUser,
      currentLoadSystem: result.currentLoadSystem,
      currentLoadNice: result.currentLoadNice,
      currentLoadIdle: result.currentLoadIdle,
      currentLoadIrq: result.currentLoadIrq,
      currentLoadSteal: result.currentLoadSteal,
      currentLoadGuest: result.currentLoadGuest,
      rawCurrentLoad: result.rawCurrentLoad,
      rawCurrentLoadUser: result.rawCurrentLoadUser,
      rawCurrentLoadSystem: result.rawCurrentLoadSystem,
      rawCurrentLoadNice: result.rawCurrentLoadNice,
      rawCurrentLoadIdle: result.rawCurrentLoadIdle,
      rawCurrentLoadIrq: result.rawCurrentLoadIrq,
      rawCurrentLoadSteal: result.rawCurrentLoadSteal,
      rawCurrentLoadGuest: result.rawCurrentLoadGuest
    };
  } else {
    const cores: any[] = [];
    for (let i = 0; i < _corecount; i++) {
      cores[i] = {};
      const coreTick = _cpus[i].currentTick || 1;
      cores[i].load = (_cpus[i].load / coreTick) * 100;
      cores[i].loadUser = (_cpus[i].loadUser / coreTick) * 100;
      cores[i].loadSystem = (_cpus[i].loadSystem / coreTick) * 100;
      cores[i].loadNice = (_cpus[i].loadNice / coreTick) * 100;
      cores[i].loadIdle = (_cpus[i].loadIdle / coreTick) * 100;
      cores[i].loadIrq = (_cpus[i].loadIrq / coreTick) * 100;
      cores[i].loadSteal = (_cpus[i].loadSteal / coreTick) * 100;
      cores[i].loadGuest = (_cpus[i].loadGuest / coreTick) * 100;
      cores[i].rawLoad = _cpus[i].load;
      cores[i].rawLoadUser = _cpus[i].loadUser;
      cores[i].rawLoadSystem = _cpus[i].loadSystem;
      cores[i].rawLoadNice = _cpus[i].loadNice;
      cores[i].rawLoadIdle = _cpus[i].loadIdle;
      cores[i].rawLoadIrq = _cpus[i].loadIrq;
      cores[i].rawLoadSteal = _cpus[i].loadSteal;
      cores[i].rawLoadGuest = _cpus[i].loadGuest;
    }
    result = {
      avgLoad: avgLoad,
      currentLoad: _current_cpu.currentLoad,
      currentLoadUser: _current_cpu.currentLoadUser,
      currentLoadSystem: _current_cpu.currentLoadSystem,
      currentLoadNice: _current_cpu.currentLoadNice,
      currentLoadIdle: _current_cpu.currentLoadIdle,
      currentLoadIrq: _current_cpu.currentLoadIrq,
      currentLoadSteal: _current_cpu.currentLoadSteal,
      currentLoadGuest: _current_cpu.currentLoadGuest,
      rawCurrentLoad: _current_cpu.rawCurrentLoad,
      rawCurrentLoadUser: _current_cpu.rawCurrentLoadUser,
      rawCurrentLoadSystem: _current_cpu.rawCurrentLoadSystem,
      rawCurrentLoadNice: _current_cpu.rawCurrentLoadNice,
      rawCurrentLoadIdle: _current_cpu.rawCurrentLoadIdle,
      rawCurrentLoadIrq: _current_cpu.rawCurrentLoadIrq,
      rawCurrentLoadSteal: _current_cpu.rawCurrentLoadSteal,
      rawCurrentLoadGuest: _current_cpu.rawCurrentLoadGuest,
      cpus: cores
    };
  }

  return result;
};
