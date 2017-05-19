/**
 * Created by qde3485 on 02/06/16.
 */

class HTTPRequests {
    constructor() {}

    static get(theUrl) {
        return new Promise((resolve, reject) => {
            var request = new XMLHttpRequest();
            request.onreadystatechange = function () {
                if (this.readyState === XMLHttpRequest.DONE) {
                    if (request.status == 200) {
                        resolve(request.responseText);
                    } else {
                        reject(request.responseText);
                    }
                }
            };
            request.open("GET", theUrl, true); // true for asynchronous
            request.send(null);
        })
    }

    static post(theUrl, body, ignoredData) {
        return new Promise((resolve, reject) => {
            var request = new XMLHttpRequest();
            request.onreadystatechange = function () {
                if (this.readyState === XMLHttpRequest.DONE) {
                    if (request.status == 200) {
                        resolve(request.responseText);
                    } else {
                        reject(request.responseText);
                    }
                }
            };
            request.open('POST', theUrl, true); // true for asynchronous
            request.setRequestHeader('Content-type', 'application/json');
            let obj = ignoredData ? JSON.stringify(body, ignoredData) : JSON.stringify(body);
            request.send(obj);
        })
    }

    static upload(theUrl, file, onProgress) {
        return new Promise((resolve, reject) => {
            const formData = new FormData();
            var request = new XMLHttpRequest();
            request.onreadystatechange = function () {
                if (this.readyState === XMLHttpRequest.DONE) {
                    if (request.status == 200) {
                        resolve(request.responseText);
                    } else {
                        reject(request.responseText);
                    }
                }
            };
            formData.append('file', file);
            request.open('POST', theUrl, true); // true for asynchronous
            request.timeout = 60 * 1000;
            request.send(formData);
        })
    }
}

class APIRequester {
    constructor() {
    }

    static connect(mail, password, cookie) {
        return HTTPRequests.post('/auth/connect', {mailAddress: mail, password: password, cookie: cookie})
    }
    static checkCookie() {
        return HTTPRequests.get('/auth/verify')
    }

    static inscription(user) {
        return HTTPRequests.post('/users/inscription', user)
    }
    static saveProgress(progress){
        return HTTPRequests.post('users/self/progress', progress);
    }
    static getUser() {
        return HTTPRequests.get("/users/self")
    }
    static resetPassword(mailAddress) {
        return HTTPRequests.post('/users/password/reset', mailAddress);
    }
    static checkTimestampPassword(id) {
        return HTTPRequests.post('/users/password/new', id);
    }
    static updatePassword(id, password) {
        return HTTPRequests.post('/users/password/update', {id: id, password: password});
    }

    static getAllFormations() {
        return HTTPRequests.get('/formations');
    }
    static getFormationsProgress(id) {
        return HTTPRequests.get('/formations/' + id + '/progression');
    }
    static replaceFormation(id, newFormation, ignoredData) {
        //newFormation.status = status;
        return HTTPRequests.post("/formations/" + id, newFormation, ignoredData)
    }
    static insertFormation(newFormation, status, ignoredData) {
        newFormation.status = status;
        return HTTPRequests.post("/formations/insert", newFormation, ignoredData)
    }
    static deactivateFormation(id, ignoredData) {
        return HTTPRequests.post("/formations/deactivate", {id: id}, ignoredData);
    }
    static renameQuiz(formationId, levelIndex, gameIndex, newQuiz, ignoredData) {
        return HTTPRequests.post('/formations/quiz', {newQuiz:newQuiz, formationId:formationId, levelIndex:levelIndex, gameIndex:gameIndex}, ignoredData);
    }
    static replaceQuiz(newQuiz, id, levelIndex, gameIndex, ignoredData) {
        return HTTPRequests.post('/formations/quiz/', {newQuiz:newQuiz, formationId:id, levelIndex:levelIndex, gameIndex:gameIndex} , ignoredData);
    }

    static upload(file, onProgress) {
        return HTTPRequests.upload("/medias/upload", file, onProgress, this.deleteVideo);
    }
    static getImages() {
        return HTTPRequests.get('/medias/images');
    }
    static deleteImage(image) {
        return HTTPRequests.post("/medias/images/delete", image);
    }
    static getVideos() {
        return HTTPRequests.get('/medias/videos');
    }
    static deleteVideo(video) {
        return HTTPRequests.post("/medias/videos/delete", video);
    }
    static updateSingleFormationStars(id, starId, versionId) {
        return HTTPRequests.post('/formations/userFormationEval/' + id, {starId: starId, versionId: versionId});
    }
}

exports.APIRequester = APIRequester;