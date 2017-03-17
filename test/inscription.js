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

const enter = (contentArea, label) => {
    contentArea.value = label;
    contentArea.listeners["input"]();
    contentArea.value = label;
    contentArea.listeners["blur"]();
};

let runtime,
    svg,
    main,
    dbListenerModule,
    dbListener;

describe('inscription', function(){
    beforeEach(function () {
        runtime = mockRuntime();
        svg = SVG(runtime);
        runtime.declareAnchor('content');
        main = require("../src/main").main;
        dbListenerModule = require("../src/dbListener").dbListener;
        dbListener = new dbListenerModule(false, true);
    });

    it("should sign up someone", function (done) {
        testutils.retrieveDB("./log/dbInscription.json", dbListener, function () {
            svg.screenSize(1920, 947);
            main(svg, runtime, dbListener, ImageRuntime);
            let root = runtime.anchor("content");

            let  inscriptionLink = retrieve(root, '[inscriptionLink]');
            inscriptionLink.listeners['click']();

            runtime.listeners['resize']({w:1500, h:1500});

            let lastNameField = retrieve(root, '[lastNameField]');
            lastNameField.listeners['click']();
            let inscriptionContentArea = retrieve(root, '[inscriptionContentArea]');
            enter(inscriptionContentArea, '');
            let inscriptionErrorMessagelastNameField = retrieve(root, '[inscriptionErrorMessagelastNameField]');

            assert.equal(inscriptionErrorMessagelastNameField.text,
                testutils.escape("Seuls les caractères alphabétiques, le tiret, l'espace et l'apostrophe sont autorisés"));

            lastNameField = retrieve(root, '[lastNameField]');
            lastNameField.listeners['click']();
            inscriptionContentArea = retrieve(root, '[inscriptionContentArea]');
            enter(inscriptionContentArea, 'nom');
            inscriptionErrorMessagelastNameField = retrieve(root, '[inscriptionErrorMessagelastNameField]');
            assert(!inscriptionErrorMessagelastNameField);

            let firstNameField = retrieve(root, '[firstNameField]');
            firstNameField.listeners['click']();
            inscriptionContentArea = retrieve(root, '[inscriptionContentArea]');
            enter(inscriptionContentArea, '');
            let inscriptionErrorMessagefirstNameField = retrieve(root, '[inscriptionErrorMessagefirstNameField]');
            assert.equal(inscriptionErrorMessagefirstNameField.text,
                testutils.escape("Seuls les caractères alphabétiques, le tiret, l'espace et l'apostrophe sont autorisés"));




            firstNameField = retrieve(root, '[firstNameField]');
            firstNameField.listeners['click']();
            inscriptionContentArea = retrieve(root, '[inscriptionContentArea]');
            enter(inscriptionContentArea, 'prénom');
            inscriptionErrorMessagefirstNameField = retrieve(root, '[inscriptionErrorMessagefirstNameField]');
            assert(!inscriptionErrorMessagefirstNameField);

            let mailAddressField = retrieve(root, '[mailAddressField]');
            mailAddressField.listeners['click']();
            inscriptionContentArea = retrieve(root, '[inscriptionContentArea]');
            enter(inscriptionContentArea, '');
            mailAddressField.listeners['click']();
            inscriptionContentArea = retrieve(root, '[inscriptionContentArea]');
            enter(inscriptionContentArea, 'ra@');
            let inscriptionErrorMessagemailAddressField= retrieve(root, '[inscriptionErrorMessagemailAddressField]');
            assert.equal(inscriptionErrorMessagemailAddressField.text,
                testutils.escape("L'adresse email n'est pas valide"));


            mailAddressField = retrieve(root, '[mailAddressField]');
            mailAddressField.listeners['click']();
            inscriptionContentArea = retrieve(root, '[inscriptionContentArea]');
            enter(inscriptionContentArea, 'test@test.test');
            inscriptionErrorMessagemailAddressField = retrieve(root, '[inscriptionErrorMessagemailAddressField]');
            assert(!inscriptionErrorMessagemailAddressField);

            let passwordField = retrieve(root, '[passwordField]');
            passwordField.listeners['click']();
            inscriptionContentArea = retrieve(root, '[inscriptionContentArea]');
            enter(inscriptionContentArea, 'aaa');
            let inscriptionErrorMessagepasswordField= retrieve(root, '[inscriptionErrorMessagepasswordField]');
            assert.equal(inscriptionErrorMessagepasswordField.text,
                testutils.escape("Le mot de passe doit contenir au minimum 6 caractères"));

            passwordField = retrieve(root, '[passwordField]');
            passwordField.listeners['click']();
            inscriptionContentArea = retrieve(root, '[inscriptionContentArea]');
            enter(inscriptionContentArea, 'testtes');
            enter(inscriptionContentArea, 'testtest');
            inscriptionErrorMessagepasswordField = retrieve(root, '[inscriptionErrorMessagepasswordField]');
            assert(!inscriptionErrorMessagepasswordField);

            let passwordConfirmationField = retrieve(root, '[passwordConfirmationField]');
            passwordConfirmationField.listeners['click']();
            inscriptionContentArea = retrieve(root, '[inscriptionContentArea]');
            enter(inscriptionContentArea, 'aaa');
            inscriptionErrorMessagepasswordField= retrieve(root, '[inscriptionErrorMessagepasswordField]');
            assert.equal(inscriptionErrorMessagepasswordField.text,
                testutils.escape("Le mot de passe doit contenir au minimum 6 caractères"));

            passwordConfirmationField = retrieve(root, '[passwordConfirmationField]');
            passwordConfirmationField.listeners['click']();
            inscriptionContentArea = retrieve(root, '[inscriptionContentArea]');
            enter(inscriptionContentArea, 'aaaaaa');
            inscriptionErrorMessagepasswordField = retrieve(root, '[inscriptionErrorMessagepasswordField]');
            assert.equal(inscriptionErrorMessagepasswordField.text,
                testutils.escape("La confirmation du mot de passe n'est pas valide"));

            let inscriptionButton = retrieve(root, '[inscriptionButton]');
            inscriptionButton.listeners['click']();

            runtime.listeners['keydown']({keyCode:13, preventDefault:()=>{}});

            passwordConfirmationField = retrieve(root, '[passwordConfirmationField]');
            passwordConfirmationField.listeners['click']();
            inscriptionContentArea = retrieve(root, '[inscriptionContentArea]');
            enter(inscriptionContentArea, 'testtest');
            inscriptionErrorMessagepasswordField = retrieve(root, '[inscriptionErrorMessagepasswordField]');
            assert(!inscriptionErrorMessagepasswordField);

            inscriptionButton = retrieve(root, '[inscriptionButton]');
            runtime.listeners['keydown']({keyCode:9, preventDefault:()=>{}});
            runtime.listeners['keydown']({keyCode:9, preventDefault:()=>{}});
            runtime.listeners['keydown']({keyCode:27, preventDefault:()=>{}});

            inscriptionButton.listeners['click']();

            let connectionLink = retrieve(root, '[inscriptionLink]');
            connectionLink.listeners['click']();

            done();
        });
    });
});