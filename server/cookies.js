/**
 * Easily manage your cookies.
 */

const jwt = require('json-web-token');

const sendCookie = (res, user) => {
    jwt.encode('VISEO', {user: user}, (err, token) => {
        res.set('Set-cookie', `token=${token}; path=/; max-age=${30*24*60*60}`);
        res.send({
            ack: 'OK',
            user: {
                lastName: user.lastName,
                firstName: user.firstName,
                admin: user.admin
            }
        });
        console.log(`${new Date().toLocaleTimeString('fr-FR')} : User "${user.firstName} ${user.lastName}" connected.`);
    });
};

const verify = (req, callback) => {
    const token = req.headers && req.headers.cookie && req.headers.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1");

    if(token) {
        jwt.decode('VISEO', token, callback);
        return true;
    } else {
        return false;
    }
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
