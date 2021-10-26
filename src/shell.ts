'use strict';

import { nextTick } from "./common";
import { WINDOWS } from "./common/const";
import { execCmd } from "./common/exec";

export const shell = async () => {
  await nextTick();
  if (WINDOWS) {
    return 'cmd';
  } else {
    let result = '';
    try {
      const stdout = await execCmd('echo $SHELL');
      return stdout.toString().split('\n')[0];
    } catch (e) {
      return result;
    }
  }
};
