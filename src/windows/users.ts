'use strict';

import { powerShell } from '../common/exec';
import { getValue, nextTick } from '../common';
import { UserData } from '../common/types';

const parseWinSessions = (sessionParts: string[]) => {
  const sessions: { [index: string]: any; } = {};
  sessionParts.forEach(session => {
    const lines = session.split('\r\n');
    const id = getValue(lines, 'LogonId');
    const starttime = getValue(lines, 'starttime');
    if (id) {
      sessions[id] = starttime;
    }
  });
  return sessions;
};

function parseWinUsers(userParts: string[]) {
  const users: any[] = [];
  userParts.forEach((user: any) => {
    const lines = user.split('\r\n');

    const domain = getValue(lines, 'domain', ':', true);
    const username = getValue(lines, 'username', ':', true);
    if (username) {
      users.push({
        domain,
        user: username
      });
    }
  });
  return users;
}

function parseWinLoggedOn(loggedonParts: string[]) {
  const loggedons: { [index: string]: any; } = {};
  loggedonParts.forEach(loggedon => {
    const lines = loggedon.split('\r\n');

    const antecendent = getValue(lines, 'antecedent', ':', true);
    let parts = antecendent.split(',');
    const domainParts = parts.length > 1 ? parts[0].split('=') : [];
    const nameParts = parts.length > 1 ? parts[1].split('=') : [];
    const domain = domainParts.length > 1 ? domainParts[1].replace(/"/g, '') : '';
    const name = nameParts.length > 1 ? nameParts[1].replace(/"/g, '') : '';
    const dependent = getValue(lines, 'dependent', ':', true);
    parts = dependent.split('=');
    const id = parts.length > 1 ? parts[1].replace(/"/g, '') : '';
    if (id) {
      loggedons[id] = {
        domain,
        user: name
      };
    }
  });
  return loggedons;
}

export const windowsUsers = async () => {
  let result: UserData[] = [];
  try {
    const workload: any[] = [];
    // workload.push(powerShell('Get-CimInstance -ClassName Win32_Account | fl *'));
    workload.push(powerShell('Get-WmiObject Win32_LogonSession | fl *'));
    workload.push(powerShell('Get-WmiObject Win32_LoggedOnUser | fl *'));
    workload.push(powerShell('Get-WmiObject Win32_Process -Filter "name=\'explorer.exe\'" | Select @{Name="domain";Expression={$_.GetOwner().Domain}}, @{Name="username";Expression={$_.GetOwner().User}} | fl'));
    const data = await Promise.allSettled(workload);
    // controller + vram
    // let accounts = parseWinAccounts(data[0].split(/\n\s*\n/));
    let sessions = parseWinSessions(data[0].toString().split(/\n\s*\n/));
    let loggedons = parseWinLoggedOn(data[1].toString().split(/\n\s*\n/));
    let users = parseWinUsers(data[2].toString().split(/\n\s*\n/));
    for (let id in loggedons) {
      if ({}.hasOwnProperty.call(loggedons, id)) {
        loggedons[id].dateTime = {}.hasOwnProperty.call(sessions, id) ? sessions[id] : '';
      }
    }
    users.forEach(user => {
      let dateTime = '';
      for (let id in loggedons) {
        if ({}.hasOwnProperty.call(loggedons, id)) {
          if (loggedons[id].user === user.user && (!dateTime || dateTime < loggedons[id].dateTime)) {
            dateTime = loggedons[id].dateTime;
          }
        }
      }

      result.push({
        user: user.user,
        tty: '',
        date: `${dateTime.substr(0, 4)}-${dateTime.substr(4, 2)}-${dateTime.substr(6, 2)}`,
        time: `${dateTime.substr(8, 2)}:${dateTime.substr(10, 2)}`,
        ip: '',
        command: ''
      });
    });
    return result;

  } catch (e) {
    return result;
  }
};

export const users = async () => {
  await nextTick();
  return windowsUsers();
};
