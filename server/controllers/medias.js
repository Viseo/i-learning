/**
 * Created by TBE3610 on 21/04/2017.
 */
module.exports = function (app, fs) {
    const
        multer = require('multer'),
        mmm = require('mmmagic'),
        db = require('../db');

    const upload = multer({dest: __dirname + '/../../resource/'}).single('file');

    app.post('/medias/upload', (req, res) => {
        const insertInDB = function (file) {
            return new Promise((resolve, reject) => {
                const magic = new mmm.Magic(mmm.MAGIC_MIME_TYPE);
                magic.detectFile(file.path, function (err, result) {
                    if (result === 'video/mp4') {
                        db.get().collection('videos').insertOne({
                            src: "../resource/" + file.filename,
                            name: file.originalname
                        }, (err) => {
                            if (err) {
                                reject(err)
                            }
                            resolve({src: "../resource/" + file.filename, name: file.originalname})
                        })
                    } else if (['image/png', 'image/jpeg'].includes(result)) {
                        db.get().collection('images').insertOne({
                            imgSrc: "../resource/" + file.filename,
                            name: file.originalname
                        }, (err) => {
                            if (err) {
                                reject(err)
                            }
                            resolve()
                        })
                    } else { // delete unwanted file
                        fs.unlink(file.path, () => {
                            reject(new Error(`Bad file type ${result}, deleted.`))
                        })
                    }
                });
            })
        };

        upload(req, res, (err) => {
            console.log(err);
            insertInDB(req.file)
                .then(() => {
                    console.log(`${new Date().toLocaleTimeString('fr-FR')} : File ${req.file.originalname} inserted in MongoDB.`);
                    res.send('ok')
                })
                .catch((err) => {
                    console.error(err.message);
                    res.send('err')
                });
        })
    });

    app.get('/medias/images', function (req, res) {
        var collection = db.get().collection('images');
        collection.find().toArray(function (err, docs) {
            res.send({images: docs});
        });
    });

    app.post('/medias/images/delete', function (req, res) {
        var collection = db.get().collection('images');
        collection.deleteOne({"_id": new ObjectID(req.body._id)});
        fs.unlink('./resource/' + req.body.imgSrc.split('/')[2], (error) => {
            console.error(error);
            res.send({ack: "ok"});
        });
    });

    app.get('/medias/videos', function (req, res) {
        db.get().collection('videos').find().toArray(function (err, videos) {
            res.send(videos);
        })
    });

    app.post('/medias/videos/delete', function (req, res) {
        var collection = db.get().collection('videos');
        collection.deleteOne({"_id": new ObjectID(req.body._id)});
        fs.unlink('./resource/' + req.body.src.split('/')[2], () => {
            res.send({ack: "ok"});
        });
    });
};

