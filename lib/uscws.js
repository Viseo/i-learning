/**
 * Created by HDA3014 on 28/01/2016.
 */
var express = require('express');
var bodyParser = require("body-parser");
var path = require('path');
var fs = require('fs');
var readline = require("readline");
var app = express();

app.use(express.static(__dirname+"/.."));
app.use(bodyParser.json({limit: '500mb'}));

fs.writeFileSync("../log/data.json", "");
var line=0;

app.post('/rest', function(req, res) {
    for(var k in req.body) {
        console.log("received : "+k);
    }
    res.send(JSON.stringify({name:"Dupont"}));
});

app.post('/log', function(req, res) {
    fs.appendFileSync("../log/data.json", JSON.stringify(req.body)+"\n");
    res.send({ack:'ok'});
});

app.get('/getDBdata', function (req, res) {
    let rs = fs.createReadStream("../log/db.json");
    let data = "";
    rs.on('readable', () => {
        let tmp = rs.read();
        tmp && (data = data + tmp);
    });
    rs.on('end', () => {
        console.log("1111");
        console.log(data);
        console.log("1111");
        res.send(data);
    });
});

app.listen(3000);