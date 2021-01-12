const readline = require('readline');
const util = require('util');
const {  exec } = require('child_process');

let waiting = false;
let timer;

function printMenu() {
    console.log('');
    console.log('-----------------------------------------------------------------------------------------------------------------------------------');
    console.log('a ... Audio              g ... Graphics           p ... Processes          w ... WIFI networks      1 ... NET Iface Default');
    console.log('b ... BIOS               h ... Bluetooth          P ... Process Load       y ... Battery            2 ... NET Gateway Default');
    console.log('B ... Baseboard          i ... INET Latency       r ... Printer            z ... Users              3 ... NET Interfaces');
    console.log('C ... Chassis            I ... INET Check Site    s ... Services                                    4 ... NET Stats');
    console.log('c ... CPU                l ... CPU Load           S ... Shell                                       5 ... NET Connections');
    console.log('d ... DiskLayout         L ... Full Load          t ... time                                        6 ... Docker Info');
    console.log('D ... DiskIO             n ...                    T ... CPU Temperature    + ... All Static         7 ... Docker Container');
    console.log('e ... Block Devices      m ... Memory             u ... USB                - ... All Dynamic        8 ... Docker Cont Stats');
    console.log('E ... Open Files         M ... MEM Layout         U ... UUID               # ... All                9 ... Docker Cont Proc');
    console.log('f ... FS Size            o ... OS Info            v ... Versions           , ... Get Object         0 ... Docker All');
    console.log('F ... FS Stats           O ...                    V ... VirtualBox         . ... Observe            q >>> Quit');
    console.log('-----------------------------------------------------------------------------------------------------------------------------------');
}

function EnableUserInput() {
    readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);
}

// function DisableUserInput() {
//   process.stdin.removeAllListeners()
// }
function noop() { }

function dot() {
  process.stdout.write('.');
}

function startDots() {
  dot();
  timer = setInterval(() => {
    dot();
  }, 500)
}

function stopDots() {
  clearInterval(timer);
}

function printTitle(title) {
  title = '||' + ('  ' + title + '                                 ').substr(0, 36) + '||'
  console.log('========================================');
  console.log(title);
  console.log('========================================');

}

process.stdin.on('keypress', (key, data) => {
  // console.log(data);
  if (data.name === 'q' && !data.shift) {
      // shut down
      process.exit()
  }

  if (!waiting) {
    waiting = true;
    startDots();
    exec(`node si.js '${key}'`, {timeout: 30000}, (error, stdout) => {
      waiting = false;
      stopDots();
      if (error && error.signal) {
        console.log();
        console.log('TIMEOUT!');
      } else {
        try {
          if (stdout.toString().startsWith('"no_key')) {
            console.log()
            console.log('menu item not found - select valid menu item')
          } else if (stdout.toString()) {
            data = JSON.parse(stdout.toString());
            console.log();
            console.log();
            printTitle(data.title);
            console.log(util.inspect(data.data, { colors: true, depth: 4 }));
            printMenu();
          }
        } catch (e) {
          console.log();
          console.log('Key: ' + key);
          console.log('ERROR - UNSUPPORTET');
        }
      }
    })
  }
});

printMenu();
EnableUserInput();
