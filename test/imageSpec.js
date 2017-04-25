/**
 * Created by DMA3622 on 24/04/2017.
 */
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
    runtime.listeners['keydown']({
        keyCode: 39, preventDefault: () => {
        }
    });
    runtime.listeners['keydown']({
        keyCode: 40, preventDefault: () => {
        }
    });
    runtime.listeners['keydown']({
        keyCode: 37, preventDefault: () => {
        }
    });
    runtime.listeners['keydown']({
        keyCode: 38, preventDefault: () => {
        }
    });
};

const enter = (contentArea, label) => {
    contentArea.value = label;
    contentArea.listeners["input"]();
    contentArea.value = label;
    contentArea.listeners["blur"]();
};


/**
 * @param root
 * @param nameCheckElement {string} nom de l element qu on souhaite checker la valeur : valueExpected
 * @param valueExpected la valeur qu on attend de l element : nameCheckElement, si cette la valeur est null on check si l element : nameCheckElement est bien null
 */
const testValueOnElement = (root, nameCheckElement, valueExpected) => {
    let checkElement = retrieve(root, "[" + nameCheckElement + "]");
    if (valueExpected == null) {
        assert(!checkElement);
    } else {
        assert.equal(checkElement.text, testutils.escape(valueExpected));
    }
};


/**
 *
 * @param root
 * @param nameClickElement {string} nom de l element qu on souhaite faire un click
 */
const callClickOnElement = (root, nameClickElement) => {
    let clickElement = retrieve(root, "[" + nameClickElement + "]");
    clickElement.listeners["click"]();
};


/**
 *
 * @param root
 * @param nameEnterElement
 * @param value
 */
const callEnterOnElement = (root, nameEnterElement, value) => {
    var myElement = retrieve(root, "[" + nameEnterElement + "]");
    enter(myElement, value);
};


let runtime,
    svg,
    main,
    enhance,
    dbListenerModule,
    dbListener;

describe('popOut', function () {

    beforeEach(function () {
        enhance = require('../lib/enhancer').Enhance();
        runtime = mockRuntime();
        svg = SVG(runtime);
        runtime.declareAnchor('content');
        main = require("../src/main").main;
        dbListenerModule = require("../src/dbListener").dbListener;
        dbListener = new dbListenerModule(false, true);
    });

    it('should display and hide a popout', function (done) {
        testutils.retrieveDB("./log/imageSpecTest.json", dbListener, function () {
            svg.screenSize(1920, 947);
            main(svg, runtime, dbListener, ImageRuntime);
            let root = runtime.anchor("content");

            let maFormation = retrieve(root, "[A-TestPopOut]");
            assert.equal(maFormation.handler.parentManip.get(1).messageText, "A-TestPopOut");
            callClickOnElement(root, 'A-TestPopOutSetup');
            for (let image in ImageRuntime.images) {
                ImageRuntime.imageLoaded(image, 50, 50);
            }
            runtime.advance();
            let popUpRedCross = retrieve(root, '[popupRedcross]');
            popUpRedCross.listeners['mouseup']();
            done();
        })
    });

    it('should delete an image from database', function (done) {
        testutils.retrieveDB("./log/imageSpecTest.json", dbListener, function () {
            svg.screenSize(1920, 947);
            main(svg, runtime, dbListener, ImageRuntime);
            let root = runtime.anchor("content");

            let maFormation = retrieve(root, "[A-TestPopOut]");
            assert.equal(maFormation.handler.parentManip.get(1).messageText, "A-TestPopOut");
            callClickOnElement(root, 'A-TestPopOutSetup');
            for (let image in ImageRuntime.images) {
                ImageRuntime.imageLoaded(image, 50, 50);
            }
            runtime.advance();
            let randomDeletedImage = retrieve(root, "[image199332dca1bb6993461e3cb71cf540e7]");
            randomDeletedImage.listeners['mouseenter']();
            callClickOnElement(root, 'imageRedCross');   // test pour supprimer une image de la base de données
            let popUpRedCross = retrieve(root, '[popupRedcross]');
            popUpRedCross.listeners['mouseup']();
            done();
        })
    });

    it('should add an image inside a formation and delete it', function (done) {
        testutils.retrieveDB("./log/imageSpecTest2.json", dbListener, function () {
            svg.screenSize(1920, 947);
            main(svg, runtime, dbListener, ImageRuntime);
            let root = runtime.anchor("content");

            let maFormation = retrieve(root, '[A-TestPopOut]');
            assert.equal(maFormation.handler.parentManip.get(1).messageText, 'A-TestPopOut');
            let maFormationCoordinates = {
                x: maFormation.handler.parent.globalPoint(0, 0).x,
                y: maFormation.handler.parent.globalPoint(0, 0).y
            }
            callClickOnElement(root, 'A-TestPopOutSetup');
            for (let image in ImageRuntime.images) {
                ImageRuntime.imageLoaded(image, 50, 50);
            }
            runtime.advance();
            let randomSetImage = retrieve(root, '[image199332dca1bb6993461e3cb71cf540e7]');
            let randomSetImageCoordinates = {
                x: randomSetImage.handler.parent.globalPoint(0, 0).x,
                y: randomSetImage.handler.parent.globalPoint(0, 0).y
            }
            randomSetImage.listeners['mouseenter']();
            randomSetImage.listeners['mouseleave']({
                pageX: 0, pageY: 0, preventDefault: () => {
                }
            });
            randomSetImage.listeners['mousedown']({
                pageX: randomSetImageCoordinates.x, pageY: randomSetImageCoordinates.y, preventDefault: () => {
                }
            });
            let draggableImg = retrieve(root,'[imgDraged]');
            assert.equal(draggableImg.href, randomSetImage.href);
            draggableImg.listeners['mouseup']({
                pageX: maFormationCoordinates.x, pageY: maFormationCoordinates.y, preventDefault: () => {
                }
            })
            let formationSetUpImage = retrieve(root,'[A-TestPopOutSetupImage]');
            formationSetUpImage.listeners['mouseenter']();
            formationSetUpImage.listeners['mouseleave']({
                pageX: 0, pageY: 0, preventDefault: () => {
                }
            });
            formationSetUpImage.listeners['mouseenter']();
            callClickOnElement(root, 'imageRedCross');
            let popUpRedCross = retrieve(root, '[popupRedcross]');
            popUpRedCross.listeners['mouseup']();
            done();
        })
    });

    it('should add an image inside a quizz and delete it', function (done) {
        testutils.retrieveDB("./log/imageSpecTest3.json", dbListener, function () {
            svg.screenSize(1920, 947);
            main(svg, runtime, dbListener, ImageRuntime);
            let root = runtime.anchor("content");

            let maFormation = retrieve(root, '[A-TestPopOut]');
            assert.equal(maFormation.handler.parentManip.get(1).messageText, 'A-TestPopOut');
            maFormation.handler.parentManip.listeners['click']();

            let firstGameTitle = retrieve(root, '[titlelevel0quizz0]');
            assert.equal(firstGameTitle.handler.originalText,'Quiz 1');
            let firstGame = retrieve(root, '[level0quizz0]');
            let firstGameCoordinates = {
                x: firstGameTitle.handler.parent.globalPoint(0, 0).x,
                y: firstGameTitle.handler.parent.globalPoint(0, 0).y
            }
            firstGame.handler.parentManip.parentObject.settingsManipulator.listeners['click']();  // click du settingsManipulator de la classe MiniatureGame
            for (let image in ImageRuntime.images) {
                ImageRuntime.imageLoaded(image, 50, 50);
            }
            runtime.advance();
            let randomSetImage = retrieve(root, '[image27e66e90e5458a59c122affad1f04819]');
            let randomSetImageCoordinates = {
                x: randomSetImage.handler.parent.globalPoint(0, 0).x,
                y: randomSetImage.handler.parent.globalPoint(0, 0).y
            };
            randomSetImage.listeners['mouseenter']();
            randomSetImage.listeners['mouseleave']({
                pageX: 0, pageY: 0, preventDefault: () => {
                }
            });
            randomSetImage.listeners['mousedown']({
                pageX: randomSetImageCoordinates.x, pageY: randomSetImageCoordinates.y, preventDefault: () => {
                }
            });
            let draggableImg = retrieve(root,'[imgDraged]');
            assert.equal(draggableImg.href, randomSetImage.href);
            draggableImg.listeners['mouseup']({
                pageX: firstGameCoordinates.x, pageY: firstGameCoordinates.y, preventDefault: () => {
                }
            })
            let quizzSetUpImage = firstGame.handler.parentManip.components['7'].component;
            quizzSetUpImage.listeners['mouseenter']();
            quizzSetUpImage.listeners['mouseleave']({
                pageX: 0, pageY: 0, preventDefault: () => {
                }
            });
            quizzSetUpImage.listeners['mouseenter']();
            callClickOnElement(root, 'imageRedCross');
            let popUpRedCross = retrieve(root, '[popupRedcross]');
            popUpRedCross.listeners['mouseup']();
            done();
        })
    });
})