/**
 * Created by HDA3014 on 13/03/2016.
 */
var assert = require('assert');
var fs = require("fs");
var readline = require("readline");

function inspect(object, model) {
    for (key in model) {
        assert.equal(object[key], model[key]);
    }
}

function checkScenario(play, scenario, root, runtime, done) {
    var rs = fs.createReadStream(scenario);
    var rl = readline.createInterface({input: rs});
    rl.on('line', function (line) {
        var fact = JSON.parse(line);
        fact.event && (fact.event.preventDefault = function(){});
        for (var i = 0; i < fact.randoms.length; i++) {
            runtime.setRandom(fact.randoms[i]);
        }
        if (fact.type === 'init') {
            play();
        }
        else {
            var registeredSnapshot = fact.anchors.content;
            var snapshot = runtime.json(runtime.anchor(root));
            assert.equal(registeredSnapshot, snapshot);
            if (fact.type === 'event') {
                runtime.fireEvent(root, fact.component, fact.name, fact.event);
            }
            else if (fact.type === 'timeout') {
                runtime.advance();
            }
        }
    });
    rs.on('end', done);
}
if(typeof exports !== "undefined") {
    exports.inspect = inspect;
    exports.checkScenario = checkScenario;
}