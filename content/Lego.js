/**
 * @file Lego.com website support website.
 * @author Moez Bouhlel <bmoez.j@gmail.com>
 * @contributor DoomTay
 * @license MPL-2.0
 * @copyright 2014-2017 Moez Bouhlel
 */

import Module from './Module.js';
import VP from './video-player.js';

/**
 * Lego website support.
 * Lego does host its video player within and iframe.
 *
 * Video informations are available as a json valid text on `video` attribute
 * of a div tag. Let's called the parsed object `data` for the rest of the
 * documentation.
 *
 * Videos url can be generated as follow:
 * - `data-video-progressive-url` attribute of the document element
 * - append `public/`
 * - append 2 first chars from `data.ItemId` + `/` + the next 2 chars if
 *   `data.NetStoragePath` is not set
 * - append `data.NetStoragePath` if set.
 * - append `/`
 * - append `data.ItemId` + `_`
 * - append `data.VideoId` + `_`
 * - append `data.Locale` + `_`
 * - append `data.VideoVersion` + `_`
 * - append quality number (256, 512, 1024, 1536, 2560)
 * - append type extension (.mp4 or .webm)
 *
 * Video poster image is available on `data.CoverImageUrl`.
 *
 * URLs support:
 * - [x] `http[s]?://www.lego.com/<LANG_ISO_CODE>/mediaplayer/video/<VIDEO>`
 *
 * @external
 */
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
