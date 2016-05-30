# NodeDynamicForm

A NodeJS module for form generation with validation. This creates a form and form elements on server and return it to client using a json object called from client. You can edit the attributes in the json object and that reflects on the form elements.

_Version 1.1.1_

## Demo

1. Clone the repository and go to demo folder and type ```npm install``` to install the necessary packages. 
2. Type ```node server```. Then go to ```localhot:1234``` or see the cmd promt or terminal to know the port that app is running...

_Or_

Checkout this [Live Demo](http://nodewidgets.herokuapp.com)

## Setup

To install this module in your node project.

```npm install node-widgets```

So this install the dependencies and node-widgets module to your project and then you are good to go.

## Implementation

### Json Object

The Json object tells the library to create form and form elements that required. 

This is a basic json object.

```Javascript
{
"form": "myForm",         //form name you need - optional (auto generated a form name if not)
"action": "/validate",    // method that form need to call - you can change this based on your routes/requirement
"method": "post",         // method type 
"fields": {               // you need to mention this "fields"to create fields you required.
  "username": {           // this is the name of the element
    "label" : "Username",           // this is setted as label - optional
    "type": "text",                 // type of the element
    "class": "form-control",        // CSS class you need to render
    "required": true,               // required ? helps for validation : no validation takes place
    "minlen" : 10,                  // min length you allow
    "maxlen" : 20,                  // max length allow 
    "msg": "Username is required"   // Error message that needs to render for required attribute (for min/max auto msg generated)
  },
   "age" : {              // Name of the element  
    "label" : "Age",
    "type" : "number",
    "class": "form-control",
    "required": true,
    "msg" : "Age is Invalid",
    "minval": 10,                   // Min value allowed
    "maxval" : 80                   // Max value allowed
  }
 }
}
```

So the common attributes for an input element are 

1. label
2. type 
3. class
4. value 

Attributes that helps validation are

1. required   - Boolean
2. minlen     - Numeric 
3. maxlen     - Numeric
4. minval     - Numeric
5. maxval     - Numeric
6. match      - String (name of the other element Ex: "match" : "password")

### Function

There are only two functions in this library that takes care of form elements generation and validation.

#### toHTML

This function helps to create a form.

```javascript

var nodeWidget = require('node-widgets');

var inputs = {
    "form": "myForm",
    "action": "/validate",
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
      }
    }
  }
  
// create the form with json object
nodeWidget.toHTML(inputs, function(err, form){
  if(err) { throw err; }
  // form - is the template rendered HTML elements 
});

```

#### validate

This method helps to validate the form, If form is valid it returns ```true``` with the complete form with data. if form is not valid then it returns ```false``` with updated form with error message and data.. 

```javascript

var nodeWidget = require('node-widgets');
var bodyParser = require('body-parser');

var incomingData = req.body;

nodeWidget.validate(incomingData, function(err, valid, form){
  if(err) { throw err; }
  //valid  - boolean to know form is valid or not (true or false)
  //form - with updated err message and same elements to render
});

```
