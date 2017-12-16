/**
 * Statics collection.
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
 * @author Moez Bouhlel <bmoez.j@gmail.com>
 * @license MPL-2.0
 * @copyright 2014-2017 Moez Bouhlel
 */

/**
 * Log module injection (usage).
 *
 * @private
 * @param {String} moduleName - The name of module injected.
 */
export function logInject(moduleName) {
  const extVer = chrome.runtime.getManifest()["version"];
  chrome.storage.local.get("statics", function(data) {
    const statics = data["statics"] || {};
    if (!statics["ext:version"]) {
      // The ext was installed/excuted for the first time, log the install.
      statics["ext:version"] = extVer;
      logInstall(extVer);
    } else if (statics["ext:version"] != extVer) {
      // The ext was updated, sync statics for old version and log the update.
      syncInjects(statics, statics["ext:version"]);
      logUpdate(statics["ext:version"], extVer);
      statics["ext:version"] = extVer;
    }
    const counterName = "inject:" + moduleName;
    statics[counterName] = (statics[counterName] || 0) + 1;
    chrome.storage.local.set({
      "statics": statics,
    });
  });
}

/**
 * Send collected statics to the server.
 *
 * @private
 * @param {Object} statics - Statics matrix.
 * @param {String} extVer - The extension version for collected statics.
 */
function syncInjects(statics, extVer) {
  // If Do Not Tract is activated (or an ad block is installed), skip report
  if (navigator.doNotTrack === "1") {
    return;
  }
  const injectCounters = Object.keys(statics)
    .filter((s) => s.startsWith("inject:") && s.length > 7);
  for (const counterName of injectCounters) {
    const moduleName = counterName.substring(7);
    const cnt = statics[counterName];
    if (cnt > 0) {
      syncModuleInject(moduleName, cnt, extVer);
      statics[counterName] = 0;
    }
  }
}

function syncModuleInject(moduleName, cnt, extVer) {
  const url = new URL("https://api.admin.tik.tn/h5vew/r");
  const params = url.searchParams;
  params.set("idsite", 8);
  params.set("rec", 1);
  params.set("url", "moz-extension://" + chrome.runtime.id + "/content/" + moduleName + ".js");
  params.set("action_name", "inject / " + moduleName);
  params.set("send_image", 0);
  params.set("_idvc", cnt);
  params.set("new_visit", 1);
  params.set("e_c", "content-page");
  params.set("e_a", "inject");
  params.set("e_n", moduleName);
  params.set("_cvar", JSON.stringify({
    "1": ["version", extVer],
  }));

  fetch(url);
}

function logUpdate(oldVersion, extVer) {
  const url = new URL("https://api.admin.tik.tn/h5vew/r");
  const params = url.searchParams;
  params.set("idsite", 8);
  params.set("rec", 1);
  params.set("action_name", "update / " + extVer);
  params.set("send_image", 0);
  params.set("e_c", "extension");
  params.set("e_a", "update");
  params.set("e_n", extVer);
  params.set("_cvar", JSON.stringify({
    "1": ["version", extVer],
  }));

  fetch(url);
}

function logInstall(extVer) {
  const url = new URL("https://api.admin.tik.tn/h5vew/r");
  const params = url.searchParams;
  params.set("idsite", 8);
  params.set("rec", 1);
  params.set("action_name", "install / " + extVer);
  params.set("send_image", 0);
  params.set("e_c", "extension");
  params.set("e_a", "install");
  params.set("e_n", extVer);
  params.set("_cvar", JSON.stringify({
    "1": ["version", extVer],
  }));

  fetch(url);
}
