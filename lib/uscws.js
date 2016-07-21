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

app.post('/uscw/edit', function(req, res) {
    if (req.body.method==='save') {
        let fileName = "./uscw/save/" + req.body.file + ".json";
        fs.stat(fileName, function(err, stat) {
            if(err == null) {
                res.send({ack:'ko', err:"file exists."});
                console.log('File exists');
            } else if(err.code == 'ENOENT') {
                fs.writeFile(fileName, JSON.stringify(req.body.data) + "\n",
                    (err)=>{
                        if (err) {
                            res.send({ack:'ko', err:err});
                        }
                        else {
                            res.send({ack:'ok'});
                        }
                    });
            } else {
                console.log('Some other error: ', err.code);
                res.send({ack:'ko', err:err});
            }
        });
    }
    else if (req.body.method==='replace') {
        let fileName = "./uscw/save/" + req.body.file + ".json";
        fs.writeFile(fileName, JSON.stringify(req.body.data) + "\n",
            (err)=>{
                if (err) {
                    res.send({ack:'ko', err:err});
                }
                else {
                    res.send({ack:'ok'});
                }
            });
    }
    else if (req.body.method==='list') {
        var files = fs.readdir("./uscw/save/",
            (err, files)=> {
                if (err) {
                    res.send({ack: 'ko', err: err});
                }
                else {
                    res.send({
                        ack: 'ok', files: files.map(file=> {
                            return {name: file.slice(0, -5)}
                        })
                    });
                }
            });
    }
    else if (req.body.method==='load') {
        let fileName = "./uscw/save/" + req.body.file + ".json";
        fs.readFile(fileName,
            (err, data)=>{
                if (err) {
                    res.send({ack:'ko', err:err});
                }
                else {
                    res.send({ack:'ok', data:data.toString()});
                }
            });
    }
    else if (req.body.method==='remove') {
        let fileName = "./uscw/save/" + req.body.file + ".json";
        fs.unlink(fileName,
            (err)=>{
                if (err) {
                    res.send({ack:'ko', err:err});
                }
                else {
                    res.send({ack:'ok'});
                }
            });
    }
    else {
        res.send({ack: 'ko', err: 'unknown method'});
    }
});

app.listen(3000);