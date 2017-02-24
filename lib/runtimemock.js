/**
 * Created by HDA3014 on 03/03/2016.
 */
exports.mockRuntime = function() {
    let idGenerator = 0;
    let timeoutId = 0;
    let timeouts = [];
    let time = 0;
    let anchors = {};
    let randoms = [];
    let bboxes = [];
    let screenWidth=1500, screenHeight=1000;
    let responses = [];

    function remove(array, val) {
        var i = array.indexOf(val);
        i > -1 && array.splice(i, 1);
        return i > -1;
    }

    class Element {

        constructor(tag, id) {
            this.id = id;
            this.tag = tag;
            this.children = [];
            this.listeners = {};
            this.isElement = true;
        }

        getElement(id) {
            if (this.id === id) {
                return this;
            }
            else {
                for (var child of this.children) {
                    var result = child.getElement(id);
                    if (result) {
                        return result;
                    }
                }
                return null;
            }
        }

        event(eventName, event) {
            if (this.listeners[eventName]) {
                this.listeners[eventName](event);
            }
            else {
                this.parent && this.parent.event(eventName, event);
            }
        }

        toString() {
            return JSON.stringify(this, function(key, value) {
                return key==="parent" || key==="handler" || key==="children" ? undefined : value;});
        }
    }

    return {
        listeners: {},
        createDOM(tag, handler) {
            let elem = new Element(tag, idGenerator++);
            elem.handler = handler;
            if (tag === 'textarea') {
                elem.enter = text=> {
                    elem.value = text;
                    elem.listeners && elem.listeners.input && elem.listeners.input({});
                };

                elem.getBoundingClientRect = ()=> {
                    return {left: elem.x, top: elem.y, width: elem.width, height: elem.height};
                }
            }
            return elem;
        },
        create(tag, handler) {
            var elem = new Element(tag, idGenerator++);
            elem.handler = handler;
            elem.setBoundingClientRect = (width, height)=> {
                elem.bbWidth = width;
                elem.bbHeight = height;
            };
            elem.getBoundingClientRect = ()=> {
                for (let i = 0; i<bboxes.length; i++){
                    let bbox = bboxes[i];
                    if(bbox.id===elem.id){
                        bboxes.splice(i,1);
                        return {left:bbox.x, top:bbox.y, width:bbox.width, height:bbox.height};
                    }
                }
                if (tag === 'rect') {
                    return {left: elem.x, top: elem.y, width: elem.width, height: elem.height};
                }
                else if (tag === 'svg') {
                    return {left: 0, top: 0, width: elem.width, height: elem.height};
                }
                else if (tag === 'circle') {
                    return {left: -elem.r, top: -elem.r, width: elem.r * 2, height: elem.r * 2};
                }
                else if (tag === 'ellipse') {
                    return {left: -elem.rx, top: -elem.ry, width: elem.rx * 2, height: elem.ry * 2};
                }
                else if (tag === 'text' || tag === 'tspan') {
                    let fontSize = elem.fontSize?elem.fontSize:12;
                    return {
                        left: elem.x, top: elem.y,
                        height: fontSize*2,
                        width: elem.text.length*fontSize/2 // marche ?
                    };
                }
                else if (tag === 'path') {
                    let maxx = null;
                    let maxy = null;
                    let minx = null;
                    let miny = null;
                    let points = elem.d.split(" ");
                    for (let p of points) {
                        if (p.match(/[0-9]+[\.[0-9]+],[0-9]+[\.[0-9]+]/)) {
                            let vals = p.split(",");
                            let x = Number(vals[0]);
                            let y = Number(vals[1]);
                            if (maxx === null || maxx < x) maxx = x;
                            if (minx === null || minx > x) minx = x;
                            if (maxy === null || maxy < y) maxy = y;
                            if (miny === null || miny > y) miny = y;
                        }
                    }
                    return {left: minx, top: miny, width: maxx, height: maxy};
                }
            };
            return elem;
        },
        mark(component, label) {
            component.id = label;
        },
        attrNS(component, name, value) {
            if (value!==undefined) {
                component[name] = value;
            }
            else {
                return component[name];
            }
        },
        attr(component, name, value) {
            if (value!==undefined) {
                component[name] = value;
                if (name==="value") {
                    component.valueText = value;
                }
            }
            else {
                return component[name];
            }
        },
        attrXlink(component, name, value) {
            component[name] = value;
        },
        value(component, value) {
            if (value!== undefined) {
                component.valueText = value;
            } else {
                return component.valueText;
            }
        },
        declareAnchor(key) {
            if (!anchors[key]){
                anchors[key] = new Element('anchor', key);
            }
        },
        anchor(key) {
            return anchors[key];
        },
        add(parent, child) {
            parent.children.push(child);
            child.parent = parent;
        },
        text(component, message) {
            component.text = message;
        },
        remove(parent, child) {
            parent.children.splice(parent.children.indexOf(child), 1);
            child.parent = null;
        },
        focus(component) {
            target.focus(component);
            mock.focus(component);
        },
        select(component) {
            target.select(component);
            mock.select(component);
        },
        first(component) {
            return component.children.length===0 ? null : component.children[0];
        },
        replace(parent, who, byWhom) {
            parent.children[parent.children.indexOf(who)] = byWhom;
            who.parent = null;
            byWhom.parent = parent;
        },
        boundingRect(component) {
            return component.getBoundingClientRect();
        },
        addEvent(component, eventName, handler) {
            component.listeners[eventName]=handler;
        },
        addGlobalEvent: function(eventName, handler) {
            this.listeners[eventName]=handler;
        },
        removeEvent(component, eventName) {
            delete component.listeners[eventName];
        },
        removeGlobalEvent(eventName, handler) {
            delete this.listeners[eventName];
        },
        event(component, eventName, event) {
            component.event(eventName,event);
        },
        globalEvent(eventName, event) {
            if (this.listeners && this.listeners[eventName]) {
                this.listeners[eventName](event);
            }
        },
        getEventHandler(component, eventName) {
            return component.listeners ? component.listeners[eventName] : null;
        },
        getGlobalEventHandler(eventName) {
            return this.listeners ? this.listeners[eventName] : null;
        },
        screenSize(sWidth, sHeight){
            screenWidth = sWidth || screenWidth;
            screenHeight = sHeight || screenHeight;
            return {
                width: screenWidth,
                height: screenHeight
            }
        },
        now() {
            return time;
        },
        timeout(handler, delay) {
            var i=0;
            while (i<timeouts.length && time+delay>=timeouts[i].time) {
                i++;
            }
            var record = {id:timeoutId++, handler:handler, time:time+delay};
            timeouts.splice(i,0,record);
            return record.id;
        },
        clearTimeout(token) {
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
        clearInterval(token) {
            var nextTimeouts = [];
            for (var i=0; i<timeouts; i++) {
                var record = timeouts[i];
                if (record.id!==token) {
                    nextTimeouts.push(record);
                }
            }
            timeouts = nextTimeouts;
        },
        advance() {
            var timeout = timeouts.shift();
            if (timeout) {
                time = timeout.time;
                timeout.handler();
            }
            return this;
        },
        advanceAll() {
            let all = [...timeouts];
            while (all.length>0) {
                var timeout = timeouts.shift();
                remove(all, timeout);
                time = timeout.time;
                timeout.handler();
            }
            return this;
        },
        advanceTo(timeoutId) {
            for (var i=0; i<timeouts.length && timeouts[i].id!==timeoutId; i++);
            if (i<timeouts.length) {
                var timeout = timeouts[i];
                timeouts.splice(i, 1);
            }
            time = timeout.time;
            timeout.handler();
            return this;
        },
        finished() {
            return timeouts.length===0;
        },
        json(component) {
            return JSON.stringify(component, function(key, value) {
                return key==="parent" || key==="handler" ? undefined : value;
            });
        },
        random() {
            let value = randoms.shift();
            return value || Math.random();
        },
        setRandom(value) {
            randoms.push(value);
        },
        setBoundingBox(value){
            bboxes.push(value);
        },
        fireEvent(anchorKey, id, eventName, event) {
            let result = id==="global" ? this : this.anchor(anchorKey).getElement(id);
            result && this.event(result, eventName, event);
        },
        preventDefault(event) {
            event.prevented = true;
        },
        request(url, data) {
            var result = {
                onSuccess(successFunction) {
                    result.success = successFunction;
                    return result;
                },
                onFailure(failureFunction) {
                    result.failure = failureFunction;
                    return result;
                }
            };
            this.timeout(()=>{
                let response = responses.pop();
                if (response !==undefined) {
                    if (typeof(response)==="Number") {
                        result.failure && result.failure(response);
                    }
                    else {
                        result.success && result.success(response);
                    }
                }
                else {
                    result.failure && result.failure(503);
                }
            }, 0);
            return result;
        },
        respond(response) {
            responses.push(response);
        }

    };
};

exports.registerRuntime =  function(targetRuntime, register) {

    let timeoutId = 0;
    let target = targetRuntime;
    let mock =  exports.mockRuntime();
    let anchors = {};
    let history = [];
    let lastFact;
    addHistory({type:'init'});

    class Wrapper {
        constructor() {
            this.children = [];
        }
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
        fact.screenSize = target.screenSize();
        fact.randoms = [];
        fact.anchors = {};
        fact.bboxes = [];
        for (var key in anchors) {
            fact.anchors[key] = mock.json(anchors[key].mock);
        }
    }

    function addBoundingBox(id, x, y, width, height){
        lastFact.bboxes.push({id:id, x:x, y:y, width:width, height:height});
    }

    function addRandom(rand) {
        lastFact.randoms.push(rand);
    }

    return {
        ignoredEvents : {},
        createDOM(tag) {
            let elem  = new Wrapper();
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
        create(tag) {
            let elem  = new Wrapper();
            elem.target = target.create(tag);
            elem.mock = mock.create(tag);
            elem.target._getBoundingClientRect = elem.target.getBoundingClientRect;
            elem.target.getBoundingClientRect = function(){
                let bbox = elem.target._getBoundingClientRect();
                addBoundingBox(elem.mock.id, bbox.x, bbox.y, bbox.width, bbox.height);
                return bbox;
            };
            return elem;
        },
        mark(component, label) {
            target.mark(component.target, label);
            mock.mark(component.mock, label);
        },
        attrNS(component, name, value) {
            mock.attrNS(component.mock, name, value);
            return target.attrNS(component.target, name, value);
        },
        attr(component, name, value) {
            mock.attr(component.mock, name, value);
            return target.attr(component.target, name, value);
        },
        attrXlink(component, name, value) {
            target.attrXlink(component.target, name, value);
            mock.attrXlink(component.mock, name, value);
        },
        value(component) {
            mock.value(component.mock);
            return target.attr(component.target);
        },
        text(component, message) {
            target.text(component.target, message);
            mock.text(component.mock, message);
        },
        anchor(key) {
            var elem = anchors[key];
            if (!elem) {
                mock.declareAnchor(key);
                var elem = new Wrapper('anchor:' + key);
                anchors[key] = elem;
                elem.target = target.anchor(key);
                elem.mock = mock.anchor(key);
            }
            return elem;
        },
        add(parent, child) {
            target.add(parent.target, child.target);
            mock.add(parent.mock, child.mock);
            parent.children.push(child);
            child.parent = parent;
        },
        remove(parent, child) {
            target.remove(parent.target, child.target);
            mock.remove(parent.mock, child.mock);
            parent.children.splice(parent.children.indexOf(child), 1);
            child.parent = null;
        },
        focus(component) {
        },
        select(component) {
        },
        first(component) {
            return component.children.length===0 ? null : component.children[0];
        },
        replace(parent, who, byWhom) {
            target.replace(parent.target, who.target, byWhom.target);
            mock.replace(parent.mock, who.mock, byWhom.mock);
            parent.children[parent.children.indexOf(who)] = byWhom;
            who.parent = null;
            byWhom.parent = parent;
        },
        boundingRect(component) {
            return target.boundingRect(component.target);
        },
        addEvent(component, eventName, handler) {
            if (!this.ignoredEvents[eventName]) {
                handler.wrapper = (event)=> {
                    let hEvent = {};
                    if (event instanceof MouseEvent) {
                        hEvent.pageX = event.pageX;
                        hEvent.pageY = event.pageY;
                    }
                    if (!event.proc) {
                        addHistory({type: 'event', name: eventName, event: hEvent, component: component.mock.id});
                        event.proc = true;
                    }
                    handler(event);
                };
                mock.addEvent(component.mock, eventName, handler);
                target.addEvent(component.target, eventName, handler.wrapper); // :-(, un handler doit être à usage unique
            }
        },
        addGlobalEvent(eventName, handler) {
            if (!this.ignoredEvents[eventName]) {
                handler.wrapper = function (event) {
                    var hEvent = {};
                    if (event instanceof KeyboardEvent) {
                        hEvent.keyCode = event.keyCode;
                    }
                    if (!event.proc) {
                        addHistory({type: 'event', name: eventName, event: hEvent, component: "global"});
                        event.proc = true;
                    }
                    handler(event);
                };
                mock.addGlobalEvent(eventName, handler);
                target.addGlobalEvent(eventName, handler.wrapper); // :-(, un handler doit être à usage unique
            }
        },
        removeEvent(component, eventName, handler) {
            mock.removeEvent(component.mock, eventName, handler);
            target.removeEvent(component.target, eventName);
        },
        removeGlobalEvent(eventName, handler) {
            mock.removeGlobalEvent(eventName, handler);
            target.removeGlobalEvent(eventName);
        },
        event(component, eventName, event) {
            target.event(component.target, eventName, event);
        },
        globalEvent(eventName, event) {
            target.globalEvent(eventName, event);
        },
        getEventHandler(component, eventName) {
            return target.getEventHandler(component.target, eventName, event);
        },
        getGlobalEventHandler(eventName) {
            return target.getGlobalEventHandler(eventName, event);
        },
        screenSize: function(){
            return target.screenSize();
        },
        now() {
            return target.now();
        },
        timeout(handler, delay) {
            let id = timeoutId++;
            return target.timeout(function() {
                addHistory({type:'timeout', id:id, delay:delay});
                handler();
            }, delay);
        },
        interval(handler, delay) {
            let id = timeoutId++;
            return target.interval(function() {
                addHistory({type:'timeout', id:id, delay:delay});
                id = timeoutId++;
                handler();
            }, delay);
        },
        clearTimeout(token) {
            target.clearTimeout(token);
        },
        clearInterval(token) {
            target.clearInterval(token);
        },
        random() {
            var rand = Math.random();
            addRandom(rand);
            return rand;
        },
        preventDefault(event) {
            target.preventDefault(event);
        },
        request(url, data) {
            let result = target.request(url, data);
            result.onSuccess = (successFunction)=> {
                    result.success = (response)=>{
                        if (url!=='/log') {
                            addHistory({type: 'request', code: 200, data: response});
                        }
                        successFunction(response);
                    };
                    return result;
                };
            result.onFailure = (failureFunction)=> {
                    result.failure = (httpCode)=>{
                        if (url!=='/log') {
                            addHistory({type: 'request', code: httpCode, data: {}});
                        }
                        failureFunction(httpCode);
                    };
                    return result;
                };
            return result;
        },
        ignoreEvent(eventName) {
            this.ignoredEvents[eventName] = true;
            return this;
        }
    };
};