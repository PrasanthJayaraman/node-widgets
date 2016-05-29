var express = require('express');
var bunyan = require('bunyan');
var domain = require('domain');
var bodyParser = require('body-parser');
var nodeWidget = require('node-widgets');

var app = express();
var port = Number(process.env.PORT || 8090);

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// parse application/json
app.use(bodyParser.json());

app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');

app.use(express.static(__dirname));

function sendViewMiddleware(req, res, next) {
    res.sendView = function(view) {
      console.log(__dirname + "/views/")
        return res.sendFile(__dirname + "/views/" + view);
    }
    next();
}

app.use(sendViewMiddleware);

app.options(/.*/, function (req,res,next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", req.header("Access-Control-Request-Method"));
    res.header("Access-Control-Allow-Headers", req.header("Access-Control-Request-Headers"));
    res.send(200);
    return next();
})

// Use domain to catch exceptions
app.use(function (req, res, next) {
  var d = domain.create();
  domain.active = d;
  d.add(req);
  d.add(res);

  d.on('error', function (err) {
    console.error("Error: " + err.stack);
    res.send(500, err);
    next(err);
  });

  res.on('end', function () {
    d.dispose();
  });

  d.run(next);
});

// Create a bunyan based logger
var log = bunyan.createLogger({
  name: 'NodeDyanmicForm',
  streams: [
    {
      level: 'debug',
      stream: process.stdout
    }
  ],
  serializers: bunyan.stdSerializers
});

// Attach the logger to the restify server
app.log = log;

app.on('after', function (req, res, route, error) {
  req.log.debug("%s %s", req.method, req.url);
  req.log.debug("%s %s", req.headers['Authorization'], req.headers['user-agent']);
  req.log.debug(req.params);
  req.log.debug("%d %s", res.statusCode, res._data ? res._data.length : null);
});

log.info("Starting up the server");

function start(cb) {
  cb = cb || function(err){
    if(err){
      throw err;
    }
  };
      // Load the routes
      require("./routes")(app);

      app.listen(port, function (err) {
        log.info("Server is listening at %s", port);
        cb(err);
      });
}

if (module.parent) {
  module.exports = exports = start;
} else {
  start();
}

module.exports.cleanup = function() {
    log.info("Worker PID#" + process.pid + " stop accepting new connections");
    app.close(function (err) {
      log.info("Worker PID#" + process.pid + " shutting down!!!");
      process.send({cmd: 'suicide'});
    });
}
