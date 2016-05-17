/**
 * Created by ABL3483 on 13/05/2016.
 */

var express = require('express');
var app = express();

var routes = require("./controllers/roots")(app);


var db = require('./db');
app.engine('jade', require('jade').__express);
app.set('view engine', 'jade');

// Connect to Mongo on start
db.connect('mongodb://localhost:27017/myDatabase', function(err) {
    if (err) {
        console.log('Unable to connect to Mongo.');
        process.exit(1);
    } else {
        app.listen(8080, function() {
            console.log('Listening on port 8080...');
        })
    }
});
