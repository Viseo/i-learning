/**
 * Created by HDA3014 on 13/03/2016.
 */
function targetRuntime() {
    var svgNS = "http://www.w3.org/2000/svg";
    var xlink = "http://www.w3.org/1999/xlink";

    return {
        create: function(tag) {
            return document.createElementNS(svgNS, tag);
        },
        attrNS: function(component, name, value) {
            component.setAttributeNS(svgNS, name, value);
        },
        attr: function(component, name, value) {
            component.setAttribute(name, value);
        },
        attrXlink: function(component, name, value) {
            component.setAttributeNS(xlink, name, value);
        },
        text: function(component, message) {
            component.innerHTML = message;
        },
        anchor: function(key) {
            return document.getElementById(key);
        },
        add: function(parent, child) {
            parent.appendChild(child);
        },
        remove: function(parent, child) {
            parent.removeChild(child);
        },
        first: function(component) {
            return component.firstChild;
        },
        replace: function(parent, who, byWhom) {
            //parent.replaceChild(who, byWhom);
            parent.replaceChild(byWhom, who);

        },
        boundingRect: function(component) {
            return component.getBoundingClientRect();
        },
        addEvent: function(component, eventName, handler) {
            if (!component.listeners) {
                component.listeners = {};
            }
            else if (component.listeners[eventName]) {
                component.removeEventListener(eventName, component.listeners[eventName]);
            }
            component.listeners[eventName] = handler;
            component.addEventListener(eventName, handler);
        },
        removeEvent: function(component, eventName, handler) {
            if (component.listeners && handler===component.listeners[eventName]) {
                delete component.listeners[eventName];
                component.removeEventListener(eventName, handler);
            }
        },
        event: function(component, eventName, event) {
            if (component.listeners && component.listeners[eventName]) {
                component.listeners[eventName](event);
            }
        },
        preventDefault: function(event) {
            event.preventDefault();
        },
        now: function() {
            return new Date().getTime();
        },
        timeout: function(handler, delay) {
            return setTimeout(handler, delay);
        },
        interval: function(handler, delay) {
            return setInterval(handler, delay);
        },
        clearTimeout: function(token) {
            return clearTimeout(token);
        },
        clearInterval: function(token) {
            return clearInterval(token);
        },
        random: function() {
            return Math.random();
        }
    };
}

if (typeof exports!='undefined') {
    exports.targetRuntime = targetRuntime;
}