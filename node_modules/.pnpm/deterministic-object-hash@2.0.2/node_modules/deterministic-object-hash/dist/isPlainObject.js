"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const objConstructorString = Function.prototype.toString.call(Object);
function isPlainObject(value) {
    //base object
    if (typeof value !== 'object' ||
        value === null ||
        Object.prototype.toString.call(value) !== '[object Object]') {
        return false;
    }
    //get the prototype
    const proto = Object.getPrototypeOf(value);
    //no prototype === all good
    if (proto === null) {
        return true;
    }
    //has own prop 'constructor'
    if (!Object.prototype.hasOwnProperty.call(proto, 'constructor')) {
        return false;
    }
    // validate that the constructor is `Object`
    return (typeof proto.constructor === 'function' &&
        proto.constructor instanceof proto.constructor &&
        Function.prototype.toString.call(proto.constructor) === objConstructorString);
}
exports.default = isPlainObject;
;
