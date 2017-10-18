Adding new website support to H5VEW
===================================

With the recent rewrite of [HTML5 Video EveryWhere] extension to support the
new WebExtension API. I decided to write a quick guide on how to add support
for a new video streaming website. In this tutorial, I will document the steps
followed to add support for [Lego.com].

First, let's create a new module for this website. A HTML5 Video EveryWhere
module is a subclass of `Module` class and it's injected into the web page
containing the video player to replace. A module should at least override two
functions:

- The `constructor()` function to specify the module alias that it's used to
  identify different modules. The alias is hyphenated lowercased website name.
- `onInterative()` function that is invoked when DOM is loaded (equivalent to
  the `DOMContentLoaded` event). This is the right place to write the needed
  code to change the site video player. Alternative functions that are
  available to override are `onLoading` and `onComplete`.  `onLoading`
  will be invoked before parsing the DOM while `onComplete` will be invoked
  when the DOM and all the resources (images, subframes, ...) have been loaded.

So let's start with a minimal code that will print "Hello World" when injected
into `Lego.com` website. The module path will be `content/Lego.js`.

```javascript
import Module from './Module.js';

class Lego extends Module {
  constructor() {
    // We overwrite the constructor to set the module name.
    super("lego");
  }

  onInteractive() {
    // Here we are using the Module `log` method.
    this.log("Hello World");
  }
}

// Needed to execute the module on file injection
new Lego().start();
```


You will notice we are using ES6 Modules syntax. Even it's still not supported
by the Firefox WebExtensions, it will transcompiled into Firefox v52+ valid
code using babel at a later step. You can use all the fancy latest ES syntax
without worring about the bowser support. You will notice the use of `log`
function defined on Module class, it's a wrapper of `console.log` with
namespacing the log message to identify the extension own messages, you should
use it instead of direct using `console` API.

Now, we need this module to be injected when opening `Lego.com` video player
page. After inspecting the site, we notice that its videos are opened within an
iFrame and are hosted under `https://www.lego.com/en-US/mediaplayer/video/`
path where `en-US` could be changed to the user locale code. We need to match
this URL and inject the required files when opened. In `manifest.json` file,
we add the following object into `content_scripts` field:

```json
{
  "matches": ["https://www.lego.com/*/mediaplayer/video/*"],
  "js": [
    "content/Lego.js"
  ],
  "all_frames": true,
  "run_at": "document_start"
}
```

First thing we notice is that besides `content/Leog.js`, we inject other
files that are needed for the module to execute. These files are:

- `content/Modules.js`: Defines `Module` class which is the parent class of
  all modules and contains common code and it's responsible to communique with
  the extension background script.
- `content/video-player.js`: Defines `VP` class which creates the video
  player widget and add to it custom styles, properties based on the extension
  settings and also it adds a context menu to the video player.
- `content/statics.js`: Tracks how often this module is used, browser/extension
  version and the browser default language.
- `content/common.js`: Contains common functions used by more than when
  script.
- `content/Options.js`: Defines `Options` class that contains all logic
  related to defining, retrieving and updating extension options. An instance
  of this class is created by `Module` class under the `options` attribute.

We can also notice that Lego video player is always hosted under the specified
URL. All `http://` requests are redirected to `https://` protocol and all
requests not containing the `www` resource are redirected to
`www.lego.com`. So our matching pattern is just one simple pattern.

Next, we need to define a new option to disable this module. In
`content/Options.js`, add to `defaults` attribute in the constructor the
new option which is of type `boolean` and with default value `false`.

```javascript
this.defaults = {
  // ...
  disablelego: ["boolean", false],
};
```

To test our code, open `about:debugging` URL in Firefox and load the
extension. You should see the "Hello World" message when you visit a web page
with Lego.comm video player embed in.


Now, we can move forward by updating `onIntercative` function code to extract
video URLs and replace the video player with an instance of VP. Generally, the
module code logic follows these steps:

- (Optional) Validate the URL of the document in case the matches patterns are
  not enough to eliminate pages URL which are known to not include the video
  player. Or to invoke different code for different URLs patterns. e.g: YouTube
  watch page vs. channels/users page.
- Extract video data including video files path and poster URL. These data can
  be included inside the HTML document as JavaScript variable or as embed JSON
  document or as tag attributes. Or these data can be downloaded from other
  URL. In this case, you have to add the URL pattern of the resource to
  `permissions` field in the `manifest.json` file if it is hosted on a
  different domain.
- Create an instance of `VP` class with the container element of the video
  player as first argument and `this.options` as second option.
- Add video URLs using either `VP.srcs()` or `VP.addSrc()` methods. The
  first expects an object with the video quality/format as key and the video
  URL as value. The second method expects the video URL as first argument, the
  video quality as second argument (possible values: `"low"`, `"medium"`,
  `"high"` or `"higher"`) and the video format as third argument (possible
  values: `"mp4"` or `"webm"`).
- Set the poster URL using `VP.props()` function which expects an object of
  the HTMLVideoElement attributes and its values. In this case, set `poster`
  attribute to the poster URL.
- Invoke `VP.setup()` method to replace the website video player with the
  browser video player, to add video sources and to apply all provided styles
  and properties.

We resume. To add new website support. We implement a subclass of Module with
overwriting one of its abstract methods but mostly `onInterative`. We add a new
entry to the module with its matching URL patterns to `content_scripts` on
`manifest.json`. We add module specific options definitions into `defaults`
property of `content/Options.js` module.
The final implementation of `Lego.com` module can be found on [HTML5 Video
EveryWhere] [repository]. I welcome patches for new websites support, for
new language translation or for issue fixing.

[HTML5 Video EveryWhere]: https://h5vew.tik.tn
[Lego.com]: https://www.lego.com
[repository]: https://github.com/lejenome/html5-video-everywhere
