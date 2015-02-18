/* global OPTIONS:true, onPrefChange:true */
/* global createNode:true, asyncGet:true, onReady:true, onInit:true, logify:true */
/* global preLoad:true, autoPlay:true, HANDLE_VOL_PREF_CHANGE:true */
/* global rmChildren:true, Qlt:true, Cdc:true, chgPref:true */
// the following jshint global rule is only because jshint support for ES6 arrow
// functions is limited
/* global wrapper:true, args:true, auto:true */
"use strict";

//This Addons Preferences
var OPTIONS = {};
// push your prefernces change listner function to this table, yah the old way
const onPrefChange = [];
const Qlt = [
    "higher",
    "high",
    "medium",
    "low"
];
const Cdc = [
    "webm",
    "mp4"
];
// set it to false if the module uses custom listener
var HANDLE_VOL_PREF_CHANGE = true;
self.port.on("preferences", function(prefs) {
    OPTIONS = prefs;
    onPrefChange.forEach(f => f());
});

self.port.on("prefChanged", function(pref) {
    OPTIONS[pref.name] = pref.value;
    if (pref.name === "volume" && HANDLE_VOL_PREF_CHANGE === true)
        Array.forEach(document.getElementsByTagName("video"), el => {
            el.volume = OPTIONS.volume / 100;
        });
    onPrefChange.forEach(f => f(pref.name));
});
const chgPref = (name, val) => {
    self.port.emit("prefChang", {
        name: name,
        val: val
    });
};
const createNode = (type, prprt, style, data) => {
    logify("createNode", type, prprt);
    var node = document.createElement(type);
    if (prprt)
        Object.keys(prprt).forEach(p => node[p] = prprt[p]);
    if (style)
        Object.keys(style).forEach(s => node.style[s] = style[s]);
    if (data)
        Object.keys(data).forEach(d => node.dataset[d] = data[d]);
    return node;
};

const asyncGet = (url, headers, mimetype) => {
    logify("asyncGet", url);
    return new Promise(function(resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        if (headers)
            Object.keys(headers).forEach(h => xhr.setRequestHeader(h, headers[h]));
        if (mimetype && xhr.overrideMimeType)
            xhr.overrideMimeType(mimetype);
        xhr.onload = function() {
            if (this.status !== 200) {
                reject(this.status);
                logify("Error on asyncGet", url, headers, this.status);
                return;
            }
            resolve(this.responseText);
        };
        xhr.onerror = function() {
            reject();
        };
        xhr.send();
    });
};

const logify = (...args) => {
    if (OPTIONS.production) return;
    args = args.map(s => JSON.stringify(s, null, 2));
    args.unshift("[DRIVER]");
    dump(args.join(" ") + "\n");
};

const onReady = f => {
    //TODO: document readyState is "loading" (and DOMECotentLoaded) even DOM elements are
    //accessible
    try {
        if (document.readyState !== "loading") {
            f();
        } else {
            document.addEventListener("DOMContentLoaded", f);
        }
    } catch (e) {
        logify("Exception", e.lineNumber, e.columnNumber, e.message, e.stack);
    }
};

const onInit = f => {
    // code running on when="ready" mode or does not need until onReady
    // execc but depend on preferences, need to wrapped to this funct.
    // need
    document.onafterscriptexecute = function() {
        document.onafterscriptexecute = undefined;
        f();
    };
};
const autoPlay = (auto = false) => ((OPTIONS.autoplay === 1 || auto === true) &&
    OPTIONS.autoplay !== 0);
const preLoad = (auto = false) => ((OPTIONS.preload === 1 || auto === true) &&
    OPTIONS.preload !== 0) ? "auto" : "metadata";

const rmChildren = (prnt) => {
    while (prnt && prnt.firstChild)
        prnt.removeChild(prnt.firstChild);
};