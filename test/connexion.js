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
            main(svg, runtime, dbListener, ImageRuntime);
            let root = runtime.anchor("content");
            runtime.listeners['resize']({w: 1500, h: 1500});
            let mailAddressField = retrieve(root, '[mailAddressField]');
            mailAddressField.listeners['click']();
            let connectionContentArea = retrieve(root, '[connectionContentArea]');
            enter(connectionContentArea, '');
            let passwordField = retrieve(root, '[passwordField]');
            passwordField.listeners['click']();
            connectionContentArea = retrieve(root, '[connectionContentArea]');
            enter(connectionContentArea, 'aaaaaa');
            let connexionButton = retrieve(root, '[connexionButton]');
            connexionButton.listeners['click']();
            runtime.advance();

            mailAddressField = retrieve(root, '[mailAddressField]');
            mailAddressField.listeners['click']();
            connectionContentArea = retrieve(root, '[connectionContentArea]');
            enter(connectionContentArea, 'a@');
            passwordField = retrieve(root, '[passwordField]');
            passwordField.listeners['click']();
            connectionContentArea = retrieve(root, '[connectionContentArea]');
            enter(connectionContentArea, 'aaaaaa');
            connexionButton = retrieve(root, '[connexionButton]');
            connexionButton.listeners['click']();
            runtime.advance();

            mailAddressField = retrieve(root, '[mailAddressField]');
            mailAddressField.listeners['click']();
            connectionContentArea = retrieve(root, '[connectionContentArea]');
            enter(connectionContentArea, 'a@a.a');
            passwordField = retrieve(root, '[passwordField]');
            passwordField.listeners['click']();
            connectionContentArea = retrieve(root, '[connectionContentArea]');
            enter(connectionContentArea, 'aaaaaa');
            runtime.listeners['keydown']({keyCode: 9, preventDefault: ()=> {}});
            runtime.listeners['keydown']({keyCode: 13, preventDefault: ()=> {}});
            done();
        });
    });

    it("should connect an admin", function (done) {
        testutils.retrieveDB("./log/dbAdminConnection.json", dbListener, function () {
            svg.screenSize(1920, 947);
            main(svg, runtime, dbListener, ImageRuntime);
            let root = runtime.anchor("content");
            let mailAddressField = retrieve(root, '[mailAddressField]');
            mailAddressField.listeners['click']();
            let connectionContentArea = retrieve(root, '[connectionContentArea]');
            connectionContentArea.value = 'a@d.m';
            connectionContentArea.listeners['blur']();
            let passwordField = retrieve(root, '[passwordField]');
            passwordField.listeners['click']();
            connectionContentArea = retrieve(root, '[connectionContentArea]');
            connectionContentArea.value = 'aaaaaa';
            connectionContentArea.listeners['blur']();
            let connexionButton = retrieve(root, '[connexionButton]');
            connexionButton.listeners['click']();
            runtime.advance();
            runtime.listeners['keydown']({keyCode: 9, preventDefault: ()=> {}});
            runtime.listeners['keydown']({keyCode: 13, preventDefault: ()=> {}});
            done();
        });
    });
});