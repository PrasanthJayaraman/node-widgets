var ejs = require('ejs');
var async = require('async');
var path = require('path');
var nStore = require('nstore');
var validator = require('validator');
var templatePath = path.join(__dirname, '/src/templates/');
var textBoxTemplate = templatePath + 'text.ejs';
var formTemplate = templatePath + 'form.ejs';
var contentTemplate = templatePath + 'content.ejs';
var randomName;

var _data = nStore.new(templatePath + 'data.db', function () {
  // It's loaded now
  console.log("Local Storage created");
});


function convertToHTML(name, attrs, callback){
  var attributes = [], elem, data, type;
  var data = new Object();
  data.id = name.split(' ').join('_');
  data.name = name;

  if(attrs.class != 'undefined' || attrs.class != null || attrs.class) {
    data.className = attrs.class
  } else {
    data.className = ''
  }

  if(attrs.value != 'undefined' || attrs.value != null || attrs.class) {
    data.value = attrs.value
  } else {
    data.value = ''
  }


  if(attrs.type == 'text' || attrs.type == 'password' || attrs.type == 'number' || attrs.type == 'email'){
    elem = textBoxTemplate;
    data.type = attrs.type
  } else if(attrs.type == 'submit'|| attrs.type == 'button'){
    elem = contentTemplate;
    data.type = attrs.type
    data.value = name
  } else if(attrs.type == 'hidden'){
    elem = contentTemplate;
    data.type = attrs.type
  }

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
            keyValue : randomName,
            errors : null
        }, function(err, template){
          callback(template);
        });
      })
    },
    function(callback){
      _data.save(randomName, {"fields": fields, "formName": formName, "formAction" : formAction, "formMethod": formMethod, "formContent": tempContent}, function(err) {
        if(err) throw err;
        console.log('stored in local storage');
      })
    }
  ], function(data){
    finalTemp = data;
  })
  cb(null, finalTemp);
}

function validateIndividual(name, fields, data, callback){
  var errMsg = "";
  if(typeof fields.required != 'undefined' || fields.required != null || fields.required != false){
    if(fields.type != 'submit' || fields.type != 'button' || fields.type != 'checkbox' || fields.type != 'radio'){

      if(typeof data == 'undefined' || data == null || data.length == 0){
        errMsg = errMsg + fields.msg
      }

      if(fields.type == 'number'){
        if(!validator.isNumeric(data)) { errMsg = errMsg + fields.msg }
      } else if(fields.type == 'email'){
        if(!validator.isEmail(data)) { errMsg = errMsg + fields.msg }
      }

      if(typeof fields.minlen != 'undefined' || fields.minlen != null || fields.minlen){
        if(data.length <= fields.minlen){
          errMsg = errMsg + " " + name + " min length should be " + fields.minlen + ". "
        }
      }

      if(typeof fields.maxlen != 'undefined' || fields.maxlen != null || fields.maxlen){
        if(data.length > fields.maxlen){
          errMsg = errMsg + " " + name + " max length should be " + fields.maxlen + ". "
        }
      }

      if(typeof fields.minval != 'undefined' || fields.minval != null || fields.minval){
        if(data < fields.minval){
          errMsg = errMsg + " " + name + " min value is " + fields.minval + ". "
        }
      }

      if(typeof fields.maxval != 'undefined' || fields.maxval != null || fields.maxval){
        if(data >= fields.maxval){
          errMsg = errMsg + " " + name + " max value is " + fields.maxval + ". "
        }
      }

  }
}
  return errMsg;
}

function validateForm(proto, data, callback){
  var temp = '';
  var arr = []; var i = 0;
  var fields = proto.fields;
  for(var key in fields) {
       if(fields.hasOwnProperty(key)) {
          var msg = validateIndividual(key, fields[key], data[key]);
          if(msg){
            if(msg != 'undefined'){
              arr.push({"msg" : msg })
            }
          }
       }
  }
  callback(null, arr);
}


exports.validate = function(jsonData, callback) {
  var storeKey = jsonData.storekey;
  var returnData;
  var result;
  async.series([
    function(cb){
      _data.get(storeKey, function (err, doc, key) {
        if (err) { cb(err, null) }
        // You now have the document
        result = doc;
        validateForm(doc, jsonData, function(err, content){
          cb(null, content);
        })
      });
    }
  ], function(err, msgs){
    if(err){
      callback(err, null)
    } else {
      ejs.renderFile(formTemplate, {
          formContent: result.formContent,
          formName: result.formName,
          formAction: result.formAction,
          formMethod: result.formMethod,
          keyValue : storeKey,
          errors : msgs[0]
      }, function(err, template){
          returnData = template;
          callback(null, returnData);
      });
    }
  })
}
