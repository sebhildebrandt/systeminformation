import { constants } from 'fs';
import { access } from 'fs/promises';
import { parseDateUnix } from './datetime';
import type { UserData } from './types';

export const darwinXcodeExists = async () => {
  const results = await Promise.allSettled([
    access('/Library/Developer/CommandLineTools/usr/bin/', constants.F_OK),
    access('/Applications/Xcode.app/Contents/Developer/Tools', constants.F_OK),
    access('/Library/Developer/Xcode/', constants.F_OK)
  ]);

  // If at least one path fulfilled the promise xcode is installed
  return results.find((result) => result.status === 'fulfilled') !== undefined;
};

const isProtoKey = (key: string) => key === '__proto__' || key === 'constructor' || key === 'prototype';

export const plistParser = (xmlStr: string, items = true) => {
  const tags = ['array', 'dict', 'key', 'string', 'integer', 'date', 'real', 'data', 'boolean', 'arrayEmpty'];
  const startStr = '<plist version';

  let pos = xmlStr.indexOf(startStr);
  const len = xmlStr.length;
  while (xmlStr[pos] !== '>' && pos < len) {
    pos++;
  }

  let depth = 0;
  let inTagStart = false;
  let inTagContent = false;
  let inTagEnd = false;
  let metaData: any = [];
  metaData = [{ tagStart: '', tagEnd: '', tagContent: '', key: '', data: null }];
  let c = '';
  let cn = xmlStr[pos];

  while (pos < len) {
    c = cn;
    if (pos + 1 < len) {
      cn = xmlStr[pos + 1];
    }
    if (c === '<') {
      inTagContent = false;
      if (cn === '/') {
        inTagEnd = true;
      } else if (metaData[depth].tagStart) {
        metaData[depth].tagContent = '';
        if (!metaData[depth].data) {
          metaData[depth].data = metaData[depth].tagStart === 'array' ? [] : {};
        }
        depth++;
        metaData.push({
          tagStart: '',
          tagEnd: '',
          tagContent: '',
          key: null,
          data: null
        });
        inTagStart = true;
        inTagContent = false;
      } else if (!inTagStart) {
        inTagStart = true;
      }
    } else if (c === '>') {
      if (metaData[depth].tagStart === 'true/') {
        inTagStart = false;
        inTagEnd = true;
        metaData[depth].tagStart = '';
        metaData[depth].tagEnd = '/boolean';
        metaData[depth].data = true;
      }
      if (metaData[depth].tagStart === 'false/') {
        inTagStart = false;
        inTagEnd = true;
        metaData[depth].tagStart = '';
        metaData[depth].tagEnd = '/boolean';
        metaData[depth].data = false;
      }
      if (metaData[depth].tagStart === 'array/') {
        inTagStart = false;
        inTagEnd = true;
        metaData[depth].tagStart = '';
        metaData[depth].tagEnd = '/arrayEmpty';
        metaData[depth].data = [];
      }
      if (inTagContent) {
        inTagContent = false;
      }
      if (inTagStart) {
        inTagStart = false;
        inTagContent = true;
        if (metaData[depth].tagStart === 'array') {
          metaData[depth].data = [];
        }
        if (metaData[depth].tagStart === 'dict') {
          metaData[depth].data = {};
        }
      }
      if (inTagEnd) {
        inTagEnd = false;
        if (metaData[depth].tagEnd && tags.indexOf(metaData[depth].tagEnd.substr(1)) >= 0) {
          if (metaData[depth].tagEnd === '/dict' || metaData[depth].tagEnd === '/array') {
            if (depth > 1 && metaData[depth - 2].tagStart === 'array') {
              metaData[depth - 2].data.push(metaData[depth - 1].data);
            }
            if (depth > 1 && metaData[depth - 2].tagStart === 'dict' && !isProtoKey(metaData[depth - 1].key)) {
              metaData[depth - 2].data[metaData[depth - 1].key] = metaData[depth - 1].data;
            }
            depth--;
            metaData.pop();
            metaData[depth].tagContent = '';
            metaData[depth].tagStart = '';
            metaData[depth].tagEnd = '';
          } else {
            if (metaData[depth].tagEnd === '/key' && metaData[depth].tagContent) {
              metaData[depth].key = metaData[depth].tagContent;
            } else {
              if (metaData[depth].tagEnd === '/real' && metaData[depth].tagContent) {
                metaData[depth].data = parseFloat(metaData[depth].tagContent) || 0;
              }
              if (metaData[depth].tagEnd === '/integer' && metaData[depth].tagContent) {
                metaData[depth].data = parseInt(metaData[depth].tagContent, 10) || 0;
              }
              if (metaData[depth].tagEnd === '/string' && metaData[depth].tagContent) {
                metaData[depth].data = metaData[depth].tagContent || '';
              }
              if (metaData[depth].tagEnd === '/date' && metaData[depth].tagContent) {
                metaData[depth].data = metaData[depth].tagContent || '';
              }
              if (metaData[depth].tagEnd === '/boolean') {
                metaData[depth].data = metaData[depth].tagContent || false;
              }
              if (metaData[depth].tagEnd === '/arrayEmpty') {
                metaData[depth].data = metaData[depth].tagContent || [];
              }
              if (depth > 0 && metaData[depth - 1].tagStart === 'array') {
                metaData[depth - 1].data.push(metaData[depth].data);
              }
              if (depth > 0 && metaData[depth - 1].tagStart === 'dict' && !isProtoKey(metaData[depth].key)) {
                metaData[depth - 1].data[metaData[depth].key] = metaData[depth].data;
              }
            }
            metaData[depth].tagContent = '';
            metaData[depth].tagStart = '';
            metaData[depth].tagEnd = '';
          }
        }
        metaData[depth].tagEnd = '';
        inTagStart = false;
        inTagContent = false;
      }
    } else {
      if (inTagStart) {
        metaData[depth].tagStart += c;
      }
      if (inTagEnd) {
        metaData[depth].tagEnd += c;
      }
      if (inTagContent) {
        metaData[depth].tagContent += c;
      }
    }
    pos++;
  }
  return items && metaData[0].data.length && metaData[0].data[0]._items ? metaData[0].data[0]._items : metaData[0].data;
};

export const formatBssid = (s: string) => {
  const matchStrings =
    s
      .replace(/</g, '')
      .replace(/>/g, '')
      .match(/.{1,2}/g) || [];
  return matchStrings.join(':');
};

const strIsNumeric = (str: any) => {
  return typeof str === 'string' && !Number.isNaN(Number(str)) && !Number.isNaN(parseFloat(str));
};

export const plistReader = (output: string) => {
  const lines = output.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].indexOf(' = ') >= 0) {
      const lineParts = lines[i].split(' = ');
      lineParts[0] = lineParts[0].trim();
      if (!lineParts[0].startsWith('"')) {
        lineParts[0] = `"${lineParts[0]}"`;
      }
      lineParts[1] = lineParts[1].trim();
      if (lineParts[1].indexOf('"') === -1 && lineParts[1].endsWith(';')) {
        const valueString = lineParts[1].substring(0, lineParts[1].length - 1);
        if (!strIsNumeric(valueString)) {
          lineParts[1] = `"${valueString}";`;
        }
      }
      if (lineParts[1].indexOf('"') >= 0 && lineParts[1].endsWith(';')) {
        const valueString = lineParts[1].substring(0, lineParts[1].length - 1).replace(/"/g, '');
        if (strIsNumeric(valueString)) {
          lineParts[1] = `${valueString};`;
        }
      }
      lines[i] = lineParts.join(' : ');
    }
    lines[i] = lines[i].replace(/\(/g, '[').replace(/\)/g, ']').replace(/;/g, ',').trim();
    if (lines[i].startsWith('}') && lines[i - 1] && lines[i - 1].endsWith(',')) {
      lines[i - 1] = lines[i - 1].substring(0, lines[i - 1].length - 1);
    }
  }
  output = lines.join('');
  let obj = {};
  try {
    obj = JSON.parse(output);
  } catch {}
  return obj;
};

export const parseUsersDarwin = (data: string): UserData[] => {
  const lines = data.split('\n');

  const result: UserData[] = [];
  const result_who: UserData[] = [];
  const result_w: any = {};
  let who_line: any = [];

  let is_whopart = true;
  lines.forEach((line) => {
    if (line === '---') {
      is_whopart = false;
    } else {
      const l = line.replace(/ +/g, ' ').split(' ');

      // who part
      if (is_whopart) {
        const dt = l[2] + ' ' + l[3];
        result_who.push({
          user: l[0],
          tty: l[1],
          date: parseDateUnix(dt),
          time: l[4],
          ip: null,
          command: null
        });
      } else {
        // w part
        // split by w_pos
        result_w.user = l[0];
        result_w.tty = l[1];
        result_w.ip = l[2] !== '-' ? l[2] : '';
        result_w.command = l.slice(5, 1000).join(' ').replace(/^-/, '');
        // find corresponding 'who' line
        who_line = result_who.filter((obj) => {
          return obj.user.substring(0, 10) === result_w.user.substring(0, 10) && (obj.tty.substring(3, 1000) === result_w.tty || obj.tty === result_w.tty);
        });
        if (who_line.length === 1) {
          result.push({
            user: who_line[0].user,
            tty: who_line[0].tty,
            date: who_line[0].date,
            time: who_line[0].time,
            ip: result_w.ip,
            command: result_w.command
          });
        }
      }
    }
  });
  return result;
};
