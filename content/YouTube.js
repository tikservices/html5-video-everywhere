/**
 * @file YouTube website support module.
 * @author Moez Bouhlel <bmoez.j@gmail.com>
 * @license MPL-2.0
 * @copyright 2014-2017 Moez Bouhlel
 */

import Module from './Module.js';
import VP from './video-player.js';
import {
  asyncGet,
} from './common.js';
import {
  youtube
} from '../vendor/iaextractor/youtube.js';

/* Map YouTube videos codes to the extension quality/format representation */
const FMT_WRAPPER = {
  "high/mp4": "22",
  "medium/mp4": "18",
  "medium/webm": "43",
};

class YouTube extends Module {
  constructor() {
    super("youtube");
    this.vp = null;
    this.swf_url = null;
  }

  onInteractive(resolve, reject) {
    this.log("onInteractive()");
    window.addEventListener("yt-navigate-start", () => {
      this.log("yt-navigate-start");
      if (this.vp) this.vp.stop();
    });
    window.addEventListener("yt-navigate-finish", () => {
      this.log("yt-navigate-finish");
      this.changePlayer();
    });
    if (location.pathname.startsWith("/embed/")) {
      this.changePlayer();
    }
    /*
    this.bindedChangePlayer = () => {
      console.log("yt-visibility-refresh");
      this.changePlayer.bind();
    }
    window.addEventListener('yt-visibility-refresh', this.bindedChangePlayer);
    */
    for (const video of [...document.getElementsByTagName("video")]) {
      /* pause yt video player asap */
      console.log("interactive", video);
      video.pause();
      video.onplaying = () => video.pause();
    }
  }

  changePlayer() {
    // window.removeEventListener('yt-visibility-refresh', this.bindedChangePlayer);
    this.getConfig()
      .then(conf => {
        /* pause yt video player asap */
        const player_container = this.getPlayerContainer(conf);
        if (player_container) {
          for (const video of [...player_container.getElementsByTagName("video")]) {
            video.pause();
          }
        }
        return conf;
      })
      .then((conf) => this.getVideoInfo(conf))
      .then((conf) => {
        if (this.vp) {
          this.log("vp.end");
          this.vp.end();
        }
        try {
          let player_container = this.getPlayerContainer(conf);
          if (!player_container) {
            this.log("Container not found", conf);
            return;
          }
          /* find youtube created video player(s) and always kill their src */
          const youtube_videos = player_container.getElementsByTagName("video");
          (function(killVideo) {
            for (const video of [...youtube_videos]) {
              killVideo(video);
              video.onplaying = _ => killVideo(video);
              // video.onloadstart = _ => killVideo(video);
            }
          })(function(video) {
            dump("KILLING VIDEO");
            console.log("KILLING VIDEO");
            video.pause();
            video.volume = 0;
            video.currentTime = 0;
            video.srcObject = null;
          });
          if (!conf.isEmbed) {
            /* append our container beside YT video container, so we does not
             * lose control of yt video player on video change */
            let new_container = document.createElement("div");
            player_container.parentElement.appendChild(new_container);
            player_container.hidden = true;
            player_container = new_container;
            player_container.id = "player-container";
          }
          let scripts = player_container.getElementsByTagName("script");
          for (let script of scripts)
            player_container.parentElement.appendChild(script);
          var seek = this.getSeek();
          this.vp = new VP(player_container, this.options);
          this.vp.srcs(conf.fmts, FMT_WRAPPER, (fmt) => fmt.url + seek);
          this.vp.props({
            id: "video_player",
            className: conf.className || "",
            autoplay: this.options.isAutoPlay(location.search.search("autoplay=") === -1 ?
              !conf.isEmbed :
              location.search.search("autoplay=0") === -1),
            preload: this.options.getPreload(),
            loop: this.options.isLoop(location.search.search("loop=1") !== -1),
            controls: true,
            poster: conf.poster || "",
            volume: this.options.getVolume(),
          });
          this.vp.containerStyle({
            height: "100%",
            width: "100%",
          });
          /* FIXME
          this.vp.tracksList((conf.tracks || []).map(i => i.lc), (lang, resolve, reject) => {
            var o = conf.tracks.find((i) => i.lc === lang);
            if (o === undefined) return reject();
            this.addWebVTT(lang, o.u, resolve, reject);
          });
          */
          this.vp.setup();
          if (conf.isWatch) this.playNextOnFinish();
        } catch (e) {
          this.log("EXCEPTION: unexpected error on changePlayer", e.lineNumber, e.columnNumber,
            e.message, e.stack);
        }
      })
      .catch((rej) => {
        if (rej === undefined) return;
        switch (rej.error) {
          case "VIDEO_URL_UNACCESSIBLE":
            if (rej.data.reason)
              this.errorMessage("Failed to load video url with the following error message: " +
                rej.data.reason,
                rej.conf);
            break;
          case "NO_SUPPORTED_VIDEO_FOUND":
            this.errorMessage("Failed to find any playable video url." +
              (rej.unsig ? " All urls are not signed" : ""),
              rej.conf);
            break;
          default:
            this.log("EXCEPTION: unexpected error on changePlayer", rej);
            break;
        }
      });
  }

  errorMessage(msg, conf) {
    var error_container;
    if (this.vp) this.vp.end();
    if (conf) error_container = this.getPlayerContainer(conf);
    if (!error_container)
      error_container =
      document.getElementById("player-unavailable") || document.getElementById("player");
    if (!error_container) return;
    this.vp = new VP(error_container, this.options);
    this.vp.srcs(conf.fmts, FMT_WRAPPER);
    if (conf && conf.isWatch)
      this.vp.containerProps({
        className: " player-height player-width player-api html5-video-player"
      });
    if (conf && conf.isChannel)
      this.vp.containerProps({
        className: " html5-video-player"
      }); //" html5-main-video";
    if (conf && conf.isEmbed) {
      this.vp.containerProps({
        className: " html5-video-player"
      });
    }
    this.vp.containerStyle({
      background: "linear-gradient(to bottom, #383838 0px, #131313 100%) repeat scroll 0% 0% #262626"
    });
    this.vp.error(msg);
  }

  getPlayerContainer(conf) {
    if (conf.isWatch) return document.getElementById("player-container");
    if (conf.isEmbed) return document.body;
    if (conf.isChannel) return document.getElementsByClassName("c4-player")[0];
  }

  getConfig() {
    return new Promise((resolve, reject) => {
      var conf = {};
      conf.isEmbed = location.pathname.startsWith("/embed/");
      conf.isWatch = location.pathname.startsWith("/watch");
      conf.isChannel =
        location.pathname.startsWith("/channel/") || location.pathname.startsWith("/user/");
      conf.withoutCookies = location.hostname.search("youtube-nocookie.com") > -1;
      if (!conf.isEmbed && !conf.isWatch && !conf.isChannel) reject();
      if (conf.isEmbed) {
        conf.id = location.pathname.match(/^\/embed\/([^?#/]*)/)[1];
        conf.className = "html5-video-player";
      } else if (conf.isChannel) {
        const url = document.querySelector("#metadata-container a[href^='/watch?v=']");
        if (!url) reject();
        conf.id = new URL(url).searchParams.get("v");
        if (!conf.id) reject();
        conf.className = "html5-video-player"; //+ " html5-main-video"
      } else {
        conf.id = location.search.slice(1).match(/v=([^/?#]*)/)[1];
        conf.className = "player-width player-height player-api html5-video-player";
      }
      if (!conf.id)
        reject({
          error: "PLAYER_ID_NOT_FOUND",
          conf: conf
        });
      else
        resolve(conf);
    });
  }

  getVideoInfo(conf) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get({
        ccode: ['r', 'r'],
        player: null,
      }, prefs => {
        youtube.getInfo(conf.id)
          .then(info => youtube.extractFormats(info, prefs.ccode))
          .then(info => youtube.verify(info, prefs))
          .then(info => {
            Object.assign(conf, info);
            if (conf.iurlhq) conf.poster = data.iurlhq;
            if (conf.caption_tracks) conf.tracks = this.parse(data.caption_tracks, true);
            const player = document.createElement("video");
            conf.fmts = {};
            conf.formats
              .map(f => Object.assign(f, {
                "type": f.type.replace(/\+/g, ' ')
              }))
              .filter(f => player.canPlayType(f.type) === "probably")
              .forEach(fmt => conf.fmts[fmt.itag] = fmt);
            return conf;
          })
          .then(resolve)
          .catch(reject);
      });
    });

    /* TODO: youtube-nocookie support */
    /*
        if (conf.withoutCookies)
          INFO_URL =
          "https://www.youtube-nocookie.com/get_video_info?html5=1&hl=en_US&el=detailpage&video_id=";
    */
  }

  playNextOnFinish() {
    // Credits to @durazell github.com/lejenome/youtube-html5-player/issues/9
    if (document.getElementsByClassName("playlist-header").length > 0) {
      this.vp.on("ended", function(e) {
        if (this.currentTime !== this.duration || this.options.get("autoNext") === false) return;
        var cur = 0,
          len = 0;
        var current, playlist;
        if ((current = document.getElementsByClassName("currently-playing")).length > 0) {
          cur = parseInt(current[0].dataset["index"]) + 1;
        } else if ((current = document.getElementById("playlist-current-index"))) {
          cur = parseInt(current.textContent);
        }
        if ((playlist = document.getElementsByClassName("playlist-videos-list")).length > 0) {
          len = playlist[0].childElementCount;
        } else if ((playlist = document.getElementById("playlist-length"))) {
          len = parseInt(playlist.textContent);
        }

        if (isNaN(cur) === true || isNaN(len) === true) {
          this.log("Cannot find location in playlist, autoplay failed");
          return;
        }

        if (cur < len) {
          window.location.href = document.getElementsByClassName("yt-uix-scroller-scroll-unit")[cur]
            .getElementsByTagName("a")[0]
            .href;
        }
      });
    }
  }

  parse(data, splitComma) {
    if (splitComma) {
      return data.split(",").map(i => this.parse(i));
    } else {
      var res = {};
      var nv;
      data.split("&").forEach((p) => {
        try {
          nv = p.split("=").map(function(v) {
            return decodeURIComponent(v.replace(/\+/g, " "));
          });
          if (!(nv[0] in res)) res[nv[0]] = nv[1];
        } catch (e) {}
      });
      return res;
    }
  }

  addWebVTT(lang, url, resolve, reject) {
    asyncGet(url).then((data) => {
      var webvtt = "WEBVTT\n\n";
      var XMLParser = new DOMParser();
      var xml = XMLParser.parseFromString(data, "text/xml");
      if (xml.documentElement.nodeName !== "transcript") reject();
      var els = xml.documentElement.childNodes;
      for (var i = 0; i < els.length; i++) {
        var start = els[i].attributes.getNamedItem("start");
        var dur = els[i].attributes.getNamedItem("dur");
        if (start === null || dur === null) continue;
        start = parseFloat(start.value);
        dur = parseFloat(dur.value);
        var s = start % 60;
        var m = (start - s) / 60;
        var tl1 = "" + (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s.toFixed(3);
        s = (start + dur) % 60;
        m = (start + dur - s) / 60;
        var tl2 = "" + (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s.toFixed(3);

        webvtt += (i + 1) + "\n" + tl1 + " --> " + tl2 + "\n" + els[i].textContent + "\n\n";
      }
      resolve("data:text/vtt;base64," +
        btoa(window.unescape(encodeURIComponent(webvtt.replace("&#39;", "'", "g")))));
    });
  }

  getSeek() {
    var seek = 0;
    if (location.search.search("start=") > -1) {
      seek = location.search.match(/start=(\d+)/);
      seek = seek ? parseInt(seek[1]) : 0;
    } else if (location.search.search(/[&?]t=\d/) > -1) {
      seek = location.search.match(/[&?]t=([^&]*)/)[1];
      var h = seek.match(/(\d+)h/);
      var m = seek.match(/(\d+)m/);
      var s = seek.match(/(\d+)s/);
      seek = (h ? parseInt(h[1]) : 0) * 3600 + (m ? parseInt(m[1]) : 0) * 60 +
        (s ? parseInt(s[1]) : 0);
    }
    return seek > 0 ? ("#t=" + seek) : "";
  }
}

new YouTube().start();
