/* global OPTIONS:true, onPrefChange:true */
// common functions
"use strict";

//This Addons Preferences
var OPTIONS = {};
var onPrefChange = [];
var Qlt = ["higher",
    "high",
    "medium",
    "low"
];
var Cdc = ["webm", "mp4"];
self.port.on("preferences", function(prefs) {
    OPTIONS = prefs;
    onPrefChange.forEach(f => f());
});

self.port.on("prefChanged", function(pref) {
    OPTIONS[pref.name] = pref.value;
    onPrefChange.forEach(f => f(pref.name));
});

function getPreferredFmt(fmts, wrapper = {}) {
    // for example of the optional wrapper, see data/youtube-formats.js
    var i, j, slct;
    var _cdc = [
        Cdc[OPTIONS.prefCdc],
        Cdc[(OPTIONS.prefCdc + 1 % 2)]
    ];
    i = OPTIONS.prefQlt;
    do {
        for (j = 0; j < 2; j++) {
            slct = Qlt[i] + "/" + _cdc[j];
            slct = wrapper[slct] || slct;
            if (fmts[slct])
                return fmts[slct];
        }
        i = (i + 1) % 4;
    } while (i !== OPTIONS.prefQlt);
}

function createNode(type, obj, data, style) {
    logify("createNode", type, obj);
    var node = document.createElement(type);
    if (obj)
        for (var opt in obj)
            if (obj.hasOwnProperty(opt))
                node[opt] = obj[opt];
    if (data)
        for (var el in data)
            if (data.hasOwnProperty(el))
                node.dataset[el] = data[el];
    if (style)
        for (var st in style)
            if (style.hasOwnProperty(st))
                node.style[st] = style[st];
    return node;
}

function asyncGet(url, headers, mimetype) {
    logify("asyncGet", url);
    return new Promise(function(resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        /* jshint forin:false */
        if (headers)
            for (var header in headers)
                xhr.setRequestHeader(header, headers[header]);
        if (mimetype && xhr.overrideMimeType)
            xhr.overrideMimeType(mimetype);
        xhr.onload = function() {
            if (this.status !== 200) {
                reject(this.status);
                return;
            }
            resolve(this.responseText);
        };
        xhr.onerror = function() {
            reject();
        };
        xhr.send();
    });
}

function logify(...args) {
    console.log.apply(console, args.map(s => JSON.stringify(s, null, 2)));
}

function onReady(f) {
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
}

function onInit(f) {
    // code running on when="ready" mode or does not need until onReady
    // execc but depend on preferences, need to wrapped to this funct.
    // need
    function F() {
        document.onafterscriptexecute = undefined;
        f();
    }
    document.onafterscriptexecute = F;
}