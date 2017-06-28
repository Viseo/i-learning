const DollAdminV = require('../views/DollAdminV').DollAdminV;

exports.DollAdminP = function (globalVariables) {
    const DollView = DollAdminV(globalVariables),
        Presenter = globalVariables.Presenter;

    class DollAdminP extends Presenter {
        constructor(state, doll) {
            super(state);
            this.doll = doll;
            this.view = new DollView(this);
            this.mediaLibrary = state.getMediasLibrary();
        }

        getLabel() {
            return this.doll.getLabel();
        }

        getElements() {
            return this.doll.getElements();
        }

        getImages() {
            return this.mediaLibrary.getImages();
        }

        getVideos() {
            return this.mediaLibrary.getVideos();
        }

        uploadImageByFile(file, progressDisplay) {
            return this.state.uploadImage(file, progressDisplay);
        }

        save(elements) {
            this.doll.save(elements.map((elem, index) => {
                let options = {};
                switch(elem.type){
                    case 'rect':
                        options.fillColor = elem.fillColor;
                        options.strokeColor = elem.strokeColor;
                        break;
                    case 'text':
                        options.fillColor = elem._colors[0];
                        options.textMessage = elem.textMessage;
                        break;
                    case 'picture':
                        options.src = elem.src;
                        break;
                }
                return Object.assign({
                    type: elem.type,
                    width: elem.width,
                    height: elem.height,
                    globalX: elem.parentManip.x,
                    globalY: elem.parentManip.y,
                    layerIndex: index
                }, options);
            }), this.state.formation.formationId);
        }
    }
    return DollAdminP;
}
