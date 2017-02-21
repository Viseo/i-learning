'use strict'
/**
 * Created by HDA3014 on 07/01/2016.
 */
console.log("Enhance loaded...");

exports.Enhance = function() {

    if (!Array.prototype.add) {
        Object.defineProperty(Array.prototype, "add", {
            enumerable: false,
            value: function (val) {
                var i = this.indexOf(val);
                i === -1 && this.push(val);
                return i === -1;
            }
        });
    }

    if (!Array.prototype.remove) {
        Object.defineProperty(Array.prototype, "remove", {
            enumerable: false,
            value: function (val) {
                var i = this.indexOf(val);
                i > -1 && this.splice(i, 1);
                return i > -1;
            }
        });
    }

    if (!Array.prototype.contains) {
        Object.defineProperty(Array.prototype, "contains", {
            enumerable: false,
            value: function (val) {
                return this.indexOf(val) >= 0;
            }
        });
    }

    if (!Array.prototype.equals) {
        Object.defineProperty(Array.prototype, "equals", {
            enumerable: false,
            value: function (val) {
                if (val.length === undefined || val.length !== this.length) {
                    return false;
                }
                for (let i = 0; i < this.length; i++) {
                    if (val[i] !== this[i]) {
                        return false;
                    }
                }
                return true;
            }
        });
    }

    if (!Array.prototype.clear) {
        Object.defineProperty(Array.prototype, "clear", {
            enumerable: false,
            value: function () {
                return this.length = 0;
            }
        });
    }

    if (!Array.prototype.empty) {
        Object.defineProperty(Array.prototype, "empty", {
            enumerable: false,
            value: function () {
                return this.length === 0;
            }
        });
    }

    if (!Array.prototype.duplicate) {
        Object.defineProperty(Array.prototype, "duplicate", {
            enumerable: false,
            value: function () {
                return this.slice(0);
            }
        });
    }

    if (!Object.prototype.empty) {
        Object.defineProperty(Object.prototype, "empty", {
            enumerable: false,
            value: function () {
                for (let field in this) {
                    return false;
                }
                return true;
            }
        });
    }

    if (!Object.prototype.getLength) {
        Object.defineProperty(Object.prototype, "getLength", {
            enumerable: false,
            value: function () {
                let size = 0;
                for (let field in this) {
                    size++;
                }
                return size;
            }
        });
    }

    if (!Object.prototype.duplicate) {
        Object.defineProperty(Object.prototype, "duplicate", {
            enumerable: false,
            value: function () {
                let dup = {};
                for (let field in this) {
                    dup[field] = this[field];
                }
                return dup;
            }
        });
    }

    if (!Object.prototype.forEach) {
        Object.defineProperty(Object.prototype, "forEach", {
            enumerable: false,
            value: function (lambda) {
                for (let field in this) {
                    lambda(this[field], field, this);
                }
            }
        });
    }

    if (!Object.prototype.find) {
        Object.defineProperty(Object.prototype, "find", {
            enumerable: false,
            value: function (lambda) {
                for (let field in this) {
                    if (lambda(this[field], field, this)) {
                        return this[field];
                    }
                }
                return null;
            }
        });
    }

    if (!Object.prototype.length) {
        Object.defineProperty(Object.prototype, "length", {
            enumerable: false,
            value: function () {
                return Object.getOwnPropertyNames(this).length;
            }
        });
    }

    if (!Object.prototype.map) {
        Object.defineProperty(Object.prototype, "map", {
            enumerable: false,
            value: function (lambda) {
                let result = {};
                for (let field in this) {
                    result[field] = lambda(this[field], field, this);
                }
                return result;
            }
        });
    }

    if (!Object.prototype.toArray) {
        Object.defineProperty(Object.prototype, "toArray", {
            enumerable: false,
            value: function () {
                let result = [];
                for (let field in this) {
                    result.push(this[field]);
                }
                return result;
            }
        });
    }

    if (!Object.prototype.keyOf) {
        Object.defineProperty(Object.prototype, "keyOf", {
            enumerable: false,
            value: function (value) {
                for (let field in this) {
                    if (this[field] === value) {
                        return field;
                    }
                }
                return null;
            }
        });
    }

    if (!Object.prototype.filter) {
        Object.defineProperty(Object.prototype, "filter", {
            enumerable: false,
            value: function (predicate) {
                let result = {};
                this.forEach((value, key)=> {
                    if (predicate(value, key)) {
                        result[key] = value;
                    }
                });
                return result;
            }
        });
    }

    if (!Map.prototype.filter) {
        Map.defineProperty(Map.prototype, "filter", {
            enumerable: false,
            value: function (predicate) {
                let result = new Map();
                this.forEach((value, key)=> {
                    if (predicate(value, key)) {
                        result.set(key, value);
                    }
                });
                return result;
            }
        });
    }

};
