/**
 * @file Dailymotion.com website support module.
 * @author Moez Bouhlel <bmoez.j@gmail.com>
 * @license MPL-2.0
 * @copyright 2014-2017 Moez Bouhlel
 */

import Module from './Module.js';
import VP from './video-player.js';

class Dailymotion extends Module {
  constructor() {
    super("dailymotion");
  }
  onInteractive() {
    this.log("onInteractive()");

    // VIDEO_ID = location.pathname.match(/\/embed\/video\/([^_]+)/)[1];
    // asyncGet
    // http://www.dailymotion.com/json/video/<VIDEO_ID>?fields=stream_audio_url,stream_h264_hd1080_url,stream_h264_hd_url,stream_h264_hq_url,stream_h264_ld_url,stream_h264_url,stream_hls_url,stream_live_hls_url,thumbnail_120_url,thumbnail_240_url,thumbnail_url
    // returns a json
    let urls = {};
    let poster;
    if (window.wrappedJSObject.config) {
      urls = window.wrappedJSObject.config.metadata.qualities;
      poster = window.wrappedJSObject.config.metadata.poster_url;
    }
    /*
    else {
      let streams_r = /"stream_h264[^"]*_url":"[^"]*"/g;
      let url_r     = /"(stream_h264[^"]*_url)":"([^"]*)"/;
      let streams   = document.body.innerHTML.match(streams_r);
      streams.forEach(u => {
        let r      = u.match(url_r);
        urls[r[1]] = r[2].replace("\\/", "/", "g");
      });
      poster =
          (document.body.innerHTML.match(/"thumbnail_url":"([^"]*)"/) || [ "", "" ])[1].replace(
              "\\/", "/", "g");
      }
      */
    let videoContainer;
    if (window.location.pathname.startsWith("/video/")) {
      videoContainer = document.getElementsByClassName("player-container")[0];
    } else {
      videoContainer = document.body;
    }
    let vp = new VP(videoContainer, this.options);
    vp.srcs(this.getSrcs(urls));
    /*
      urls, {
      // stream_h264_hd1080_url
      "higher/mp4" : "stream_h264_hd_url", // H264 1280x720
      "high/mp4" : "stream_h264_hq_url",   // H264 848x480
      "medium/mp4" : "stream_h264_url",    // H264 512x384
      "low/mp4" : "stream_h264_ld_url"     // H264 320x240
    });
    */
    vp.props({
      controls: true,
      autoplay: this.options.isAutoPlay(),
      preload: this.options.getPreload(),
      loop: this.options.isLoop(),
      poster: poster,
    });
    vp.style({
      width: "100%",
      height: "100%",
    });
    vp.setup();
  }

  getSrcs(qualities) {
    let fmts = {};
    for (const [id,
        fmt,
      ] of [
        ["144", "low/mp4"], // 176x144; 144 is fallback low quality if no 240
        ["240", "low/mp4"], // 320x240
        ["380", "medium/mp4"], // 512x384
        ["480", "high/mp4"], // 848x480
        ["720", "higher/mp4"], // 1280x720; 720 is fallback quality if no 1080
        ["1080", "higher/mp4"], // 1920x1080
      ]) {
      if (qualities[id]) {
        const videos = Array.filter(qualities[id], (q) => q["type"] === "video/mp4");
        if (videos.length === 1) fmts[fmt] = videos[0].url;
      }
    }
    return fmts;
  }
}

new Dailymotion().start();
