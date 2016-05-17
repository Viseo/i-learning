module.exports = function (app) {
    console.log("qqc");

    var db = require('../db');

    app.get('/all', function(req, res) {
        console.log("/all");
        res.send('hello world');
        var collection = db.get().collection('banane');
        collection.insert({bllrlrlrr:"bllrlrlrr"},function(err, docs) {
        });
    });

    app.get('/recent', function(req, res) {
        var collection = db.get().collection('comments');

        collection.find().sort({'date': -1}).limit(100).toArray(function(err, docs) {
            res.render('comments', {comments: docs})
        })
    });
};
