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

function main(mockResponses) {
    let util, gui, drawing, drawings, root;
    let runtime = mockResponses ? mockRuntime() : targetRuntime();
    let svg = SVG(runtime);
    let globalVariables = {svg, runtime};

    Enhance();
    svgPolyfill(svg);
    gui = svggui(svg, {speed: 5, step: 100});
    globalVariables.gui = gui;

    if(mockResponses){
        runtime.declareAnchor('content');
        svg.screenSize(1920, 947);
        root = runtime.anchor("content");
    }

    util = Util(globalVariables);
    globalVariables.clipPath = guiPolyfill(svg, gui, util, runtime);
    globalVariables.util = util;
    util.SVGGlobalHandler();
    util.Bdd();
    util.SVGUtil();

    drawings = new util.Drawings(svg.screenSize().width, svg.screenSize().height);
    globalVariables.drawings = drawings;
    drawing = drawings.drawing;
    globalVariables.drawing = drawing;

    globalVariables.HeaderVue = FHeaderV(globalVariables);
    globalVariables.Tool = FTool(globalVariables);

    util.setGlobalVariables();

    presenterFactory(globalVariables);
    let models = FModels(globalVariables, mockResponses);
    let state = new models.State();

    if(!mockResponses){
        let params = (new URL(document.location)).searchParams;
        let ID = params.get("ID");

        state.tryLoadCookieForPresenter(ID);
    }

    return {state, root, runtime};
};
exports.main = main;