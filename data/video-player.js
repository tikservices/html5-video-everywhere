/* global VP:true, LBP */
"use strict";
const VP = function(container) {
    this.attached = false;
    this.player = undefined;
    this.container = container;
    this._srcs = [];
    this._style = {};
    this._containerStyle = {};
    this._props = {};
    this._langs = [];
    this._containerProps = {};
    this._CSSRules = [];
    this.styleEl = undefined;
};
VP.prototype = {};
VP.prototype.addSrc = function(url, qlt, cdc) {
    this.log("addSrc", qlt, cdc);
    this._srcs[Qlt.indexOf(qlt) * 2 + Cdc.indexOf(cdc)] = url;
};
VP.prototype.srcs = function(fmts, wrapper, get) {
    var slct, i, j;
    if (!wrapper) {
        for (slct in fmts) {
            i = Qlt.indexOf(slct.split("/")[0]);
            j = Cdc.indexOf(slct.split("/")[1]);
            this._srcs[i * 2 + j] = fmts[slct];
        }
        return;
    }
    for (i = 0; i < Qlt.length; i++) {
        for (j = 0; j < Cdc.length; j++) {
            slct = Qlt[i] + "/" + Cdc[j];
            if (!(slct in wrapper) || !fmts[wrapper[slct]])
                continue;
            this._srcs[i * 2 + j] = (get) ?
                (get(fmts[wrapper[slct]]) || this._srcs[i * 2 + j]) : fmts[wrapper[slct]];
        }
    }
};
VP.prototype.mainSrcIndex = function() {
    var i, j, slct;
    i = OPTIONS.prefQlt;
    while (i > -1) {
        if (this._srcs[i * 2 + OPTIONS.prefCdc])
            return {
                qlt: i,
                cdc: OPTIONS.prefCdc
            };
        else if (this._srcs[i * 2 + (OPTIONS.prefCdc + 1 % 2)])
            return {
                qlt: i,
                cdc: OPTIONS.prefCdc + 1 % 2
            };
        i = (i >= OPTIONS.prefQlt) ? i + 1 : i - 1;
        if (i > 3)
            i = OPTIONS.prefQlt - 1;
    }
};
VP.prototype.setup = function() {
    var idx = this.mainSrcIndex();
    if (!idx)
        return this.error("Failed to find video url");
    this.clean();
    // just to force contextmenu id. TODO: fix contextmenu and use createNode
    this.container.innerHTML = "<video contextmenu='h5vew-contextmenu'></video>";
    this.player = this.container.firstChild;
    //    if (!this.player) {
    //        this.player = createNode("video", this._props, this._style);
    //    }
    if (!this.styleEl)
        this.styleEl = createNode("style");
    this.patch(this.player, this._props);
    this.patch(this.player, this._style, "style");
    this.player.appendChild(createNode("source", {
        src: this._srcs[idx.qlt * 2 + idx.cdc],
        type: "video/" + Cdc[idx.cdc]
    }));
    this._srcs.forEach((url, i) => {
        if (i !== idx.qlt * 2 + idx.cdc)
            this.player.appendChild(createNode("source", {
                src: url,
                type: "video/" + Cdc[i % 2]
            }));
    });
    this.container.appendChild(this.player);
    this.container.appendChild(this.styleEl);
    this.attached = true;
    this.slctLang();
    this._CSSRules.forEach(s => this.styleEl.sheet.insertRule(s,
        this.styleEl.sheet.cssRules.length));
    this.patch(this.container, this._containerProps);
    this.patch(this.container, this._containerStyle, "style");
    this.log("setup");
    if (OPTIONS.player === 1)
        this.setupLBP();
    else
        this.setupContextMenu(idx);
};
VP.prototype.tracksList = function(langs, fnct) {
    this._langs = langs.sort();
    this._slctLang = fnct;
    if (this.attached)
        this.slctLang();
};
VP.prototype.slctLang = function(lang) {
    if (!(lang !== undefined || OPTIONS.lang !== 0) || this._slctLang === undefined)
        return;
    if (lang === undefined)
        lang = LANGS[OPTIONS.lang - 1];
    if (this._lang)
        this.player.textTracks.getTrackById(this._lang).mode = "disabled";
    var track;
    if ((track = this.player.textTracks.getTrackById(lang))) {
        track.mode = "showing";
        this._lang = lang;
    } else {
        new Promise((resolve, reject) => this._slctLang(lang, resolve, reject))
            .then((url) => {
                track = createNode("track", {
                    kind: "subtitles",
                    id: lang,
                    src: url,
                    label: lang,
                    srclang: lang
                });
                this.player.appendChild(track);
                track.track.mode = "showing";
                this._lang = lang;
            });
    }
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
    if (this.player.duration)
        this.player.currentTime = this.player.duration;
};
VP.prototype.clean = function() {
    this.log("clean");
    if (this.player) {
        this.player.pause();
        this.player.onended = undefined;
    }
    // site default video player sometime continue playing on background
    var vds = this.container.getElementsByTagName("video");
    for (var i = 0; i < vds.length; i++) {
        if (this.player === vds[i])
            continue;
        vds[i].pause();
        vds[i].src = "";
        vds[i].addEventListener("playing", (e) => {
            e.currentTarget.pause();
            e.currentTarget.src = "";
        });
    }
    rmChildren(this.container);
    this.attached = false;
};
VP.prototype.end = function() {
    this.log("end");
    this.stop();
    this.clean();
    this._srcs = {};
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
VP.prototype.error = function(msg) {
    this.log("ERROR Msg:", msg);
    this.clean();
    if (!this.styleEl)
        this.styleEl = createNode("style");
    this.container.appendChild(createNode("p", {
        textContent: "Ooops! :("
    }, {
        padding: "15px",
        fontSize: "20px"
    }));
    this.container.appendChild(createNode("p", {
        textContent: msg
    }, {
        fontSize: "20px"
    }));
    this.container.appendChild(this.styleEl);
    this._CSSRules.forEach(s => this.styleEl.sheet.insertRule(s,
        this.styleEl.sheet.cssRules.length));
    this.patch(this.container, this._containerProps);
    this.patch(this.container, this._containerStyle, "style");
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
VP.prototype.setupContextMenu = function(idx) {
    /* jshint maxstatements:false */
    this._contextMenu = createNode("menu", {
        type: "context", //"popup",
        id: "h5vew-contextmenu"
    });
    var qltMenu = createNode("menu", {
        id: "h5vew-menu-qlt",
        label: "Video Quality"
    });
    for (var i = 0; i < Qlt.length; i++)
        qltMenu.appendChild(createNode("menuitem", {
            type: "radio",
            label: Qlt[i],
            radiogroup: "menu-qlt",
            checked: (idx.qlt === i),
            disabled: !(this._srcs[i * 2] || this._srcs[i * 2 + 1]),
            onclick: (e) => {
                idx.qlt = Qlt.indexOf(e.target.label);
                idx.cdc = (this._srcs[idx.qlt * 2 + idx.cdc]) ?
                    idx.cdc : (idx.cdc + 1 % 2);
                var paused = this.player.paused;
                this.player.src = this._srcs[idx.qlt * 2 + idx.cdc] +
                    "#t=" + this.player.currentTime;
                this.player.load();
                this.player.oncanplay = () => {
                    if (!paused)
                        this.player.play();
                    this.player.oncanplay = undefined;
                };
            }
        }));
    var cdcMenu = createNode("menu", {
        id: "h5vew-menu-cdc",
        label: "Preferred Video Format"
    });
    for (i = 0; i < Cdc.length; i++)
        cdcMenu.appendChild(createNode("menuitem", {
            type: "radio",
            label: Cdc[i],
            radiogroup: "menu-cdc",
            checked: (OPTIONS.prefCdc === i),
            onclick: (e) =>
                chgPref("prefCdc", Cdc.indexOf(e.target.label))
        }));
    var langMenu = createNode("menu", {
        id: "h5vew-menu-lang",
        label: "Subtitles"
    });
    langMenu.appendChild(createNode("menuitem", {
        type: "radio",
        label: "none",
        radiogroup: "menu-lang",
        checked: OPTIONS.lang === 0 || this._langs.findIndex((l) => l === LANGS[OPTIONS.lang - 1]) === -1,
        onclick: (e) => {
            if (this._lang === undefined)
                return;
            this.player.textTracks.getTrackById(this._lang).mode = "disabled";
            this._lang = undefined;
        }
    }));
    for (i = 0; i < this._langs.length; i++)
        langMenu.appendChild(createNode("menuitem", {
            type: "radio",
            label: this._langs[i],
            radiogroup: "menu-lang",
            checked: this._langs[i] === LANGS[OPTIONS.lang - 1],
            onclick: (e) =>
                this.slctLang(e.target.label)
        }));
    var loopMenu = createNode("menu", {
        id: "h5vew-menu-loop",
        label: "Loop Video"
    });
    ["Never", "Always", "Default"].forEach((n, i) => {
        loopMenu.appendChild(createNode("menuitem", {
            type: "radio",
            label: n,
            radiogroup: "menu-loop",
            checked: (OPTIONS.loop === i),
            onclick: (e) =>
                chgPref("loop", i)
        }));
    });
    var autoNextMenu = createNode("menuitem", {
        id: "h5vew-menu-autonext",
        type: "checkbox",
        label: "Auto Play Next Video",
        checked: OPTIONS.autoNext,
        onclick: (e) => chgPref("autoNext", e.target.checked)
    });
    var moreMenu = createNode("menu", {
        id: "h5vew-menu-more",
        label: "More options"
    });
    var copyMenu = createNode("menuitem", {
        id: "h5vew-menu-copy",
        label: "Copy Page URL",
        onclick: () => setClipboard(location.href) // TODO
    });
    var disableMenu = createNode("menuitem", {
        id: "h5vew-menu-disable",
        label: "Disable " + OPTIONS.driver.charAt(0).toUpperCase() +
            OPTIONS.driver.slice(1) + " Support",
        onclick: () => {
            self.port.emit("disable");
            this._contextMenu.removeChild(disableMenu);
        }
    });
    var aboutMenu = createNode("menuitem", {
        id: "h5vew-menu-about",
        label: "About HTML5 Video EveryWhere",
        onclick: () =>
            window.open("http://lejenome.github.io/html5-video-everywhere#v=" +
                OPTIONS.addon.version + "&id=" + OPTIONS.addon.id,
                "h5vew-about", "width=550,height=280,menubar=no,toolbar=no,location=no,status=no,chrome=on,modal=on")
    });
    moreMenu.appendChild(copyMenu);
    moreMenu.appendChild(disableMenu);
    moreMenu.appendChild(createNode("hr"));
    moreMenu.appendChild(aboutMenu);

    const prefChanged = (name) => {
        if (name === "autoNext")
            autoNextMenu.checked = OPTIONS.autoNext;
    };
    onPrefChange.push(prefChanged);
    this._contextMenu.appendChild(qltMenu);
    this._contextMenu.appendChild(cdcMenu);
    if (this._langs.length > 0)
        this._contextMenu.appendChild(langMenu);
    this._contextMenu.appendChild(loopMenu);
    this._contextMenu.appendChild(autoNextMenu);
    this._contextMenu.appendChild(moreMenu);
    this.container.appendChild(this._contextMenu);
    // TODO: fix assigning contextMenu and uncommant createNode("video") ^
    this.container.contextmenu = "h5vew-contextmenu";
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
    args.unshift("[DRIVER::VP]");
    dump(args.join(" ") + "\n");
};