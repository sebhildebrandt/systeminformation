const si = require('../lib/index');

const testWithTimeout = async (fn) => {
  return new Promise((resolve, reject) => {
    (async () => {
      const timeout = setTimeout(() => {
        reject('Test Timeout');
      }, 15000);
      const result = await fn();
      clearTimeout(timeout);
      return resolve(result);
    })();
  });
};

(async () => {
  try {
    // console.log('Testing osInfo:');
    // console.log(await testWithTimeout(si.osInfo));

    console.log('Testing networkInterfaces:');
    console.log(await testWithTimeout(si.networkInterfaces));

    console.log('Testing networkInterfaceDefault:');
    console.log(await testWithTimeout(si.networkInterfaceDefault));

    console.log('Testing time:');
    console.log(await testWithTimeout(si.time));

    console.log('Testing currentLoad:');
    console.log(await testWithTimeout(si.currentLoad));

    console.log('Testing mem:');
    console.log(await testWithTimeout(si.mem));

    console.log('Testing cpuTemperature:');
    console.log(await testWithTimeout(si.cpuTemperature));

    console.log('All tests complete.');
    process.exit(0);
  } catch (e) {
    console.log(e);
    console.log('One or more tests failed.');
    process.exit(1);
  }
})();
