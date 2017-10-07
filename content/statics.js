/**
 * Statics collection.
 * @author Moez Bouhlel <bmoez.j@gmail.com>
 * @license MPL-2.0
 * @copyright 2014-2017 Moez Bouhlel
 */

/**
 * Report modules usage statics to a self-hosted piwik only if user has
 * deactivated doNotTrack preference of Firefox browser.
 *
 * It was initially sending statics into Google Analytics. But for privacy
 * reasons and as we do not trust 3rd-party solutions providers (Google),
 * Statics are now being sent to a self-hosted piwik server which is used only
 * by us to understand how the extension is being used (which version is most
 * used, which browser is being used, which browser version is being used,
 * what are our users languages, ...). This collected statics are being used to
 * take better decisions like when to use new ES.next features and
 * WebExtensions API to use (based on browsers versions statics), what modules
 * to deprecate (based on modules statics), what languages to support (based
 * on users browser default lang).
 *
 * If you are concerned about your privacy or for more details, please visit
 * https://github.com/lejenome/html5-video-everywhere/issues/85
 *
 * @private
 * @param {Options} options - Options instance for the current module.
 */
export function sendStatics(options) {
  // If Do Not Tract is activated (or an ad block is installed), skip report
  if (navigator.doNotTrack === "1") {
    return;
  }

  const manifest = chrome.runtime.getManifest();
  const url = new URL("https://api.admin.tik.tn/h5vew/r");
  const params = url.searchParams;
  params.set("idsite", 8);
  params.set("rec", 1);
  params.set("url", "moz-extension://" + options.getId() + "/content/" + options.moduleName + ".js");
  params.set("action_name", "inject / " + options.moduleName);
  params.set("send_image", 0);
  // params.set("_idvc", Number of Visits ++);  // TODO
  // params.set("new_visit", 1);
  params.set("e_c", "content-page");
  params.set("e_a", "inject");
  params.set("e_n", options.moduleName);
  params.set("_cvar", JSON.stringify({
    "1": ["version", manifest.version],
  }));

  fetch(url);
}
