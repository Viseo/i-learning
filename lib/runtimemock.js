/**
 * Created by HDA3014 on 03/03/2016.
 */
var targetRuntime, util;
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
        }
        return null;

    };
    this.event = function(eventName, event) {
        this.listeners[eventName](event);
    }
}

var runtimeMock =  (function() {
    var idGenerator=0;
    var timeoutId=0;
    var timeouts = [];
    var time=0;
    var anchors = {};
    var randoms = [];
    var bboxes = [];

    return {
        createDOM: function(tag) {
            var elem = new Element(tag, idGenerator++);
            if (tag==='textarea') {
                elem.enter = function(text){
                    elem.value = text;
                    elem.listeners && elem.listeners.input && elem.listeners.input({});
                };

                elem.getBoundingClientRect = function() {
                    return {left:elem.x, top:elem.y, width:elem.width, height: elem.height};
                }
            }
            return elem;
        },
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
            else if (tag==='text') {
                elem.setBoundingClientRect = function(width, height){
                    elem.bbWidth = width;
                    elem.bbHeight = height;
                };
                //elem.bbWidth = 200;
                //elem.bbHeight = 50;
                elem.sizes = [];
                elem.getBoundingClientRect = function() {
                    for (var i = 0; i<bboxes.length; i++){
                        var bbox = bboxes[i];
                        if(bbox.id===elem.id){
                            bboxes.splice(i,1);
                            return {left:elem.x, top:elem.y, width:bbox.width, height:bbox.height};
                        }
                    }
                    var size = {};
                    size.width = 78.921875;
                    size.height = 22;
                    return {left:elem.x, top:elem.y, width:size.width, height:size.height};
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
            if (!anchors[key]){
                anchors[key] = new Element('anchor', key);
            }
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
        addEvent: function(component, eventName, handler) {
            if (!component.listeners){
                component.listeners={};
            }
            component.listeners[eventName]=handler;
        },
        listeners: {},
        addGlobalEvent: function(eventName, handler) {
            this.listeners[eventName]=handler;
        },
        removeEvent: function(component, eventName, handler) {
            delete component.listeners[eventName];
        },
        removeGlobalEvent: function(eventName, handler) {
            delete this.listeners[eventName];
        },
        event: function(component, eventName, event) {
            if (component.listeners[eventName]) {
                component.listeners[eventName](event);
            }
        },
        screenWidth: 1500,
        screenHeight:1000,
        screenSize: function(sWidth, sHeight){
            this.screenWidth = sWidth || this.screenWidth;
            this.screenHeight = sHeight || this.screenHeight;
            return {
                width: this.screenWidth,
                height: this.screenHeight
            }
        },
        now: function() {
            return time;
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
            return JSON.stringify(component, function(key, value) {return key==="parent" || key==="sizes" ? undefined : value;});
        },
        random: function() {
            var value = randoms.shift();
            return value || Math.random();
        },
        setRandom: function(value) {
            randoms.push(value);
        },
        setBbox: function(value){
            bboxes.push(value);
        },
        fireEvent: function(anchorKey, id, eventName, event) {
            var result = this.anchor(anchorKey).getElement(id);
            result && result.event(eventName, event);
        },
        preventDefault: function(event) {
        },
        document: {
            createElement: function(type){
                var result = {};
                switch (type) {
                    case "textarea" :
                        drawing.glass.onkeydown = function(event) {
                            result.value += event.key;
                        };
                        break;
                }
                return result;
            }
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
        fact.bboxes = [];
        for (var key in anchors) {
            fact.anchors[key] = mock.json(anchors[key].mock);
        }
    }

    function addBBox(id, width, height){
        lastFact.bboxes.push({id:id, width:width, height:height});
    }

    function addRandom(rand) {
        lastFact.randoms.push(rand);
    }

    return {
        createDOM: function(tag) {
            var elem  = new Wrapper();
            elem.target = target.createDOM(tag);
            elem.mock = mock.createDOM(tag);
            if (tag==="textarea"){
                elem.target.addEventListener("input", function(event){
                    elem.mock.enter(elem.target.value);
                    addHistory({type:'event', name:"input", event:{text:elem.target.value}, component:component.mock.id});
                });
            }

            return elem;
        },
        create: function(tag) {
            var elem  = new Wrapper();
            elem.target = target.create(tag);
            elem.mock = mock.create(tag);
            if (tag === "text"){
                elem.target._getBoundingClientRect = elem.target.getBoundingClientRect;
                elem.target.getBoundingClientRect = function(){
                    var bbox = elem.target._getBoundingClientRect();
                    addBBox(elem.mock.id, bbox.width, bbox.height);
                    return bbox;
                }
            }
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
            var elem = anchors[key];
            if (!elem){
                mock.declareAnchor(key);
                var elem = new Wrapper('anchor:'+key);
                anchors[key] = elem;
                elem.target = target.anchor(key);
                elem.mock = mock.anchor(key);
            }
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
                if (!event.proc){
                    addHistory({type:'event', name:eventName, event:hEvent, component:component.mock.id});
                    event.proc = true;
                }
                handler(event);
            };
            mock.addEvent(component.mock, eventName, handler);
            target.addEvent(component.target, eventName, handler.wrapper); // :-(, un handler doit être à usage unique
        },
        addGlobalEvent: function(eventName, handler) {
            handler.wrapper = function(event) {
                var hEvent = {};
                if (!event.proc){
                    addHistory({type:'event', name:eventName, event:hEvent, component:"global"});
                    event.proc = true;
                }
                handler(event);
            };
            mock.addGlobalEvent(eventName, handler);
            target.addGlobalEvent(eventName, handler.wrapper); // :-(, un handler doit être à usage unique
        },
        removeEvent: function(component, eventName, handler) {
            mock.removeEvent(component.mock, eventName, handler);
            target.removeEvent(component.target, eventName, handler.wrapper);
        },
        removeGlobalEvent: function(eventName, handler) {
            mock.removeGlobalEvent(eventName, handler);
            target.removeGlobalEvent(eventName, handler.wrapper);
        },
        event: function(component, eventName, event) {
            target.event(component.target, eventName, event);
        },
        screenSize: function(){
            return target.screenSize();
        },
        now: function() {
            return target.now();
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