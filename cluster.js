var
  server = require('./server.js'),
  cluster = require('cluster'),
  numCPUs = require('os').cpus().length,
  maxWorkers = Math.min(2, numCPUs),
  i = 0;

if (cluster.isMaster) {
  console.log('Cluster : We have ' + numCPUs + ' CPU cores present. We can use ' + maxWorkers + ' of them.');
  for (i = 0; i < maxWorkers; i++) {
    cluster.fork();
  }
  cluster.on('online', function (worker) {
    console.log('Cluster : Worker PID#' + worker.process.pid + ' is online!');
    worker.on('message', function (msg) {
      messageHandler(worker.workerID, msg);
    })
  });

  cluster.on('exit', function (worker, code, signal) {
    var exitCode = worker.process.exitCode;
    if(worker.suicide) {
      console.log('Cluster : Worker #' + worker.process.pid + ' died (' + exitCode + ')! Trying to spawn spare one...');
      cluster.fork();
    } else {
      console.log('ERROR: Worker #' + worker.process.pid + ' died of uncertain reasons.');
    }
  });

  function messageHandler(id, msg) {
    // Handle Suicide Message
    if (msg.cmd && msg.cmd == 'suicide') {
      cluster.workers[id].destroy();
    }
    
  }

} else {
  server();
  //allow 30mins [+ upto 9min] lifetime for this worker
  var shutdownTimeoutInMin = 30 + Math.floor( Math.random() * 10);
  console.log("Worker PID#" + process.pid + " got " + shutdownTimeoutInMin + "mins to live");
  setTimeout( server.cleanup, shutdownTimeoutInMin * 60 * 1000);
}
