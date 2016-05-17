/**
 * Created by ABL3483 on 13/05/2016.
 */

var express = require('express');
var bodyParser = require("body-parser");
var path = require('path');
var fs = require('fs');
var app = express();

app.use(express.static(__dirname));
app.use(bodyParser.json({limit: '50mb'}));
//app.use(bodyParser.urlencoded({limit: '50mb'}));

app.use(function (req, res, next)  {
    res.header("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Access-Control-Allow-Origin, Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "POST");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

var methodOverride = require('method-override');
app.use(methodOverride());

//cors and preflight filtering
app.all('*', function(req, res, next){
    //preflight needs to return exact request-header
    res.set("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Access-Control-Allow-Origin, Origin, X-Requested-With, Content-Type, Accept");
    res.set('Access-Control-Allow-Origin', req.headers.origin);
    if ('OPTIONS' == req.method)
        return res.sendStatus(204);next();
});

// ## CORS middleware
// see: http://stackoverflow.com/questions/7067966/how-to-allow-cors-in-express-nodejs
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', 'http://localhost:63342');
    res.header("Access-Controll-Allow-Headers", "Access-Controll-Allow-Headers, Origin, X-Requested-With, Content-Type, Accept");

    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
        res.sendStatus(200);
    }
    else {
        next();
    }
};
app.use(allowCrossDomain);

var routes = require("./controllers/comments")(app);


app.use(express.static(__dirname));

var db = require('./db');

var comments = require('./controllers/comments');
//app.use('/comments', comments);

// Connect to Mongo on start
db.connect('mongodb://localhost:27017/petitTest', function(err) {
    if (err) {
        console.log('Unable to connect to Mongo.');
        process.exit(1);
    } else {
        app.listen(8080, function() {
            console.log('Listening on port 3000...');
        })
    }
});
