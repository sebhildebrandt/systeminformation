'use strict';

import { nextTick } from '../common';
import { execCmd } from '../common/exec';
import { UserData } from '../common/types';

const parseUsersLinux = (lines: string[], phase: number): UserData[] => {
  let result: UserData[] = [];
  let result_who: UserData[] = [];
  let result_w: any = {};
  let w_first = true;
  let w_header: string[] = [];
  let w_pos: number[] = [];
  let who_line: any = [];

  let is_whopart = true;
  lines.forEach(function (line) {
    if (line === '---') {
      is_whopart = false;
    } else {
      let l = line.replace(/ +/g, ' ').split(' ');

      // who part
      if (is_whopart) {
        result_who.push({
          user: l[0],
          tty: l[1],
          date: l[2],
          time: l[3],
          ip: (l && l.length > 4) ? l[4].replace(/\(/g, '').replace(/\)/g, '') : '',
          command: null
        });
      } else {
        // w part
        if (w_first) {    // header
          w_header = l;
          w_header.forEach(function (item) {
            w_pos.push(line.indexOf(item));
          });
          w_first = false;
        } else {
          // split by w_pos
          result_w.user = line.substring(w_pos[0], w_pos[1] - 1).trim();
          result_w.tty = line.substring(w_pos[1], w_pos[2] - 1).trim();
          result_w.ip = line.substring(w_pos[2], w_pos[3] - 1).replace(/\(/g, '').replace(/\)/g, '').trim();
          result_w.command = line.substring(w_pos[7], 1000).trim();
          // find corresponding 'who' line
          who_line = result_who.filter(function (obj) {
            return (obj.user.substring(0, 8).trim() === result_w.user && obj.tty === result_w.tty);
          });
          if (who_line.length === 1) {
            result.push({
              user: who_line[0].user,
              tty: who_line[0].tty,
              date: who_line[0].date,
              time: who_line[0].time,
              ip: who_line[0].ip,
              command: result_w.command
            });
          }
        }
      }
    }
  });
  if (result.length === 0 && phase === 2) {
    return result_who;
  } else {
    return result;
  }
};

export const linuxUsers = async () => {
  let result: UserData[] = [];
  let stdout = await execCmd('who --ips; echo "---"; w | tail -n +2');
  // lines / split
  let lines = stdout.toString().split('\n');
  result = parseUsersLinux(lines, 1);
  if (result.length === 0) {
    stdout = await execCmd('who; echo "---"; w | tail -n +2');
    // lines / split
    lines = stdout.toString().split('\n');
    result = parseUsersLinux(lines, 2);
  }
  return result;
};

export const users = async () => {
  await nextTick();
  return linuxUsers();
};
