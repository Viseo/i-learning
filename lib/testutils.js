/**
 * Created by HDA3014 on 13/03/2016.
 */
var assert = require('assert');
var main = require('../src/main').main;
var promiseMock = require('promise-mock');

function retrieve(element, path) {
    let segments = path.split(".");
    for (let i = 0; i < segments.length; i++) {
        let segment = segments[i];
        if (segment.match(/^\[.+\]$/)) {
            let label = segment.slice(1, segment.length - 1);
            element = element.getElement(label);
        }
        else {
            element = element[segment];
        }
        if (!element) {
            return null;
        }
    }
    return element;
}

const enterTextField = (root, id, text) => {
    let answerLabelContent = retrieve(root, `[${id}]`);
    answerLabelContent.handler.parentObject.message(text);
    answerLabelContent.handler.parentObject.onInputFct(text);
    answerLabelContent = retrieve(root, `[${id}]`)
    assert.equal(answerLabelContent.handler.parentObject.textMessage, text);
}

function escape(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/>/g, '&gt;')
        .replace(/</g, '&lt;')
        .replace(/ /g, '&nbsp;')
        .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');
};

function given(lambda) {
    promiseMock.install();
    let resultOfInit = lambda();
    try {
        promiseMock.runAll();
    } catch (e) {
    }
    return resultOfInit;
}

function when(lambda) {
    // promiseMock.runAll();
    lambda();
    try {
        promiseMock.runAll();
    } catch (e) {
    }
    return {
        then: function (lambdaThen) {
            lambdaThen();
            promiseMock.uninstall();
        }
    };
}

function loadPage(pageName, options = {}) {
    let {mockResponses = {}, data = {}, className, beforeLoad} = options;
    let page = main(mockResponses);
    if(className) data = page.state['create' + className](data);
    if(beforeLoad) beforeLoad(page);
    page.state["loadPresenter" + pageName](data);
    return page;
}

function click(root, buttonName){
    let button = retrieve(root, "["+buttonName+"]");
    button.handler.parentManip.listeners['click']();
}
function clickElement(root, buttonName){
    let elt = retrieve(root, "[" + buttonName + "]");
    assert(elt);
    elt.listeners['click']();
}
function clickPos(root, nameClickElement) {
    let clickElement = retrieve(root, "[" + nameClickElement + "]"),
        glass = retrieve(root, "[glass]");
    if (clickElement.handler.parentManip) {
        glass.listeners["click"]({
            pageX: clickElement.handler.parentManip.x,
            pageY: clickElement.handler.parentManip.y,
            preventDefault: () => {
            }
        });
    } else {
        glass.listeners["click"]({
            pageX: clickElement.parent.handler.parentManip.x,
            pageY: clickElement.parent.handler.parentManip.y,
            preventDefault: () => {
            }
        });
    }
}
function enter(contentArea, label) {
    contentArea.valueText = label;
    contentArea.listeners["input"]();
    contentArea.valueText = label;
    contentArea.listeners["blur"]();
}
function enterValue(root, nameEnterElement, value) {
    var myElement = retrieve(root, "[" + nameEnterElement + "]");
    enter(myElement, value);
    myElement.handler.onInputListeners[0](value);
};
function inputValue(root, inputElement, value) {
    var myElement = retrieve(root, "[" + inputElement + "]");
    myElement.handler.parentObject.onInputFct(value);
};

function assertMessage(root, fieldName, message) {
    let field = retrieve(root, "[" + fieldName + "]");
    assert(field);
    assert.equal(field.handler.messageText, message);
}

function assertMissing(root, fieldName) {
    let field = retrieve(root, "[" + fieldName + "]");
    assert(!field);
}

function assertPresent(root, fieldName){
    let field = retrieve(root, "[" + fieldName + "]");
    assert(field);
}

function mouseEnter(root, elementName) {
    let element = retrieve(root, "[" + elementName + "]");
    element.handler.parentManip.listeners['mouseenter']();
}

function mouseLeave(root, elementName) {
    let element = retrieve(root, "[" + elementName + "]");
    element.handler.parentManip.listeners['mouseleave']();
}

function mouseDown(root, elementName, event) {
    let element = retrieve(root, "[" + elementName + "]"),
        eventDefault = {pageX: element.handler.parentManip.x,pageY: element.handler.parentManip.y,
            preventDefault: () => {}};
    if (event) {
        eventDefault = event;
    }
    element.handler.parentManip.listeners['mousedown'](eventDefault);
}

function mouseDownOnGlassElement(root, elementName) {
    let element = retrieve(root, "[" + elementName + "]"),
        glass = retrieve(root, "[drawingsGlass]");
    element.posX = element.handler.parentManip.component.globalPoint(0,0).x;
    element.posY = element.handler.parentManip.component.globalPoint(0,0).y;
    glass.listeners['mousedown']({
        pageX: element.posX, pageY: element.posY, preventDefault: () => {
        }
    });
}

function mouseUp(root, elementName, event) {
    let element = retrieve(root, "[" + elementName + "]"),
        eventDefault = {pageX: element.handler.parentManip.x,pageY: element.handler.parentManip.y,
            preventDefault: () => {}};
    if (event) {
        eventDefault = event;
    }
    element.handler.parentManip.listeners['mouseup'](eventDefault);
}

function mouseUpOnGlassElement(root, elementName) {
    let element = retrieve(root, "[" + elementName + "]"),
        glass = retrieve(root, "[drawingsGlass]");
    element.posX = element.handler.parentManip.component.globalPoint(0,0).x;
    element.posY = element.handler.parentManip.component.globalPoint(0,0).y;
    glass.listeners['mouseup']({
        pageX: element.posX, pageY: element.posY, preventDefault: () => {
        }
    });
}

function mouseMove(root, elementName, event) {
    let element = retrieve(root, "[" + elementName + "]"),
        eventDefault = {pageX: element.handler.parentManip.x,pageY: element.handler.parentManip.y,
            preventDefault: () => {}};
    if (event) {
        eventDefault = event;
    }
    element.handler.parentManip.listeners['mousemove'](eventDefault);
}

function mouseMoveOnGlassElement(root, elementName) {
    let element = retrieve(root, "[" + elementName + "]"),
        glass = retrieve(root, "[drawingsGlass]");
    element.posX = element.handler.parentManip.component.globalPoint(0,0).x;
    element.posY = element.handler.parentManip.component.globalPoint(0,0).y;
    glass.listeners['mousemove']({
        pageX: element.posX, pageY: element.posY, preventDefault: () => {
        }
    });
}

function onChangeElement(root, elementName) {
    let element = retrieve(root, "[" + elementName + "]");
    if (elementName === 'fileExplorer') {
        element.files = [{type: 'video/mp4'}];
    }
    assert(element);
    element.listeners['change']();
}

function checkBorderColor(root, elementName, color) {
    let element = retrieve(root, "[" + elementName + "]");
    assert(element.fill, 'rgb('+color[0]+','+color[1]+','+color[2]+')');
}

function getQuizz(root, quizzId) {
    let element = retrieve(root, "[" + quizzId + "]");
    return element;
}

function getElement(root, elementName) {
    let element = retrieve(root, "[" + elementName + "]");
    return element;
}

exports.assertMessage = assertMessage;
exports.assertMissing = assertMissing;
exports.assertPresent = assertPresent;
exports.click = click;
exports.clickElement = clickElement;
exports.clickPos = clickPos;
exports.checkBorderColor = checkBorderColor;
exports.enterTextField = enterTextField;
exports.enterValue = enterValue;
exports.escape = escape;
exports.getQuizz = getQuizz;
exports.getElement = getElement;
exports.given = given;
exports.inputValue = inputValue;
exports.loadPage = loadPage;
exports.mouseDown = mouseDown;
exports.mouseDownOnGlassElement = mouseDownOnGlassElement;
exports.mouseEnter = mouseEnter;
exports.mouseLeave = mouseLeave;
exports.mouseMove = mouseMove;
exports.mouseMoveOnGlassElement = mouseMoveOnGlassElement;
exports.mouseUp = mouseUp;
exports.mouseUpOnGlassElement = mouseUpOnGlassElement;
exports.onChangeElement = onChangeElement;
exports.when = when;
exports.retrieve = retrieve;