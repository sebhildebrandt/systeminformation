import { cpus as oscpu, loadavg } from 'os';
import { nextTick } from './common';
import { CurrentLoadData } from './common/types';

let _current_cpu = {
  user: 0,
  nice: 0,
  system: 0,
  idle: 0,
  irq: 0,
  load: 0,
  tick: 0,
  ms: 0,
  currentLoad: 0,
  currentLoadUser: 0,
  currentLoadSystem: 0,
  currentLoadNice: 0,
  currentLoadIdle: 0,
  currentLoadIrq: 0,
  rawCurrentLoad: 0,
  rawCurrentLoadUser: 0,
  rawCurrentLoadSystem: 0,
  rawCurrentLoadNice: 0,
  rawCurrentLoadIdle: 0,
  rawCurrentLoadIrq: 0
};
const _cpus: any[] = [];
let _corecount = 0;


const getLoad = async () => {

  const loads = loadavg().map((x: number) => { return x / oscpu().length; });
  const avgLoad = parseFloat((Math.max(...loads)).toFixed(2));
  let result: CurrentLoadData = {
    avgLoad: 0,
    currentLoad: 0,
    currentLoadUser: 0,
    currentLoadSystem: 0,
    currentLoadNice: 0,
    currentLoadIdle: 0,
    currentLoadIrq: 0,
    rawCurrentLoad: 0,
    rawCurrentLoadUser: 0,
    rawCurrentLoadSystem: 0,
    rawCurrentLoadNice: 0,
    rawCurrentLoadIdle: 0,
    rawCurrentLoadIrq: 0,
    cpus: []
  };

  const now = Date.now() - _current_cpu.ms;
  if (now >= 200) {
    _current_cpu.ms = Date.now();
    const cpus = oscpu();
    let totalUser = 0;
    let totalSystem = 0;
    let totalNice = 0;
    let totalIrq = 0;
    let totalIdle = 0;
    const cores: any[] = [];
    _corecount = (cpus && cpus.length) ? cpus.length : 0;

    for (let i = 0; i < _corecount; i++) {
      const cpu = cpus[i].times;
      totalUser += cpu.user;
      totalSystem += cpu.sys;
      totalNice += cpu.nice;
      totalIdle += cpu.idle;
      totalIrq += cpu.irq;
      const tmpTick = (_cpus && _cpus[i] && _cpus[i].totalTick ? _cpus[i].totalTick : 0);
      const tmpLoad = (_cpus && _cpus[i] && _cpus[i].totalLoad ? _cpus[i].totalLoad : 0);
      const tmpUser = (_cpus && _cpus[i] && _cpus[i].user ? _cpus[i].user : 0);
      const tmpSystem = (_cpus && _cpus[i] && _cpus[i].sys ? _cpus[i].sys : 0);
      const tmpNice = (_cpus && _cpus[i] && _cpus[i].nice ? _cpus[i].nice : 0);
      const tmpIdle = (_cpus && _cpus[i] && _cpus[i].idle ? _cpus[i].idle : 0);
      const tmpIrq = (_cpus && _cpus[i] && _cpus[i].irq ? _cpus[i].irq : 0);
      _cpus[i] = cpu;
      _cpus[i].totalTick = _cpus[i].user + _cpus[i].sys + _cpus[i].nice + _cpus[i].irq + _cpus[i].idle;
      _cpus[i].totalLoad = _cpus[i].user + _cpus[i].sys + _cpus[i].nice + _cpus[i].irq;
      _cpus[i].currentTick = _cpus[i].totalTick - tmpTick;
      _cpus[i].load = (_cpus[i].totalLoad - tmpLoad);
      _cpus[i].loadUser = (_cpus[i].user - tmpUser);
      _cpus[i].loadSystem = (_cpus[i].sys - tmpSystem);
      _cpus[i].loadNice = (_cpus[i].nice - tmpNice);
      _cpus[i].loadIdle = (_cpus[i].idle - tmpIdle);
      _cpus[i].loadIrq = (_cpus[i].irq - tmpIrq);
      cores[i] = {};
      cores[i].load = _cpus[i].load / _cpus[i].currentTick * 100;
      cores[i].loadUser = _cpus[i].loadUser / _cpus[i].currentTick * 100;
      cores[i].loadSystem = _cpus[i].loadSystem / _cpus[i].currentTick * 100;
      cores[i].loadNice = _cpus[i].loadNice / _cpus[i].currentTick * 100;
      cores[i].loadIdle = _cpus[i].loadIdle / _cpus[i].currentTick * 100;
      cores[i].loadIrq = _cpus[i].loadIrq / _cpus[i].currentTick * 100;
      cores[i].rawLoad = _cpus[i].load;
      cores[i].rawLoadUser = _cpus[i].loadUser;
      cores[i].rawLoadSystem = _cpus[i].loadSystem;
      cores[i].rawLoadNice = _cpus[i].loadNice;
      cores[i].rawLoadIdle = _cpus[i].loadIdle;
      cores[i].rawLoadIrq = _cpus[i].loadIrq;
    }
    const totalTick = totalUser + totalSystem + totalNice + totalIrq + totalIdle;
    const totalLoad = totalUser + totalSystem + totalNice + totalIrq;
    const currentTick = totalTick - _current_cpu.tick;
    result = {
      avgLoad: avgLoad,
      currentLoad: (totalLoad - _current_cpu.load) / currentTick * 100,
      currentLoadUser: (totalUser - _current_cpu.user) / currentTick * 100,
      currentLoadSystem: (totalSystem - _current_cpu.system) / currentTick * 100,
      currentLoadNice: (totalNice - _current_cpu.nice) / currentTick * 100,
      currentLoadIdle: (totalIdle - _current_cpu.idle) / currentTick * 100,
      currentLoadIrq: (totalIrq - _current_cpu.irq) / currentTick * 100,
      rawCurrentLoad: (totalLoad - _current_cpu.load),
      rawCurrentLoadUser: (totalUser - _current_cpu.user),
      rawCurrentLoadSystem: (totalSystem - _current_cpu.system),
      rawCurrentLoadNice: (totalNice - _current_cpu.nice),
      rawCurrentLoadIdle: (totalIdle - _current_cpu.idle),
      rawCurrentLoadIrq: (totalIrq - _current_cpu.irq),
      cpus: cores
    };
    _current_cpu = {
      user: totalUser,
      nice: totalNice,
      system: totalSystem,
      idle: totalIdle,
      irq: totalIrq,
      tick: totalTick,
      load: totalLoad,
      ms: _current_cpu.ms,
      currentLoad: result.currentLoad,
      currentLoadUser: result.currentLoadUser,
      currentLoadSystem: result.currentLoadSystem,
      currentLoadNice: result.currentLoadNice,
      currentLoadIdle: result.currentLoadIdle,
      currentLoadIrq: result.currentLoadIrq,
      rawCurrentLoad: result.rawCurrentLoad,
      rawCurrentLoadUser: result.rawCurrentLoadUser,
      rawCurrentLoadSystem: result.rawCurrentLoadSystem,
      rawCurrentLoadNice: result.rawCurrentLoadNice,
      rawCurrentLoadIdle: result.rawCurrentLoadIdle,
      rawCurrentLoadIrq: result.rawCurrentLoadIrq,
    };
  } else {
    const cores: any[] = [];
    for (let i = 0; i < _corecount; i++) {
      cores[i] = {};
      cores[i].load = _cpus[i].load / _cpus[i].currentTick * 100;
      cores[i].loadUser = _cpus[i].loadUser / _cpus[i].currentTick * 100;
      cores[i].loadSystem = _cpus[i].loadSystem / _cpus[i].currentTick * 100;
      cores[i].loadNice = _cpus[i].loadNice / _cpus[i].currentTick * 100;
      cores[i].loadIdle = _cpus[i].loadIdle / _cpus[i].currentTick * 100;
      cores[i].loadIrq = _cpus[i].loadIrq / _cpus[i].currentTick * 100;
      cores[i].rawLoad = _cpus[i].load;
      cores[i].rawLoadUser = _cpus[i].loadUser;
      cores[i].rawLoadSystem = _cpus[i].loadSystem;
      cores[i].rawLoadNice = _cpus[i].loadNice;
      cores[i].rawLoadIdle = _cpus[i].loadIdle;
      cores[i].rawLoadIrq = _cpus[i].loadIrq;
    }
    result = {
      avgLoad: avgLoad,
      currentLoad: _current_cpu.currentLoad,
      currentLoadUser: _current_cpu.currentLoadUser,
      currentLoadSystem: _current_cpu.currentLoadSystem,
      currentLoadNice: _current_cpu.currentLoadNice,
      currentLoadIdle: _current_cpu.currentLoadIdle,
      currentLoadIrq: _current_cpu.currentLoadIrq,
      rawCurrentLoad: _current_cpu.rawCurrentLoad,
      rawCurrentLoadUser: _current_cpu.rawCurrentLoadUser,
      rawCurrentLoadSystem: _current_cpu.rawCurrentLoadSystem,
      rawCurrentLoadNice: _current_cpu.rawCurrentLoadNice,
      rawCurrentLoadIdle: _current_cpu.rawCurrentLoadIdle,
      rawCurrentLoadIrq: _current_cpu.rawCurrentLoadIrq,
      cpus: cores
    };
  }
  return result;
};

export const currentLoad = async () => {
  await nextTick();
  return await getLoad();
};
