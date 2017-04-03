/**
 * Created by ACA3502 on 12/04/2016.
 */

const
    assert = require('assert'),
    TwinBcrypt = require('twin-bcrypt'),
    //enhance = require('../lib/enhancer').Enhance(),

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

const setField = (root, fieldName, text) => {
    let field = retrieve(root, "[" + fieldName + "]").handler.parentObj;
    field.textMessage = text;
}

let runtime,
    svg,
    main,
    dbListenerModule,
    enhance,
    dbListener;

describe('Connection check headerMessage', function () {

    beforeEach(function () {
        enhance = require('../lib/enhancer').Enhance();
        runtime = mockRuntime();
        svg = SVG(runtime);
        runtime.declareAnchor('content');
        main = require("../src/main").main;
        dbListenerModule = require("../src/dbListener").dbListener;
        dbListener = new dbListenerModule(false, true);
    });

    it("header message without connection", function (done) {
        testutils.retrieveDB("./log/dbRien.json", dbListener, function () {
            svg.screenSize(1920, 1500);
            main(svg, runtime, dbListener, ImageRuntime);
            let root = runtime.anchor("content");
            let headerMessage = retrieve(root, "[headerMessage]");
            assert.equal(headerMessage.text, "Connexion");
            done();
        });
    });

    it("admin log in on formationsManager", function (done) {
        testutils.retrieveDB("./log/dbAdminConnexionFormationsManager.json", dbListener, function () {
            svg.screenSize(1920, 1500);
            main(svg, runtime, dbListener, ImageRuntime);
            let root = runtime.anchor("content");
            let headerMessage = retrieve(root, "[headerMessage]");
            assert.equal(headerMessage.text, "Formations");
            done();
        });
    });

    it("player log in on formationsManager", function (done) {
        testutils.retrieveDB("./log/dbPlayerConnexionFormationsManager.json", dbListener, function () {
            svg.screenSize(1920, 1500);
            main(svg, runtime, dbListener, ImageRuntime);
            let root = runtime.anchor("content");
            let headerMessage = retrieve(root, "[headerMessage]");
            assert.equal(headerMessage.text, "Formations");
            done();
        });
    });

});

describe('connection check textarea', function(){
    beforeEach(function () {
        enhance = require('../lib/enhancer').Enhance();
        runtime = mockRuntime();
        svg = SVG(runtime);
        runtime.declareAnchor('content');
        main = require("../src/main").main;
        dbListenerModule = require("../src/dbListener").dbListener;
        dbListener = new dbListenerModule(false, true);
    });

    it("should connect someone", function (done) {
        testutils.retrieveDB("./log/dbConnection.json", dbListener, function () {
            svg.screenSize(1920, 947);
            main = main(svg, runtime, dbListener, ImageRuntime);
            let root = runtime.anchor("content");
            runtime.listeners['resize']({w: 1500, h: 1500});

            let connexionButtonManipulator = retrieve(root, "[connexionButtonManipulator]");
            let mailAddressInput = retrieve(root, "[mailAddressField]").handler.parentObj;
            let passwordInput = retrieve(root, "[passwordField]").handler.parentObj;


            //assert.equal(2, connexionButtonManipulator.handler.parentManip.children().length);

            connexionButtonManipulator.listeners.click();
            runtime.advance();

            assert.equal(3, connexionButtonManipulator.handler.parentManip.components.length);
            assert.equal(connexionButtonManipulator.handler.parentManip.components[2].messageText, "Veuillez remplir tous les champs");

            mailAddressInput.textMessage = "aaaaaa";
            passwordInput.textMessage = "aaaaaa";
            connexionButtonManipulator.listeners.click();
            assert.equal(connexionButtonManipulator.handler.parentManip.components[3].messageText, "Connexion refusée : \nveuillez entrer une adresse e-mail et un mot de passe valide");
            runtime.advance();

            mailAddressInput.textMessage = "a@";
            connexionButtonManipulator.listeners.click();
            assert.equal(connexionButtonManipulator.handler.parentManip.components[3].messageText, "Connexion refusée : \nveuillez entrer une adresse e-mail et un mot de passe valide");
            runtime.advance();

            mailAddressInput.textMessage = "a@a.a";
            //mailAddressInput.onInputFct("a@a.a");
            runtime.listeners['keydown']({keyCode: 9, preventDefault: ()=> {}});
            runtime.listeners['keydown']({keyCode: 13, preventDefault: ()=> {}});
            assert.notEqual(main.formationsManager, null);
            assert.equal(main.playerMode , true);
            done();
        });
    });

    it("should connect an admin", function (done) {
        testutils.retrieveDB("./log/dbAdminConnection.json", dbListener, function () {
            svg.screenSize(1920, 947);
            main = main(svg, runtime, dbListener, ImageRuntime);
            let root = runtime.anchor("content");

            let connexionButtonManipulator = retrieve(root, "[connexionButtonManipulator]");
            let cookieManipulator = retrieve(root,"[cookieManipulator]");
            cookieManipulator.listeners.click();            // on désélectionne la case "Rester connecté"
            cookieManipulator.listeners.click();            // on recoche la case "Rester connecté"

            let mailAddressInput = retrieve(root, "[mailAddressField]").handler.parentObj;
            mailAddressInput.textMessage = "a";

            let passwordInput = retrieve(root, "[passwordField]").handler.parentObj;
            passwordInput.textMessage = "aaaaaa";

            connexionButtonManipulator.listeners.click();
            assert.equal(connexionButtonManipulator.handler.parentManip.components[1].messageText, "Connexion refusée : \nveuillez entrer une adresse e-mail et un mot de passe valide");
            runtime.advance();

            mailAddressInput.textMessage = "a@d.m";

            connexionButtonManipulator = retrieve(root, "[connexionButtonManipulator]");
            connexionButtonManipulator.listeners.click();
            assert.notEqual(main.formationsManager, null);
            assert.equal(main.playerMode , false);


            runtime.advance();

            done();
        });
    });

});

describe('Forgotten password', function () {
    beforeEach(function () {
        enhance = require('../lib/enhancer').Enhance();
        runtime = mockRuntime();
        svg = SVG(runtime);
        runtime.declareAnchor('content');
        main = require("../src/main").main;
        dbListenerModule = require("../src/dbListener").dbListener;
        dbListener = new dbListenerModule(false, true);
    });

    it("should send an email to reset your password with a valid user", function (done) {
        testutils.retrieveDB("./log/dbResetPassword.json", dbListener, function () {
            svg.screenSize(1920, 1500);
            main(svg, runtime, dbListener, ImageRuntime);
            let root = runtime.anchor("content");
            let headerMessage = retrieve(root, "[headerMessage]");
            assert.equal(headerMessage.text, "Connexion");
            setField(root, "mailAddressField", "ilearningtest@gmail.com");
            let newPassword = retrieve(root, "[newPasswordManipulator]");
            newPassword.listeners.click();
            let forgottenPassText = retrieve(root, "[forgottenPassText]");
            assert.equal(forgottenPassText.handler.messageText, "Un mail a été envoyé à ilearningtest@gmail.com pour réinitialiser votre mot de passe.");
            runtime.advance();
            done();
        });
    });

    it("should check false ID in the URL typed", function (done) {
        testutils.retrieveDB("./log/dbNotValidPWDID.json", dbListener, function () {
            svg.screenSize(1920, 1500);
            let randomID = "5429f8a8b6018bd7c0fb32c4d2b5f9a664b5";                          // retour base de données comme ID faux
            main(svg, runtime, dbListener, ImageRuntime, {redirect: true, ID: randomID});
            let root = runtime.anchor("content");
            let headerMessage = retrieve(root, "[headerMessage]");
            assert.equal(headerMessage.text, "Password");
            let errorMessage = retrieve(root,"[tryAgainError]");
            assert.equal(errorMessage.handler.messageText,"Veuillez réessayer, le délai est dépassé, ou l\'ID est érroné");
            done();
        });
    });

    it("should check given ID in the URL typed", function (done) {
        testutils.retrieveDB("./log/dbResetPWDwithID.json", dbListener, function () {
            svg.screenSize(1920, 1500);
            let randomID = "5429f8a8b6018bd7c0fb32c4d2b5f9a664b5";                          // retour base de données comme ID valide
            main(svg, runtime, dbListener, ImageRuntime, {redirect: true, ID: randomID});
            let root = runtime.anchor("content");
            let headerMessage = retrieve(root, "[headerMessage]");
            assert.equal(headerMessage.text, "Password");
            /**
             * Test en cas de champs vides
             */
            let passwordButtonManipulator = retrieve(root, "[passwordButtonManipulator]");
            passwordButtonManipulator.listeners.click();
            // runtime.advance(); /** TODO Timeout qui fait planter la suite **/
            let messageManipulator = retrieve(root,"[emptyFieldError]");
            assert.equal(messageManipulator.handler.messageText, EMPTY_FIELD_ERROR);
            /**
             * Test en cas de mot de passe de moins de 6 caractères
             */
            passwordButtonManipulator = retrieve(root, "[passwordButtonManipulator]");
            setField(root, "createPasswordField", "court");
            setField(root, "checkPasswordField", "court");
            passwordButtonManipulator.listeners.click();
            messageManipulator = retrieve(root,"[shortPWDError]");
            assert.equal(messageManipulator.handler.messageText, "Le mot de passe doit contenir au minimum 6 caractères");
            /**
             * Test en cas de mots de passe qui ne sont pas identiques dans les deux champs
             */
            // setField(root, "createPasswordField", "testmocha");
            // setField(root, "checkPasswordField", "testmocho"); /** TODO trouver un moyen de simuler clicEvent **/
            let createPasswordField = retrieve(root, "[createPasswordField]").handler.parentObj;
            createPasswordField.textMessage = "testmocha";
            let checkPasswordField = retrieve(root, "[checkPasswordField]").handler.parentObj;
            checkPasswordField.textMessage = "testmocho";

            passwordButtonManipulator.listeners.click();
            messageManipulator = retrieve(root,"[PWDnotMatchError]");
            assert.equal(messageManipulator.handler.messageText, "Les champs ne correspondent pas !");
            setField(root, "createPasswordField", "testmocha");
            setField(root, "checkPasswordField", "testmocha");
            passwordButtonManipulator.listeners.click();
            messageManipulator = retrieve(root,"[updatedPWD]");
            assert.equal(messageManipulator.handler.messageText, "Mot de passe mis à jour !");
            runtime.advance();
            headerMessage = retrieve(root, "[headerMessage]");
            assert.equal(headerMessage.text, "Connexion");
            done();
        });
    });

    it("should not save given new password", function (done) {
        testutils.retrieveDB("./log/dbResetPWDserverCrash.json", dbListener, function () {
            svg.screenSize(1920, 1500);
            let randomID = "5429f8a8b6018bd7c0fb32c4d2b5f9a664b5";                          // retour base de données comme ID valide
            main(svg, runtime, dbListener, ImageRuntime, {redirect: true, ID: randomID});
            let root = runtime.anchor("content");
            let headerMessage = retrieve(root, "[headerMessage]");
            assert.equal(headerMessage.text, "Password");
            setField(root, "createPasswordField", "testmocha");
            setField(root, "checkPasswordField", "testmocha");
            let passwordButtonManipulator = retrieve(root, "[passwordButtonManipulator]");
            passwordButtonManipulator.listeners.click();
            let messageManipulator = retrieve(root,"[serverErrorMessage]");
            assert.equal(messageManipulator.handler.messageText, "Une Erreur est survenue, rééssayer plus tard !");
            done();
        });
    });
});