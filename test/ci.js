const si = require('../lib/index');

const testWithTimeout = async (fn) => {
  return new Promise((resolve, reject) => {
    (async () => {
      const timeout = setTimeout(() => {
        reject('Test Timeout');
      }, 240000);
      const result = await fn();
      clearTimeout(timeout);
      return resolve(result);
    })();
  });
};

(async () => {
  try {
    const startTotalTime = Date.now();
    let startTime = startTotalTime;
    console.log('Testing system:');
    console.log(await testWithTimeout(si.system));
    console.log('----------------------------------------');
    console.log(`Time to complete: ${(Date.now() - startTime) * 0.001} s`); startTime = Date.now();
    console.log('----------------------------------------\n');

    console.log('Testing cpu:');
    console.log(await testWithTimeout(si.cpu));
    console.log('----------------------------------------');
    console.log(`Time to complete: ${(Date.now() - startTime) * 0.001} s`); startTime = Date.now();
    console.log('----------------------------------------\n');

    console.log('Testing mem:');
    console.log(await testWithTimeout(si.mem));
    console.log('----------------------------------------');
    console.log(`Time to complete: ${(Date.now() - startTime) * 0.001} s`); startTime = Date.now();
    console.log('----------------------------------------\n');

    console.log('Testing memLayout:');
    console.log(await testWithTimeout(si.memLayout));
    console.log('----------------------------------------');
    console.log(`Time to complete: ${(Date.now() - startTime) * 0.001} s`); startTime = Date.now();
    console.log('----------------------------------------\n');

    console.log('Testing graphics:');
    console.log(await testWithTimeout(si.graphics));
    console.log('----------------------------------------');
    console.log(`Time to complete: ${(Date.now() - startTime) * 0.001} s`); startTime = Date.now();
    console.log('----------------------------------------\n');

    console.log('Testing diskLayout:');
    console.log(await testWithTimeout(si.diskLayout));
    console.log('----------------------------------------');
    console.log(`Time to complete: ${(Date.now() - startTime) * 0.001} s`); startTime = Date.now();
    console.log('----------------------------------------\n');

    console.log('Testing osInfo:');
    console.log(await testWithTimeout(si.osInfo));
    console.log('----------------------------------------');
    console.log(`Time to complete: ${(Date.now() - startTime) * 0.001} s`); startTime = Date.now();
    console.log('----------------------------------------\n');

    console.log('Testing networkInterfaces:');
    console.log(await testWithTimeout(si.networkInterfaces));
    console.log('----------------------------------------');
    console.log(`Time to complete: ${(Date.now() - startTime) * 0.001} s`); startTime = Date.now();
    console.log('----------------------------------------\n');

    console.log('Testing networkInterfaceDefault:');
    console.log(await testWithTimeout(si.networkInterfaceDefault));
    console.log('----------------------------------------');
    console.log(`Time to complete: ${(Date.now() - startTime) * 0.001} s`); startTime = Date.now();
    console.log('----------------------------------------\n');

    console.log('Testing time:');
    console.log(await testWithTimeout(si.time));
    console.log('----------------------------------------');
    console.log(`Time to complete: ${(Date.now() - startTime) * 0.001} s`); startTime = Date.now();
    console.log('----------------------------------------\n');

    console.log('Testing currentLoad:');
    console.log(await testWithTimeout(si.currentLoad));
    console.log('----------------------------------------');
    console.log(`Time to complete: ${(Date.now() - startTime) * 0.001} s`); startTime = Date.now();
    console.log('----------------------------------------\n');

    console.log('Testing cpuTemperature:');
    console.log(await testWithTimeout(si.cpuTemperature));
    console.log('----------------------------------------');
    console.log(`Time to complete: ${(Date.now() - startTime) * 0.001} s`); startTime = Date.now();
    console.log('----------------------------------------\n');

    console.log('Testing UUID:');
    console.log(await testWithTimeout(si.uuid));
    console.log('----------------------------------------');
    console.log(`Time to complete: ${(Date.now() - startTime) * 0.001} s`); startTime = Date.now();
    console.log('----------------------------------------\n');

    console.log('Testing Versions:');
    console.log(await testWithTimeout(si.versions));
    console.log('----------------------------------------');
    console.log(`Time to complete: ${(Date.now() - startTime) * 0.001} s`); startTime = Date.now();
    console.log('----------------------------------------\n');

    console.log('All tests complete.');
    console.log('----------------------------------------');
    console.log(`Time to complete: ${(Date.now() - startTotalTime) * 0.001} s`);
    console.log('----------------------------------------\n');
    process.exit(0);
  } catch (e) {
    console.log(e);
    console.log('One or more tests failed.');
    process.exit(1);
  }
})();
