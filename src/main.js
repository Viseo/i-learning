const Domain = require('./Domain').Domain,
    Util = require('./Util').Util,
    svggui = require('../lib/svggui').Gui,
    svgPolyfill = require('../lib/svghandlerPoly').svgPolyfill,
    guiPolyfill = require('../lib/svgguiPoly').guiPolyfill,
    FModels = require('./Models').Models,
    presenterFactory = require('./presenters/PresenterFactory').PresenterFactory;


function main(svg, runtime, ImageRuntime, param) {
    let domain, util, gui, drawing, drawings;
    let globalVariables = {svg, runtime, ImageRuntime};

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

    let redirect;
    if (param) {
        redirect = param.redirect;
    }

    //todo
    let state = new models.State();
    state.tryLoadCookieForPresenter(redirect);

    return globalVariables;
};
exports.main = main;