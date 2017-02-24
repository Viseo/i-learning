/**
 * Created by HDA3014 on 13/03/2016.
 */
var assert = require('assert');
var fs = require("fs");
var readline = require("readline");

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

function inspect(object, model, exclude={}) {
    assert.ok(!object.isElement || object!==model);
    for (let key in model) {
        if (exclude[key]===undefined) {
            if (typeof(object[key]) === "object") {
                inspect(object[key], model[key], exclude);
            }
            else {
                assert.equal(object[key], model[key], "Field : '"+key+"':"+object[key]+" = "+model[key]);
            }
        }
    }
}

function checkScenario(play, scenario, root, runtime, done) {
    var rs = fs.createReadStream(scenario);
    var rl = readline.createInterface({input: rs});
    rl.on('line', function (line) {
        var fact = JSON.parse(line);
        runtime.screenSize(fact.screenSize.width, fact.screenSize.height);
        fact.event && (fact.event.preventDefault = function(){});
        if (fact.randoms) {
            for (var i = 0; i < fact.randoms.length; i++) {
                runtime.setRandom(fact.randoms[i]);
            }
        }
        if (fact.bboxes) {
            for (i = 0; i < fact.bboxes.length; i++) {
                runtime.setBoundingBox(fact.bboxes[i]);
            }
        }
        if (fact.type === 'init') {
            play();
        }
        else {
            var registeredSnapshot = fact.anchors.content;
            var snapshot = runtime.json(runtime.anchor(root));
            try {
                assert.equal(registeredSnapshot, snapshot);
            } catch (error) {
                console.log ("Error on line : "+fact.order);
                throw error;
            }
            if (fact.type === 'event') {
                if (fact.name==="input"){
                    fact.component.enter(fact.event.text);
                }
                else {
                    runtime.fireEvent(root, fact.component, fact.name, fact.event);
                }
            }
            else if (fact.type === 'timeout') {
                runtime.advanceTo(fact.id);
            }
        }
    });
    rs.on('end', done);
}

exports.inspect = inspect;
exports.retrieve = retrieve;
exports.checkScenario = checkScenario;
