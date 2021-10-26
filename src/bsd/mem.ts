'use strict';

import { getValue, nextTick, noop } from '../common';
import { initMemData } from '../common/initials';
import { MemData } from '../common/types';
import { execCmd } from '../common/exec';

export const bsdMem = async () => {
  let result = initMemData;
  try {
    const stdout = execCmd('/sbin/sysctl -a 2>/dev/null | grep -E "hw.realmem|hw.physmem|vm.stats.vm.v_page_count|vm.stats.vm.v_wire_count|vm.stats.vm.v_active_count|vm.stats.vm.v_inactive_count|vm.stats.vm.v_cache_count|vm.stats.vm.v_free_count|vm.stats.vm.v_page_size"');
    let lines = stdout.toString().split('\n');
    const pagesize = parseInt(getValue(lines, 'vm.stats.vm.v_page_size'), 10);
    const inactive = parseInt(getValue(lines, 'vm.stats.vm.v_inactive_count'), 10) * pagesize;
    const cache = parseInt(getValue(lines, 'vm.stats.vm.v_cache_count'), 10) * pagesize;

    result.total = parseInt(getValue(lines, 'hw.realmem'), 10);
    if (isNaN(result.total)) { result.total = parseInt(getValue(lines, 'hw.physmem'), 10); }
    result.free = parseInt(getValue(lines, 'vm.stats.vm.v_free_count'), 10) * pagesize;
    result.buffcache = inactive + cache;
    result.available = result.buffcache + result.free;
    result.active = result.total - result.free - result.buffcache;

    result.swaptotal = 0;
    result.swapfree = 0;
    result.swapused = 0;
  } catch (e) {
    noop();
  }
  return result;
};

export const mem = async () => {
  await nextTick();
  return bsdMem();
};
