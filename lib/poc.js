let si = require('./internet');
si.inetChecksite([]).then((a) => {
  if (a.ok == false)
    console.log("inetChecksite is fixed!")
  else
    console.log("inetChecksite is not fixed!")
});


si.inetLatency([]).then((a) => {
  if (a == null)
    console.log("inetLatency is fixed!")
  else
    console.log("inetLatency is not fixed!")
});
si = require('./processes');
si.services([]).then((a) => {
  if (typeof a == typeof [])
    console.log("services is fixed!")
  else
    console.log("services is not fixed!")
});
