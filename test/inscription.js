const
    assert = require('assert'),
    TwinBcrypt = require('twin-bcrypt'),

    testutils = require('../lib/testutils'),
    mockRuntime = require('../lib/runtimemock').mockRuntime,
    SVG = require('../lib/svghandler').SVG,
    inspect = testutils.inspect,
    retrieve = testutils.retrieve,
    checkScenario = testutils.checkScenario,
    ERROR_MESSAGE_INPUT = 'Seuls les caractères alphanumériques, avec accent et "-,\',.;?!°© sont permis';


const ImageRuntime = {
    images: {},
    count: 0,

    getImage: function (imgUrl, onloadHandler) {
        this.count++;
        const image = {
            src: imgUrl,
            onload: onloadHandler,
            id: "i" + this.count
        };
        this.images[image.id] = image;
        return image;
    },

    imageLoaded: function (id, w, h) {
        this.images[id].width = w;
        this.images[id].height = h;
        this.images[id].onload();
    }
};

const testKeyDownArrow = (runtime) => {
    runtime.listeners['keydown']({keyCode:39, preventDefault:()=>{}});
    runtime.listeners['keydown']({keyCode:40, preventDefault:()=>{}});
    runtime.listeners['keydown']({keyCode:37, preventDefault:()=>{}});
    runtime.listeners['keydown']({keyCode:38, preventDefault:()=>{}});
};

const setField = (root, fieldName, text) => {
    let field = root[fieldName].input;
    field.message(text);
    assert.equal(field.textMessage, text);
}

let runtime,
    svg,
    main,
    dbListenerModule,
    dbListener;

describe('inscription', function(){
    beforeEach(function () {
        enhance = require('../lib/enhancer').Enhance();
        runtime = mockRuntime();
        svg = SVG(runtime);
        runtime.declareAnchor('content');
        main = require("../src/main").main;
        dbListenerModule = require("../src/dbListener").dbListener;
        dbListener = new dbListenerModule(false, true);
    });

    it('should not signup (empty field)', function(done){
        testutils.retrieveDB("./log/dbInscription.json", dbListener, function(){
            svg.screenSize(1920, 947);
            let global = main(svg, runtime, dbListener, ImageRuntime);

            global.connexionManager.inscriptionTextManipulator.listeners["click"]();
            global.inscriptionManager.saveButtonManipulator.listeners['click']();

            let errorMessage = global.inscriptionManager.saveButtonManipulator.children()[1];
            assert.equal(errorMessage.messageText, 'Veuillez remplir tous les champs');
            done();
        });
    });

    it('should not signup (password too short)', function (done) {
       testutils.retrieveDB("./log/dbInscription.json", dbListener, function(){
           svg.screenSize(1920, 947);
           let global = main(svg, runtime, dbListener, ImageRuntime);
           global.connexionManager.inscriptionTextManipulator.listeners["click"]();

           setField(global.inscriptionManager, 'lastNameField', 'nom');
           setField(global.inscriptionManager, 'firstNameField', 'prénom');
           setField(global.inscriptionManager, 'mailAddressField', 'test@test.test')
           setField(global.inscriptionManager, 'passwordField', 'aaa');
           setField(global.inscriptionManager, 'passwordConfirmationField', 'aaa');

           global.inscriptionManager.saveButtonManipulator.listeners['click']();

           let errorMessage = global.inscriptionManager.saveButtonManipulator.children()[1];
           assert.equal(errorMessage.messageText, 'Le mot de passe doit contenir au minimum 6 caractères');
           done();
       })
    });

    it('should not signup (wrong confirmation password)', function (done) {
        testutils.retrieveDB("./log/dbInscription.json", dbListener, function(){
            svg.screenSize(1920, 947);
            let global = main(svg, runtime, dbListener, ImageRuntime);
            global.connexionManager.inscriptionTextManipulator.listeners["click"]();

            setField(global.inscriptionManager, 'lastNameField', 'nom');
            setField(global.inscriptionManager, 'firstNameField', 'prénom');
            setField(global.inscriptionManager, 'mailAddressField', 'test@test.test')
            setField(global.inscriptionManager, 'passwordField', 'aaaaaa');
            setField(global.inscriptionManager, 'passwordConfirmationField', 'adfdsfaaabbb');

            global.inscriptionManager.saveButtonManipulator.listeners['click']();

            let errorMessage = global.inscriptionManager.saveButtonManipulator.children()[1];
            assert.equal(errorMessage.messageText, "La confirmation du mot de passe n'est pas valide");
            done();
        })
    });

    it("should sign up someone", function (done) {
        testutils.retrieveDB("./log/dbInscription.json", dbListener, function () {
            svg.screenSize(1920, 947);
            let global = main(svg, runtime, dbListener, ImageRuntime);
            let root = runtime.anchor("content");

            global.connexionManager.inscriptionTextManipulator.listeners["click"]();

            let headerMessage = retrieve(root, "[headerMessage]");
            assert.equal(headerMessage.text, "Inscription");

            setField(global.inscriptionManager, 'lastNameField', 'nom');
            setField(global.inscriptionManager, 'firstNameField', 'prénom');
            setField(global.inscriptionManager, 'mailAddressField', 'test@test.test')
            setField(global.inscriptionManager, 'passwordField', 'aaaaaa');
            setField(global.inscriptionManager, 'passwordConfirmationField', 'aaaaaa');

            global.inscriptionManager.saveButtonManipulator.listeners['click']();

            let successMessage = global.inscriptionManager.saveButtonManipulator.children()[1];
            assert.equal(successMessage.messageText, 'Votre compte a bien été créé !');

            done();
        });
    });
});