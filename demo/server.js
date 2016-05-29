var express = require('express');
var bodyParser = require('body-parser');

var app = express();

var port = Number(process.env.PORT || '1234');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// parse application/json
app.use(bodyParser.json());

app.use(express.static(__dirname));

app.listen(port, function(){
  console.log('Server is running on port' + port);
});

require('./routes.js')(app);
