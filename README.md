# Node Widgets

A simple NodeJS module for dynamic form generation with validation. This generates dynamic HTML form with validation on the server and makes easy to render on the client.

The form generation done using configuration done by the developer using a json object, so module reads the config json object and creates the appropriate HTML elements and returned as render HTML form in the callback.

You can edit the HTML attributes & validation properties in the json object and that reflects on the HTML form elements.

_Version 1.1.3_

The supported form elements are ``` text, password, hidden, number, email, url, textarea, select, checkbox, radio ``` and validations are supported to ``` text, password, number, email, url, taxtarea ```

## Demo

1. Clone the repository and go to demo folder and type ```npm install``` to install the necessary packages.
2. Type ```node server```. Then go to ```localhost:1234``` or see the command prompt or terminal to know the port that app is running...

_Or_

Checkout this [Live Demo][live-demo]

[live-demo]: http://nodewidgets.herokuapp.com

## Setup

To install this module in your node project.

```npm install node-widgets```

So this install the dependencies and node-widgets module to your project and then you are good to go.

## How to use

There are only two functions in this library that takes care of HTML form generation and validation.

### Form Generation

This function helps to create a HTML form using the configuration.

```javascript
var nodeWidget = require('node-widgets');

var config = {
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

// create the HTML form using json object
nodeWidget.toHTML(config, function(err, form){
  if(err) { throw err; }
  // form - is the template rendered HTML elements
});
```

### Form validation

This method helps to validate the form. The validate method takes the form data as the input to validate the form as per the configurations created. 

The ```action : /validate``` this action value should be your POST API to validate your form data. If form is valid it returns ```true``` with the rendered HTML form with data. if form is not valid then it returns ```false``` with updated HTML form with error messages and same user filled data.. 

```javascript
var nodeWidget = require('node-widgets');
var bodyParser = require('body-parser');

var incomingData = req.body; 

// this should be inside '/validate' API 
nodeWidget.validate(incomingData, function(err, valid, form){
  if(err) { throw err; }
  //valid  - boolean to know form is valid or not (true or false)
  //form - with updated err message and same elements to render
});
```

### Configuration

A simple javascript object is enough to configure your HTML form elements, this tells the module to create HTML form with validations.

```javascript
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

So the common attributes for an input element is

1. label
2. type
3. class
4. value

Attributes that helps validation is

1. required   - Boolean
2. minlen     - Numeric
3. maxlen     - Numeric
4. minval     - Numeric
5. maxval     - Numeric
6. match      - String (name of the other element Ex: "match" : "password")
