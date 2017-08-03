"use strict";
class Vimeo extends Module {
  constructor() {
    super("vimeo");
  }

  onInteractive() {
    this.getConfig().then((conf) => this.getVideoInfo(conf));
  }

  injectPlayer(conf) {
    try {
      let player_container, player, stl;
      if (conf.isEmbed) {
        player_container = document.body;
      } else if (conf.isWatch) {
        player_container =
          document.getElementsByClassName("player_area")[0];
        /*
        if ((stl = player_container.children[0]) && (stl = stl.sheet) &&
          (stl.cssRules.length > 0)) {
          stl = stl.cssRules[0].cssText;
        }
        */
      } else {
        player_container = document.getElementById("clip_" + conf.id);
      }
      if (!player_container) return;
      let vp = new VP(player_container, this.options);
      vp.srcs(conf.fmts);
      vp.props({
        className: conf.className,
        autoplay: this.options.isAutoPlay(),
        preload: this.options.getPreload(),
        loop: this.options.isLoop(),
        controls: true,
        poster: conf.poster,
        volume: this.options.getVolume(),
      });
      vp.tracksList(conf.tracks.map(l => l.lang), (lang, resolve, reject) => {
        let l = conf.tracks.find(l => l.lang === lang);
        if (l === undefined)
          reject();
        else
          resolve(l.direct_url || l.url);
      });
      if (stl) vp.addCSSRule(stl);
      vp.setup();
      if (conf.isWatch) this.brozarEvents();
    } catch (e) {
      this.log("Exception on changePlayer()", e.lineNumber, e.columnNumber, e.message, e.stack);
    }
  }

  getConfig() {
    return new Promise((resolve, reject) => {
      let isWatch =
        /https?:\/\/vimeo.com\/[\d]+/.test(location.href) || this.ogType().indexOf("video") > -1;
      let isEmbed = /https?:\/\/player.vimeo.com\/video/.test(location.href);
      let isChannel = !isWatch && (/https?:\/\/vimeo.com\/(channels\/|)\w+/.test(location.href) ||
        this.ogType().match(/channel|profile/) !== null);
      if (!isWatch && !isChannel && !isEmbed) reject();
      let player_id, player_class;
      if (isWatch) {
        player_id = location.pathname.match(/\/([\d]+)/)[1];
        player_class = "player";
      } else if (isEmbed) {
        player_id = location.pathname.match(/video\/([\d]+)/)[1];
        player_class = "fallback";
      } else if (isChannel) {
        player_class = "player";
      }
      if (!player_id && !isChannel) reject();
      resolve({
        isWatch: isWatch,
        isEmbed: isEmbed,
        isChannel: isChannel,
        id: player_id,
        className: player_class
      });
    });
  }

  getVideoInfo(conf) {
    const INFO_URL = "https://player.vimeo.com/video/";
    if (conf.isChannel) {
      return Array.map(document.getElementsByClassName("player_container"), (el) => {
        let _conf = {};
        for (let va in conf)
          _conf[va] = conf[va];
        _conf.id = el.id.replace("clip_", "");
        return asyncGet(INFO_URL + _conf.id + "/config")
          .then(this.processData(_conf))
          .then((conf) => this.injectPlayer(conf));
      });
    } else {
      return asyncGet(INFO_URL + conf.id + "/config")
        .then(this.processData(conf))
        .then((conf) => this.injectPlayer(conf));
    }
  }

  processData(conf) {
    return (data) => {
      data = JSON.parse(data);
      conf.fmts = this.getSrcs(data.request.files.progressive);
      conf.poster = data.video.thumbs.base;
      conf.tracks = data.request.text_tracks || [];
      return Promise.resolve(conf);
    };
  }
  getSrcs(progressive) {
    let fmts = {};
    let srcs = {};
    Array.forEach(progressive, (v) => {
      srcs[v.quality] = v.url;
    });
    for (const [q, fmt] of[
        ["270p", "low/mp4"], ["360p", "medium/mp4"], ["720p", "high/mp4"], ["1028p", "higher/mp4"],
      ]) {
      if (srcs[q]) fmts[fmt] = srcs[q];
    }
    return fmts;
  }
  brozarEvents() {
    // change Vimeo default click events of items on brozar element
    let clips = document.getElementById("clips");
    if (clips)
      clips.onclick = function(e) {
        if (e.target === e.currentTarget) return;
        let li = e.target;
        while (li.tagName !== "LI")
          li = li.parentElement;
        window.location = "/" + li.id.replace("clip_", "");
      };
    let promos = document.getElementsByClassName("js-promo_link");
    let promoClick = function(e) {
      window.location = "/" + e.currentTarget.dataset.clipId;
    };
    for (let i = 0; promos && i < promos.length; i++)
      promos[i].onclick = promoClick;
  }

  ogType() {
    let t = document.head.querySelector("meta[property=\"og:type\"]");
    return (t) ? t.content : "";
  }
}

new Vimeo().start();
