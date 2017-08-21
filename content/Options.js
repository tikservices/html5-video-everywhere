"use static";

if (typeof browser === "undefined")
  var browser = chrome;

const Cdc = ["webm", "mp4"];
const Qlt = ["higher", "high", "medium", "low"];
const LANGS = [
  "af", "ar", "bn", "de", "en", "es", "fi", "fr", "hi", "id", "is", "it", "ja", "ko", "pt", "ru",
  "tu", "zh"
];

class Options {
  constructor(opts, moduleName) {
    this.opts = opts;
    this.moduleName = moduleName;
    this.defaults = {
      autoNext: ["boolean", true],
      genYTSign: ["boolean", true],
      lang: ["integer", 0],
      prefCdc: ["integer", 0],
      prefQlt: ["integer", 2],
      autoplay: ["integer", 2],
      preload: ["integer", 2],
      loop: ["integer", 2],
      volume: ["integer", 100],
      disableyoutube: ["boolean", false],
      disablevimeo: ["boolean", false],
      disablefacebook: ["boolean", false],
      disabledailymotion: ["boolean", false],
      disablebreak: ["boolean", false],
      disablemetacafe: ["boolean", false],
      disablelego: ["boolean", false],
      uuid: ["string", ""],
    };
  }

  get(opt) {
    const val = this.opts[opt] !== undefined ? this.opts[opt] : this.defaults[opt][1];
    /* // Already converted on set()
    switch (this.defaults[opt][0]) {
    case "boolean":
      return Boolean(val);
    case "integer":
      return parseInt(val);
    case "float":
      return parseFloat(val);
    case "string":
      return String(val);
    }*/
    return val;
  }
  set(opt, val) {
    switch (this.defaults[opt][0]) {
      case "boolean":
        val = Boolean(val);
        break;
      case "integer":
        val = parseInt(val);
        break;
      case "float":
        val = parseFloat(val);
        break;
      case "string":
        val = String(val);
        break;
    }
    this.opts[opt] = val;
    this.postSet(opt, val);
  }
  postSet(opt, val) {
    // TODO: override
  }
  getAll() {
    let opts = {};
    for (const opt of Object.keys(this.opts))
      opts[opt] = this.get(opt);
    return opts;
  }

  getVolume() {
    return this.get("volume") / 100;
  }
  isAutoPlay(auto = false) {
    return (this.get("autoplay") === 1 || auto === true) && this.get("autoplay") !== 0;
  }
  getPreload(auto = false) {
    return ((this.get("preload") === 1 || auto === true) && this.get("preload") !== 0) ? "auto" : "metadata";
  }
  isLoop(lp = false) {
    return (this.get("loop") === "1" || lp) && this.get("loop") !== 0;
  }
  isDisabled() {
    return this.get("disable" + this.moduleName);
  }
  getVersion() {
    return browser.runtime.getManifest()["version"];
  }
  getId() {
    return browser.runtime.id;
  }
  getLang() {
    let lang = this.get("lang");
    if (lang > 0)
      return LANGS[lang];
    else
      return undefined;
  }
}
