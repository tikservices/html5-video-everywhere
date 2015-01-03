/* Based on Mozilla's cfx test file: pagemod-test-helpers.js */

"use strict";

const {
    Cc, Ci
} = require("chrome");
const timer = require("sdk/timers");
const {
    openTab, getBrowserForTab, closeTab
} = require("sdk/tabs/utils");

/**
 * A helper function that opens the testURL, and checks the effect of the addon
 * on 'onload' event via testCallback.
 */

const testPageMod = (testURL, testCallback, preTest, timeout) => (assert, done) => {

    var wm = Cc["@mozilla.org/appshell/window-mediator;1"]
        .getService(Ci.nsIWindowMediator);
    var browserWindow = wm.getMostRecentWindow("navigator:browser");
    if (!browserWindow) {
        assert.pass("page-mod tests: could not find the browser window, so " +
            "will not run. Use -a firefox to run the pagemod tests.");
        return null;
    }

    if (preTest)
        preTest();
    let newTab = openTab(browserWindow, testURL, {
        inBackground: false
    });
    var b = getBrowserForTab(newTab);

    function onPageLoad() {
        b.removeEventListener("load", onPageLoad, true);
        timer.setTimeout(testCallback, timeout || 0,
            b.contentWindow.wrappedJSObject,
            assert, () => {
                closeTab(newTab);
                done();
            }
        );
    }
    b.addEventListener("load", onPageLoad, true);

    //    what to return ??
};
exports.testPageMod = testPageMod;