/**
 * @file Lego.com website support website.
 * @author Moez Bouhlel <bmoez.j@gmail.com>
 * @license MPL-2.0
 * @copyright 2014-2017 Moez Bouhlel
 */
import Module from './Module.js';
import VP from './video-player.js';

// Based on DoomTay spinnet
// URL: https://github.com/lejenome/html5-video-everywhere/issues/89

class Lego extends Module {
  constructor() {
    super("lego");
  }

  onInteractive() {
    const data = JSON.parse(document.querySelector("div[video]").getAttribute("video"));
    const BASE_URL =
      document.documentElement.getAttribute("data-video-progressive-url") + "public/";

    let url = "";

    if (!data.NetStoragePath) {
      url = BASE_URL + data.ItemId.substr(0, 2) + "/" + data.ItemId.substr(2, 2) + "/" + [data.ItemId, data.VideoId, data.Locale, data.VideoVersion].join("_");
    } else {
      url = BASE_URL + data.NetStoragePath + "/" + [data.ItemId, data.VideoId, data.Locale, data.VideoVersion].join("_");
    }

    let container = document.querySelector("div.video-wrapper");

    let vp = new VP(container, this.options);

    for (const type of ["mp4", "webm"]) {
      for (const [quality, qualityLevel] of [
          [2560, "higher"],
          [1536, "high"],
          [1024, "medium"],
          // [512, "low"],
          [256, "low"],
        ]) {
        vp.addSrc(url + "_" + quality + "." + type, qualityLevel, type);
      }
    }
    vp.props({
      autoplay: this.options.isAutoPlay(data.AutoPlay),
      preload: this.options.getPreload(),
      loop: this.options.isLoop(),
      controls: true,
      poster: data.CoverImageUrl,
    });
    vp.style({
      width: "100%",
      height: "100%",
      backgroundColor: "black",
    });
    vp.setup();
  }
}

new Lego().start();
