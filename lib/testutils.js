/**
 * Created by HDA3014 on 13/03/2016.
 */
var assert = require('assert');
var fs = require("fs");

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

function resolvedPromise(message){
    function then(callback){
        callback(message);
        return {then, catch: ()=>{}};
    }
    return {then, catch: ()=>{}};
}

function rejectedPromise(message){
    function error(callback){
        callback(message);
        return {then: ()=>{}, catch: error}
    }
    return {then: ()=>{}, catch: error}
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

exports.retrieve = retrieve;
exports.resolvedPromise = resolvedPromise;
exports.rejectedPromise = rejectedPromise;
exports.enterTextField = enterTextField;
exports.escape = escape;
