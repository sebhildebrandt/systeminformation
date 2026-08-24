const si = require('../dist/index');
const { run } = require('./run.cjs');

if (process.argv.length < 3) {
  console.log("error - a test key is required");
  process.exit(1);
}

run(si, process.argv[2]).then(data => {
  console.log(JSON.stringify(data));
});
