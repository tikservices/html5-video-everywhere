/**
 * YouTube website support module.
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
  youtube,
} from '../vendor/iaextractor/youtube.js';

/* Map YouTube videos codes to the extension quality/format representation */
const FMT_WRAPPER = {
  "high/mp4": "22",
  "medium/mp4": "18",
  "medium/webm": "43",
};

/**
 * YouTube website support.
 *
 * URLs support:
 * - [x] `www.youtube.com/watch?v=<VIDEO_ID>`
 * - [x] `www.youtube.com/embed/<VIDEO_ID>`
 * - [x] `www.youtube.com/channel/<CHANNEL_ID>`
 * - [x] `www.youtube.com/user/<USER_ID>`
 * - [ ] `www.youtube.com/apiplayer?video_id=<VIDEO_ID>&version=3`
 * - [ ] `www.youtube.com/embed?listType=playlist&list=PL<PLAYLIST_ID>`
 * - [ ] `www.youtube.com/embed?listType=user_uploads&list=<USERNAME>`
 * - [ ] `www.youtube.com/embed?listType=search&list=<QUERY>`
 *
 * Special URLs (or parent URLs):
 *
 * - [x] `https://www.youtube.com/video_masthead?video_id=<VIDEO_ID>`
 *
 *   YouTube Ads iframe that embed YouTube video. It causes a other background
 *   sound and we shouldnot auto play the video (and no sound too). We ignore
 *   the support for embed YouTube video inside this iframe for now.
 *
 * URL query params:
 * - [x] autoplay: 1, 0
 * - [ ] autohide: 0, 1, 2
 * - [ ] color
 * - [ ] controls: 0, 1, 2
 * - [ ] enablejsapi: 0, 1
 * - [ ] end
 * - [ ] fs 0,1
 * - [x] loop: 0, 1
 * - [ ] playlist
 * - [x] start: \d+
 *
 *   Seek n seconds before playing the video
 *
 * - [x] t: (\d+)h(\d+)m(\d+)s
 *
 *   Seeks n hours, n minutes and n secods before playing the video
 *
 * - [ ] wmode: opaque,
 * - [ ] modestbranding: 1,
 * - [ ] adformat: 1_8,
 *
 *   This query is used if video is embed inside YouTube Ads iframe. For now,
 *   we ignore support for this videos loaded with this query param.
 *
 * - [ ] iv_load_policy: 3,
 * - [ ] nologo: 1,
 * - [ ] mute: 1,
 * - [ ] rel: 0,
 * - [ ] showinfo 0,
 *
 * Other:
 * - [Milestone](https://github.com/lejenome/html5-video-everywhere/milestones/YouTube%20Support)
 *
 * @external
 */
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
      .then((conf) => {
        /* pause yt video player asap */
        const playerContainer = this.getPlayerContainer(conf);
        if (playerContainer) {
          for (const video of [...playerContainer.getElementsByTagName("video")]) {
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
          let playerContainer = this.getPlayerContainer(conf);
          if (!playerContainer) {
            this.log("Container not found", conf);
            return;
          }
          /* find youtube created video player(s) and always kill their src */
          const ytVideos = playerContainer.getElementsByTagName("video");
          (function(killVideo) {
            for (const video of [...ytVideos]) {
              killVideo(video);
              video.onplaying = () => killVideo(video);
              // video.onloadstart = _ => killVideo(video);
            }
          })(function(video) {
            console.log("KILLING VIDEO");
            video.pause();
            video.volume = 0;
            video.currentTime = 0;
            video.srcObject = null;
          });
          if (!conf.isEmbed) {
            /* append our container beside YT video container, so we does not
             * lose control of yt video player on video change */
            let newContainer = document.createElement("div");
            playerContainer.parentElement.appendChild(newContainer);
            playerContainer.hidden = true;
            playerContainer = newContainer;
            playerContainer.id = "player-container";
          }
          let scripts = playerContainer.getElementsByTagName("script");
          for (let script of scripts) {
            playerContainer.parentElement.appendChild(script);
          }
          const seek = this.getSeek();
          this.vp = new VP(playerContainer, this.options);
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
            let o = conf.tracks.find((i) => i.lc === lang);
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
            if (rej.data.reason) {
              this.errorMessage("Failed to load video url with the following error message: " +
                rej.data.reason,
                rej.conf);
            }
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
    let errContainer;
    if (this.vp) this.vp.end();
    if (conf) errContainer = this.getPlayerContainer(conf);
    if (!errContainer) {
      errContainer =
        document.getElementById("player-unavailable") || document.getElementById("player");
    }
    if (!errContainer) return;
    this.vp = new VP(errContainer, this.options);
    this.vp.srcs(conf.fmts, FMT_WRAPPER);
    if (conf && conf.isWatch) {
      this.vp.containerProps({
        className: " player-height player-width player-api html5-video-player",
      });
    }
    if (conf && conf.isChannel) {
      this.vp.containerProps({
        className: " html5-video-player",
      }); // " html5-main-video";
    }
    if (conf && conf.isEmbed) {
      this.vp.containerProps({
        className: " html5-video-player",
      });
    }
    this.vp.containerStyle({
      background: "linear-gradient(to bottom, #383838 0px, #131313 100%) repeat scroll 0% 0% #262626",
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
      let conf = {};
      conf.url = new URL(location);
      conf.isEmbed = conf.url.pathname.startsWith("/embed/");
      conf.isWatch = conf.url.pathname.startsWith("/watch");
      conf.isChannel =
        conf.url.pathname.startsWith("/channel/") || conf.url.pathname.startsWith("/user/");
      conf.withoutCookies = conf.url.hostname.endsWith("youtube-nocookie.com");
      if (!conf.isEmbed && !conf.isWatch && !conf.isChannel) reject();
      if (conf.isEmbed && conf.url.searchParams.has("adformat")) reject();
      try {
        if (conf.isEmbed && window.parent &&
          window.parent.location.pathname === "/video_masthead" &&
          window.parent.location.hostname.endsWith("youtube.com")) {
          reject();
        }
      } catch (e) { /* Cross-origin permission denied error */ }
      if (conf.isEmbed) {
        conf.id = conf.url.pathname.match(/^\/embed\/([^?#/]*)/)[1];
        conf.className = "html5-video-player";
      } else if (conf.isChannel) {
        const url = document.querySelector("#metadata-container a[href^='/watch?v=']");
        if (!url) reject();
        conf.id = conf.url.searchParams.get("v");
        if (!conf.id) reject();
        conf.className = "html5-video-player"; // + " html5-main-video"
      } else {
        conf.id = conf.url.searchParams.get("v");
        conf.className = "player-width player-height player-api html5-video-player";
      }
      if (!conf.id) {
        reject({
          error: "PLAYER_ID_NOT_FOUND",
          conf: conf,
        });
      } else {
        resolve(conf);
      }
    });
  }

  getVideoInfo(conf) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get({
        ccode: ['r', 'r'],
        player: null,
      }, (prefs) => {
        youtube.getInfo(conf.id)
          .then((info) => youtube.extractFormats(info, prefs.ccode))
          .then((info) => youtube.verify(info, prefs))
          .then((info) => {
            Object.assign(conf, info);
            if (conf.iurlhq) conf.poster = conf.iurlhq;
            if (conf.caption_tracks) conf.tracks = this.parse(conf.caption_tracks, true);
            const player = document.createElement("video");
            conf.fmts = {};
            conf.formats
              .filter((f) => f.type && !f.dash) // Only elements with type (not dash)
              .map((f) => Object.assign(f, {
                "type": f.type.replace(/\+/g, ' '),
              }))
              .filter((f) => player.canPlayType(f.type) === "probably")
              .forEach((fmt) => conf.fmts[fmt.itag] = fmt);
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
      this.vp.on("ended", (e) => {
        let el = e.target;
        if (el.currentTime !== el.duration || this.options.get("autoNext") === false) return;
        let cur = 0;
        let len = 0;
        let current;
        let playlist;
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
      return data.split(",").map((i) => this.parse(i));
    } else {
      let res = {};
      let nv;
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
      let webvtt = "WEBVTT\n\n";
      let XMLParser = new DOMParser();
      let xml = XMLParser.parseFromString(data, "text/xml");
      if (xml.documentElement.nodeName !== "transcript") reject();
      let els = xml.documentElement.childNodes;
      for (let i = 0; i < els.length; i++) {
        let start = els[i].attributes.getNamedItem("start");
        let dur = els[i].attributes.getNamedItem("dur");
        if (start === null || dur === null) continue;
        start = parseFloat(start.value);
        dur = parseFloat(dur.value);
        let s = start % 60;
        let m = (start - s) / 60;
        let tl1 = "" + (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s.toFixed(3);
        s = (start + dur) % 60;
        m = (start + dur - s) / 60;
        let tl2 = "" + (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s.toFixed(3);

        webvtt += (i + 1) + "\n" + tl1 + " --> " + tl2 + "\n" + els[i].textContent + "\n\n";
      }
      resolve("data:text/vtt;base64," +
        btoa(window.unescape(encodeURIComponent(webvtt.replace("&#39;", "'", "g")))));
    });
  }

  getSeek() {
    let seek = 0;
    if (location.search.search("start=") > -1) {
      seek = location.search.match(/start=(\d+)/);
      seek = seek ? parseInt(seek[1]) : 0;
    } else if (location.search.search(/[&?]t=\d/) > -1) {
      seek = location.search.match(/[&?]t=([^&]*)/)[1];
      let h = seek.match(/(\d+)h/);
      let m = seek.match(/(\d+)m/);
      let s = seek.match(/(\d+)s/);
      seek = (h ? parseInt(h[1]) : 0) * 3600 + (m ? parseInt(m[1]) : 0) * 60 +
        (s ? parseInt(s[1]) : 0);
    }
    return seek > 0 ? ("#t=" + seek) : "";
  }
}

new YouTube().start();
