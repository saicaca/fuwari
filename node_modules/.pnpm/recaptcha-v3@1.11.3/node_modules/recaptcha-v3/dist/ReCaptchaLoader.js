"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInstance = exports.load = void 0;
var ReCaptchaInstance_1 = require("./ReCaptchaInstance");
var ELoadingState;
(function (ELoadingState) {
    ELoadingState[ELoadingState["NOT_LOADED"] = 0] = "NOT_LOADED";
    ELoadingState[ELoadingState["LOADING"] = 1] = "LOADING";
    ELoadingState[ELoadingState["LOADED"] = 2] = "LOADED";
})(ELoadingState || (ELoadingState = {}));
var ReCaptchaLoader = (function () {
    function ReCaptchaLoader() {
    }
    ReCaptchaLoader.load = function (siteKey, options) {
        if (options === void 0) { options = {}; }
        if (typeof document === "undefined") {
            return Promise.reject(new Error("This is a library for the browser!"));
        }
        if (ReCaptchaLoader.getLoadingState() === ELoadingState.LOADED) {
            if (ReCaptchaLoader.instance.getSiteKey() === siteKey) {
                return Promise.resolve(ReCaptchaLoader.instance);
            }
            else {
                return Promise.reject(new Error("reCAPTCHA already loaded with different site key!"));
            }
        }
        if (ReCaptchaLoader.getLoadingState() === ELoadingState.LOADING) {
            if (siteKey !== ReCaptchaLoader.instanceSiteKey) {
                return Promise.reject(new Error("reCAPTCHA already loaded with different site key!"));
            }
            return new Promise(function (resolve, reject) {
                ReCaptchaLoader.successfulLoadingConsumers.push(function (instance) { return resolve(instance); });
                ReCaptchaLoader.errorLoadingRunnable.push(function (reason) {
                    return reject(reason);
                });
            });
        }
        ReCaptchaLoader.instanceSiteKey = siteKey;
        ReCaptchaLoader.setLoadingState(ELoadingState.LOADING);
        var loader = new ReCaptchaLoader();
        return new Promise(function (resolve, reject) {
            loader
                .loadScript(siteKey, options.useRecaptchaNet || false, options.useEnterprise || false, options.renderParameters ? options.renderParameters : {}, options.customUrl)
                .then(function () {
                ReCaptchaLoader.setLoadingState(ELoadingState.LOADED);
                var widgetID = loader.doExplicitRender(grecaptcha, siteKey, options.explicitRenderParameters
                    ? options.explicitRenderParameters
                    : {}, options.useEnterprise || false);
                var instance = new ReCaptchaInstance_1.ReCaptchaInstance(siteKey, widgetID, grecaptcha);
                ReCaptchaLoader.successfulLoadingConsumers.forEach(function (v) {
                    return v(instance);
                });
                ReCaptchaLoader.successfulLoadingConsumers = [];
                if (options.autoHideBadge) {
                    instance.hideBadge();
                }
                ReCaptchaLoader.instance = instance;
                resolve(instance);
            })
                .catch(function (error) {
                ReCaptchaLoader.errorLoadingRunnable.forEach(function (v) { return v(error); });
                ReCaptchaLoader.errorLoadingRunnable = [];
                reject(error);
            });
        });
    };
    ReCaptchaLoader.getInstance = function () {
        return ReCaptchaLoader.instance;
    };
    ReCaptchaLoader.setLoadingState = function (state) {
        ReCaptchaLoader.loadingState = state;
    };
    ReCaptchaLoader.getLoadingState = function () {
        if (ReCaptchaLoader.loadingState === null) {
            return ELoadingState.NOT_LOADED;
        }
        else {
            return ReCaptchaLoader.loadingState;
        }
    };
    ReCaptchaLoader.prototype.loadScript = function (siteKey, useRecaptchaNet, useEnterprise, renderParameters, customUrl) {
        var _this = this;
        if (useRecaptchaNet === void 0) { useRecaptchaNet = false; }
        if (useEnterprise === void 0) { useEnterprise = false; }
        if (renderParameters === void 0) { renderParameters = {}; }
        if (customUrl === void 0) { customUrl = ""; }
        var scriptElement = document.createElement("script");
        scriptElement.setAttribute("recaptcha-v3-script", "");
        scriptElement.setAttribute("async", "");
        scriptElement.setAttribute("defer", "");
        var scriptBase = "https://www.google.com/recaptcha/api.js";
        if (useRecaptchaNet) {
            if (useEnterprise) {
                scriptBase = "https://recaptcha.net/recaptcha/enterprise.js";
            }
            else {
                scriptBase = "https://recaptcha.net/recaptcha/api.js";
            }
        }
        else if (useEnterprise) {
            scriptBase = "https://www.google.com/recaptcha/enterprise.js";
        }
        if (customUrl) {
            scriptBase = customUrl;
        }
        if (renderParameters.render) {
            renderParameters.render = undefined;
        }
        var parametersQuery = this.buildQueryString(renderParameters);
        scriptElement.src = scriptBase + "?render=explicit" + parametersQuery;
        return new Promise(function (resolve, reject) {
            scriptElement.addEventListener("load", _this.waitForScriptToLoad(function () {
                resolve(scriptElement);
            }, useEnterprise), false);
            scriptElement.onerror = function (error) {
                ReCaptchaLoader.setLoadingState(ELoadingState.NOT_LOADED);
                reject(error);
            };
            document.head.appendChild(scriptElement);
        });
    };
    ReCaptchaLoader.prototype.buildQueryString = function (parameters) {
        var parameterKeys = Object.keys(parameters);
        if (parameterKeys.length < 1) {
            return "";
        }
        return ("&" +
            Object.keys(parameters)
                .filter(function (parameterKey) {
                return !!parameters[parameterKey];
            })
                .map(function (parameterKey) {
                return parameterKey + "=" + parameters[parameterKey];
            })
                .join("&"));
    };
    ReCaptchaLoader.prototype.waitForScriptToLoad = function (callback, useEnterprise) {
        var _this = this;
        return function () {
            if (window.grecaptcha === undefined) {
                setTimeout(function () {
                    _this.waitForScriptToLoad(callback, useEnterprise);
                }, ReCaptchaLoader.SCRIPT_LOAD_DELAY);
            }
            else {
                if (useEnterprise) {
                    window.grecaptcha.enterprise.ready(function () {
                        callback();
                    });
                }
                else {
                    window.grecaptcha.ready(function () {
                        callback();
                    });
                }
            }
        };
    };
    ReCaptchaLoader.prototype.doExplicitRender = function (grecaptcha, siteKey, parameters, isEnterprise) {
        var augmentedParameters = __assign({ sitekey: siteKey }, parameters);
        if (parameters.container) {
            if (isEnterprise) {
                return grecaptcha.enterprise.render(parameters.container, augmentedParameters);
            }
            else {
                return grecaptcha.render(parameters.container, augmentedParameters);
            }
        }
        else {
            if (isEnterprise) {
                return grecaptcha.enterprise.render(augmentedParameters);
            }
            else {
                return grecaptcha.render(augmentedParameters);
            }
        }
    };
    ReCaptchaLoader.loadingState = null;
    ReCaptchaLoader.instance = null;
    ReCaptchaLoader.instanceSiteKey = null;
    ReCaptchaLoader.successfulLoadingConsumers = [];
    ReCaptchaLoader.errorLoadingRunnable = [];
    ReCaptchaLoader.SCRIPT_LOAD_DELAY = 25;
    return ReCaptchaLoader;
}());
exports.load = ReCaptchaLoader.load;
exports.getInstance = ReCaptchaLoader.getInstance;
