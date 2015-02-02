# HTML5 Video EveryWhere

Not just an other HTML5 player extension.
This extension, unlike other extensions, will replace some video streaming sites
video player by Firefox native player. No just replacing Flash player by the
site HTML5 player version, but, booth the site HTML5 and Flash player with Firefox
native player.

**NOTE:**
This extension will change the page content of the supported video streaming
sites, as a result, many extensions that depends on this content will no longer
work as expected.

## Build

To build either HTML5-Video-EveryWhere with full features or Youtube-video-player:
```shell
make
```
To Build a custom HTML5-Video-EveryWhere with specific drivers, specific them
to DRIVER var on comma-seprated format, e.g:
```shell
make DRIVER=facebook,vimeo
```

## Credit

YouTube signature decoder code (data/flashgot-YouTubeSwf.js,
lib/flashgot-YouTube.js) was copied from the [GPL](
http://www.gnu.org/copyleft/gpl.html) licenced
[flashgot](https://flashgot.net/) extension with some code removed and
other added code under the same licence.

## Licence

This extension is free software; it is distributed under the MPL 2.0 Licence.

Copyright (c) 2014-2015, Moez Bouhlel (bmoez.j@gmail.com) & [The
Contributors](https://github.com/lejenome/html5-video-everywhere/graphs/contributors)
