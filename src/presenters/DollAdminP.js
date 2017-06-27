const DollAdminV = require('../views/DollAdminV').DollAdminV;

exports.DollAdminP = function(globalVariables) {
    const DollView = DollAdminV(globalVariables),
        Presenter = globalVariables.Presenter;

    class DollAdminP extends Presenter{
        constructor(state, doll){
            super(state);
            this.doll = doll;
            this.view = new DollView(this);
            this.mediaLibrary = state.getMediasLibrary();
        }

        getLabel(){
            return this.doll.getLabel();
        }

        getRects(){
            return this.doll.getRects();
        }

        getImages() {
            return this.mediaLibrary.getImages();
        }
        getVideos(){
            return this.mediaLibrary.getVideos();
        }

        uploadImageByFile(file, progressDisplay){
            return this.state.uploadImage(file, progressDisplay);
        }

        save(rects){
            this.doll.save(rects);
        }

    }
return DollAdminP;
}
