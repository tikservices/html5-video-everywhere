/**
 * @file Options handling and helpers class.
 * @author Moez Bouhlel <bmoez.j@gmail.com>
 * @license MPL-2.0
 * @copyright 2014-2017 Moez Bouhlel
 * @module
 */

/** Video supported formats */
export const Cdc = ["webm", "mp4"];

/** Videos qualities levels defined for the extension */
export const Qlt = ["higher", "high", "medium", "low"];

/** Video track languages */
export const LANGS = [
  "af", "ar", "bn", "de", "en", "es", "fi", "fr", "hi", "id", "is", "it", "ja", "ko", "pt", "ru",
  "tu", "zh",
];


/**
 * Options handling class allowing getting and settings extension global and
 * module special options and provides options depended helpers functions.
 */
class Options {
  /**
   * Create Options instance using the background sent options for global
   * extension and for the specified module.
   * @public
   *
   * @param {!Object} opts - Options object recived from the background script.
   * @param {!string} moduleName - Module unique name.
   */
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

  /**
   * Get the option value.
   * @public
   *
   * @param {!string} opt - Option name.
   *
   * @return {any} Option value.
   */
  get(opt) {
    if (this.opts[opt] !== undefined) {
      return this.opts[opt];
    } else {
      return this.defaults[opt][1];
    }
  }

  /**
   * Set option value. It sets local value and notify the background script of
   * the new value.
   * @public
   *
   * @param {!string} opt - Option name.
   * @param {any} val - Option value.
   */
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

  /**
   * Get all available options values.
   * @public
   *
   * @return {Object.<string, any>} Options object.
   */
  getAll() {
    let opts = {};
    for (const opt of Object.keys(this.opts)) {
      opts[opt] = this.get(opt);
    }
    return opts;
  }

  /**
   * Get volume value.
   * @public
   *
   * @return {float} Volume value.
   */
  getVolume() {
    return this.get("volume") / 100;
  }

  /**
   * Get video autoplay property value. It returns user selected option value
   * else module default value (passed as argument) if the user selected
   * "default" option value.
   * @public
   *
   * @param {?boolean} auto - Module default autoplay value.
   *
   * @return {boolean} Video autoplay property value.
   */
  isAutoPlay(auto = false) {
    return (this.get("autoplay") === 1 || auto === true) && this.get("autoplay") !== 0;
  }

  /**
   * Get video preload property value. It return user selected option value
   * else module default value (passed as argument) if the user seleced
   * "default" option value.
   *
   * @param {?boolean} auto - Module default preload value.
   *
   * @return {string} Video preload property value.
   */
  getPreload(auto = false) {
    return ((this.get("preload") === 1 || auto === true) && this.get("preload") !== 0) ? "auto" : "metadata";
  }

  /**
   * Get video loop property value. It returns user selected option value
   * else module default value (passed as argument) if the user selected
   * "default" option value.
   * @public
   *
   * @param {?boolean} lp - Module default loop value.
   *
   * @return {boolean} Video loop property value.
   */
  isLoop(lp = false) {
    return (this.get("loop") === "1" || lp) && this.get("loop") !== 0;
  }

  /**
   * Check if the current module is disabled (by user on options page).
   * @public
   *
   * @return {boolean} Is the module disabled.
   */
  isDisabled() {
    return this.get("disable" + this.moduleName);
  }

  /**
   * Get installed extension version.
   * @public
   *
   * @return {string} Extension current version.
   */
  getVersion() {
    return chrome.runtime.getManifest()["version"];
  }

  /**
   * Get installed extension id string defined on manifest.json file.
   * @public
   *
   * @return {string} Extension id string.
   */
  getId() {
    return chrome.runtime.id;
  }

  /**
   * Get user selected track language to download and show.
   *
   * @return {string} Track language if any selected by user else undefined.
   */
  getLang() {
    let lang = this.get("lang");
    if (lang > 0) {
      return LANGS[lang];
    } else {
      return undefined;
    }
  }
}

export default Options;
