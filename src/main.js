const
    targetRuntime = require().targetRuntime,
    SVG = require().SVG,
    svggui = require('../lib/svggui').Gui,
    svgPolyfill = require('../lib/svghandlerPoly').svgPolyfill,
    guiPolyfill = require('../lib/svgguiPoly').guiPolyfill,
    Domain = require('./Domain').Domain,
    Util = require('./Util').Util,
    FModels = require('./Models').Models,
    presenterFactory = require('./presenters/PresenterFactory').PresenterFactory;

function main() {
    let domain, util, gui, drawing, drawings;
    let runtime = targetRuntime();
    let svg = SVG(runtime);
    let globalVariables = {svg, runtime};

    exports.Enhance();
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

    let params = (new URL(document.location)).searchParams;
    let ID = params.get("ID");

    //todo
    let state = new models.State();
    state.tryLoadCookieForPresenter(ID);

    return globalVariables;
};
exports.main = main;