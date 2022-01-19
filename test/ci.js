const si = require('../lib/index');

const testWithTimeout = async (fn) => {
  return new Promise((resolve, reject) => {
    (async () => {
      const timeout = setTimeout(() => {
        reject('Test Timeout');
      }, 60000);
      const result = await fn();
      clearTimeout(timeout);
      return resolve(result);
    })();
  });
};

(async () => {
  try {
    console.log('Testing system:');
    console.log(await testWithTimeout(si.system));

    console.log('Testing cpu:');
    console.log(await testWithTimeout(si.cpu));

    console.log('Testing mem:');
    console.log(await testWithTimeout(si.mem));

    console.log('Testing memLayout:');
    console.log(await testWithTimeout(si.memLayout));

    console.log('Testing graphics:');
    console.log(await testWithTimeout(si.graphics));

    console.log('Testing diskLayout:');
    console.log(await testWithTimeout(si.diskLayout));

    console.log('Testing osInfo:');
    console.log(await testWithTimeout(si.osInfo));

    console.log('Testing networkInterfaces:');
    console.log(await testWithTimeout(si.networkInterfaces));

    console.log('Testing networkInterfaceDefault:');
    console.log(await testWithTimeout(si.networkInterfaceDefault));

    console.log('Testing time:');
    console.log(await testWithTimeout(si.time));

    console.log('Testing currentLoad:');
    console.log(await testWithTimeout(si.currentLoad));

    console.log('Testing cpuTemperature:');
    console.log(await testWithTimeout(si.cpuTemperature));

    console.log('Testing UUID:');
    console.log(await testWithTimeout(si.uuid));

    console.log('Testing versions:');
    console.log(await testWithTimeout(si.versions));

    console.log('All tests complete.');
    process.exit(0);
  } catch (e) {
    console.log(e);
    console.log('One or more tests failed.');
    process.exit(1);
  }
})();
