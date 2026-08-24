import { getValue, nextTick } from '../common';
import type { UserData } from '../common/types';
import { ps } from '../common/windows';

const parseWinSessions = (sessionParts: string[]) => {
  const sessions: any = {};
  sessionParts.forEach((session) => {
    const lines = session.split('\r\n');
    const id = getValue(lines, 'LogonId');
    const starttime = getValue(lines, 'starttime');
    if (id) {
      sessions[id] = starttime;
    }
  });
  return sessions;
};

function fuzzyMatch(name1: string, name2: string) {
  name1 = name1.toLowerCase();
  name2 = name2.toLowerCase();
  let eq = 0;
  let len = name1.length;
  if (name2.length > len) {
    len = name2.length;
  }

  for (let i = 0; i < len; i++) {
    const c1 = name1[i] || '';
    const c2 = name2[i] || '';
    if (c1 === c2) {
      eq++;
    }
  }
  return len > 10 ? eq / len > 0.9 : len > 0 ? eq / len > 0.8 : false;
}

function parseWinUsers(userParts: string[], userQuery: any[]) {
  const users: any = [];
  userParts.forEach((user) => {
    const lines = user.split('\r\n');

    const domain = getValue(lines, 'domain', ':', true);
    const username = getValue(lines, 'user', ':', true);
    const sessionid = getValue(lines, 'sessionid', ':', true);

    if (username) {
      const quser = userQuery.filter((item) => fuzzyMatch(item.user, username));
      users.push({
        domain,
        user: username,
        tty: quser?.[0]?.tty ? quser[0].tty : sessionid
      });
    }
  });
  return users;
}

function parseWinLoggedOn(loggedonParts: string[]) {
  const loggedons: { [index: string]: any } = {};
  loggedonParts.forEach((loggedon) => {
    const lines = loggedon.split('\r\n');

    const antecendent = getValue(lines, 'antecedent', ':', true);
    let parts = antecendent.split('=');
    const name = parts.length > 2 ? parts[1].split(',')[0].replace(/"/g, '').trim() : '';
    const domain = parts.length > 2 ? parts[2].replace(/"/g, '').replace(/\)/g, '').trim() : '';
    const dependent = getValue(lines, 'dependent', ':', true);
    parts = dependent.split('=');
    const id = parts.length > 1 ? parts[1].replace(/"/g, '').replace(/\)/g, '').trim() : '';
    if (id) {
      loggedons[id] = {
        domain,
        user: name
      };
    }
  });
  return loggedons;
}

const parseWinUsersQuery = (lines: string[]) => {
  lines = lines.filter((item) => item);
  const result = [];
  const header = lines[0];
  const headerDelimiter = [];
  if (header) {
    const start = header[0] === ' ' ? 1 : 0;
    headerDelimiter.push(start - 1);
    let nextSpace = 0;
    for (let i = start + 1; i < header.length; i++) {
      if (header[i] === ' ' && (header[i - 1] === ' ' || header[i - 1] === '.')) {
        nextSpace = i;
      } else {
        if (nextSpace) {
          headerDelimiter.push(nextSpace);
          nextSpace = 0;
        }
      }
    }
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const user = lines[i].substring(headerDelimiter[0] + 1, headerDelimiter[1]).trim() || '';
        const tty = lines[i].substring(headerDelimiter[1] + 1, headerDelimiter[2] - 2).trim() || '';
        result.push({
          user: user,
          tty: tty
        });
      }
    }
  }
  return result;
};

export const users = async () => {
  await nextTick();
  const result: UserData[] = [];
  try {
    let cmd = "$ErrorActionPreference = 'SilentlyContinue'; ";
    cmd += 'Get-CimInstance Win32_LogonSession | select LogonId,@{n="StartTime";e={$_.StartTime.ToString("yyyy-MM-dd HH:mm:ss")}} | fl' + "; echo '#-#-#-#';";
    cmd += 'Get-CimInstance Win32_LoggedOnUser | select antecedent,dependent | fl ' + "; echo '#-#-#-#';";
    cmd +=
      "$process = @(Get-CimInstance Win32_Process -Filter \"name = 'explorer.exe'\"); if ($process.Count -gt 0) { Invoke-CimMethod -InputObject $process[0] -MethodName GetOwner | select user, domain | fl; get-process -name explorer | select-object sessionid | fl }; echo '#-#-#-#';";
    cmd += 'query user';

    const stdout = await ps.exec(cmd);
    const data: string[] = stdout ? stdout.toString().split('#-#-#-#') : ['', '', '', ''];

    const sessions = parseWinSessions((data[0] || '').split(/\n\s*\n/));
    const loggedons = parseWinLoggedOn((data[1] || '').split(/\n\s*\n/));
    const queryUser = parseWinUsersQuery((data[3] || '').split('\r\n'));
    const users = parseWinUsers((data[2] || '').split(/\n\s*\n/), queryUser);

    for (const id in loggedons) {
      if (Object.prototype.hasOwnProperty.call(loggedons, id)) {
        loggedons[id].dateTime = Object.prototype.hasOwnProperty.call(sessions, id) ? sessions[id] : '';
      }
    }
    users.forEach((user: any) => {
      let dateTime = '';
      for (const id in loggedons) {
        if (Object.prototype.hasOwnProperty.call(loggedons, id)) {
          if (loggedons[id].user === user.user && (!dateTime || dateTime < loggedons[id].dateTime)) {
            dateTime = loggedons[id].dateTime;
          }
        }
      }

      result.push({
        user: user.user,
        tty: user.tty,
        date: `${dateTime.substring(0, 10)}`,
        time: `${dateTime.substring(11, 19)}`,
        ip: '',
        command: ''
      });
    });
    return result;
  } catch {
    return result;
  }
};
