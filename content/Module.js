/**
 * Modules parent class.
 * @author Moez Bouhlel <bmoez.j@gmail.com>
 * @license MPL-2.0
 * @copyright 2014-2017 Moez Bouhlel
 * @module
 */

import Options from './Options.js';
import {
  reportGeolocation,
} from './report-geolocation.js';

/**
 * Base class for all modules used to support websites.
 *
 * A module is a content-script executed on a website to replace its custom
 * video player with the browser native HTML5 video player. This class abstract
 * module/backgroun-script messages/options handling.
 */
class Module {
  /**
   * Define module unique name.
   * @public
   *
   * @param {!string} name - Module unique name.
   */
  constructor(name /* , redirect = [], block = []*/ ) {
    /**
     * The unique name of module.
     * @member {string}
     */
    this.name = name;
    /*
    this.redirect = redirect;
    this.block = block;
    */

    /**
     * The webExtension port to communicate with the background script.
     * @member {chrome.runtime.Port}
     */
    this.port = chrome.runtime.connect({
      "name": "h5vew",
    });
    this.port.postMessage({
      "type": "inject",
      "module": this.name,
    });
    /**
     * Mapping of event and its handlers.
     * @member {Object.<string, Array.<Function>>}
     * @see {@link addMessageListener} for how to add event listener.
     */
    this.messageListeners = {};
    this.port.onMessage.addListener((msg) => this.onMessage(msg));
  }

  /**
   * The module routine execution function. It ensures module options has been
   * recived from the background script and execute module functions
   * (onLoading, onInteractive, onComplete).
   * Ensure to call this function at the end of module file the following way:
   *
   * @example <caption>A example of starting a website module.</caption>
   * new ChildModuleX().start();
   *
   * @public
   */
  start() {
    this.log("start()");
    if (this.options && !this.options.isDisabled()) {
      new Promise((resolve, reject) => resolve(this.onLoading()))
        .then(() => new Promise((resolve, reject) => {
          if (document.readyState != "loading") {
            resolve(this.onInteractive());
          } else {
            document.addEventListener("DOMContentLoaded", () => {
              resolve(this.onInteractive());
            });
          }
        }))
        .then(() => {
          if (document.readyState === "complete") {
            this.onComplete();
          } else {
            document.addEventListener("load", () => this.onComplete());
          }
          reportGeolocation(this.options);
        })
        .catch((err) => this.log("Error start():", err));
    } else if (!this.options) {
      this.addMessageListener("options", (msg) => this.start());
    } else { // this.options.isDisabled()
      this.log("Module disabled. Exitings.");
      return;
    }
  }

  /**
   * Module code to execute when page loading starts (before DOM tree is ready)
   * @abstract
   */
  onLoading() {
    this.log("onLoading()");
  }

  /**
   * Module code to execute when DOM tree is ready but other resources are
   * still loading
   * @abstract
   */
  onInteractive() {
    this.log("onInteractive()");
  }

  /**
   * Module code to execute after full page is loaded (DOM ready and other
   * resources are loaded)
   * @abstract
   */
  onComplete() {
    this.log("onComplete()");
  }

  /**
   * Event handler for new messages send from the background script. It mainly
   * execute registered event handlers for the message type.
   * @private
   *
   * @param {!Object} msg - Message send from the background script containing
   *                        at least the 'type' field.
   */
  onMessage(msg) {
    this.log("Message", msg);
    switch (msg.type) {
      case "options":
        /**
         * Options instance of this module to get/set extension general options
         * and module special options.
         * @member {Options}
         */
        this.options = new Options(msg.options, this.name);
        break;
      default:
        break;
    }
    for (const fn of (this.messageListeners[msg.type] || [])) {
      fn(msg);
    }
  }

  /**
   * Register a callback function to execute when a message with provided type
   * has been recived from the background script.
   * @public
   *
   * @param {!string} type - The type of message to handle.
   * @param {!function} fn - The callback function to execute when a message
   *                         with provided type is recived.
   */
  addMessageListener(type, fn) {
    this.log("Add msg listener:", type);
    if (!this.messageListeners[type]) {
      this.messageListeners[type] = [];
    }
    this.messageListeners[type].push(fn);
  }
  onOptionChange(opt, val) {}

  getOption(opt) {}

  async setOption(opt, val) {}

  /**
   * Log a message to the console if debug mode is enabled.
   * @public
   *
   * @param {...string} args - Strings to print on the debug message.
   */
  log(...args) {
    console.log("[h5vew:" + this.name + "]", ...args);
  }
}

export default Module;
