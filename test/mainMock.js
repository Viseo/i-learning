/**
 * Created by TBE3610 on 19/05/2017.
 */
const
    mockRuntime = require('../lib/runtimemock').mockRuntime,
    SVG = require().SVG,
    svggui = require('../lib/svggui').Gui,
    svgPolyfill = require('../lib/svghandlerPoly').svgPolyfill,
    guiPolyfill = require('../lib/svgguiPoly').guiPolyfill,
    Domain = require('../src/Domain').Domain,
    Util = require('../src/Util').Util,
    presenterFactory = require('../src/presenters/PresenterFactory').PresenterFactory;

function mainMock(FModels, callback) {
    let domain, util, gui, drawing, drawings;
    let runtime = mockRuntime();
    let svg = SVG(runtime);
    let globalVariables = {svg, runtime};

    exports.Enhance();
    runtime.declareAnchor('content');
    svgPolyfill(svg);
    gui = svggui(svg, {speed: 5, step: 100});
    globalVariables.gui = gui;
    globalVariables.main = main;

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

    domain = Domain(globalVariables);
    globalVariables.domain = domain;
    util.setGlobalVariables();

    presenterFactory(globalVariables);
    let models = FModels(globalVariables);
    let state = new models.State();

    if(callback){
        callback(state);
    }else {
        state.tryLoadCookieForPresenter();
    }

    return globalVariables;
};
exports.mainMock = mainMock;