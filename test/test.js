const readline = require('readline');
const util = require('util');
const {  exec } = require('child_process');

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

process.stdin.on('keypress', (key, data) => {
    // console.log(data);
    if (data.name === 'q' && !data.shift) {
        // shut down
        process.exit()
    }

  exec('node si.js ' + key, (error, stdout) => {
    try {
      if (stdout.toString()) {
        data = JSON.parse(stdout.toString());
        console.log();
        console.log('===============================');
        console.log('[ ' + data.title + ' ]');
        console.log('===============================');
        console.log(util.inspect(data.data, { colors: true, depth: 4 }));
        printMenu();
      }
    } catch (e) {
      noop();
    }
    })
});

printMenu();
EnableUserInput();
