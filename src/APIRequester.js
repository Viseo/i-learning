/**
 * Created by qde3485 on 02/06/16.
 */

// function resolvedPromise(message){
//     function then(callback){
//         callback(message);
//         return {then, catch: ()=>{}};
//     }
//     return {then, catch: ()=>{}};
// }
//
// function rejectedPromise(message){
//     function error(callback){
//         callback(message);
//         return {then: ()=>{}, catch: error}
//     }
//     return {then: ()=>{}, catch: error}
// }

class HTTPRequests {
    constructor(mockObject) {
        this.mockResponses = mockObject;
    }

    _mockRequest(theUrl){
        let result = this.mockResponses[theUrl];
        if(!result) throw new Error('missing http request : ' + theUrl);

        if(result.code == 200){
            return Promise.resolve(JSON.stringify(result.content));
        }else {
            return Promise.reject(JSON.stringify(result.content));
        }
    }

    get(theUrl) {
        var _get = () =>{
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

        if(this.mockResponses){
            return this._mockRequest(theUrl);
        }else {
            return _get();
        }
    }

    post(theUrl, body, ignoredData) {
        var _post = () => {
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

        if(this.mockResponses){
            return this._mockRequest(theUrl);
        }else {
            return _post();
        }
    }

    upload(theUrl, file, onProgress) {
        var _upload = () => {
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

        if(this.mockResponses){
            return this._mockRequest(theUrl);
        }else {
            return _upload();
        }
    }

}

class APIRequester {
    constructor(mockObject) {
        this.httpRequests = new HTTPRequests(mockObject);
    }

    connect(mail, password, cookie) {
        return this.httpRequests.post('/auth/connect', {mailAddress: mail, password: password, cookie: cookie})
    }
    checkCookie() {
        return this.httpRequests.get('/auth/verify')
    }

    inscription(user) {
        return this.httpRequests.post('/users/inscription', user);
    }
    saveProgress(progress){
        return this.httpRequests.post('users/self/progress', progress);
    }
    getUser() {
        return this.httpRequests.get("/users/self")
    }
    resetPassword(mailAddress) {
        return this.httpRequests.post('/users/password/reset', mailAddress);
    }
    checkTimestampPassword(id) {
        return this.httpRequests.post('/users/password/new', id);
    }
    updatePassword(id, password) {
        return this.httpRequests.post('/users/password/update', {id: id, password: password});
    }

    getAllFormations() {
        return this.httpRequests.get('/formations');
    }
    getFormationsProgress(id) {
        return this.httpRequests.get('/formations/' + id + '/progression');
    }
    replaceFormation(id, newFormation, ignoredData) {
        //newFormation.status = status;
        return this.httpRequests.post("/formations/" + id, newFormation, ignoredData)
    }
    insertFormation(newFormation, ignoredData) {
        // newFormation.status = status;
        return this.httpRequests.post("/formations/insert", newFormation, ignoredData)
    }
    deactivateFormation(id, ignoredData) {
        return this.httpRequests.post("/formations/deactivate", {id: id}, ignoredData);
    }
    renameQuiz(formationId, levelIndex, gameIndex, newQuiz, ignoredData) {
        return this.httpRequests.post('/formations/quiz', {newQuiz:newQuiz, formationId:formationId, levelIndex:levelIndex, gameIndex:gameIndex}, ignoredData);
    }
    replaceQuiz(newQuiz, id, levelIndex, gameIndex, ignoredData) {
        return this.httpRequests.post('/formations/quiz/', {newQuiz:newQuiz, formationId:id, levelIndex:levelIndex, gameIndex:gameIndex} , ignoredData);
    }

    upload(file, onProgress) {
        return this.httpRequests.upload("/medias/upload", file, onProgress, this.deleteVideo);
    }
    getImages() {
        return this.httpRequests.get('/medias/images');
    }
    deleteImage(image) {
        return this.httpRequests.post("/medias/images/delete", image);
    }
    getVideos() {
        return this.httpRequests.get('/medias/videos');
    }
    deleteVideo(video) {
        return this.httpRequests.post("/medias/videos/delete", video);
    }
    updateSingleFormationStars(id, starId, versionId) {
        return this.httpRequests.post('/formations/userFormationEval/' + id, {starId: starId, versionId: versionId});
    }
}

exports.APIRequester = APIRequester;