# HTML5 Video EveryWhere

Higher performance and stable sideo watching experience on the web.

Some streaming sites video players suck. This add-on will replace them with
browser built-in video player for higher performance and more stable
experience. Currently, it supports YouTube, Facebook, Vimeo, Dailymotion,
Break, Metacafe, Lego and even more sites are coming.

**NOTE:**
This extension will change the page content of the supported video streaming
sites. As a result, many extensions that depends on this content may not work
as expected.

## Install

Visit the extension website [h5vew.tik.tn](https://h5vew.tik.tn/) for latest
version.

## Build

Before building the extension, you need to install `gulp-cli` and all
dependencies:

```shell
npm install -g gulp-cli  # or: yarn global add gulp-cli
npm install  # or: yarn
```

To build the addon for Firefox:

```shell
gulp ext:build:firefox
```

To build the addon for Google Chrome:

```shell
gulp ext:build:chrome
```

## Documentation

Documentation for the code can be generated with this command:

```shell
gulp doc:js
```

## Credit

HTML5 Video EveryWhere contains codes from
[iaextractor](https://github.com/inbasic/iaextractor/) project licensed under
MPL 1.1.

## Licence

This extension is free software; it is distributed under the MPL 2.0 License.

Copyright (c) 2014-2017, Moez Bouhlel (bmoez.j@gmail.com) & [The
Contributors](https://github.com/lejenome/html5-video-everywhere/graphs/contributors)
