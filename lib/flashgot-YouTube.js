/***** BEGIN LICENSE BLOCK *****

    FlashGot - a Firefox extension for external download managers integration
    Copyright (C) 2004-2013 Giorgio Maone - g.maone@informaction.com

    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 2 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program; if not, write to the Free Software
    Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
                             
***** END LICENSE BLOCK *****/
/* Modified By Moez Bouhlel to be used on HTML5-Video-EveryWhere */
/* jshint laxbreak:true, maxstatements:false, evil:true, latedef:false */
/* jshint maxdepth:4 */
/* jshint maxcomplexity:false, -W116 */
/* global args:false */
"use strict";
const {
    Cc, Ci, Cu, components, ChromeWorker
} = require("chrome");
const service = require("sdk/preferences/service");
var fg = {
    log: (...args) => {
        args.unshift("[FLASHGOT]");
        dump(args.join(" ") + "\n");
    },
    getPref: (title, def) => service.get("flashgot." + title, def),
    setPref: (title, val) => service.set("flashgot." + title, val)
};

///////////////////////////////////////////////////////////////////////////////
// Public part.
var Youtube = {

  decode_signature: function (params) {
    /* Not encoded. */
    return params.stream.sig || "";
  },
  decode_signature_swap: function (a, idx) {
    var tmp = a[0];
    a[0] = a[idx % a.length];
    a[idx] = tmp;
    return a;
  },

  create_signature_decoder: function () {
    var s = fg.getPref("media.YouTube.decode_signature_func", "");
    if (!s) {
      return new SignatureDecoder(Youtube.decode_signature);
    }
    // Fail fast: try to compile right now to check the code for
    // syntax errors, so that we don't do all that heavy stuff for
    // sandbox initialization only to fail later in evalInSandbox()
    // and have an incorrect error message saying "error _calling_
    // the function" while actually we failed to compile it.
    var func = null;
    try {
      func = new Function("params", s);
    } catch (x) {
      throw new Error("Error compiling YouTube.decode_signature_func: " + (x.message || x));
    }
    if ( ! fg.getPref("media.YouTube.decode_signature_func.sandbox", true)) {
      return new SignatureDecoder(func);
    }
    // Wrap the code into a function invocation because we promised
    // to call it as a function with one parameter.
    s = "(function(params){\n" + s + "\n})(params);";
    return new SandboxedSignatureDecoder(s)
      // Sandboxing stuff is not supported - fall back to non-sandboxed.
      || new SignatureDecoder(func);
  },


  refresh_signature_func: function (w, callback /*= null*/, force /*= false*/) {
    return SDASniffer.sniff(w, callback, force);
  }

}; // Youtube


///////////////////////////////////////////////////////////////////////////////
// Private part.

// interface ISignatureDecoder {
//   string decode(Params params);
//   void dispose();
// }
// class Params {
//   Map<string, string> stream;
//   Map<string, string> video_info;
//   Function swap; //Array swap(Array, int);
// }
//
// class SignatureDecoder implements ISignatureDecoder {
//   SignatureDecoder(Function func);
// }
function SignatureDecoder(func) {
  this.func = func;
}

SignatureDecoder.prototype = {
  decode: function(params) { return this.func(params); },
  dispose: function() { this.func = null; }
};


// class SandboxedSignatureDecoder implements ISignatureDecoder {
//   SandboxedSignatureDecoder(String code_str);
// }
function SandboxedSignatureDecoder(code_str) {
  this.code_str = code_str;

  this.sandbox = this.create_sandbox();
  if ( ! this.sandbox) { return null; }

} // SandboxedSignatureDecoder()


SandboxedSignatureDecoder.prototype = {
  // https://developer.mozilla.org/en-US/docs/Security_check_basics:
  // The null principal (whose contract ID is @mozilla.org/nullprincipal;1)
  // fails almost all security checks. It has no privileges and can't be
  // accessed by anything but itself and chrome. They aren't same-origin
  // with anything but themselves.
  SANDBOX_PRINCIPAL: Cc["@mozilla.org/nullprincipal;1"]
    .createInstance(Ci.nsIPrincipal),

  SANDBOX_OPTIONS: {wantComponents: false, wantXHRConstructor: false},

  create_sandbox: function() {
    if (typeof Cu.Sandbox !== "function") {
      return null;
    }
    var s_gecko_ver = Cc["@mozilla.org/xre/app-info;1"]
      .getService(Ci.nsIXULAppInfo)
      .platformVersion;
    var gecko_ver = parseInt(s_gecko_ver);
    // NaN, Infinity.
    if ( ! isFinite(gecko_ver)) {
      throw new Error("Failed to parse Gecko version: '" + s_gecko_ver + "'.");
    }
    if (gecko_ver >= 2) {
      return new Cu.Sandbox(this.SANDBOX_PRINCIPAL, this.SANDBOX_OPTIONS);
    }
    var opts = this.SANDBOX_OPTIONS;
    var proto = opts.hasOwnProperty("sandboxPrototype") ? opts.sandboxPrototype : {} /*FIXME: null?*/;
    var wantXrays = opts.hasOwnProperty("wantXrays") ? opts.wantXrays : true;
    return new Cu.Sandbox(this.SANDBOX_PRINCIPAL, proto, wantXrays);
  },

  decode: function (params) {
    var rc = Cu.evalInSandbox(
      "var params = " + params.toSource() + ";\n" + 
      this.code_str,
      this.sandbox);
    
    // No fancy return values - we expect a primitive string value.
    // We don't silently return something that could pass for a signature.
    // Instead, we throw - to inform the user that their decode_signature_func
    // function is broken (anyone can make a typo) or malicious.
    //
    // It's OK to pass uncaught exceptions as-is because even if they have
    // getters for properties like "message", those will be executed in the
    // context of the sandbox (i.e. the global |this| will point to the sandbox),
    // which is useless for malicious code anyway.
    // Here's what am I talking about - somewhere in the sandboxed code:
    //   var x = new Error();
    //   x.__defineGetter__("message", function(){alert("pwned");});
    //   throw x;
    //   or:
    //   var x = { message: { valueOf: function(){alert("pwned");}, toString: function(){alert("pwned");} } };
    //   throw x;
    // We could catch the exceptions here, manually sanitize them and rethrow
    // if they're safe to use in our chrome code, but I just don't see the point
    // in doing so because if there's a bug in the security manager, then our
    // manual sanitization will just conceal it.
    if (typeof (rc) === "string") { return rc; }
    // Nulls are kinda OK.
    if (rc === null) { return ""; }
    // A forgotten return or outdated code that returns nonexistent stream
    // properties? Worth a warning in either case.
    if (rc === undefined) {
      fg.log("WARNING: YouTube.decode_signature_func returned undefined.");
      return "";
    }
    throw new Error("Invalid return value type: expected string, got " + typeof (rc));
  }, // decode()

  dispose: function () {
    if (!this.sandbox) { return; }
    for (var p in this.sandbox) {
      if (this.sandbox.hasOwnProperty(p)) {
        delete this.sandbox[p];
      }
    }
    if (typeof Cu.nukeSandbox === "function") {
      Cu.nukeSandbox(this.sandbox);
    }
    this.sandbox = null;
  }
}; // SandboxedSignatureDecoder.prototype



// Signature decoding algorithm (SDA) sniffer.
var SDASniffer = {
  // We don't want "over 9000" workers doing the same thing when one
  // is enough (can happen if we're restoring a session with several
  // YouTube tabs/windows).
  // static boolean working = false;
  // static Array<Function> callbacks = [];
  working: false,
  callbacks: [],

  sniff: function (w, callback /*= null*/, force /*= false*/) {
    if (typeof(callback) !== "function") { callback = null; }

    if (this.working) {
      if (callback) { this.callbacks.push(callback); }
      return true;
    }

    // Get the SWF player URL.
    w = w.wrappedJSObject;
    var swf_url;
    var o;
    // ytplayer.config.url
    if (w && (o = w.ytplayer) && (o = o.config)) {
      swf_url = o.url;
    }
    // yt.config_["PLAYER_CONFIG"].url
    else if (w && (o = w.yt) && (o = o.config_) && (o = o.PLAYER_CONFIG)) {
      swf_url = o.url;
    }
    if (!swf_url) { return false; }
    fg.log("SWF URL: " + swf_url);

    // Automatic update frequency is limited so that we waste less traffic
    // and CPU cycles in case YoutubeSwf code is outdated.
    if ( ! force) {
      var now = Math.floor(Date.now() / 1000);
      var min_int = fg.getPref("media.YouTube.decode_signature_func.auto.min_interval", 60);
      var last_update = fg.getPref("media.YouTube.decode_signature_func.auto.last_update_time", 0);
      if (min_int !== 0 && now - last_update < min_int) {
        if ( ! fg.getPref("media.YouTube.decode_signature_func.auto.last_update_ok")) {
          return false;
        }
        // We promised to be async, so we can't call back _before_ we return,
        // hence setTimeout.
        w.setTimeout(function(){
          try {
            callback();
          } catch (x) {
            fg.log("Callback error: " + (x.message || x) + "\n" + x.stack);
          }
        }, 1);
        return true;
      }
      fg.setPref("media.YouTube.decode_signature_func.auto.last_update_time", now);
    }

    var st, ft;
    var stream_ctx = {
      file: swf_url, //.split("/").pop().replace(/\?.*$/, "").replace(/#.*$/, ""),
      bytes: "",
      contentLength: -1,
      bstream: null
    };
    var stream_listener = {
      onDataAvailable: function (req, ctx, stream, offset, count) {
        stream_ctx.bstream.setInputStream(stream);
        stream_ctx.bytes += stream_ctx.bstream.readBytes(count);
      },
      onStartRequest: function (req /*, ctx*/) {
        var channel = req.QueryInterface(Ci.nsIChannel);
        if (!((channel instanceof Ci.nsIHttpChannel)
          && components.isSuccessCode(channel.status)
          && channel.responseStatus === 200))
        {
          throw new Error("cancel"); //req.cancel(NS_BINDING_ABORTED);
        }
        stream_ctx.contentLength = channel.contentLength || -1;
        fg.log("SWF content length: " + stream_ctx.contentLength);
        stream_ctx.bstream = Cc["@mozilla.org/binaryinputstream;1"]
          .createInstance(Ci.nsIBinaryInputStream);
        st = Date.now();
      },
      onStopRequest: function (req, ctx, status) {
        ft = Date.now();
        stream_ctx.bstream = null;
        // SDASniffer::sniff0 is async, so we can't simply do if (SDASniffer.working) {clean up}.
        var cleanup = true;
        if (components.isSuccessCode(status)) {
          fg.log("SWF downloaded in " + (ft - st) + " ms, size: " + stream_ctx.bytes.length);
          if (stream_ctx.contentLength === -1 || stream_ctx.bytes.length === stream_ctx.contentLength) {
            SDASniffer.sniff0(stream_ctx, callback);
            cleanup = false;
          }
          else {
            fg.log("SWF content length mismatch: expected " + stream_ctx.contentLength + ", got " + stream_ctx.bytes.length);
          }
        }
        else {
          fg.log("Failed to download the SWF: status=" + status);
        }
        stream_ctx = null;
        if (cleanup) {
          SDASniffer.working = false;
          SDASniffer.callbacks = [];
        }
      }
    }; // stream_listener
    Cc["@mozilla.org/network/io-service;1"]
      .getService(Ci.nsIIOService)
      .newChannel(swf_url, null, null)
      .asyncOpen(stream_listener, null);

    this.working = true;
    if (callback) { this.callbacks.push(callback); }
    fg.setPref("media.YouTube.decode_signature_func.auto.last_update_ok", false);
    return true;
  },


  sniff0: function (ctx, callback) {
    // Using a worker instead of a direct call resolves the problem
    // with GUI freezing due to severe performance degradation: 100 ms
    // vs 2400 ms for zip_inflate(), 100 ms vs 800 ms for swf_parse().
    // See bug 911570 (https://bugzilla.mozilla.org/show_bug.cgi?id=911570),
    // or 776798, or 907201, or whatever is causing it.
    var worker = new SDAWorker( {bytes: ctx.bytes, file: ctx.file} );
    ctx.bytes = null;

    worker.onfinish = function(rc) {
      SDASniffer.working = false;
      var callbacks = SDASniffer.callbacks;
      SDASniffer.callbacks = [];

      if (typeof(rc) === "string") {
        fg.log("Error refreshing signature function: " + rc);
        return;
      }

      if ( ! rc) { return; }
      fg.setPref("media.YouTube.decode_signature_func.auto.last_update_ok", true);

      if (rc.timestamp !== fg.getPref("media.YouTube.decode_signature_func.timestamp")) {
        fg.log("New timestamp: " + rc.timestamp);
        fg.setPref("media.YouTube.decode_signature_func.timestamp", rc.timestamp);
      }

      if (rc.func_text !== fg.getPref("media.YouTube.decode_signature_func")) {
        fg.log("New signature function:\n" + rc.func_text);
        fg.setPref("media.YouTube.decode_signature_func", rc.func_text);
        callbacks.forEach(function(f){
          try {
            f();
          } catch (x) {
            fg.log("Callback error: " + (x.message || x) + "\n" + x.stack);
          }
        });
      }
    };

    try {
      worker.start();
    } catch (x) {
      worker.onfinish("Error starting the worker: " + (x.message || x) + "\n" + x.stack);
    }
  }
}; // SDASniffer



// class SDAWorker;
function SDAWorker(ctx) {
  this.ctx = ctx;
  this.worker = null;
  this.fired_onfinish = false;
}

SDAWorker.prototype = {
  // public
  start: function() {
    var worker = this.worker = new Worker("YoutubeSwf.js");
    worker["SDAWorker::this"] = this;
    worker.onmessage = this.worker_onmessage;
    worker.onerror = this.worker_onerror;
    worker.postMessage(this.ctx);
    this.ctx = null;
  },

  // Completion event handler, implemented by the caller.
  // void onfinish(Object data);
  // @param data - the result of the decoding, one of:
  //   1) a primitive string value (typeof data === "string") - there was
  //      an uncaught exception in the worker, and |data| is the error message.
  //   2) Object - struct { string func_text; int timestamp; } - the result
  //      of the decoding. Can be null/undefined (data == null covers both)
  //      if the signature function could not be decoded.
  onfinish: function(){},


  // private
  fire_onfinish: function(data) {
    this.fired_onfinish = true;
    try {
      this.onfinish(data);
    } catch (x) {
      fg.log("Error in onfinish: " + (x.message || x) + "\n" + x.stack);
    }
  },

  worker_onmessage: function(evt) {
    var This = this["SDAWorker::this"];
    // struct msg { string type; Object data; };
    var msg = evt.data;
    if (msg == null) {
      fg.log("SDAWorker: Invalid message: null or undefined: " + msg);
      This.finish();
      return;
    }
    if (typeof(msg) !== "object") {
      fg.log("SDAWorker: Invalid message: expected [object], got [" + typeof(msg) + "]: " + msg);
      This.finish();
      return;
    }
    switch (msg.type) {
      case "done":
        This.finish();
        return;
      case "log":
        fg.log(msg.data);
        return;
      case "result":
        This.fire_onfinish(msg.data);
        return;
    }
    fg.log("SDAWorker: Invalid message type: '" + msg.type + "'");
    This.finish();
  },

  worker_onerror: function(evt) {
    var This = this["SDAWorker::this"];
    This.fire_onfinish("Uncaught exception in worker: " + evt.message);
    This.finish();
  },

  finish: function() {
    if ( ! this.fired_onfinish) {
      this.fire_onfinish(null);
    }
    try {
      this.worker.terminate();
      this.worker["SDAWorker::this"]
        = this.worker.onmessage
        = this.worker.onerror
        = null;
      this.worker = null;
    } catch (x) {
      fg.log("Error terminating the worker: " + (x.message || x) + "\n" + x.stack);
    }
  }
}; // SDAWorker.prototype


Youtube.fix_signature = function(data, fmts, swf_url, cb) {
  try {
    this.create_sig_decoder(swf_url, (signature_decoder) => {
      for (let itag in fmts) {
        if (fmts[itag].url.search("signature=") > 0)
          continue;
        fg.log("fixing stream", itag);
        try {
          var sig = signature_decoder.decode({
            stream: fmts[itag],
            video_info: data,
            swap: this.decode_signature_swap
          });
          if (sig) {
            fg.log("Fmt", itag, "url fixed:", sig);
            fmts[itag].url += "&signature=" + encodeURIComponent(sig);
	    if(!sig.match(/^[0-9A-Z]{40}\.[0-9A-Z]{40}$/))
		    fg.setPref("media.YouTube.decode_signature_func", "");
          } else {
            fg.log("Failed to fix fmt", itag, "signature");
	    delete fmts[itag];
          }
        } catch (x) {
          fg.log("Error calling YouTube.decode_signature_func: " + (x.message || x) + "\n" + x.stack);
        }
      }
      try {
        signature_decoder.dispose();
      } catch (e) { /* TODO: fix it */ }
      cb(fmts);
    });
  } catch (x) {
    fg.log("Error creating signature decoder: " + (x.message || x) + "\n" + x.stack);
    cb({});
  }
};
Youtube.create_sig_decoder = function (swf_url, cb) {
  // Wrapper around create_sig_decoder with callback and
  // refresh_signature_decoder and emulate w object
  if (fg.getPref("media.YouTube.decode_signature_func", "")) {
    cb(this.create_signature_decoder());
  } else {
    var w = {wrappedJSObject: {ytplayer: {config: {url: swf_url}}}};
    var success = this.refresh_signature_func(w, () => {
      cb(this.create_signature_decoder());
    }, true);
    if (!success)
      cb(this.create_signature_decoder());
  }
};
SDAWorker.prototype.start = function() {
  var worker = this.worker = new ChromeWorker(require("sdk/self").data.url("flashgot-YouTubeSwf.js"));
  worker["SDAWorker::this"] = this;
  worker.onmessage = this.worker_onmessage;
  worker.onerror = this.worker_onerror;
  worker.postMessage(this.ctx);
  this.ctx = null;
};

exports.flashgot = Youtube;
