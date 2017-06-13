const
    Enhance = require('../lib/enhancer').Enhance,
    targetRuntime = require('../lib/targetruntime').targetRuntime,
    mockRuntime = require('../lib/runtimemock').mockRuntime,
    SVG = require('../lib/svghandler').SVG,
    svggui = require('../lib/svggui').Gui,
    svgPolyfill = require('../lib/svghandlerPoly').svgPolyfill,
    guiPolyfill = require('../lib/svgguiPoly').guiPolyfill,
    FHeaderV = require('./views/HeaderV').HeaderV,
    FHandlers = require('./tools/Handlers').Handlers,
    FIcons = require('./tools/Icons').Icons,
    FHelpers = require('./tools/Helpers').Helpers,
    FLists = require('./tools/Lists').Lists,
    FModels = require('./Models').Models,
    presenterFactory = require('./presenters/PresenterFactory').PresenterFactory;

function main(mockResponses) {
    let Handlers, gui, drawings, root;
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

    Handlers = FHandlers(globalVariables);
    globalVariables.Handlers = Handlers;

    globalVariables.clipPath = guiPolyfill(svg, gui, Handlers, runtime);

    drawings = new Handlers.Drawings(svg.screenSize().width, svg.screenSize().height);
    globalVariables.drawings = drawings;
    globalVariables.drawing = drawings.drawing;

    globalVariables.HeaderVue = FHeaderV(globalVariables);
    globalVariables.Icons = FIcons(globalVariables);
    globalVariables.Lists = FLists(globalVariables);
    globalVariables.Helpers = FHelpers(globalVariables);

    presenterFactory(globalVariables);
    let models = FModels(globalVariables, mockResponses);
    let state = new models.State();

    if (!mockResponses) {
        let params = (new URL(document.location)).searchParams;
        let ID = params.get("ID");

        state.tryLoadCookieForPresenter(ID);
    }

    svg.addGlobalEvent("resize", state.resize.bind(state));

    return {state, root, runtime};
};
exports.main = main;