const network = require('../lib/network');


async function getNetwork() {
    console.log(await network.networkGatewayDefault());
}

getNetwork();