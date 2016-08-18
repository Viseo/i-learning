/**
 * Easily manage your cookies.
 */

const
    jwt = require('json-web-token');

const
    db = require('./db');

const generate = function (user) {
    return new Promise((resolve, reject) => {
        jwt.encode('VISEO', {user: user}, (err, token) => {
            console.log(`${new Date().toLocaleTimeString('fr-FR')} : User "${user.firstName} ${user.lastName}" connected.`);
            if (err) {
                reject(err);
            }
            resolve(token);
        })
    })
};

const verify = function (token) {
    return new Promise((resolve, reject) => {
        if (!token) {
            reject(new Error("No token"))
        }
        jwt.decode('VISEO', token, (err, decode) => {
            if (err) {
                reject(err);
                return
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

const getCookie = function (req) {
    return req.headers && req.headers.cookie && req.headers.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1");
};

exports.generate = generate;
exports.verify = verify;
exports.get = getCookie;

/*
             _,._
         __.o`   o`"-. 
      .-O o `"-.o   O )_,._   
     ( o   O  o )--.-"`O   o"-.
      '--------'  (   o  O    o)  
                   `----------`
*/
