var ejs = require('ejs');
var async = require('async');
var path = require('path');
var templatePath = path.join(__dirname, '../src/templates/');
var textBoxTemplate = templatePath + 'text.ejs';
var formTemplate = templatePath + 'form.ejs';

function convertToHTML(name, attrs, callback){
  var attributes = [], elem, data;

  if(attrs.type == 'text' || attrs.type == 'password' || attrs.type == 'number' || attrs.type == 'hidden'){
    elem = textBoxTemplate;
  }

  for (var prop in attrs) {
     attributes[prop] = attrs[prop];
  }

  var data = new Object();
  data.id = name.split(' ').join('_');;
  data.name = name;
  if(typeof attrs.required != 'undefined' || attrs.required != null || attrs.required != false){
    data.required = 'required';
  } else {
    data.required = '';
  }

  ejs.renderFile(elem, data, function(err, element){
    if(err) throw err;
    callback(element);
  });

}

var setAttrs = function(proto, callback) {
    var temp = '';
    for(var key in proto) {
         if (proto.hasOwnProperty(key)) {
           async.parallel([
             function(callback){
               convertToHTML(key, proto[key], function(content){
                  callback(content);
               });
             }
           ], function(content){
               temp = temp + content;
           });
         }
    }
    callback(temp);
};

function randomFormName(name){
  if(typeof name != 'undefined' || name != null){
    return name;
  } else {
  var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
  }
}

exports.toHTML = function(proto, callback){

  var formName = randomFormName(proto.form);

  setAttrs(proto.fields, function(content){
    ejs.renderFile(formTemplate, {
        formContent: content,
        formName: formName
    }, function(err, template){
      callback(template);
    });
  })

}

/*

async.parallel([
  function(callback){
    ejs.renderFile(textBox, data, function(err, element){
      if(err) throw err;
      callback(element);
    });
  }
], function(element){
    return element;
});
*/
