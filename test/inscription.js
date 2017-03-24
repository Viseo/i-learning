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
    let field = retrieve(root, "[" + fieldName + "]").handler.parentObj;
    field.textMessage = text;
}

let runtime,
    svg,
    main,
    dbListenerModule,
    dbListener,
    root;

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
            main(svg, runtime, dbListener, ImageRuntime);
            let root = runtime.anchor('content');

            let inscriptionText = retrieve(root, "[inscriptiontext]");
            inscriptionText.handler.parentManip.listeners["click"]();

            let saveButton = retrieve(root, "[saveButton]");
            saveButton.handler.parentManip.listeners["click"]();

            let errorMessage = retrieve(root, "[errorMessage]");
            assert.equal(errorMessage.handler.messageText, 'Veuillez remplir tous les champs');
            done();
        });
    });

    it('should not signup (password too short)', function (done) {
       testutils.retrieveDB("./log/dbInscription.json", dbListener, function(){
           svg.screenSize(1920, 947);
           let global = main(svg, runtime, dbListener, ImageRuntime);
           let root = runtime.anchor('content');

           let inscriptionText = retrieve(root, "[inscriptiontext]");
           inscriptionText.handler.parentManip.listeners["click"]();

           setField(root, 'lastNameField', 'nom');
           setField(root, 'firstNameField', 'prénom');
           setField(root, 'mailAddressField', 'test@test.test')
           setField(root, 'passwordField', 'aaa');
           setField(root, 'passwordConfirmationField', 'aaa');

           let saveButton = retrieve(root, "[saveButton]");
           saveButton.handler.parentManip.listeners["click"]();

           let errorMessage = retrieve(root, "[errorMessage]");
           assert.equal(errorMessage.handler.messageText, 'Le mot de passe doit contenir au minimum 6 caractères');
           done();
       })
    });

    it('should not signup (wrong confirmation password)', function (done) {
        testutils.retrieveDB("./log/dbInscription.json", dbListener, function(){
            svg.screenSize(1920, 947);
            let global = main(svg, runtime, dbListener, ImageRuntime);
            let root = runtime.anchor('content');

            let inscriptionText = retrieve(root, "[inscriptiontext]");
            inscriptionText.handler.parentManip.listeners["click"]();

            setField(root, 'lastNameField', 'nom');
            setField(root, 'firstNameField', 'prénom');
            setField(root, 'mailAddressField', 'test@test.test')
            setField(root, 'passwordField', 'aaaaaa');
            setField(root, 'passwordConfirmationField', 'adfdsfaaabbb');

            let saveButton = retrieve(root, "[saveButton]");
            saveButton.handler.parentManip.listeners["click"]();

            let errorMessage = retrieve(root, "[errorMessage]");
            assert.equal(errorMessage.handler.messageText, "La confirmation du mot de passe n'est pas valide");
            done();
        })
    });

    it("should sign up someone", function (done) {
        testutils.retrieveDB("./log/dbInscription.json", dbListener, function () {
            svg.screenSize(1920, 947);
            let global = main(svg, runtime, dbListener, ImageRuntime);
            let root = runtime.anchor("content");

            let inscriptionText = retrieve(root, "[inscriptiontext]");
            inscriptionText.handler.parentManip.listeners["click"]();

            setField(root, 'lastNameField', 'nom');
            setField(root, 'firstNameField', 'prénom');
            setField(root, 'mailAddressField', 'test@test.test')
            setField(root, 'passwordField', 'aaaaaa');
            setField(root, 'passwordConfirmationField', 'aaaaaa');

            let saveButton = retrieve(root, "[saveButton]");
            saveButton.handler.parentManip.listeners["click"]();

            let successMessage = retrieve(root, "[successMessage]")
            assert.equal(successMessage.handler.messageText, 'Votre compte a bien été créé !');

            done();
        });
    });
});