const readline = require('readline');
const util = require('util');
const exec = require('child_process').exec;
const lib_version = require('../package.json').version;
const path = require('path');

let waiting = false;
let timer;
let firstRun = true;

function printMenu() {
  console.log('');
  console.log('┌────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐');
  if (firstRun) {
    console.log(`│                               _                 _        __                            _   _                               │`);
    console.log(`│                 ___ _   _ ___| |_ ___ _ __ ___ (_)_ __  / _| ___  _ __ _ __ ___   __ _| |_(_) ___  _ __                    │`);
    console.log(`│                / __| | | / __| __/ _ \\ '_ \` _ \\| | '_ \\| |_ / _ \\| '__| '_ \` _ \\ / _\` | __| |/ _ \\| '_ \\                   │`);
    console.log(`│                \\__ \\ |_| \\__ \\ ||  __/ | | | | | | | | |  _| (_) | |  | | | | | | (_| | |_| | (_) | | | |                  │`);
    console.log(`│                |___/\\__, |___/\\__\\___|_| |_| |_|_|_| |_|_|  \\___/|_|  |_| |_| |_|\\__,_|\\__|_|\\___/|_| |_|                  │`);
    console.log(`│                     |___/                                                                                                  │`);
    console.log('├────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤');
    console.log(`│                            (c) 2026 Sebastian Hildebrandt, All rights reserved. License: MIT                               │`);
    console.log('├────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤');
    firstRun = false;
  }

  console.log(
    '│  SYSTEMINFORMATION                                                                                                  '.substring(0, 114 - lib_version.length) + 'Version: ' + lib_version + '  │'
  );
  console.log('├────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤');
  console.log('│  a ... Audio           i ... INET Latency       r ... Installed Software  1 ... NET Iface Default     ? ... Get Object     │');
  console.log('│  b ... BIOS            I ... INET Check Site    s ... Services            2 ... NET Gateway Default   , ... All Static     │');
  console.log('│  B ... Baseboard       j ... INET Public IP     S ... Shell               3 ... NET Interfaces        . ... All Dynamic    │');
  console.log('│  C ... Chassis         J ... CPU Current Speed  t ... time                4 ... NET Stats             / ... All            │');
  console.log('│  c ... CPU             k ... Camera             T ... CPU Temperature     5 ... NET Connections                            │');
  console.log('│  d ... DiskLayout      K ... Keyboard           u ... USB                                                                  │');
  console.log('│  D ... DiskIO          l ... CPU Current Load   U ... UUID                6 ... Docker Info                                │');
  console.log('│  e ... Block Devices   L ... Full Load          v ... Versions            7 ... Docker Images                              │');
  console.log('│  E ... Open Files      m ... Memory             V ... Virtual Box         8 ... Docker Container                           │');
  console.log('│  f ... FS Size         M ... MEM Layout         w ... WIFI networks       9 ... Docker Cont Stats                          │');
  console.log('│  F ... FS Stats        n ... NPU                W ... WIFI interfaces     0 ... Docker Cont Proc                           │');
  console.log('│  A ... Displays        N ... NPM Packages       x ... WIFI connections    + ... Docker Volumes                             │');
  console.log('│  g ... GPU             o ... OS Info            y ... System                                                               │');
  console.log('│  G ... PCI             O ... Mouse              Y ... Battery                                                              │');
  console.log('│  h ... Bluetooth       p ... Processes          z ... Printer                                                              │');
  console.log('│  H ... Thunderbolt     P ... Process Load       Z ... Users               - ... SI lib version        q >>> QUIT           │');
  console.log('└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘');
}

function EnableUserInput() {
  readline.emitKeypressEvents(process.stdin);
  process.stdin.setRawMode(true);
}

function dot() {
  process.stdout.write('.');
}

function clearline() {
  readline.cursorTo(process.stdout, 0);
  process.stdout.write('                                                                      ');
}

function startDots() {
  dot();
  timer = setInterval(() => {
    dot();
  }, 500);
}

function stopDots() {
  clearInterval(timer);
}

function printTitle(title) {
  // https://en.wikipedia.org/wiki/Box_Drawing_(Unicode_block)
  title = '│' + ('  ' + title + '                                     ').substring(0, 44 - lib_version.length) + 'v: ' + lib_version + ' │';
  console.log('┌────────────────────────────────────────────────┐');
  console.log(title);
  console.log('└────────────────────────────────────────────────┘');
}

process.stdin.on('keypress', (key, data) => {
  if (data.name === 'q' && !data.shift) {
    // shut down
    process.exit();
  }

  if (!waiting) {
    waiting = true;
    console.time(['Time to complete']);
    startDots();
    // SI_RUNNER überschreibt Runtime+Entry (z.B. "bun test/si.ts"), Default: node gegen dist/
//    const runner = process.env.SI_RUNNER || `node ${path.join(__dirname, 'si.cjs')}`;
    const runner = process.env.SI_RUNNER || 'node test/si.cjs';
    exec(`${runner} '${key}'`, { timeout: 30000 }, (error, stdout, stderr) => {
      waiting = false;
      stopDots();
      clearline();
      if (error && error.signal) {
        console.log();
        console.log('Key: ' + key);
        console.log('TIMEOUT!');
        printMenu();
      } else if (error || (stderr && stderr.toString().trim())) {
        console.log();
        console.log('Key: ' + key);
        console.log('ERROR');
        console.log('----------------------------------------------------------------------------------------------------');
        console.log((stderr && stderr.toString().trim()) || (error && error.message) || 'unknown error');
        console.timeEnd(['Time to complete']);
        console.log();
        printMenu();
      } else {
        try {
          if (stdout.toString().startsWith('"no_key')) {
            console.log();
            console.timeEnd(['Time to complete']);
            console.log('Menu item not found. Please select valid menu item ... Press q to quit');
          } else if (stdout.toString().startsWith('"not_supported')) {
            console.log();
            console.timeEnd(['Time to complete']);
            console.log('Key: ' + key);
            console.log('Not supported');
          } else if (stdout.toString()) {
            data = JSON.parse(stdout.toString());
            console.log();
            printTitle(data.title);
            console.log(util.inspect(data.data, { colors: true, depth: 4 }));
            console.timeEnd(['Time to complete']);
            printMenu();
          }
        } catch (e) {
          console.log();
          console.log('Key: ' + key);
          console.log('ERROR');
          console.log('----------------------------------------------------------------------------------------------------');
          console.log((e && e.message) || e);
          if (stderr && stderr.toString().trim()) { console.log(stderr.toString()); }
          console.log(stdout.toString());
          console.timeEnd(['Time to complete']);
          console.log();
          printMenu();
        }
      }
    });
  }
});

printMenu();
EnableUserInput();
