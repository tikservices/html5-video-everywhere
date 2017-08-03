"use strict";

function reportGeolocation(options) {
  let data = "";
  let manifest = browser.runtime.getManifiest();
  data = data.concat("v", "=", encodeURIComponent(1));
  data = data.concat("&", "tid", "=", encodeURIComponent("UA-28759938-4"));
  // data = data.concat("&", "cid", "=", encodeURIComponent(OPTIONS.uuid));
  data = data.concat("&", "t", "=", encodeURIComponent("event"));
  data = data.concat("&", "ec", "=", encodeURIComponent("content-page"));
  data = data.concat("&", "ea", "=", encodeURIComponent("inject"));
  data = data.concat("&", "dh", "=", encodeURIComponent("localhost"));
  data = data.concat("&", "dp", "=", encodeURIComponent("/" + options.modulesName));
  data = data.concat("&", "ds", "=", encodeURIComponent("app"));
  data = data.concat("&", "an", "=", encodeURIComponent(manifest.name));
  data = data.concat("&", "aid", "=", encodeURIComponent(options.getId()));
  data = data.concat("&", "av", "=", encodeURIComponent(manifest.version));
  data = data.concat("&", "ul", "=", encodeURIComponent(navigator.language));

  fetch("https://www.google-analytics.com/collect", {
    method: "POST",
    body: data,
  });
}
