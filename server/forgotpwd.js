/**
 * Created by MLE3657 on 21/03/2017.
 */
const
    ObjectID = require('mongodb').ObjectID;

const
    db = require('./db');

function createUUID(size) {
    var s = [];
    var hexDigits = "0123456789abcdefghijklmnopqrstuvwxyz";
    for (var i = 0; i < size; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    var uuid = s.join("");
    return uuid;
}

/**
 * Demande a reset le PWD
 * on passe email si email existe on genere une demande (BDD => table mdp)
 *      de reset et on envoit un mail a l utilisateur de sa demande
 *
 * mailAddress : email de l utilisateur
 *
 * return
 * 200 : OK
 * 404 : email non trouver
 * 500 : probleme serveur interne
 */
const resetPWD = (mailAddress) => {
    return new Promise((resolve, reject) => {
        let usersCollection = db.get().collection('users');
        usersCollection.find().toArray((err, docs) => {
            if(err){
                resolve(404);
            }
            let result = docs.find(user => user.mailAddress === mailAddress);
            if(result){
                let resetPWDCollection = db.get().collection('mdp');

                let now = new Date();
                let generateForgotPWD = {
                    id: createUUID(36), expire:  now.setTime(now.getTime() + 10 * 60 * 1000).toString(),
                    mailAddress: mailAddress
                };

                resetPWDCollection.find().toArray((err, docsReset) => {
                    if(err){
                        //todo refactor en une fonction
                        resetPWDCollection.insertOne(generateForgotPWD, (err) => {
                            if(err) {
                                resolve(500);
                            }else{
                                //todo send email
                                //resolve(generateForgotPWD);
                                resolve(200);
                            }
                        })
                    }else{
                        let resultAskResetPWD = docsReset.find(rPWD => rPWD.mailAddress === mailAddress);
                        if(resultAskResetPWD){
                            resetPWDCollection.updateOne({mailAddress: mailAddress},  generateForgotPWD);
                            resolve(200);
                        }else{

                            //todo refactor en une fonction
                            resetPWDCollection.insertOne(generateForgotPWD, (err) => {
                                if(err) {
                                    resolve(500);
                                }else{
                                    //todo send email
                                    //resolve(generateForgotPWD);
                                    resolve(200);
                                }
                            })
                        }
                    }
                });
            }else{
                resolve(404);
            }
        })
    });
};

/**
 * Check si id pour reset password et son timestamp est bien valide
 *
 * id : id de la demande de reset password
 *
 * return
 * 200 : OK
 * 403 : le lien n est plus valide du au timestamp
 * 404 : id non trouver
 */
const checkResetPWD = (id) => {
    return new Promise((resolve, reject) => {
        console.log(id);
        let resetPWDCollection = db.get().collection('mdp');
        resetPWDCollection.find().toArray((err, docs) => {
            if(err){
                resolve(404);
            }
            let result = docs.find(resetPWD => resetPWD.id === id);

            if(result){
                let now = new Date();
                if(now.getTime() <= result.expire){
                    resolve(200);
                }else{
                    resolve(403);
                }
            }else{
                resolve(404);
            }
        });
    });
};


/**
 * Verifie id et timestamp si valide avant de mettre a jour le mot de passe et effacer dans la BDD la demande resetPWD
 *
 * newPWD
 * {
	"id":"cf9d07c60141b8bb986df5b1b44239de3156",
	"mailAddress":"te@g.g",
	"password":"erererfeferferferfre"
   }
 *
 * return
 * 200 : OK
 * 403 : le lien n est plus valide du au timestamp
 * 404 : id non trouver
 */
const updatePWD = (newPWD) => {
    return new Promise((resolve, reject) => {
        let resetPWDCollection = db.get().collection('mdp');
        resetPWDCollection.find().toArray((err, docs) => {
            if(err){
                resolve(404);
            }
            let result = docs.find(resetPWD => resetPWD.id === newPWD.id);
            if(result){
                let now = new Date();
                if(now.getTime() <= result.expire){
                    let usersCollection = db.get().collection('users');
                    usersCollection.find().toArray((err, userDocs) => {
                       if(err){
                           resolve(404);
                       }else{
                           let resultFindUser = userDocs.find(resetPWD => resetPWD.mailAddress === newPWD.mailAddress);
                           if(resultFindUser){
                               resultFindUser.password = newPWD.password;
                               usersCollection.updateOne({mailAddress: newPWD.mailAddress}, resultFindUser);

                               //todo delete
                               resetPWDCollection.removeOne({"id":newPWD.id});
                               resolve(200);
                           }else{
                               resolve(404);
                           }
                       }
                    });
                }else{
                    resolve(403);
                }
            }else{
                resolve(404);
            }
        });
    });
};



exports.resetPWD = resetPWD;
exports.checkResetPWD = checkResetPWD;
exports.updatePWD = updatePWD;
