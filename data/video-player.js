/* global VP:true, LBP */
"use strict";
const VP = function(container) {
    this.attached = false;
    this.player = undefined;
    this.container = container;
    this.srcs = [];
    this.src = {};
    this._style = {};
    this._containerStyle = {};
    this._props = {};
    this._containerProps = {};
    this._CSSRules = [];
    this.styleEl = undefined;
};
VP.prototype = {};
VP.prototype.addSrc = function(url, type) {
    this.log("addSrc", type);
    this.srcs.push({
        src: url,
        type: type
    });
};
VP.prototype.setMainSrc = function(url, type) {
    this.log("setMainSrc", type);
    this.src = {
        src: url,
        type: type
    };
};
VP.prototype.setup = function() {
    this.clean();
    if (!this.player) {
        this.player = createNode("video", this._props, this._style);
    }
    if (!this.styleEl)
        this.styleEl = createNode("style");
    this.patch(this.player, this._props);
    this.patch(this.player, this._style, "style");
    this.player.appendChild(createNode("source", this.src));
    this.srcs.forEach((src) => {
        if (src.src !== this.src.src)
            this.player.appendChild(createNode("source", src));
    });
    this.container.appendChild(this.player);
    this.container.appendChild(this.styleEl);
    this.attached = true;
    this._CSSRules.forEach(s => this.styleEl.sheet.insertRule(s,
        this.styleEl.sheet.cssRules.length));
    this.patch(this.container, this._containerProps);
    this.patch(this.container, this._containerStyle, "style");
    this.log("setup");
    if (OPTIONS.player === 1)
        this.setupLBP();
};
VP.prototype.on = function(evt, cb) {
    this.player["on" + evt] = cb; //TODO
};
VP.prototype.stop = function() {
    this.log("stop");
    if (!this.player)
        return;
    this.player.pause();
    this.player.onended = undefined;
    this.player.currentTime = this.player.duration;
};
VP.prototype.clean = function() {
    this.log("clean");
    if (this.player) {
        this.player.pause();
        this.player.onended = undefined;
    }
    rmChildren(this.container);
    this.attached = false;
};
VP.prototype.end = function() {
    this.log("end");
    this.stop();
    this.clean();
    this.srcs = [];
    this._style = {};
    this._containerStyle = {};
    this._props = {};
    this._containerProps = {};
    this._sheets = [];
};
VP.prototype.addCSSRule = function(cssText) {
    this.log("addCSSRule", cssText);
    this._CSSRules.push(cssText);
    if (this.attached)
        this.styleEl.sheet.insertRule(cssText,
            this.styleEl.sheet.cssRules.length);
};
VP.prototype.style = function(style) {
    this.apply(style, this.player, "_style", "style");
};
VP.prototype.containerStyle = function(style) {
    this.apply(style, this.container, "_containerStyle", "style");
};
VP.prototype.props = function(props) {
    this.apply(props, this.player, "_props");
};
VP.prototype.containerProps = function(props) {
    this.apply(props, this.container, "_containerProps");
};
VP.prototype.setupLBP = function() {
    this.container.className += " leanback-player-video";
    LBP.setup();
    this.player.style = "";
    this.player.style = "";
    this.player.style.position = "relative";
    this.player.style.height = "inherit";
    this.container.style.marginLeft = "0px";
};
VP.prototype.apply = function(props, el, obj, sub) {
    for (var prop in props) {
        if (props.hasOwnProperty(prop)) {
            this[obj][prop] = props[prop];
            if (this.attached && sub)
                el[sub][prop] = props[prop];
            else if (this.attached && !sub)
                el[prop] = props[prop];
        }
    }
};
VP.prototype.patch = function(el, props, sub) {
    for (var prop in props)
        if (props.hasOwnProperty(prop))
            if (sub)
                el[sub][prop] = props[prop];
            else
                el[prop] = props[prop];
};
VP.prototype.log = function(...args) {
    if (OPTIONS.production) return;
    args.unshift("[DRIVER::VP]");
    dump(args.join(" ") + "\n");
};