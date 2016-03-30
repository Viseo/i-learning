/**
 * Created by HDA3014 on 03/03/2016.
 */
var targetRuntime;
function  setTarget(targetRtm) {
    targetRuntime = targetRtm;
}
if (typeof exports != 'undefined') {
    exports.setTarget = setTarget;
}

function Element(tag, id) {
    this.id = id;
    this.tag = tag;
    this.children = [];
    this.listeners = {};
    this.getElement = function(id) {
        if (this.id===id) {
            return this;
        }
        else {
            for (var child in this.children) {
                var result = this.children[child].getElement(id);
                if (result) {
                    return result;
                }
            }
            return null;
        }
    };
    this.event = function(eventName, event) {
        for (var listener in this.listeners[eventName]) {
            this.listeners[eventName][listener](event);
        }
    }
}

var runtimeMock =  (function() {
    var idGenerator=0;
    var timeoutId=0;
    var timeouts = [];
    var time=0;
    var anchors = {};
    var randoms = [];

    return {
        create: function(tag) {
            var elem = new Element(tag, idGenerator++);
            if (tag==='rect') {
                elem.getBoundingClientRect = function() {
                    return {left:elem.x, top:elem.y, width:elem.width, height: elem.height};
                }
            }
            else if (tag==='svg') {
                elem.getBoundingClientRect = function() {
                    return {left:0, top:0, width:elem.width, height: elem.height};
                }
            }
            else if (tag==='circle') {
                elem.getBoundingClientRect = function() {
                    return {left:-elem.r, top:-elem.r, width:elem.r*2, height: elem.r*2};
                }
            }
            else if (tag==='ellipse') {
                elem.getBoundingClientRect = function() {
                    return {left:-elem.rx, top:-elem.ry, width:elem.rx*2, height: elem.ry*2};
                }
            }
            else if (tag==='path') {
                var maxx = null;
                var maxy = null;
                var minx = null;
                var miny = null;

                elem.getBoundingClientRect = function() {
                    var points = elem.points.split(" ");
                    for (var i in points) {
                        var vals = points[i].split(",");
                        var x = Number(vals[0]);
                        var y = Number(vals[1]);
                        if (maxx===null || maxx<x) maxx=x;
                        if (minx===null || minx>x) minx=x;
                        if (maxy===null || maxy<y) maxx=y;
                        if (miny===null || miny>y) minx=y;
                    }
                    return {left:minx, top:miny, width:maxx, height:maxy};
                }
            }
            return elem;
        },
        attrNS: function(component, name, value) {
            component[name] = value;
        },
        attr: function(component, name, value) {
            component[name] = value;
        },
        attrXlink: function(component, name, value) {
            component[name] = value;
        },
        declareAnchor : function(key) {
            anchors[key] = new Element('anchor', key);
        },
        anchor: function(key) {
            return anchors[key];
        },
        add: function(parent, child) {
            parent.children.push(child);
            child.parent = parent;
        },
        text: function(component, message) {
            component.text = message;
        },
        remove: function(parent, child) {
            parent.children.splice(parent.children.indexOf(child), 1);
            child.parent = null;
        },
        first: function(component) {
            return component.children.length===0 ? null : component.children[0];
        },
        replace: function(parent, who, byWhom) {
            parent.children[parent.children.indexOf(who)] = byWhom;
            who.parent = null;
            byWhom.parent = parent;
        },
        boundingRect: function(component) {
            return component.getBoundingClientRect();
        },
        addEvent: function(component, event, handler) {
            if (!component.listeners[event]) {
                component.listeners[event]=[];
            }
            component.listeners[event].push(handler);
        },
        removeEvent: function(component, event, handler) {
            if (component.listeners[event]) {
                component.listeners[event].splice(component.listeners[event].indexOf(handler), 1);
            }
        },
        event: function(component, eventName, event) {
            if (component.listeners[event]) {
                component.listeners[event](event);
            }
        },
        timeout: function(handler, delay) {
            var i=0;
            while (i<timeouts.length && time+delay>=timeouts[i].time) {
                i++;
            }
            var record = {id:timeoutId++, handler:handler, time:time+delay};
            timeouts.splice(i,0,record);
            return record.id;
        },
        clearTimeout: function(token) {
            var nextTimeouts = [];
            for (var i=0; i<timeouts; i++) {
                var record = timeouts[i];
                if (record.id!==token) {
                    nextTimeouts.push(record);
                }
            }
            timeouts = nextTimeouts;
        },
        interval: function interval(handler, delay) {
            var i=0;
            while (i<timeouts.length && time+delay>=timeouts[i].time) {
                i++;
            }
            var record = {
                id:timeoutId++,
                handler:function() {
                    interval(handler, delay);
                    handler();
                },
                time:time+delay};
            timeouts.splice(i,0,record);
            return record.id;
        },
        clearInterval: function(token) {
            var nextTimeouts = [];
            for (var i=0; i<timeouts; i++) {
                var record = timeouts[i];
                if (record.id!==token) {
                    nextTimeouts.push(record);
                }
            }
            timeouts = nextTimeouts;
        },
        advance : function() {
            var timeout = timeouts.shift();
            time = timeout.time;
            timeout.handler();
            return this;
        },
        finished: function() {
            return timeouts.length===0;
        },
        json : function(component) {
            return JSON.stringify(component, function(key, value) {return key==="parent" ? undefined : value;});
        },
        random: function() {
            var value = randoms.shift();
            return value || Math.random();
        },
        setRandom: function(value) {
            randoms.push(value);
        },
        fireEvent: function(anchorKey, id, eventName, event) {
            var result = this.anchor(anchorKey).getElement(id);
            result && result.event(eventName, event);
        },
        preventDefault: function(event) {
        }

    };
});

var runtimeRegister =  function(register) {

    var target = targetRuntime();
    var mock =  runtimeMock();
    var anchors = {};
    var history = [];
    var lastFact;
    addHistory({type:'init'});

    function Wrapper() {
        this.children = [];
    }

    function addHistory(fact) {
        if (lastFact) {
            if (register) {
                register(lastFact);
            }
            else {
                console.log(JSON.stringify(lastFact));
            }
        }
        lastFact = fact;
        fact.randoms = [];
        fact.anchors = {};
        for (var key in anchors) {
            fact.anchors[key] = mock.json(anchors[key].mock);
        }
    }

    function addRandom(rand) {
        lastFact.randoms.push(rand);
    }

    return {
        create: function(tag) {
            var elem  = new Wrapper();
            elem.target = target.create(tag);
            elem.mock = mock.create(tag);
            return elem;
        },
        attrNS: function(component, name, value) {
            target.attrNS(component.target, name, value);
            mock.attrNS(component.mock, name, value);
        },
        attr: function(component, name, value) {
            target.attr(component.target, name, value);
            mock.attr(component.mock, name, value);
        },
        attrXlink: function(component, name, value) {
            target.attrXlink(component.target, name, value);
            mock.attrXlink(component.mock, name, value);
        },
        text: function(component, message) {
            target.text(component.target, message);
            mock.text(component.mock, message);
        },
        anchor: function(key) {
            mock.declareAnchor(key);
            var elem = new Wrapper('anchor:'+key);
            anchors[key] = elem;
            elem.target = target.anchor(key);
            elem.mock = mock.anchor(key);
            return elem;
        },
        add: function(parent, child) {
            target.add(parent.target, child.target);
            mock.add(parent.mock, child.mock);
            parent.children.push(child);
            child.parent = parent;
        },
        remove: function(parent, child) {
            target.remove(parent.target, child.target);
            mock.remove(parent.mock, child.mock);
            parent.children.splice(parent.children.indexOf(child), 1);
            child.parent = null;
        },
        first: function(component) {
            return component.children.length===0 ? null : component.children[0];
        },
        replace: function(parent, who, byWhom) {
            target.replace(parent.target, who.target, byWhom.target);
            mock.replace(parent.mock, who.mock, byWhom.mock);
            parent.children[parent.children.indexOf(who)] = byWhom;
            who.parent = null;
            byWhom.parent = parent;
        },
        boundingRect: function(component) {
            return target.boundingRect(component.target);
        },
        addEvent: function(component, eventName, handler) {
            handler.wrapper = function(event) {
                var hEvent = {};
                if (event instanceof MouseEvent) {
                    hEvent.clientX = event.clientX;
                    hEvent.clientY = event.clientY;
                }
                addHistory({type:'event', name:eventName, event:hEvent, component:component.mock.id});
                handler(event);
            };
            mock.addEvent(component.mock, eventName, handler);
            target.addEvent(component.target, eventName, handler.wrapper); // :-(, un handler doit être à usage unique
        },
        removeEvent: function(component, eventName, handler) {
            mock.removeEvent(component.mock, eventName, handler);
            target.removeEvent(component.target, eventName, handler.wrapper);
        },
        event: function(component, eventName, event) {
            target.event(component.target, eventName, event);
        },
        timeout: function(handler, delay) {
            return target.timeout(function() {
                addHistory({type:'timeout', delay:delay});
                handler();
            }, delay);
        },
        interval: function(handler, delay) {
            return target.interval(function() {
                addHistory({type:'timeout', delay:delay});
                handler();
            }, delay);
        },
        clearTimeout: function(token) {
            target.clearTimeout(token);
        },
        clearInterval: function(token) {
            target.clearInterval(token);
        },
        random: function() {
            var rand = Math.random();
            addRandom(rand);
            return rand;
        },
        preventDefault: function(event) {
            target.preventDefault(event);
        }
    };
};

if (typeof exports != 'undefined') {
    exports.mockRuntime = runtimeMock;
    exports.registerRuntime = runtimeRegister;
}