/* global VP:true, LBP */
"use strict";
class VP {
    constructor(container) {
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
    }

    addSrc(url, qlt, cdc) {
        this.log("addSrc", qlt, cdc);
        this._srcs[Qlt.indexOf(qlt) * 2 + Cdc.indexOf(cdc)] = url;
    }

    srcs(fmts, wrapper, get) {
        let slct, i, j;
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
    }

    mainSrcIndex() {
        let i, j, slct;
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
    }

    setup() {
        let idx = this.mainSrcIndex();
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
    }

    tracksList(langs, fnct) {
        this._langs = langs.sort();
        this._slctLang = fnct;
        if (this.attached)
            this.slctLang();
    }

    slctLang(lang) {
        if (!(lang !== undefined || OPTIONS.lang !== 0) || this._slctLang === undefined)
            return;
        if (lang === undefined)
            lang = LANGS[OPTIONS.lang - 1];
        if (this._lang)
            this.player.textTracks.getTrackById(this._lang).mode = "disabled";
        let track;
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
    }

    on(evt, cb) {
        this.player["on" + evt] = cb; //TODO
    }

    stop() {
        this.log("stop");
        if (!this.player)
            return;
        this.player.pause();
        this.player.onended = undefined;
        if (this.player.duration)
            this.player.currentTime = this.player.duration;
    }

    clean() {
        this.log("clean");
        if (this.player) {
            this.player.pause();
            this.player.onended = undefined;
        }
        // site default video player sometime continue playing on background
        let vds = this.container.getElementsByTagName("video");
        for (let i = 0; i < vds.length; i++) {
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
    }

    end() {
        this.log("end");
        this.stop();
        this.clean();
        this._srcs = {};
        this._style = {};
        this._containerStyle = {};
        this._props = {};
        this._containerProps = {};
        this._sheets = [];
    }

    addCSSRule(cssText) {
        this.log("addCSSRule", cssText);
        this._CSSRules.push(cssText);
        if (this.attached)
            this.styleEl.sheet.insertRule(cssText,
                this.styleEl.sheet.cssRules.length);
    }

    style(_style) {
        this.apply(_style, this.player, "_style", "style");
    }

    containerStyle(_style) {
        this.apply(_style, this.container, "_containerStyle", "style");
    }

    props(_props) {
        this.apply(_props, this.player, "_props");
    }

    containerProps(_props) {
        this.apply(_props, this.container, "_containerProps");
    }

    error(msg) {
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
    }

    setupLBP() {
        this.container.className += " leanback-player-video";
        LBP.setup();
        this.player.style = "";
        this.player.style = "";
        this.player.style.position = "relative";
        this.player.style.height = "inherit";
        this.container.style.marginLeft = "0px";
    }

    setupContextMenu(idx) {
        /* jshint maxstatements:false */
        this._contextMenu = createNode("menu", {
            type: "context", //"popup",
            id: "h5vew-contextmenu"
        });
        let qltMenu = createNode("menu", {
            id: "h5vew-menu-qlt",
            label: "Video Quality"
        });
        for (let i = 0; i < Qlt.length; i++)
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
                    let paused = this.player.paused;
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
        let cdcMenu = createNode("menu", {
            id: "h5vew-menu-cdc",
            label: "Preferred Video Format"
        });
        for (let i = 0; i < Cdc.length; i++)
            cdcMenu.appendChild(createNode("menuitem", {
                type: "radio",
                label: Cdc[i],
                radiogroup: "menu-cdc",
                checked: (OPTIONS.prefCdc === i),
                onclick: (e) =>
                    chgPref("prefCdc", Cdc.indexOf(e.target.label))
            }));
        let langMenu = createNode("menu", {
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
        for (let i = 0; i < this._langs.length; i++)
            langMenu.appendChild(createNode("menuitem", {
                type: "radio",
                label: this._langs[i],
                radiogroup: "menu-lang",
                checked: this._langs[i] === LANGS[OPTIONS.lang - 1],
                onclick: (e) =>
                    this.slctLang(e.target.label)
            }));
        let loopMenu = createNode("menu", {
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
        let autoNextMenu = createNode("menuitem", {
            id: "h5vew-menu-autonext",
            type: "checkbox",
            label: "Auto Play Next Video",
            checked: OPTIONS.autoNext,
            onclick: (e) => chgPref("autoNext", e.target.checked)
        });
        let moreMenu = createNode("menu", {
            id: "h5vew-menu-more",
            label: "More options"
        });
        let copyMenu = createNode("menuitem", {
            id: "h5vew-menu-copy",
            label: "Copy Page URL",
            onclick: () => setClipboard(location.href) // TODO
        });
        let disableMenu = createNode("menuitem", {
            id: "h5vew-menu-disable",
            label: "Disable " + OPTIONS.driver.charAt(0).toUpperCase() +
                OPTIONS.driver.slice(1) + " Support",
            onclick: () => {
                self.port.emit("disable");
                this._contextMenu.removeChild(disableMenu);
            }
        });
        let aboutMenu = createNode("menuitem", {
            id: "h5vew-menu-about",
            label: "About HTML5 Video EveryWhere",
            onclick: () =>
                window.open("http://lejenome.github.io/html5-video-everywhere#v=" +
                    OPTIONS.addon.version + "&id=" + OPTIONS.addon.id,
                    "h5vew-about", "width=550,height=300,menubar=no,toolbar=no,location=no,status=no,chrome=on,modal=on")
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
    }

    apply(props, el, obj, sub) {
        for (let prop of Object.keys(props)) {
                this[obj][prop] = props[prop];
                if (this.attached && sub)
                    el[sub][prop] = props[prop];
                else if (this.attached && !sub)
                    el[prop] = props[prop];
        }
    }

    patch(el, props, sub) {
        for (let prop of Object.keys(props)) {
                if (sub)
                    el[sub][prop] = props[prop];
                else
                    el[prop] = props[prop];
        }
    }

    log(...args) {
        args.unshift("[DRIVER::VP]");
        dump(args.join(" ") + "\n");
    }
}
