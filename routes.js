var formController = require('./controllers/form.js');

module.exports = function(app){
  app.get('/', formController.generateForm);
  app.post('/validate', formController.validateForm);
}
