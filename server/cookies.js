/**
 * Easily manage your cookies.
 */

const jwt = require('json-web-token');

const sendCookie = (user) => {
    return new Promise((resolve, reject) => {
        jwt.encode('VISEO', {user: user}, (err, token) => {
            console.log(`${new Date().toLocaleTimeString('fr-FR')} : User "${user.firstName} ${user.lastName}" connected.`);
            if (err) reject(err);
            resolve(token);
        })
    })
};

const verify = (req) => {
    const token = req.headers && req.headers.cookie && req.headers.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1");

    return new Promise((resolve, reject) => {
        if (!token) {
            reject(err)
        }
        jwt.decode('VISEO', (token, err) => {
            if (err) {
                reject(err)
            }
            const collection = db.get().collection('users');
            collection.find().toArray((err, docs) => {
                const user = docs.find(user => user.mailAddress === decode.user.mailAddress);
                if (user) {
                    resolve(user)
                } else {
                    reject(new Error("Bad token"))
                }
            })
        })
    })
};

exports.send = sendCookie;
exports.verify = verify;

/*
             _,._
         __.o`   o`"-. 
      .-O o `"-.o   O )_,._   
     ( o   O  o )--.-"`O   o"-.
      '--------'  (   o  O    o)  
                   `----------`
*/
