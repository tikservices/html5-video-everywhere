/**
 * User geolocation reporting.
 * @author Moez Bouhlel <bmoez.j@gmail.com>
 * @license MPL-2.0
 * @copyright 2014-2017 Moez Bouhlel
 */

/**
 * Report user geolocation to Google Analytics.
 * @private
 *
 * @param {Options} options - Options instance for the current module.
 */
export function reportGeolocation(options) {
  // If Do Not Tract is activated (or an ad block is installed), skip report
  if (navigator.doNotTrack === "1") {
    return;
  }

  let data = "";
  let manifest = chrome.runtime.getManifest();
  data = data.concat("v", "=", encodeURIComponent(1));
  // Google Analytics id.
  data = data.concat("&", "tid", "=", encodeURIComponent("UA-28759938-4"));
  // data = data.concat("&", "cid", "=", encodeURIComponent(OPTIONS.uuid));
  data = data.concat("&", "t", "=", encodeURIComponent("event"));
  data = data.concat("&", "ec", "=", encodeURIComponent("content-page"));
  data = data.concat("&", "ea", "=", encodeURIComponent("inject"));
  data = data.concat("&", "el", "=", encodeURIComponent(options.moduleName));
  data = data.concat("&", "dh", "=", encodeURIComponent("localhost"));
  // Report current module as a visited URL "/<module_name>"
  data = data.concat("&", "dp", "=", encodeURIComponent("/" + options.moduleName));
  // Report the extension (name, id, version) as an app
  data = data.concat("&", "ds", "=", encodeURIComponent("app"));
  data = data.concat("&", "an", "=", encodeURIComponent(manifest.name));
  data = data.concat("&", "aid", "=", encodeURIComponent(options.getId()));
  data = data.concat("&", "av", "=", encodeURIComponent(manifest.version));
  // Report browser current language
  data = data.concat("&", "ul", "=", encodeURIComponent(navigator.language));

  /*
   * fetch on firefox WebExtension is executed on background-script. getFetch()
   * returns document script fetch function in Firefox.
   */
  function getFetch() {
    try {
      // eslint-disable-next-line new-cap
      return XPCNativeWrapper(window.wrappedJSObject.fetch);
    } catch (evt) {
      // We are running on Google Chrome, just return content-script fetch
      return fetch;
    }
  };

  // FIXME
  getFetch()("https://www.google-analytics.com/collect", {
    method: "POST",
    body: data,
  });
}
