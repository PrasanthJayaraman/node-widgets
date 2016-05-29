var demoController = require('./controllers/demo.js');

module.exports = function(app){
  app.get('/', demoController.generateForm);
  app.post('/check', demoController.validateForm);
}
