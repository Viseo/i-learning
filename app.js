/**
 * Created by ABL3483 on 13/05/2016.
 */

var express = require('express');
var bodyParser = require("body-parser");
var path = require('path');
var fs = require('fs');
var app = express();

app.use(express.static(__dirname));
app.use(bodyParser.json({limit: '500mb'}));

var routes = require("./server/controllers/routes")(app, fs);
var db = require('./server/db');

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
