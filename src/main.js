const
    Enhance = require('../lib/enhancer').Enhance,
    targetRuntime = require('../lib/targetruntime').targetRuntime,
    mockRuntime = require('../lib/runtimemock').mockRuntime,
    SVG = require('../lib/svghandler').SVG,
    svggui = require('../lib/svggui').Gui,
    svgPolyfill = require('../lib/svghandlerPoly').svgPolyfill,
    guiPolyfill = require('../lib/svgguiPoly').guiPolyfill,
    FHeaderV = require('./views/HeaderV').HeaderV,
    Util = require('./Util').Util,
    FModels = require('./Models').Models,
    FTool = require('./Tool').Tool,
    presenterFactory = require('./presenters/PresenterFactory').PresenterFactory;

MARGIN = 10;
HEADER_SIZE = 0.07;
STAR_SPACE = 4;
myColors = {
    ultraLightGrey: [184, 187, 196],
    customBlue: [43, 120, 228],
    darkBlue: [25, 25, 112],
    blue: [25, 122, 230],
    primaryBlue: [0, 0, 255],
    grey: [125, 122, 117],
    lightyellow: [239, 239, 78],
    lighteryellow: [239, 239, 0],
    halfGrey: [150, 150, 150],
    lightgrey: [232, 232, 238],
    lightwhite: [250, 250, 250],
    orange: [230, 122, 25],
    purple: [170, 100, 170],
    green: [155, 222, 17],
    raspberry: [194, 46, 83],
    black: [0, 0, 0],
    white: [255, 255, 255],
    red: [255, 0, 0],
    yellow: [240, 212, 25],
    pink: [255, 20, 147],
    brown: [128, 0, 0],
    primaryGreen: [0, 255, 0],
    darkerGreen: [34, 179, 78],
    greyerBlue: [74, 113, 151],
    none: []
};
autoAdjustText = function (content, wi, h, fontSize = 20, font = 'Arial', manipulator, layer = 1) {
    let words = content.split(' '),
        text = '',
        w = wi,
        t = new svg.Text('text');
    manipulator.set(layer, t);
    t.font(font, fontSize);

    while (words.length > 0) {
        const word = words.shift();
        t.message(text + ' ' + word);
        if (t.boundingRect().width <= w) {
            text += ' ' + word;
        } else {
            let tmpStr = text + '\n' + word;
            t.message(tmpStr);
            if (t.boundingRect().height <= (h - MARGIN)) {
                if (t.boundingRect().width <= w) {
                    text = tmpStr;
                } else {
                    let letters = (' ' + word).split('');
                    while (letters.length > 0) {
                        const letter = letters.shift();
                        t.message(text + letter);
                        if (t.boundingRect().width <= w) {
                            text += letter;
                        } else {
                            text = text.slice(0, -2) + '…';
                            break;
                        }
                    }
                }
            } else {
                let letters = (' ' + word).split('');
                while (letters.length > 0) {
                    const letter = letters.shift();
                    t.message(text + letter);
                    if (t.boundingRect().width <= w) {
                        text += letter;
                    } else {
                        text = text.slice(0, -2) + '…';
                        break;
                    }
                }
            }
        }
    }
    t.message(text.substring(1));
    t.originalText = content;

    let finalHeight = t.boundingRect().height;
    (typeof finalHeight === 'undefined' && t.messageText === '') && (finalHeight = 0);
    let finalWidth = t.boundingRect().width;
    (typeof finalWidth === 'undefined' && t.messageText === '') && (finalWidth = 0);
    return {finalHeight, finalWidth, text: t};
};

function main(mockResponses) {
    let util, gui, drawings, root;
    let runtime = mockResponses ? mockRuntime() : targetRuntime();
    let svg = SVG(runtime);
    let globalVariables = {svg, runtime};

    Enhance();
    svgPolyfill(svg);
    gui = svggui(svg, {speed: 5, step: 100});
    globalVariables.gui = gui;

    if (mockResponses) {
        runtime.declareAnchor('content');
        svg.screenSize(1920, 947);
        root = runtime.anchor("content");
    }

    util = Util(globalVariables);
    globalVariables.clipPath = guiPolyfill(svg, gui, util, runtime);
    globalVariables.util = util;

    drawings = new util.Drawings(svg.screenSize().width, svg.screenSize().height);
    globalVariables.drawings = drawings;
    globalVariables.drawing = drawings.drawing;

    globalVariables.HeaderVue = FHeaderV(globalVariables);
    globalVariables.Tool = FTool(globalVariables);

    //util.setGlobalVariables();

    presenterFactory(globalVariables);
    let models = FModels(globalVariables, mockResponses);
    let state = new models.State();

    if (!mockResponses) {
        let params = (new URL(document.location)).searchParams;
        let ID = params.get("ID");

        state.tryLoadCookieForPresenter(ID);
    }

    return {state, root, runtime};
};
exports.main = main;