'use strict';

import { WINDOWS } from "./common/const";
import { execCmd } from "./common/exec";

export const shell = () => {
  return new Promise((resolve) => {
    process.nextTick(async () => {
      if (WINDOWS) {
        resolve('cmd');
      } else {
        let result = '';
        try {
          const stdout = await execCmd('echo $SHELL');
          resolve(stdout.toString().split('\n')[0]);
        } catch (e) {
          resolve(result);
        }
      }
    });
  });
};
