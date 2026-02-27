const readline = require('readline');
const util = require('util');
const utils = require('../lib/util');
const exec = require('child_process').exec;
const lib_version = require('../package.json').version;
const path = require('path');

let waiting = false;
let timer;

function printHeader() {
  console.log('');
  console.log('SYSTEMINFORMATION - Test Scripts - Version: ' + lib_version);
  console.log('═══════════════════════════════════════════════════════════');
}

function printMenu() {
  console.log('');
  console.log('┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐');
  console.log('│  a ... Audio              i ... INET Latency       t ... time               10 .. NET Iface Default     ? ... Get Object    │');
  console.log('│  b ... BIOS               I ... INET Check Site    T ... CPU Temperature    11 .. NET Gateway Default   0 ... All Static    │');
  console.log('│  B ... Baseboard          j ... CPU Current Speed  u ... USB                12 .. NET Interfaces        1 ... All Dynamic   │');
  console.log('│  C ... Chassis            l ... CPU Current Load   U ... UUID               13 .. NET Stats             2 ... All           │');
  console.log('│  c ... CPU                L ... Full Load          v ... Versions           14 .. NET Connections                           │');
  console.log('│  d ... DiskLayout         m ... Memory             V ... Virtual Box        15 .. Get IP Address                            │');
  console.log('│  D ... DiskIO             M ... MEM Layout         w ... WIFI networks                                                      │');
  console.log('│  e ... Block Devices      o ... OS Info            W ... WIFI interfaces    21 .. Docker Info                               │');
  console.log('│  E ... Open Files         p ... Processes          x ... WIFI connections   22 .. Docker Images                             │');
  console.log('│  f ... FS Size            P ... Process Load       y ... System             23 .. Docker Container                          │');
  console.log('│  F ... FS Stats           r ... Printer            Y ... Battery            24 .. Docker Cont Stats                         │');
  console.log('│  g ... Graphics           s ... Services           z ... Users              25 .. Docker Cont Proc                          │');
  console.log('│  h ... Bluetooth          S ... Shell              k ... System Language    26 .. Docker Volumes        q >>> QUIT          │');
  console.log('│  n ... Ethernet Status                                                                                                      │');
  console.log('└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘');
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
  title = '│' + ('  ' + title + '                                     ').substr(0, 44 - lib_version.length) + 'v: ' + lib_version + ' │';
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
    const siPath = path.join(__dirname, 'si.js');
    if (key === '?') { key = 'getObj'; }
    const sanitizedKey = utils.sanitizeShellString(key);
    exec(`node ${siPath} '${sanitizedKey}'`, { timeout: 30000 }, (error, stdout) => {
      waiting = false;
      stopDots();
      clearline();
      if (error && error.signal) {
        console.log();
        console.log('Key: ' + sanitizedKey);
        console.log('TIMEOUT!');
      } else {
        try {
          if (stdout.toString().startsWith('"no_key')) {
            console.log();
            console.timeEnd(['Time to complete']);
            console.log('Menu item not found. Please select valid menu item ... Press q to quit');
          } else if (stdout.toString().startsWith('"not_supported')) {
            console.log();
            console.timeEnd(['Time to complete']);
            console.log('Key: ' + sanitizedKey);
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
          console.log('Key: ' + sanitizedKey);
          console.log('ERROR');
          console.log('----------------------------------------------------------------------------------------------------');
          console.log(stdout.toString());
          console.timeEnd(['Time to complete']);
          console.log();
        }
      }
    });
  }
});

printHeader();
printMenu();
EnableUserInput();
