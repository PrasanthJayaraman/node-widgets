var nodeWidget = require('node-widgets');
var bodyParser = require('body-parser');

exports.generateForm = function(req, res, next){
  var incomingJson = {
    "form": "myForm",
    "action": "/check",
    "method": "post",
    "fields": {
      "username": {
        "label" : "Username",
        "type": "text",
        "class": "form-control",
        "required": true,
        "minlen" : 10,
        "maxlen" : 20,
        "msg": "Username is required"
      },
      "password": {
        "label" : "Password",
        "type": "password",
        "class": "form-control",
        "required": true,
        "msg": "Password is required"
      },
      "confirm" : {
        "label" : "Confirm password",
        "class" : "form-control",
        "type" : "password",
        "required" : true,
        "match" : "password",
        "msg" : "Confirm password do not match."
      },
      "email" : {
        "label" : "Email Address",
        "class": "form-control",
        "type" : "email",
        "required": true,
        "msg": "Email Address is invalid",
      },
      "age" : {
        "label" : "Age",
        "type" : "number",
        "class": "form-control",
        "required": true,
        "msg" : "Age is Invalid",
        "minval": 10,
        "maxval" : 80
      },
      "comments" : {
        "label" : "Comments",
        "value" : "My comments",
        "type" : "textarea",
        "class": "form-control"
      },
      "website" : {
        "label" : "Website",
        "type" : "url",
        "class": "form-control",
        "required" : true,
        "msg" : "Url is required"
      },
      "cities" : {
        "label" : "Cities",
        "type" : "select",
        "class": "form-control",
        "value" : [{ "name" : "Newyork", "value" : "newyork", "selected" : "selected"},
                   {"name" : "California", "value" : "california"}]
      },
      "colors" : {
        "label" : "Colors",
        "type" : "checkbox",
        "value" : [{ "name" : "Red", "value" : "red", "checked" : "checked"},
                   {"name" : "Blue", "value" : "blue"},
                   {"name" : "Green", "value" : "green"}]
      },
      "gender" : {
        "label" : "Gender",
        "type" : "radio",
        "value" : [{ "name" : "Male", "value" : "male", "checked" : "checked"},
                   {"name" : "Female", "value" : "female"}]
      },
      "button": {
        "type": "submit",
        "class": "btn btn-primary",
        "value" : "Save"
      }
    }
  }

  nodeWidget.toHTML(incomingJson, function(err, form){
    res.send(form);
    return next();
  })

}

exports.validateForm = function(req, res, next){
  var incomingData = req.body;

  nodeWidget.validate(incomingData, function(err, valid, form){
    if(err) { throw err }
    console.log("your form is valid ? " + valid);
    res.send(form);
    return next();
  })
}
