/**
 * Created by HDA3014 on 13/03/2016.
 */
console.log("Target runtime loaded...");
exports.targetRuntime = function() {
    var svgNS = "http://www.w3.org/2000/svg";
    var xlink = "http://www.w3.org/1999/xlink";
    var handlerCount = 0;

    return {
        createDOM: function(tag){
            let elem = document.createElement(tag);
            return elem;
        },
        create(tag) {
            let elem = document.createElementNS(svgNS, tag);
            return elem;
        },
        mark(component, label) {
            component.mark = label;
        },
        attrNS(component, name, value) {
            component.setAttributeNS(svgNS, name, value);
        },
        attr(component, name, value) {
            component.setAttribute(name, value);
        },
        attrXlink(component, name, value) {
            component.setAttributeNS(xlink, name, value);
        },
        text(component, message) {
            component.innerHTML = message;
        },
        anchor(key) {
            return document.getElementById(key);
        },
        add(parent, child) {
            parent.appendChild(child);
        },
        remove(parent, child) {
            parent.removeChild(child);
        },
        first(component) {
            component.firstChild;
        },
        replace(parent, who, byWhom) {
            parent.replaceChild(byWhom, who);
        },
        boundingRect(component) {
            return component.getBoundingClientRect();
        },
        addEvent(component, eventName, handler) {
            if (!component.listeners) {
                component.listeners = {};
            }
            else if (component.listeners[eventName]) {
                component.removeEventListener(eventName, component.listeners[eventName]);
            }
            component.listeners[eventName] = handler;
            component.addEventListener(eventName, handler);
        },
        addGlobalEvent(eventName, handler) {
            if (!window.listeners) {
                window.listeners = {};
            }
            else if (window.listeners[eventName]) {
                window.removeEventListener(eventName, window.listeners[eventName]);
            }
            window.listeners[eventName] = handler;
            window.addEventListener(eventName, handler);
        },
        removeEvent(component, eventName, handler) {
            if (component.listeners && handler===component.listeners[eventName]) {
                delete component.listeners[eventName];
                component.removeEventListener(eventName, handler);
            }
        },
        removeGlobalEvent(eventName, handler) {
            if (window.listeners && handler===window.listeners[eventName]) {
                delete window.listeners[eventName];
                window.removeEventListener(eventName, handler);
            }
        },
        event(component, eventName, event) {
            if (component.listeners && component.listeners[eventName]) {
                component.listeners[eventName](event);
            }
        },
        screenSize: function(){
            return {
                width: document.body.clientWidth,
                height: document.documentElement.clientHeight
            }
        },
        preventDefault(event) {
            event.preventDefault();
        },
        now() {
            return new Date().getTime();
        },
        timeout(handler, delay) {
            return setTimeout(handler, delay);
        },
        interval(handler, delay) {
            return setInterval(handler, delay);
        },
        clearTimeout(token) {
            return clearTimeout(token);
        },
        clearInterval(token) {
            return clearInterval(token);
        },
        random() {
            return Math.random();
        }
    };
};
