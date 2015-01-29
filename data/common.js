/* global OPTIONS:true, onPrefChange:true, getPreferredFmt:true */
/* global createNode:true, asyncGet:true, onReady:true, onInit:true, logify:true */
/* global preLoad:true, autoPlay:true, HANDLE_VOL_PREF_CHANGE:true */
/* global rmChildren:true */
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
// set it to false if the module uses custom listener
var HANDLE_VOL_PREF_CHANGE = true;
const Cdc = ["webm", "mp4"];
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

const getPreferredFmt = (fmts, wrapper = {}) => {
    // for example of the optional wrapper, see data/youtube-formats.js
    var i, j, slct;
    var _cdc = [
        Cdc[OPTIONS.prefCdc],
        Cdc[(OPTIONS.prefCdc + 1 % 2)]
    ];
    i = OPTIONS.prefQlt;
    while (i > -1) {
        for (j = 0; j < 2; j++) {
            slct = Qlt[i] + "/" + _cdc[j];
            slct = wrapper[slct] || slct;
            if (fmts[slct])
                return fmts[slct];
        }
        i = (i >= OPTIONS.prefQlt) ? i + 1 : i - 1;
        if (i > 3)
            i = OPTIONS.prefQlt - 1;
    }
    logify("Error on getPreferredFmt", fmts, wrapper);
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

const logify = (...args) =>
    console.log.apply(console, args.map(s => JSON.stringify(s, null, 2)));

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
        console.error("Exception", e.lineNumber, e.columnNumber, e.message, e.stack);
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