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
            if (value!==undefined) {
                component.setAttributeNS(svgNS, name, value);
            }
            else {
                return component.getAttributeNS(svgNS, name);
            }
        },
        attr(component, name, value) {
            try {
                //if (value && (""+value).startsWith("NaN")) {
                if (value!==value) {
                    console.log("bug");
                }
                if (value !== undefined) {
                    component.setAttribute(name, value);
                }
                else {
                    return component.getAttribute(name);
                }
            } catch (err) {
                console.log("Bug !!");
            }
        },
        attrXlink(component, name, value) {
            component.setAttributeNS(xlink, name, value);
        },
        value(component, value) {
            if (value!==undefined) {
                component.value = value;
                return this;
            }
            else {
                return component.value;
            }
        },
        text(component, message) {
            component.innerHTML = message;
        },
        anchor(key) {
            return document.getElementById(key);
        },
        add(parent, child) {
            try {
                parent.appendChild(child);
            } catch (err) {
                console.log("bug !!");
            }
        },
        remove(parent, child) {
            try {
                parent.removeChild(child);
            }
            catch (err) {
                console.log("bug !!");
            }
        },
        first(component) {
            return component.firstChild;
        },
        replace(parent, who, byWhom) {
            try {
                parent.replaceChild(byWhom, who);
            }
            catch (err) {
                console.log("bug !!");
            }
        },
        focus(component) {
            component.focus();
        },
        select(component) {
            component.select();
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
        removeEvent(component, eventName) {
            if (component.listeners && component.listeners[eventName]) {
                component.removeEventListener(eventName, component.listeners[eventName]);
                delete component.listeners[eventName];
            }
        },
        removeGlobalEvent(eventName) {
            if (window.listeners && window.listeners[eventName]) {
                window.removeEventListener(eventName, window.listeners[eventName]);
                delete window.listeners[eventName];
            }
        },
        event(component, eventName, event) {
            if (component.listeners && component.listeners[eventName]) {
                component.listeners[eventName](event);
            }
            else {
                component.parentNode && this.event(component.parentNode, eventName, event);
            }
        },
        globalEvent(eventName, event) {
            if (window.listeners && window.listeners[eventName]) {
                window.listeners[eventName](event);
            }
        },
        getEventHandler(component, eventName) {
            return component.listeners ? component.listeners[eventName] : null;
        },
        getGlobalEventHandler(eventName) {
            return window.listeners ? window.listeners[eventName] : null;
        },
        preventDefault(event) {
            event.preventDefault();
        },
        screenSize: function(){
            return {
                width: window.innerWidth,
                height: window.innerHeight
            }
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
        },
        request(url, data) {
            var http = new XMLHttpRequest();
            http.open("POST", url, true);
            http.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            http.send(JSON.stringify(data));
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
            http.onreadystatechange = function () {
                if (http.readyState == 4) {
                    if (http.status == 200) {
                        var fromServer = JSON.parse(http.responseText);
                        result.success && result.success(fromServer);
                    }
                    else {
                        result.failure && result.failure(http.status);
                    }
                }
            };
            return result;
        }

    };
};
