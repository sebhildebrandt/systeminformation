const si = require('./lib/network');

async function test(){
    const result = await si.networkInterfaces();
    console.log(result);
}

test();