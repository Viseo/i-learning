/**
 * Created by HDA3014 on 28/01/2016.
 */
var express = require('express');
var bodyParser = require("body-parser");
var path = require('path');
var fs = require('fs');
var app = express();

app.use(express.static(__dirname));
app.use(bodyParser.json());

fs.writeFileSync("./log/data.json", "");
var line=0;

app.post('/rest', function(req, res) {
    for(var k in req.body) {
        console.log("received : "+k);
    };
    res.send(JSON.stringify({name:"Dupont"}));
});

app.post('/log', function(req, res) {
    fs.appendFileSync("./log/data.json", JSON.stringify(req.body)+"\n");
    res.send({ack:'ok'});
});

app.listen(3000);