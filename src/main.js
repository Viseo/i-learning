const Domain = require('./Domain').Domain,
    Util = require('./Util').Util,
    svggui = require('../lib/svggui').Gui,
    svgPolyfill = require('../lib/svghandlerPoly').svgPolyfill,
    guiPolyfill = require('../lib/svgguiPoly').guiPolyfill,
    FModels = require('../Models').Models,
    presenterFactory = require('../presenters/PresenterFactory').PresenterFactory;


function main(svg, runtime, dbListener, ImageRuntime,param) {
    let domain, util, gui, drawing, drawings;
    let globalVariables = { svg, runtime, dbListener, ImageRuntime };

    svgPolyfill(svg);
    gui = svggui(svg, { speed: 5, step: 100 });
    globalVariables.gui = gui;
    globalVariables.main = main;

    util = Util(globalVariables);
    guiPolyfill(svg, gui, util);
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

    presenterFactory(globalVariables);
    let models = FModels(globalVariables);
    let formations = new models.Formations();

    let redirect;
    if(param){
        redirect = param.redirect;
    }

    util.Server.checkCookie().then(data => {
        data = data && JSON.parse(data);
        if(redirect){
            password.display(param.ID);
            redirect = false;
        }
        else {
            if (data.ack === 'OK') {
                drawing.username = `${data.user.firstName} ${data.user.lastName}`;
                data.user.admin ? globalVariables.admin = true : globalVariables.admin = false;
                formations.sync().then(() => {
                    let dashboardP;
                    if(globalVariables.admin){
                        dashboardP = new globalVariables.dashboardAdminP(formations);
                    }else {
                        dashboardP = new globalVariables.dashboardCollabP(formations);
                    }
                    dashboardP.displayView();
                })
            } else {
                globalVariables.admin = false;
            }
        }
    });

    return globalVariables;
};
exports.main = main;