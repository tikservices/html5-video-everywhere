# HTML5 Video EveryWhere

[![amo version](https://img.shields.io/amo/v/html5-video-everywhere.svg?label=Version&link=https://h5vew.tik.tn)]()
[![amo users](https://img.shields.io/amo/users/html5-video-everywhere.svg?link=https://h5vew.tik.tn)]()
[![amo stars](https://img.shields.io/amo/stars/html5-video-everywhere.svg?link=https://h5vew.tik.tn)]()
[![donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://paypal.me/pools/c/801V34eBNq)

Higher performance and stable video watching experience on the web.

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

You'll need:

- [Node.js](https://nodejs.org/), v8.x or higher
- [npm](https://www.npmjs.com/)

Optionally, you may like:

- [nvm](https://github.com/creationix/nvm), which helps manage node versions
- [yarn](https://yarnpkg.com/) a better package manager instead of npm

Before building the extension, you need to install `gulp-cli` and all
dependencies:
Change into the source and install `gulp-cli` and all dependencies:

```shell
git clone https://github.com/lejenome/html5-video-everywhere/
cd html5-video-everywhere
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

- [API documentation](https://h5vew.tik.tn/api)
- [Implementations documentation](https://h5vew.tik.tn/api)
- [Tutorial](https://h5vew.tik.tn/api/tutorial-h5vew-adding-new-website-support.html)

You can also generate the documentation from the source code under `docs/api`
folder with this command:

```shell
gulp doc:js
```

## Credit

HTML5 Video EveryWhere contains codes from
[iaextractor](https://github.com/inbasic/iaextractor/) project licensed under
MPL 1.1.

## Donate

If you find this project useful, you can give me a cup of coffee :)

[![paypal](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://paypal.me/pools/c/801V34eBNq)

## Self Promotion

This software is developed by [Moez Bouhlel](https://lejenome.github.io/),
co-founder of [Tik.tn](https://tik.tn/), a skilled software development
and consulting agency. For a list of its services, visit its website
[tik.tn](https://tik.tn) or contact it at <contact@tik.tn>.

## Licence

This extension is free software; it is distributed under the MPL 2.0 License.

Copyright © 2014-2018, [Moez Bouhlel](https://lejenome.github.io/)
(<bmoez.j@gmail.com>) &
[The Contributors](https://github.com/lejenome/html5-video-everywhere/graphs/contributors)
