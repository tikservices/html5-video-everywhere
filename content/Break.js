/**
 * Break.com website support module.
 * @author Moez Bouhlel <bmoez.j@gmail.com>
 * @license MPL-2.0
 * @copyright 2014-2017 Moez Bouhlel
 */

import Module from './Module.js';
import VP from './video-player.js';

/**
 * Break.com website support.
 * Break does host its video player within an iframe. It also embeds videos
 * from YouTube (and an other source?).
 * In case video is self-hosted (in iframe), configurations are available on
 * embedVars object.
 * Videos url are avaialbe on:
 *
 * ```
 * embedVars.media[{
 *   url, // Absolute url to the video,
 *   height, // height of video on pixels
 *   width, // width of video on pixels
 *   mediaPurpose, // equals to "play" in our case
 * }]
 * ```
 *
 * Video poster image is available on `embedVars.thumbUri`
 *
 * URLs support:
 * - [x] `http[s]?://www.break.com/embed/<VIDEO_ID>`
 *
 * Other:
 * - [Milestone](https://github.com/lejenome/html5-video-everywhere/milestones/Break%20Support)
 *
 * @external
 */
class Break extends Module {
  constructor() {
    super("break");
  }

  onInteractive() {
    this.log("onInteractive()");
    let vp = new VP(document.body, this.options);
    vp.srcs(this.getSrcs());
    rmChildren(document.head);
    vp.props({
      controls: true,
      autoplay: this.options.isAutoPlay(true),
      preload: this.options.getPreload(),
      loop: this.options.isLoop(),
      poster: window.wrappedJSObject.embedVars.thumbUri,
    });
    vp.style({
      width: "100%",
      height: "100%",
    });
    vp.setup();
  }

  fallback() {
    // Just fallback method if the first one didn't work
    let urlRegex = /"videoUri":\s*"([^"]*)"/;
    let url = (document.head.innerHTML.match(urlRegex) || ["", ""])[1];
    return url;
  }

  getSrcs() {
    let fmts = {};
    const maps = [
      ["1280x720", "higher/mp4"],
      ["848x480", "high/mp4"],
      ["640x360", "medium/mp4"],
      ["426x240", "low/mp4"], // fallback if no 301x232
      ["301x232", "low/mp4"],
    ];
    let srcs = {};
    Array.forEach(window.wrappedJSObject.embedVars.media, (v) => {
      if (v.mediaPurpose === "play") srcs[v.width + "x" + v.height] = v.uri;
    });
    for (const [q, fmt] of maps) {
      if (srcs[q]) fmts[fmt] = srcs[q];
    }
    return fmts;
  }
}
new Break().start();
