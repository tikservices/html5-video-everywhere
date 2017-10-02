/**
 * @file Metacafe website support module.
 * @author Moez Bouhlel <bmoez.j@gmail.com>
 * @license MPL-2.0
 * @copyright 2014-2017 Moez Bouhlel
 */

import Module from './Module.js';
import VP from './video-player.js';
import {
  asyncGet
} from './common.js';

class Metacafe extends Module {
  constructor() {
    super("metacafe");
  }

  onInteractive() {
    if (window.location.pathname.startsWith("/watch/")) {
      this.watchPage();
    } else if (/[^\/]+\/?$/.test(location.pathname)) {
      this.channelPage();
    }
  }

  watchPage() {
    let data;
    if (document.getElementById("json_video_data")) {
      data = JSON.parse(document.getElementById("json_video_data").textContent);
    }
    if (!data) return;
    let url = data.sources[0].src;
    let container = document.getElementsByClassName("mc-player");
    if (container.length === 0) return;
    container = container[0];
    let vp = new VP(container, this.options);
    vp.addSrc(url, "medium", "mp4");
    vp.props({
      autoplay: this.options.isAutoPlay(true),
      preload: this.options.getPreload(),
      loop: this.options.isLoop(),
      controls: true,
    });
    vp.style({
      width: "100%",
    });
    vp.setup();
  }

  channelPage() {
    let embed = document.getElementsByTagName("embed");
    if (!embed) return;
    embed = embed[0];
    let page = embed.src;
    page = page.replace("/fplayer/", "/watch/").replace(/.swf$/, "");
    asyncGet(page).then((data) => {
      let url = this.getURL(data);
      let container = document.getElementById("ItemContainer");
      // let container = embed.parentElement;
      let vp = new VP(container);
      vp.addSrc(url, "medium", "mp4");
      vp.props({
        autoplay: this.options.isAutoPlay(false),
        preload: this.options.getPreload(),
        loop: this.options.isLoop(),
        controls: true,
      });
      vp.style({
        width: "100%",
      });
      vp.setup();
    });
  }

  getURL(e) {
    let data = decodeURIComponent(e.match(/&mediaData=([^&]*)&/)[1]);
    return JSON.parse(data).MP4.mediaURL;
  }
}

// new Metacafe().start(); // FIXME: needs HLS support
