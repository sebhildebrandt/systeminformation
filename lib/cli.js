#!/usr/bin/env node
import * as si from './index.js';

// ----------------------------------------------------------------------------------
// Main
// ----------------------------------------------------------------------------------
(function () {
    si.getStaticData().then((data => {
        data.time = si.time();
        console.log(JSON.stringify(data, null, 2));
    }));
})();
