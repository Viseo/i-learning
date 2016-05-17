var express = require('express');
var router = express.Router();

console.log("qqc");
var db = require('../db');
router.get('/all', function(req, res) {
    res.send('hello world');
    var collection = db.get().collection('banane');
    collection.insert({bllrlrlrr:"bllrlrlrr"},function(err, docs) {
    });
});

router.get('/recent', function(req, res) {
    var collection = db.get().collection('comments');

    collection.find().sort({'date': -1}).limit(100).toArray(function(err, docs) {
        res.render('comments', {comments: docs})
    })
});

module.exports = router;
