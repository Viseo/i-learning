/**
 * Created by ABL3483 on 13/05/2016.
 */

var express = require('express')
    , app = express();
var router = express.Router();

app.use(express.static(__dirname));

var db = require('./db');
app.engine('jade', require('jade').__express);
app.set('view engine', 'jade');

var comments = require('./controllers/comments');
//app.use('/comments', comments);

// Connect to Mongo on start
db.connect('mongodb://localhost:27017/petitTest', function(err) {
    if (err) {
        console.log('Unable to connect to Mongo.');
        process.exit(1);
    } else {
        app.listen(3000, function() {
            console.log('Listening on port 3000...');
        })
    }
});
