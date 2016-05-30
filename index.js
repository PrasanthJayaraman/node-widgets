var ejs = require('ejs');
var async = require('async');
var path = require('path');
var nStore = require('nstore');
var validator = require('validator');
var templatePath = path.join(__dirname, '/src/templates/');
var textBoxTemplate = templatePath + 'text.ejs';
var formTemplate = templatePath + 'form.ejs';
var contentTemplate = templatePath + 'content.ejs';
var selectTemplate = templatePath + 'select.ejs';
var controlTemplate = templatePath + 'control.ejs';
var textareaTemplate = templatePath + 'textarea.ejs';
var randomName;

var _data = nStore.new(templatePath + 'data.db', function () {
  // It's loaded now
});


function convertToHTML(name, attrs, err, callback){
  var attributes = [], elem, data, type;
  var data = new Object();
  data.id = name.split(' ').join('_');
  data.name = name;
  data.label = attrs.label || name;

  if(attrs.required == true){  data.err = err; } else {  data.err = ''; }

  if(attrs.type == 'text' || attrs.type == 'password' || attrs.type == 'number' || attrs.type == 'email' || attrs.type == 'url'){
    elem = textBoxTemplate;
    data.type = attrs.type
  } else if(attrs.type == 'submit'|| attrs.type == 'button' || attrs.type == 'hidden'){
    elem = contentTemplate;
    data.type = attrs.type
  } else if(attrs.type == 'select'){
    elem = selectTemplate;
  } else if(attrs.type == 'checkbox' || attrs.type == 'radio'){
    data.type = attrs.type
    elem = controlTemplate;
  } else if(attrs.type == 'textarea'){
    elem = textareaTemplate;
  }

  if(attrs.class) { data.className = attrs.class } else {  data.className = '' }

  if(attrs.value) { data.value = attrs.value } else { data.value = '' }

  if(attrs.required){ data.required = 'required' } else { data.required = ''; }

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
               convertToHTML(key, proto[key], '', function(content){
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

exports.toHTML = function(proto, cb){

  var fields = proto.fields;
  randomName = Math.random().toString(36).substring(7);

  var finalTemp, tempContent;
  var formName = randomFormName(proto.form);
  var formAction = proto.action || ' ';
  var formMethod = proto.method || 'post';

  async.parallel([
    function(callback){
      setAttrs(proto.fields, function(content){
        tempContent = content;
        ejs.renderFile(formTemplate, {
            formContent: tempContent,
            formName: formName,
            formAction: formAction,
            formMethod: formMethod,
            keyValue : randomName
        }, function(err, template){
          callback(template);
        });
      })
    },
    function(callback){
      _data.save(randomName, {"fields": fields, "formName": formName, "formAction" : formAction, "formMethod": formMethod, "formContent": tempContent}, function(err) {
        if(err) throw err;
      })
    }
  ], function(data){
    finalTemp = data;
  })
  cb(null, finalTemp);
}

function validateIndividual(name, fields, jsonData, callback){
  var errMsg = "";
  var data = jsonData[name];

  var label = fields['label'] || name;

  if(typeof fields.required != 'undefined' && fields.required != null && fields.required != false){
    if(fields.type != 'submit' && fields.type != 'button' && fields.type != 'checkbox' && fields.type != 'radio' && fields.type != 'select'){

      if(typeof fields.msg == 'undefined' || fields.msg == null){
        fields.msg = label + ' is required.'
      }

      if(fields.type == 'number'){
        if(!validator.isNumeric(data)) { errMsg = errMsg + fields.msg + " " }
      } else if(fields.type == 'email'){
        if(!validator.isEmail(data)) { errMsg = errMsg + fields.msg + " " }
      } else if(fields.type == 'url'){
        if(!validator.isURL(data)) { errMsg = errMsg + fields.msg + " " }
      } else if(typeof data == 'undefined' || data == null || data.length == 0){
          errMsg = errMsg + fields.msg + " "
      }

      if(typeof fields.minlen != 'undefined' || fields.minlen != null || fields.minlen){
        if(data.length <= fields.minlen){
          errMsg = errMsg + " " + label + " min length should be " + fields.minlen + ". "
        }
      }

      if(typeof fields.maxlen != 'undefined' || fields.maxlen != null || fields.maxlen){
        if(data.length > fields.maxlen){
          errMsg = errMsg + " " + label + " max length should be " + fields.maxlen + ". "
        }
      }

      if(typeof fields.minval != 'undefined' || fields.minval != null || fields.minval){
        if(data < fields.minval){
          errMsg = errMsg + " " + label + " min value is " + fields.minval + ". "
        }
      }

      if(typeof fields.maxval != 'undefined' || fields.maxval != null || fields.maxval){
        if(data > fields.maxval){
          errMsg = errMsg + " " + label + " max value is " + fields.maxval + ". "
        }
      }

      if(typeof fields.match != 'undeifned' || fields.match != null || fields.match){
        var firstArg = jsonData[fields.match];
        if(firstArg){
          if(data != firstArg){
            errMsg = errMsg + fields.msg;
          }
        }
      }

      fields.value = data;

    }
  }

  convertToHTML(name, fields, errMsg, function(content){
    callback(content, errMsg);
  })
}

function validateForm(proto, data, callback){
  var temp = '';
  var errCount = 0; var i = 0;
  var fields = proto.fields;
  for(var key in fields) {
       if(fields.hasOwnProperty(key)) {
         async.series([
           function(cb){
             validateIndividual(key, fields[key], data, function(cont, err){
               cb(cont, err);
             });
           }
         ], function(data, err){
           if(err[0]) { errCount++ }
           temp = temp + data;
         });
       }
  }
  callback(null, temp, errCount);
}


exports.validate = function(jsonData, callback) {
  var storeKey = jsonData.storekey;
  var returnData;
  var resultDoc;
  async.series([
    function(cb){
      _data.get(storeKey, function (err, doc, key) {
        if (err) { cb(err, null) }
        // You now have the document
        resultDoc = doc;
        validateForm(doc, jsonData, function(err, content, errCount){
          cb(null, content, errCount);
        })
      });
    }
  ], function(err, results){
    if(err){
      callback(err, false, 'Not a valid form');
    } else {
      var result = results[0]
      if(typeof result[1] != 'undefined' && result[1] > 0){
        ejs.renderFile(formTemplate, {
            formContent: result[0],
            formName: resultDoc.formName,
            formAction: resultDoc.formAction,
            formMethod: resultDoc.formMethod,
            keyValue : storeKey
        }, function(err, template){
            returnData = template;
            callback(null, false, returnData);
        });
      } else {
        ejs.renderFile(formTemplate, {
            formContent: result[0],
            formName: resultDoc.formName,
            formAction: resultDoc.formAction,
            formMethod: resultDoc.formMethod,
            keyValue : storeKey
        }, function(err, template){
            returnData = template;
            callback(null, true, returnData);
        });
      }
    }
  })
}
