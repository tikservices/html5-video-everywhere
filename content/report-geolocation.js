"use strict";

function reportGeolocation() {
  let data = "";
  data = data.concat("v", "=", encodeURIComponent(1));
  data = data.concat("&", "tid", "=", encodeURIComponent("UA-28759938-4"));
  data = data.concat("&", "cid", "=", encodeURIComponent(OPTIONS.uuid));
  data = data.concat("&", "t", "=", encodeURIComponent("event")); // pageview
  data = data.concat("&", "ec", "=", encodeURIComponent("content-page"));
  data = data.concat("&", "ea", "=", encodeURIComponent("inject"));
  data = data.concat("&", "dh", "=", encodeURIComponent("localhost"));
  data = data.concat("&", "dp", "=", encodeURIComponent("/html5-video-everywhere"));
  data = data.concat("&", "ds", "=", encodeURIComponent("app"));
  data = data.concat("&", "an", "=", encodeURIComponent("HTML5 Video EveryWhere"));
  data = data.concat("&", "aid", "=", encodeURIComponent("html5-video-everywhere@lejenome.me"));
  data = data.concat("&", "av", "=", encodeURIComponent("0.3.5"));
  data = data.concat("&", "ul", "=", encodeURIComponent(navigator.language));

  fetch("https://www.google-analytics.com/collect", {
    method: "POST",
    body: data,
  });
}
onReady(reportGeolocation);
