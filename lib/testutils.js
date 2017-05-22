/**
 * Created by HDA3014 on 13/03/2016.
 */
var assert = require('assert');
var main = require('../src/main').main;
var promiseMock = require('promise-mock');

function retrieve(element, path) {
    let segments = path.split(".");
    for (let i=0; i<segments.length; i++) {
        let segment = segments[i];
        if (segment.match(/^\[.+\]$/)) {
            let label = segment.slice(1, segment.length-1);
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
    assert.equal(answerLabelContent.handler.parentObject.textMessage, escape(text));
}

function escape(text){
    return text
        .replace(/&/g, '&amp;')
        .replace(/>/g, '&gt;')
        .replace(/</g, '&lt;')
        .replace(/ /g, '&nbsp;')
        .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');
};

function given(lambda){
    promiseMock.install();
    let resultOfInit = lambda();
    try{
        promiseMock.runAll();
    }catch (e) {}
    return resultOfInit;
}

function when(lambda){
    lambda();
    try{
        promiseMock.runAll();
    }catch (e) {}
    return {then: function(lambdaThen){
        lambdaThen();
        promiseMock.uninstall();
    }};
}

function loadPage(pageName, mockResponses = {}, ...presenterArgs){
    let page = main(mockResponses);
    page.state["loadPresenter" + pageName](...presenterArgs);
    return page;
}

function click(root, buttonName){
    let button = retrieve(root, "["+buttonName+"]");
    button.handler.parentManip.listeners['click']();
}

function assertMessage(root, fieldName, message){
    let field = retrieve(root, "["+fieldName+"]");
    assert(field);
    assert.equal(field.text, escape(message));
}

function assertMissing(root, fieldName){
    let field = retrieve(root, "["+fieldName+"]");
    assert(!field);
}

exports.retrieve = retrieve;
exports.enterTextField = enterTextField;
exports.escape = escape;
exports.given = given;
exports.when = when;
exports.loadPage = loadPage;
exports.click = click;
exports.assertMessage = assertMessage;
exports.assertMissing = assertMissing;
