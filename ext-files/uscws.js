/**
 * Created by HDA3014 on 28/01/2016.
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

fs.writeFileSync("../log/data.json", "");
var line=0;

app.post('/rest', function(req, res) {
    for(var k in req.body) {
        console.log("received : "+k);
    }
    res.header("Access-Controll-Allow-Origin", "http://localhost:63342/log");
    res.header("Access-Controll-Allow-Headers", "Access-Controll-Allow-Headers, Origin, X-Requested-With, Content-Type, Accept");
    res.send(JSON.stringify({name:"Dupont"}));
});

app.post('/log', function(req, res) {
    fs.appendFileSync("../log/data.json", JSON.stringify(req.body)+"\n");
    res.header("Access-Controll-Allow-Headers", "Access-Controll-Allow-Headers, Origin, X-Requested-With, Content-Type, Accept");
    res.send({ack:'ok'});
});

app.get('/test', function (req, res) {
    fs.appendFileSync("../log/data.json", JSON.stringify("Hello world!\n"));
    res.header("Access-Controll-Allow-Origin", "http://localhost:63342/log");
    res.send({ack:'ok'});
});
app.listen(63343);