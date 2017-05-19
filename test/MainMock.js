/**
 * Created by TBE3610 on 19/05/2017.
 */
const
    Enhance = require('../lib/enhancer').Enhance,
    mockRuntime = require('../lib/runtimemock').mockRuntime,
    SVG = require('../lib/svghandler').SVG,
    svggui = require('../lib/svggui').Gui,
    svgPolyfill = require('../lib/svghandlerPoly').svgPolyfill,
    guiPolyfill = require('../lib/svgguiPoly').guiPolyfill,
    Domain = require('../src/Domain').Domain,
    Util = require('../src/Util').Util,
    presenterFactory = require('../src/presenters/PresenterFactory').PresenterFactory;

function mainMock(FModels) {
    let domain, util, gui, drawing, drawings;
    let runtime = mockRuntime();
    let svg = SVG(runtime);
    let globalVariables = {svg, runtime};

    Enhance();
    runtime.declareAnchor('content');
    svg.screenSize(1920, 947);
    svgPolyfill(svg);
    gui = svggui(svg, {speed: 5, step: 100});
    globalVariables.gui = gui;

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
    let root = runtime.anchor("content");

    return {state, root};
};
exports.mainMock = mainMock;