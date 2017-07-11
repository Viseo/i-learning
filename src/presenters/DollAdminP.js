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

        getObjectives(){
            return this.doll.getObjectives();
        }

        getResponses(){
            return this.doll.getResponses();
        }
        getStatement(){
            return this.doll.getStatement();
        }
        addStatement(obj){
            this.doll.addStatement(obj)
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

        save(infos) {
            infos.elements = infos.elements.map((elem, index) => {
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
                    globalY: elem.parentManip.y
                }, options);
            })
            return this.doll.save(this.state.formation.formationId, infos);
        }
        createRule(conf, objective, best){
            this.doll.createRule(conf, objective, best);
        }
        removeRule(obj, objective, best){
            this.doll.removeRule(obj, objective);
        }
        addResponse(response){
            this.doll.addResponse(response);
        }
        removeResponse(response){
            this.doll.removeResponse(response);
        }
        addObjective(obj){
            this.doll.addObjective(obj);
        }
        removeObjective(obj){
            this.doll.removeObjective(obj);
        }
        findObjective(obj) {
            this.doll.findObjective(obj);
        }
        renameDoll(label) {
            this.doll.renameDoll(label);
        }
    }
    return DollAdminP;
}
