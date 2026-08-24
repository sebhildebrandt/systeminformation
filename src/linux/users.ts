import { execOptsLinux } from '../common/const';
import { parseDateUnix } from '../common/datetime';
import { nextTick } from '../common';
import { exec } from '../common/exec';
import type { UserData } from '../common/types';

const parseUsersLinux = (lines: string[], phase: number): UserData[] => {
  const result: UserData[] = [];
  let result_who: UserData[] = [];
  const result_w: any = {};
  let w_first = true;
  let w_header: string[] = [];
  const w_pos: number[] = [];
  let who_line: any = [];

  let is_whopart = true;
  let is_whoerror = false;

  lines.forEach((line) => {
    if (line === '---') {
      is_whopart = false;
    } else {
      const l = line.replace(/ +/g, ' ').split(' ');

      // who part
      if (is_whopart) {
        if (line.toLowerCase().indexOf('unexpected') >= 0 || line.toLowerCase().indexOf('unrecognized') >= 0) {
          is_whoerror = true;
          result_who = [];
        }
        if (!is_whoerror) {
          const timePos = l && l.length > 4 && l[4].indexOf(':') > 0 ? 4 : 3;
          result_who.push({
            user: l[0],
            tty: l[1],
            date: timePos === 4 ? parseDateUnix(`${l[2]} ${l[3]}`) : l[2],
            time: l[timePos],
            ip: l && l.length > timePos + 1 ? l[timePos + 1].replace(/\(/g, '').replace(/\)/g, '') : '',
            command: null
          });
        }
      } else {
        // w part
        if (w_first) {
          // header
          if (!line.startsWith(' ')) {
            w_header = l;
            w_header.forEach((item) => {
              w_pos.push(line.indexOf(item));
            });
            w_first = false;
          }
        } else {
          // split by w_pos
          result_w.user = line.substring(w_pos[0], w_pos[1] - 1).trim();
          result_w.tty = line.substring(w_pos[1], w_pos[2] - 1).trim();
          result_w.ip = line
            .substring(w_pos[2], w_pos[3] - 1)
            .replace(/\(/g, '')
            .replace(/\)/g, '')
            .trim();
          result_w.command = line.substring(w_pos[7], 1000).trim();
          // find corresponding 'who' line
          if (result_who.length || phase === 1) {
            who_line = result_who.filter((obj) => {
              return obj.user.substring(0, 8).trim() === result_w.user && obj.tty === result_w.tty;
            });
          } else {
            who_line = [{ user: result_w.user, tty: result_w.tty, date: '', time: '', ip: '' }];
          }
          if (who_line.length === 1 && who_line[0].user !== '') {
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

export const users = async () => {
  await nextTick();
  let result: UserData[] = [];
  let { stdout } = await exec('export LC_ALL=C; who --ips; echo "---"; w; unset LC_ALL | tail -n +2', execOptsLinux);
  // lines / split
  let lines = stdout.toString().split('\n');
  result = parseUsersLinux(lines, 1);
  if (result.length === 0) {
    ({ stdout } = await exec('who; echo "---"; w | tail -n +2', execOptsLinux));
    // lines / split
    lines = stdout.toString().split('\n');
    result = parseUsersLinux(lines, 2);
  }
  return result;
};
