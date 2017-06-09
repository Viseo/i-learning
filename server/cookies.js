/**
 * Easily manage your cookies.
 */

const
    jwt = require('json-web-token'),
    users = require('./models/users');

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
            users.getUserByEmailAddress(decode.user.mailAddress).then(resolve).catch(reject);
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
